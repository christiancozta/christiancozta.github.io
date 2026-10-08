# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primeiro, visitantes do portfólio de Christian da Costa (christiancozta.github.io), que chegam ao ÁTRIL como demonstração de método em operações jurídicas. Em seguida, quem redige votos de RI e ED na Turma Recursal do TJPR e usa as ferramentas de verdade: calcular prazo, localizar fundamento, consultar ementa, montar minuta. Quando os dois públicos entram em conflito, a experiência de vitrine lidera, e as ferramentas continuam funcionando por inteiro.

## Product Purpose

O ÁTRIL publica o Playbook de Elaboração de Votos, anexo ao Volume 04 (Guia de Estilo) da coleção da Turma Recursal do TJPR. Reúne numa só página a governança (Guia de Estilo, Regras de Aplicação, Critérios Operacionais), o registro (Índice e Arquitetura, Memória de Integração), os manuais da coleção, os anexos em PDF e o toolkit (Templates, Calendário, Fundamentos, Ementário). A página localiza e calcula; não decide.

## Positioning

É uma página filha do ECHO (echo.html), o modelo operacional que converte resposta externa em processo documentado, papel definido, critério de controle e conhecimento reutilizável. O ÁTRIL é esse modelo aplicado a uma única produção, o voto: o conhecimento do gabinete posto à disposição de quem escreve, para que a coerência do colegiado não dependa de quem estiver na sala.

## Operating Context

- Leitura de documentos normativos internos longos, em português jurídico.
- Consulta pontual durante a redação: prazo em dias úteis (regime cível, base 2026, Curitiba, Decreto Judiciário nº 621/2025, art. 224 do CPC), fundamento por gatilho ou tema, ementa por assunto ou código.
- Montagem de minuta a partir de seis modelos (RI conhecido, RI não conhecido, ED rejeição, ED acolhimento, RI conjunto, ED não conhecido), com blocos condicionais e lacunas.
- Desktop é o cenário de trabalho; mobile precisa ser plenamente operável.

## Capabilities and Constraints

- Página estática publicada no GitHub Pages. Fonte canônica em `assets/atril/fonte/`; `atril.html`, `atril.css`, `atril.js` e `atril-dados.js` são gerados por `build/build.py` (Python 3, sem dependências) e não se editam à mão.
- Bases: 107 fundamentos, 2.758 registros do Ementário, 730 dias de calendário (2025 histórico, 2026 ativo), 6 modelos de Templates.
- Toda busca e cálculo roda no navegador, sem servidor.
- Rotas por hash (`#guia`, `#regras`, `#criterios`, `#templates`, `#calendario`, `#fundamentos`, `#ementario`, `#indice`, `#memoria`) e links profundos para seções e registros.
- O endereço antigo `playbook.html` foi retirado, sem redirecionamento.

## Brand Commitments

- Nome da página: ÁTRIL, com acento, por decisão do autor (08/10/2026); arquivo `atril.html`. Subtítulo: "Playbook de elaboração de votos"; os PDFs seguem intitulados "Playbook de Elaboração de Votos".
- Paleta fechada: #181818 tinta, #FFB627 apoio, #FCFCFC papel, #C84D00 acento. Na camada web, o âmbar é a luz única e o latão #8A6620 (âmbar com tinta) faz a marcação de texto; o #C84D00 fica na coleção impressa. Tints e cinzas só por mistura dessas cores com o papel.
- Zalando Sans Expanded é obrigatória na marca (é a face do wordmark do ECHO); outras famílias são permitidas. A camada web usa Bodoni Moda, Commissioner e Azeret Mono, as duas últimas herdadas do ECHO.
- Parentesco visível com o ECHO: a epígrafe "Harmonia é coordenação de diferenças", o marca-texto âmbar e a família tipográfica.

## Evidence on Hand

- Textos dos componentes: `assets/atril/fonte/componentes/*.html`.
- Bases do toolkit: `assets/atril/fonte/dados/*.txt`.
- Manuais da coleção (PDF): `assets/atril/manuais/` (01 Notas Introdutórias, 02 Mapa Temático, 03 Afinação Processual, 04 Guia de Estilo).
- Anexos (PDF): `assets/atril/anexos/` (Índice e Arquitetura, Memória de Integração, Regras de Aplicação, Templates, Critérios Operacionais).
- Página-mãe: `echo.html`.

## Product Principles

1. Localizar e calcular, nunca decidir: limites e requisitos ficam sempre visíveis junto do resultado.
2. A ferramenta acompanha a leitura: consultar prazo, fundamento ou ementa não pode tirar o leitor do lugar onde estava.
3. Montar uma peça é trabalho de foco e ganha a tela inteira.
4. Proveniência explícita: cada material diz de onde vem e em que formato está.

## Accessibility & Inclusion

Operável por teclado e leitor de tela, com alvos de toque adequados no mobile (nenhuma pauta, anotação ou comando sem área útil) e respeito a `prefers-reduced-motion`.
