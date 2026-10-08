/* Gerado por fonte/build/build.py. Não editar. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const DOCS = window.ATRIL.docs;
const D = window.ATRIL.data;
const N = D.n;
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const BASE = location.href.split('#')[0];
const AS = 'assets/atril/';
const RM = window.matchMedia('(prefers-reduced-motion: reduce)');
const ICON = {
  volta: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 6 8 12l6 6"/></svg>',
  chev: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>',
  fora: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 16 16 8M9.5 8H16v6.5"/></svg>',
  baixa: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/></svg>'
};
const inited = {};

/* ---------- utilidades ---------- */
function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
  document.body.appendChild(t); setTimeout(() => t.remove(), 2600);
}
function copy(text, msg) {
  const done = () => toast(msg || 'Copiado.');
  if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(done, fallback); } else fallback();
  function fallback() {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) { toast('Não foi possível copiar.'); } ta.remove();
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
   por chave em naipes (Coleção, Governança, Ferramenta); os compassos são a
   ordem de utilização das Regras de Aplicação (seção 3), e as notas ficam
   onde as Regras mandam usar cada componente. Ler na vertical é ler um passo.
   O Registro (Índice e Memória) fica fora do sistema, anotado na folha de rosto.
   ===================================================================== */
const MAT = D.mat;
const WH = MAT.brancas;
const BK = MAT.pretas;
BK.forEach((m) => { m.tipo = 'anexo'; });
const MBY = {}; WH.concat(BK).forEach((m) => { MBY[m.id] = m; });
const fmtKB = (kb) => (kb >= 1000 ? (kb / 1024).toFixed(1).replace('.', ',') + ' MB' : kb + ' KB');
const nTxt = (n, s, p) => n.toLocaleString('pt-BR') + ' ' + (n === 1 ? s : p);
const TITULO = 'ÁTRIL | Playbook da metodologia ECHO';

/* Altura na pauta (clave de sol): 28 Mi4, 25.5 Fá4, 23 Sol4, 20.5 Lá4, 18 Si4, 15.5 Dó5, 13 Ré5, 10.5 Mi5.
   As Regras sustentam um pedal de Dó; III soa Dó maior; IV suspende (Fá, Sol, Dó); a coda resolve em Dó maior. */
const NOTA = { 28: 'E4', 25.5: 'F4', 23: 'G4', 20.5: 'A4', 18: 'B4', 15.5: 'C5', 13: 'D5', 10.5: 'E5' };
/* Cada marca de ensaio abre o seu passo: o título continua no texto. */
/* Texto da ordem: justificado; "~" marca a sílaba (hífen discreto), para hifenizar
   mesmo nos navegadores sem dicionário de português. */
const MARCAS = [
  ['I', 'Identificação', 'para clas~se, ob~je~to, ri~to e ques~tões re~le~van~tes.'],
  ['II', 'Admissibilidade', 'para sus~ten~tar, re~cu~pe~ran~do a ba~se tem~po~ral, quan~do ne~ces~sá~rio.'],
  ['III', 'Fundamentos', 'para con~fron~to com as re~fe~rên~cias per~ti~nen~tes.'],
  ['IV', 'Resultados', 'para de~fi~nir an~tes da mon~ta~gem da de~ci~são (“Tem~pla~tes”).'],
  ['V', 'Coda', 'para re~fi~nar e ade~quar a de~ci~são de acor~do com cri~té~rios de~fi~ni~dos.']
];
const NAIPES = [
  { n: 'Coleção', chave: 'chaveta', vozes: [
    { id: 'vol-01', marca: 'ad lib.', pdf: 'vol-01' },
    { id: 'vol-02', marca: 'ad lib.', pdf: 'vol-02' },
    { id: 'vol-03', sub: 'vol. 03 | SOP', marca: 'ad lib.', pdf: 'vol-03' },
    { id: 'guia', sub: 'vol. 04 | SOP', notas: [[4, 23, 'w'], [5, 23, 'w']], liga: [4, 5], pdf: 'vol-04' }] },
  { n: 'Governança', chave: 'colchete', vozes: [
    { id: 'regras', sub: 'SOP', notas: [[1, 15.5], [2, 15.5], [3, 15.5], [4, 15.5], [5, 15.5]], pdf: 'pdf-regras' },
    { id: 'criterios', sub: 'SOP', notas: [[5, 10.5]], pdf: 'pdf-criterios' }] },
  { n: 'Ferramenta', chave: 'colchete', vozes: [
    { id: 'calendario', nome: 'Calendário Jurídico', sub: nTxt(D.cal.length, 'dia', 'dias'), notas: [[2, 20.5]], ferr: true },
    { id: 'fundamentos', nome: 'Fundamentos', sub: nTxt(N.fun, 'registro', 'registros'), notas: [[3, 23]], ferr: true },
    { id: 'ementario', nome: 'Ementário', sub: nTxt(N.eme, 'assunto', 'assuntos'), notas: [[3, 10.5]], ferr: true },
    { id: 'templates', nome: 'Templates', sub: nTxt(D.tpl.length, 'modelo', 'modelos'), notas: [[4, 25.5]], ferr: true }] }
];
const ANOT = [
  { id: 'indice', nota: 'Identidade, camadas e componentes', pdf: 'pdf-indice' },
  { id: 'memoria', nota: 'Fontes, decisões, correções e limites', pdf: 'pdf-memoria' }
];
const VOZ = {};
NAIPES.forEach((g) => g.vozes.forEach((v) => {
  const m = MBY[v.id];
  if (!v.nome) v.nome = m.nome;
  if (!v.sub) v.sub = m.tipo === 'manual' ? 'vol. ' + m.curto : '';
  v.naipe = g.n; VOZ[v.id] = v;
}));
const ANBY = {}; ANOT.forEach((a) => { ANBY[a.id] = a; });
function vozDesc(v) {
  if (v.marca) return 'consulta livre, fora da ordem';
  const ms = v.notas.map((n) => MARCAS[n[0] - 1][0]);
  if (ms.length === 5) return 'presente em todos os compassos';
  if (v.liga) return 'sustentado de ' + ms[0] + ' até a coda (V)';
  return 'entra em ' + ms.join(', ');
}

const SIS = $('#sistema');
const COL = $('#coluna');
const BAT = $('#batuta');
const MQS = window.matchMedia('(max-width: 700px)');
/* PDF: "ver" abre o leitor na própria página, em duas páginas; "baixar" baixa o arquivo. */
const verBaixar = (m, nome, cls) => `<span class="${cls || 'pt'}"><button type="button" data-ver="${m.id}" aria-label="Ver ${esc(nome)} em PDF">ver</button><i aria-hidden="true">|</i><a href="${AS + m.arquivo}" download aria-label="Baixar ${esc(nome)} em PDF">baixar</a></span>`;
function montaPartitura() {
  $('#marcas').innerHTML = MARCAS.map(([r, t, x], i) => `<button type="button" data-m="${i + 1}"><span class="mt" lang="pt-BR"><span class="mh"><span class="ensaio">${r}</span><b>${t}</b></span><span class="mx">${esc(x).replace(/~/g, '\u00AD')}</span></span></button>`).join('');
  $('#naipes').innerHTML = NAIPES.map((g) => `<div class="naipe"><div class="chave" aria-hidden="true"><span class="nome-n">${g.n}</span>${g.chave === 'colchete' ? '<span class="colchete"></span>' : '<svg viewBox="0 0 14 100" preserveAspectRatio="none"><path d="M12 1 C3 4 9 30 2 50 C9 70 3 96 12 99" vector-effect="non-scaling-stroke"/></svg>'}</div>` +
    g.vozes.map((v) => {
      const p = v.pdf ? MBY[v.pdf] : null;
      return `<div class="linha voz" data-id="${v.id}"><span></span><a class="nm" href="#${v.id}" aria-label="${esc(v.nome)}, ${esc(g.n)}, ${vozDesc(v)}"><b>${esc(v.nome)}</b><small>${esc(v.sub)}</small></a><svg class="pauta-s" data-v="${v.id}" aria-hidden="true"></svg>${p ? verBaixar(p, v.nome) : '<span></span>'}</div>`;
    }).join('') + '</div>').join('');
  $('#anot').innerHTML = ANOT.map((a) => {
    const m = MBY[a.id]; const p = MBY[a.pdf];
    return `<li><a class="an" href="#${a.id}" data-id="${a.id}">${esc(m.nome)}</a><p>${esc(a.nota)}</p>${verBaixar(p, m.nome, 'ab')}</li>`;
  }).join('');
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
    if (v.marca) o += `<text x="${Math.min(mw * 0.5, 60)}" y="22.5">${v.marca}</text>`;
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
function marcaCompasso(m) {
  if (m === mAtual) return; mAtual = m;
  $$('#marcas button').forEach((b) => b.classList.toggle('on', +b.dataset.m === m));
  if (!m) { SIS.removeAttribute('data-m'); return; }
  SIS.setAttribute('data-m', m);
  COL.style.width = sg.mw + 'px'; COL.style.transform = `translateX(${sg.x + (m - 1) * sg.mw}px)`;
  acorde(m);
}
SIS.addEventListener('pointermove', (e) => {
  if (MQS.matches || e.pointerType !== 'mouse') return;
  const x = e.clientX - SIS.getBoundingClientRect().left - sg.x;
  marcaCompasso(x < 0 || x > sg.mw * 5 ? 0 : Math.min(5, Math.floor(x / sg.mw) + 1));
  const voz = e.target.closest('.voz');
  SIS.classList.toggle('foco-voz', !!voz);
  $$('.voz', SIS).forEach((el) => el.classList.toggle('quente', el === voz));
});
SIS.addEventListener('pointerleave', () => { marcaCompasso(0); SIS.classList.remove('foco-voz'); });
SIS.addEventListener('click', (e) => {
  const mb = e.target.closest('#marcas button'); if (mb) { mAtual = 0; marcaCompasso(+mb.dataset.m); return; }
  if (e.target.closest('a, button')) return;
  const voz = e.target.closest('.voz'); if (voz) navigate('#' + voz.dataset.id);
});
$('#marcas').addEventListener('focusin', (e) => { const b = e.target.closest('button'); if (b) marcaCompasso(+b.dataset.m); });
$('#marcas').addEventListener('focusout', (e) => { if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest('#marcas')) marcaCompasso(0); });

/* Som: sintetizado no navegador, desligado até o primeiro toque. */
let actx = null; let somOn = false;
const freq = (n) => 440 * Math.pow(2, ((+n[1] - 4) * 12 + { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[n[0]] - 9) / 12);
function acorde(m) {
  if (!somOn || !actx) return;
  const t = actx.currentTime; const alt = [];
  NAIPES.forEach((g) => g.vozes.forEach((v) => (v.notas || []).forEach((n) => { if (n[0] === m && !alt.includes(n[1])) alt.push(n[1]); })));
  alt.forEach((y, i) => {
    const o = actx.createOscillator(); const g = actx.createGain(); o.type = 'sine'; o.frequency.value = freq(NOTA[y]);
    g.gain.setValueAtTime(0.0001, t + i * 0.035); g.gain.exponentialRampToValueAtTime(0.12, t + i * 0.035 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
    o.connect(g); g.connect(actx.destination); o.start(t + i * 0.035); o.stop(t + 1.9);
  });
}
$('#b-som').addEventListener('click', (e) => {
  somOn = !somOn; e.currentTarget.setAttribute('aria-pressed', String(somOn));
  if (somOn && !actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (err) { /* sem áudio */ } }
  if (actx && actx.state === 'suspended') actx.resume();
  if (somOn) { [1, 2, 3, 4, 5].forEach((m, i) => setTimeout(() => { mAtual = 0; marcaCompasso(m); }, i * 520)); setTimeout(() => marcaCompasso(0), 2900); }
});

/* A batuta: um gesto de entrada, da primeira à última barra. */
function gesto() {
  if (RM.matches || MQS.matches || !sg.mw) return;
  BAT.style.setProperty('--a', sg.x + 'px'); BAT.style.setProperty('--b', (sg.x + sg.mw * 5) + 'px');
  BAT.classList.remove('vai'); void BAT.offsetWidth; BAT.classList.add('vai');
}

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
const TOOLDOC = { 'calendario-base': ['Calendário', 'base e limites da contagem', 'Calendário, base e limites'], 'fundamentos-regra': ['Fundamentos', 'regra de uso', 'Fundamentos, regra de uso'], 'ementario-regra': ['Ementário', 'regra de uso', 'Ementário, regra de uso'] };
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
  if (VOZ[key] || ANBY[key]) return key;
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
  $$('.voz, .an').forEach((el) => { if (el.dataset.id === id) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current'); });
}
function rotulo(key) {
  if (key === 'cal-ano') return 'Ferramenta | Calendário Jurídico, tabela anual';
  if (key.startsWith('doc:')) return 'Ferramenta | ' + ((TOOLDOC[key.slice(4)] || [])[2] || '');
  if (key.startsWith('fun:')) return 'Ferramenta | Fundamento ' + key.slice(4);
  if (key.startsWith('eme:')) return 'Ferramenta | Ementário ' + key.slice(4);
  if (key.startsWith('ferr:')) return 'Ferramenta | ' + VOZ[key.slice(5)].nome;
  if (VOZ[key]) return VOZ[key].naipe + ' | ' + VOZ[key].nome;
  if (ANBY[key]) return 'Anotação | ' + MBY[key].nome;
  const m = MBY[key];
  if (!m) return '';
  return m.tipo === 'manual' ? 'Coleção | ' + m.volume : 'Anexo em PDF | ' + m.nome;
}
function tituloFolha(key) {
  if (key === 'cal-ano') return 'Calendário Jurídico';
  if (key.startsWith('doc:')) return (TOOLDOC[key.slice(4)] || [])[2] || '';
  if (key.startsWith('fun:')) return 'Fundamento ' + key.slice(4);
  if (key.startsWith('eme:')) return 'Ementário ' + key.slice(4);
  if (key.startsWith('ferr:')) return VOZ[key.slice(5)].nome;
  return MBY[key] ? MBY[key].nome : '';
}
function situa(key) {
  ROT.textContent = rotulo(key);
  marcaVoz(vozDe(key));
  const t = tituloFolha(key);
  document.title = t ? t + ' | ÁTRIL' : TITULO;
  $('#anuncio').textContent = 'Aberto sobre a partitura: ' + t;
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
  rail.innerHTML = '<div class="lbl">Nesta folha</div>' + hs.map((h) => `<a href="#${v}/${h.id}" data-id="${h.id}" class="${h.tagName === 'H1' ? 'ch' : ''}">${esc(h.textContent)}</a>`).join('');
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
  FIN.innerHTML = '<div class="docwrap"><article class="doc flow v4"></article><aside class="rail" aria-label="Seções desta folha"></aside></div>';
  const art = $('article', FIN);
  art.innerHTML = DOCS[k] || '';
  let meta = '';
  if (m) {
    const p = MBY[m.pdf]; const v = VOZ[m.id];
    const leg = v ? v.sub + ' | ' + m.camada : 'Anotação | ' + m.camada;
    meta = `<span>${esc(leg)}</span>` + (p ? `<button type="button" class="fver" data-ver="${p.id}">Abrir o PDF</button>` : '');
  } else if (TOOLDOC[k]) meta = `<span><strong>${TOOLDOC[k][0]}</strong> | ${TOOLDOC[k][1]}</span>`;
  const op = $('.op', art);
  if (op) op.insertAdjacentHTML('beforeend', (meta ? `<p class="fmeta">${meta}</p>` : '') + '<div class="pauta" aria-hidden="true"></div>');
  buildRail($('.rail', FIN), art, k);
}

function fichaHTML(m) {
  const url = AS + m.arquivo; const arq = m.arquivo.split('/').pop();
  let rel = '';
  if (m.le) rel = `<p class="fpdf-rel">Versão diagramada do documento que se lê na tela: <a href="#${m.le}">${esc(MBY[m.le].nome)}</a>.</p>`;
  else if (m.ferramenta === 'templates') rel = '<p class="fpdf-rel">Os seis modelos também se montam no <a href="#templates">montador de Templates</a>, em tela inteira.</p>';
  return `<div class="fpdf">
    <button type="button" class="fpdf-capa" data-ver="${m.id}" aria-label="Ver o PDF ${esc(m.nome)}"><img src="${AS + m.capa}" width="560" height="793" alt="Primeira página do PDF ${esc(m.nome)}" decoding="async"></button>
    <div class="fpdf-txt">
      <h1 class="ft">${esc(m.nome)}</h1>
      ${m.tipo === 'manual' ? `<p class="fpdf-sub"><strong>${m.volume}</strong> | ${esc(m.sub)}</p>` : `<p class="fpdf-lead">${esc(m.lead)}</p>`}
      <div class="pauta" aria-hidden="true"></div>
      <div class="deft narrow">
        <div class="row"><div class="dt">Natureza</div><div class="dd">${m.tipo === 'manual' ? 'Manual da coleção da Turma Recursal do TJPR' : 'Anexo do Playbook, camada ' + esc(m.camada)}</div></div>
        <div class="row"><div class="dt">Formato</div><div class="dd">PDF, ${fmtKB(m.kb)}</div></div>
        <div class="row"><div class="dt">Arquivo</div><div class="dd">${esc(arq)}</div></div>
      </div>
      <div class="acoes"><button type="button" class="btn pri" data-ver="${m.id}">Abrir o PDF</button><a class="btn ghost" href="${url}" download>Baixar${ICON.baixa}</a></div>
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
  sec.setAttribute('aria-busy', 'true'); gstat(id, 'Carregando a base');
  return carregaBase(id).then(() => {
    sec.removeAttribute('aria-busy');
    if (!inited[k]) (k === 'fun' ? initFun : initEme)();
    return true;
  }, () => {
    sec.removeAttribute('aria-busy'); gstat(id, 'A base não carregou. Feche e abra de novo.');
    return false;
  });
}

/* Bases pesadas: Fundamentos e Ementário só descem quando a ferramenta é aberta
   (ou quando a busca global as consulta). Cada uma é um script à parte, injetado uma vez. */
const BASES = { fundamentos: ['fun', 'atril-fundamentos.js'], ementario: ['eme', 'atril-ementario.js'] };
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
      sc.onerror = () => { lei.carga = null; falha(new Error('pdf.js indisponível')); };
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
  $('#leitor-st').textContent = ab.length === 2 ? 'PDF | página dupla' : 'PDF | página';
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
  $('#leitor-n').textContent = '…'; $('#leitor-st').textContent = 'Carregando o PDF';
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
    $('#leitor-st').innerHTML = `Não foi possível abrir o PDF aqui. <a href="${url}" target="_blank" rel="noopener">Abrir em nova aba</a>`;
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
  if (v === 'templates') { abreCamada(sub); return; }
  fechaCamada(true);
  ultimaFolha = h;
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
  } else if (a === 'f-cp') copy(FBY[id].b, 'Formulação copiada. Adapte ao caso e ao Guia antes de usar.');
  else if (a === 'f-lk') copy(BASE + '#fundamentos/' + id, 'Link do registro copiado.');
  else if (a === 'f-em') {
    const f = FBY[id]; es.q = fs.q.trim() || f.t.replace(/\s*\(.*\)\s*$/, ''); es.cur = null;
    history.replaceState(null, '', '#ementario');
    abreGadget('ementario').then((ok) => { if (!ok) return; $('#e-q').value = es.q; setEmeView('list'); renderEmeLeft(); });
  } else if (a === 'e-cp') copy(EBY[id].eb, 'Ementa-base copiada. Preencha as lacunas conforme o Guia.');
  else if (a === 'e-lk') copy(BASE + '#ementario/' + id, 'Link do registro copiado.');
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
const WD = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const WDL = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const MESL = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
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
  if (o.loc === 'out' && /Padroeira de Curitiba/.test(obs) && !we) { s = 1; obs = 'Feriado de Curitiba desconsiderado (outra comarca)'; }
  if (o.ex.includes(k)) { s = 0; obs = (obs ? obs + '; ' : '') + 'Exclusão informada do processo'; user = true; }
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
    r.rows.push({ cls: 'info', k: 'D', d: m, why: 'Disponibilização no DJe' });
    let p = m;
    for (;;) {
      p = addD(p, 1); const x = dayInfo(p, o);
      if (!x.cov) { r.blocked = true; return r; }
      if (x.hist) r.hist = true;
      if (x.s) break;
      r.rows.push({ cls: x.onlyWe ? 'we' : 'x', k: 'N', d: p, why: x.obs }); if (!x.onlyWe) r.ex.push({ d: p, why: x.obs });
    }
    r.pub = p; r.rows.push({ cls: 'info', k: 'P', d: p, why: 'Publicação: primeiro dia útil seguinte à disponibilização' }); start = p;
  } else r.rows.push({ cls: 'info', k: 'M', d: m, why: 'Marco: dia do começo, excluído da contagem' });
  let k = 0, d = start;
  while (k < o.n) {
    d = addD(d, 1); const x = dayInfo(d, o);
    if (!x.cov) { r.blocked = true; return r; }
    if (x.hist) r.hist = true;
    if (x.s) { k++; if (k === 1) r.first = d; r.rows.push({ cls: k === o.n ? 'due' : 'c', k: String(k), d, why: k === o.n ? 'Vencimento' : '' }); }
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
  let cells = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((w) => `<span class="wd" aria-hidden="true">${w}</span>`).join('');
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
    const title = x.cov ? (x.obs || 'Computável') : 'Fora da base';
    cells += `<span class="${cls}" title="${esc(br(dt) + ' | ' + title)}"><span>${dd}</span>${kk ? `<span class="k">${kk}</span>` : ''}</span>`;
  }
  return `<div class="mon"><div class="mh">${cap(MESL[m])} ${y}</div><div class="grid">${cells}</div></div>`;
}
function trailText(r, o) {
  const L = [`Contagem | Playbook, Calendário Jurídico | cível em dias úteis | ${o.loc === 'cwb' ? 'Curitiba' : 'outra comarca (sem feriados locais)'}`];
  r.rows.forEach((x) => L.push(`${x.k.padStart(2, ' ')} | ${br(x.d)} | ${WD[x.d.getDay()]}${x.why ? ' | ' + x.why : ''}`));
  if (r.due) L.push(`Vencimento: ${br(r.due)} (${WDL[r.due.getDay()]})`);
  if (o.ex.length) L.push('Exclusões informadas: ' + o.ex.map((k) => br(pdate(k))).join(', '));
  return L.join('\n');
}
const LEGENDA = '<div class="legend"><span><i style="box-shadow: inset 0 0 0 2px var(--ink);"></i>Marco</span><span><i style="background: var(--accent-tint);"></i>Dia contado</span><span><i style="background: var(--support);"></i>Excluído pela tabela</span><span><i style="background: repeating-linear-gradient(135deg, var(--support-tint) 0 3px, var(--paper) 3px 6px);"></i>Exclusão informada</span><span><i style="background: var(--ink);"></i>Vencimento</span></div>';
function renderCal() {
  $$('#c-form [data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === cs.mode)));
  $('#c-prazo').style.display = cs.mode === 'prazo' ? 'flex' : 'none';
  $('#c-int').style.display = cs.mode === 'int' ? 'flex' : 'none';
  $('#c-djew').style.display = cs.mode === 'prazo' ? 'flex' : 'none';
  const res = $('#c-res');
  $('#c-ml').textContent = cs.dje ? 'Disponibilização no DJe' : 'Marco (intimação ou publicação)';
  $('#c-xl').innerHTML = cs.ex.map((k) => `<span class="chip">${br(pdate(k))}<button type="button" aria-label="Remover ${br(pdate(k))}" data-rm="${k}"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></span>`).join('');
  const out = $('#c-out'); const warns = [];
  const trilhaAberta = !!($('.trilha', out) && $('.trilha', out).open);
  if (cs.loc === 'out') warns.push('<div class="box warn"><div class="lbl">Outra comarca</div><p>O feriado de 8 de setembro (Curitiba) deixa de ser excluído. A tabela não incorpora os feriados locais das demais comarcas: inclua-os nas exclusões do processo.</p></div>');
  if (cs.mode === 'prazo') {
    if (!cs.marco || !(cs.n >= 1)) { res.innerHTML = '<p class="small">Informe o marco e o número de dias úteis.</p>'; out.innerHTML = ''; gstat('calendario', 'Informe o marco e os dias úteis'); return; }
    const r = calcPrazo(cs);
    if (r.hist) warns.unshift('<div class="box warn"><div class="lbl">Histórico de 2025</div><p>O intervalo alcança 2025, base preservada sem conferência normativa anual. Verifique as fontes de 2025 e a localidade antes de concluir.</p></div>');
    if (r.blocked) {
      res.innerHTML = '<div class="box warn"><div class="lbl">Intervalo não coberto</div><p>A contagem sai da base disponível (2025 e 2026; não há tabela de 2027). A ferramenta não conclui o prazo: recupere a base do período antes de prosseguir.</p></div>';
      out.innerHTML = warns.join('');
      gstat('calendario', 'Fora da base disponível');
      return;
    }
    const exTxt = r.ex.length ? 'Excluídos pela tabela: ' + r.ex.map((x) => `${br(x.d).slice(0, 5)} (${esc(x.why.split(';')[0].replace(/ \(.*\)$/, ''))})`).join(', ') + ', além dos fins de semana.' : 'Sem feriados ou suspensões no intervalo; excluídos apenas os fins de semana.';
    const count = {}; r.rows.forEach((x) => { if (x.cls === 'c' || x.cls === 'due') count[iso(x.d)] = x.k; });
    res.innerHTML = `<div class="dark"><p class="big"><span class="pre">Vence em</span> <span class="dt">${r.due.getDate()} de ${MESL[r.due.getMonth()]} de ${r.due.getFullYear()}</span></p><p class="sub">${cap(WDL[r.due.getDay()])}, ${cs.n}º dia útil${r.pub ? `, publicação em ${br(r.pub)}` : ''}</p></div>`;
    out.innerHTML = `
      <p class="gtxt">Início da contagem em <strong>${br(r.first)}</strong>. ${exTxt}</p>
      ${warns.join('')}
      ${monthsHTML(pdate(cs.marco), r.due, { o: cs, count, mk: cs.marco, due: iso(r.due) })}
      ${LEGENDA}
      <details class="trilha"${trilhaAberta ? ' open' : ''}><summary>Trilha de conferência</summary><button type="button" class="btn ghost sm" id="c-copy">Copiar trilha</button>
      <div class="trail">${r.rows.map((x) => `<div class="tr ${x.cls}"><span class="k">${x.k}</span><span class="mono">${br(x.d)}</span><span>${WD[x.d.getDay()]}</span><span>${esc(x.why || '')}</span></div>`).join('')}</div></details>
      <div class="box"><div class="lbl">Limites da base</div><p>Contagem pelo art. 224 do CPC: exclui o dia do começo e inclui o do vencimento. A tabela cobre 2026 (ativo) e 2025 (histórico); não há 2027. O campo de contagem não indica expediente, e a data de ciência, disponibilização ou publicação continua a ser determinada no processo.</p></div>`;
    $('#c-copy').onclick = () => copy(trailText(r, cs), 'Trilha copiada.');
    gstat('calendario', `Vence em ${br(r.due)}, ${WDL[r.due.getDay()]}`);
  } else {
    if (!cs.a || !cs.b) { res.innerHTML = '<p class="small">Informe as duas datas.</p>'; out.innerHTML = ''; gstat('calendario', 'Informe as duas datas'); return; }
    const r = calcInt(cs);
    if (r.bad) { res.innerHTML = '<div class="box warn"><div class="lbl">Datas</div><p>A data final deve ser posterior à inicial.</p></div>'; out.innerHTML = ''; gstat('calendario', 'Datas a corrigir'); return; }
    if (r.blocked) { res.innerHTML = '<div class="box warn"><div class="lbl">Intervalo não coberto</div><p>O intervalo sai da base disponível (2025 e 2026). A ferramenta não conclui a contagem.</p></div>'; out.innerHTML = ''; gstat('calendario', 'Fora da base disponível'); return; }
    if (r.hist) warns.unshift('<div class="box warn"><div class="lbl">Histórico de 2025</div><p>O intervalo alcança 2025, base preservada sem conferência normativa anual.</p></div>');
    res.innerHTML = `<div class="dark"><p class="big">${r.n} dia${r.n === 1 ? '' : 's'} út${r.n === 1 ? 'il' : 'eis'}</p><p class="sub">De ${br(pdate(cs.a))}, excluída, a ${br(pdate(cs.b))}, incluída</p></div>`;
    out.innerHTML = `
      <p class="gtxt">${r.days} dias corridos, ${r.we} de fim de semana${r.ex.length ? ' e ' + r.ex.length + ' excluídos pela tabela' : ''}.</p>
      ${warns.join('')}
      ${r.ex.length ? `<div class="trail">${r.ex.map((x) => `<div class="tr x"><span class="k">N</span><span class="mono">${br(x.d)}</span><span>${WD[x.d.getDay()]}</span><span>${esc(x.why)}</span></div>`).join('')}</div>` : ''}
      ${monthsHTML(pdate(cs.a), pdate(cs.b), { o: cs, mk: cs.a, due: cs.b })}
      <div class="box"><div class="lbl">Convenção</div><p>Exclui a data inicial e inclui a final, como na contagem do art. 224 do CPC. Fins de semana, feriados, recesso e suspensões da tabela não entram.</p></div>`;
    gstat('calendario', `${r.n} dias úteis no intervalo`);
  }
}
let calYear = 2026;
function anoHTML() {
  return `<div class="ffer">
    <h1 class="ft">Calendário Jurídico</h1>
    <p class="fmeta"><span><strong>Calendário</strong> | tabela anual, cível em dias úteis</span><span>Decreto Judiciário nº 621/2025 | Curitiba | art. 224 do CPC</span></p>
    <div class="pauta" aria-hidden="true"></div>
    <div class="anobar"><div class="segc" role="group" aria-label="Ano" id="c-anos"><button type="button" data-y="2026" aria-pressed="true">2026 | ativo</button><button type="button" data-y="2025" aria-pressed="false">2025 | histórico</button></div>
    <div class="legend"><span><i style="background: var(--support);"></i>Excluído (feriado, recesso, suspensão)</span><span><i style="background: var(--paper); box-shadow: inset 0 0 0 1px var(--rule);"></i>Computável</span><span><i style="box-shadow: inset 0 0 0 1px #707070;"></i>Fim de semana</span></div></div>
    <div id="c-yw"></div>
    <div class="months" id="c-year"></div>
  </div>`;
}
function renderYear() {
  if (!$('#c-year')) return;
  $$('#c-anos [data-y]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.y === calYear)));
  $('#c-yw').innerHTML = calYear === 2025 ? '<div class="box warn"><div class="lbl">Histórico de origem</div><p>Preservado para evitar perda documental; não recebeu conferência normativa anual e não se confunde com a tabela ativa de 2026.</p></div>' : '';
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
const RLABEL = { 'desprovimento com confirmação pelos próprios fundamentos': 'Desprovimento | próprios fundamentos', 'desprovimento com fundamentação própria ou complementar': 'Desprovimento | fundamentação própria', 'parcial provimento': 'Parcial provimento', 'provimento': 'Provimento', 'acolhimento integral': 'Acolhimento integral', 'acolhimento parcial': 'Acolhimento parcial' };
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
        else if (ghost) out.push({ t: 'ghost', kind: 'SE', c: it.c });
        if (!active && !isRes && (!rep || rep === '@1')) collectConds(it.ch, key + '.', depth + 1);
      } else {
        const reps = [];
        for (let r = 1; r <= st.n; r++) reps.push({ label: 'Recurso ' + r, nodes: walk(it.ch, key + '.', '@' + r, depth, parentOn) });
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
    if (n.t === 'rep') return n.reps.map((r) => `<div class="rep"><span class="rl">${r.label} | para cada ${esc(n.c)}</span>${nodesHTML(r.nodes, st)}</div>`).join('');
    if (n.segs.length === 1 && n.segs[0].t === 'gap' && n.segs[0].block) {
      const g = n.segs[0]; const v = st.gaps[g.k] || '';
      return `<textarea class="gap${v ? ' filled' : ''}" data-k="${g.k}" placeholder="${esc(g.ph)}" aria-label="${esc(g.ph)}">${esc(v)}</textarea>`;
    }
    return '<p>' + n.segs.map((s) => {
      if (s.t === 'txt') return esc(s.v);
      if (s.t === 'alt') { const v = st.alts[s.k] || ''; return `<select class="alt" data-a="${s.k}" aria-label="Alternativa: ${esc(s.raw)}"><option value="">${esc(s.raw)}</option>${s.opts.map((o) => `<option${o === v ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`; }
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
  $('#t-res').innerHTML = rset ? `<div class="lbl" style="margin-bottom: 8px;">Resultado</div><div class="radio">${rset.map((r) => `<button type="button" data-res="${esc(r)}" aria-pressed="${st.res === r}">${RLABEL[r]}</button>`).join('')}</div>`
    : `<div class="lbl" style="margin-bottom: 6px;">Resultado</div><p style="font-size: 15px;">${esc(cap(t.res))}</p>`;
  $('#t-conds').innerHTML = conds.length ? `<div class="lbl" style="margin-bottom: 4px;">Condições do caso</div><div class="cgroup">${conds.map((c) => `<label class="chk${c.depth ? ' sub' + (c.depth > 1 ? '2' : '') : ''}${c.enabled ? '' : ' dis'}"><input type="checkbox" data-c="${c.key}"${c.on ? ' checked' : ''}${c.enabled ? '' : ' disabled'}><span>Se ${esc(c.c)}</span></label>`).join('')}</div>` : '';
  $('#t-rep').innerHTML = hasRep ? `<div class="field"><label for="t-n">Recursos no julgamento conjunto</label><input id="t-n" class="input mono" type="number" min="2" max="8" value="${st.n}"></div>` : '';
  $('#t-ed').innerHTML = `<div class="small" style="margin-bottom: 4px;"><strong style="color: var(--ink);">${t.id}</strong> | ${esc(t.classe)} | ${esc(t.apl)}</div>` + nodesHTML(nodes, st);
  $('#t-ghost').setAttribute('aria-pressed', String(ghost)); $('#t-ghost').textContent = ghost ? 'Ocultar blocos inativos' : 'Mostrar blocos inativos';
  updStatus();
}
function updStatus() {
  const p = pending(tmod.nodes, tmod.st);
  $('#t-status').innerHTML = p.g + p.a ? `<strong style="color: var(--accent-ink);">${p.g} lacuna${p.g === 1 ? '' : 's'}</strong>${p.a ? ` e <strong style="color: var(--accent-ink);">${p.a} alternativa${p.a === 1 ? '' : 's'}</strong>` : ''} pendente${p.g + p.a === 1 ? '' : 's'}` : '<strong>Minuta completa</strong>: nenhuma lacuna pendente';
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
  $('#t-clear').addEventListener('click', () => { tstate(tcur).gaps = {}; renderTpl(); toast('Lacunas limpas.'); });
  $('#t-copy').addEventListener('click', () => {
    const p = pending(tmod.nodes, tmod.st);
    copy(nodesText(tmod.nodes, tmod.st).join('\n\n'), p.g + p.a ? `Minuta copiada com ${p.g + p.a} pendência${p.g + p.a === 1 ? '' : 's'} entre chaves.` : 'Minuta copiada.');
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
  $('#f-ct').textContent = `${items.length} de ${FUN.length}`;
  $('#f-syn').innerHTML = P.syn.length ? 'Também buscado: ' + P.syn.slice(0, 6).map((s) => `<strong style="color: var(--ink);">${esc(s)}</strong>`).join(', ') : '';
  const catNames = Object.keys(cats).sort();
  if (fs.cat !== 'all' && !cats[fs.cat]) catNames.unshift(fs.cat);
  $('#f-cat').innerHTML = `<option value="all">Todas as categorias (${total})</option>` + catNames.map((c) => `<option value="${esc(c)}"${fs.cat === c ? ' selected' : ''}>${esc(catLabel(c))} (${cats[c] || 0})</option>`).join('');
  $('#f-list').innerHTML = items.length ? items.map((f) => {
    let sn = f.f;
    if (fs.q.trim()) { const src = [f.g.join('; '), f.e.join('; '), f.l.join('; '), f.b].find((x) => score([{ t: norm(x), w: 1 }], P.terms)) || f.f; sn = snippet(src, P.terms, 130); }
    return `<button type="button" class="ritem" data-id="${f.id}" aria-current="${fs.cur === f.id}"><span class="id">${f.id}</span><span class="tt">${hl(f.t, P.terms)}</span><span class="sn">${hl(sn, P.terms)}</span></button>`;
  }).join('') : '<p class="small" style="padding: 14px 0;">Nenhum fundamento corresponde à busca. Tente um gatilho mais genérico ou consulte o Ementário.</p>';
  if (fs.cur && fs.view === 'det') funDetail(fs.cur, P);
  gstat('fundamentos', fs.q.trim() ? `“${fs.q.trim()}”: ${items.length} de ${FUN.length}` : `${FUN.length} registros em ${FCATS} categorias`);
}
function funDetailHTML(f, P, folha) {
  const none = f.l.some((x) => /^nenhum/i.test(x));
  return `${folha ? '' : `<button type="button" class="gvolta" data-act="voltar">${ICON.volta}Resultados</button>`}
    <h2>${hl(f.t, P.terms)}</h2>
    <div class="tags"><span class="idl">${f.id}</span><span class="tagw mute">${esc(catLabel(f.c))}</span>${f.co && f.co !== f.c ? `<span class="tagw amber">Categoria de origem: ${esc(f.co.toLowerCase())}</span>` : ''}</div>
    ${folha ? '<div class="pauta" aria-hidden="true"></div>' : ''}
    <div class="deftw">
      <div class="row"><div class="dt">Gatilhos de uso</div><div class="dd"><ul>${f.g.map((x) => `<li>${hl(x, P.terms)}</li>`).join('')}</ul></div></div>
      <div class="row"><div class="dt">Função no voto</div><div class="dd">${hl(f.f, P.terms)}</div></div>
      <div class="row"><div class="dt">Elementos de aplicação</div><div class="dd"><ul>${f.e.map((x) => `<li>${hl(x, P.terms)}</li>`).join('')}</ul></div></div>
    </div>
    <div><div class="fhead"><div class="lbl">Formulação-base</div><span class="small">Adaptável: reescrever conforme o caso e o Guia</span></div><div class="formula">${hl(f.b, P.terms)}</div></div>
    <div class="box warn"><div class="lbl">Excludentes e limites</div><ul style="padding-left: 18px;">${f.l.map((x) => `<li>${hl(x, P.terms)}</li>`).join('')}</ul>${none ? '<p class="small" style="margin-top: 6px; color: var(--ink);">“Nenhum” significa que a fonte não listou limite adicional; não autoriza afirmar aplicação sem exceções.</p>' : ''}</div>
    ${f.x.length ? `<details class="corr"><summary>Correções desta edição (${f.x.length})</summary>${f.x.map((x) => `<div class="ci"><strong>${esc(cap(x.campo))}</strong> | ${esc(x.razao)}<div class="small" style="margin-top: 4px;">Texto de origem substituído: ${esc(x.origem)}</div></div>`).join('')}</details>` : ''}
    <div class="acoes">
      <button type="button" class="btn pri" data-act="f-cp" data-id="${f.id}">Copiar formulação</button>
      <button type="button" class="btn ghost" data-act="f-lk" data-id="${f.id}">Copiar link</button>
      <button type="button" class="btn ghost" data-act="f-em" data-id="${f.id}">Buscar no Ementário</button>
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
    return `<div class="tn-row" style="padding-left: ${(depth - 1) * 14}px">${kids.length ? `<button type="button" class="tw" data-tg="${c}" aria-expanded="${open}" aria-label="${open ? 'Recolher' : 'Expandir'}: ${esc(e.d)}">${ICON.chev}</button>` : '<span class="tw"></span>'}<button type="button" class="tn${es.cur === c ? ' cur' : ''}" data-c="${c}"><span>${esc(e.d)}</span>${e.tr ? '<span class="cnt" title="Assunto já abordado pela TR (dado da planilha)">TR</span>' : ''}</button></div>` + (open && kids.length ? treeHTML(kids, depth + 1) : '');
  }).join('');
}
function emeIntro() {
  const tr = EME.filter((e) => e.tr).length;
  $('#e-intro').innerHTML = `<div class="gstats"><div><div class="v">${EME.length.toLocaleString('pt-BR')}</div><div class="l">registros na aba principal</div></div><div><div class="v">${ENSC.toLocaleString('pt-BR')}</div><div class="l">no escopo do Guia</div></div><div><div class="v">${tr.toLocaleString('pt-BR')}</div><div class="l">abordados pela TR</div></div></div>
    <p class="small">Ementa-base com lacunas não é ementa final, e “abordado pela TR” não certifica tese, número de julgados ou caráter vinculante.</p>`;
}
function renderEmeLeft() {
  $$('#gb-ementario [data-sc]').forEach((b) => { if (b.closest('.segc')) b.setAttribute('aria-pressed', String(b.dataset.sc === es.sc)); });
  const left = $('#e-left');
  if (es.q.trim()) {
    const { P, res } = emeSearch(es.q, false);
    const outside = es.sc === 'g' ? emeSearch(es.q, true).res.filter((r) => !SCOPE.has(r.e.r)).length : 0;
    $('#e-ct').textContent = `${res.length} resultado${res.length === 1 ? '' : 's'}`;
    $('#e-lh').textContent = 'Resultados';
    $('#e-intro').innerHTML = '';
    left.innerHTML = '<div class="rlist">' + res.slice(0, 80).map(({ e }) => `<button type="button" class="ritem" data-c="${e.c}" aria-current="${es.cur === e.c}"><span class="id">${e.c}${e.tr ? ' | TR' : ''}</span><span class="tt">${hl(e.d, P.terms)}</span><span class="sn">${esc(cap(e.r.toLowerCase()))}${e._p.length ? ' › ' + e._p.map((x) => esc(x.d)).join(' › ') : ''}</span></button>`).join('') + '</div>' +
      (res.length > 80 ? `<p class="small" style="margin-top: 10px;">Mostrando 80 de ${res.length}. Refine a busca.</p>` : '') +
      (outside ? `<p class="small" style="margin-top: 10px;">${outside} resultado${outside === 1 ? '' : 's'} fora do escopo do Guia.</p><button type="button" class="btn ghost sm" data-sc="a" style="align-self: flex-start;">Ver no acervo completo</button>` : '') +
      (!res.length ? '<p class="small" style="padding: 12px 0;">Nada encontrado neste alcance.</p>' : '');
    gstat('ementario', `“${es.q.trim()}”: ${res.length} resultado${res.length === 1 ? '' : 's'}`);
    if (es.cur && es.view === 'det') emeDetail(es.cur, P);
  } else {
    const ramos = RAMOS.filter((r) => es.sc === 'a' || SCOPE.has(r));
    const n = EME.filter(inSc).length;
    $('#e-ct').textContent = `${n.toLocaleString('pt-BR')} registros`;
    $('#e-lh').textContent = 'Árvore taxonômica';
    emeIntro();
    left.innerHTML = '<div class="tree">' + ramos.map((r) => { const open = es.open.has('R:' + r); const cnt = EME.filter((e) => e.r === r).length; return `<button type="button" class="ramo" data-r="${esc(r)}" aria-expanded="${open}">${ICON.chev}<span>${esc(cap(r.toLowerCase()))}</span><span class="cnt">${cnt}</span></button>` + (open ? treeHTML(ROOTS[r], 1) : ''); }).join('') + '</div>';
    gstat('ementario', `${EME.length.toLocaleString('pt-BR')} registros, ${ENSC.toLocaleString('pt-BR')} no escopo do Guia`);
    if (es.cur && es.view === 'det') emeDetail(es.cur);
  }
}
function emeDetailHTML(e, P, folha) {
  const gaps = (e.eb.match(/\[\.\.\.\]/g) || []).length;
  const ebh = esc(e.eb).replace(/\[\.\.\.\]/g, '<span class="gapm">[...]</span>');
  const val = (s) => (/^\[(SEM VALOR|TEXTO VAZIO) NA FONTE\]$/.test(s) ? `<span class="empty">${s === '[SEM VALOR NA FONTE]' ? 'Sem valor na fonte' : 'Texto vazio na fonte'}</span>` : hl(s, P.terms));
  const kids = (KIDS[e.c] || []).slice().sort(byDesc);
  return `${folha ? '' : `<button type="button" class="gvolta" data-act="voltar">${ICON.volta}${es.q.trim() ? 'Resultados' : 'Árvore'}</button>`}
    <div class="crumb"><span>${esc(cap(e.r.toLowerCase()))}</span>${e._p.map((x) => `<span aria-hidden="true">›</span><button type="button" data-go="${x.c}">${esc(x.d)}</button>`).join('')}</div>
    <h2>${hl(e.d, P.terms)}</h2>
    <div class="tags"><span class="idl">${e.c}</span><span class="tagw mute">Hierarquia ${esc(e.h)}</span><span class="tagw ${e.tr ? '' : 'mute'}">Abordado pela TR: ${e.tr ? 'Sim' : 'Não'} | dado da planilha</span>${SCOPE.has(e.r) ? '' : '<span class="tagw amber">Fora do escopo do Guia</span>'}</div>
    ${folha ? '<div class="pauta" aria-hidden="true"></div>' : ''}
    ${SCOPE.has(e.r) ? '' : '<div class="box warn"><div class="lbl">Ramo fora do escopo</div><p>O ramo é categoria taxonômica de origem e não entra automaticamente na ementa de um voto do escopo civil e de consumo.</p></div>'}
    <div><div class="fhead"><div class="lbl">Ementa-base de origem</div><span class="tagw amber">Não é ementa final</span></div><div class="specw">${ebh}</div>
    <p class="small" style="margin-top: 8px;">${gaps} lacuna${gaps === 1 ? '' : 's'}. Estrutura final pelo Guia: área; classe; subárea quando cabível; tema; tese; resultado.</p></div>
    <div class="deftw">
      <div class="row"><div class="dt">Fundamento / descrição</div><div class="dd">${val(e.fd)}</div></div>
      <div class="row"><div class="dt">Código-mãe</div><div class="dd">${EBY[e.m] ? `<button type="button" class="chip" data-go="${e.m}">${e.m} | ${esc(EBY[e.m].d)}</button>` : esc(e.m || '')}</div></div>
      <div class="row"><div class="dt">Origem</div><div class="dd">Aba Ementário, linha ${esc(e.ln)}</div></div>
      ${kids.length ? `<div class="row"><div class="dt">Assuntos filhos</div><div class="dd"><div class="kids">${kids.map((k) => `<button type="button" class="chip" data-go="${k}">${esc(EBY[k].d)}</button>`).join('')}</div></div></div>` : ''}
    </div>
    <div class="acoes">
      <button type="button" class="btn pri" data-act="e-cp" data-id="${e.c}">Copiar ementa-base</button>
      <button type="button" class="btn ghost" data-act="e-lk" data-id="${e.c}">Copiar link</button>
      <button type="button" class="btn ghost" data-act="e-fn" data-id="${e.c}">Buscar nos Fundamentos</button>
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
  const comp = { 'guia-de-estilo': ['guia', 'Guia de Estilo'], 'regras-de-aplicacao': ['regras', 'Regras de Aplicação'], 'criterios-operacionais': ['criterios', 'Critérios Operacionais'], 'indice-e-arquitetura': ['indice', 'Índice e Arquitetura'], 'memoria-de-integracao': ['memoria', 'Memória de Integração'], 'templates-texto': ['templates', 'Templates'], 'calendario-base': ['calendario', 'Calendário'], 'fundamentos-regra': ['fundamentos', 'Fundamentos'], 'ementario-regra': ['ementario', 'Ementário'] };
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
  const out = { Seções: [], Fundamentos: [], Ementário: [], Templates: [] };
  if (P.terms.length) {
    SIDX.secs.forEach((s) => { const sc = score(s.f, P.terms); if (sc) out['Seções'].push({ sc, html: `<a class="res" href="#${s.v}${s.id ? '/' + s.id : ''}"><span class="id">${esc(s.comp)}</span><span class="tt">${hl(s.h, P.terms)}</span><span class="sn">${hl(snippet(s.t, P.terms), P.terms)}</span></a>` }); });
    FUN.forEach((f) => { const sc = score(f._f, P.terms); if (sc) out['Fundamentos'].push({ sc, html: `<a class="res" href="#fundamentos/${f.id}"><span class="id">${f.id}</span><span class="tt">${hl(f.t, P.terms)}</span><span class="sn">${hl(snippet(f.g.join('; ') + ' | ' + f.f, P.terms, 120), P.terms)}</span></a>` }); });
    EME.forEach((e) => { let sc = score(e._f, P.terms); if (sc) { const ins = SCOPE.has(e.r); sc += ins ? 4 : 0; out['Ementário'].push({ sc, html: `<a class="res" href="#ementario/${e.c}"><span class="id">${e.c}${ins ? '' : ' | fora do escopo'}${e.tr ? ' | TR' : ''}</span><span class="tt">${hl(e.d, P.terms)}</span><span class="sn">${esc(cap(e.r.toLowerCase()))}${e._p.length ? ' › ' + e._p.map((x) => esc(x.d)).join(' › ') : ''}</span></a>` }); } });
    SIDX.tpls.forEach((x) => { const sc = score(x.f, P.terms); if (sc) out['Templates'].push({ sc, html: `<a class="res" href="#templates/${x.t.id}"><span class="id">${x.t.n} | modelo</span><span class="tt">${hl(x.t.id, P.terms)}</span><span class="sn">${hl(snippet(x.txt, P.terms, 130), P.terms)}</span></a>` }); });
    Object.values(out).forEach((a) => a.sort((m, n) => n.sc - m.sc));
  }
  const keys = Object.keys(out); const total = keys.reduce((s, k) => s + out[k].length, 0);
  $('#sf').innerHTML = [['all', 'Tudo', total]].concat(keys.map((k) => [k, k, out[k].length])).map(([k, l, n]) => `<button type="button" data-f="${k}" aria-pressed="${sfilter === k}">${l}${P.terms.length ? ' ' + n : ''}</button>`).join('');
  $('#ssyn').innerHTML = P.syn.length ? 'Também: ' + P.syn.slice(0, 4).map((s) => `<strong style="color: var(--ink);">${esc(s)}</strong>`).join(', ') : '';
  const L = $('#sl');
  if (!P.terms.length) { L.innerHTML = `<div style="padding: 18px 0; display: flex; flex-direction: column; gap: 10px;"><p class="small">Busque em todo o ÁTRIL: seções dos documentos, ${N.fun} fundamentos, ${N.eme.toLocaleString('pt-BR')} registros do Ementário e os ${D.tpl.length} modelos.</p><div style="display: flex; flex-wrap: wrap; gap: 6px;">` + ['gratuidade', 'negativação', 'dialeticidade', 'ementa resultado', 'tempestividade', 'RI-CONJUNTO', '6226'].map((s) => `<button type="button" class="chip" data-try="${s}">${s}</button>`).join('') + '</div></div>'; return; }
  const aviso = faltam ? '<p class="small sespera" role="status">Consultando também Fundamentos e Ementário</p>' : '';
  if (!total) { L.innerHTML = aviso || '<p class="small" style="padding: 18px 0;">Nenhum resultado. Tente um termo mais geral.</p>'; return; }
  L.innerHTML = aviso + keys.filter((k) => (sfilter === 'all' || sfilter === k) && out[k].length).map((k) => `<div class="sgrp"><span class="lbl">${k}</span><span class="small">${out[k].length}</span></div>` + out[k].slice(0, sfilter === 'all' ? (k === 'Ementário' ? 6 : 5) : 60).map((r) => r.html).join('')).join('');
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
  }
  if (e.key === '/' && $('#sov').hidden && CAM.hidden && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
});

/* =====================================================================
   INÍCIO
   ===================================================================== */
montaPartitura();
desenha();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(desenha);
if ('ResizeObserver' in window) new ResizeObserver(() => desenha()).observe(SIS);
else window.addEventListener('resize', desenha);
initCal();
gstat('fundamentos', `${N.fun} registros em ${N.funCat} categorias`);
gstat('ementario', `${N.eme.toLocaleString('pt-BR')} registros, ${N.emeEsc.toLocaleString('pt-BR')} no escopo do Guia`);
window.addEventListener('hashchange', route);
route();
setTimeout(gesto, 900);
})();
