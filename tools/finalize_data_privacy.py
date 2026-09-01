from __future__ import annotations

import csv
import hashlib
import io
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data.html"
ATRIO = ROOT / "atrio.html"
PROTOTYPE = ROOT / "data-hero-caixa.html"
README = ROOT / "assets/data/lastro/README.md"
RAW = ROOT / "assets/data/jurimetria.xlsx"
DERIVED = ROOT / "assets/data/lastro/jurimetria_derivada.csv"
HASHFILE = ROOT / "assets/data/lastro/jurimetria.sha256"
WORKFLOW = ROOT / ".github/workflows/finalize-data-privacy.yml"
SELF = Path(__file__).resolve()


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    require(count == 1, f"{label}: expected 1 occurrence, found {count}")
    return text.replace(old, new, 1)


def write_derived_csv() -> None:
    rows = [
        ["grupo", "periodo", "metrica", "numerador", "denominador", "valor", "unidade", "condicao", "observacao"],
        ["serie", "NOV/25", "conversao", "0", "2", "0.00", "%", "borda", "mês parcial; 2 despachos"],
        ["serie", "DEZ/25", "conversao", "126", "285", "44.21", "%", "integral", ""],
        ["serie", "JAN/26", "conversao", "138", "292", "47.26", "%", "integral", ""],
        ["serie", "FEV/26", "conversao", "178", "347", "51.30", "%", "integral", ""],
        ["serie", "MAR/26", "conversao", "189", "373", "50.67", "%", "integral", ""],
        ["serie", "ABR/26", "conversao", "250", "414", "60.39", "%", "integral", ""],
        ["serie", "MAI/26", "conversao", "18", "48", "37.50", "%", "borda", "cinco dias"],
        ["janela", "28.11.2025–05.05.2026", "registros_atribuidos", "", "", "1896", "registros", "", "universo bruto"],
        ["janela", "28.11.2025–05.05.2026", "registros_sem_despacho", "", "", "135", "registros", "", "excluídos do denominador publicado de conversão"],
        ["janela", "28.11.2025–05.05.2026", "despachos_proferidos", "", "", "1761", "despachos", "", "denominador publicado"],
        ["janela", "28.11.2025–05.05.2026", "votos_publicados", "", "", "899", "votos", "", "numerador publicado"],
        ["janela", "28.11.2025–05.05.2026", "despachos_sem_voto", "", "", "862", "despachos", "", ""],
        ["janela", "28.11.2025–05.05.2026", "conversao_publicada", "899", "1761", "51.05", "%", "com bordas", ""],
        ["recorte_integral", "DEZ/25–ABR/26", "conversao", "881", "1711", "51.49", "%", "cinco meses integrais", "exclusão das bordas altera 0,44 p.p."],
        ["teste_adversarial", "28.11.2025–05.05.2026", "conversao_bruta_rejeitada", "899", "1896", "47.41", "%", "rejeitado", "inclui 135 registros ainda sem despacho"],
        ["serie", "DEZ/25–ABR/26", "amplitude", "", "", "16.18", "p.p.", "cinco meses integrais", "60,39 − 44,21"],
        ["fila", "28.11.2025–05.05.2026", "media_ate_voto", "", "", "13.2", "dias", "", "Data Despacho − Data Envio; incorpora fila da unidade e tempo de trabalho"],
        ["fila", "28.11.2025–05.05.2026", "media_despachos_sem_voto", "", "", "6.9", "dias", "", "Data Despacho − Data Envio; incorpora fila da unidade e tempo de trabalho"],
        ["fila", "28.11.2025–05.05.2026", "media_composta_referencia", "", "", "10.1", "dias", "referência", "não publicada como indicador principal"],
        ["autor", "28.11.2025–05.05.2026", "conversao_individual", "153", "258", "59.30", "%", "autor", "indicador autônomo; sem benchmark de terceiros"],
    ]
    buf = io.StringIO(newline="")
    writer = csv.writer(buf, lineterminator="\n")
    writer.writerows(rows)
    DERIVED.write_text(buf.getvalue(), encoding="utf-8")


def patch_data(html: str) -> str:
    # Hero: preserve layout, replace the raw-base download with two public verification outputs.
    old_hero = '''      <a href="assets/data/jurimetria.xlsx" download style="display:flex;align-items:center;justify-content:space-between;gap:20px;padding:15px 0;border-top:1px solid #2E71FF;border-bottom:1px solid #2E71FF;font:600 10px/1.4 'Azeret Mono',ui-monospace,monospace;letter-spacing:.14em;color:#2A66E8" style-hover="color:#181818;border-color:#181818">BAIXAR A BASE COMPLETA<span style="font-size:15px">↓</span></a>'''
    new_hero = '''      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;border-top:1px solid #2E71FF;border-bottom:1px solid #2E71FF;padding:15px 0">
        <a href="assets/data/lastro/jurimetria_derivada.csv" download style="display:flex;align-items:center;justify-content:space-between;gap:12px;font:600 10px/1.4 'Azeret Mono',ui-monospace,monospace;letter-spacing:.14em;color:#2A66E8" style-hover="color:#181818">DADOS DERIVADOS<span style="font-size:15px">↓</span></a>
        <a href="assets/data/lastro/jurimetria.sha256" style="display:flex;align-items:center;justify-content:space-between;gap:12px;font:600 10px/1.4 'Azeret Mono',ui-monospace,monospace;letter-spacing:.14em;color:#2A66E8" style-hover="color:#181818">HASH DA FONTE<span style="font-size:15px">↗</span></a>
      </div>'''
    html = replace_once(html, old_hero, new_hero, "DATA hero")

    # Replace the peer ranking with the author's standalone measure.
    marker = "COMPARAÇÃO · MESMA BASE, MESMA REGRA DE DESPACHO"
    pos = html.find(marker)
    require(pos >= 0, "DATA comparison marker not found")
    start = html.rfind('\n    <div ', 0, pos)
    require(start >= 0, "DATA comparison start not found")
    start += 1
    fila_marker = "FUNDAMENTO DA FILA · O QUE 13,2 E 6,9 DIAS MEDEM"
    fila_pos = html.find(fila_marker, pos)
    require(fila_pos >= 0, "DATA queue marker not found")
    end = html.rfind('\n    <p ', 0, fila_pos)
    require(end > start, "DATA comparison end not found")
    end += 1
    standalone = '''    <div style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:16px 40px;margin:clamp(48px,7vh,88px) 0 0">
      <p style="margin:0;font:500 10px/1 'Azeret Mono',ui-monospace,monospace;letter-spacing:.2em;color:rgba(252,252,252,.62)">RECORTE INDIVIDUAL · AUTOR</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:clamp(24px,4vw,72px);align-items:end;margin-top:clamp(26px,4vh,44px);padding:clamp(22px,3vh,34px) 0;border-top:1px solid #FCFCFC;border-bottom:1px solid rgba(252,252,252,.3)">
      <p tabindex="0" role="note" data-datum data-fonte="jurimetria_derivada.csv" data-calculo="153 votos ÷ 258 despachos" data-fundamento="Fonte original: jurimetria.xlsx; integridade registrada em jurimetria.sha256" data-recorte="28.11.2025 a 05.05.2026 | autor" style="margin:0;font:600 clamp(2.6rem,6vw,4.6rem)/.84 'Azeret Mono',ui-monospace,monospace;letter-spacing:-.055em;font-variant-numeric:tabular-nums;color:#5B8DFF">59,30%</p>
      <div>
        <p style="margin:0;font-size:clamp(1.05rem,1.7vw,1.3rem);font-weight:500;letter-spacing:-.02em">153 votos em 258 despachos</p>
        <p style="margin:12px 0 0;font-size:14.5px;line-height:1.6;color:rgba(252,252,252,.86);text-wrap:pretty">Indicador individual autônomo, publicado sem benchmark de produtividade de terceiros.</p>
      </div>
    </div>

'''
    html = html[:start] + standalone + html[end:]

    # Public evidence points to the aggregate derivative, while the original source remains named in the method.
    html = html.replace('data-fonte="jurimetria.xlsx"', 'data-fonte="jurimetria_derivada.csv"')

    # Add the already documented queue limitation directly to both queue evidence cards.
    html = html.replace(
        'data-recorte="28.11.2025 a 05.05.2026" style="margin:16px 0 0;font:600 clamp(3rem,7vw,5.4rem)/.84',
        'data-recorte="28.11.2025 a 05.05.2026" data-limite="Intervalo inclui fila da unidade e tempo de trabalho; não mede desempenho individual." style="margin:16px 0 0;font:600 clamp(3rem,7vw,5.4rem)/.84'
    )

    # Method copy.
    html = replace_once(
        html,
        'A base canônica é jurimetria.xlsx, relativa à 2ª Turma Recursal.',
        'A fonte original é jurimetria.xlsx, base de trabalho extraída de sistema interno e usada pelo autor para formular os indicadores. Não é dado oficial do TJPR, e a base bruta não integra os artefatos públicos atuais.',
        'DATA method source'
    )
    html = replace_once(
        html,
        'Os derivados anonimizados de ECHO e ATRIO estão em assets/data/lastro e preservam somente as dimensões necessárias para reproduzir as métricas expostas.',
        'A verificação pública usa jurimetria_derivada.csv e o hash SHA-256 da fonte, além dos derivados mínimos de ECHO e ATRIO em assets/data/lastro. O derivado agregado permite recalcular as figuras publicadas sem expor linhas processuais ou dados de terceiros.',
        'DATA method derivatives'
    )

    # Footer.
    html = replace_once(
        html,
        'Christian da Costa. Projeto autoral em contexto profissional, não oficial do TJPR. Base pública anonimizada.',
        'Christian da Costa. Projeto autoral em contexto profissional, não oficial do TJPR. A base original foi extraída de sistema interno e contém dados de terceiros; não integra os artefatos públicos atuais. São disponibilizados apenas derivados agregados e o hash de integridade da fonte.',
        'DATA footer disclaimer'
    )
    old_footer_link = '''        <a href="assets/data/jurimetria.xlsx" download style="color:#5B8DFF" style-hover="color:#FCFCFC">BAIXAR A BASE</a>'''
    new_footer_links = '''        <a href="assets/data/lastro/jurimetria_derivada.csv" download style="color:#5B8DFF" style-hover="color:#FCFCFC">DADOS DERIVADOS</a>
        <a href="assets/data/lastro/jurimetria.sha256" style="color:#5B8DFF" style-hover="color:#FCFCFC">HASH SHA-256</a>'''
    html = replace_once(html, old_footer_link, new_footer_links, "DATA footer outputs")

    # Remove third-party rows from the public index.
    banned_oque = (
        "Despachos, demais assessores",
        "Votos, demais assessores",
        "Conversão, demais assessores",
        "Diferença observada entre recortes",
    )
    for phrase in banned_oque:
        html, n = re.subn(r"^\s*\{[^\n]*oque: '" + re.escape(phrase) + r"'[^\n]*\},\n", "", html, count=1, flags=re.M)
        require(n == 1, f"DATA index row not removed: {phrase}")

    # Correct a stale provenance label already inconsistent with the public lastro README.
    html = html.replace("fonte: 'localizadores.pdf'", "fonte: 'precedentes_publico.xlsx'")

    # Use the public derivative in the 2nd Turma direct-source index rows.
    html = html.replace("fonte: 'jurimetria.xlsx', unidade: '2ª TURMA'", "fonte: 'jurimetria_derivada.csv', unidade: '2ª TURMA'")

    # Remove RANKING and all now-dead ranking/scale calculations so no peer figures remain in source.
    html, n = re.subn(r"\nconst RANKING = \[.*?\n\];\n", "\n", html, count=1, flags=re.S)
    require(n == 1, "DATA RANKING constant not removed")

    render_start = html.find("    const porTaxa = escala === 'taxa';")
    filtrado_pos = html.find("    const filtrado = filtro === 'Todos'", render_start)
    require(render_start >= 0 and filtrado_pos > render_start, "DATA ranking render block not found")
    html = html[:render_start] + html[filtrado_pos:]

    html = replace_once(
        html,
        "    const { metrica, escala, serieSort, indiceSort, filtro, metodo } = this.state;",
        "    const { metrica, serieSort, indiceSort, filtro, metodo } = this.state;",
        "DATA render destructuring"
    )
    html = replace_once(
        html,
        "      barras, metricas, linhasSerie, colunasSerie, ranking, escalas,\n      escalaNota: porTaxa\n        ? 'Cada universo normalizado em 100%. A escala compara taxas, não tamanhos: os dois recortes não têm o mesmo volume.'\n        : 'Escala real de despachos. O recorte individual responde por 258 dos 1.761 despachos da janela; a taxa não depende do volume, a estabilidade da estimativa depende.',\n      escalaMin: '0',\n      escalaMeio: porTaxa ? '50%' : '750',\n      escalaMax: porTaxa ? '100%' : '1.503',\n      linhasIndice, colunasIndice, filtros,",
        "      barras, metricas, linhasSerie, colunasSerie,\n      linhasIndice, colunasIndice, filtros,",
        "DATA return ranking values"
    )

    # Keyboard regression: focus may itself scroll the page; do not immediately hide the tooltip for that synthetic scroll.
    html = replace_once(
        html,
        "    this._in = (e) => { const t = find(e.target); if (t) show(t); };",
        "    this._in = (e) => { const t = find(e.target); if (t) { this._focusGuardUntil = performance.now() + 180; show(t); } };\n    this._scroll = () => { if (performance.now() < (this._focusGuardUntil || 0)) return; hide(); };",
        "DATA focus guard"
    )
    html = replace_once(
        html,
        "    window.addEventListener('scroll', hide, { passive: true });",
        "    window.addEventListener('scroll', this._scroll, { passive: true });",
        "DATA scroll listener"
    )
    html = replace_once(
        html,
        "      window.removeEventListener('scroll', this._hide);",
        "      window.removeEventListener('scroll', this._scroll);",
        "DATA scroll cleanup"
    )

    return html


def patch_atrio(html: str) -> str:
    html = html.replace('assets/data/jurimetria.xlsx', 'assets/data/lastro/jurimetria_derivada.csv')
    pattern = re.compile(
        r'<div class="metric-card__copy"><h3>Produtividade média individual</h3><p>ante <span[^>]*data-numerator="746 votos"[^>]*>49,6%</span> entre os pares</p></div>'
    )
    html, n = pattern.subn(
        '<div class="metric-card__copy"><h3>Conversão individual</h3><p>153 votos em 258 despachos</p></div>',
        html,
        count=1,
    )
    require(n == 1, "ATRIO peer comparison block not replaced")
    return html


def patch_prototype(html: str) -> str:
    html = html.replace('assets/data/jurimetria.xlsx', 'assets/data/lastro/jurimetria_derivada.csv')
    html = html.replace(
        '<a class="hero-brief__link" href="assets/data/lastro/jurimetria_derivada.csv" download>base, regra de contagem e teste de robustez',
        '<a class="hero-brief__link" href="assets/data/lastro/jurimetria_derivada.csv" download>dados derivados, regra de contagem e teste de robustez'
    )
    html = html.replace(
        '{ label: "jurimetria.xlsx", href: "assets/data/lastro/jurimetria_derivada.csv" }',
        '{ label: "derivado público", href: "assets/data/lastro/jurimetria_derivada.csv" }'
    )
    return html


def write_readme() -> None:
    README.write_text("""# DATA | lastro público

Este diretório reúne derivados públicos mínimos das fontes usadas nas métricas de DATA, ATRIO e ECHO. A base bruta `jurimetria.xlsx`, extraída de sistema interno, contém dados de terceiros e não integra os artefatos públicos atuais. Os indicadores são formulações autorais e não constituem dado oficial do TJPR.

## Arquivos

- `jurimetria_derivada.csv`: agregados mínimos da 2ª Turma Recursal necessários para conferir série mensal, universos, denominadores, teste adversarial, tempos médios publicados e o indicador individual do autor, sem linhas processuais ou benchmark de terceiros.
- `jurimetria.sha256`: SHA-256 da base original usada nos cálculos. O hash registra a integridade dos bytes da fonte; não prova, por si só, a fidelidade da extração ao sistema de origem.
- `ementario_publico.xlsx`: 2.758 ementas; somente estrutura de classificação.
- `acervo_publico.xlsx`: 1.192 registros; somente ID sequencial, classe, agrupador e núcleo.
- `precedentes_publico.xlsx`: 631 temas; somente dimensões categóricas, códigos de assunto e presença de tese.
- `mapa_tematico_publico.pdf`: síntese do indicador de 90,2% e da estrutura operacional.
- `diagnostico_corpus_publico.md`: síntese do total de 115.114 registros únicos.
- `operacao_atrio_publica.md`: síntese de rotas, operações HTTP, testes, eixos e módulos.

## Métricas reproduzidas

| Métrica | Natureza | Lastro público |
|---|---|---|
| 899 votos / 1.761 despachos = 51,05% | derivada | `jurimetria_derivada.csv` |
| 881 / 1.711 = 51,49% no recorte integral | derivada | `jurimetria_derivada.csv` |
| 899 / 1.896 = 47,41% como denominador adversarial rejeitado | derivada | `jurimetria_derivada.csv` |
| série mensal NOV/25–MAI/26 e amplitude de +16,18 p.p. | derivada | `jurimetria_derivada.csv` |
| 13,2 d / 6,9 d / 10,1 d de fila média publicada | agregada | `jurimetria_derivada.csv` |
| 153 / 258 = 59,30% do autor | derivada | `jurimetria_derivada.csv` |
| 2.758 ementas catalogadas | direta | `ementario_publico.xlsx` |
| 1.192 registros triados | direta | `acervo_publico.xlsx` |
| 90,2% de redução categorial | derivada | `mapa_tematico_publico.pdf` |
| 631 temas catalogados | direta | `precedentes_publico.xlsx` |
| 483 temas com tese firmada | direta | `precedentes_publico.xlsx` |
| 76,5% com tese firmada | derivada | `precedentes_publico.xlsx` |
| 245 códigos, 9 matérias, 3 ramos e 10 situações | direta | `precedentes_publico.xlsx` |
| 115.114 registros únicos | direta | `diagnostico_corpus_publico.md` |
| 31 caminhos, 33 operações e 188 testes | direta | `operacao_atrio_publica.md` |

## Limites da verificação

O derivado público permite recalcular as figuras agregadas expostas. Os tempos de fila são publicados apenas como agregados, sem linhas individuais; portanto, o arquivo documenta os valores e o critério, mas não expõe observações suficientes para recomputar as médias linha a linha. O hash SHA-256 comprova que uma determinada sequência de bytes corresponde à fonte usada, mas não autentica a extração perante o sistema de origem.

## Exclusões de privacidade

Foram excluídos nomes, iniciais de pessoas, números de processo, origens processuais, textos integrais, análises, observações, referências internas, credenciais, caminhos de infraestrutura e dados individualizados de produtividade de terceiros.
""", encoding="utf-8")


def audit() -> None:
    data = DATA.read_text(encoding="utf-8")
    atrio = ATRIO.read_text(encoding="utf-8")
    prototype = PROTOTYPE.read_text(encoding="utf-8")
    readme = README.read_text(encoding="utf-8")

    require(not RAW.exists(), "raw jurimetria.xlsx still exists")
    require(DERIVED.exists() and DERIVED.stat().st_size > 0, "derived CSV missing")
    require(HASHFILE.exists() and HASHFILE.stat().st_size > 0, "SHA-256 file missing")

    banned_data = [
        'assets/data/jurimetria.xlsx', 'BAIXAR A BASE COMPLETA', '>BAIXAR A BASE<',
        'Base pública anonimizada', '49,63%', '49.63', '49,6%',
        '+9,7 p.p.', "+9.7", 'Demais assessores', 'demais assessores',
        '1503', '1.503', "votos: 746", "ord: 746", "localizadores.pdf",
        'COMPARAÇÃO · MESMA BASE, MESMA REGRA DE DESPACHO',
    ]
    for token in banned_data:
        require(token not in data, f"DATA residual forbidden token: {token}")

    for token in [
        'jurimetria_derivada.csv', 'jurimetria.sha256', '59,30%',
        '153 votos ÷ 258 despachos', 'RECORTE INDIVIDUAL · AUTOR',
        'não integra os artefatos públicos atuais', 'this._focusGuardUntil',
        "window.addEventListener('scroll', this._scroll",
    ]:
        require(token in data, f"DATA expected token missing: {token}")

    require('assets/data/jurimetria.xlsx' not in atrio, "ATRIO raw source path remains")
    for token in ['49,63%', '49,6%', '746 votos', '1.503 despachos', 'entre os pares']:
        require(token not in atrio, f"ATRIO peer comparison remains: {token}")
    require('59,3%' in atrio and '153 votos em 258 despachos' in atrio, "ATRIO author metric missing")

    require('assets/data/jurimetria.xlsx' not in prototype, "prototype raw link remains")
    require('jurimetria_derivada.csv' in prototype, "prototype derivative link missing")
    require('jurimetria_derivada.csv' in readme and 'jurimetria.sha256' in readme, "README jurimetry lastro missing")

    # Repository-wide active textual references to the raw path are not allowed.
    for path in ROOT.rglob('*'):
        if not path.is_file() or '.git' in path.parts:
            continue
        if path.suffix.lower() not in {'.html', '.md', '.js', '.mjs', '.css', '.txt', '.json', '.yml', '.yaml'}:
            continue
        try:
            text = path.read_text(encoding='utf-8')
        except UnicodeDecodeError:
            continue
        require('assets/data/jurimetria.xlsx' not in text, f"raw path remains in {path.relative_to(ROOT)}")

    # Basic structural sanity.
    require(data.count('<x-dc>') == 1 and data.count('</x-dc>') == 1, "DATA x-dc structure changed")
    require('class Component extends DCLogic' in data, "DATA DCLogic component missing")
    require("document.addEventListener('focusin', this._in)" in data, "DATA focus listener missing")
    require("document.removeEventListener('focusin', this._in)" in data, "DATA focus cleanup missing")


# 1. Integrity record before deleting the raw source.
require(RAW.exists(), "assets/data/jurimetria.xlsx is missing before finalization")
raw_bytes = RAW.read_bytes()
sha256 = hashlib.sha256(raw_bytes).hexdigest()

# 2. Public aggregate and integrity record.
write_derived_csv()
HASHFILE.write_text(
    f"SHA-256: {sha256}\n"
    "arquivo_logico: jurimetria.xlsx\n"
    "registro: 2026-09-01\n"
    "uso: fonte original dos indicadores publicados em DATA\n"
    "publicacao: a base bruta não integra os artefatos públicos atuais\n"
    "limite: o hash registra integridade dos bytes e não autentica a extração perante o sistema de origem\n",
    encoding="utf-8",
)

# 3. Conservative text patches.
DATA.write_text(patch_data(DATA.read_text(encoding="utf-8")), encoding="utf-8")
ATRIO.write_text(patch_atrio(ATRIO.read_text(encoding="utf-8")), encoding="utf-8")
PROTOTYPE.write_text(patch_prototype(PROTOTYPE.read_text(encoding="utf-8")), encoding="utf-8")
write_readme()

# 4. Remove raw base from current HEAD only.
RAW.unlink()

# 5. Validate before making the automated commit.
audit()

# 6. Temporary implementation files must not remain in final HEAD.
for path in (SELF, WORKFLOW):
    if path.exists():
        path.unlink()

print(f"DATA privacy finalization passed. SHA-256={sha256}")
