# Demonstração de Legal Engineering (ATRIO → RATIO → TROIA)

Substitui a jornada gamificada (tabuleiro, peças, registradora, escolhas certas e erradas). A metáfora fica no repouso; o raciocínio assume o movimento.

## Repouso

- Só o relógio de xadrez do RATIO, na gravura de sempre (corpo, mostradores e botões preservados), centrado nas colunas 2 a 7 do painel `#legal-engineering`. Tem a mesma proeminência do foróptero do CERNE: a gravura tem a mesma altura do aparelho em qualquer largura (largura do relógio = largura do foróptero × 380/720 × 1376/970). O relógio inteiro é um `<button>`; abaixo dele, a indicação funcional "Iniciar demonstração", que só aparece quando o acionador está pronto.
- A superfície (`#demonstracao`) é um `div` vazio com `hidden`, logo após o painel: sem altura, linha ou espaço reservado.
- Arquivos carregados com a página: `assets/atrio/demonstracao/repouso.css` e `gatilho.js` (módulo ES, cerca de 8 KB sem compressão). Nada mais.

## Acionamento (`gatilho.js`)

1. No clique, pede em paralelo `demonstracao.js` (que importa `dados.js`) e `demonstracao.css`, por `import()` e `<link>` criado na hora.
2. A superfície grafite (`rgba(44,44,44,.96)`) desce a partir da base do painel, empurrando o conteúdo seguinte, enquanto a página a enquadra abaixo do cordão.
3. Só com a expansão concluída e os recursos carregados a reprodução começa.
4. Ao encerrar, a superfície recolhe pelo movimento inverso, a página volta ao relógio e o foco retorna a ele.

Decisões de implementação:

- A superfície mede uma viewport útil, `100dvh − --rail-h`: o cordão fixo cobriria o topo de uma superfície de `100dvh`. O espaço que ela ocupa na página fecha em quadrados inteiros da retícula (`padding-bottom` calculado), para que o painel do CERNE continue pousando numa linha.
- A superfície fica fora da grade do painel: `arco-home.js` fixa as fileiras dos painéis em pixels (`snap`), e uma superfície dentro da grade transbordaria.
- RATIO e TROIA no cordão (`data-ld-ir`) abrem a demonstração já no capítulo correspondente.

## Reprodução (`demonstracao.js`)

- Linha do tempo única de 19 passos: ATRIO (9), RATIO (6 fases), TROIA (3 lentes e encaminhamento). Cada passo se executa animado ou de uma vez; ir a um passo remonta a cena do capítulo e aplica de uma vez os anteriores. Avançar, Retroceder, o percurso no cabeçalho e os índices de fases e lentes dão sempre o mesmo estado.
- `Tempo`: todos os intervalos e Web Animations passam por ele. Pausar congela os dois; encerrar cancela tudo. A reprodução pausa sozinha fora de vista (aba oculta ou superfície com menos de 30% visível) e retoma ao voltar, se a pausa foi automática.
- Controles: Retroceder, Pausar/Retomar (Recomeçar no fim), Avançar, Encerrar. Teclado dentro da superfície: Espaço, setas, Esc. Em pausa, Avançar e Retroceder mostram cada passo concluído.
- Movimento reduzido: nada se desloca, a superfície abre sem animação, os textos aparecem inteiros e as pausas de leitura permanecem.
- Revelação por palavras inteiras, 5 por segundo, com pausa maior depois de pontuação. A montagem da minuta (RI_05) lê ementa e dispositivo no ritmo de leitura e monta os demais parágrafos em ritmo acelerado.

## Registros visuais

- Documentos (recurso, minuta, trechos citados): papel `#FCFCFC`, tinta.
- Manifestação da IA: texto aberto sobre o grafite, quadrado de accent no rótulo, formação por palavras.
- Intervenção humana registrada: moldura de traço branco e selo "Humano"; aparece inteira, como registro.
- Rodapé permanente: "Reprodução de execução registrada". O recurso traz "Recurso fictício · linhas ilustrativas".

## Conteúdo (`dados.js`)

- Outputs de RATIO e TROIA: os da jornada do caso 0012345 (25/11/2026; execução `EXE-20261125T1346140300-rodar-3b68957a`, contrato r3), preservados e só reorganizados (posições, matriz, rotas, conferência, adjudicação por julgador).
- RATIO trabalha sobre o documento pseudonimizado: as posições das partes aparecem como `PARTE_01` e `CPARTE_PJ_01`.
- RI_04: as três rotas ficam visíveis; a escolhida é marcada como deliberação humana registrada, com a nota de que não é a única decisão juridicamente admissível. Não há resposta certa ou errada.
- TROIA: em cada lente, a tese contraposta se forma, o trecho da minuta confrontado aparece (e é marcado na minuta ao lado), os dois julgadores automatizados votam em alternância, rodada a rodada, e o estado (resiste ou instável) é selado. A distinção contrariar ≠ auditar fecha o capítulo.
- Taxonomia: Christian da Costa → `PARTE_01`; Banco ECHO → `CPARTE_PJ_01`; CPF → `CPF_01`; endereço → `END_01`; CNPJ → `CNPJ_01`; conta → `CONTA_01`; telefone → `TEL_01`. Todos os valores são fictícios.
- O cofre representa a custódia das correspondências e a pasta de backend, a segregação. Não há imagem de cadeado nem menção a criptografia.
- Recurso e minuta ficam em português também na versão inglesa (`lang="pt-BR"`), como peças do processo.

## Pendente

- Wireframes próprios de TROIA e CERNE. A TROIA atual segue a direção do handoff (alternância, divergência, estabilidade, encaminhamento) e pode ser refeita sem mexer no motor: basta trocar `montaTroia` e os passos de `passosTroia`.
- CERNE permanece autônomo. No fim da reprodução, a nota explicita que a demonstração do CERNE examina atos reais, não este caso.
