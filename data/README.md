# DATA — Etapa 1

Estrutura publicada no `main`:

```text
/data.html
/data/bootstrap.js
/data/data.js
/support.js
```

`data.html` permanece na raiz. O JavaScript específico de DATA fica em `/data/`. `support.js` é o runtime compartilhado do Claude Design e não foi alterado.

## Arquitetura editorial

A página mantém somente quatro regiões estruturais:

`HERO → RASTRO → LASTRO → AUTORIA`

`MÉTODO E ROBUSTEZ` foi movido para o final de RASTRO, imediatamente antes da abertura de LASTRO, como bloco de transição, sem criar nova seção.

## Cards de evidência

Modelo único, sem `RASTRO DOCUMENTAL` / `RASTRO DERIVADO`.

- `FONTE` — RASTRO
- `CÁLCULO` — RASTRO
- `RECORTE` — RASTRO
- `FUNDAMENTO` — LASTRO
- `LIMITE` — LASTRO

Campos vazios são omitidos. A versão atual produz 14 cards de 3 informações e 6 cards de 4 informações.

Paleta por ocorrência:

- maioria, 3 informações: fundo `#181818`, conteúdo `#FCFCFC`, títulos/microtags/faixa superior `#2E71FF`;
- minoria, 4 informações: fundo `#2E71FF`, conteúdo `#FCFCFC`, títulos/microtags/faixa superior `#181818`.

A variante visual depende apenas da quantidade efetiva de informações exibidas, nunca da origem documental ou derivada do dado.

Interações preservadas: hover, foco por teclado, `Escape`, touch/pointer, reposicionamento no viewport e fechamento em scroll/resize.

## Observação

O HERO ainda referencia `assets/hero-astrolabio.png`. Esse asset não veio no bundle recebido e não está no repositório; o HTML possui fallback para ocultar a imagem sem exibir ícone quebrado. A inclusão do asset pode ser feita separadamente.
