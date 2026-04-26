# CHANGELOG

Sistema de Apoio à Elaboração de Votos — Turmas Recursais (RI/ED)  
Autor: Christian — OAB-PR 89.297

## Versionamento

Modelo em dois níveis: `major.minor`.

- `Major`: mudança estrutural que altera comportamento do sistema, arquitetura ou modo de uso.
- `Minor`: ajuste, correção ou refinamento sem impacto operacional estrutural.

---

## v8.0 — Estruturação dos templates como fonte autorizada

Criação do arquivo `templates_voto` como fonte autorizada distinta, contendo as estruturas posicionais dos votos, incluindo RI conhecido, RI não conhecido, ED rejeição, ED acolhimento, modo conjunto e demais variantes.

Refatoração dos templates para formato posicional com marcadores uniformizados:

- `[SE ...][/SE]` para blocos condicionais;
- `{conteúdo}` para lacunas;
- `{opção A | opção B}` para escolhas.

Reescrita da Fase 6 para consulta obrigatória em dois arquivos distintos, com prioridade explícita da estrutura sobre o estilo.

Supressão do changelog do corpo do prompt, que passa a ser mantido em arquivo separado.
