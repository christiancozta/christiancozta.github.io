---
name: ATRIL
description: Estante de partitura. Uma folha de papel presa ao corpo de laca preta, escolhida tocando uma tecla de um teclado vetorial em perspectiva.
colors:
  laranja: "#C84D00"
  laranja-sombra: "#933D07"
  accent-tint: "#F6E7DE"
  ambar: "#FFB627"
  ambar-sombra: "#E39F1F"
  support-tint: "#FDEED1"
  mark: "#FDDC9C"
  tinta: "#181818"
  papel: "#FCFCFC"
  corpo-2: "#262626"
  preta: "#383838"
  preta-luz: "#505050"
  fio-escuro: "#3A3A3A"
  sobre-tinta: "#A3A3A3"
  gravacao: "#7F7F7F"
  ink-3: "#5C5C5C"
  branca-sombra: "#D4D4D4"
  rule: "#DADADA"
  surface: "#F1F1F1"
typography:
  display:
    fontFamily: "'Zalando Sans Expanded', 'Zalando Sans', system-ui, sans-serif"
    fontSize: "clamp(34px, 3.6vw, 76px)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "'Zalando Sans Expanded', 'Zalando Sans', system-ui, sans-serif"
    fontSize: "clamp(30px, 3.3vw, 46px)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  title:
    fontFamily: "'Zalando Sans Expanded', 'Zalando Sans', system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title-sm:
    fontFamily: "'Zalando Sans Expanded', 'Zalando Sans', system-ui, sans-serif"
    fontSize: "15.5px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  body:
    fontFamily: "'Source Sans 3', system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "'Source Sans 3', system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  small:
    fontFamily: "'Source Sans 3', system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Source Sans 3', system-ui, sans-serif"
    fontSize: "10.5px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.12em"
  botao:
    fontFamily: "'Source Sans 3', system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1
  marca:
    fontFamily: "'Zalando Sans Expanded', 'Zalando Sans', system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.2em"
  gravado:
    fontFamily: "'Zalando Sans Expanded', 'Zalando Sans', system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.16em"
  tecla:
    fontFamily: "'Zalando Sans Expanded', 'Zalando Sans', system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.12em"
  tecla-preta:
    fontFamily: "'Zalando Sans Expanded', 'Zalando Sans', system-ui, sans-serif"
    fontSize: "8.5px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.12em"
  tecla-numeral:
    fontFamily: "'Zalando Sans Expanded', 'Zalando Sans', system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.01em"
rounded:
  none: "0px"
  sm: "2px"
  doc: "4px"
  full: "999px"
spacing:
  topo: "48px"
  tampa: "44px"
  kb-h: "clamp(150px, 27vh, 290px)"
  m: "max(clamp(16px, 5.6vw, 108px), calc((100vw - 1640px) / 2))"
  gut: "20px"
  ferr-w: "380px"
  folha-x: "clamp(24px, 4vw, 64px)"
  folha-topo: "clamp(28px, 4.2vh, 48px)"
  gadget-x: "18px"
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s5: "20px"
  s6: "24px"
  s7: "32px"
  s8: "40px"
  s9: "48px"
  s10: "64px"
components:
  barra-topo:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.papel}"
    typography: "{typography.marca}"
    height: "{spacing.topo}"
  busca-topo:
    backgroundColor: "{colors.corpo-2}"
    textColor: "{colors.sobre-tinta}"
    rounded: "{rounded.sm}"
    height: "34px"
    padding: "0 8px 0 12px"
  folha:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    typography: "{typography.body}"
    padding: "clamp(28px, 4.2vh, 48px) clamp(24px, 4vw, 64px) 72px"
  tampa:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.ambar}"
    typography: "{typography.gravado}"
    height: "{spacing.tampa}"
  tecla-branca:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.ink-3}"
    typography: "{typography.tecla}"
  tecla-branca-hover:
    backgroundColor: "{colors.ambar}"
    textColor: "{colors.tinta}"
  tecla-branca-tocada:
    backgroundColor: "{colors.laranja}"
    textColor: "{colors.papel}"
  tecla-manual:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.laranja}"
    typography: "{typography.tecla-numeral}"
  tecla-preta:
    backgroundColor: "{colors.preta}"
    textColor: "{colors.sobre-tinta}"
    typography: "{typography.tecla-preta}"
  tecla-preta-hover:
    backgroundColor: "{colors.ambar}"
    textColor: "{colors.tinta}"
  tecla-preta-tocada:
    backgroundColor: "{colors.laranja}"
    textColor: "{colors.papel}"
  ferramenta-cabecalho:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    typography: "{typography.title-sm}"
    padding: "13px 18px 14px"
  ferramenta-cabecalho-aberto:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.papel}"
  ferramenta-templates:
    backgroundColor: "{colors.ambar}"
    textColor: "{colors.tinta}"
    padding: "16px 18px"
  resultado:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.papel}"
    typography: "{typography.title}"
    padding: "14px 16px 15px"
  button-primary:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.papel}"
    typography: "{typography.botao}"
    rounded: "{rounded.sm}"
    height: "44px"
    padding: "0 18px"
  button-primary-hover:
    backgroundColor: "{colors.laranja}"
    textColor: "{colors.papel}"
  button-outline:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    typography: "{typography.botao}"
    rounded: "{rounded.sm}"
    height: "44px"
    padding: "0 18px"
  button-outline-hover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.tinta}"
  button-sm:
    height: "36px"
    padding: "0 12px"
  input:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    height: "44px"
    padding: "0 12px"
  segmentado:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-3}"
    padding: "3px"
    height: "36px"
  segmentado-ativo:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.papel}"
  chip:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.full}"
    height: "32px"
    padding: "0 12px"
  etiqueta:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-3}"
    rounded: "{rounded.none}"
    padding: "5px 8px"
  etiqueta-tinta:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.papel}"
  etiqueta-ambar:
    backgroundColor: "{colors.support-tint}"
    textColor: "{colors.tinta}"
  lacuna:
    backgroundColor: "{colors.accent-tint}"
    textColor: "{colors.tinta}"
    padding: "0 4px"
  barra-mobile:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.sobre-tinta}"
    height: "56px"
  barra-mobile-ativa:
    textColor: "{colors.ambar}"
---

# Design System: ATRIL

## Overview

**Creative North Star: "A Estante de Partitura"**

O ATRIL é um instrumento visto de frente. O corpo de laca preta ocupa a tela inteira; nele ficam presas uma folha de papel, à esquerda, e uma segunda folha de ferramentas, à direita; abaixo corre a tampa, uma faixa preta onde se lê o nome da tecla, e então o teclado vetorial em perspectiva, que vai até a borda inferior. Escolher o que ler é tocar uma tecla, e a folha vira. O mundo tem dois materiais, laca e papel, e duas luzes: o âmbar de quem está sob o dedo e o laranja do editor que marca o que já está na folha.

A densidade é de mesa de trabalho. O instrumento inteiro cabe na primeira tela e a página não rola: rolam a folha e o corpo da ferramenta aberta. A tipografia se divide entre gravação e leitura. Zalando Sans Expanded em caixa alta espaçada é o que está gravado no instrumento (marca, tampa, teclas); a mesma face, fechada e em caixa baixa, é o título de partitura na folha. Source Sans 3 carrega o texto corrido e os controles. A notação musical é o vocabulário de divisão: pauta de cinco linhas, barra inicial, barra dupla final, compassos numerados em romano.

O mundo recusa a página de documentação com barra lateral de navegação, grade de cards e home de atalhos. Os documentos da coleção impressa entram na folha com o próprio sistema editorial (família e componentes), que a camada web hospeda e ajusta, sem deixá-lo sair da folha.

**Key Characteristics:**
- Dois chãos só: laca #181818 e papel #FCFCFC; paleta fechada em quatro cores, cinzas e tints por mistura.
- Teclado de 14 teclas (9 brancas, 5 pretas) desenhado por geometria de ponto de fuga, com bochechas pretas nos lados.
- Estados da tecla por afundamento e cor: âmbar sob o cursor, laranja quando o material está na folha.
- Pauta de cinco linhas como divisor; compassos como passos.
- Zalando Sans Expanded gravada (caixa alta espaçada) e titulada (caixa baixa, espacejamento negativo); Source Sans 3 no corpo.
- Página fixa em 100dvh; a folha vira com uma cortina da direita, desligada sob movimento reduzido.
- Cantos retos; 2px nos controles; pílula só nos chips.

## Colors

A paleta é fechada em quatro cores, laca, papel, âmbar e laranja, e todo cinza ou tint é mistura delas com o papel, ou com a tinta nas sombras das teclas.

### Primary
- **Laranja de Editor** (#C84D00): a marcação de quem edita a partitura. Fundo da tecla cujo material está na folha, com rótulo em papel (4,5:1); numerais das teclas de manual (01 a 04) e dos compassos (I a IV); links, códigos de registro (FUN-0104, códigos do Ementário); marcador do trilho "Nesta folha"; sublinhado da aba selecionada; cursor de texto; anel de foco sobre o papel; borda de campo inválido; preenchimento do botão primário no hover.
- **Laranja Sombra** (#933D07): face frontal e sombra da tecla tocada (laranja com 30% de tinta), e cor do texto pequeno sobre o Tint de Acento (etiquetas, lacunas do montador, nó e registro selecionados, dia contado), onde o laranja puro não alcança 4,5:1.
- **Tint de Acento** (#F6E7DE): fundo da lacuna no montador de minutas, do registro selecionado na lista e do dia contado no calendário.

### Secondary
- **Âmbar de Tecla Acesa** (#FFB627): a luz. Tecla sob o cursor, toque e arpejo de abertura; nome do material na tampa; status da ferramenta aberta; prefixo "Vence em" no resultado; faixa de Templates; fio superior do diálogo de busca, da gaveta mobile e do aviso; dia excluído pela tabela no calendário; seleção de texto; anel de foco sobre a laca.
- **Âmbar Sombra** (#E39F1F): face frontal da tecla preta acesa e sombra da tampa sobre a branca acesa.
- **Tint de Apoio** (#FDEED1): caixa de aviso, etiqueta âmbar, linha excluída na trilha da contagem, alternativa a escolher no montador.
- **Marca-texto** (#FDDC9C): realce dos termos encontrados nas buscas.

### Neutral
- **Laca** (#181818, `tinta`): corpo do instrumento (barra superior, tampa, teclado, fundo da camada de Templates), todo texto sobre o papel, botão primário, cabeçalho da ferramenta aberta, bloco de resultado, fios de 2px que abrem tabelas e listas.
- **Papel** (#FCFCFC): a folha, a folha de ferramentas, a folha da camada de Templates, teclas brancas em repouso, texto principal sobre a laca.
- **Aresta da Tampa** (#262626, `corpo-2`): fio inferior da tampa, fundo do campo de busca da barra, fio superior da barra mobile.
- **Tecla Preta** (#383838) e **Face da Preta** (#505050): corpo e face frontal das teclas pretas em repouso.
- **Fio Escuro** (#3A3A3A): contornos sobre a laca (campo de busca, teclas de atalho na barra, botão Fechar da camada).
- **Cinza sobre Laca** (#A3A3A3, `sobre-tinta`): texto secundário sobre o preto (7:1), rótulos das pretas, rótulos da barra mobile, dica da tampa.
- **Gravação** (#7F7F7F): exclusivamente a palavra ATRIL gravada na tampa. É logotipo decorativo, oculto para leitores de tela e repetido pela marca da barra; nunca carrega informação.
- **Cinza de Texto** (#5C5C5C, `ink-3`): texto secundário no papel (6,5:1), rótulos das teclas brancas em repouso, legendas, metadados, rótulos de bloco.
- **Sombra da Branca** (#D4D4D4): topo do degradê da tecla branca, a sombra da tampa caindo sobre a tecla.
- **Fio** (#DADADA, `rule`): linhas da pauta, separadores de linha, contornos finos no papel.
- **Superfície** (#F1F1F1, `surface`): hover de linhas e do botão de contorno, bandeja do controle segmentado, caixas de nota, rodapé da busca.

### Named Rules
**A Regra da Laca e do Papel.** A página só tem dois chãos, a laca e o papel. Superfície, tint ou cinza novo nasce como mistura das quatro cores da paleta com o papel (ou com a tinta, nas sombras das teclas). Nenhum #FFFFFF, #000000 ou cor de fora entra como superfície ou texto.

**A Regra das Duas Luzes.** Âmbar é luz: o que está sob o dedo agora e todo destaque sobre a laca. Laranja é tinta de editor: o que já está na folha e a marcação sobre o papel. Texto laranja nunca vai sobre a laca; ali o destaque é âmbar.

**A Regra do Foco por Material.** Sobre o papel, o foco é um anel laranja de 2px afastado 2px. Sobre a laca, o mesmo anel em âmbar. Na tecla, uma faixa de 4px perto da ponta: laranja na branca, âmbar na preta, tinta quando a tecla já está acesa ou tocada.

## Typography

**Display Font:** Zalando Sans Expanded (com Zalando Sans, system-ui, sans-serif)
**Body Font:** Source Sans 3 (com system-ui, sans-serif)
**Label/Mono Font:** Zalando Sans Expanded em caixa alta espaçada para o que é gravado; Source Sans 3 600 em caixa alta para rótulos de bloco. Não há face mono: números de prazo, datas e contagens usam algarismos tabulares.

**Character:** Uma face larga e pesada, gravada como a marca de um piano, contra uma sans humanista discreta que aguenta texto normativo longo em português jurídico. A largura da Expanded dá o peso de capa de partitura; a Source Sans 3 some na leitura.

### Hierarchy
- **Display** (800, clamp(34px, 3.6vw, 76px), 0,98, −0,04em): o título de partitura na capa, centrado e balanceado. Abaixo dele, uma linha de subtítulo em Zalando Sans Expanded itálica 300 com os nomes em romano 500 ("*para* Recurso Inominado *e* Embargos de Declaração").
- **Headline** (700, clamp(30px, 3.3vw, 46px), 1,04, −0,035em, até 22ch): o título de cada folha. Aberturas encadeadas no mesmo documento descem a clamp(24px, 2.4vw, 32px); o resultado do Calendário aberto na folha sobe a 40px.
- **Title** (700, 22px, 1,2, −0,02em): título de registro nas ferramentas e o vencimento no bloco de resultado (1,12, −0,03em).
- **Title-sm** (600, 15,5px, 1,2, −0,015em): nome de cada ferramenta e, em 700, a faixa de Templates; o título do paginador usa 600 16px.
- **Body** (Source Sans 3 400, 16px, 1,6): texto corrido da folha com medida de 68ch; o lead da abertura vai a 18px. Campos de formulário também em 16px.
- **Body-sm** (400, 14px a 15px, 1,5): textos das ferramentas, caixas, passos dos compassos (15px, 1,45).
- **Small** (400, 13px, 1,5, cinza de texto): legendas, status das ferramentas, metadados.
- **Label** (Source Sans 3 600, 10,5px, 0,12em, caixa alta, cinza de texto): rótulo que nomeia um bloco ("Nesta folha", "Formulação-base", "Árvore taxonômica").
- **Botão** (Source Sans 3 600, 14px, 1): botões; abas a 14,5px, segmentos a 13,5px.
- **Gravado** (Zalando Sans Expanded, caixa alta): leitura da tampa (600, 12,5px, 0,16em); marca ATRIL na barra (800, 17px, 0,2em); título "Ferramentas" (700, 12px, 0,18em); seções da capa (700, 13px, 0,14em); link ECHO (700, 11px, 0,2em); gravação da tampa (800, 11px, 0,42em).
- **Teclas**: brancas em 600, 10px, 0,12em, caixa alta, a 18px da ponta; numerais dos manuais em 700, 17px, −0,01em, laranja; pretas em 600, 8,5px, 0,12em, na vertical ao longo do eixo inclinado. No mobile as pretas descem a 7,5px (0,1em), as brancas ficam na vertical a 9,5px e os numerais em 16px na horizontal.

### Named Rules
**A Regra da Gravação.** Caixa alta com espacejamento aberto (0,12em a 0,42em) em Zalando Sans Expanded é reservada ao que está gravado no instrumento ou cabeça um bloco: marca, tampa, teclas, título da folha de ferramentas, seções da capa. Título na folha corre fechado, em caixa baixa, com espacejamento negativo.

**A Regra do Corpo Único por Fileira.** Cada fileira de teclas tem um só corpo de rótulo: brancas 10px; pretas 8,5px, ou 7,5px no mobile. Rótulo que não cabe na tecla some; não encolhe.

**A Regra da Data Brasileira.** Toda data aparece como dd/mm/aaaa em algarismos tabulares, ou por extenso no resultado ("23 de outubro de 2026"). O seletor nativo fica escondido atrás do ícone de calendário desenhado.

## Layout

O instrumento é uma grade de página inteira com altura de 100dvh e overflow oculto, em quatro faixas: barra superior (48px), estante (o restante), tampa (44px) e teclado (clamp(150px, 27vh, 290px)). A estante divide-se em folha (coluna flexível) e folha de ferramentas (380px), separadas por um vão de 20px de laca. A margem lateral cresce com a tela, max(clamp(16px, 5.6vw, 108px), calc((100vw − 1640px) / 2)), o que limita o instrumento a 1640px de largura útil. O vão entre as folhas é também a alça que redimensiona a folha de ferramentas entre 340px e 560px.

Dentro da folha o respiro é de clamp(28px, 4.2vh, 48px) no topo, clamp(24px, 4vw, 64px) nas laterais e 72px no pé. O texto corrido mede até 760px por documento (68ch por parágrafo); o trilho "Nesta folha" fica preso à direita do documento com 210px, a 48px do texto. A capa centra em até 1040px: cabeçalho corrente nos cantos, título centrado, quatro compassos em quatro colunas, índice em três colunas (Documentos, Manuais da coleção, Anexos em PDF). Na folha de ferramentas o recuo lateral é 18px; o cabeçalho tem 44px; só uma ferramenta fica aberta e ocupa toda a altura restante.

Comportamento por largura e altura:
- **Até 1279px:** folha de ferramentas com 340px, vão de 14px, trilho "Nesta folha" e subtítulo da obra ocultos.
- **Até 1099px:** o campo de busca da barra recolhe a ícone e atalho; compassos e índice em duas colunas; ficha de PDF com capa de 220px.
- **Abaixo de 900px (mobile):** barra de 52px, tampa de 36px, teclado de 148px e uma quinta faixa, a barra de ferramentas de 56px mais a área segura. A estante vira uma coluna só, com margem de 10px. O teclado fica plano e rola na horizontal (cada branca com no mínimo 64px, ajuste por encaixe), com esmaecimento de 40px nas bordas que ainda têm teclas. As ferramentas abrem numa gaveta que sobe da base até 9dvh do topo. Compassos e índice em uma coluna; a gravação da tampa some.
- **Altura até 820px:** teclado em clamp(140px, 24vh, 200px). **Até 640px:** teclado em 96px.
- **Teclado recolhido** (botão na tampa, memorizado por visitante; automático abaixo de 560px de altura): 72px no desktop, 64px no mobile, com rótulos das pretas ocultos.

### Named Rules
**A Regra do Instrumento Inteiro.** A página não rola. Rolam, cada uma no seu lugar, a folha, o corpo da ferramenta aberta, a camada de Templates e, no mobile, o teclado na horizontal.

**A Regra da Ferramenta ao Lado.** Consultar prazo, fundamento ou ementa acontece na segunda folha, sem trocar a folha de leitura. Só montar minuta ganha a tela inteira.

## Elevation & Depth

O mundo é plano por material. A profundidade vem do contraste entre laca e papel e da física do teclado: a sombra da tampa desenhada como degradê no topo de cada tecla, a face frontal (lábio) das pretas, a tecla que afunda. As folhas não têm sombra; estão presas ao corpo. Sombra só existe para o papel que sai do plano do instrumento: a capa de um PDF que se pode tirar da estante, a minuta em edição, o diálogo de busca, a gaveta mobile e o aviso. Véus escurecem a laca por trás de diálogo (tinta a 72%) e gaveta (tinta a 60%).

### Shadow Vocabulary
- **Capa de PDF** (`box-shadow: 0 1px 2px rgba(24, 24, 24, .12), 0 18px 36px -14px rgba(24, 24, 24, .35)`; no hover sobe 3px e vai a `0 2px 4px rgba(24, 24, 24, .12), 0 26px 44px -16px rgba(24, 24, 24, .4)`): a primeira página de um manual ou anexo na ficha de PDF.
- **Minuta** (`box-shadow: 0 18px 36px -24px rgba(24, 24, 24, .35)`): a folha da minuta no montador de Templates.
- **Diálogo** (`box-shadow: 0 28px 70px rgba(0, 0, 0, .5)`): busca global.
- **Gaveta** (`box-shadow: 0 -18px 48px rgba(0, 0, 0, .45)`): ferramentas no mobile.
- **Aviso** (`box-shadow: 0 10px 28px rgba(0, 0, 0, .35)`): confirmação de cópia, acima do teclado.

### Named Rules
**A Regra do Afundar.** Tecla responde afundando, nunca subindo: 8px sob o cursor, 5px quando o material está na folha, 10px no clique. Nada de sombra, brilho ou escala nas teclas.

**A Regra da Sombra Fora do Corpo.** Sombra é de papel solto. O que está preso ao instrumento (folha, folha de ferramentas, tampa, teclado, barra) fica plano.

## Shapes

Cantos retos por padrão. Controles levam 2px (campo, botão, campo de busca, tecla de atalho), os segmentos internos do controle segmentado 1px, e só os chips são pílula. O raio de 4px pertence aos cards e notas da coleção impressa e vive apenas dentro dos documentos tipografados na folha.

O teclado é a forma assinatura. Cada branca é um trapézio projetado de um ponto de fuga acima do teclado: o topo mede 72% da base (94% com o teclado recolhido), de modo que a laca aparece em duas bochechas triangulares nas laterais, e um vão de 2,5px de laca separa as brancas. Cada preta tem 0,6 da largura de uma branca, 62% da altura do teclado, cantos frontais arredondados em até 6px e um lábio frontal de no mínimo 6px (9% do comprimento). No mobile a projeção se desfaz: as brancas viram retângulos de no mínimo 64px e as pretas têm 44px.

A notação dá as outras formas recorrentes: a pauta (cinco linhas de 1px a cada 7px numa faixa de 29px, barra inicial de 1px em tinta, barra dupla final de 1px e 3px), o compasso (barra de 1px à esquerda, barra dupla no último) e os fios de 2px em tinta que abrem tabelas, listas, índice e paginador. Ícones são SVG desenhados numa grade de 24, a 20px, com traço de 1,75, terminais retos, junções em quina e sem preenchimento; no índice da capa, cada material leva uma tecla miniatura desenhada (branca 9×15px com contorno, preta 7×11px).

## Components

### Teclado (assinatura)
Catorze teclas na ordem de `dados/materiais.json`: brancas para documentos e manuais, pretas para anexos em PDF. Geometria calculada no script (clip-path de polígono nas brancas, de caminho nas pretas), recalculada a cada redimensionamento.
- **Repouso:** branca em degradê da sombra da tampa (Sombra da Branca a 0, #ECECEC a 9%, papel a 32%), rótulo em cinza de texto; preta em Tecla Preta com lábio em Face da Preta e um brilho lateral de papel a 10%; rótulo em cinza sobre laca.
- **Cursor por cima:** afunda 8px e acende em âmbar (branca de #8F6A20 a 0 para Âmbar Sombra a 11% e âmbar a 34%; preta em âmbar com lábio em Âmbar Sombra), rótulo em tinta.
- **Material na folha:** fica afundada 5px em laranja (branca de #5E2A0B a 0 para Laranja Sombra a 9% e laranja a 30%; preta em laranja com lábio em Laranja Sombra), rótulo em papel.
- **Clique:** 10px. **Toque:** acende em âmbar por 190ms. **Arpejo de abertura:** cada tecla, em ordem, toca 300ms após a carga com 48ms entre teclas; não ocorre sob movimento reduzido.
- **Movimento:** transform em 0,16s e cor em 0,18s na curva do instrumento.
- **Rótulos:** brancas centradas na base do trapézio; teclas de manual com o numeral do volume (01 a 04) em laranja; pretas com o nome curto do anexo na vertical, girado ao longo do eixo inclinado da tecla e assentado a 12px do lábio, num só corpo por fileira.
- **Teclado:** foco errante (uma tecla tabulável), setas, Home, End e espaço; rótulo acessível completo em cada tecla.

### Tampa e leitura
Faixa de laca de 44px com fio inferior em Aresta da Tampa. À esquerda, ATRIL gravado em Gravação. A leitura corre pela tampa até parar acima da tecla sob o cursor ou em foco (transform em 0,5s): nome do material em âmbar, gravado, seguido do tipo e da camada em Source Sans 3 13px cinza sobre laca. Sem tecla em foco, mostra a dica "Passe o cursor e toque uma tecla" em cinza sobre laca. À direita, "Recolher teclado" em 600 11px 0,12em caixa alta, cinza sobre laca e papel no hover, com chevron que gira em 0,35s. No mobile a leitura mostra só o nome.

### Folha
Papel preso à estante, com rolagem própria (barra fina #C4C4C4) e foco interno de 2px em laranja. A troca de material é uma virada: a folha nova entra numa cortina de clip-path da direita para a esquerda em 0,55s, enquanto a antiga esmaece a 55%; desligada sob movimento reduzido.
- **Abertura de folha:** título em Headline, lead de 18px, pauta, linha de procedência em 14px cinza de texto (camada em tinta 600, link laranja sublinhado de 1px com afastamento de 3px, 2px no hover).
- **Capa:** cabeçalho corrente nos cantos (Source Sans 3 600 11px 0,16em caixa alta, cinza de texto), título em Display, subtítulo itálico, dica, "Ordem de utilização" com quatro compassos (pauta no alto de cada um, numeral romano laranja 700 20px pousado na pauta com recorte de papel, passo em 15px), índice em três colunas sob fio de 2px e nota de rodapé sob fio de 1px.
- **Ficha de PDF:** capa do PDF em coluna de 300px com sombra de capa, texto ao lado (título, volume ou lead, pauta, tabela, ações, relação com o documento lido).
- **Trilho "Nesta folha":** 210px, links de 13,5px em cinza de texto com fio de 1px à esquerda; a seção corrente ganha fio laranja e texto em tinta.
- **Paginador:** tecla anterior e próxima sob fio de 2px em tinta, título em Zalando Sans Expanded 600 16px, laranja no hover.

### Folha de ferramentas
Segunda folha de papel com cabeçalho "Ferramentas" (gravado, 44px, fio inferior de 2px em tinta) e três ferramentas em sanfona: Calendário, Fundamentos, Ementário.
- **Cabeçalho fechado:** nome em Title-sm, status em Small com reticências, chevron; hover em Superfície. Com uma ferramenta aberta, os fechados se comprimem a 10px de respiro e escondem o status.
- **Cabeçalho aberto:** inverte para laca com nome em papel e status em âmbar ("Vence em 23/10/2026, sexta-feira"); o corpo ocupa a altura restante, rola sozinho e esmaece nos últimos 26px.
- **Templates:** faixa âmbar no pé da folha, nome em Zalando Sans Expanded 700 e seta de saída desenhada; abre a camada em tela inteira.
- **Alça:** o vão de 20px à esquerda; no hover ou foco mostra uma barra âmbar de 2×40px.

### Resultado do Calendário
Bloco de laca com o vencimento em Title ("Vence em" em âmbar 400, data por extenso em papel 700) e a linha de apoio em 13,5px cinza sobre laca. Aberto na folha, corre em linha com o vencimento a 40px. O mês desenhado usa grade de 7 colunas com dias de 30px: marco com anel interno de 2px em tinta, dia contado em Tint de Acento, dia excluído pela tabela em âmbar, exclusão informada em listras diagonais de Tint de Apoio e papel, vencimento em laca com numeral em papel e marca em âmbar. A trilha da contagem é uma tabela sob fio de 2px com o vencimento em laca.

### Buttons
- **Shape:** cantos de 2px, altura mínima de 44px, respiro de 0 18px, Source Sans 3 600 14px.
- **Primário:** laca com texto em papel; no hover, laranja (fundo e borda).
- **Contorno:** fundo transparente sobre o papel, borda de 1px em tinta; hover em Superfície.
- **Discreto:** borda de 1px em #BDBDBD que escurece para tinta no hover, sem fundo.
- **Pequeno:** 36px, 0 12px, 13px.
- **Focus:** anel global laranja de 2px a 2px; transições de cor em 0,2s.

### Chips e etiquetas
- **Chip:** pílula de 32px, borda de 1px em #C8C8C8, papel, Source Sans 3 600 12,5px, contagem em 400 a 70%; hover com borda em tinta. Usado para registros relacionados, sugestões de busca e as exclusões de data informadas.
- **Etiqueta:** retângulo reto de 5px 8px, Source Sans 3 600 10px 0,12em caixa alta. Variantes: neutra (Superfície e cinza de texto), tinta (laca e papel), âmbar (Tint de Apoio e tinta).

### Inputs / Fields
- **Style:** 44px de altura, 0 12px, borda de 1px em #B4B4B4, cantos de 2px, papel, texto em 16px; rótulo acima em Source Sans 3 600 12,5px tinta. Hover com borda #8A8A8A. Select com chevron desenhado em tinta.
- **Focus:** contorno laranja de 2px por dentro e borda laranja; cursor de texto laranja.
- **Error / Disabled:** inválido com borda laranja e anel interno de 1px; opções fora da base aparecem desabilitadas, não somem.
- **Data:** campo de texto dd/mm/aaaa (máximo de 10 caracteres, teclado numérico, algarismos tabulares) com botão de 40px à direita que mostra o ícone de calendário desenhado (retângulo, fio de cabeçalho, duas argolas), cinza de texto e laranja no hover.
- **Busca da ferramenta:** caixa de 46px com borda de 1,5px em tinta, ícone de lupa desenhado e contagem tabular à direita; no foco, borda e anel de 1px em laranja.
- **Controle segmentado:** bandeja em Superfície com 3px de respiro; segmentos de 36px em 600 13,5px cinza de texto; ativo em laca com texto em papel.
- **Caixa de seleção:** nativa de 18px na cor tinta, em linha com fio inferior.

### Navigation
- **Barra superior:** laca de 48px. Marca ATRIL gravada em papel (âmbar no hover), título da obra em Source Sans 3 500 13px cinza sobre laca com divisor de 1px, campo de busca com lupa e atalho Ctrl K (34px, Aresta da Tampa, borda Fio Escuro, papel no hover), link ECHO gravado com seta de saída desenhada.
- **Barra mobile:** quatro colunas de 56px (Calendário, Fundamentos, Ementário, Templates), ícone desenhado de 20px sobre rótulo em Source Sans 3 600 11px cinza sobre laca; a ferramenta aberta acende em âmbar. Calendário, Fundamentos e Ementário abrem a gaveta (sobe em 0,45s, fio âmbar de 3px no cabeçalho, botão de fechar, só a ferramenta escolhida visível); Templates abre a camada.
- **Teclado:** é a navegação entre materiais (ver Teclado).

### Camada de Templates
Tela inteira que reproduz o instrumento: cabeçalho de laca com no mínimo 64px (título em Zalando Sans Expanded 700 20px, subtítulo em cinza sobre laca, botão Fechar com contorno Fio Escuro e atalho Esc, âmbar no hover) e, sobre a laca, uma folha de papel recuada pela margem do instrumento. Entra em 0,45s (esmaecimento e subida de 12px). Abas de 44px com sublinhado laranja de 2px na selecionada. Montador em duas colunas: lista de modelos (botões de 44px com contorno em Fio, ativo em laca) e a minuta, uma folha com fio de 1px, respiro de 32px 36px, texto de 15,5px a 1,75 e sombra de minuta. Lacunas são campos em linha com Tint de Acento e fio laranja de 2px por baixo, que perdem o fundo quando preenchidas; alternativas levam fio âmbar de 2px sobre Tint de Apoio; blocos repetíveis têm fio tracejado laranja à esquerda; blocos inativos, quando mostrados, fio pontilhado cinza.

### Busca global
Diálogo de papel com até 860px sobre véu de laca a 72%, fio âmbar de 3px no topo e sombra de diálogo. Consulta em Source Sans 3 500 20px; filtros em controle segmentado; resultados com código em laranja (Zalando Sans Expanded 700 10,5px), título em 600 15,5px e trecho em 13,5px cinza de texto, termos realçados em Marca-texto; resultado selecionado em Superfície; rodapé em Superfície com teclas de atalho. No mobile ocupa a tela inteira.

### Documento na folha (sistema editorial hospedado)
Os documentos são tipografados pelo sistema editorial da coleção impressa (`familia.css` e `componentes.css`), que a camada web hospeda dentro da folha e não usa fora dela: escala de espaçamento de base 4 (s1 a s10), Zalando Sans sem expansão nos subtítulos e numerais (h2 em 700 22px, h3 em 700 16px), Source Sans 3 no texto, tabelas definicionais, sumários e entradas numeradas abertas por fio de 2px em tinta com linhas separadas por fio de 1px, notas em Superfície e avisos em Tint de Apoio com triângulo desenhado, marcadores de lista quadrados de 5px em laranja, blocos de minuta com fio laranja à esquerda, cards e notas com 4px de raio. A camada web ajusta esse sistema ao instrumento: o título de abertura passa a Headline em Zalando Sans Expanded, o sobretítulo da coleção é ocultado, os números de página do sumário somem, os quatro temas de volume apontam para o mesmo laranja, e no mobile toda grade do documento cai para uma coluna. A geometria A4 da coleção (794 × 1123px) é do impresso e não entra na página.

## Do's and Don'ts

### Do:
- **Faça** a escolha de material no teclado: cada material é uma tecla, brancas para documentos e manuais, pretas para anexos em PDF, na ordem de `dados/materiais.json`.
- **Faça** o estado da tecla falar por afundamento e cor: 8px e âmbar sob o cursor, 5px e laranja quando o material está na folha, 10px no clique.
- **Faça** a pauta de cinco linhas (29px, linhas em Fio a cada 7px, barra inicial de 1px e barra dupla final de 1px e 3px) separar a abertura de cada folha do seu corpo.
- **Faça** datas sempre em dd/mm/aaaa com algarismos tabulares e o ícone de calendário desenhado ao lado do campo.
- **Faça** o texto sobre a laca em papel ou em Cinza sobre Laca (#A3A3A3) e o destaque sobre a laca em âmbar.
- **Faça** ícones em SVG desenhado numa grade de 24, a 20px, com traço de 1,75, terminais retos e junções em quina.
- **Faça** toda animação ceder a `prefers-reduced-motion`: sem cortina na virada da folha, sem arpejo, transições zeradas, rolagens instantâneas.
- **Faça** a marca de lacuna com o fio laranja de 2px por baixo e o texto em tinta sobre o Tint de Acento.

### Don't:
- **Não faça** a navegação entre materiais com barra lateral, grade de cards ou home de atalhos; o trilho "Nesta folha" lista só as seções da folha aberta.
- **Não faça** a página rolar; rolam a folha, o corpo da ferramenta aberta, a camada de Templates e, no mobile, o teclado na horizontal.
- **Não use** cor fora da paleta fechada, nem #FFFFFF ou #000000 como superfície ou texto; o branco é #FCFCFC e o preto é #181818.
- **Não ponha** texto laranja sobre a laca, nem texto laranja pequeno sobre o Tint de Acento; sobre o preto o destaque é âmbar, sobre o tint o laranja vira fio.
- **Não levante** teclas com sombra, brilho ou escala; tecla afunda.
- **Não ponha** sobretítulo (eyebrow, kicker) acima do título de folha ou de seção; o cabeçalho corrente da capa, nos cantos, é o da partitura e da coleção impressa, não um sobretítulo.
- **Não use** caractere tipográfico como ícone de ação.
- **Não leve** o raio de 4px dos cards da coleção para fora dos documentos tipografados; a camada web usa cantos retos, 2px nos controles e pílula só nos chips.
- **Não troque** Zalando Sans Expanded por face de sistema na marca, nas teclas ou nos títulos.
