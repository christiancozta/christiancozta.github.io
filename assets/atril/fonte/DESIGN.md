---
name: ÁTRIL
description: Partitura de regência. O acervo do Playbook é o sistema que o regente lê; cada material é uma pauta, os compassos são a ordem de utilização, e o material abre numa parte sobre a partitura.
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
    fontSize: "clamp(64px, 9.6vw, 156px)"
    fontWeight: 400
    lineHeight: 0.86
    letterSpacing: "0.015em"
  subtitulo:
    fontFamily: "'Bodoni Moda', Didot, Georgia, serif"
    fontStyle: italic
    fontSize: "clamp(19px, 2vw, 30px)"
    fontWeight: 400
    lineHeight: 1.2
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
    fontFamily: "'Commissioner', system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
  body-sm:
    fontFamily: "'Commissioner', system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  indicacao:
    fontFamily: "'Azeret Mono', ui-monospace, monospace"
    fontSize: "9.5px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.18em"
  codigo:
    fontFamily: "'Azeret Mono', ui-monospace, monospace"
    fontSize: "10.5px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.04em"
  assinatura:
    fontFamily: "'ARCO Restart Ginger', 'Commissioner', sans-serif"
    fontSize: "21px"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.03em"
rounded:
  none: "0px"
  campo: "2px"
  pilula: "999px"
spacing:
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

# Design System: ÁTRIL

## Overview

**Creative North Star: "A Partitura Geral"**

O ÁTRIL é a partitura que o regente lê. A página abre como a folha de rosto de uma obra: o nome em Bodoni Moda, o subtítulo em itálico, a epígrafe do ECHO à esquerda com os comandos logo abaixo, e as anotações à direita. Abaixo vem o sistema: cada material é uma pauta, as pautas se agrupam em naipes por chave, e os compassos são a ordem de utilização da seção 3 das Regras de Aplicação. As notas ficam onde as Regras mandam usar cada componente. Ler na vertical é ler um passo; ler na horizontal é seguir um material pela ordem inteira.

O material escolhido abre numa parte, uma folha que entra pela direita sobre a partitura esmaecida. Documentos, fichas de PDF e ferramentas usam o mesmo painel; o montador de Templates é o único que toma a tela inteira.

O mundo tem um material, o papel #FCFCFC, e uma luz, o âmbar #FFB627. A tinta escreve; o âmbar marca o que está em foco (o nome aberto, o compasso sob o cursor, a batuta, o vencimento calculado); o latão, âmbar com tinta, marca códigos, numerais e links no texto.

**Key Characteristics:**
- Um chão só, o papel #FCFCFC; texto em tinta #181818.
- Âmbar como luz única, em marca-texto, faixa de coluna e batuta.
- Notação musical verdadeira: pautas de cinco linhas, barras de compasso, barra dupla final, pausas, semínimas, semibreves ligadas, chaves e colchetes de naipe, marcas de ensaio, indicações *tacet* e *ad lib.*
- A notação informa: cada nota corresponde a uma regra escrita.
- Bodoni Moda para o que é título ou nome; Commissioner para o texto; Azeret Mono para indicações e códigos; Restart Ginger só na assinatura do autor, como no ARCO.
- Pílulas para comandos; cantos retos no resto.

## Colors

A paleta é fechada. Tudo o que não é tinta, papel ou âmbar é mistura deles.

### Luz
- **Âmbar** (#FFB627): símbolo da assinatura no pé (o miolo continua vazado); marca-texto do nome da voz aberta ou sob o cursor, da epígrafe, do nome do autor e do link ECHO no hover, e do vencimento; fundo da marca de ensaio ativa; batuta; dias excluídos no calendário; bolha das pílulas no hover; botão primário no hover; fio do topo da busca; seleção de texto.
- **Luz de coluna** (âmbar a 16%): faixa do compasso em foco.

### Marcação
- **Latão** (#8A6620, 5:1 sobre o papel): códigos (FUN-0104, 6226, RI-CONHECIDO), numerais de contagem, links dentro dos documentos, sublinhado das lacunas do montador, fio das repetições.
- **Latão fechado** (#6E5119): texto pequeno sobre o tint de acento (registro selecionado, lacuna, resultado escolhido).
- **Tint de acento** (#F7F0E1): registro selecionado, dia contado, lacuna a preencher.
- **Tint de apoio** (#FDEED1): avisos, alternativa a escolher, linha excluída na trilha.
- **Marca-texto de busca** (#FDDC9C): termos encontrados.

### Neutros
- **Tinta** (#181818): todo o texto principal, barras e chaves da partitura, botão primário, vencimento no calendário.
- **Papel** (#FCFCFC): fundo de tudo, inclusive a parte e o montador.
- **Grafite** (tinta a 66%) e **Cinza** (tinta a 48%): texto secundário, indicações, rótulos.
- **Fio** (tinta a 20%) e **Fio 2** (tinta a 10%): linhas da pauta, separadores.
- **Superfície** (#F3F3F2): hover de linhas, caixas de nota.

### Named Rules
**A Regra da Luz Única.** Só o âmbar acende. Nada de segunda cor de destaque na interface; o laranja #C84D00 da coleção impressa fica nas capas dos manuais.

**A Regra do Papel.** Um único chão, #FCFCFC. Nenhum #FFFFFF, #000000 ou fundo escuro na interface. A exceção é o leitor de PDF: o palco escurece em tinta a 96%, como no "Visualizar" do ECHO, para que a página do PDF seja o único papel em cena.

## Typography

**Títulos e nomes:** Bodoni Moda (opsz 96 nos tamanhos de título).
**Texto:** Commissioner.
**Indicações e códigos:** Azeret Mono, caixa alta espaçada nas indicações.
**Assinatura:** ARCO Restart Ginger 600, só no nome do autor, no pé da página (a mesma face e o mesmo símbolo do ARCO).

### Hierarchy
- **Título** (Bodoni 400, clamp(60px, 8vw, 132px), 0,86, +0,1em): ÁTRIL, centrado na folha de rosto. O espacejamento largo é obrigatório: abaixo dele as serifas de fio do Bodoni (opsz 96) se emendam e desenham um filete na base e no topo da palavra. O topo do acento fica na mesma linha do primeiro texto das colunas laterais.
- **Subtítulo** (Bodoni itálico 400, clamp(17px, 1.6vw, 24px)): "Playbook da metodologia ECHO", com ECHO levando à página-mãe (arco.html#echo).
- **Descrição** (indicação, 9,5px): "Manuais, SOPs e instrumentos para gabinete judicial", sob o subtítulo; nas ferramentas, a mesma linha diz o que cada uma é ("Ferramenta | gatilhos, requisitos e limites").
- **Folha** (Bodoni 400, clamp(32px, 3.6vw, 50px), 1, −0,02em): título de documento, ferramenta, ficha de PDF, montador. O lead vem em Bodoni itálico 18px, grafite.
- **Seção** (Bodoni 600, 22px): h2 dos documentos; h3 em 600 16px.
- **Voz** (Bodoni itálico 400, 15,5px): nome de cada pauta e de cada anotação.
- **Texto** (Commissioner 400, 16px, 1,65): documentos; 13 a 15px nas ferramentas.
- **Indicação** (Azeret Mono 500, 9,5px, 0,18em, caixa alta, cinza): subtítulo da voz, naipe na chave, rótulo da parte, rótulos de campo e de bloco, rodapé.
- **Código** (Azeret Mono 500, 10,5px, latão): identificadores de registro e de modelo; "ver | baixar" em Azeret Mono 400 10,5px, cinza, com sublinhado âmbar no hover.

### Named Rules
**A Regra da Gravura.** Bodoni é para o que se nomeia (título, voz, folha, seção, numeral); Commissioner é para o que se lê; Azeret Mono é para o que se indica. Nenhuma face assume o papel de outra.

**A Regra da Barra.** O separador é sempre " | ", nunca o ponto médio.

## Layout

A página rola e tem largura máxima de 1560px, com margem lateral clamp(16px, 4.4vw, 72px).

- **Entrada limpa:** sem barra superior nem fio; a página abre direto na folha de rosto.
- **Folha de rosto:** grade de três colunas (minmax(190px, 1fr), 3,2fr, minmax(190px, 1fr)), as três começando na mesma linha. À esquerda, o texto de apresentação em Commissioner 11px, no corpo das legendas das anotações ("Showcase do acervo instrumental da metodologia de operações jurídicas ECHO, instalada em gabinete judicial do Tribunal de Justiça do Estado do Paraná. Autoria de Christian da Costa, advogado (OAB-PR 89.297) e Mestre em Direito (UFPR).") e os comandos: a pílula redonda do som (só o símbolo musical) e, ao lado, Buscar. No centro, título, subtítulo e descrição. À direita, alinhadas à direita e sem fio no topo, as anotações: Índice e Arquitetura ("Identidade, camadas e componentes") e Memória de Integração ("Fontes, decisões, correções e limites"), cada uma com "ver | baixar".
- **Sistema:** cada linha é uma grade de quatro colunas: chave (26px), nomes (clamp(150px, 15vw, 232px)), pauta (o resto) e "ver | baixar" (118px). O cabeçalho traz a indicação "Ordem de utilização" e, sobre cada compasso, a marca de ensaio com o passo numa linha ("I IDENTIFICAÇÃO") e, na linha de baixo, o texto que o continua ("para classe, objeto, rito e questões relevantes."). Texto em Commissioner 11,5px, justificado e hifenizado (hífen discreto na fonte, para não depender do dicionário do navegador), com margem pequena à esquerda e um pouco maior à direita, dentro da área de hover do compasso.
- **Pé:** sobre fio, a epígrafe "Harmonia é coordenação de diferenças." em Bodoni itálico à esquerda e, à direita, a assinatura: símbolo âmbar de 36px ao lado do nome em Restart Ginger e de "LAW | OPS | TECH | AI" em indicação, levando ao ARCO. Até 980px, os dois se empilham ao centro.
- **Naipes, nesta ordem:** Coleção (chaveta de piano: volumes 01 a 03 *ad lib.* e o Guia de Estilo, sustentado de IV até a coda), Governança (colchete: Regras de Aplicação em pedal nos cinco compassos, Critérios Operacionais na coda) e Ferramenta (colchete: Calendário Jurídico em II, Fundamentos e Ementário em III, Templates em IV).
- **Parte:** painel fixo à direita, min(1040px, 92vw), com cabeçalho (rótulo "Naipe | Material" e pílula "Voltar à partitura") e corpo rolável. Documentos levam o trilho "Nesta folha" (210px) acima de 1180px.

Comportamento por largura:
- **Até 1180px:** o trilho "Nesta folha" some.
- **Até 980px:** a folha de rosto vira uma coluna centrada (título; apresentação e comandos; anotações); a coluna "ver | baixar" some da partitura.
- **Até 700px:** o nome da voz sobe para cima da pauta; o texto da ordem vira lista de uma coluna; a parte ocupa a largura inteira; coluna em foco e batuta somem; o leitor de PDF mostra uma página por vez.

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
- **Som:** a pílula do símbolo musical ("Ouvir os compassos") liga um sintetizador senoidal; cada compasso soa como acorde das notas que contém. As alturas fazem III soar Dó maior, IV ficar suspenso (Fá, Sol, Dó) e a coda resolver em Dó maior. Ligar o som toca os cinco compassos em sequência.
- **Batuta:** fio âmbar de 2px que atravessa o sistema uma vez, 900ms depois da carga; não ocorre com movimento reduzido nem abaixo de 700px.

### Parte
- **Rótulo:** "Coleção | Guia de Estilo", "Governança | Regras de Aplicação", "Ferramenta | Calendário Jurídico", "Anotação | Índice e Arquitetura", "Anexo em PDF | Templates".
- **Documento:** o texto integral do componente no sistema editorial da coleção, com h1 em Bodoni, lead, linha de procedência com a legenda da voz e o naipe ("vol. 04 | SOP | Governança") seguida de "Abrir o PDF", pauta divisória e trilho "Nesta folha".
- **Ficha de PDF:** capa do PDF (280px, abre o leitor), título, lead, pauta, natureza, formato (sem contador de páginas), arquivo, "Abrir o PDF" e "Baixar".

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
- **Pílula:** 36px, contorno de fio, rótulo em Commissioner 500 12,5px e bolha de tinta de 26px com ícone; no hover, a bolha vira âmbar e desliza 2px. Pressionada (som ligado), a bolha fica âmbar.
- **Botão:** pílula de 44px; primário em tinta, âmbar no hover; secundário com contorno de fio.

## Do's and Don'ts

### Do:
- **Faça** cada nota corresponder a uma regra escrita nas Regras de Aplicação.
- **Faça** o âmbar marcar o que está em foco, e só isso.
- **Faça** os nomes em Bodoni itálico e as indicações em Azeret Mono caixa alta.
- **Faça** o separador " | " em toda indicação composta.
- **Faça** "ver" abrir o PDF no leitor da página e "baixar" baixar o arquivo; ferramentas não têm "ver | baixar".
- **Faça** toda animação ceder a `prefers-reduced-motion`.

### Don't:
- **Não ponha** o Registro (Índice e Arquitetura, Memória de Integração) no sistema: ele não toca na ordem e vive nas anotações.
- **Não repita** um material em duas pautas: o Guia de Estilo vive na Coleção.
- **Não use** segunda cor de destaque, fundo escuro ou #FFFFFF.
- **Não use** ponto médio como separador.
- **Não troque** Restart Ginger por outra face na assinatura, nem preencha o miolo do símbolo.
- **Não carregue** Fundamentos e Ementário na abertura da página: cada base desce só quando a ferramenta é aberta ou a busca global a consulta.
