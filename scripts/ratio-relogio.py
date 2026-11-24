#!/usr/bin/env python3
"""Relógio do RATIO: prepara a gravura (assets/atrio/ratio/relogio-gravura-fonte.webp)
em duas camadas para a demonstração.

- Fundo externo removido por preenchimento a partir das bordas; na orla, só a tinta
  sobrevive como transparência, sem halo branco sobre a terracota.
- Preto e branco remapeados para a tinta (#2C2C2C) e o papel (#FCFCFC) do site.
- Mostradores: algarismos e ponteiros cobertos de papel até a borda interna da faixa
  de minutos, medida ângulo a ângulo; molduras e acabamento preservados.
- O botão superior sai como camada própria, cortada no topo do colar (y = 143),
  para descer para dentro dele ao ser acionado.

Uso: python3 scripts/ratio-relogio.py [fonte] [pasta de saída]   (requer numpy e Pillow)
"""
import os, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def outside(white):
    o=np.zeros_like(white); o[0,:]=white[0,:]; o[-1,:]=white[-1,:]; o[:,0]=white[:,0]; o[:,-1]=white[:,-1]
    while True:
        n=o.copy()
        n[1:]|=o[:-1]; n[:-1]|=o[1:]; n[:,1:]|=o[:,:-1]; n[:,:-1]|=o[:,1:]
        n&=white
        if (n==o).all(): return o
        # accelerate: several steps per check
        for _ in range(20):
            m=n.copy(); m[1:]|=n[:-1]; m[:-1]|=n[1:]; m[:,1:]|=n[:,:-1]; m[:,:-1]|=n[:,1:]; n=m&white
        o=n

src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'assets/atrio/ratio/relogio-gravura-fonte.webp')
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, 'assets/atrio/ratio')
g = np.array(Image.open(src).convert('L')).astype(float)
INK, PAPER, BG = 44.0, 252.0, 254.0
out_m = outside(g > 200)
# tom: preto -> tinta do site, branco -> papel do site
tone = INK + (PAPER - INK) * np.clip(g / BG, 0, 1)
alpha = np.full(g.shape, 255.0)
# fundo externo: só a tinta sobrevive, como transparência (sem halo branco)
alpha[out_m] = np.clip((BG - g[out_m]) / (BG - INK) * 255, 0, 255)
tone[out_m] = INK
# mostradores: disco de papel sobre algarismos e ponteiros, borda antisserrilhada
yy, xx = np.mgrid[0:g.shape[0], 0:g.shape[1]]
def face_edge(cx, cy):
    # borda interna da linha que contorna o mostrador, ângulo a ângulo:
    # de fora (faixa de minutos) para dentro, atravessa a tinta da linha até o branco
    th = np.radians(np.arange(0, 360, 0.25)); edge = []
    for t in th:
        dx, dy = np.cos(t), np.sin(t); seen = False; e = 180.0
        for r in np.arange(204, 160, -0.5):
            v = g[int(round(cy + dy * r)), int(round(cx + dx * r))]
            if v < 140: seen = True
            elif seen and v > 200: e = r; break
        edge.append(e)
    edge = np.array(edge); k = 31
    pad = np.r_[edge[-k:], edge, edge[:k]]
    med = np.array([np.median(pad[i:i + 2 * k + 1]) for i in range(len(edge))])
    return med
for cx, cy in ((479.5, 529.5), (1054.5, 529.5)):
    edge = face_edge(cx, cy)
    print('borda', edge.min(), edge.max())
    d = np.hypot(xx - cx, yy - cy)
    ang = (np.degrees(np.arctan2(yy - cy, xx - cx)) % 360) / 0.25
    lim = edge[ang.astype(int) % len(edge)] - 0.6
    cov = np.clip(lim + 0.5 - d, 0, 1)
    tone = tone * (1 - cov) + PAPER * cov
    alpha = np.maximum(alpha, cov * 255)
X0, Y0, X1, Y1 = 80, 16, 1456, 986          # recorte com folga acima do botão
CUT = 143                                    # topo do colar: o botão desce para dentro dele
la = np.stack([tone, alpha], -1).round().astype('uint8')
body = la.copy(); body[:CUT] = 0             # acima do colar só existe o botão
knob = la[Y0:CUT, 665:870]
Image.fromarray(body[Y0:Y1, X0:X1], 'LA').save(out + '/relogio-corpo.png', optimize=True)
Image.fromarray(knob, 'LA').save(out + '/relogio-botao.png', optimize=True)
# corpo com perda leve (indistinguível na hachura); botão sem perda
for n, opts in (('corpo', dict(quality=90, alpha_quality=100)), ('botao', dict(lossless=True))):
    png = f'{out}/relogio-{n}.png'
    Image.open(png).convert('RGBA').save(f'{out}/relogio-{n}.webp', method=6, **opts)
    os.remove(png)
    print(n, os.path.getsize(f'{out}/relogio-{n}.webp'), 'bytes')
