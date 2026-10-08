# ATRIL | fonte canônica

O ATRIL é a página que publica o Playbook de Elaboração de Votos (anexo ao Volume 04 da coleção da Turma Recursal do TJPR). A página é uma estante de partitura: o material escolhido aparece numa folha branca sobre o corpo preto do instrumento, e a escolha se faz num teclado (teclas brancas para documentos e manuais, pretas para anexos em PDF). Calendário, Fundamentos e Ementário ficam numa segunda folha, ao lado; Templates abre em tela inteira.

Esta pasta guarda a fonte do ATRIL. A página publicada (`/atril.html`) e os arquivos
`assets/atril/atril.css`, `atril.js` e `atril-dados.js` são gerados a partir dela
e não devem ser editados à mão.

## Estrutura

| Pasta ou arquivo | Conteúdo |
| --- | --- |
| `componentes/` | Textos dos componentes (Guia de Estilo, Regras de Aplicação, Critérios Operacionais, Índice e Arquitetura, Memória de Integração, textos de apoio de Templates, Calendário, Fundamentos e Ementário), em HTML com as classes do sistema editorial da coleção |
| `dados/` | Bases do Toolkit em TXT (Calendário Jurídico, Fundamentos, Ementário e Templates) e `materiais.json`, que define o teclado: ordem das brancas, posição das pretas, páginas e capas |
| `build/css/` | Sistema editorial da coleção (`familia.css`, `componentes.css`) e camada web do ATRIL (`interface.css`) |
| `build/interface.js` | Teclado, folha, roteamento, ferramentas, montador de Templates e busca |
| `build/pagina.html` | Estrutura da página; o comentário no topo do `<body>` é o contrato de direção visual |
| `build/build.py` | Monta a página a partir das pastas acima |
| `build/capas.sh` | Gera as capas do teclado em `assets/atril/capas/` a partir da página 1 de cada PDF |
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

`#181818` tinta, `#C84D00` acento, `#FFB627` apoio, `#FCFCFC` papel. Tints e cinzas são misturas dessas cores com o papel.

No teclado, a tecla sob o cursor afunda e acende em `#FFB627`; a tecla cujo material está na folha fica afundada em `#C84D00`.
