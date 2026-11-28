"""Foróptero do CERNE, em gravura.

Mesmo buril do relógio do RATIO: linhas de largura variável no passo da
gravura do relógio (6,35 px nesta escala, que é o passo de 5,4 px do relógio
levado à proporção em que os dois aparelhos aparecem na página). O peso vem
da largura das linhas, não de chapa lisa: o aparelho continua massa, mas
lido como gravura. Peças em comum com o relógio: o botão de rebites (ao
centro, no lugar do play), os botões serrilhados (no alto das rodas) e o
trilho de minutos quadriculado em volta das janelas.

Geometria no sistema do viewBox antigo (720 x 380), renderizada a 3x.
Uso (na raiz do repositório):
  ESCALA=1.5 python3 assets/cerne/fonte/foroptero.py assets/atrio/ratio/relogio-corpo.webp assets/atrio/ratio/relogio-botao.webp assets/cerne/img/foroptero-1x.webp
  ESCALA=3   python3 assets/cerne/fonte/foroptero.py assets/atrio/ratio/relogio-corpo.webp assets/atrio/ratio/relogio-botao.webp assets/cerne/img/foroptero-2x.webp
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from scipy.spatial import cKDTree

CORPO, BOTAO, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
import os
S = float(os.environ.get("ESCALA", "3"))
W, H = int(720 * S), int(380 * S)
P = 6.35 * S / 3                # passo da linha, em px (6,35 a 3x)
INK = np.array([44, 44, 44], float)
BLUE = np.array([79, 107, 255], float)
PAPER = np.array([252, 252, 252], float)

y, x = np.mgrid[0:H, 0:W].astype(np.float32)
ink = np.zeros((H, W), np.float32)      # tinta 0..1
blue = np.zeros((H, W), np.float32)     # 1 onde a tinta é azul
occ = np.zeros((H, W), np.float32)      # silhueta (papel opaco)


def u(v):
    return v * S


def cov_disc(cx, cy, r):
    return np.clip(u(r) - np.hypot(x - u(cx), y - u(cy)) + .5, 0, 1)


def cov_ring(cx, cy, r1, r2):
    d = np.hypot(x - u(cx), y - u(cy))
    return np.clip(np.minimum(d - u(r1), u(r2) - d) + .5, 0, 1)


def cov_rrect(x0, y0, x1, y1, rr):
    cx, cy = u((x0 + x1) / 2), u((y0 + y1) / 2)
    hx, hy = u((x1 - x0) / 2) - u(rr), u((y1 - y0) / 2) - u(rr)
    qx, qy = np.abs(x - cx) - hx, np.abs(y - cy) - hy
    sd = np.hypot(np.maximum(qx, 0), np.maximum(qy, 0)) + np.minimum(np.maximum(qx, qy), 0) - u(rr)
    return np.clip(.5 - sd, 0, 1)


def hatch(phase, tone, pitch=P):
    """Linhas centradas em phase = k*pitch, meia-largura tone*pitch/2."""
    d = np.abs(((phase / pitch + .5) % 1) - .5) * pitch
    return np.clip(tone * pitch / 2 - d + .5, 0, 1)


def paint(c, e, is_blue=0.0):
    """Pintor: o elemento (cobertura c, tinta e) cobre o que estava embaixo."""
    global ink, blue, occ
    ink = ink * (1 - c) + e * c
    b = np.asarray(is_blue, np.float32)
    blue = blue * (1 - c) + b * c
    occ = np.maximum(occ, c)


def contour(c, width=1.6):
    """Contorno de buril em volta de uma cobertura."""
    edge = c - ndi.grey_erosion(c, size=max(3, int(width * S) | 1))
    return np.clip(edge * 1.4, 0, 1)


def shade(cx, cy):
    """0 no alto à esquerda (luz), 1 embaixo à direita."""
    th = np.arctan2(y - u(cy), x - u(cx))
    return .5 + .5 * np.sin(th + np.pi / 4)


# ---------- apoio de testa: arco e haste ----------
t = np.linspace(0, 1, 600)
bx = (1 - t) ** 2 * 296 + 2 * (1 - t) * t * 360 + t * t * 424
by = (1 - t) ** 2 * 50 + 2 * (1 - t) * t * 14 + t * t * 50
tree = cKDTree(np.c_[u(bx), u(by)])
box = (slice(0, int(u(62))), slice(int(u(280)), int(u(440))))
pts = np.c_[x[box].ravel(), y[box].ravel()]
dist, idx = tree.query(pts)
d = np.full((H, W), 1e4, np.float32)
d[box] = dist.reshape(x[box].shape)
c_arc = np.clip(u(6.5) - d + .5, 0, 1)
tone_arc = .62 + .3 * (d / u(6.5))
paint(c_arc, np.maximum(hatch(d, tone_arc, P * .9), contour(c_arc)))

# haste cilíndrica: linhas verticais, luz a 30% da largura
c_rod = cov_rrect(351, 34, 369, 178, 1.5)
fx = (x - u(351)) / u(18)
tone_rod = np.clip(.38 + .62 * np.abs(fx - .3) / .7, 0, .95)
e_rod = hatch(x - u(351), tone_rod, P * .8)
e_rod = np.maximum(e_rod, contour(c_rod))
paint(c_rod, e_rod)

# ---------- ponte entre as rodas: linhas horizontais, como a caixa do relógio ----------
c_br = cov_rrect(290, 160, 430, 240, 8)
tone_br = .55 + .32 * (y - u(160)) / u(80)
e_br = np.maximum(hatch(y, tone_br), contour(c_br))
# filete de luz no alto da ponte
e_br = np.where((y > u(163)) & (y < u(166.5)), e_br * .15, e_br)
paint(c_br, e_br)

# ---------- rodas ----------
APERT = [(190.0, 84.0), (248.0, 99.5), (290.5, 142.0), (306.0, 200.0), (290.5, 258.0), (248.0, 300.5),
         (190.0, 316.0), (132.0, 300.5), (89.5, 258.0), (74.0, 200.0), (89.5, 142.0), (132.0, 99.5)]

for cx, cy, lado in ((190, 200, "e"), (530, 200, "d")):
    r = np.hypot(x - u(cx), y - u(cy))
    th = np.arctan2(y - u(cy), x - u(cx))
    sh = shade(cx, cy)

    # corpo da roda: linhas concêntricas, peso pela luz; cruzamento radial na sombra
    c_body = cov_disc(cx, cy, 150)
    tone = .64 + .30 * sh
    e = hatch(r, tone, P * 1.5)
    cross = np.clip((sh - .62) / .38, 0, 1) * .55
    e = np.maximum(e, hatch(th * u(122), cross, P * 1.5))
    paint(c_body, e)

    # serrilha da borda (moeda): traços radiais curtos
    c_kn = cov_ring(cx, cy, 141, 150)
    e_kn = hatch(th * u(146), .55 + .35 * sh, P * .95)
    e_kn = np.maximum(e_kn, hatch(r, .25, P))
    paint(c_kn, e_kn)
    # fio de luz entre a serrilha e o corpo
    paint(cov_ring(cx, cy, 139.6, 140.8), np.zeros_like(ink))

    # canal polido em volta da janela: claro, linhas finas
    c_ch = cov_ring(cx, cy, 93, 101)
    paint(c_ch, hatch(r, .12 + .38 * sh, P * .7))
    paint(cov_ring(cx, cy, 100.6, 102), np.ones_like(ink) * .95)

    # trilho de minutos quadriculado, o mesmo do relógio
    c_tr = cov_ring(cx, cy, 86, 93)
    k = ((th + np.pi) / (2 * np.pi) * 60) % 1
    mark = np.where(np.abs(k - .5) < .5 - .18, 0., 1.)       # separadores
    five = (((th + np.pi) / (2 * np.pi) * 12) % 1)
    mark = np.maximum(mark, np.where(np.abs(five - .5) > .5 - .045, 1., 0.))
    ring_lines = np.maximum(cov_ring(cx, cy, 86, 87.2), cov_ring(cx, cy, 91.8, 93))
    paint(c_tr, np.maximum(mark, ring_lines))

    # janela: papel (à esquerda) ou azul liso (à direita, a pele da esfinge, sob o olho)
    c_win = cov_disc(cx, cy, 86)
    if lado == "e":
        paint(c_win, np.zeros_like(ink))
    else:
        paint(c_win, np.ones_like(ink), 1.0)   # azul liso: a pele da esfinge, como no ícone do CERNE

    # contorno externo
    paint(contour(c_body, 2.2), np.ones_like(ink))

# lentes da roda esquerda: furos de vidro escuro com reflexo em crescente
for ax, ay in APERT:
    c_h = cov_disc(ax, ay, 11)
    rr = np.hypot(x - u(ax), y - u(ay))
    e_h = hatch(rr, .9, P * .75)
    paint(c_h, e_h)
    paint(cov_ring(ax, ay, 11, 12.6), np.zeros_like(ink))            # aro claro
    hl = cov_disc(ax - 3.4, ay - 3.4, 4.4) * (1 - cov_disc(ax - 1.6, ay - 1.6, 4.6))
    paint(hl, np.zeros_like(ink))                                     # reflexo

# rebites da roda direita (no lugar da escala graduada)
for i in range(12):
    a = -np.pi / 2 + i * np.pi / 6
    rx, ry = 530 + 120 * np.cos(a), 200 + 120 * np.sin(a)
    c_r = cov_disc(rx, ry, 4.6)
    rr = np.hypot(x - u(rx + 1), y - u(ry + 1))
    paint(cov_ring(rx, ry, 4.6, 6.2), np.zeros_like(ink))
    paint(c_r, np.clip(hatch(rr, .55, P * .55) + cov_disc(rx + 1.4, ry + 1.6, 2.2) * .9, 0, 1))
    paint(cov_disc(rx - 1.5, ry - 1.5, 1.4), np.zeros_like(ink))

# índices no alto das rodas (papel sobre a serrilha)
for cx in (190, 530):
    tri = np.clip(np.minimum.reduce([
        (y - u(59)),
        (u(71) - y) - np.abs(x - u(cx)) * (u(12) / u(7.5)),
    ]) + .5, 0, 1)
    paint(tri, np.zeros_like(ink))
    paint(contour(tri, 1.2), np.ones_like(ink))

# ---------- peças do relógio ----------
def stamp(path, box_src, center, size, circle=False):
    """Cola uma peça do relógio (já no buril pesado) em (center), largura size (unid.)."""
    global ink, occ
    im = Image.open(path).convert("RGBA")
    if box_src:
        im = im.crop(box_src)
    sw = int(round(u(size)))
    sh_ = int(round(im.height * sw / im.width))
    im = im.resize((sw, sh_), Image.LANCZOS)
    a = np.array(im).astype(np.float32) / 255
    e = 1 - a[..., :3].mean(-1)
    e = np.clip((e - .02) / .98, 0, 1)
    al = a[..., 3]
    if circle:
        yy, xx = np.mgrid[0:sh_, 0:sw]
        rr = np.hypot(xx - (sw - 1) / 2, yy - (sh_ - 1) / 2)
        al = al * np.clip(sw / 2 - .5 - rr, 0, 1)
    x0 = int(round(u(center[0]) - sw / 2))
    y0 = int(round(u(center[1]) - sh_ / 2))
    sl = (slice(y0, y0 + sh_), slice(x0, x0 + sw))
    c = np.zeros_like(ink); c[sl] = al
    ee = np.zeros_like(ink); ee[sl] = e
    paint(c, ee)


# botão de rebites do relógio, no centro da ponte (onde ficava o play)
stamp(CORPO, (688 - 67, 322 - 67, 688 + 67, 322 + 67), (360, 200), 38, circle=True)
# botões serrilhados do relógio, no alto das rodas (onde ficavam os pinos)
for cx in (190, 530):
    stamp(BOTAO, None, (cx, 39), 42)

rgb = PAPER[None, None] * (1 - ink[..., None]) + (INK * (1 - blue[..., None]) + BLUE * blue[..., None]) * ink[..., None]
out = np.dstack([rgb, occ[..., None] * 255]).round().clip(0, 255).astype(np.uint8)
Image.fromarray(out, "RGBA").save(OUT, "WEBP", lossless=True, quality=100, method=6)
print("ok", W, H)
