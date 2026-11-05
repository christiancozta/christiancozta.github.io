# ATRIO: ficha técnica

(A) dado bruto conferido; (B) declarado pelo autor.

| **Função** | Encadeia CORPUS, RATIO, CERNE e LUX numa execução registrada e só libera a peça com decisão humana identificada. | **Versão** | API 0.7.0. Data: [NÃO LOCALIZADO]. |
|---|---|---|---|
| **Entrada** | Documentos (TXT, DOCX ou PDF) e destino declarado (interno, externo ou público). | **Saída** | Peça liberada, com trilha de eventos e versões por execução. |
| **Arquitetura** | CORPUS → RATIO → CERNE → LUX → conferência final → liberação. 31 rotas e 33 operações HTTP (A). | **Governança** | 3 paradas para decisão humana e 3 estados de bloqueio. Comando fora de ordem é recusado em código. |
| **Privacidade** | Pseudonimização reversível na entrada, com cofre AES-256-GCM. Anonimização irreversível na saída pública. | **Testes** | 188 aprovados em 26/08/2026 (B). |
| **Stack** | Python, FastAPI, PostgreSQL, Docker e OpenAPI 3.1. | **IA utilizada** | Inferência local com Ollama. Código desenvolvido com Claude Code e Codex. |

*Autoria.* Arquitetura, regras jurídicas, metodologia e critérios de governança: Christian da Costa. Implementação de código (API e scripts): produzida com apoio intensivo de ferramentas de IA, sob especificação e revisão do autor.
