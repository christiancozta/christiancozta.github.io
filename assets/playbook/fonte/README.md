# Playbook de Elaboração de Votos | fonte canônica

Esta pasta guarda a fonte do Playbook. A página publicada (`/playbook.html`) e os arquivos
`assets/playbook/playbook.css`, `playbook.js` e `playbook-dados.js` são gerados a partir dela
e não devem ser editados à mão.

## Estrutura

| Pasta | Conteúdo |
| --- | --- |
| `componentes/` | Textos dos componentes (Guia de Estilo, Regras de Aplicação, Critérios Operacionais, Índice e Arquitetura, Memória de Integração, textos de apoio de Templates, Calendário, Fundamentos e Ementário), em HTML com as classes do sistema visual |
| `dados/` | Bases do Toolkit em TXT: Calendário Jurídico, Fundamentos, Ementário e Templates |
| `build/css/` | Sistema visual: família (`familia.css`), componentes (`componentes.css`) e interface (`interface.css`) |
| `build/interface.js` | Navegação, busca, Calendário, montador de Templates, Fundamentos e Ementário |
| `build/pagina.html` | Estrutura da página |
| `build/build.py` | Monta a página a partir das pastas acima |

Os PDFs ficam em `assets/playbook/anexos/` (componentes do Playbook) e `assets/playbook/manuais/` (volumes da coleção).

## Gerar a página

Na raiz do repositório:

```
python3 assets/playbook/fonte/build/build.py
```

O script não tem dependências além do Python 3.

## Paleta

`#181818` tinta, `#C84D00` acento, `#FFB627` apoio, `#FCFCFC` papel. Tints e cinzas são misturas dessas cores com o papel.
