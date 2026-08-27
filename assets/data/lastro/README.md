# DATA | lastro público

Este diretório reúne derivados públicos mínimos das fontes usadas nas métricas de ATRIO e ECHO. Os arquivos originais não foram copiados.

## Arquivos

- `ementario_publico.xlsx`: 2.758 ementas; somente estrutura de classificação.
- `acervo_publico.xlsx`: 1.192 registros; somente ID sequencial, classe, agrupador e núcleo.
- `precedentes_publico.xlsx`: 631 temas; somente dimensões categóricas, códigos de assunto e presença de tese.
- `mapa_tematico_publico.pdf`: síntese do indicador de 90,2% e da estrutura operacional.
- `diagnostico_corpus_publico.md`: síntese do total de 115.114 registros únicos.
- `operacao_atrio_publica.md`: síntese de rotas, operações HTTP, testes, eixos e módulos.

## Métricas reproduzidas

| Métrica | Natureza | Lastro público |
|---|---|---|
| 2.758 ementas catalogadas | direta | `ementario_publico.xlsx` |
| 1.192 registros triados | direta | `acervo_publico.xlsx` |
| 90,2% de redução categorial | derivada | `mapa_tematico_publico.pdf` |
| 631 temas catalogados | direta | `precedentes_publico.xlsx` |
| 483 temas com tese firmada | direta | `precedentes_publico.xlsx` |
| 76,5% com tese firmada | derivada | `precedentes_publico.xlsx` |
| 245 códigos, 9 matérias, 3 ramos e 10 situações | direta | `precedentes_publico.xlsx` |
| 115.114 registros únicos | direta | `diagnostico_corpus_publico.md` |
| 31 caminhos, 33 operações e 188 testes | direta | `operacao_atrio_publica.md` |

## Exclusões de privacidade

Foram excluídos nomes, iniciais de pessoas, números de processo, origens processuais, textos integrais, análises, observações, referências internas, credenciais e caminhos de infraestrutura.
