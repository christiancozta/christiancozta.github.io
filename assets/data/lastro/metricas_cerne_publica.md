# CERNE 5.0 ▪ métricas de rodada ▪ lastro público

Christian da Costa ▪ extração de 21.10.2026 ▪ derivado: `cerne_rodadas_derivada.csv`

Este documento sustenta os números do CERNE publicados no DATA, no CV e na página de demonstração. Cada número abaixo se recalcula a partir do derivado público. O banco de rodadas, os prompts e a arquitetura das lentes ficam reservados; o derivado traz apenas contagens por ato.

## 1. Fonte e recorte

| | |
|---|---|
| Fonte | Banco de rodadas do CERNE 5.0 (`cerne5.sqlite3`), eventos com carimbo de tempo gravados pelo próprio sistema durante cada rodada |
| Recorte | As 17 rodadas reproduzidas na demonstração pública, uma por ato: 12 do TJPR (2ª Turma Recursal) e 5 do STJ |
| Janela | 12.10.2026 a 19.10.2026 |
| Versão | CERNE 5.0.0, cânone congelado, um único plano de modelos em todo o recorte |
| Seleção | Lote único de 18 pares de embargos de declaração acolhidos. Um par (S04) ficou fora do teste antes de rodar e não tem rodada. Seleção exploratória, não amostra aleatória |
| Hash do banco na extração | `f55d94e11d20b7c18a9fbaf8830c50ea32fecdcc83bd1a10e29aa44c8a3477ef` |
| Hash do extrato de eventos das 17 rodadas | `175991cfd361f176350927419ade501556ac320932f07df875fb1034630654e8` |
| Hash do derivado | `fe95613bcdd0bf4488edf8bd1ccce53ba1acd3ac632a4202311e21f286cce02e` |

## 2. Definições

- **Rodada**: execução completa do CERNE sobre um ato, da entrada do texto à entrega das perguntas.
- **Tempo de rodada**: instante do evento `RODADA_CONCLUIDA` menos o de `RODADA_INICIADA`. Tempo de relógio da máquina, não tempo de trabalho humano.
- **Dúvida formada**: candidata a pergunta que uma lente apontou num trecho do ato.
- **Crivo por dúvida**: intervalo entre o início do crivo de uma dúvida e o registro da decisão sobre ela.
- **Estados**: ABORT (se a dúvida proceder, a conclusão central não se sustenta sem enfrentá-la), HOLD (a dúvida permanece, sem demonstração de que a conclusão dependa dela), afastada (a contraposição a afastou).
- **Pergunta**: o que chega a quem responde pelo ato. Dúvidas mantidas sobre o mesmo ponto se consolidam numa só pergunta.
- **Cobertura**: parágrafos do ato com ao menos uma pergunta, divididos pelo total de parágrafos.
- **Falha declarada**: rodada encerrada como falha técnica, sem relatório parcial.

## 3. Resultados

### Tempo

| Medida | Valor |
|---|---|
| Mediana por ato | **11,1 min** |
| Média por ato | 12,2 min (erro padrão 1,26 min) |
| Intervalo interquartil | 8,7 a 13,8 min |
| Mínimo e máximo | 5,5 e 23,9 min |
| Crivo por dúvida | média de 37,6 s, mediana de 35,3 s, sobre 218 dúvidas |

O tempo acompanha o número de dúvidas formadas (correlação de 0,85), não a extensão do ato (0,06). Atos do STJ, duas a quatro vezes mais longos, rodaram no mesmo tempo dos atos do TJPR. O tempo mede o custo do contraditório: cada dúvida é sustentada, contestada e decidida antes de virar pergunta.

### Funil

| Etapa | Total |
|---|---|
| Dúvidas formadas | 218 |
| Mantidas como ABORT | 138 (63,3%) |
| Mantidas como HOLD | 69 |
| Afastadas no crivo | 11 (5,0%) |
| Perguntas entregues | **67**, média de 3,9 por ato |

### Confiabilidade

| Medida | Valor |
|---|---|
| Atos concluídos na primeira tentativa | **15 de 17** |
| Rodadas iniciadas no lote | 22, com 18 concluídas e 4 falhas declaradas |
| Tentativas anteriores do P01 sob identificador provisório | 2, ambas falhas declaradas |
| Relatórios parciais entregues | nenhum |

Três das quatro falhas do lote foram de provedor: um modelo não respondeu no prazo de 120 s da chamada (P08 uma vez, S06 duas). A quarta foi o cancelamento de uma nova rodada do P01, posterior à rodada publicada. As duas tentativas provisórias do P01 falharam por erro de servidor do provedor. Toda rodada que falhou terminou declarada como falha, e nenhuma falha apareceu como ausência de dúvida.

### Validação e linha de base

| Medida | Valor |
|---|---|
| Atos no teste | 12 |
| Pergunta sobre o ponto que os embargos corrigiram | **7** |
| Pergunta sobre outro ponto, corroborado | 2 (S02, reconhecido pelo tribunal; S06, alegado pela parte) |
| Cobertura média das perguntas nos atos do teste | 17,9% dos parágrafos |
| Correspondências esperadas ao acaso | **2,1** |

A linha de base pergunta quantas correspondências haveria se as perguntas caíssem nos mesmos parágrafos sem relação com o vício. Ela soma, ato a ato, a fração de parágrafos cobertos. Com o vício num único parágrafo, o esperado é 2,1 correspondências, e a chance de chegar a 7 por acaso é de 0,1%. Se o vício ocupa dois parágrafos, o esperado sobe para 3,8 e a chance para 3,6%. Se ocupa três, para 5,0 e 16,5%: aí o resultado deixa de se distinguir do acaso. A linha de base é generosa com o acaso, porque basta à pergunta estar no parágrafo certo, enquanto a régua exige que ela trate do ponto corrigido.

### Por ato

| Ato | Tribunal | Régua | Min | Dúvidas | ABORT / HOLD / afastadas | Perguntas | Parágrafos com pergunta | Tentativas |
|---|---|---|---|---|---|---|---|---|
| P01 | TJPR | Correspondência | 23,2 | 14 | 4 / 10 / 0 | 4 | 2 de 6 | 3 |
| P02 | TJPR | Correspondência | 15,5 | 18 | 18 / 0 / 0 | 3 | 2 de 10 | 1 |
| P03 | TJPR | Correspondência | 23,9 | 32 | 26 / 6 / 0 | 9 | 7 de 21 | 1 |
| P04 | TJPR | Fora do teste | 9,1 | 11 | 9 / 1 / 1 | 2 | 2 de 6 | 1 |
| P05 | TJPR | Fora do teste | 12,1 | 14 | 12 / 2 / 0 | 5 | 4 de 7 | 1 |
| P06 | TJPR | Fora do teste | 17,9 | 24 | 19 / 5 / 0 | 7 | 5 de 12 | 1 |
| P07 | TJPR | Correspondência | 9,4 | 9 | 6 / 1 / 2 | 3 | 3 de 10 | 1 |
| P08 | TJPR | Não alcançado | 11,4 | 11 | 3 / 7 / 1 | 6 | 5 de 17 | 2 |
| P09 | TJPR | Fora do teste | 7,2 | 7 | 0 / 6 / 1 | 1 | 1 de 9 | 1 |
| P10 | TJPR | Fora do teste | 8,3 | 8 | 2 / 6 / 0 | 1 | 1 de 7 | 1 |
| P11 | TJPR | Não alcançado | 5,5 | 4 | 3 / 1 / 0 | 2 | 1 de 5 | 1 |
| P12 | TJPR | Correspondência | 11,6 | 13 | 10 / 3 / 0 | 4 | 3 de 22 | 1 |
| S01 | STJ | Correspondência | 11,7 | 10 | 8 / 1 / 1 | 3 | 3 de 55 | 1 |
| S02 | STJ | Não alcançado, com achado corroborado | 11,1 | 11 | 11 / 0 / 0 | 2 | 2 de 26 | 1 |
| S03 | STJ | Correspondência | 7,7 | 9 | 4 / 3 / 2 | 5 | 4 de 48 | 1 |
| S05 | STJ | Não alcançado | 10,9 | 11 | 2 / 8 / 1 | 6 | 6 de 72 | 1 |
| S06 | STJ | Não alcançado, com achado corroborado | 10,6 | 12 | 1 / 9 / 2 | 4 | 4 de 80 | 3 |

## 4. Limites de interpretação

- **Tempo de máquina não é tempo humano.** O número não inclui a leitura das perguntas por quem responde pelo ato, nem se compara ao tempo de uma revisão humana, que não foi medido.
- **O tempo depende da infraestrutura.** As chamadas correram em série e incluem espera em fila do provedor. Outra infraestrutura muda o número sem mudar o método.
- **Amostra pequena e selecionada.** São 17 rodadas, uma por ato. O desvio padrão de 5,0 min recomenda a mediana como número de referência.
- **Calibragem dos estados.** 63% das dúvidas saíram como ABORT, e só 5% foram afastadas. O desenho prefere perguntar a mais, mas a proporção pede exame do critério de ABORT e da força da contraposição. Os números se publicam com essa ressalva, não como medida de gravidade.
- **Conferência pelo autor.** A régua foi aplicada pelo autor do sistema, sem cegamento. A linha de base controla o acaso de localização, não o juízo de quem confere.
- **Sem medida de falso positivo.** Todos os atos do recorte tinham vício reconhecido em embargos. O recorte não mostra o comportamento do CERNE diante de atos sem vício, nem a utilidade das demais perguntas.
- **Validação não é taxa.** O 9 de 12 descreve esta seleção. Não é taxa de precisão, sensibilidade ou especificidade.

## 5. O que fica reservado e por quê

Ficam fora dos artefatos públicos o banco de rodadas, os prompts, a composição e a contagem das lentes, a distribuição de dúvidas por lente, a latência por função e os modelos de cada papel. Essas medidas descrevem a arquitetura do método, que é reservado. Estão disponíveis mediante pedido, para conferência técnica.

## 6. Como conferir

1. Conferir o hash do derivado: `sha256sum cerne_rodadas_derivada.csv` deve resultar em `fe95613bcdd0bf4488edf8bd1ccce53ba1acd3ac632a4202311e21f286cce02e`.
2. Mediana e média de `duracao_min`; soma de `duvidas_formadas`, `abort`, `hold`, `afastadas` e `perguntas`; contagem de `concluida_na_primeira`.
3. Crivo por dúvida: média de `crivo_medio_s` ponderada por `duvidas_formadas`.
4. Linha de base: soma de `cobertura` nas linhas cuja `classificacao_regua` não começa por "Fora".
5. Cada ato aponta para a página da demonstração, onde a rodada pode ser reproduzida passo a passo, com hash do texto examinado.
