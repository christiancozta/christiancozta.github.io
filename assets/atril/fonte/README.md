# ÁTRIL | fonte canônica

O ÁTRIL é a página que publica o Playbook de Elaboração de Votos (anexo ao Volume 04 da coleção da Turma Recursal do TJPR). A página é uma partitura de regência: cada material é uma pauta, agrupada em naipes (Coleção, Governança, Ferramenta), e os compassos são a ordem de utilização das Regras de Aplicação. Clicar numa pauta abre o material num painel sobre a partitura; "abrir" leva ao PDF. Índice e Arquitetura e Memória de Integração ficam fora do sistema, como anotações na folha de rosto. Templates abre em tela inteira.

Esta pasta guarda a fonte do ÁTRIL. A página publicada (`/atril.html`) e os arquivos
`assets/atril/atril.css`, `atril.js` e `atril-dados.js` são gerados a partir dela
e não devem ser editados à mão.

## Estrutura

| Pasta ou arquivo | Conteúdo |
| --- | --- |
| `componentes/` | Textos dos componentes (Guia de Estilo, Regras de Aplicação, Critérios Operacionais, Índice e Arquitetura, Memória de Integração, textos de apoio de Templates, Calendário, Fundamentos e Ementário), em HTML com as classes do sistema editorial da coleção |
| `dados/` | Bases do Toolkit em TXT (Calendário Jurídico, Fundamentos, Ementário e Templates) e `materiais.json`, que define os materiais: documentos, manuais e anexos em PDF, com páginas e capas |
| `build/css/` | Sistema editorial da coleção (`familia.css`, `componentes.css`) e camada web do ÁTRIL (`interface.css`) |
| `build/interface.js` | Partitura, painel de leitura, roteamento, ferramentas, montador de Templates e busca |
| `build/pagina.html` | Estrutura da página; o comentário no topo do `<body>` é o contrato de direção visual |
| `build/build.py` | Monta a página a partir das pastas acima |
| `build/capas.sh` | Gera as capas das fichas de PDF em `assets/atril/capas/` a partir da página 1 de cada PDF |
| `PRODUCT.md` | Registro do produto: público, propósito, restrições e compromissos de marca |

Os PDFs ficam em `assets/atril/anexos/` (componentes do Playbook) e `assets/atril/manuais/` (volumes da coleção).

## Gerar a página

Na raiz do repositório:

```
python3 assets/atril/fonte/build/build.py
```

O script não tem dependências além do Python 3. Se um PDF mudar, regenere as capas antes (requer `pdftoppm` e `ffmpeg`):

```
sh assets/atril/fonte/build/capas.sh
```

## Paleta

`#181818` tinta, `#FCFCFC` papel, `#FFB627` âmbar (a luz: marca-texto, batuta, compasso em foco) e `#8A6620` latão (âmbar com tinta: códigos, numerais e links). O laranja `#C84D00` fica na coleção impressa. Tints e cinzas são misturas dessas cores com o papel.

Na partitura, o compasso sob o cursor acende em âmbar e o resto esmaece; o nome do material aberto ganha o marca-texto âmbar. O sistema visual completo está em `DESIGN.md`.
