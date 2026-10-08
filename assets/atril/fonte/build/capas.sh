#!/bin/sh
# Gera as capas do teclado (primeira página de cada PDF) em assets/atril/capas/.
# Origem de cada imagem: a página 1 do próprio PDF publicado, sem edição.
# Requer poppler-utils (pdftoppm) e ffmpeg. Uso, na raiz do repositório:
#   sh assets/atril/fonte/build/capas.sh
set -e
A=assets/atril
mkdir -p "$A/capas"
T=$(mktemp -d)
gera() { # $1 = id, $2 = pdf relativo a assets/atril
  pdftoppm -f 1 -l 1 -singlefile -scale-to-x 560 -scale-to-y -1 -png "$A/$2" "$T/$1"
  ffmpeg -loglevel error -y -i "$T/$1.png" -q:v 3 \
    -metadata comment="Origem: pagina 1 de $A/$2 (ATRIL), sem edicao" "$A/capas/$1.jpg"
  E=.github/skills/impeccable/scripts/embed-prompt.mjs
  [ ! -f "$E" ] || node "$E" "$A/capas/$1.jpg" --prompt "Origem: página 1 de $A/$2, renderizada por pdftoppm a 560 px de largura (capas.sh). Imagem do próprio PDF publicado, sem edição; não é imagem gerada."
}
gera vol-01 manuais/1-notas-introdutorias.pdf
gera vol-02 manuais/2-mapa-tematico.pdf
gera vol-03 manuais/3-afinacao-processual.pdf
gera vol-04 manuais/4-guia-estilo.pdf
gera pdf-regras anexos/regras-de-aplicacao.pdf
gera pdf-criterios anexos/criterios-operacionais.pdf
gera pdf-indice anexos/indice-e-arquitetura.pdf
gera pdf-memoria anexos/memoria-de-integracao.pdf
gera pdf-templates anexos/templates.pdf
rm -rf "$T"
