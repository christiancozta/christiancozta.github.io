# RATIO: ficha técnica

(A) dado bruto conferido; (B) declarado pelo autor.

| **Função** | Elabora a minuta em fases, uma via processual por vez, e só avança com escolha humana registrada. | **Versão** | 8.0.0. Data: 28/09/2026. |
|---|---|---|---|
| **Entrada** | Peça, autos e via declarada pelo operador: recurso inominado, embargos de declaração ou mandado de segurança. | **Saída** | Minuta rastreável, estado do caso e pendências nomeadas. Cada fase fica validada, bloqueada ou invalidada. |
| **Arquitetura** | 3 vias e 18 fases: 6 no recurso inominado, 5 nos embargos e 7 no mandado de segurança. | **Governança** | 8 gates, 18 hard stops mínimos e 9 pontos de validação humana, da escolha da via à liberação. |
| **Privacidade** | Não trata dados pessoais. No fluxo integrado, recebe o material já pseudonimizado pelo CORPUS. | **Testes** | 72 no código (A). Resultado de execução não salvo. |
| **Stack** | Camada crítica de instruções e arquivos de conhecimento. Na API, Python. | **IA utilizada** | Claude Projects e GPT personalizado. Na API, inferência local com Ollama. |

*Autoria.* Arquitetura, regras jurídicas, metodologia e critérios de governança: Christian da Costa. Implementação de código (API e scripts): produzida com apoio intensivo de ferramentas de IA, sob especificação e revisão do autor.
