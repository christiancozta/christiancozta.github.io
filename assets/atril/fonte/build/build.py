"""Monta a página do ÁTRIL a partir da fonte canônica.

Fonte canônica (editar aqui):
  assets/atril/fonte/componentes/*.html   textos dos componentes, já em marcação do sistema
  assets/atril/fonte/dados/*.txt          bases do Toolkit (Calendário, Fundamentos, Ementário, Templates)
  assets/atril/fonte/dados/materiais.json  materiais: documentos, manuais e anexos em PDF
  assets/atril/fonte/build/css/*.css      sistema visual (família, componentes, interface)
  assets/atril/fonte/build/interface.js   comportamento da página
  assets/atril/fonte/build/pagina.html    estrutura da página

Build (gerado, não editar à mão):
  atril.html                                 página publicada na raiz do site
  assets/atril/atril.css                     folhas de estilo concatenadas
  assets/atril/atril.js                      interface
  assets/atril/atril-dados.js                textos e bases em JSON (window.ATRIL)

Uso, na raiz do repositório:  python3 assets/atril/fonte/build/build.py
"""
import json
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[4]
PB = RAIZ / 'assets' / 'atril'
FONTE = PB / 'fonte'
BUILD = FONTE / 'build'
DADOS = FONTE / 'dados'

COMPONENTES = ['guia-de-estilo', 'regras-de-aplicacao', 'criterios-operacionais', 'indice-e-arquitetura', 'memoria-de-integracao',
               'templates-texto', 'templates-anotados', 'calendario-base', 'fundamentos-regra', 'ementario-regra']
MODELOS = {'RI-CONHECIDO': '4.1', 'RI-NAO-CONHECIDO': '4.2', 'ED-REJEICAO': '4.3', 'ED-ACOLHIMENTO': '4.4', 'RI-CONJUNTO': '4.5', 'ED-NAO-CONHECIDO': '4.6'}


def texto(nome):
    return (DADOS / f'{nome}.txt').read_text(encoding='utf-8')


def calendario():
    t = texto('calendario-juridico')
    return [[m.group(1), 1 if m.group(2) == 'S' else 0, '' if m.group(3) == '-' else m.group(3)]
            for m in re.finditer(r'^(\d{4}-\d\d-\d\d) \| \S+ \| ([SN]) \| (.*)$', t, re.M)]


def campos(bloco, nomes):
    d, k = {}, None
    for ln in bloco.strip().split('\n'):
        m = re.match(r'^(' + '|'.join(re.escape(n) for n in nomes) + r'):\s*(.*)$', ln)
        if m:
            k = m.group(1); d[k] = m.group(2).strip(); continue
        if k:
            d[k] = (d[k] + '\n' + ln).strip()
    return d


def fundamentos():
    t = texto('fundamentos')
    corpo = t[t.index('3. REGISTROS'):t.index('4. REGISTRO DE CORREÇÕES')]
    nomes = ['REGISTRO', 'TEMA', 'CATEGORIA DE ORIGEM', 'CATEGORIA', 'GATILHOS DE USO', 'FUNÇÃO NO VOTO', 'FORMULAÇÃO-BASE', 'ELEMENTOS DE APLICAÇÃO', 'EXCLUDENTES/LIMITES']
    lista = lambda s: [x.strip()[2:].strip() for x in (s or '').split('\n') if x.strip().startswith('- ')]
    out = []
    for r in corpo.split('\n---\n'):
        if 'REGISTRO: FUN-' not in r:
            continue
        d = campos(r, nomes)
        out.append({'id': d['REGISTRO'], 't': d['TEMA'], 'c': d['CATEGORIA'], 'co': d.get('CATEGORIA DE ORIGEM', ''),
                    'g': lista(d.get('GATILHOS DE USO')), 'f': d.get('FUNÇÃO NO VOTO', ''), 'b': d.get('FORMULAÇÃO-BASE', ''),
                    'e': lista(d.get('ELEMENTOS DE APLICAÇÃO')), 'l': lista(d.get('EXCLUDENTES/LIMITES')), 'x': []})
    por_id = {f['id']: f for f in out}
    corr = t[t.index('4. REGISTRO DE CORREÇÕES'):t.index('5. REFERÊNCIAS DAS CORREÇÕES')]
    for m in re.finditer(r'^(FUN-\d{4}) \| ([^\n]+)\nRAZÃO: ([^\n]+)\nTEXTO DE ORIGEM SUBSTITUÍDO:\n(.*?)(?=\n\nFUN-|\n*\Z)', corr, re.M | re.S):
        if m.group(1) in por_id:
            por_id[m.group(1)]['x'].append({'campo': m.group(2).strip(), 'razao': m.group(3).strip(), 'origem': m.group(4).strip()})
    return out


def ementario():
    t = texto('ementario')
    corpo = t[t.index('4. EMENTÁRIO | PRINCIPAL'):t.index('5. TR EMENTAS | COMPLEMENTAR')]
    nomes = ['REGISTRO DE ORIGEM', 'EMENTA-BASE DE ORIGEM', 'CÓDIGO-MÃE', 'CÓDIGO', 'DESCRIÇÃO', 'ASSUNTO PRINCIPAL', 'HIERARQUIA',
             'RAMO DE ORIGEM', 'ASSUNTO JÁ ABORDADO PELA TR', 'FUNDAMENTO / DESCRIÇÃO']
    out = []
    for r in corpo.split('\n---\n'):
        if 'REGISTRO DE ORIGEM' not in r:
            continue
        d = campos(r, nomes)
        out.append({'c': d['CÓDIGO'], 'd': d['DESCRIÇÃO'], 'h': d.get('HIERARQUIA', ''), 'm': d.get('CÓDIGO-MÃE', ''),
                    'r': d.get('RAMO DE ORIGEM', ''), 'tr': 1 if d.get('ASSUNTO JÁ ABORDADO PELA TR') == 'Sim' else 0,
                    'eb': d.get('EMENTA-BASE DE ORIGEM', ''), 'fd': d.get('FUNDAMENTO / DESCRIÇÃO', ''),
                    'ln': re.sub(r'\D', '', d.get('REGISTRO DE ORIGEM', ''))})
    return out


def templates():
    t = texto('templates')

    def arvore(corpo):
        raiz = []; pilha = [raiz]; par = []

        def fecha():
            if par:
                pilha[-1].append({'p': ' '.join(par)}); par.clear()
        for ln in corpo.strip().split('\n'):
            s = ln.strip()
            m = re.match(r'\[(SE|PARA CADA) (.*)\]$', s)
            if m:
                fecha(); no = {'k': 'se' if m.group(1) == 'SE' else 'each', 'c': m.group(2), 'ch': []}
                pilha[-1].append(no); pilha.append(no['ch']); continue
            if s in ('[/SE]', '[/PARA]'):
                fecha(); pilha.pop(); continue
            if not s:
                fecha(); continue
            par.append(s)
        fecha()
        return raiz

    out = {}
    for m in re.finditer(r'<template id="([^"]+)">\n(.*?)</template>', t, re.S):
        b = m.group(2)
        meta = dict(re.findall(r'^(CLASSE|RESULTADO|APLICAÇÃO): (.*)$', b, re.M))
        corpo = re.sub(r'^(CLASSE|RESULTADO|APLICAÇÃO): .*\n', '', b, flags=re.M)
        out[m.group(1)] = {'id': m.group(1), 'classe': meta['CLASSE'], 'res': meta['RESULTADO'], 'apl': meta['APLICAÇÃO'], 'items': arvore(corpo)}
    return [dict(out[i], n=n) for i, n in MODELOS.items()]


def materiais():
    m = json.loads((DADOS / 'materiais.json').read_text(encoding='utf-8'))
    for item in m['brancas'] + m['pretas']:
        if 'arquivo' in item:
            item['kb'] = round((PB / item['arquivo']).stat().st_size / 1024)
    m.pop('_nota', None)
    return m


def main():
    docs = {c: (FONTE / 'componentes' / f'{c}.html').read_text(encoding='utf-8') for c in COMPONENTES}
    data = {'cal': calendario(), 'fun': fundamentos(), 'eme': ementario(), 'tpl': templates(), 'mat': materiais()}
    payload = json.dumps({'docs': docs, 'data': data}, ensure_ascii=False, separators=(',', ':'))
    (PB / 'atril-dados.js').write_text('/* Gerado por fonte/build/build.py. Não editar. */\nwindow.ATRIL = ' + payload + ';\n', encoding='utf-8')
    css = '\n'.join((BUILD / 'css' / n).read_text(encoding='utf-8') for n in ['familia.css', 'componentes.css', 'interface.css'])
    (PB / 'atril.css').write_text('/* Gerado por fonte/build/build.py. Não editar. */\n' + css, encoding='utf-8')
    (PB / 'atril.js').write_text('/* Gerado por fonte/build/build.py. Não editar. */\n' + (BUILD / 'interface.js').read_text(encoding='utf-8'), encoding='utf-8')
    (RAIZ / 'atril.html').write_text((BUILD / 'pagina.html').read_text(encoding='utf-8'), encoding='utf-8')
    print(f"atril.html | {len(data['fun'])} fundamentos | {len(data['eme'])} registros do Ementário | {len(data['cal'])} dias | {len(data['tpl'])} modelos")


if __name__ == '__main__':
    main()
