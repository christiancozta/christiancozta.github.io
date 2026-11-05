# CORPUS: ficha técnica

(A) dado bruto conferido; (B) declarado pelo autor.

| **Função** | Pseudonimiza documentos jurídicos na entrada e guarda base, original e cofre em separado. | **Versão** | 1.5.0. Data: [NÃO LOCALIZADO]. |
|---|---|---|---|
| **Entrada** | PDF ou TXT, com OCR local para documento escaneado. | **Saída** | Texto pseudonimizado, inventário e log. Base atual: 115.114 julgados (A). |
| **Arquitetura** | Hash e deduplicação → extração ou OCR → triagem de segredo → pseudonimização → cofre → inventário. | **Governança** | 6 interrupções: duplicado, texto insuficiente, erro de extração, erro de OCR, OCR abaixo do mínimo e segredo de justiça. Revisão humana do segredo e da reidentificação. |
| **Privacidade** | Pseudonimização reversível. A reidentificação só é possível pelo cofre. | **Testes** | 37 no código (A): 26 na API e 11 na biblioteca de detecção. Resultado de execução não salvo. |
| **Stack** | Python, OCR local (Tesseract) e cofre cifrado. | **IA utilizada** | Nenhum modelo generativo no fluxo. Detecção por regras, com reconhecimento de nomes opcional (spaCy). |

*Autoria.* Arquitetura, regras jurídicas, metodologia e critérios de governança: Christian da Costa. Implementação de código (API e scripts): produzida com apoio intensivo de ferramentas de IA, sob especificação e revisão do autor.
