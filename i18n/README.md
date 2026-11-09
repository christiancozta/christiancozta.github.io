# Internacionalização do portfólio — PT-BR / EN

## Escopo
Páginas: `arco.html`, `echo.html`, `play.html`, `atrio.html`, `cerne.html`, `data.html`.
Fora do escopo: `atrio-dentro.html` (linkada pelo ARCO; o leitor EN chega à versão PT).

## Inventário confirmado
- `en/arco.html`: a tradução inglesa anterior foi usada como fonte editorial de referência e substituída pelo artefato gerado. Ela estava defasada em relação ao PT: não tinha a seção de arquitetura e os módulos (31 IDs só no PT) e mantinha estrutura própria (50 IDs só no EN, incluindo o verbete `prd-03`, retirado do PT no commit `94ba52e`). A versão anterior permanece no histórico do git.
- `assets/arco/js/arco-en.js`, `arco-base-en-20260915.js`, `arco-runtime-en.js`, `arco-core-en.js`, `arco-final-en-20260915-v2.js`: cadeia de cinco scripts da versão EN anterior. Removidos, porque o EN gerado reutiliza os scripts do PT. A terminologia do tooltip e do rodapé foi reaproveitada.
- `arco.html`: HTML principal em português, com componentes de navegação, conteúdo e fichas técnicas; incorpora as demais páginas em iframes.
- `echo.html`, `play.html`, `atrio.html`, `cerne.html`, `data.html`: páginas em português.
- PLAY é artefato de build: `play.html`, `play.css`, `play.js`, `play-dados.js`, `play-fundamentos.js` e `play-ementario.js` saem de `assets/play/fonte/build/build.py` e não se editam à mão. A tradução entra em `assets/play/fonte/` e no build.
- DATA é um Design Component: o conteúdo fica num bloco `<x-dc>` escondido por CSS e montado no navegador por `assets/shared/js/support-core-20260916.js`, que localiza o bloco por regex no código-fonte. Há cerca de 30 strings no JavaScript embutido (meses, séries, rótulos de métricas) e formatação numérica fixada em `'pt-BR'`. Os valores de `data-props` (`taxa`, `votos`, `despachos`) são identificadores e não se traduzem.
- CERNE contém fontes embutidas em data URI e cerca de 325 KB de JavaScript embutido, com mais de 500 strings PT; preservar bytes e evitar reescrita global do HTML.
- `echo.html` não declarava `lang`, e seu `og:url` apontava para `ECHO.html` (404); ambos corrigidos.

## Contrato de implementação
1. Uma única fonte de estrutura, estilos e comportamento por página. Não manter HTML traduzido à mão.
2. Catálogos versionados PT-BR/EN por página; reutilizar o texto de `en/arco.html` sempre que corresponder à versão atual.
3. Incluir strings geradas por JavaScript, atributos de acessibilidade, metadados, links e elementos condicionais.
4. Gerar artefatos estáticos em `/en/<pagina>.html` a partir das mesmas fontes, sem depender de tradução em tempo de execução para indexação.
5. Manter URLs PT existentes; adicionar canonical e hreflang recíprocos e navegação PT/EN.
6. Links internos devem respeitar o idioma; recursos estáticos devem usar caminhos absolutos de raiz ou reescrita validada.
7. Testar paridade funcional, conteúdo, responsividade, âncoras, URLs, acessibilidade e regressões visuais.
8. Alterações de conteúdo PT sinalizam chaves EN desatualizadas; tradução automática é etapa opcional, dependente de credenciais e revisão editorial.
9. Não publicar na branch principal sem revisão e autorização posterior.

## Decisões editoriais
- Troca de idioma só no ARCO, porque só os links do ARCO são divulgados (inclusive com âncora). O seletor do ARCO preserva a view: em `arco.html#atrio`, EN leva a `en/arco.html#atrio`, que já abre o ATRIO em inglês. As páginas dos projetos não têm seletor próprio; a correspondência entre idiomas fica nos metadados hreflang.
- Documentos vinculados (fichas técnicas e manuais do ATRIO, bases do PLAY, arquivos de lastro do DATA) permanecem em português. A interface que os apresenta é traduzida.
- Léxico "Do termo à prova": o termo de mercado (já em inglês) é mantido; o equivalente português entre colchetes permanece, como marca bilíngue, com `lang="pt-BR"` na versão acessível. Sinônimos portugueses que só repetiam o equivalente foram retirados da lista "aka"; os demais foram traduzidos. **Revisar.**
- Números e datas seguem o glossário do CV: `16,18 p.p.` → `16.18 pp`; `1.192` → `1,192`; `dez/2025` → `Dec 2025`; datas completas como `26 Aug 2026`.
- DATA: despacho → order e voto → opinion também nos gráficos; recorte → scope (TIMEFRAME só no tooltip do ARCO, onde é período); mês de borda/integral → edge/full month; saneamento por extinção → clean-up by dismissal.
- ECHO: Acervo → Collection (o conjunto de materiais), mas acervo → caseload quando se refere a processos; Regente/Regência/Registro/Regimento → Conductor/Conducting/Record/Regimen; nomes dos materiais traduzidos (Introductory Notes, Procedural Tuning, Headnote Index…).
- ATRIO: rastro → trace e lastro → grounding também no tooltip; peças do xadrez da marca como King, Rook, Knight, Queen e Bishop; os rótulos ACHADO/AFASTADO, que o CERNE emite em português, aparecem com glosa (found/dismissed).
- Nomes de ferramentas do PLAY: Ementário → Headnote Index; Fundamentos → Legal Grounds; Calendário Jurídico → Legal Calendar; Montador de Minutas → Draft Builder; Busca Integrada → Integrated Search. **Revisar** antes da tradução do PLAY, que deve usar os mesmos nomes.

## Glossário editorial
Preservar como nomes próprios: ARCO, ECHO, PLAY, ATRIO, CERNE, CORPUS, RATIO, LUX, DATA.
Fixados nesta etapa: Governança do Raciocínio Jurídico → Legal Reasoning Governance; rastro → trace; lastro → grounding; gabinete → chambers; acervo → caseload; despacho → order; voto → opinion; taxa de finalização → finalization rate; jurimetria → jurimetrics; Turma Recursal → Appellate Panel; Fronteira → Boundary; ficha técnica → technical sheet.
Tratar com revisão contextual: responsabilidade; auditoria; controle humano; método; operações jurídicas.

## Como funciona
`i18n/build.mjs` (Node, sem dependências) lê a página PT e o catálogo EN e gera:
- `en/<pagina>.html`, com `lang="en"`, canonical, hreflang, `og:url` e seletor de idioma próprios, e caminhos reescritos para `../`;
- `<script>.en.js` ao lado de cada script com texto de interface, para que caminhos relativos ao próprio script continuem válidos;
- o bloco `<!-- i18n:alternates -->` (canonical e hreflang) no `<head>` da página PT.

Os catálogos ficam em `i18n/catalogs/`. Em `<pagina>.en.json`, a chave é o texto PT normalizado de cada unidade (frase com sua marcação inline, atributo de acessibilidade, metadado ou número com separador) e o valor é o HTML EN. `keep` lista o que permanece idêntico, `raw` cobre trocas estruturais (o seletor de idioma) e `links` troca URLs (o CV em inglês). `scripts.en.json` traz as strings dos scripts.

Comandos:
- `node i18n/build.mjs`: gera tudo. Não grava nada enquanto faltar tradução.
- `node i18n/build.mjs --check`: falha se faltar tradução, se houver chave órfã (texto PT que mudou ou saiu) ou se algum gerado estiver defasado. Rodar antes de cada commit que toque uma página PT.
- `node i18n/build.mjs --pending`: lista em JSON as unidades PT sem tradução.
- `node scripts/check-correspondencias.mjs`: coerência do léxico e paridade de verbetes entre PT e EN.

Para incluir uma página, acrescente-a em `i18n/pages.json` com seu catálogo e os scripts que carregam texto de interface.

## Estado
- **ARCO: implementado.** 463 unidades (266 traduzidas, 155 mantidas, 42 equivalentes PT marcados) e 3 scripts localizados. Verificado no navegador, em PT e EN: sem erros de console além do Google Analytics bloqueado no ambiente de teste, tooltip, rodapé, busca e filtro do léxico, leitor de fichas técnicas, iframes e largura de 390 px sem rolagem horizontal. As páginas filhas abrem em PT dentro do ARCO EN até serem traduzidas; o gerador passa a apontar para a versão EN de cada uma quando ela entrar em `pages.json`.
- **ATRIO: implementado.** 177 unidades no HTML e 92 strings em `atrio.js` (históricos de versão, notas da marca, tooltip; datas DD/MM/AAAA convertidas para `9 Apr 2026`). Verificado no navegador: diálogos de marca e de versões, tooltip, fichas técnicas e encaixe na grade em PT e EN; o ARCO EN passa a abrir o ATRIO EN no iframe. 
- **ECHO: implementado.** 119 unidades no HTML e 89 literais nos scripts embutidos (dados dos 14 materiais, etapas, leitor de PDF, tooltip). Materiais em PDF/XLSX continuam em português e aparecem marcados como "(PT)". `support.js` ganhou cópia EN porque carrega o runtime por caminho relativo à página. O ARCO EN passa a embutir o ECHO EN, e o `arco-shell.en.js` compara os textos em inglês ("Ecosystem", "Christian da Costa, Curitiba, Brazil") ao limpar a página incorporada.
- **DATA: implementado.** 208 unidades e atributos do tooltip (`data-fonte`, `data-calculo`, `data-recorte`, `data-fundamento`, `data-limite`) e 30 blocos do script do componente: série mensal (meses, percentuais), índice de 36 figuras, colunas, filtros e separador de milhar. Os filtros 'Todos'/'Direta'/'Derivada' são traduzidos em todas as ocorrências, porque também participam da lógica de comparação. Dois rótulos do topo vêm de `content:` em `assets/fonts/fonts.css`; a versão EN usa seletor `html[lang="en"]`. Os arquivos de lastro (CSV, MD, XLSX) continuam em português. 
- Próximas: PLAY (via build próprio) e CERNE.
- Pendente: revisão editorial do catálogo do ARCO, em especial a bio, as frases de abertura dos três movimentos e as decisões marcadas acima.
