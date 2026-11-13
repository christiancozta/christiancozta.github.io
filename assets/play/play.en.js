/* GERADO por i18n/build.mjs a partir de play.js | não editar à mão. */
/* Gerado por fonte/build/build.py. Não editar. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const DOCS = window.PLAY.docs;
const D = window.PLAY.data;
const N = D.n;
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const BASE = location.href.split('#')[0];
const AS = '../assets/play/';
const RM = window.matchMedia('(prefers-reduced-motion: reduce)');
const ICON = {
  volta: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 6 8 12l6 6"/></svg>',
  chev: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>',
  fora: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 16 16 8M9.5 8H16v6.5"/></svg>',
  baixa: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/></svg>',
  x: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>'
};
const inited = {};

/* ---------- utilidades ---------- */
function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
  document.body.appendChild(t); setTimeout(() => t.remove(), 2600);
}
function copy(text, msg) {
  const done = () => toast(msg || 'Copied.');
  if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(done, fallback); } else fallback();
  function fallback() {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) { toast('Could not copy.'); } ta.remove();
  }
}

/* ---------- busca: sinônimos, pontuação ---------- */
const STOP = new Set('a o as os de da do das dos e em no na nos nas ao aos por para com que um uma se ou sem'.split(' '));
const SYN_D = [
  ['gratuidade', 'justiça gratuita', 'AJG', 'assistência judiciária', 'hipossuficiência'],
  ['negativação', 'negativado', 'inscrição indevida', 'cadastro de inadimplentes', 'cadastros de inadimplentes', 'inclusão indevida', 'proteção ao crédito', 'restrição ao crédito', 'Serasa', 'SPC'],
  ['dano moral', 'danos morais', 'extrapatrimonial', 'abalo moral'],
  ['recurso inominado', 'RI'],
  ['embargos de declaração', 'embargos declaratórios', 'aclaratórios', 'ED'],
  ['voo', 'aéreo', 'companhia aérea', 'transporte aéreo', 'overbooking'],
  ['banco', 'bancário', 'instituição financeira', 'conta corrente'],
  ['honorários', 'sucumbência', 'sucumbencial'],
  ['intempestividade', 'intempestivo', 'tempestividade', 'prazo recursal'],
  ['preparo', 'custas', 'deserção'],
  ['telefonia', 'telecomunicações', 'operadora'],
  ['energia elétrica', 'concessionária de energia', 'rede elétrica'],
  ['mandado de segurança', 'MS']
];
const SYN = SYN_D.map((g) => g.map(norm));
const SYND = {}; SYN_D.forEach((g, i) => g.forEach((d, j) => { SYND[SYN[i][j]] = d; }));
const stem = (t) => (t.length > 4 ? t.replace(/(oes|aes|ais|eis|ns|s)$/, '') : t);
function parseQuery(q) {
  let n = ' ' + norm(q).replace(/[^\w.\-/ ]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
  const terms = [], syn = [];
  for (const g of SYN) {
    for (const m of g) {
      if (m.includes(' ') && n.includes(' ' + m + ' ')) {
        terms.push({ src: m, alts: g.map(stem) }); syn.push(...g.filter((x) => x !== m && x.length > 2));
        n = n.replace(' ' + m + ' ', ' '); break;
      }
    }
  }
  for (const w of n.trim().split(' ')) {
    if (!w || (STOP.has(w) && !/^\d/.test(w))) continue;
    if (w.length < 2 && !/^\d/.test(w)) continue;
    const g = SYN.find((gg) => gg.includes(w));
    if (g) { terms.push({ src: w, alts: g.map(stem) }); syn.push(...g.filter((x) => x !== w && x.length > 2)); }
    else terms.push({ src: w, alts: [stem(w)] });
  }
  return { terms, syn: Array.from(new Set(syn)).map((x) => SYND[x] || x) };
}
function score(fields, terms) {
  let total = 0;
  for (const t of terms) {
    let best = 0;
    for (const f of fields) {
      for (const a of t.alts) {
        const i = f.t.indexOf(a);
        if (i < 0) continue;
        let s = f.w; if (i === 0 || /[\s(\-/.,;:]/.test(f.t[i - 1])) s *= 1.5;
        if (s > best) best = s;
      }
    }
    if (!best) return 0;
    total += best;
  }
  return total;
}
const AC = { a: '[aáàâãä]', e: '[eéèêë]', i: '[iíìîï]', o: '[oóòôõö]', u: '[uúùûü]', c: '[cç]', n: '[nñ]' };
const rxs = (s) => s.split('').map((ch) => AC[ch] || ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('');
function hl(text, terms) {
  const e = esc(text);
  if (!terms || !terms.length) return e;
  const alts = Array.from(new Set(terms.flatMap((t) => t.alts))).filter((a) => a.length >= 2).sort((a, b) => b.length - a.length);
  if (!alts.length) return e;
  return e.replace(new RegExp('(' + alts.map(rxs).join('|') + ')', 'gi'), '<mark>$1</mark>');
}
function snippet(text, terms, len = 150) {
  const n = norm(text); let at = -1;
  for (const t of terms) for (const a of t.alts) { const i = n.indexOf(a); if (i >= 0 && (at < 0 || i < at)) at = i; }
  if (at < 0) return text.length > len ? text.slice(0, len) + '…' : text;
  const s = Math.max(0, at - 50);
  return (s > 0 ? '…' : '') + text.slice(s, s + len) + (s + len < text.length ? '…' : '');
}

/* =====================================================================
   MATERIAIS E PARTITURA
   O acervo como partitura de regência. Cada material é uma pauta, agrupada
   por chave em naipes (Intro, Coleção, Governança, Ferramenta); os compassos são a
   ordem de utilização das Regras de Aplicação (seção 3), e as notas ficam
   onde as Regras mandam usar cada componente. Ler na vertical é ler um passo.
   Intro abre o sistema com Índice (abertura) e Memória (registro), ad lib.; o Guia de
   Estilo fecha a Coleção e emenda nas Regras e nos Critérios da Governança.
   ===================================================================== */
const MAT = D.mat;
const WH = MAT.brancas;
const BK = MAT.pretas;
BK.forEach((m) => { m.tipo = 'anexo'; });
const MBY = {}; WH.concat(BK).forEach((m) => { MBY[m.id] = m; });
const fmtKB = (kb) => (kb >= 1000 ? (kb / 1024).toFixed(1).replace('.', ',') + ' MB' : kb + ' KB');
const nTxt = (n, s, p) => n.toLocaleString('en-US') + ' ' + (n === 1 ? s : p);
const TITULO = 'PLAY | Playbook ECHO';

/* Altura na pauta (clave de sol): 28 Mi4, 25.5 Fá4, 23 Sol4, 20.5 Lá4, 18 Si4, 15.5 Dó5, 13 Ré5, 10.5 Mi5.
   As Regras sustentam um pedal de Dó. I abre em Dó maior com os manuais: Notas Introdutórias (Mi4), que acolhe,
   e Mapa Temático (Sol4), que classifica a matéria; a Afinação Processual (Mi5) faz a triagem em I e a
   verificação em II, ligada: o Mi é a nota comum ao Lá menor de II. III soa Dó maior; IV suspende (Fá, Sol, Dó);
   a coda resolve em Dó maior. Índice e Memória ficam ad lib. */
const NOTA = { 28: 'E4', 25.5: 'F4', 23: 'G4', 20.5: 'A4', 18: 'B4', 15.5: 'C5', 13: 'D5', 10.5: 'E5' };
/* Cada marca de ensaio abre o seu passo: o título continua no texto. */
/* Texto da ordem: justificado; "~" marca a sílaba (hífen discreto), para hifenizar
   mesmo nos navegadores sem dicionário de português. */
const MARCAS = [
  ['I', 'Identification', 'for case type, sub~ject, pro~ce~dure, and re~le~vant is~sues.'],
  ['II', 'Admissibility', 'to sus~tain it, re~triev~ing the tem~po~ral base when ne~ces~sa~ry.'],
  ['III', 'Legal Grounds', 'to con~front with the per~ti~nent re~fer~en~ces.'],
  ['IV', 'Results', 'to de~fine be~fore as~sem~bling the de~ci~sion (“Tem~plates”).'],
  ['V', 'Coda', 'to re~fine and ad~just the de~ci~sion ac~cord~ing to de~fined cri~te~ria.']
];
const NAIPES = [
  { n: 'Intro', chave: 'colchete', vozes: [
    { id: 'indice', sub: 'Opening', marca: 'ad lib.', pdf: 'pdf-indice' },
    { id: 'memoria', sub: 'Record', marca: 'ad lib.', pdf: 'pdf-memoria' }] },
  { n: 'Collection', chave: 'chaveta', vozes: [
    { id: 'vol-01', notas: [[1, 28]], pdf: 'vol-01' },
    { id: 'vol-02', notas: [[1, 23]], pdf: 'vol-02' },
    { id: 'vol-03', sub: 'vol. 03 | SOP', notas: [[1, 10.5, 'w'], [2, 10.5, 'w']], liga: [1, 2], pdf: 'vol-03' },
    { id: 'guia', sub: 'vol. 04 | SOP', notas: [[4, 23, 'w'], [5, 23, 'w']], liga: [4, 5], pdf: 'vol-04' }] },
  { n: 'Governance', chave: 'colchete', vozes: [
    { id: 'regras', sub: 'SOP', notas: [[1, 15.5], [2, 15.5], [3, 15.5], [4, 15.5], [5, 15.5]], pdf: 'pdf-regras' },
    { id: 'criterios', sub: 'SOP', notas: [[5, 10.5]], pdf: 'pdf-criterios' }] },
  { n: 'Tools', chave: 'colchete', vozes: [
    { id: 'calendario', nome: 'Legal Calendar', sub: nTxt(D.cal.length, 'day', 'days'), notas: [[2, 20.5]], ferr: true },
    { id: 'fundamentos', nome: 'Legal Grounds', sub: nTxt(N.fun, 'record', 'records'), notas: [[3, 23]], ferr: true },
    { id: 'ementario', nome: 'Headnote Index', sub: nTxt(N.eme, 'subject', 'subjects'), notas: [[3, 10.5]], ferr: true },
    { id: 'templates', nome: 'Templates', sub: nTxt(D.tpl.length, 'template', 'templates'), notas: [[4, 25.5]], ferr: true }] }
];
/* Os três primeiros manuais abrem numa gaveta sob a própria pauta, com a página dupla. */
const GAV = new Set(['vol-01', 'vol-02', 'vol-03']);
const VOZ = {};
NAIPES.forEach((g) => g.vozes.forEach((v) => {
  const m = MBY[v.id];
  if (!v.nome) v.nome = m.nome;
  if (!v.sub) v.sub = m.tipo === 'manual' ? 'vol. ' + m.curto : '';
  v.naipe = g.n; VOZ[v.id] = v;
}));
function vozDesc(v) {
  if (v.marca) return 'free consultation, outside the order';
  const ms = v.notas.map((n) => MARCAS[n[0] - 1][0]);
  if (ms.length === 5) return 'present in every bar';
  if (v.liga) return 'sustained from ' + ms[0] + (ms[ms.length - 1] === 'V' ? ' to the coda (V)' : ' to ' + ms[ms.length - 1]);
  return 'enters at ' + ms.join(', ');
}

const SIS = $('#sistema');
const COL = $('#coluna');
const BAT = $('#batuta');
const MQS = window.matchMedia('(max-width: 700px)');
/* PDF: "ver" abre o leitor na própria página, em duas páginas; "baixar" baixa o arquivo. */
const verBaixar = (m, nome, cls) => `<span class="${cls || 'pt'}"><button type="button" data-ver="${m.id}" aria-label="View ${esc(nome)} as PDF">view</button><i aria-hidden="true">|</i><a href="${AS + m.arquivo}" download aria-label="Download ${esc(nome)} as PDF">download</a></span>`;
function montaPartitura() {
  $('#marcas').innerHTML = MARCAS.map(([r, t, x], i) => `<button type="button" data-m="${i + 1}"><span class="mt" lang="en"><span class="mh"><span class="ensaio">${r}</span><b>${t}</b></span><span class="mx">${esc(x).replace(/~/g, '\u00AD')}</span></span></button>`).join('');
  $('#naipes').innerHTML = NAIPES.map((g) => `<div class="naipe"><div class="chave" aria-hidden="true"><span class="nome-n">${g.n}</span>${g.chave === 'colchete' ? '<span class="colchete"></span>' : '<svg viewBox="0 0 14 100" preserveAspectRatio="none"><path d="M12 1 C3 4 9 30 2 50 C9 70 3 96 12 99" vector-effect="non-scaling-stroke"/></svg>'}</div>` +
    g.vozes.map((v) => {
      const p = v.pdf ? MBY[v.pdf] : null;
      const gav = GAV.has(v.id);
      return `<div class="linha voz" data-id="${v.id}"><span></span><a class="nm" href="#${v.id}"${gav ? ` aria-controls="gav-${v.id}" aria-expanded="false"` : ''} aria-label="${esc(v.nome)}, ${esc(g.n)}, ${vozDesc(v)}"><b>${esc(v.nome)}</b><small>${esc(v.sub)}</small></a><svg class="pauta-s" data-v="${v.id}" aria-hidden="true"></svg>${p ? verBaixar(p, v.nome) : '<span></span>'}</div>` + (gav ? gavetaHTML(MBY[v.id]) : '');
    }).join('') + '</div>').join('');
}

/* Gaveta: desce sob a pauta e empurra o resto; a página dupla abre o leitor em tela inteira. */
function gavetaHTML(m) {
  const [ab, abTxt] = m.abertura;
  return `<div class="gaveta" id="gav-${m.id}" data-gav="${m.id}" role="region" aria-label="${esc(m.nome)}, ${esc(m.volume)}" inert>
    <div class="gav-in"><div class="gav-c">
      <button type="button" class="gav-livro" data-ver="${m.id}" aria-label="View ${esc(m.nome)} full screen">
        <span class="gav-pgs">${m.folhas.map((f) => `<img data-src="${AS + f}" width="320" height="453" alt="" decoding="async">`).join('')}</span>
        <span class="gav-ver">view full screen</span>
      </button>
      <div class="gav-txt">
        <p class="gav-v">${esc(m.volume)} <i aria-hidden="true">|</i> ${esc(m.sub)}</p>
        <h3 class="gav-t">${esc(m.nome)}</h3>
        <p class="gav-l"><b>${esc(ab)}</b> ${esc(abTxt)}</p>
        <dl class="gav-d"><div><dt>Nature</dt><dd>Manual from the TJPR Appellate Panel collection, in Portuguese</dd></div><div><dt>Format</dt><dd>PDF, ${fmtKB(m.kb)}</dd></div></dl>
        <div class="acoes"><button type="button" class="btn pri" data-ver="${m.id}">Open the PDF</button><a class="btn ghost" href="${AS + m.arquivo}" download>Download${ICON.baixa}</a></div>
      </div>
      <button type="button" class="gav-x" data-fecha-gav aria-label="Close ${esc(m.nome)}">${ICON.x}</button>
    </div></div>
  </div>`;
}
let gavAberta = null;
function abreGaveta(id) {
  if (gavAberta === id) return;
  fechaGaveta(true);
  const g = $('#gav-' + id); if (!g) return;
  $$('img[data-src]', g).forEach((im) => { im.src = im.dataset.src; im.removeAttribute('data-src'); });
  g.inert = false; g.classList.add('on'); gavAberta = id;
  const nm = $(`.voz[data-id="${id}"] .nm`); if (nm) nm.setAttribute('aria-expanded', 'true');
  marcaVoz(id);
  document.title = MBY[id].nome + ' | PLAY';
  $('#anuncio').textContent = 'Opened under the staff: ' + MBY[id].nome;
  setTimeout(() => {
    const r = g.getBoundingClientRect();
    if (r.bottom > innerHeight || r.top < 0) g.scrollIntoView({ behavior: RM.matches ? 'auto' : 'smooth', block: 'nearest' });
  }, RM.matches ? 0 : 480);
}
function fechaGaveta(semMarca) {
  if (!gavAberta) return;
  const id = gavAberta; const g = $('#gav-' + id);
  g.classList.remove('on'); g.inert = true; gavAberta = null;
  const nm = $(`.voz[data-id="${id}"] .nm`); if (nm) nm.setAttribute('aria-expanded', 'false');
  if (!semMarca) { marcaVoz(null); document.title = TITULO; }
}
function saiGaveta() {
  const id = gavAberta;
  if (location.hash) history.pushState('', TITULO, location.pathname + location.search);
  fechaGaveta();
  const nm = id && $(`.voz[data-id="${id}"] .nm`);
  if (nm) nm.focus({ preventScroll: true });
}
/* A mesma pauta abre e fecha a gaveta; outra pauta a fecha e abre o seu material. */
function alterna(id) {
  if (gavAberta === id) saiGaveta(); else navigate('#' + id);
}

/* Cada pauta é um SVG do tamanho real da coluna: cinco linhas, barras de compasso,
   pausas onde o material não entra, notas onde entra, ligadura no Guia sustentado. */
const sg = { x: 0, mw: 0 };
function desenha() {
  const svgs = $$('svg.pauta-s');
  if (!svgs.length) return;
  const W = svgs[0].getBoundingClientRect().width; if (!W) return;
  const mw = W / 5;
  svgs.forEach((s) => {
    const v = VOZ[s.dataset.v]; let o = '';
    [8, 13, 18, 23, 28].forEach((y) => { o += `<line class="l" x1="0" x2="${W}" y1="${y}" y2="${y}"/>`; });
    for (let i = 0; i < 5; i++) o += `<line class="bar" x1="${i * mw + 0.5}" x2="${i * mw + 0.5}" y1="8" y2="28"/>`;
    o += `<line class="fim" x1="${W - 5}" x2="${W - 5}" y1="8" y2="28" stroke-width="1"/><line class="fim" x1="${W - 1.5}" x2="${W - 1.5}" y1="8" y2="28" stroke-width="3"/>`;
    if (v.marca) o += `<text x="${Math.min(mw * 0.5, 78)}" y="22.5" text-anchor="middle">${v.marca}</text>`;
    else {
      const tem = {}; v.notas.forEach((n) => { tem[n[0]] = n; });
      for (let m = 1; m <= 5; m++) {
        const cx = (m - 1) * mw + mw * 0.42; const n = tem[m];
        if (!n) { o += `<rect class="r" data-m="${m}" x="${cx - 5}" y="13" width="10" height="3.2"/>`; continue; }
        const y = n[1];
        if (n[2] === 'w') o += `<ellipse class="h" data-m="${m}" cx="${cx}" cy="${y}" rx="5.2" ry="3.3" transform="rotate(-18 ${cx} ${y})"/>`;
        else {
          const up = y > 18; const sx = up ? cx + 4 : cx - 4; const sy = up ? y - 18 : y + 18;
          o += `<g data-m="${m}"><ellipse class="n" cx="${cx}" cy="${y}" rx="4.6" ry="3.2" transform="rotate(-22 ${cx} ${y})"/><line class="st" x1="${sx}" x2="${sx}" y1="${y}" y2="${sy}"/></g>`;
        }
      }
      if (v.liga) {
        const a = (v.liga[0] - 1) * mw + mw * 0.42; const b = (v.liga[1] - 1) * mw + mw * 0.42; const yy = tem[v.liga[0]][1];
        o += `<path class="tie" data-m="${v.liga[1]}" d="M${a + 6} ${yy + 5} Q${(a + b) / 2} ${yy + 13} ${b - 6} ${yy + 5}"/>`;
      }
    }
    s.setAttribute('viewBox', `0 0 ${W} 40`); s.innerHTML = o;
  });
  sg.x = svgs[0].getBoundingClientRect().left - SIS.getBoundingClientRect().left; sg.mw = mw;
}

/* Compasso em foco: a coluna acende, o resto esmaece e, com som, o compasso soa como acorde. */
let mAtual = 0;
function acende(m) {
  $$('#marcas button').forEach((b) => b.classList.toggle('on', +b.dataset.m === m));
  if (!m) { SIS.removeAttribute('data-m'); return; }
  SIS.setAttribute('data-m', m);
  COL.style.width = sg.mw + 'px'; COL.style.transform = `translateX(${sg.x + (m - 1) * sg.mw}px)`;
}
function marcaCompasso(m) {
  if (m === mAtual) return; mAtual = m;
  acende(m);
  if (m) acorde(m);
}
SIS.addEventListener('pointermove', (e) => {
  if (MQS.matches || e.pointerType !== 'mouse') return;
  if (e.target.closest('.gaveta')) { if (!regencia) marcaCompasso(0); SIS.classList.remove('foco-voz'); $$('.voz.quente', SIS).forEach((el) => el.classList.remove('quente')); return; }
  /* Durante a regência, a coluna segue a música; o realce da voz sob o cursor continua. */
  if (!regencia) {
    const x = e.clientX - SIS.getBoundingClientRect().left - sg.x;
    marcaCompasso(x < 0 || x > sg.mw * 5 ? 0 : Math.min(5, Math.floor(x / sg.mw) + 1));
  }
  const voz = e.target.closest('.voz');
  SIS.classList.toggle('foco-voz', !!voz);
  $$('.voz', SIS).forEach((el) => el.classList.toggle('quente', el === voz));
});
SIS.addEventListener('pointerleave', () => { SIS.classList.remove('foco-voz'); $$('.voz.quente', SIS).forEach((el) => el.classList.remove('quente')); if (!regencia) marcaCompasso(0); });
SIS.addEventListener('click', (e) => {
  const mb = e.target.closest('#marcas button'); if (mb) { mAtual = 0; marcaCompasso(+mb.dataset.m); return; }
  if (e.target.closest('[data-fecha-gav]')) { saiGaveta(); return; }
  const nm = e.target.closest('.voz .nm'); if (nm && !(e.metaKey || e.ctrlKey || e.shiftKey || e.button)) { e.preventDefault(); alterna(nm.closest('.voz').dataset.id); return; }
  if (e.target.closest('a, button')) return;
  const voz = e.target.closest('.voz'); if (voz) alterna(voz.dataset.id);
});
$('#marcas').addEventListener('focusin', (e) => { const b = e.target.closest('button'); if (b) marcaCompasso(+b.dataset.m); });
$('#marcas').addEventListener('focusout', (e) => { if (regencia) return; if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest('#marcas')) marcaCompasso(0); });

/* =====================================================================
   SOM
   Sintetizado no navegador, desligado até o primeiro toque no selo seco.
   O que toca é uma música: uma progressão de acordes em cifra, com andamento.
   Uma é sorteada a cada visita; a dobra da folha (alto à direita) troca para a próxima.
   O selo rege a progressão em tempo: cada acorde é um compasso, a coluna acende
   no compasso correspondente (de I a V, recomeçando em I) e a batuta atravessa junto;
   a progressão fecha no acorde de partida, com fermata. Com o som ligado, passar
   por um compasso (ou tocá-lo no cabeçalho) faz soar só o acorde daquele compasso.
   ===================================================================== */
/* Cada música: nome, autoria, andamento (bpm), tempos por compasso e acordes em cifra (C, Am, F#m7,
   Bb/D, Gsus4, Cmaj7, E7, A6(add9), B(add9,add11)…), um por compasso; "fim" é o acorde de repouso.
   Cifras extraídas das análises do TheoryTab (Hooktheory): tom, modo, andamento e graus de cada seção,
   convertidos em cifra na tonalidade da seção. */
const MUSICAS = [
  /* refrão, Si bemol mixolídio */
  { nome: 'Bargain', autor: 'The Who', bpm: 133, tempos: 4, fim: 'Bb', acordes: ['Gb', 'Ab', 'Eb', 'Eb(add9)', 'Bb', 'Bb11', 'Gb', 'Db', 'Ab', 'Eb', 'Bb11', 'Bb'] },
  /* verso, Ré maior */
  { nome: 'Dreaming', autor: 'Blondie', bpm: 162, tempos: 4, fim: 'D', acordes: ['D', 'G', 'D', 'G', 'D', 'A', 'Em', 'G', 'A', 'D', 'G', 'D', 'G'] },
  /* refrão, Lá bemol maior */
  { nome: 'Viva La Vida', autor: 'Coldplay', bpm: 138, tempos: 4, fim: 'Ab', acordes: ['Dbmaj7', 'Eb7sus4', 'Ab', 'Fm11', 'Dbmaj7', 'Eb7sus4', 'Ab', 'Fm11', 'Dbmaj7', 'Eb7(add11)', 'Ab/C', 'Fm11', 'Dbmaj7', 'Eb7', 'Abmaj9', 'Fm'] },
  /* refrão (primeiro ciclo), Si bemol maior */
  { nome: 'Life On Mars?', autor: 'David Bowie', bpm: 120, tempos: 4, fim: 'Bb', acordes: ['Bb', 'Eb', 'Gm7', 'Gbaug', 'F', 'Fm', 'E', 'Eb', 'Dm', 'Cm7', 'Ebmaj7/D', 'Ebmmaj7'] },
  /* refrão (ciclo e final), Fá maior */
  { nome: 'Weekend Wars', autor: 'MGMT', bpm: 77, tempos: 4, fim: 'Dm', acordes: ['A/Db', 'Dm', 'C/E', 'F', 'A', 'Bb', 'Gm', 'Am', 'Bb', 'G7/B', 'C', 'C7/Bb', 'Am7', 'A7/Db'] },
  /* refrão, Si maior */
  { nome: 'Blue Ridge Mountains', autor: 'Fleet Foxes', bpm: 98, tempos: 4, fim: 'B6', acordes: ['E', 'F#', 'E', 'B', 'E6', 'F#', 'E6', 'B6'] },
  /* refrão, Dó sustenido menor */
  { nome: 'Cloudbusting', autor: 'Kate Bush', bpm: 113, tempos: 4, fim: 'C#m7', acordes: ['C#m7', 'B', 'A(add9)', 'B', 'C#m7', 'B(add9)', 'A(add9)', 'B', 'C#m7', 'B', 'F#m(add9)/A', 'A(add9)', 'B'] },
  /* verso e refrão, Dó sustenido menor, em 6 */
  { nome: 'Nude', autor: 'Radiohead', bpm: 128, tempos: 6, fim: 'C#m7', acordes: ['A(add9)', 'C#m7', 'A(add9)', 'Emaj7/G#', 'G#m7', 'A(add9)', 'G#m7', 'A(add9)', 'C#m7', 'A(add9)'] },
  /* refrão, Sol maior (repousa no vi) */
  { nome: 'Your Protector', autor: 'Fleet Foxes', bpm: 100, tempos: 4, fim: 'Em', acordes: ['C', 'G', 'D', 'Em', 'A', 'G', 'D', 'Em'] }
];
let musica = Math.floor(Math.random() * MUSICAS.length);

/* Cifra → alturas. Qualidades por ordem de comprimento, para "m7b5" não ser lido como "m". */
const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const QUAL = [
  ['m(maj7)', [0, 3, 7, 11]], ['mmaj7', [0, 3, 7, 11]], ['maj13', [0, 4, 11, 14, 21]], ['maj9', [0, 4, 7, 11, 14]], ['maj7', [0, 4, 7, 11]],
  ['m7b5', [0, 3, 6, 10]], ['dim7', [0, 3, 6, 9]], ['7sus4', [0, 5, 7, 10]], ['madd9', [0, 3, 7, 14]], ['add9', [0, 4, 7, 14]],
  ['add2', [0, 2, 4, 7]], ['sus2', [0, 2, 7]], ['sus4', [0, 5, 7]], ['m11', [0, 3, 10, 14, 17]], ['m13', [0, 3, 10, 14, 21]],
  ['m9', [0, 3, 7, 10, 14]], ['m7', [0, 3, 7, 10]], ['m6', [0, 3, 7, 9]], ['7b9', [0, 4, 10, 13]], ['7#9', [0, 4, 10, 15]],
  ['dim', [0, 3, 6]], ['aug', [0, 4, 8]], ['sus', [0, 5, 7]], ['maj', [0, 4, 7]], ['min', [0, 3, 7]], ['M7', [0, 4, 7, 11]],
  ['13', [0, 4, 10, 14, 21]], ['11', [0, 7, 10, 14, 17]], ['9', [0, 4, 7, 10, 14]], ['7', [0, 4, 7, 10]], ['6', [0, 4, 7, 9]],
  ['maj7#5', [0, 4, 8, 11]], ['7#5', [0, 4, 8, 10]], ['5', [0, 7]], ['ø', [0, 3, 6, 10]], ['°', [0, 3, 6]], ['+', [0, 4, 8]], ['m', [0, 3, 7]], ['', [0, 4, 7]]
];
const EXT = { add2: 2, add4: 5, add6: 9, add9: 14, add11: 17, add13: 21, add7: 10, addmaj7: 11, b9: 13, '#9': 15, '#11': 18, b13: 20 };
const pcDe = (l, a) => (PC[l] + (a === '#' || a === '♯' ? 1 : a === 'b' || a === '♭' ? -1 : 0) + 12) % 12;
function cifra(s) {
  const m = /^([A-G])([#b♯♭]?)(.*?)(?:\/([A-G])([#b♯♭]?))?$/.exec(String(s).trim());
  if (!m) return { raiz: 0, iv: [0, 4, 7], baixo: 0 };
  const raiz = pcDe(m[1], m[2]);
  /* Extensões entre parênteses: "A6(add9)", "B(add9,add11)". */
  const ext = [];
  const nq = m[3].replace(/\(([^)]*)\)/g, (_, x) => { ext.push(...x.split(/[,\s]+/).filter(Boolean)); return ''; });
  const q = QUAL.find(([nm]) => nm === nq) || QUAL.find(([nm]) => nm && nq.startsWith(nm)) || QUAL[QUAL.length - 1];
  const iv = q[1].concat(ext.map((e) => EXT[e]).filter((x) => x != null));
  return { raiz, iv, baixo: m[4] ? pcDe(m[4], m[5]) : raiz };
}
/* Vozes de cima (Mi4 a Lá5): no máximo quatro classes de altura, pela ordem do que define o acorde
   (fundamental, terça ou suspensão, sétima, sexta e extensões; a quinta justa por último);
   entre as inversões possíveis, a que menos se move a partir do acorde anterior. */
function vozes(c, antes) {
  const rel = (p) => (p - c.raiz + 12) % 12;
  let pcs = Array.from(new Set(c.iv.map((i) => (c.raiz + i) % 12)));
  const terca = pcs.some((p) => rel(p) === 3 || rel(p) === 4);
  const PRIO = { 0: 0, 3: 1, 4: 1, 10: 2, 11: 2, 6: 3, 8: 3, 9: 3, 2: terca ? 4 : 1, 5: terca ? 5 : 1, 1: 4, 7: 9 };
  if (pcs.length > 4) pcs = pcs.sort((a, b) => PRIO[rel(a)] - PRIO[rel(b)]).slice(0, 4);
  pcs.sort((a, b) => rel(a) - rel(b));
  let melhor = null; let custo = Infinity;
  for (let r = 0; r < pcs.length; r++) {
    for (let base = 62; base <= 72; base++) {
      if (base % 12 !== pcs[r]) continue;
      const v = [base];
      for (let k = 1; k < pcs.length; k++) { let n = v[k - 1] + 1; while (n % 12 !== pcs[(r + k) % pcs.length]) n++; v.push(n); }
      if (v[v.length - 1] > 81) continue;
      const media = v.reduce((a, b) => a + b, 0) / v.length;
      /* movimento a partir do acorde anterior, com atração para o centro (Lá4), para as vozes não derivarem */
      const c1 = (antes ? v.reduce((a, n) => a + Math.min(...antes.map((p) => Math.abs(p - n))), 0) : 0) + Math.abs(media - 68) * (antes ? 0.6 : 1);
      if (c1 < custo) { custo = c1; melhor = v; }
    }
  }
  return melhor || pcs.map((p) => 60 + p);
}
/* Grave: o baixo da cifra entre Mi2 e Ré#3, com a quinta acima; sem quinta (ou no baixo invertido), a oitava abaixo. */
function grave(c) {
  let b = 36 + c.baixo; if (b < 40) b += 12;
  if (c.baixo === c.raiz && c.iv.includes(7)) return [b, b + 7];
  return b - 12 >= 36 ? [b - 12, b] : [b, b + 12];
}
/* A música em compassos já vozeados: [{grave, alto}], com o repouso no fim. */
function compassos(mu) {
  const cs = mu.acordes.slice();
  const fim = mu.fim || mu.acordes[0];
  if (cs[cs.length - 1] !== fim) cs.push(fim);
  let antes = null;
  return cs.map((s) => { const c = cifra(s); const alto = vozes(c, antes); antes = alto; return { grave: grave(c), alto }; });
}
const barraDe = (mu) => Math.min(3, Math.max(1.3, ((mu.tempos || 4) * 60) / (mu.bpm || 120)));

let actx = null; let saida = null; let eco = null; let onda = null; let somOn = false; let regencia = null;
const soando = new Set();
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
function ligaSom() {
  if (actx) { if (actx.state !== 'running') actx.resume().catch(() => {}); return true; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
  /* iOS: tocar mesmo com a chave de silêncio ligada, como mídia. */
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (err) { /* sem sessão */ }
  try { actx = new AC(); } catch (err) { return false; }
  /* Destrava o áudio dentro do próprio gesto (Safari): um instante de silêncio. */
  try { const s = actx.createBufferSource(); s.buffer = actx.createBuffer(1, 1, 22050); s.connect(actx.destination); s.start(0); } catch (err) { /* segue */ }
  if (actx.state !== 'running') actx.resume().catch(() => {});
  const comp = actx.createDynamicsCompressor();
  comp.threshold.value = -18; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.25;
  comp.connect(actx.destination);
  saida = actx.createGain(); saida.gain.value = 0.9; saida.connect(comp);
  /* Sala: reverberação curta, gerada (ruído com queda exponencial), sem arquivo. */
  const sr = actx.sampleRate; const len = Math.floor(sr * 2.4); const ir = actx.createBuffer(2, len, sr);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
  const conv = actx.createConvolver(); conv.buffer = ir;
  eco = actx.createGain(); eco.gain.value = 0.28; eco.connect(conv); conv.connect(comp);
  /* Timbre de teclado macio (entre piano elétrico e celesta): fundamental forte, poucos harmônicos. */
  const im = new Float32Array([0, 1, 0.38, 0.16, 0.09, 0.045, 0.025, 0.012]);
  onda = actx.createPeriodicWave(new Float32Array(im.length), im);
  return true;
}
/* Uma nota: ataque rápido, queda até um sustento baixo e soltura com cauda; o filtro escurece com o tempo. */
function nota(midi, t, dur, vel) {
  const f = hz(midi);
  const o = actx.createOscillator(); o.setPeriodicWave(onda); o.frequency.value = f;
  const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.5;
  lp.frequency.setValueAtTime(Math.min(9000, f * 9), t); lp.frequency.exponentialRampToValueAtTime(Math.max(600, f * 2), t + Math.min(1.4, dur));
  const g = actx.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vel, t + 0.014);
  g.gain.exponentialRampToValueAtTime(vel * 0.4, t + Math.min(0.45, dur * 0.5));
  g.gain.exponentialRampToValueAtTime(vel * 0.14, t + Math.max(0.5, dur));
  g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.5, dur) + 1.1);
  o.connect(lp); lp.connect(g); g.connect(saida); g.connect(eco);
  o.start(t); o.stop(t + Math.max(0.5, dur) + 1.2);
  const v = { g, o }; soando.add(v); o.onended = () => soando.delete(v);
}
/* Silencia o que estiver soando ou agendado, com uma soltura curta (sem estalo). */
function solta(tau) {
  if (!actx) return;
  const t = actx.currentTime;
  soando.forEach((v) => {
    try {
      if (v.g.gain.cancelAndHoldAtTime) v.g.gain.cancelAndHoldAtTime(t); else { v.g.gain.cancelScheduledValues(t); v.g.gain.setValueAtTime(v.g.gain.value, t); }
      v.g.gain.setTargetAtTime(0.0001, t, tau); v.o.stop(t + tau * 8);
    } catch (err) { /* já parou */ }
  });
  soando.clear();
}
/* Um compasso: no primeiro tempo, o grave e o acorde num arpejo breve de baixo para cima (a voz mais
   aguda canta um pouco mais); nos tempos seguintes (3 em 4, 5 em 6), o acorde quebrado, leve. Só o acorde, fora da regência. */
function soaCompasso(cp, t, B, rege, fermata, tempos) {
  const d = B + (fermata ? B * 1.6 : 0);
  cp.grave.forEach((n, i) => nota(n, t + i * 0.012, rege ? d : 1.3, i ? 0.1 : 0.15));
  const a = cp.alto;
  a.forEach((n, i) => nota(n, t + 0.05 + i * 0.06, rege ? d : 1.3, i === a.length - 1 ? 0.12 : 0.08));
  if (!rege || fermata) return;
  const tt = tempos || 4;
  for (let k = 1; k < tt; k++) nota(a[(k - 1) % a.length], t + (k * B) / tt, (2 * B) / tt, 0.055);
}
let ultimoAcorde = { m: 0, t: 0 };
function acorde(m) {
  if (!somOn || !actx) return;
  /* foco e clique no mesmo cabeçalho chegam juntos: soa uma vez só. */
  const agora = performance.now();
  if (ultimoAcorde.m === m && agora - ultimoAcorde.t < 350) return;
  ultimoAcorde = { m, t: agora };
  if (regencia) paraRegencia(true);
  if (actx.state !== 'running') actx.resume().catch(() => {});
  solta(0.07);
  const mu = MUSICAS[musica]; const cs = compassos(mu);
  soaCompasso(cs[(m - 1) % cs.length], actx.currentTime + 0.02, barraDe(mu), false);
}
/* Regência: a progressão inteira em tempo; a coluna acende em cada compasso e a batuta atravessa
   a partitura a cada cinco compassos (ou só os que restam, no fim). */
function rege() {
  if (!somOn) return;
  paraRegencia(); solta(0.05);
  const mu = MUSICAS[musica]; const cs = compassos(mu); const B = barraDe(mu); const n = cs.length;
  const t0 = actx.currentTime + 0.15;
  cs.forEach((cp, k) => soaCompasso(cp, t0 + k * B, B, true, k === n - 1, mu.tempos));
  const ms = (s) => Math.max(0, (t0 - actx.currentTime + s) * 1000);
  regencia = { timers: [] };
  cs.forEach((cp, k) => {
    const col = (k % 5) + 1;
    regencia.timers.push(setTimeout(() => { mAtual = col; acende(col); }, ms(k * B)));
    if (k % 5 === 0) regencia.timers.push(setTimeout(() => gesto(B * Math.min(5, n - k), true, Math.min(5, n - k)), ms(k * B)));
  });
  regencia.timers.push(setTimeout(() => { regencia = null; mAtual = 0; acende(0); }, ms((n - 1) * B + B * 2.6)));
}
/* manter: quem interrompe já acendeu o seu compasso; não apagar. */
function paraRegencia(manter) {
  if (!regencia) return;
  regencia.timers.forEach(clearTimeout); regencia = null;
  BAT.classList.remove('vai', 'rege');
  if (!manter) { mAtual = 0; acende(0); }
}
function desligaSom() {
  somOn = false; $('#b-som').setAttribute('aria-pressed', 'false');
  paraRegencia(); solta(0.12);
}
$('#b-som').addEventListener('click', (e) => {
  if (somOn) { desligaSom(); return; }
  if (!ligaSom()) return;
  somOn = true; e.currentTarget.setAttribute('aria-pressed', 'true');
  if (actx.state === 'running') rege();
  else actx.resume().then(rege, () => { desligaSom(); toast('The browser did not allow sound.'); });
});
document.addEventListener('visibilitychange', () => { if (document.hidden) { paraRegencia(); solta(0.05); } });

/* A dobra da folha, no alto à direita, troca a música. Sem marca nem rótulo visível. */
const dobra = document.createElement('button');
dobra.type = 'button'; dobra.className = 'dobra'; dobra.tabIndex = -1; dobra.setAttribute('aria-label', 'Change the song');
$('.a4').appendChild(dobra);
dobra.addEventListener('click', () => {
  if (MUSICAS.length < 2) { toast('There is only one song.'); return; }
  musica = (musica + 1) % MUSICAS.length;
  const mu = MUSICAS[musica];
  toast('Song: ' + mu.nome + (mu.autor ? ', ' + mu.autor : ''));
  if (somOn) rege();
});

/* A batuta: um gesto da primeira à última barra. Abre a página, volta de tempos em tempos enquanto a
   partitura está à vista e ninguém a percorre, e rege em tempo quando o som toca. */
function gesto(dur, emTempo, ate) {
  if (RM.matches || MQS.matches || !sg.mw) return;
  BAT.style.setProperty('--a', sg.x + 'px'); BAT.style.setProperty('--b', (sg.x + sg.mw * (ate || 5)) + 'px');
  BAT.style.setProperty('--dur', (dur || 3.4) + 's');
  BAT.classList.remove('vai', 'rege'); void BAT.offsetWidth; BAT.classList.add(emTempo ? 'rege' : 'vai');
}
/* À vista: ao menos 35% da tela (ou do próprio sistema, se for menor) ocupados pela partitura. */
let sisVisivel = true;
if ('IntersectionObserver' in window) {
  new IntersectionObserver((es) => {
    const e = es[es.length - 1];
    sisVisivel = e.intersectionRect.height >= Math.min(e.boundingClientRect.height, innerHeight) * 0.35;
  }, { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] }).observe(SIS);
}
let rondaT = 0;
function ronda() {
  clearTimeout(rondaT); rondaT = 0;
  if (RM.matches || MQS.matches) return;
  if (!document.hidden && sisVisivel && !regencia && !mAtual && !gavAberta && !PARTE.classList.contains('on')) gesto();
  rondaT = setTimeout(ronda, 9000);
}
const retomaRonda = () => { if (!rondaT) rondaT = setTimeout(ronda, 9000); };
[RM, MQS].forEach((q) => (q.addEventListener ? q.addEventListener('change', retomaRonda) : q.addListener(retomaRonda)));

/* Selo seco: um contorno de grafite, levíssimo, por baixo do desenho em papel, para o relevo se distinguir. */
(() => {
  const sv = $('#b-som svg'); if (!sv) return;
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 's-contorno');
  Array.from(sv.children).filter((el) => el.tagName.toLowerCase() !== 'defs').forEach((el) => g.appendChild(el.cloneNode(true)));
  const defs = sv.querySelector('defs');
  sv.insertBefore(g, defs ? defs.nextSibling : sv.firstChild);
})();

/* =====================================================================
   A PARTE: folha que se abre sobre a partitura
   Documentos, fichas de PDF e ferramentas abrem no mesmo painel, à direita;
   a partitura fica atrás, esmaecida. Fechar volta ao ponto de onde se saiu.
   ===================================================================== */
const PARTE = $('#parte');
const VEU = $('#veu');
const FOLHA = $('#folha');
const FIN = $('#folha-in');
const ROT = $('#parte-r');
const cur = { key: null };
let folhaIO = null;
let parteVolta = null;
const GADS = ['calendario', 'fundamentos', 'ementario'];
const TOOLDOC = { 'calendario-base': ['Calendar', 'basis and limits of the count', 'Calendar, basis and limits'], 'fundamentos-regra': ['Legal Grounds', 'usage rule', 'Legal Grounds, usage rule'], 'ementario-regra': ['Headnote Index', 'usage rule', 'Headnote Index, usage rule'] };
const TOOLVOZ = { 'calendario-base': 'calendario', 'fundamentos-regra': 'fundamentos', 'ementario-regra': 'ementario' };
const DOCVIEW = { 'guia-de-estilo': 'guia', 'regras-de-aplicacao': 'regras', 'criterios-operacionais': 'criterios', 'indice-e-arquitetura': 'indice', 'memoria-de-integracao': 'memoria', 'templates-texto': 'templates', 'calendario-base': 'calendario', 'fundamentos-regra': 'fundamentos', 'ementario-regra': 'ementario' };

function scrollToId(id, instant) {
  const el = document.getElementById(id);
  if (el) { el.scrollIntoView({ behavior: instant || RM.matches ? 'auto' : 'smooth', block: 'start' }); return true; }
  return false;
}
function abreParte() {
  if (PARTE.classList.contains('on')) return;
  const a = document.activeElement;
  parteVolta = a && a !== document.body && !PARTE.contains(a) ? a : null;
  PARTE.hidden = false; VEU.classList.add('on'); document.documentElement.classList.add('com-parte');
  void PARTE.offsetWidth; PARTE.classList.add('on');
  setTimeout(() => FOLHA.focus({ preventScroll: true }), 80);
}
function fechaParte() {
  if (!PARTE.classList.contains('on')) return;
  PARTE.classList.remove('on'); VEU.classList.remove('on'); document.documentElement.classList.remove('com-parte');
  setTimeout(() => { if (!PARTE.classList.contains('on')) PARTE.hidden = true; }, RM.matches ? 0 : 600);
  cur.key = null; marcaVoz(null); document.title = TITULO;
  const v = parteVolta; parteVolta = null;
  if (v && v.focus && document.contains(v)) v.focus({ preventScroll: true });
}
function sai() {
  if (location.hash) history.pushState('', document.title, location.pathname + location.search);
  fechaParte();
}
$('#fecha').addEventListener('click', sai);
VEU.addEventListener('click', sai);

/* Qual pauta ou anotação corresponde ao que está aberto. */
function vozDe(key) {
  if (VOZ[key]) return key;
  if (key.startsWith('ferr:')) return key.slice(5);
  if (key.startsWith('doc:')) return TOOLVOZ[key.slice(4)] || null;
  if (key === 'cal-ano') return 'calendario';
  if (key.startsWith('fun:')) return 'fundamentos';
  if (key.startsWith('eme:')) return 'ementario';
  const m = MBY[key];
  if (!m) return null;
  if (m.le) return m.le;
  if (m.ferramenta) return m.ferramenta;
  return null;
}
function marcaVoz(id) {
  $$('.voz').forEach((el) => { if (el.dataset.id === id) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current'); });
}
function rotulo(key) {
  if (key === 'cal-ano') return 'Tool | Legal Calendar, annual table';
  if (key.startsWith('doc:')) return 'Tool | ' + ((TOOLDOC[key.slice(4)] || [])[2] || '');
  if (key.startsWith('fun:')) return 'Tool | Legal ground ' + key.slice(4);
  if (key.startsWith('eme:')) return 'Tool | Headnote Index ' + key.slice(4);
  if (key.startsWith('ferr:')) return 'Tool | ' + VOZ[key.slice(5)].nome;
  if (VOZ[key]) return VOZ[key].naipe + ' | ' + VOZ[key].nome;
  const m = MBY[key];
  if (!m) return '';
  return m.tipo === 'manual' ? 'Collection | ' + m.volume : 'PDF annex | ' + m.nome;
}
function tituloFolha(key) {
  if (key === 'cal-ano') return 'Legal Calendar';
  if (key.startsWith('doc:')) return (TOOLDOC[key.slice(4)] || [])[2] || '';
  if (key.startsWith('fun:')) return 'Legal ground ' + key.slice(4);
  if (key.startsWith('eme:')) return 'Headnote Index ' + key.slice(4);
  if (key.startsWith('ferr:')) return VOZ[key.slice(5)].nome;
  return MBY[key] ? MBY[key].nome : '';
}
function situa(key) {
  ROT.textContent = rotulo(key);
  marcaVoz(vozDe(key));
  const t = tituloFolha(key);
  document.title = t ? t + ' | PLAY' : TITULO;
  $('#anuncio').textContent = 'Opened over the score: ' + t;
}
function mostraFerr(id) {
  FIN.hidden = !!id;
  GADS.forEach((g) => { $('#gb-' + g).hidden = g !== id; });
}

function showSheet(key, sub) {
  mostraFerr(null);
  abreParte();
  if (cur.key === key) { if (sub) scrollToId(sub); return; }
  cur.key = key;
  if (folhaIO) { folhaIO.disconnect(); folhaIO = null; }
  renderSheet(key);
  FOLHA.scrollTop = 0;
  if (sub) requestAnimationFrame(() => scrollToId(sub, true));
  situa(key);
}
function renderSheet(key) {
  if (key === 'cal-ano') { FIN.innerHTML = anoHTML(); renderYear(); }
  else if (key.startsWith('doc:')) docSheet(key.slice(4), null);
  else if (key.startsWith('fun:')) FIN.innerHTML = `<div class="ffer"><article class="detail">${funDetailHTML(FBY[key.slice(4)], parseQuery(fs.q), true)}</article></div>`;
  else if (key.startsWith('eme:')) FIN.innerHTML = `<div class="ffer"><article class="detail">${emeDetailHTML(EBY[key.slice(4)], parseQuery(es.q), true)}</article></div>`;
  else { const m = MBY[key]; if (m.doc) docSheet(m.doc, m); else FIN.innerHTML = fichaHTML(m); }
}

function renderDoc(el, key) {
  el.innerHTML = DOCS[key] || '';
  const rail = el.parentElement && el.parentElement.querySelector('.rail');
  if (rail) buildRail(rail, el, key);
}
function buildRail(rail, art, key) {
  const v = DOCVIEW[key] || key;
  const hs = $$('.op h1[id], h2.h2[id]', art);
  if (hs.length < 2) { rail.hidden = true; return; }
  rail.innerHTML = '<div class="lbl">On this sheet</div>' + hs.map((h) => `<a href="#${v}/${h.id}" data-id="${h.id}" class="${h.tagName === 'H1' ? 'ch' : ''}">${esc(h.textContent)}</a>`).join('');
  if ('IntersectionObserver' in window) {
    const links = $$('a', rail);
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => { if (en.isIntersecting) links.forEach((a) => a.classList.toggle('on', a.dataset.id === en.target.id)); });
    }, { root: rail.closest('.folha, .camada-c'), rootMargin: '0px 0px -72% 0px' });
    hs.forEach((h) => io.observe(h));
    if (rail.closest('.folha')) folhaIO = io;
  }
}
function docSheet(k, m) {
  FIN.innerHTML = '<div class="docwrap"><article class="doc flow v4" lang="pt-BR"></article><aside class="rail" aria-label="Sections of this sheet"></aside></div>';
  const art = $('article', FIN);
  art.innerHTML = DOCS[k] || '';
  let meta = '';
  if (m) {
    const p = MBY[m.pdf]; const v = VOZ[m.id];
    const leg = v ? v.sub + ' | ' + m.camada : 'Annotation | ' + m.camada;
    meta = `<span>${esc(leg)}</span>` + (p ? `<button type="button" class="fver" data-ver="${p.id}">Open the PDF</button>` : '');
  } else if (TOOLDOC[k]) meta = `<span><strong>${TOOLDOC[k][0]}</strong> | ${TOOLDOC[k][1]}</span>`;
  const op = $('.op', art);
  if (op) op.insertAdjacentHTML('beforeend', (meta ? `<p class="fmeta">${meta}</p>` : '') + '<div class="pauta" aria-hidden="true"></div>');
  buildRail($('.rail', FIN), art, k);
}

function fichaHTML(m) {
  const url = AS + m.arquivo; const arq = m.arquivo.split('/').pop();
  let rel = '';
  if (m.le) rel = `<p class="fpdf-rel">Typeset version of the document read on screen: <a href="#${m.le}">${esc(MBY[m.le].nome)}</a>.</p>`;
  else if (m.ferramenta === 'templates') rel = '<p class="fpdf-rel">The six templates can also be assembled in the <a href="#templates">Templates builder</a>, full screen.</p>';
  return `<div class="fpdf">
    <button type="button" class="fpdf-capa" data-ver="${m.id}" aria-label="View the PDF ${esc(m.nome)}"><img src="${AS + m.capa}" width="560" height="793" alt="First page of the PDF ${esc(m.nome)}" decoding="async"></button>
    <div class="fpdf-txt">
      <h1 class="ft">${esc(m.nome)}</h1>
      ${m.tipo === 'manual' ? `<p class="fpdf-sub"><strong>${m.volume}</strong> | ${esc(m.sub)}</p>` : `<p class="fpdf-lead">${esc(m.lead)}</p>`}
      <div class="pauta" aria-hidden="true"></div>
      <div class="deft narrow">
        <div class="row"><div class="dt">Nature</div><div class="dd">${m.tipo === 'manual' ? 'Manual from the TJPR Appellate Panel collection, in Portuguese' : 'Playbook annex, in Portuguese, layer ' + esc(m.camada)}</div></div>
        <div class="row"><div class="dt">Format</div><div class="dd">PDF, ${fmtKB(m.kb)}</div></div>
        <div class="row"><div class="dt">File</div><div class="dd">${esc(arq)}</div></div>
      </div>
      <div class="acoes"><button type="button" class="btn pri" data-ver="${m.id}">Open the PDF</button><a class="btn ghost" href="${url}" download>Download${ICON.baixa}</a></div>
      ${rel}
    </div>
  </div>`;
}

/* Ferramentas: Calendário, Fundamentos e Ementário abrem no mesmo painel. */
function gstat(id, t) { $('#gs-' + id).textContent = t; }
function abreGadget(id) {
  mostraFerr(id);
  abreParte();
  if (cur.key !== 'ferr:' + id) { cur.key = 'ferr:' + id; FOLHA.scrollTop = 0; }
  if (folhaIO) { folhaIO.disconnect(); folhaIO = null; }
  situa('ferr:' + id);
  if (!BASES[id]) return Promise.resolve(true);
  const k = BASES[id][0];
  if (inited[k]) return Promise.resolve(true);
  const sec = $('#gb-' + id);
  sec.setAttribute('aria-busy', 'true'); gstat(id, 'Loading the base');
  return carregaBase(id).then(() => {
    sec.removeAttribute('aria-busy');
    if (!inited[k]) (k === 'fun' ? initFun : initEme)();
    return true;
  }, () => {
    sec.removeAttribute('aria-busy'); gstat(id, 'The base did not load. Close and open it again.');
    return false;
  });
}

/* Bases pesadas: Fundamentos e Ementário só descem quando a ferramenta é aberta
   (ou quando a busca global as consulta). Cada uma é um script à parte, injetado uma vez. */
const BASES = { fundamentos: ['fun', 'play-fundamentos.js'], ementario: ['eme', 'play-ementario.js'] };
const pronta = {};
const baixando = {};
function carregaBase(id) {
  if (!baixando[id]) {
    const [k, arq] = BASES[id];
    baixando[id] = (D[k] ? Promise.resolve() : new Promise((ok, falha) => {
      const s = document.createElement('script');
      s.src = AS + arq; s.async = true;
      s.onload = ok;
      s.onerror = () => { s.remove(); delete baixando[id]; falha(new Error(arq)); };
      document.head.appendChild(s);
    })).then(() => { if (!pronta[id]) { (k === 'fun' ? prepFun : prepEme)(); pronta[id] = true; } });
  }
  return baixando[id];
}

/* =====================================================================
   CAMADA DE TEMPLATES (tela inteira)
   ===================================================================== */
const CAM = $('#camada');
let camVolta = null;
let ultimaFolha = '';
function abreCamada(sub) {
  if (CAM.hidden) {
    camVolta = document.activeElement;
    CAM.hidden = false; document.body.classList.add('com-camada');
    if (!inited.tpl) { inited.tpl = true; initTpl(); }
    setTimeout(() => $('#camada-x').focus(), 40);
  }
  tplSub(sub);
}
function fechaCamada(semHistorico) {
  if (CAM.hidden) return;
  CAM.hidden = true; document.body.classList.remove('com-camada');
  if (!semHistorico && location.hash.startsWith('#templates')) history.replaceState(null, '', ultimaFolha ? '#' + ultimaFolha : location.pathname + location.search);
  if (camVolta && camVolta.focus && document.contains(camVolta)) camVolta.focus();
}
function tplSub(sub) {
  if (!sub) return;
  if (sub === 'anotados') setTabs($('#t-tabs'), 't', 'a');
  else if (sub.startsWith('templates-')) { setTabs($('#t-tabs'), 't', 't'); setTimeout(() => scrollToId(sub), 40); }
  else if (TPLIDX[sub] != null) { setTabs($('#t-tabs'), 't', 'm'); tplSelect(sub); }
}
$('#camada-x').addEventListener('click', () => fechaCamada());
CAM.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  const f = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', CAM).filter((el) => !el.disabled && el.offsetParent !== null);
  if (!f.length) return;
  if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
  else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
});

/* =====================================================================
   LEITOR DE PDF
   "ver" abre o PDF na própria página, como livro aberto: a primeira página
   sozinha e depois duas a duas; no celular, uma por vez. O pdf.js carrega
   só no primeiro uso, do mesmo endereço que o ECHO usa.
   ===================================================================== */
const LEI = $('#leitor');
const LIVRO = $('#leitor-livro');
const PGS = $$('.leitor-pg', LIVRO);
const PALCO = $('#leitor-palco');
const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
const MQL = window.matchMedia('(max-width: 760px)');
const lei = { doc: null, url: '', abs: [], i: 0, ciclo: 0, volta: null, carga: null, m: null };
const pad2 = (n) => String(n).padStart(2, '0');
function carregaPdfjs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (!lei.carga) {
    lei.carga = new Promise((ok, falha) => {
      const sc = document.createElement('script'); sc.src = PDFJS + 'pdf.min.js'; sc.async = true;
      sc.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js'; ok(window.pdfjsLib); };
      sc.onerror = () => { lei.carga = null; falha(new Error('pdf.js unavailable')); };
      document.head.appendChild(sc);
    });
  }
  return lei.carga;
}
function aberturas() {
  const n = lei.doc.numPages; const a = [];
  if (MQL.matches) { for (let p = 1; p <= n; p++) a.push([p]); return a; }
  a.push([1]);
  for (let p = 2; p <= n; p += 2) a.push(p + 1 <= n ? [p, p + 1] : [p]);
  return a;
}
async function mostra() {
  if (!lei.doc) return;
  const ciclo = ++lei.ciclo; const ab = lei.abs[lei.i]; const n = lei.doc.numPages;
  LIVRO.classList.add('vira');
  const pags = await Promise.all(ab.map((p) => lei.doc.getPage(p)));
  if (ciclo !== lei.ciclo) return;
  const base = pags[0].getViewport({ scale: 1 });
  const lado = MQL.matches ? 48 : 104; const alto = MQL.matches ? 64 : 92;
  const W = Math.max(120, PALCO.clientWidth - lado * 2); const H = Math.max(160, PALCO.clientHeight - alto);
  const esc1 = Math.min((ab.length === 2 ? W / 2 : W) / base.width, H / base.height);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  await Promise.all(pags.map(async (pg, k) => {
    const cv = PGS[k]; const vp = pg.getViewport({ scale: esc1 * dpr });
    const off = document.createElement('canvas'); off.width = Math.floor(vp.width); off.height = Math.floor(vp.height);
    await pg.render({ canvasContext: off.getContext('2d', { alpha: false }), viewport: vp }).promise;
    if (ciclo !== lei.ciclo) return;
    cv.width = off.width; cv.height = off.height; cv.getContext('2d').drawImage(off, 0, 0);
    cv.style.width = Math.round(base.width * esc1) + 'px'; cv.style.height = Math.round(base.height * esc1) + 'px';
  }));
  if (ciclo !== lei.ciclo) return;
  PGS.forEach((cv, k) => { cv.hidden = k >= ab.length; });
  LIVRO.dataset.n = String(ab.length);
  LIVRO.classList.remove('vira');
  $('#leitor-n').textContent = (ab.length === 2 ? pad2(ab[0]) + '–' + pad2(ab[1]) : pad2(ab[0])) + ' / ' + pad2(n);
  $('#leitor-st').textContent = ab.length === 2 ? 'PDF | double page' : 'PDF | page';
  $('#leitor-ant').disabled = lei.i <= 0;
  $('#leitor-prox').disabled = lei.i >= lei.abs.length - 1;
}
async function abreLeitor(m) {
  if (!m || !m.arquivo) return;
  lei.m = m;
  if (LEI.hidden) lei.volta = document.activeElement;
  const url = AS + m.arquivo;
  $('#leitor-t').textContent = m.nome;
  const bx = $('#leitor-baixa'); bx.href = url; bx.setAttribute('download', m.arquivo.split('/').pop());
  $('#leitor-n').textContent = '…'; $('#leitor-st').textContent = 'Loading the PDF';
  $('#leitor-ant').disabled = true; $('#leitor-prox').disabled = true;
  if (lei.url !== url) PGS.forEach((cv) => { cv.hidden = true; });
  LEI.hidden = false; document.documentElement.classList.add('com-leitor');
  void LEI.offsetWidth; LEI.classList.add('on');
  $('#leitor-x').focus({ preventScroll: true });
  const ciclo = ++lei.ciclo;
  try {
    const lib = await carregaPdfjs();
    if (lei.url !== url) { lei.doc = await lib.getDocument(url).promise; lei.url = url; }
    if (ciclo !== lei.ciclo || LEI.hidden) return;
    lei.abs = aberturas(); lei.i = 0;
    await mostra();
  } catch (err) {
    lei.doc = null; lei.url = '';
    $('#leitor-n').textContent = '';
    $('#leitor-st').innerHTML = `The PDF could not be opened here. <a href="${url}" target="_blank" rel="noopener">Open in a new tab</a>`;
  }
}
function fechaLeitor() {
  if (LEI.hidden) return;
  lei.ciclo++;
  LEI.classList.remove('on'); document.documentElement.classList.remove('com-leitor');
  setTimeout(() => { if (!LEI.classList.contains('on')) LEI.hidden = true; }, RM.matches ? 0 : 420);
  const v = lei.volta; lei.volta = null;
  if (v && v.focus && document.contains(v)) v.focus({ preventScroll: true });
}
function vira(d) {
  if (!lei.doc) return;
  const j = Math.min(lei.abs.length - 1, Math.max(0, lei.i + d));
  if (j !== lei.i) { lei.i = j; mostra(); }
}
$('#leitor-ant').addEventListener('click', () => vira(-1));
$('#leitor-prox').addEventListener('click', () => vira(1));
$('#leitor-x').addEventListener('click', fechaLeitor);
LEI.addEventListener('click', (e) => { if (e.target === PALCO) fechaLeitor(); });
LEI.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { e.preventDefault(); fechaLeitor(); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); vira(-1); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); vira(1); }
  else if (e.key === 'Tab') {
    const f = $$('button:not(:disabled), a[href]', LEI);
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  }
});
let leiTimer;
window.addEventListener('resize', () => {
  if (LEI.hidden || !lei.doc) return;
  clearTimeout(leiTimer);
  leiTimer = setTimeout(() => { const p = lei.abs[lei.i][0]; lei.abs = aberturas(); lei.i = Math.max(0, lei.abs.findIndex((a) => a.includes(p))); mostra(); }, 160);
});
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-ver]'); if (!b) return;
  e.preventDefault(); abreLeitor(MBY[b.dataset.ver]);
});

/* =====================================================================
   ROTEAMENTO
   Sem hash, a partitura. Com hash, o material abre sobre ela.
   ===================================================================== */
function setTabs(tabsEl, prefix, tab) {
  $$('button', tabsEl).forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
  $$('button', tabsEl).forEach((b) => { const p = $('#' + prefix + '-' + b.dataset.tab); if (p) p.hidden = b.dataset.tab !== tab; });
  const pane = $('#' + prefix + '-' + tab); if (pane) lazyDocs(pane);
}
function bindTabs(id, prefix, onChange) {
  const el = $('#' + id);
  el.addEventListener('click', (e) => { const b = e.target.closest('button[data-tab]'); if (!b) return; setTabs(el, prefix, b.dataset.tab); if (onChange) onChange(b.dataset.tab); });
  el.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const bs = $$('button', el); const i = bs.indexOf(document.activeElement); if (i < 0) return;
    const n = bs[(i + (e.key === 'ArrowRight' ? 1 : bs.length - 1)) % bs.length]; n.focus(); n.click();
  });
}
function lazyDocs(scope) { $$('[data-doc]', scope).forEach((el) => { if (el.tagName === 'ARTICLE' && !el.dataset.done) { renderDoc(el, el.dataset.doc); el.dataset.done = '1'; } }); }

function route() {
  const h = decodeURIComponent(location.hash.slice(1));
  const parts = h.split('/'); const v = parts[0]; const sub = parts.slice(1).join('/') || null;
  if (v === 'templates') { fechaGaveta(); abreCamada(sub); return; }
  fechaCamada(true);
  ultimaFolha = h;
  if (GAV.has(v)) { fechaParte(); abreGaveta(v); return; }
  fechaGaveta();
  if (v === 'calendario') {
    if (sub === 'ano') { showSheet('cal-ano'); return; }
    if (sub) { showSheet('doc:calendario-base', sub === 'base' ? null : sub); return; }
    abreGadget('calendario'); return;
  }
  if (v === 'fundamentos') {
    if (sub === 'regra' || (sub && sub.startsWith('fundamentos-'))) { showSheet('doc:fundamentos-regra', sub === 'regra' ? null : sub); return; }
    abreGadget('fundamentos').then((ok) => { if (ok && sub && cur.key === 'ferr:fundamentos') funSelect(sub); }); return;
  }
  if (v === 'ementario') {
    if (sub === 'regra' || (sub && sub.startsWith('ementario-'))) { showSheet('doc:ementario-regra', sub === 'regra' ? null : sub); return; }
    abreGadget('ementario').then((ok) => { if (ok && sub && cur.key === 'ferr:ementario') emeSelect(sub); }); return;
  }
  if (MBY[v]) { showSheet(v, sub); return; }
  fechaParte();
}
function navigate(href) {
  if (location.hash === href) route(); else location.hash = href;
}
$('.salto').addEventListener('click', (e) => { e.preventDefault(); SIS.focus(); });

/* Ações dos registros */
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const a = b.dataset.act; const id = b.dataset.id;
  if (a === 'voltar') {
    if (b.closest('#f-det')) { setFunView('list'); $('#f-q').focus(); } else { setEmeView('list'); $('#e-q').focus(); }
  } else if (a === 'f-cp') copy(FBY[id].b, 'Wording copied. Adapt it to the case and the Guide before use.');
  else if (a === 'f-lk') copy(BASE + '#fundamentos/' + id, 'Record link copied.');
  else if (a === 'f-em') {
    const f = FBY[id]; es.q = fs.q.trim() || f.t.replace(/\s*\(.*\)\s*$/, ''); es.cur = null;
    history.replaceState(null, '', '#ementario');
    abreGadget('ementario').then((ok) => { if (!ok) return; $('#e-q').value = es.q; setEmeView('list'); renderEmeLeft(); });
  } else if (a === 'e-cp') copy(EBY[id].eb, 'Base headnote copied. Fill in the gaps according to the Guide.');
  else if (a === 'e-lk') copy(BASE + '#ementario/' + id, 'Record link copied.');
  else if (a === 'e-fn') {
    const en = EBY[id]; fs.q = es.q.trim() || en.d; fs.cur = null; fs.cat = 'all';
    history.replaceState(null, '', '#fundamentos');
    abreGadget('fundamentos').then((ok) => { if (!ok) return; $('#f-q').value = fs.q; setFunView('list'); renderFunList(); });
  }
});
FIN.addEventListener('click', (e) => {
  const go = e.target.closest('[data-go]'); if (go) { showSheet('eme:' + go.dataset.go); return; }
  const y = e.target.closest('[data-y]'); if (y) { calYear = +y.dataset.y; renderYear(); }
});

/* =====================================================================
   CALENDÁRIO
   ===================================================================== */
const CAL = new Map(D.cal.map(([d, s, o]) => [d, { s, o }]));
const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const pdate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addD = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const br = (d) => pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WDL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MESL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const isoBr = (s) => (s ? s.split('-').reverse().join('/') : '');
const brIso = (s) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s || ''); if (!m) return null;
  const d = new Date(+m[3], +m[2] - 1, +m[1]);
  return d.getFullYear() === +m[3] && d.getMonth() === +m[2] - 1 && d.getDate() === +m[1] ? `${m[3]}-${m[2]}-${m[1]}` : null;
};
function campoData(id, get, set) {
  const t = $('#' + id); const w = t.closest('.data'); const n = $('.data-n', w);
  t.value = isoBr(get());
  t.addEventListener('input', () => {
    let v = t.value.replace(/\D/g, '').slice(0, 8);
    if (v.length > 4) v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4); else if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
    if (v !== t.value) t.value = v;
    const iso = brIso(v);
    t.setAttribute('aria-invalid', String(v.length === 10 && !iso));
    if (iso) set(iso); else if (!v) set('');
  });
  $('.data-b', w).addEventListener('click', () => { n.value = get() || ''; try { n.showPicker(); } catch (e) { n.focus(); n.click(); } });
  n.addEventListener('change', () => { if (n.value) { t.value = isoBr(n.value); t.removeAttribute('aria-invalid'); set(n.value); } });
}
const today = new Date();
const DEF_MARCO = today.getFullYear() === 2026 ? iso(today) : '2026-10-07';
const cs = { mode: 'prazo', marco: DEF_MARCO, n: 10, dje: false, a: '2026-02-02', b: '2026-03-06', loc: 'cwb', ex: [] };

function dayInfo(dt, o) {
  const k = iso(dt); const r = CAL.get(k);
  if (!r) return { cov: false, k };
  let s = r.s, obs = r.o, user = false;
  const we = dt.getDay() === 0 || dt.getDay() === 6;
  if (o.loc === 'out' && /Padroeira de Curitiba/.test(obs) && !we) { s = 1; obs = 'Curitiba holiday disregarded (other district)'; }
  if (o.ex.includes(k)) { s = 0; obs = (obs ? obs + '; ' : '') + 'Exclusion entered for the case'; user = true; }
  return { cov: true, k, s, obs, we, onlyWe: we && /^Fim de semana$/.test(obs || ''), hist: dt.getFullYear() === 2025, user };
}
function calcPrazo(o) {
  const r = { rows: [], hist: false, blocked: false, ex: [], due: null, first: null, pub: null };
  const m = pdate(o.marco);
  const mi = dayInfo(m, o);
  if (!mi.cov) { r.blocked = true; return r; }
  if (mi.hist) r.hist = true;
  let start = m;
  if (o.dje) {
    r.rows.push({ cls: 'info', k: 'D', d: m, why: 'Availability in the DJe' });
    let p = m;
    for (;;) {
      p = addD(p, 1); const x = dayInfo(p, o);
      if (!x.cov) { r.blocked = true; return r; }
      if (x.hist) r.hist = true;
      if (x.s) break;
      r.rows.push({ cls: x.onlyWe ? 'we' : 'x', k: 'N', d: p, why: x.obs }); if (!x.onlyWe) r.ex.push({ d: p, why: x.obs });
    }
    r.pub = p; r.rows.push({ cls: 'info', k: 'P', d: p, why: 'Publication: first business day after availability' }); start = p;
  } else r.rows.push({ cls: 'info', k: 'M', d: m, why: 'Start event: first day, excluded from the count' });
  let k = 0, d = start;
  while (k < o.n) {
    d = addD(d, 1); const x = dayInfo(d, o);
    if (!x.cov) { r.blocked = true; return r; }
    if (x.hist) r.hist = true;
    if (x.s) { k++; if (k === 1) r.first = d; r.rows.push({ cls: k === o.n ? 'due' : 'c', k: String(k), d, why: k === o.n ? 'Due date' : '' }); }
    else { r.rows.push({ cls: x.onlyWe ? 'we' : 'x', k: 'N', d, why: x.obs }); if (!x.onlyWe) r.ex.push({ d, why: x.obs }); }
  }
  r.due = d; return r;
}
function calcInt(o) {
  const a = pdate(o.a), b = pdate(o.b);
  const r = { n: 0, days: 0, ex: [], we: 0, hist: false, blocked: false, bad: b <= a };
  if (r.bad) return r;
  let d = a;
  while (d < b) {
    d = addD(d, 1); r.days++;
    const x = dayInfo(d, o);
    if (!x.cov) { r.blocked = true; return r; }
    if (x.hist) r.hist = true;
    if (x.s) r.n++; else if (x.onlyWe) r.we++; else r.ex.push({ d, why: x.obs });
  }
  return r;
}
function monthsHTML(from, to, marks) {
  let y = from.getFullYear(), m = from.getMonth(); const out = [];
  let guard = 0;
  while ((y < to.getFullYear() || (y === to.getFullYear() && m <= to.getMonth())) && guard++ < 6) {
    out.push(monthHTML(y, m, marks)); m++; if (m > 11) { m = 0; y++; }
  }
  return `<div class="months">${out.join('')}</div>`;
}
function monthHTML(y, m, marks) {
  const first = new Date(y, m, 1); const lead = (first.getDay() + 6) % 7; const days = new Date(y, m + 1, 0).getDate();
  let cells = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((w) => `<span class="wd" aria-hidden="true">${w}</span>`).join('');
  for (let i = 0; i < lead; i++) cells += '<span></span>';
  for (let dd = 1; dd <= days; dd++) {
    const dt = new Date(y, m, dd); const k = iso(dt); const x = dayInfo(dt, marks.o);
    let cls = 'd'; let kk = '';
    if (!x.cov) cls += ' we';
    else if (x.user) cls += ' u';
    else if (!x.s && !x.onlyWe) cls += ' x';
    else if (x.onlyWe) cls += ' we';
    if (marks.count && marks.count[k]) { cls = 'd c'; kk = marks.count[k]; }
    if (marks.mk && marks.mk === k) cls += ' mk';
    if (marks.due && marks.due === k) cls += ' due';
    const title = x.cov ? (x.obs || 'Countable') : 'Outside the base';
    cells += `<span class="${cls}" title="${esc(br(dt) + ' | ' + title)}"><span>${dd}</span>${kk ? `<span class="k">${kk}</span>` : ''}</span>`;
  }
  return `<div class="mon"><div class="mh">${cap(MESL[m])} ${y}</div><div class="grid">${cells}</div></div>`;
}
function trailText(r, o) {
  const L = [`Count | Playbook, Legal Calendar | civil, in business days | ${o.loc === 'cwb' ? 'Curitiba' : 'other district (no local holidays)'}`];
  r.rows.forEach((x) => L.push(`${x.k.padStart(2, ' ')} | ${br(x.d)} | ${WD[x.d.getDay()]}${x.why ? ' | ' + x.why : ''}`));
  if (r.due) L.push(`Due date: ${br(r.due)} (${WDL[r.due.getDay()]})`);
  if (o.ex.length) L.push('Exclusions entered: ' + o.ex.map((k) => br(pdate(k))).join(', '));
  return L.join('\n');
}
const LEGENDA = '<div class="legend"><span><i style="box-shadow: inset 0 0 0 2px var(--ink);"></i>Start event</span><span><i style="background: var(--accent-tint);"></i>Counted day</span><span><i style="background: var(--support);"></i>Excluded by the table</span><span><i style="background: repeating-linear-gradient(135deg, var(--support-tint) 0 3px, var(--paper) 3px 6px);"></i>Exclusion entered</span><span><i style="background: var(--ink);"></i>Due date</span></div>';
function renderCal() {
  $$('#c-form [data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === cs.mode)));
  $('#c-prazo').style.display = cs.mode === 'prazo' ? 'flex' : 'none';
  $('#c-int').style.display = cs.mode === 'int' ? 'flex' : 'none';
  $('#c-djew').style.display = cs.mode === 'prazo' ? 'flex' : 'none';
  const res = $('#c-res');
  $('#c-ml').textContent = cs.dje ? 'Availability in the DJe' : 'Start event (service or publication)';
  $('#c-xl').innerHTML = cs.ex.map((k) => `<span class="chip">${br(pdate(k))}<button type="button" aria-label="Remove ${br(pdate(k))}" data-rm="${k}"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></span>`).join('');
  const out = $('#c-out'); const warns = [];
  const trilhaAberta = !!($('.trilha', out) && $('.trilha', out).open);
  if (cs.loc === 'out') warns.push('<div class="box warn"><div class="lbl">Other district</div><p>The 8 September holiday (Curitiba) is no longer excluded. The table does not include local holidays of other districts: add them to the case exclusions.</p></div>');
  if (cs.mode === 'prazo') {
    if (!cs.marco || !(cs.n >= 1)) { res.innerHTML = '<p class="small">Enter the start event and the number of business days.</p>'; out.innerHTML = ''; gstat('calendario', 'Enter the start event and business days'); return; }
    const r = calcPrazo(cs);
    if (r.hist) warns.unshift('<div class="box warn"><div class="lbl">2025, historical</div><p>The interval reaches 2025, a base preserved without an annual regulatory check. Check the 2025 sources and the location before concluding.</p></div>');
    if (r.blocked) {
      res.innerHTML = '<div class="box warn"><div class="lbl">Interval not covered</div><p>The count goes beyond the available base (2025 and 2026; there is no 2027 table). The tool does not conclude the deadline: recover the base for the period before proceeding.</p></div>';
      out.innerHTML = warns.join('');
      gstat('calendario', 'Outside the available base');
      return;
    }
    const exTxt = r.ex.length ? 'Excluded by the table: ' + r.ex.map((x) => `${br(x.d).slice(0, 5)} (${esc(x.why.split(';')[0].replace(/ \(.*\)$/, ''))})`).join(', ') + ', besides weekends.' : 'No holidays or suspensions in the interval; only weekends excluded.';
    const count = {}; r.rows.forEach((x) => { if (x.cls === 'c' || x.cls === 'due') count[iso(x.d)] = x.k; });
    res.innerHTML = `<div class="dark"><p class="big"><span class="pre">Due on</span> <span class="dt">${r.due.getDate()} ${MESL[r.due.getMonth()]} ${r.due.getFullYear()}</span></p><p class="sub">${cap(WDL[r.due.getDay()])}, business day ${cs.n}${r.pub ? `, published on ${br(r.pub)}` : ''}</p></div>`;
    out.innerHTML = `
      <p class="gtxt">Count starts on <strong>${br(r.first)}</strong>. ${exTxt}</p>
      ${warns.join('')}
      ${monthsHTML(pdate(cs.marco), r.due, { o: cs, count, mk: cs.marco, due: iso(r.due) })}
      ${LEGENDA}
      <details class="trilha"${trilhaAberta ? ' open' : ''}><summary>Verification trail</summary><button type="button" class="btn ghost sm" id="c-copy">Copy trail</button>
      <div class="trail">${r.rows.map((x) => `<div class="tr ${x.cls}"><span class="k">${x.k}</span><span class="mono">${br(x.d)}</span><span>${WD[x.d.getDay()]}</span><span>${esc(x.why || '')}</span></div>`).join('')}</div></details>
      <div class="box"><div class="lbl">Limits of the base</div><p>Count under CPC art. 224: excludes the first day and includes the due date. The table covers 2026 (active) and 2025 (historical); there is no 2027. The count field does not indicate court hours, and the date of service, availability, or publication is still determined in the case.</p></div>`;
    $('#c-copy').onclick = () => copy(trailText(r, cs), 'Trail copied.');
    gstat('calendario', `Due on ${br(r.due)}, ${WDL[r.due.getDay()]}`);
  } else {
    if (!cs.a || !cs.b) { res.innerHTML = '<p class="small">Enter both dates.</p>'; out.innerHTML = ''; gstat('calendario', 'Enter both dates'); return; }
    const r = calcInt(cs);
    if (r.bad) { res.innerHTML = '<div class="box warn"><div class="lbl">Dates</div><p>The end date must be after the start date.</p></div>'; out.innerHTML = ''; gstat('calendario', 'Dates to fix'); return; }
    if (r.blocked) { res.innerHTML = '<div class="box warn"><div class="lbl">Interval not covered</div><p>The interval goes beyond the available base (2025 and 2026). The tool does not conclude the count.</p></div>'; out.innerHTML = ''; gstat('calendario', 'Outside the available base'); return; }
    if (r.hist) warns.unshift('<div class="box warn"><div class="lbl">2025, historical</div><p>The interval reaches 2025, a base preserved without an annual regulatory check.</p></div>');
    res.innerHTML = `<div class="dark"><p class="big">${r.n} business day${r.n === 1 ? '' : 's'}</p><p class="sub">From ${br(pdate(cs.a))}, excluded, to ${br(pdate(cs.b))}, included</p></div>`;
    out.innerHTML = `
      <p class="gtxt">${r.days} calendar days, ${r.we} on weekends${r.ex.length ? ' and ' + r.ex.length + ' excluded by the table' : ''}.</p>
      ${warns.join('')}
      ${r.ex.length ? `<div class="trail">${r.ex.map((x) => `<div class="tr x"><span class="k">N</span><span class="mono">${br(x.d)}</span><span>${WD[x.d.getDay()]}</span><span>${esc(x.why)}</span></div>`).join('')}</div>` : ''}
      ${monthsHTML(pdate(cs.a), pdate(cs.b), { o: cs, mk: cs.a, due: cs.b })}
      <div class="box"><div class="lbl">Convention</div><p>Excludes the start date and includes the end date, as in the count under CPC art. 224. Weekends, holidays, recess, and the table’s suspensions are not counted.</p></div>`;
    gstat('calendario', `${r.n} business days in the interval`);
  }
}
let calYear = 2026;
function anoHTML() {
  return `<div class="ffer">
    <h1 class="ft">Legal Calendar</h1>
    <p class="fmeta"><span><strong>Calendar</strong> | annual table, civil, in business days</span><span>Judicial Decree No. 621/2025 | Curitiba | CPC art. 224</span></p>
    <div class="pauta" aria-hidden="true"></div>
    <div class="anobar"><div class="segc" role="group" aria-label="Year" id="c-anos"><button type="button" data-y="2026" aria-pressed="true">2026 | active</button><button type="button" data-y="2025" aria-pressed="false">2025 | historical</button></div>
    <div class="legend"><span><i style="background: var(--support);"></i>Excluded (holiday, recess, suspension)</span><span><i style="background: var(--paper); box-shadow: inset 0 0 0 1px var(--rule);"></i>Countable</span><span><i style="box-shadow: inset 0 0 0 1px #707070;"></i>Weekend</span></div></div>
    <div id="c-yw"></div>
    <div class="months" id="c-year"></div>
  </div>`;
}
function renderYear() {
  if (!$('#c-year')) return;
  $$('#c-anos [data-y]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.y === calYear)));
  $('#c-yw').innerHTML = calYear === 2025 ? '<div class="box warn"><div class="lbl">Source history</div><p>Preserved to avoid document loss; it has not received an annual regulatory check and is distinct from the active 2026 table.</p></div>' : '';
  let h = ''; for (let m = 0; m < 12; m++) h += monthHTML(calYear, m, { o: { loc: 'cwb', ex: [] } });
  $('#c-year').innerHTML = h;
}
function initCal() {
  $('#c-n').value = cs.n;
  let xTmp = '';
  campoData('c-m', () => cs.marco, (v) => { cs.marco = v; renderCal(); });
  campoData('c-a', () => cs.a, (v) => { cs.a = v; renderCal(); });
  campoData('c-b', () => cs.b, (v) => { cs.b = v; renderCal(); });
  campoData('c-x', () => xTmp, (v) => { xTmp = v; });
  $('#c-form').addEventListener('click', (e) => {
    const b = e.target.closest('[data-mode]'); if (b) { cs.mode = b.dataset.mode; renderCal(); }
    const rm = e.target.closest('[data-rm]'); if (rm) { cs.ex = cs.ex.filter((k) => k !== rm.dataset.rm); renderCal(); }
  });
  $('#c-n').addEventListener('input', (e) => { cs.n = Math.min(250, parseInt(e.target.value, 10) || 0); renderCal(); });
  $('#c-dje').addEventListener('change', (e) => { cs.dje = e.target.checked; renderCal(); });
  $('#c-l').addEventListener('change', (e) => { cs.loc = e.target.value; renderCal(); });
  $('#c-xadd').addEventListener('click', () => { const v = xTmp; if (v && !cs.ex.includes(v)) { cs.ex.push(v); cs.ex.sort(); xTmp = ''; $('#c-x').value = ''; renderCal(); } });
  renderCal();
}

/* =====================================================================
   TEMPLATES
   ===================================================================== */
const TPLIDX = {}; D.tpl.forEach((t, i) => { TPLIDX[t.id] = i; });
const RESULTS = {
  'RI-CONHECIDO': ['desprovimento com confirmação pelos próprios fundamentos', 'desprovimento com fundamentação própria ou complementar', 'parcial provimento', 'provimento'],
  'ED-ACOLHIMENTO': ['acolhimento integral', 'acolhimento parcial']
};
const RLABEL = { 'desprovimento com confirmação pelos próprios fundamentos': 'Denied | affirmed on its own grounds', 'desprovimento com fundamentação própria ou complementar': 'Denied | own reasoning', 'parcial provimento': 'Partially granted', 'provimento': 'Granted', 'acolhimento integral': 'Fully upheld', 'acolhimento parcial': 'Partially upheld' };
const DEPS = { 'desprovimento e cabível condenação sucumbencial': (res) => /^desprovimento/.test(res || '') };
const AUTOALT = {
  'manutenção | reforma | reforma parcial': (res) => (/^desprovimento/.test(res) ? 'manutenção' : res === 'parcial provimento' ? 'reforma parcial' : res === 'provimento' ? 'reforma' : null),
  'acolhimento | acolhimento parcial': (res) => (res === 'acolhimento integral' ? 'acolhimento' : res === 'acolhimento parcial' ? 'acolhimento parcial' : null)
};
const BLOCKGAP = /^(desenvolvimento|análise|fundamentação|conclusão|parágrafo|consequências|identificação|precedente|referência|ementa)/;
const TS = {}; let tcur = D.tpl[0].id; let ghost = false;
function tstate(id) {
  if (!TS[id]) { const r = RESULTS[id]; TS[id] = { res: r ? r[0] : null, on: {}, gaps: {}, alts: {}, n: 2 }; applyAuto(id); }
  return TS[id];
}
function applyAuto(id) {
  const st = TS[id]; const t = D.tpl[TPLIDX[id]];
  const walk = (items, pre) => items.forEach((it, i) => {
    const key = pre + i;
    if (it.p) { const parts = it.p.split(/\{([^}]*)\}/); parts.forEach((p, j) => { if (j % 2 && AUTOALT[p]) { const v = AUTOALT[p](st.res); if (v) st.alts[key + '#' + j] = v; } }); }
    else walk(it.ch, key + '.');
  });
  walk(t.items, '');
}
function tmodel(id) {
  const t = D.tpl[TPLIDX[id]]; const st = tstate(id); const rset = RESULTS[id] || [];
  const conds = [];
  const walk = (items, pre, rep, depth, parentOn) => {
    const out = [];
    items.forEach((it, i) => {
      const key = pre + i;
      if (it.p) {
        const parts = it.p.split(/\{([^}]*)\}/); const segs = [];
        parts.forEach((p, j) => {
          if (!(j % 2)) { if (p) segs.push({ t: 'txt', v: p }); return; }
          const k = key + '#' + j + rep;
          if (p.includes(' | ')) segs.push({ t: 'alt', k, opts: p.split(' | '), raw: p });
          else segs.push({ t: 'gap', k, ph: p, block: parts.length === 3 && !parts[0].trim() && !parts[2].trim() && BLOCKGAP.test(p) });
        });
        out.push({ t: 'p', segs });
      } else if (it.k === 'se') {
        const isRes = rset.includes(it.c);
        let active, enabled = parentOn;
        if (isRes) active = st.res === it.c;
        else {
          if (DEPS[it.c] && !DEPS[it.c](st.res)) enabled = false;
          if (!rep || rep === '@1') conds.push({ key, c: it.c, depth, enabled, on: !!st.on[key] });
          active = enabled && !!st.on[key];
        }
        if (active) out.push(...walk(it.ch, key + '.', rep, depth + (isRes ? 0 : 1), true));
        else if (ghost) out.push({ t: 'ghost', kind: 'IF', c: it.c });
        if (!active && !isRes && (!rep || rep === '@1')) collectConds(it.ch, key + '.', depth + 1);
      } else {
        const reps = [];
        for (let r = 1; r <= st.n; r++) reps.push({ label: 'Appeal ' + r, nodes: walk(it.ch, key + '.', '@' + r, depth, parentOn) });
        out.push({ t: 'rep', c: it.c, reps });
      }
    });
    return out;
  };
  const collectConds = (items, pre, depth) => items.forEach((it, i) => {
    if (it.k === 'se' && !rset.includes(it.c)) { conds.push({ key: pre + i, c: it.c, depth, enabled: false, on: !!st.on[pre + i] }); collectConds(it.ch, pre + i + '.', depth + 1); }
    else if (it.ch) collectConds(it.ch, pre + i + '.', depth);
  });
  const nodes = walk(t.items, '', '', 0, true);
  return { t, st, nodes, conds, hasRep: t.items.some(function f(x) { return x.k === 'each' || (x.ch && x.ch.some(f)); }) };
}
function nodesHTML(nodes, st) {
  return nodes.map((n) => {
    if (n.t === 'ghost') return `<div class="ghost"><b>${n.kind}</b>${esc(n.c)}</div>`;
    if (n.t === 'rep') return n.reps.map((r) => `<div class="rep"><span class="rl">${r.label} | for each ${esc(n.c)}</span>${nodesHTML(r.nodes, st)}</div>`).join('');
    if (n.segs.length === 1 && n.segs[0].t === 'gap' && n.segs[0].block) {
      const g = n.segs[0]; const v = st.gaps[g.k] || '';
      return `<textarea class="gap${v ? ' filled' : ''}" data-k="${g.k}" placeholder="${esc(g.ph)}" aria-label="${esc(g.ph)}">${esc(v)}</textarea>`;
    }
    return '<p>' + n.segs.map((s) => {
      if (s.t === 'txt') return esc(s.v);
      if (s.t === 'alt') { const v = st.alts[s.k] || ''; return `<select class="alt" data-a="${s.k}" aria-label="Alternative: ${esc(s.raw)}"><option value="">${esc(s.raw)}</option>${s.opts.map((o) => `<option${o === v ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`; }
      const v = st.gaps[s.k] || '';
      const w = Math.min(Math.max(s.ph.length + 2, 8), 56);
      return `<input class="gap${v ? ' filled' : ''}" data-k="${s.k}" value="${esc(v)}" placeholder="${esc(s.ph)}" aria-label="${esc(s.ph)}" style="width: ${w}ch">`;
    }).join('') + '</p>';
  }).join('');
}
function nodesText(nodes, st) {
  const out = [];
  nodes.forEach((n) => {
    if (n.t === 'ghost') return;
    if (n.t === 'rep') { n.reps.forEach((r) => out.push(...nodesText(r.nodes, st))); return; }
    out.push(n.segs.map((s) => s.t === 'txt' ? s.v : s.t === 'alt' ? (st.alts[s.k] || '{' + s.raw + '}') : ((st.gaps[s.k] || '').trim() || '{' + s.ph + '}')).join(''));
  });
  return out;
}
function pending(nodes, st) {
  let g = 0, a = 0;
  const walk = (ns) => ns.forEach((n) => { if (n.t === 'rep') n.reps.forEach((r) => walk(r.nodes)); else if (n.t === 'p') n.segs.forEach((s) => { if (s.t === 'gap' && !(st.gaps[s.k] || '').trim()) g++; if (s.t === 'alt' && !st.alts[s.k]) a++; }); });
  walk(nodes); return { g, a };
}
let tmod = null;
function renderTpl() {
  tmod = tmodel(tcur); const { t, st, nodes, conds, hasRep } = tmod;
  $$('#t-list button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === tcur)));
  const rset = RESULTS[tcur];
  $('#t-res').innerHTML = rset ? `<div class="lbl" style="margin-bottom: 8px;">Result</div><div class="radio">${rset.map((r) => `<button type="button" data-res="${esc(r)}" aria-pressed="${st.res === r}">${RLABEL[r]}</button>`).join('')}</div>`
    : `<div class="lbl" style="margin-bottom: 6px;">Result</div><p style="font-size: 15px;">${esc(cap(t.res))}</p>`;
  $('#t-conds').innerHTML = conds.length ? `<div class="lbl" style="margin-bottom: 4px;">Case conditions</div><div class="cgroup">${conds.map((c) => `<label class="chk${c.depth ? ' sub' + (c.depth > 1 ? '2' : '') : ''}${c.enabled ? '' : ' dis'}"><input type="checkbox" data-c="${c.key}"${c.on ? ' checked' : ''}${c.enabled ? '' : ' disabled'}><span>If ${esc(c.c)}</span></label>`).join('')}</div>` : '';
  $('#t-rep').innerHTML = hasRep ? `<div class="field"><label for="t-n">Appeals in the joint judgment</label><input id="t-n" class="input mono" type="number" min="2" max="8" value="${st.n}"></div>` : '';
  $('#t-ed').innerHTML = `<div class="small" style="margin-bottom: 4px;"><strong style="color: var(--ink);">${t.id}</strong> | ${esc(t.classe)} | ${esc(t.apl)}</div>` + nodesHTML(nodes, st);
  $('#t-ghost').setAttribute('aria-pressed', String(ghost)); $('#t-ghost').textContent = ghost ? 'Hide inactive blocks' : 'Show inactive blocks';
  updStatus();
}
function updStatus() {
  const p = pending(tmod.nodes, tmod.st);
  $('#t-status').innerHTML = p.g + p.a ? `<strong style="color: var(--accent-ink);">${p.g} gap${p.g === 1 ? '' : 's'}</strong>${p.a ? ` and <strong style="color: var(--accent-ink);">${p.a} alternative${p.a === 1 ? '' : 's'}</strong>` : ''} pending` : '<strong>Draft complete</strong>: no pending gaps';
}
function tplSelect(id) { if (TPLIDX[id] == null) return; tcur = id; renderTpl(); }
function initTpl() {
  bindTabs('t-tabs', 't');
  $('#t-list').innerHTML = D.tpl.map((t) => `<button type="button" data-id="${t.id}" aria-pressed="false"><span class="tid">${t.id}</span><span class="small" style="color: inherit; opacity: .8;">${esc(cap(t.res))}</span></button>`).join('');
  $('#t-list').addEventListener('click', (e) => { const b = e.target.closest('[data-id]'); if (b) { tcur = b.dataset.id; history.replaceState(null, '', '#templates/' + tcur); renderTpl(); } });
  $('#t-res').addEventListener('click', (e) => { const b = e.target.closest('[data-res]'); if (b) { tstate(tcur).res = b.dataset.res; applyAuto(tcur); renderTpl(); } });
  $('#t-conds').addEventListener('change', (e) => { const c = e.target.closest('[data-c]'); if (c) { tstate(tcur).on[c.dataset.c] = c.checked; renderTpl(); } });
  $('#t-rep').addEventListener('input', (e) => { if (e.target.id === 't-n') { const v = parseInt(e.target.value, 10); if (v >= 2 && v <= 8) { tstate(tcur).n = v; renderTpl(); } } });
  $('#t-ed').addEventListener('input', (e) => {
    const st = tstate(tcur);
    if (e.target.dataset.k) { st.gaps[e.target.dataset.k] = e.target.value; e.target.classList.toggle('filled', !!e.target.value.trim()); updStatus(); }
  });
  $('#t-ed').addEventListener('change', (e) => { if (e.target.dataset.a) { tstate(tcur).alts[e.target.dataset.a] = e.target.value; updStatus(); } });
  $('#t-ghost').addEventListener('click', () => { ghost = !ghost; renderTpl(); });
  $('#t-clear').addEventListener('click', () => { tstate(tcur).gaps = {}; renderTpl(); toast('Gaps cleared.'); });
  $('#t-copy').addEventListener('click', () => {
    const p = pending(tmod.nodes, tmod.st);
    copy(nodesText(tmod.nodes, tmod.st).join('\n\n'), p.g + p.a ? `Draft copied with ${p.g + p.a} pending item${p.g + p.a === 1 ? '' : 's'} in braces.` : 'Draft copied.');
  });
  renderTpl();
}

/* =====================================================================
   FUNDAMENTOS (gadget: lista e registro empilhados)
   ===================================================================== */
let FUN = []; const FBY = {}; let FCATS = 0;
function prepFun() {
  FUN = D.fun;
  FUN.forEach((f) => {
    FBY[f.id] = f;
    f._f = [{ t: norm(f.t), w: 10 }, { t: norm(f.g.join(' | ')), w: 8 }, { t: norm(f.e.join(' | ')), w: 4 }, { t: norm(f.f), w: 3 }, { t: norm(f.c), w: 3 }, { t: norm(f.b), w: 2 }, { t: norm(f.l.join(' | ')), w: 2 }, { t: norm(f.id), w: 20 }];
  });
  FCATS = new Set(FUN.map((f) => f.c)).size;
}
const catLabel = (c) => cap(c.toLowerCase()).replace(/ — /g, ' | ');
const fs = { q: '', cat: 'all', cur: null, view: 'list' };
function funSearch(q) {
  const P = parseQuery(q); if (!P.terms.length) return { P, res: [] };
  const res = []; FUN.forEach((f) => { const s = score(f._f, P.terms); if (s) res.push({ f, s }); });
  res.sort((a, b) => b.s - a.s || a.f.id.localeCompare(b.f.id)); return { P, res };
}
function setFunView(v) { fs.view = v; $('#f-lista').hidden = v !== 'list'; $('#f-det').hidden = v !== 'det'; }
function renderFunList() {
  const { P, res } = funSearch(fs.q);
  let items = fs.q.trim() ? res.map((r) => r.f) : FUN.slice();
  const cats = {}; items.forEach((f) => { cats[f.c] = (cats[f.c] || 0) + 1; });
  const total = items.length;
  if (fs.cat !== 'all') items = items.filter((f) => f.c === fs.cat);
  $('#f-ct').textContent = `${items.length} of ${FUN.length}`;
  $('#f-syn').innerHTML = P.syn.length ? 'Also searched: ' + P.syn.slice(0, 6).map((s) => `<strong style="color: var(--ink);">${esc(s)}</strong>`).join(', ') : '';
  const catNames = Object.keys(cats).sort();
  if (fs.cat !== 'all' && !cats[fs.cat]) catNames.unshift(fs.cat);
  $('#f-cat').innerHTML = `<option value="all">All categories (${total})</option>` + catNames.map((c) => `<option value="${esc(c)}"${fs.cat === c ? ' selected' : ''}>${esc(catLabel(c))} (${cats[c] || 0})</option>`).join('');
  $('#f-list').innerHTML = items.length ? items.map((f) => {
    let sn = f.f;
    if (fs.q.trim()) { const src = [f.g.join('; '), f.e.join('; '), f.l.join('; '), f.b].find((x) => score([{ t: norm(x), w: 1 }], P.terms)) || f.f; sn = snippet(src, P.terms, 130); }
    return `<button type="button" class="ritem" data-id="${f.id}" aria-current="${fs.cur === f.id}"><span class="id">${f.id}</span><span class="tt">${hl(f.t, P.terms)}</span><span class="sn">${hl(sn, P.terms)}</span></button>`;
  }).join('') : '<p class="small" style="padding: 14px 0;">No legal ground matches the search. Try a more general trigger or check the Headnote Index.</p>';
  if (fs.cur && fs.view === 'det') funDetail(fs.cur, P);
  gstat('fundamentos', fs.q.trim() ? `“${fs.q.trim()}”: ${items.length} of ${FUN.length}` : `${FUN.length} records in ${FCATS} categories`);
}
function funDetailHTML(f, P, folha) {
  const none = f.l.some((x) => /^nenhum/i.test(x));
  return `${folha ? '' : `<button type="button" class="gvolta" data-act="voltar">${ICON.volta}Resultados</button>`}
    <h2>${hl(f.t, P.terms)}</h2>
    <div class="tags"><span class="idl">${f.id}</span><span class="tagw mute">${esc(catLabel(f.c))}</span>${f.co && f.co !== f.c ? `<span class="tagw amber">Source category: ${esc(f.co.toLowerCase())}</span>` : ''}</div>
    ${folha ? '<div class="pauta" aria-hidden="true"></div>' : ''}
    <div class="deftw">
      <div class="row"><div class="dt">Usage triggers</div><div class="dd"><ul>${f.g.map((x) => `<li>${hl(x, P.terms)}</li>`).join('')}</ul></div></div>
      <div class="row"><div class="dt">Role in the opinion</div><div class="dd">${hl(f.f, P.terms)}</div></div>
      <div class="row"><div class="dt">Application elements</div><div class="dd"><ul>${f.e.map((x) => `<li>${hl(x, P.terms)}</li>`).join('')}</ul></div></div>
    </div>
    <div><div class="fhead"><div class="lbl">Base wording</div><span class="small">Adaptable: rewrite according to the case and the Guide</span></div><div class="formula">${hl(f.b, P.terms)}</div></div>
    <div class="box warn"><div class="lbl">Exclusions and limits</div><ul style="padding-left: 18px;">${f.l.map((x) => `<li>${hl(x, P.terms)}</li>`).join('')}</ul>${none ? '<p class="small" style="margin-top: 6px; color: var(--ink);">“Nenhum” (none) means the source listed no additional limit; it does not allow claiming application without exceptions.</p>' : ''}</div>
    ${f.x.length ? `<details class="corr"><summary>Corrections in this edition (${f.x.length})</summary>${f.x.map((x) => `<div class="ci"><strong>${esc(cap(x.campo))}</strong> | ${esc(x.razao)}<div class="small" style="margin-top: 4px;">Replaced source text: ${esc(x.origem)}</div></div>`).join('')}</details>` : ''}
    <div class="acoes">
      <button type="button" class="btn pri" data-act="f-cp" data-id="${f.id}">Copy wording</button>
      <button type="button" class="btn ghost" data-act="f-lk" data-id="${f.id}">Copy link</button>
      <button type="button" class="btn ghost" data-act="f-em" data-id="${f.id}">Search the Headnote Index</button>
    </div>`;
}
function funDetail(id, P) {
  const f = FBY[id]; if (!f) return; fs.cur = id; P = P || parseQuery(fs.q);
  $$('#f-list .ritem').forEach((b) => b.setAttribute('aria-current', String(b.dataset.id === id)));
  $('#f-det').innerHTML = funDetailHTML(f, P, false);
}
function funSelect(id) {
  if (!FBY[id]) return;
  if (!inited.fun) initFun();
  if (fs.cat !== 'all' && FBY[id].c !== fs.cat) fs.cat = 'all';
  fs.cur = id; setFunView('det'); renderFunList(); funDetail(id);
}
let fTimer;
function initFun() {
  inited.fun = true;
  if (fs.q) $('#f-q').value = fs.q; else fs.q = $('#f-q').value;
  $('#f-q').addEventListener('input', (e) => { clearTimeout(fTimer); fTimer = setTimeout(() => { fs.q = e.target.value; fs.cur = null; setFunView('list'); renderFunList(); }, 120); });
  $('#f-cat').addEventListener('change', (e) => { fs.cat = e.target.value; fs.cur = null; setFunView('list'); renderFunList(); });
  $('#f-list').addEventListener('click', (e) => {
    const b = e.target.closest('[data-id]'); if (!b) return;
    setFunView('det'); funDetail(b.dataset.id);
    FOLHA.scrollTop = 0; $('#f-det .gvolta').focus();
  });
  setFunView('list'); renderFunList();
}

/* =====================================================================
   EMENTÁRIO (gadget: árvore ou resultados, e registro empilhado)
   ===================================================================== */
const SCOPE = new Set(['DIREITO CIVIL', 'DIREITO DO CONSUMIDOR', 'DIREITO PROCESSUAL CIVIL E DO TRABALHO']);
let EME = []; const EBY = {}; const KIDS = {}; const ROOTS = {}; let RAMOS = []; let ENSC = 0;
const pathOf = (e) => { const p = []; let x = e; let g = 0; while (x && EBY[x.m] && g++ < 10) { x = EBY[x.m]; p.unshift(x); } return p; };
function prepEme() {
  EME = D.eme;
  EME.forEach((e) => { EBY[e.c] = e; });
  EME.forEach((e) => { if (EBY[e.m]) (KIDS[e.m] = KIDS[e.m] || []).push(e.c); else (ROOTS[e.r] = ROOTS[e.r] || []).push(e.c); });
  EME.forEach((e) => { e._p = pathOf(e); e._f = [{ t: norm(e.c), w: 30 }, { t: norm(e.d), w: 10 }, { t: norm(e._p.map((x) => x.d).join(' > ')), w: 3 }, { t: norm(e.eb), w: 2 }, { t: norm(e.fd), w: 1 }, { t: norm(e.r), w: 1 }]; });
  RAMOS = Object.keys(ROOTS).sort();
  ENSC = EME.filter((e) => SCOPE.has(e.r)).length;
}
const es = { sc: 'g', q: '', cur: null, open: new Set(), view: 'list' };
const inSc = (e) => es.sc === 'a' || SCOPE.has(e.r);
const byDesc = (a, b) => EBY[a].d.localeCompare(EBY[b].d, 'pt');
function emeSearch(q, all) {
  const P = parseQuery(q); if (!P.terms.length) return { P, res: [] };
  const res = [];
  EME.forEach((e) => { if (!all && !inSc(e)) return; let s = score(e._f, P.terms); if (s) { if (norm(q).trim() === e.c) s += 100; res.push({ e, s: s + (SCOPE.has(e.r) ? 2 : 0) }); } });
  res.sort((a, b) => b.s - a.s); return { P, res };
}
function setEmeView(v) { es.view = v; $('#e-lista').hidden = v !== 'list'; $('#e-det').hidden = v !== 'det'; }
function treeHTML(codes, depth) {
  return codes.filter((c) => inSc(EBY[c])).sort(byDesc).map((c) => {
    const e = EBY[c]; const kids = (KIDS[c] || []).filter((k) => inSc(EBY[k])); const open = es.open.has(c);
    return `<div class="tn-row" style="padding-left: ${(depth - 1) * 14}px">${kids.length ? `<button type="button" class="tw" data-tg="${c}" aria-expanded="${open}" aria-label="${open ? 'Collapse' : 'Expand'}: ${esc(e.d)}">${ICON.chev}</button>` : '<span class="tw"></span>'}<button type="button" class="tn${es.cur === c ? ' cur' : ''}" data-c="${c}"><span>${esc(e.d)}</span>${e.tr ? '<span class="cnt" title="Subject already addressed by the Appellate Panel (spreadsheet data)">TR</span>' : ''}</button></div>` + (open && kids.length ? treeHTML(kids, depth + 1) : '');
  }).join('');
}
function emeIntro() {
  const tr = EME.filter((e) => e.tr).length;
  $('#e-intro').innerHTML = `<div class="gstats"><div><div class="v">${EME.length.toLocaleString('en-US')}</div><div class="l">records in the main tab</div></div><div><div class="v">${ENSC.toLocaleString('en-US')}</div><div class="l">within the Guide’s scope</div></div><div><div class="v">${tr.toLocaleString('en-US')}</div><div class="l">addressed by the Panel</div></div></div>
    <p class="small">A base headnote with gaps is not a final headnote, and “addressed by the Panel” does not certify a thesis, number of rulings, or binding force.</p>`;
}
function renderEmeLeft() {
  $$('#gb-ementario [data-sc]').forEach((b) => { if (b.closest('.segc')) b.setAttribute('aria-pressed', String(b.dataset.sc === es.sc)); });
  const left = $('#e-left');
  if (es.q.trim()) {
    const { P, res } = emeSearch(es.q, false);
    const outside = es.sc === 'g' ? emeSearch(es.q, true).res.filter((r) => !SCOPE.has(r.e.r)).length : 0;
    $('#e-ct').textContent = `${res.length} result${res.length === 1 ? '' : 's'}`;
    $('#e-lh').textContent = 'Results';
    $('#e-intro').innerHTML = '';
    left.innerHTML = '<div class="rlist">' + res.slice(0, 80).map(({ e }) => `<button type="button" class="ritem" data-c="${e.c}" aria-current="${es.cur === e.c}"><span class="id">${e.c}${e.tr ? ' | TR' : ''}</span><span class="tt">${hl(e.d, P.terms)}</span><span class="sn">${esc(cap(e.r.toLowerCase()))}${e._p.length ? ' › ' + e._p.map((x) => esc(x.d)).join(' › ') : ''}</span></button>`).join('') + '</div>' +
      (res.length > 80 ? `<p class="small" style="margin-top: 10px;">Mostrando 80 de ${res.length}. Refine a busca.</p>` : '') +
      (outside ? `<p class="small" style="margin-top: 10px;">${outside} resultado${outside === 1 ? '' : 's'} outside the Guide’s scope.</p><button type="button" class="btn ghost sm" data-sc="a" style="align-self: flex-start;">See in the full collection</button>` : '') +
      (!res.length ? '<p class="small" style="padding: 12px 0;">Nothing found in this range.</p>' : '');
    gstat('ementario', `“${es.q.trim()}”: ${res.length} result${res.length === 1 ? '' : 's'}`);
    if (es.cur && es.view === 'det') emeDetail(es.cur, P);
  } else {
    const ramos = RAMOS.filter((r) => es.sc === 'a' || SCOPE.has(r));
    const n = EME.filter(inSc).length;
    $('#e-ct').textContent = `${n.toLocaleString('en-US')} registros`;
    $('#e-lh').textContent = 'Taxonomic tree';
    emeIntro();
    left.innerHTML = '<div class="tree">' + ramos.map((r) => { const open = es.open.has('R:' + r); const cnt = EME.filter((e) => e.r === r).length; return `<button type="button" class="ramo" data-r="${esc(r)}" aria-expanded="${open}">${ICON.chev}<span>${esc(cap(r.toLowerCase()))}</span><span class="cnt">${cnt}</span></button>` + (open ? treeHTML(ROOTS[r], 1) : ''); }).join('') + '</div>';
    gstat('ementario', `${EME.length.toLocaleString('en-US')} records, ${ENSC.toLocaleString('en-US')} within the Guide’s scope`);
    if (es.cur && es.view === 'det') emeDetail(es.cur);
  }
}
function emeDetailHTML(e, P, folha) {
  const gaps = (e.eb.match(/\[\.\.\.\]/g) || []).length;
  const ebh = esc(e.eb).replace(/\[\.\.\.\]/g, '<span class="gapm">[...]</span>');
  const val = (s) => (/^\[(SEM VALOR|TEXTO VAZIO) NA FONTE\]$/.test(s) ? `<span class="empty">${s === '[SEM VALOR NA FONTE]' ? 'No value in the source' : 'Empty text in the source'}</span>` : hl(s, P.terms));
  const kids = (KIDS[e.c] || []).slice().sort(byDesc);
  return `${folha ? '' : `<button type="button" class="gvolta" data-act="voltar">${ICON.volta}${es.q.trim() ? 'Results' : 'Tree'}</button>`}
    <div class="crumb"><span>${esc(cap(e.r.toLowerCase()))}</span>${e._p.map((x) => `<span aria-hidden="true">›</span><button type="button" data-go="${x.c}">${esc(x.d)}</button>`).join('')}</div>
    <h2>${hl(e.d, P.terms)}</h2>
    <div class="tags"><span class="idl">${e.c}</span><span class="tagw mute">Hierarchy ${esc(e.h)}</span><span class="tagw ${e.tr ? '' : 'mute'}">Addressed by the Panel: ${e.tr ? 'Yes' : 'No'} | spreadsheet data</span>${SCOPE.has(e.r) ? '' : '<span class="tagw amber">Outside the Guide’s scope</span>'}</div>
    ${folha ? '<div class="pauta" aria-hidden="true"></div>' : ''}
    ${SCOPE.has(e.r) ? '' : '<div class="box warn"><div class="lbl">Branch outside the scope</div><p>The branch is a source taxonomic category and does not automatically enter the headnote of an opinion within the civil and consumer scope.</p></div>'}
    <div><div class="fhead"><div class="lbl">Source base headnote</div><span class="tagw amber">Not a final headnote</span></div><div class="specw">${ebh}</div>
    <p class="small" style="margin-top: 8px;">${gaps} gap${gaps === 1 ? '' : 's'}. Final structure per the Guide: area; class; subarea where applicable; topic; thesis; result.</p></div>
    <div class="deftw">
      <div class="row"><div class="dt">Legal ground / description</div><div class="dd">${val(e.fd)}</div></div>
      <div class="row"><div class="dt">Parent code</div><div class="dd">${EBY[e.m] ? `<button type="button" class="chip" data-go="${e.m}">${e.m} | ${esc(EBY[e.m].d)}</button>` : esc(e.m || '')}</div></div>
      <div class="row"><div class="dt">Source</div><div class="dd">Ementário tab, row ${esc(e.ln)}</div></div>
      ${kids.length ? `<div class="row"><div class="dt">Child subjects</div><div class="dd"><div class="kids">${kids.map((k) => `<button type="button" class="chip" data-go="${k}">${esc(EBY[k].d)}</button>`).join('')}</div></div></div>` : ''}
    </div>
    <div class="acoes">
      <button type="button" class="btn pri" data-act="e-cp" data-id="${e.c}">Copy base headnote</button>
      <button type="button" class="btn ghost" data-act="e-lk" data-id="${e.c}">Copy link</button>
      <button type="button" class="btn ghost" data-act="e-fn" data-id="${e.c}">Search Legal Grounds</button>
    </div>`;
}
function emeDetail(c, P) {
  const e = EBY[c]; if (!e) return; es.cur = c; P = P || parseQuery(es.q);
  $$('#e-left [data-c]').forEach((b) => { if (b.classList.contains('tn')) b.classList.toggle('cur', b.dataset.c === c); else b.setAttribute('aria-current', String(b.dataset.c === c)); });
  $('#e-det').innerHTML = emeDetailHTML(e, P, false);
}
function emeSelect(c) {
  const e = EBY[c]; if (!e) return;
  if (!inited.eme) initEme();
  if (!SCOPE.has(e.r)) es.sc = 'a';
  es.open.add('R:' + e.r); e._p.forEach((x) => es.open.add(x.c));
  es.cur = c; setEmeView('det'); renderEmeLeft(); emeDetail(c);
  FOLHA.scrollTop = 0;
}
let eTimer;
function initEme() {
  inited.eme = true;
  if (es.q) $('#e-q').value = es.q; else es.q = $('#e-q').value;
  $('#e-q').addEventListener('input', (ev) => { clearTimeout(eTimer); eTimer = setTimeout(() => { es.q = ev.target.value; es.cur = null; setEmeView('list'); renderEmeLeft(); }, 150); });
  $('#gb-ementario').addEventListener('click', (ev) => {
    const sc = ev.target.closest('[data-sc]');
    if (sc) { es.sc = sc.dataset.sc; if (es.cur && !inSc(EBY[es.cur])) { es.cur = null; setEmeView('list'); } renderEmeLeft(); return; }
    const r = ev.target.closest('[data-r]');
    if (r) { const k = 'R:' + r.dataset.r; if (es.open.has(k)) es.open.delete(k); else es.open.add(k); renderEmeLeft(); const n = $(`#e-left [data-r="${CSS.escape(r.dataset.r)}"]`); if (n) n.focus(); return; }
    const tg = ev.target.closest('[data-tg]');
    if (tg) { const c = tg.dataset.tg; if (es.open.has(c)) es.open.delete(c); else es.open.add(c); renderEmeLeft(); const n = $(`#e-left [data-tg="${c}"]`); if (n) n.focus(); return; }
    const go = ev.target.closest('[data-go]');
    if (go) { emeSelect(go.dataset.go); return; }
    const n = ev.target.closest('[data-c]');
    if (n) { setEmeView('det'); emeDetail(n.dataset.c); FOLHA.scrollTop = 0; $('#e-det .gvolta').focus(); }
  });
  setEmeView('list'); renderEmeLeft();
}

/* =====================================================================
   BUSCA GLOBAL
   ===================================================================== */
let SIDX = null;
function buildIndex() {
  const secs = [];
  const comp = { 'guia-de-estilo': ['guia', 'Style Guide'], 'regras-de-aplicacao': ['regras', 'Application Rules'], 'criterios-operacionais': ['criterios', 'Operational Criteria'], 'indice-e-arquitetura': ['indice', 'Index and Architecture'], 'memoria-de-integracao': ['memoria', 'Integration Record'], 'templates-texto': ['templates', 'Templates'], 'calendario-base': ['calendario', 'Calendar'], 'fundamentos-regra': ['fundamentos', 'Legal Grounds'], 'ementario-regra': ['ementario', 'Headnote Index'] };
  Object.keys(comp).forEach((k) => {
    const [v, name] = comp[k]; const tpl = document.createElement('template'); tpl.innerHTML = DOCS[k] || '';
    const tx = (el) => { const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); const a = []; while (w.nextNode()) a.push(w.currentNode.nodeValue); return a.join(' '); };
    let cur0 = { id: null, h: name, txt: [] };
    const push = () => { const t = cur0.txt.join(' ').replace(/\s+/g, ' ').trim(); if (t || cur0.id) secs.push({ v, comp: name, id: cur0.id, h: cur0.h, t, f: [{ t: norm(cur0.h), w: 6 }, { t: norm(t), w: 1 }] }); };
    Array.from(tpl.content.children).forEach((el) => {
      const h = el.matches('h2.h2[id]') ? el : el.querySelector('h1[id]');
      if (h) { push(); cur0 = { id: h.id, h: h.textContent.trim(), txt: el === h ? [] : [tx(el).replace(h.textContent, '')] }; }
      else cur0.txt.push(tx(el));
    });
    push();
  });
  const tpls = D.tpl.map((t) => { const all = []; const w = (it) => it.forEach((x) => { if (x.p) all.push(x.p); else { all.push(x.c); w(x.ch); } }); w(t.items); return { t, txt: all.join(' '), f: [{ t: norm(t.id), w: 12 }, { t: norm(t.classe + ' ' + t.res + ' ' + t.apl), w: 4 }, { t: norm(all.join(' ')), w: 1 }] }; });
  SIDX = { secs, tpls };
}
let sfilter = 'all', ssel = 0;
let buscaBases = null;
function runSearch() {
  if (!SIDX) buildIndex();
  const q = $('#sq').value; const P = parseQuery(q);
  const faltam = !pronta.fundamentos || !pronta.ementario;
  if (P.terms.length && faltam && !buscaBases) {
    buscaBases = Promise.all([carregaBase('fundamentos'), carregaBase('ementario')])
      .then(() => { if (!$('#sov').hidden) runSearch(); }, () => { buscaBases = null; });
  }
  const out = { 'Sections': [], 'Legal Grounds': [], 'Headnote Index': [], Templates: [] };
  if (P.terms.length) {
    SIDX.secs.forEach((s) => { const sc = score(s.f, P.terms); if (sc) out['Sections'].push({ sc, html: `<a class="res" href="#${s.v}${s.id ? '/' + s.id : ''}"><span class="id">${esc(s.comp)}</span><span class="tt">${hl(s.h, P.terms)}</span><span class="sn">${hl(snippet(s.t, P.terms), P.terms)}</span></a>` }); });
    FUN.forEach((f) => { const sc = score(f._f, P.terms); if (sc) out['Legal Grounds'].push({ sc, html: `<a class="res" href="#fundamentos/${f.id}"><span class="id">${f.id}</span><span class="tt">${hl(f.t, P.terms)}</span><span class="sn">${hl(snippet(f.g.join('; ') + ' | ' + f.f, P.terms, 120), P.terms)}</span></a>` }); });
    EME.forEach((e) => { let sc = score(e._f, P.terms); if (sc) { const ins = SCOPE.has(e.r); sc += ins ? 4 : 0; out['Headnote Index'].push({ sc, html: `<a class="res" href="#ementario/${e.c}"><span class="id">${e.c}${ins ? '' : ' | outside scope'}${e.tr ? ' | TR' : ''}</span><span class="tt">${hl(e.d, P.terms)}</span><span class="sn">${esc(cap(e.r.toLowerCase()))}${e._p.length ? ' › ' + e._p.map((x) => esc(x.d)).join(' › ') : ''}</span></a>` }); } });
    SIDX.tpls.forEach((x) => { const sc = score(x.f, P.terms); if (sc) out['Templates'].push({ sc, html: `<a class="res" href="#templates/${x.t.id}"><span class="id">${x.t.n} | template</span><span class="tt">${hl(x.t.id, P.terms)}</span><span class="sn">${hl(snippet(x.txt, P.terms, 130), P.terms)}</span></a>` }); });
    Object.values(out).forEach((a) => a.sort((m, n) => n.sc - m.sc));
  }
  const keys = Object.keys(out); const total = keys.reduce((s, k) => s + out[k].length, 0);
  $('#sf').innerHTML = [['all', 'All', total]].concat(keys.map((k) => [k, k, out[k].length])).map(([k, l, n]) => `<button type="button" data-f="${k}" aria-pressed="${sfilter === k}">${l}${P.terms.length ? ' ' + n : ''}</button>`).join('');
  $('#ssyn').innerHTML = P.syn.length ? 'Also: ' + P.syn.slice(0, 4).map((s) => `<strong style="color: var(--ink);">${esc(s)}</strong>`).join(', ') : '';
  const L = $('#sl');
  if (!P.terms.length) { L.innerHTML = `<div style="padding: 18px 0; display: flex; flex-direction: column; gap: 10px;"><p class="small">Search all of PLAY: document sections, ${N.fun} legal grounds, ${N.eme.toLocaleString('en-US')} Headnote Index records, and the ${D.tpl.length} templates. The bases are in Portuguese.</p><div style="display: flex; flex-wrap: wrap; gap: 6px;">` + ['gratuidade', 'negativação', 'dialeticidade', 'ementa resultado', 'tempestividade', 'RI-CONJUNTO', '6226'].map((s) => `<button type="button" class="chip" data-try="${s}">${s}</button>`).join('') + '</div></div>'; return; }
  const aviso = faltam ? '<p class="small sespera" role="status">Also searching Legal Grounds and the Headnote Index</p>' : '';
  if (!total) { L.innerHTML = aviso || '<p class="small" style="padding: 18px 0;">No results. Try a broader term.</p>'; return; }
  L.innerHTML = aviso + keys.filter((k) => (sfilter === 'all' || sfilter === k) && out[k].length).map((k) => `<div class="sgrp"><span class="lbl">${k}</span><span class="small">${out[k].length}</span></div>` + out[k].slice(0, sfilter === 'all' ? (k === 'Headnote Index' ? 6 : 5) : 60).map((r) => r.html).join('')).join('');
  ssel = 0; markSel();
}
function markSel() { const rs = $$('#sl .res'); rs.forEach((r, i) => r.classList.toggle('sel', i === ssel)); if (rs[ssel]) rs[ssel].scrollIntoView({ block: 'nearest' }); }
function openSearch(q) { $('#sov').hidden = false; const i = $('#sq'); if (q != null) i.value = q; i.focus(); i.select(); runSearch(); }
function closeSearch(semFoco) { $('#sov').hidden = true; if (!semFoco) $('#searchbtn').focus(); }
let sTimer;
$('#searchbtn').addEventListener('click', () => openSearch());
$('#sx').addEventListener('click', () => closeSearch());
$('#sov').addEventListener('click', (e) => {
  if (e.target.id === 'sov') { closeSearch(); return; }
  const f = e.target.closest('[data-f]'); if (f) { sfilter = f.dataset.f; runSearch(); return; }
  const t = e.target.closest('[data-try]'); if (t) { $('#sq').value = t.dataset.try; runSearch(); return; }
  const r = e.target.closest('.res'); if (r) { e.preventDefault(); closeSearch(true); navigate(r.getAttribute('href')); }
});
$('#sq').addEventListener('input', () => { clearTimeout(sTimer); sTimer = setTimeout(runSearch, 110); });
$('#sq').addEventListener('keydown', (e) => {
  const rs = $$('#sl .res');
  if (e.key === 'ArrowDown') { e.preventDefault(); ssel = Math.min(rs.length - 1, ssel + 1); markSel(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); ssel = Math.max(0, ssel - 1); markSel(); }
  else if (e.key === 'Enter') { e.preventDefault(); if (rs[ssel]) { closeSearch(true); navigate(rs[ssel].getAttribute('href')); } }
});
document.addEventListener('keydown', (e) => {
  if (!LEI.hidden) return;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if ($('#sov').hidden) openSearch(); else closeSearch(); return; }
  if (e.key === 'Escape') {
    if (!$('#sov').hidden) { closeSearch(); return; }
    if (!CAM.hidden) { fechaCamada(); return; }
    if (PARTE.classList.contains('on')) { sai(); return; }
    if (gavAberta) { saiGaveta(); return; }
  }
  if (e.key === '/' && $('#sov').hidden && CAM.hidden && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
});

/* =====================================================================
   INÍCIO
   ===================================================================== */
montaPartitura();
desenha();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(desenha);
let largSis = 0;
if ('ResizeObserver' in window) new ResizeObserver(() => { if (SIS.clientWidth !== largSis) { largSis = SIS.clientWidth; desenha(); } }).observe(SIS);
else window.addEventListener('resize', desenha);
initCal();
gstat('fundamentos', `${N.fun} records in ${N.funCat} categories`);
gstat('ementario', `${N.eme.toLocaleString('en-US')} records, ${N.emeEsc.toLocaleString('en-US')} within the Guide’s scope`);
window.addEventListener('hashchange', route);
route();
setTimeout(() => { gesto(); retomaRonda(); }, 900);
})();
