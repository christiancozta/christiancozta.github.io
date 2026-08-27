# ATRIO | operação pública

## Indicadores auditados

| Indicador | Valor | Como se confere |
|---|---|---|
| Caminhos sob `/v1` | 31 | contagem das rotas declaradas em `src/atrio_api/api.py` |
| Operações HTTP | 33 | mesma contagem, somando os métodos de cada caminho |
| Testes aprovados | 188 | suíte local, medição de 26.08.2026 |
| Eixos analíticos | 11 | CERNE, exame adversarial do raciocínio |
| Fases nomeadas | 18 | RATIO: RI_01–06, ED_01–05, MS_01–07 |
| Módulos independentes | 4 | CORPUS, RATIO, CERNE, LUX |

Os 188 testes são os 175 da release anterior mais 13 do calendário processual,
ligado depois dela. O número não inflou: cresceu por adição nomeável.

## Método da contagem

Os caminhos e as operações são contados sobre a árvore de sintaxe de `api.py`,
não sobre um documento intermediário: percorrem-se os decoradores de rota da
aplicação e contam-se os caminhos distintos sob `/v1` e o total de métodos
declarados. A contagem é determinística e reproduzível por quem tiver o código.

Dois caminhos admitem GET e POST — `corpus/documents` e `cerne/audit` —, o que
explica a diferença entre 31 e 33. O contrato `openapi.json` publicado reflete a release anterior e será
reexportado na próxima; a referência corrente é o código.

## Leitura do contrato

O número exposto é 31, porque representa caminhos distintos sob `/v1`. O hover
informa 33, porque dois caminhos admitem mais de uma operação HTTP.

## Limite de interpretação

Rotas e testes demonstram superfície funcional e disciplina de verificação. Não equivalem, por si, a cobertura integral, segurança certificada ou desempenho em produção.

## Tratamento de privacidade

Este derivado não inclui payloads, documentos jurídicos, credenciais, endereços internos, logs ou exemplos associados a pessoas e processos.
