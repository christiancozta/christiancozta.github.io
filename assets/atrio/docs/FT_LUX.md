# LUX: ficha técnica

(A) dado bruto conferido; (B) declarado pelo autor.

| **Função** | Refina a forma de texto já decidido e protege dados conforme o destino, sem tocar no mérito. | **Versão** | 6.0.0. Data: [NÃO LOCALIZADO]. |
|---|---|---|---|
| **Entrada** | Texto jurídico pronto e destino declarado, que por padrão é público. | **Saída** | Texto marcado, lista de alterações e versão limpa. |
| **Arquitetura** | Proteção de dados → marcação dos trechos intocáveis → revisão → validação → entrega. | **Governança** | 12 hard stops. Diante deles, preserva o trecho original. Validação humana depois da entrega. |
| **Privacidade** | Modo público: anonimização irreversível. Modo interno: pseudonimização com códigos estáveis. | **Testes** | 11 no código (A). Resultado de execução não salvo. |
| **Stack** | Kernel de instruções e dois arquivos de conhecimento. Na API, Python com biblioteca própria de detecção de dados. | **IA utilizada** | GPT personalizado, Gemini Gem ou Claude Project. |

*Autoria.* Arquitetura, regras jurídicas, metodologia e critérios de governança: Christian da Costa. Implementação de código (API e scripts): produzida com apoio intensivo de ferramentas de IA, sob especificação e revisão do autor.
