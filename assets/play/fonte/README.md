# PLAY | fonte canônica

O PLAY é a página que publica o Playbook de Elaboração de Votos (anexo ao Volume 04 da coleção da Turma Recursal do TJPR). A página é uma partitura de regência numa folha sobre base de tinta: cada material é uma pauta, agrupada em naipes (Coleção, Governança, Ferramenta), e os compassos são a ordem de utilização das Regras de Aplicação. Os volumes 01 a 03 abrem numa gaveta sob a própria pauta, com a página dupla; os demais materiais abrem num painel sobre a partitura. "ver" abre o PDF no leitor da própria página e "baixar" baixa o arquivo. Templates abre em tela inteira.

Esta pasta guarda a fonte do PLAY. A página publicada (`/play.html`) e os arquivos
`assets/play/play.css`, `play.js`, `play-dados.js`, `play-fundamentos.js` e
`play-ementario.js` são gerados a partir dela e não devem ser editados à mão. As duas
últimas bases são injetadas pelo `play.js` só quando a ferramenta é aberta.

## Estrutura

| Pasta ou arquivo | Conteúdo |
| --- | --- |
| `componentes/` | Textos dos componentes (Guia de Estilo, Regras de Aplicação, Critérios Operacionais, Índice e Arquitetura, Memória de Integração, textos de apoio de Templates, Calendário, Fundamentos e Ementário), em HTML com as classes do sistema editorial da coleção |
| `dados/` | Bases do Toolkit em TXT (Calendário Jurídico, Fundamentos, Ementário e Templates) e `materiais.json`, que define os materiais: documentos, manuais e anexos em PDF, com páginas e capas |
| `build/css/` | Sistema editorial da coleção (`familia.css`, `componentes.css`) e camada web do PLAY (`interface.css`) |
| `build/interface.js` | Partitura, painel de leitura, roteamento, ferramentas, montador de Templates e busca |
| `build/pagina.html` | Estrutura da página; o comentário no topo do `<body>` é o contrato de direção visual |
| `build/build.py` | Monta a página a partir das pastas acima |
| `build/capas.sh` | Gera as capas das fichas de PDF em `assets/play/capas/` (página 1 de cada PDF) e as páginas da gaveta dos volumes 01 a 03 em `assets/play/folhas/` (páginas 1 e 2) |
| `PRODUCT.md` | Registro do produto: público, propósito, restrições e compromissos de marca |

Os PDFs ficam em `assets/play/anexos/` (componentes do Playbook) e `assets/play/manuais/` (volumes da coleção).

## Gerar a página

Na raiz do repositório:

```
python3 assets/play/fonte/build/build.py
```

O script não tem dependências além do Python 3. Se um PDF mudar, regenere as capas antes (requer `pdftoppm` e `ffmpeg`):

```
sh assets/play/fonte/build/capas.sh
```

## Paleta

`#181818` tinta, `#FCFCFC` papel, `#FFB627` âmbar (a luz: marca-texto, batuta, compasso em foco) e `#8A6620` latão (âmbar com tinta: códigos, numerais e links). O laranja `#C84D00` fica na coleção impressa. Tints e cinzas são misturas dessas cores com o papel.

Na partitura, o compasso sob o cursor acende em âmbar e o resto esmaece; o nome do material aberto ganha o marca-texto âmbar. O sistema visual completo está em `DESIGN.md`.
