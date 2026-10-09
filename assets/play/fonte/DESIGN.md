---
name: PLAY
description: Partitura de regência numa folha sobre base de tinta. O acervo do Playbook é o sistema que o regente lê; cada material é uma pauta, os compassos são a ordem de utilização; os três primeiros manuais abrem numa gaveta sob a pauta, o resto numa parte sobre a partitura.
colors:
  tinta: "#181818"
  papel: "#FCFCFC"
  ambar: "#FFB627"
  latao: "#8A6620"
  latao-2: "#6E5119"
  ambar-luz: "rgba(255, 182, 39, .16)"
  support-tint: "#FDEED1"
  accent-tint: "#F7F0E1"
  mark: "#FDDC9C"
  surface: "#F3F3F2"
  rule: "#DADADA"
  ink-3: "#5C5C5C"
  grafite: "rgba(24, 24, 24, .66)"
  cinza: "rgba(24, 24, 24, .48)"
  fio: "rgba(24, 24, 24, .2)"
  fio-2: "rgba(24, 24, 24, .1)"
typography:
  titulo:
    fontFamily: "'Bodoni Moda', Didot, 'Bodoni 72', Georgia, serif"
    fontSize: "64px"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "0.08em"
  barra:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.3em"
  folha:
    fontFamily: "'Bodoni Moda', Didot, Georgia, serif"
    fontSize: "clamp(34px, 4vw, 56px)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.02em"
  voz:
    fontFamily: "'Bodoni Moda', Didot, Georgia, serif"
    fontStyle: italic
    fontSize: "15.5px"
    fontWeight: 400
    lineHeight: 1.1
  secao:
    fontFamily: "'Bodoni Moda', Didot, Georgia, serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: "'Instrument Sans', system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
  body-sm:
    fontFamily: "'Instrument Sans', system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  indicacao:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "9.5px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.18em"
  codigo:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "10.5px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.04em"
  assinatura:
    fontFamily: "'ARCO Restart Ginger', 'Instrument Sans', sans-serif"
    fontSize: "21px"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.03em"
rounded:
  none: "0px"
  campo: "2px"
  pilula: "999px"
spacing:
  borda: "clamp(12px, 3vw, 48px)"
  topo: "clamp(34px, 2.6vw, 42px)"
  g: "clamp(16px, 4.4vw, 72px)"
  nomes: "clamp(150px, 15vw, 232px)"
  chave: "26px"
  coluna-ver: "118px"
  voz: "42px"
  parte: "min(1040px, 92vw)"
components:
  pilula:
    backgroundColor: "transparent"
    textColor: "{colors.tinta}"
    rounded: "{rounded.pilula}"
    height: "36px"
    padding: "0 5px 0 15px"
  pilula-bolha:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.papel}"
    size: "26px"
  pilula-bolha-hover:
    backgroundColor: "{colors.ambar}"
    textColor: "{colors.tinta}"
  marca-de-ensaio:
    backgroundColor: "transparent"
    textColor: "{colors.tinta}"
    typography: "Bodoni Moda 700 13px"
  marca-de-ensaio-ativa:
    backgroundColor: "{colors.ambar}"
  voz-aberta:
    highlight: "{colors.ambar}, faixa de 58% a 92% da altura do nome"
  coluna-em-foco:
    backgroundColor: "{colors.ambar-luz}"
  batuta:
    backgroundColor: "{colors.ambar}"
    width: "2px"
  parte:
    backgroundColor: "{colors.papel}"
    width: "{spacing.parte}"
  base:
    backgroundColor: "{colors.tinta}"
    border: "laterais {spacing.borda}; topo {spacing.topo}, um pouco mais fino"
  barra-texto:
    textColor: "{colors.ambar}"
    typography: "{typography.barra}"
  gaveta:
    backgroundColor: "{colors.surface}"
    shadow: "inset 0 10px 14px -12px rgba(24, 24, 24, .22)"
  button-primary:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.papel}"
    rounded: "{rounded.pilula}"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.ambar}"
    textColor: "{colors.tinta}"
  campo:
    backgroundColor: "transparent"
    border: "1px de tinta embaixo; 2px no foco"
    height: "46px"
  codigo:
    textColor: "{colors.latao}"
    typography: "{typography.codigo}"
  lacuna:
    backgroundColor: "{colors.accent-tint}"
    border: "2px de latão embaixo"
---

# Design System: PLAY

## Overview

**Creative North Star: "A Partitura Geral"**

O PLAY é a partitura que o regente lê, numa folha. A página é o início de uma folha A4 pousada numa base de tinta: bordas pretas nas laterais e, um pouco mais fina, a barra do topo, que traz "PLAYBOOK ECHO" em âmbar. A folha abre só com o título, PLAY, em Bodoni Moda 900. Abaixo vem o sistema: cada material é uma pauta, as pautas se agrupam em naipes por chave, e os compassos são a ordem de utilização da seção 3 das Regras de Aplicação. As notas ficam onde as Regras mandam usar cada componente. Ler na vertical é ler um passo; ler na horizontal é seguir um material pela ordem inteira.

Os três primeiros manuais (Notas Introdutórias, Mapa Temático, Afinação Processual) abrem numa gaveta que desce sob a própria pauta, com a página dupla do volume. Os demais materiais abrem numa parte, uma folha que entra pela direita sobre a partitura esmaecida. Documentos, fichas de PDF e ferramentas usam o mesmo painel; o montador de Templates é o único que toma a tela inteira.

O mundo tem um material, o papel #FCFCFC, e uma luz, o âmbar #FFB627. A tinta escreve; o âmbar marca o que está em foco (o nome aberto, o compasso sob o cursor, a batuta, o vencimento calculado); o latão, âmbar com tinta, marca códigos, numerais e links no texto.

**Key Characteristics:**
- A folha de papel #FCFCFC sobre a base de tinta #181818; texto em tinta.
- Âmbar como luz única, em marca-texto, faixa de coluna e batuta.
- Notação musical verdadeira: pautas de cinco linhas, barras de compasso, barra dupla final, pausas, semínimas, semibreves ligadas, chaves e colchetes de naipe, marcas de ensaio, indicações *tacet* e *ad lib.*
- A notação informa: cada nota corresponde a uma regra escrita.
- Bodoni Moda para o que é título ou nome; Instrument Sans para o texto; JetBrains Mono para indicações, códigos e a barra; Restart Ginger só na assinatura do autor, como no ARCO.
- Pílulas para comandos; cantos retos no resto.

## Colors

A paleta é fechada. Tudo o que não é tinta, papel ou âmbar é mistura deles.

### Luz
- **Âmbar** (#FFB627): "PLAYBOOK ECHO" e os comandos na barra do topo; símbolo da assinatura no pé (o miolo continua vazado); marca-texto do nome da voz aberta ou sob o cursor, da epígrafe, do nome do autor e do link ECHO no hover, e do vencimento; fundo da marca de ensaio ativa; batuta; dias excluídos no calendário; bolha das pílulas no hover; botão primário no hover; fio do topo da busca; seleção de texto.
- **Luz de coluna** (âmbar a 16%): faixa do compasso em foco.

### Marcação
- **Latão** (#8A6620, 5:1 sobre o papel): códigos (FUN-0104, 6226, RI-CONHECIDO), numerais de contagem, links dentro dos documentos, sublinhado das lacunas do montador, fio das repetições.
- **Latão fechado** (#6E5119): texto pequeno sobre o tint de acento (registro selecionado, lacuna, resultado escolhido).
- **Tint de acento** (#F7F0E1): registro selecionado, dia contado, lacuna a preencher.
- **Tint de apoio** (#FDEED1): avisos, alternativa a escolher, linha excluída na trilha.
- **Marca-texto de busca** (#FDDC9C): termos encontrados.

### Neutros
- **Tinta** (#181818): a base sob a folha (laterais e barra do topo); todo o texto principal, barras e chaves da partitura, botão primário, vencimento no calendário.
- **Papel** (#FCFCFC): a folha e tudo o que se abre sobre ela, inclusive a parte e o montador.
- **Grafite** (tinta a 66%) e **Cinza** (tinta a 48%): texto secundário, indicações, rótulos.
- **Fio** (tinta a 20%) e **Fio 2** (tinta a 10%): linhas da pauta, separadores.
- **Superfície** (#F3F3F2): fundo da gaveta, hover de linhas, caixas de nota.

### Named Rules
**A Regra da Luz Única.** Só o âmbar acende. Nada de segunda cor de destaque na interface; o laranja #C84D00 da coleção impressa fica nas capas dos manuais.

**A Regra do Papel.** Uma folha, #FCFCFC, sobre uma base, #181818. Nenhum #FFFFFF ou #000000; o escuro é só a base em volta da folha. A outra exceção é o leitor de PDF: o palco escurece em tinta a 96%, como no "Visualizar" do ECHO, para que a página do PDF seja o único papel em cena.

## Typography

**Títulos e nomes:** Bodoni Moda (opsz 96 nos tamanhos de título).
**Texto:** Instrument Sans.
**Indicações e códigos:** JetBrains Mono, caixa alta espaçada nas indicações e na barra do topo.
**Assinatura:** ARCO Restart Ginger 600, só no nome do autor, no pé da página (a mesma face e o mesmo símbolo do ARCO).

### Hierarchy
- **Título** (Bodoni 900, 64px, 1, +0,08em): PLAY, centrado no alto da folha; é o único elemento da folha de rosto.
- **Barra** (JetBrains Mono 500, 14px, 0,3em, caixa alta, âmbar): "PLAYBOOK ECHO", centrado na barra do topo; ECHO leva à página-mãe (arco.html#echo).
- **Folha** (Bodoni 400, clamp(32px, 3.6vw, 50px), 1, −0,02em): título de documento, ferramenta, ficha de PDF, montador. O lead vem em Bodoni itálico 18px, grafite.
- **Seção** (Bodoni 600, 22px): h2 dos documentos; h3 em 600 16px.
- **Voz** (Bodoni itálico 400, 15,5px): nome de cada pauta.
- **Texto** (Instrument Sans 400, 16px, 1,65): documentos; 13 a 15px nas ferramentas.
- **Indicação** (JetBrains Mono 500, 9,5px, 0,18em, caixa alta, cinza): subtítulo da voz, naipe na chave, rótulo da parte, rótulos de campo e de bloco, rodapé.
- **Código** (JetBrains Mono 500, 10,5px, latão): identificadores de registro e de modelo; "ver | baixar" em JetBrains Mono 400 10,5px, cinza, com sublinhado âmbar no hover.

### Named Rules
**A Regra da Gravura.** Bodoni é para o que se nomeia (título, voz, folha, seção, numeral); Instrument Sans é para o que se lê; JetBrains Mono é para o que se indica. Nenhuma face assume o papel de outra.

**A Regra da Barra.** O separador é sempre " | ", nunca o ponto médio.

## Layout

A página é uma folha sobre a base: bordas de tinta nas laterais (clamp(12px, 3vw, 48px)) e, um pouco mais fina, a barra do topo (clamp(34px, 2.6vw, 42px)); a folha corre até o fim da página, como o início de uma A4 vista de perto. Dentro dela, o conteúdo tem largura máxima de 1560px, com margem lateral clamp(16px, 4.4vw, 72px).

- **Barra do topo:** "PLAYBOOK ECHO" ao centro; nos cantos, dois comandos redondos de 26px com contorno âmbar: o símbolo musical (ouvir os compassos) à esquerda e a lupa (buscar, Ctrl K) à direita. No hover ou ligados, enchem de âmbar.
- **Folha de rosto:** só o título PLAY, centrado, com mais ar embaixo do que em cima (clamp(72px, 12vh, 136px) até o cabeçalho dos compassos).
- **Sistema:** cada linha é uma grade de quatro colunas: chave (26px), nomes (clamp(150px, 15vw, 232px)), pauta (o resto) e "ver | baixar" (118px). O cabeçalho deixa em branco a casa à esquerda (sem rótulo) e, sobre cada compasso, traz a marca de ensaio com o passo numa linha ("I IDENTIFICAÇÃO") e, na linha de baixo, o texto que o continua ("para classe, objeto, rito e questões relevantes."). Texto em Instrument Sans 11,5px, justificado e hifenizado (hífen discreto na fonte, para não depender do dicionário do navegador), com margem pequena à esquerda e um pouco maior à direita, dentro da área de hover do compasso.
- **Pé:** sobre fio, a epígrafe "Harmonia é coordenação de diferenças." em Bodoni itálico à esquerda e, à direita, a assinatura: símbolo âmbar de 36px ao lado do nome em Restart Ginger e de "LAW | OPS | TECH | AI" em indicação, levando ao ARCO. Até 980px, os dois se empilham ao centro.
- **Naipes, nesta ordem:** Coleção (chaveta de piano: Notas Introdutórias em I, que acolhe; Mapa Temático em I, que classifica a matéria; Afinação Processual sustentada de I a II, ligada, triagem e depois verificação; e o Guia de Estilo, sustentado de IV até a coda; as notas dos volumes seguem o que cada um declara na capa), Governança (colchete: Regras de Aplicação em pedal nos cinco compassos e Critérios Operacionais na coda, emendando no Guia de Estilo que fecha a Coleção; depois Índice e Arquitetura *ad lib.*, legenda "Abertura", e Memória de Integração *ad lib.*, legenda "Registro"; as legendas são as categorias que os próprios PDFs declaram) e Ferramenta (colchete: Calendário Jurídico em II, Fundamentos e Ementário em III, Templates em IV).
- **Parte:** painel fixo à direita, min(1040px, 92vw), com cabeçalho (rótulo "Naipe | Material" e pílula "Voltar à partitura") e corpo rolável. Documentos levam o trilho "Nesta folha" (210px) acima de 1180px.

Comportamento por largura:
- **Até 1180px:** o trilho "Nesta folha" some.
- **Até 980px:** a coluna "ver | baixar" some da partitura; o pé se empilha ao centro.
- **Até 700px:** o nome da voz sobe para cima da pauta; o texto da ordem vira lista de uma coluna; a parte ocupa a largura inteira; coluna em foco e batuta somem; o leitor de PDF mostra uma página por vez; a gaveta empilha a página dupla sobre o texto.

### Named Rules
**A Regra da Vertical.** A partitura se lê nas duas direções. Qualquer mudança no que entra em cada passo muda primeiro as Regras de Aplicação e depois as notas.

**A Regra da Parte.** Ler, consultar e calcular acontecem na parte, sem perder a partitura de vista. Só montar minuta toma a tela inteira.

## Elevation & Depth

O mundo é plano. Profundidade só para o que se sobrepõe: a parte (sombra lateral longa e véu de tinta a 16% com desfoque de 3px sobre a partitura), o diálogo de busca, a minuta no montador, a capa do PDF na ficha, o livro aberto no leitor de PDF e o aviso.

## Shapes

Cantos retos por padrão. Pílula (999px) em comandos, botões, chips, controle segmentado, etiquetas e aviso. Campos são linhas: 1px de tinta embaixo, 2px no foco. O raio de 4px dos cards pertence aos documentos da coleção e só vive dentro deles.

A notação dá as formas: pauta de cinco linhas a cada 5px, barra de compasso de 1px, barra dupla final de 1px e 3px, pausa de semibreve pendurada na quarta linha, semínima com haste para cima abaixo da linha central e para baixo acima dela, semibreve vazada, ligadura curva, chave (colchete reto com ganchos) e chaveta de piano.

## Components

### Partitura
- **Voz:** nome em Bodoni itálico alinhado à direita, legenda em indicação ("vol. 01"; "vol. 03 | SOP" e "vol. 04 | SOP" na Afinação Processual e no Guia; "SOP" nas Regras e nos Critérios; a contagem nas ferramentas), pauta em SVG do tamanho real da coluna, "ver | baixar" à direita (ferramentas não têm). Hover: nome desliza 4px para a esquerda e ganha o marca-texto âmbar; as outras vozes esmaecem a 32%. Aberta: marca-texto fixo.
- **Compasso em foco:** cursor sobre a coluna ou foco na marca de ensaio. A faixa de luz âmbar cobre o compasso, as notas de fora caem a 22% de opacidade, a marca acende em âmbar e o texto do passo, no cabeçalho, passa para tinta.
- **Som:** o símbolo musical da barra do topo ("Ouvir os compassos") liga um sintetizador senoidal; cada compasso soa como acorde das notas que contém. As alturas fazem I abrir em Dó maior (Mi4, Sol4 e Dó5, com o Mi5 da Afinação), II soar Lá menor com o mesmo Mi ligado como nota comum, III soar Dó maior, IV ficar suspenso (Fá, Sol, Dó) e a coda resolver em Dó maior. Ligar o som toca os cinco compassos em sequência.
- **Gaveta:** só nos volumes 01, 02 e 03. Clicar na pauta (ou no nome) abre, sob ela, uma gaveta em superfície #F3F3F2 com sombra interna no topo, alinhada do início da pauta à barra final, que empurra o resto para baixo (0,6s, na curva da mola). Dentro: a página dupla do volume (capa e página 2, de 104 a 136px por página, com a lombada), que abre o leitor em tela inteira; "Volume 01 | Identidade e estrutura" em indicação; o nome em Bodoni; a frase de abertura do manual ("Acolher é… […]"); natureza e formato; "Abrir o PDF" e "Baixar"; e o X redondo. Fecha clicando na própria pauta, no X, em outra pauta ou com Esc. A rota é a do volume (#vol-01), e um link direto abre a gaveta.
- **Batuta:** fio âmbar de 2px que atravessa o sistema uma vez, 900ms depois da carga; não ocorre com movimento reduzido nem abaixo de 700px.

### Parte
- **Rótulo:** "Coleção | Guia de Estilo", "Governança | Regras de Aplicação", "Ferramenta | Calendário Jurídico", "Governança | Índice e Arquitetura", "Anexo em PDF | Templates".
- **Documento:** o texto integral do componente no sistema editorial da coleção, com h1 em Bodoni, lead, linha de procedência com a legenda da voz e o naipe ("vol. 04 | SOP | Governança") seguida de "Abrir o PDF", pauta divisória e trilho "Nesta folha".
- **Ficha de PDF** (Guia em PDF e anexos): capa do PDF (280px, abre o leitor), título, lead, pauta, natureza, formato (sem contador de páginas), arquivo, "Abrir o PDF" e "Baixar".

### Leitor de PDF
"Ver" e "Abrir o PDF" abrem o arquivo na própria página, como o "Visualizar" do ECHO: palco em tinta a 96%, cabeçalho com o nome em Bodoni itálico e a posição ("02–03 / 13") em indicação, pílulas claras "Baixar" e "Fechar". O PDF se lê como livro: capa sozinha, depois páginas duplas com a sombra da lombada; até 760px, uma página por vez. Setas laterais redondas (âmbar no hover), setas do teclado e Esc. O pdf.js 3.11.174 (cdnjs) só é carregado na primeira abertura.
- **Ferramenta:** título em Bodoni, status vivo em Bodoni itálico (por exemplo, "Vence em 23/10/2026, sexta-feira"), pauta e o corpo da ferramenta.

### Calendário
Controle segmentado Prazo ou Intervalo; campos de linha com data em Bodoni 20px; vencimento em Bodoni clamp(30px, 3.6vw, 44px) com o marca-texto âmbar; mês desenhado (marco com anel de tinta, dia contado em tint de acento, excluído em âmbar, vencimento em tinta); trilha de conferência copiável; caixa de limites da base.

### Fundamentos e Ementário
Busca em linha (Bodoni itálico 21px, fio de tinta embaixo), lista de registros com código em latão, registro aberto com tags em pílula, tabela definicional com rótulos em indicação, formulação-base com fio âmbar à esquerda, árvore taxonômica do Ementário.

### Templates
Tela inteira em papel: cabeçalho com título em Bodoni e pílula "Voltar à partitura", abas com sublinhado âmbar, lista de modelos e resultados em linhas (selecionado em tint de acento), minuta em folha com sombra, lacunas com sublinhado de latão, alternativas com sublinhado âmbar.

### Busca global
Diálogo de papel com fio âmbar no topo, consulta em Bodoni itálico 24px, filtros em controle segmentado, resultados com código em latão e termos em marca-texto.

### Comandos e botões
- **Pílula:** 36px, contorno de fio, rótulo em Instrument Sans 500 12,5px e bolha de tinta de 26px com ícone; no hover, a bolha vira âmbar e desliza 2px. Pressionada (som ligado), a bolha fica âmbar.
- **Botão:** pílula de 44px; primário em tinta, âmbar no hover; secundário com contorno de fio.

## Do's and Don'ts

### Do:
- **Faça** cada nota corresponder a uma regra escrita nas Regras de Aplicação.
- **Faça** o âmbar marcar o que está em foco, e só isso.
- **Faça** os nomes em Bodoni itálico e as indicações em JetBrains Mono caixa alta.
- **Faça** o separador " | " em toda indicação composta.
- **Faça** "ver" abrir o PDF no leitor da página e "baixar" baixar o arquivo; ferramentas não têm "ver | baixar".
- **Faça** toda animação ceder a `prefers-reduced-motion`.

### Don't:
- **Não ponha** notas nas pautas de Índice e Memória: abertura e registro não tocam na ordem e são as únicas *ad lib.*
- **Não repita** um material em duas pautas: o Guia de Estilo vive na Coleção.
- **Não use** segunda cor de destaque ou #FFFFFF; o escuro é só a base em volta da folha e o palco do leitor.
- **Não use** ponto médio como separador.
- **Não troque** Restart Ginger por outra face na assinatura, nem preencha o miolo do símbolo.
- **Não carregue** Fundamentos e Ementário na abertura da página: cada base desce só quando a ferramenta é aberta ou a busca global a consulta.
