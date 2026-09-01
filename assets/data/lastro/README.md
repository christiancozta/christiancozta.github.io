# DATA | lastro público

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
