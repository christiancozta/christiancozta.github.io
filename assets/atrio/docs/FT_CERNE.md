# CERNE: ficha técnica

(A) dado bruto conferido; (B) declarado pelo autor.

| **Função** | Audita o raciocínio de atos judiciais e devolve perguntas presas a trechos, sem julgar o ato. | **Versão** | 5.1.0. Data: [NÃO LOCALIZADO]. |
|---|---|---|---|
| **Entrada** | Decisão liminar, sentença, voto ou acórdão, de 40 a 250.000 caracteres. | **Saída** | Perguntas por trecho e relatório técnico. Cada dúvida termina como ACHADO ou AFASTADO. Rodada média de 12,2 min (A). |
| **Arquitetura** | Formação das dúvidas → confronto independente → consolidação em perguntas. | **Governança** | 8 hard stops. Falha encerra a rodada sem relatório parcial. A decisão sobre o ato é humana. |
| **Privacidade** | Sem proteção própria. Uso restrito, por regra de operação, a atos públicos ou fictícios. | **Testes** | 110 no código (A). Resultado de execução não salvo. |
| **Stack** | Python, FastAPI e SQLite. | **IA utilizada** | Modelos externos por API: Gemini, OpenAI, OpenRouter, Groq, Mistral e ExpLabs, com opção de famílias distintas entre os lados do confronto. |

*Autoria.* Arquitetura, regras jurídicas, metodologia e critérios de governança: Christian da Costa. Implementação de código (API e scripts): produzida com apoio intensivo de ferramentas de IA, sob especificação e revisão do autor.
