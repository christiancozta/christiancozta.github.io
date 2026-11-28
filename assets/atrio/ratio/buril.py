"""Relógio do RATIO: mesma gravura, buril mais pesado.

Não redesenha o relógio: engrossa as linhas que já existem (dilatação da
tinta), com mais peso onde a luz não chega (base, lado direito, metade de
baixo dos aros). Passo e fase das linhas ficam intactos, sem moiré.

Uso: python3 buril.py <dir_fonte> <dir_saida>

A fonte são as versões leves de relogio-corpo.webp e relogio-botao.webp,
anteriores a 28/11/2026 (no git, commit c3a0abf). Não rodar sobre a saída:
o buril engrossaria duas vezes.
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

SRC, OUT = sys.argv[1], sys.argv[2]
INK = np.array([44, 44, 44], float)
PAPER = np.array([252, 252, 252], float)


def disk(r):
    y, x = np.mgrid[-r:r + 1, -r:r + 1]
    return (x * x + y * y) <= r * r + .5


def burin(ink, mass):
    """ink: 0..1 (1 = tinta). mass: 0..1, quanto engrossar.
    0 -> traço original; .5 -> +1 px; 1 -> +2 px de cada lado."""
    d1 = ndi.grey_dilation(ink, footprint=disk(1))
    d2 = ndi.grey_dilation(ink, footprint=disk(2))
    m = np.clip(mass, 0, 1)
    a = np.clip(m * 2, 0, 1)
    b = np.clip(m * 2 - 1, 0, 1)
    out = ink + (d1 - ink) * a
    out = out + (d2 - out) * b
    return out


def to_rgba(ink, alpha):
    rgb = PAPER[None, None] * (1 - ink[..., None]) + INK[None, None] * ink[..., None]
    return Image.fromarray(np.dstack([rgb, alpha * 255]).round().astype(np.uint8), "RGBA")


def load(path):
    a = np.array(Image.open(path).convert("RGBA")).astype(float)
    alpha = a[..., 3] / 255
    lum = a[..., :3].mean(-1) / 255
    ink = np.clip((1 - lum) * 1.06, 0, 1) * (alpha > 0)
    return ink, alpha


# ---------- corpo ----------
ink, alpha = load(f"{SRC}/relogio-corpo.webp")
H, W = ink.shape
y, x = np.mgrid[0:H, 0:W].astype(float)

# luz do alto à esquerda: mais tinta embaixo e à direita
mass = .34 + .30 * (y - 127) / (H - 127) + .12 * (x / W)

for cx in (399.0, 975.0):
    r = np.hypot(x - cx, y - 514.0)
    ang = np.arctan2(y - 514.0, x - cx)          # 0 à direita, +pi/2 embaixo
    lado = .5 + .5 * np.sin(ang + np.pi / 4)     # 1 no canto inferior direito
    # mostrador e trilho de minutos: intactos (o texto do visor fica limpo)
    mass[r < 214] = 0
    # aro: volume pela luz
    aro = (r >= 214) & (r < 262)
    mass[aro] = (.18 + .62 * lado)[aro]

# botões de rebite ao centro e parafusos: preservam o desenho fino
for cx, cy, rr in ((688, 320, 70), (688, 708, 74)):
    r = np.hypot(x - cx, y - cy)
    mass[r < rr] *= .45
for cx, cy in ((188, 268), (1188, 268), (188, 770), (1188, 770)):
    mass[np.hypot(x - cx, y - cy) < 26] = .1

mass = ndi.gaussian_filter(mass, 3)
heavy = burin(ink, mass)

# massa: um véu de linhas finas sobre a base e as laterais, no passo da
# gravura (5,4 px), para o corpo pesar sem virar chapa
plinto = (y > 800) & (alpha > .5)
veu = np.zeros_like(ink)
fase = (y % 5.4) / 5.4
veu[plinto] = (np.abs(fase - .5) < .16)[plinto] * .55 * np.clip((y[plinto] - 800) / 170, 0, 1)
heavy = np.maximum(heavy, veu)

to_rgba(np.clip(heavy, 0, 1), alpha).save(f"{OUT}/relogio-corpo.webp", "WEBP", quality=88, method=6)

# ---------- botão ----------
ink, alpha = load(f"{SRC}/relogio-botao.webp")
h, w = ink.shape
y, x = np.mgrid[0:h, 0:w].astype(float)
mass = .30 + .35 * (x / w) + .2 * (y / h)
heavy = burin(ink, ndi.gaussian_filter(mass, 2))
to_rgba(np.clip(heavy, 0, 1), alpha).save(f"{OUT}/relogio-botao.webp", "WEBP", quality=90, method=6)
print("ok", W, H, w, h)
