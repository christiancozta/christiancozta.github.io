# Internacionalização do portfólio — PT-BR / EN

## Escopo
Páginas: `arco.html`, `echo.html`, `play.html`, `atrio.html`, `cerne.html`, `data.html`.

## Inventário inicial confirmado
- `en/arco.html`: tradução inglesa já existente; preservar como fonte editorial de referência.
- `assets/arco/js/arco-en.js`, `arco-runtime-en.js`, `arco-base-en-20260915.js`, `arco-final-en-20260915-v2.js`: scripts ingleses existentes; verificar diferenças funcionais antes de consolidar.
- `arco.html`: HTML principal em português, com componentes de navegação, conteúdo e fichas técnicas.
- `echo.html`, `play.html`, `atrio.html`, `cerne.html`, `data.html`: páginas em português; PLAY contém textos também gerados por `assets/play/play.js`.
- CERNE contém fontes embutidas em data URI; preservar bytes e evitar reescrita global do HTML.

## Contrato de implementação
1. Uma única fonte de estrutura, estilos e comportamento por página. Não manter HTML traduzido à mão.
2. Catálogos versionados PT-BR/EN por página; reutilizar o texto de `en/arco.html` sempre que corresponder à versão atual.
3. Incluir strings geradas por JavaScript, atributos de acessibilidade, metadados, links e elementos condicionais.
4. Gerar artefatos estáticos em `/en/<pagina>.html` a partir das mesmas fontes, sem depender de tradução em tempo de execução para indexação.
5. Manter URLs PT existentes; adicionar canonical e hreflang recíprocos e navegação PT/EN.
6. Links internos devem respeitar o idioma; recursos estáticos devem usar caminhos absolutos de raiz ou reescrita validada.
7. Testar paridade funcional, conteúdo, responsividade, âncoras, URLs, acessibilidade e regressões visuais.
8. Alterações de conteúdo PT sinalizam chaves EN desatualizadas; tradução automática é etapa opcional, dependente de credenciais e revisão editorial.
9. Não publicar na branch principal sem revisão e autorização posterior.

## Glossário editorial inicial
Preservar como nomes próprios: ARCO, ECHO, PLAY, ATRIO, CERNE, CORPUS, RATIO, LUX.
Tratar com revisão contextual: Governança do Raciocínio Jurídico; lastro; rastro; responsabilidade; auditoria; controle humano; método; operações jurídicas.

## Estado
Inventário e branch de isolamento criados. **A internacionalização das seis páginas ainda não foi implementada.**
