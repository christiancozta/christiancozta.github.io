(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const DOCS = window.ATRIL.docs;
const D = window.ATRIL.data;
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const BASE = location.href.split('#')[0];

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

/* ---------- navegação ---------- */
const VIEWS = ['inicio', 'guia', 'regras', 'criterios', 'templates', 'calendario', 'fundamentos', 'ementario', 'indice', 'memoria'];
const TITLES = { inicio: 'Início', guia: 'Guia de Estilo', regras: 'Regras de Aplicação', criterios: 'Critérios Operacionais', templates: 'Templates', calendario: 'Calendário', fundamentos: 'Fundamentos', ementario: 'Ementário', indice: 'Índice e Arquitetura', memoria: 'Memória de Integração' };
const ORDER = VIEWS.slice(1);
const inited = {};
let current = null;

function renderDoc(el, key) {
  el.innerHTML = DOCS[key] || '';
  const rail = el.parentElement && el.parentElement.querySelector('.rail');
  if (rail) buildRail(rail, el, key);
}
const DOCVIEW = { 'guia-de-estilo': 'guia', 'regras-de-aplicacao': 'regras', 'criterios-operacionais': 'criterios', 'indice-e-arquitetura': 'indice', 'memoria-de-integracao': 'memoria', 'templates-texto': 'templates', 'calendario-base': 'calendario', 'fundamentos-regra': 'fundamentos', 'ementario-regra': 'ementario' };
function viewOfDocKey(key) { return DOCVIEW[key] || key; }
function buildRail(rail, art, key) {
  const v = viewOfDocKey(key);
  const hs = $$('.op h1[id], h2.h2[id]', art);
  if (hs.length < 2) { rail.hidden = true; return; }
  rail.innerHTML = '<div class="lbl">Nesta página</div>' + hs.map((h) => `<a href="#${v}/${h.id}" data-id="${h.id}" class="${h.tagName === 'H1' ? 'ch' : ''}">${esc(h.textContent)}</a>`).join('');
  if ('IntersectionObserver' in window) {
    const links = $$('a', rail);
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => { if (en.isIntersecting) { links.forEach((a) => a.classList.toggle('on', a.dataset.id === en.target.id)); } });
    }, { rootMargin: '-80px 0px -70% 0px' });
    hs.forEach((h) => io.observe(h));
  }
}
function docView(v) {
  const sec = $('#v-' + v);
  const k = sec.dataset.doc;
  const i = ORDER.indexOf(v);
  const prev = ORDER[i - 1], next = ORDER[i + 1];
  sec.innerHTML = `<div class="docwrap"><article class="doc flow v4"></article><aside class="rail"></aside></div>
    <nav class="pager" aria-label="Componentes vizinhos">${prev ? `<a href="#${prev}"><span class="small">Anterior</span><span class="t">${TITLES[prev]}</span></a>` : '<span></span>'}${next ? `<a href="#${next}"><span class="small">Próximo</span><span class="t">${TITLES[next]}</span></a>` : ''}</nav>`;
  renderDoc($('article', sec), k);

}
function lazyDocs(scope) { $$('[data-doc]', scope).forEach((el) => { if (el.tagName === 'ARTICLE' && !el.dataset.done) { renderDoc(el, el.dataset.doc); el.dataset.done = '1'; } }); }

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

function route() {
  const h = decodeURIComponent(location.hash.slice(1));
  let [v, sub] = h.split('/');
  if (!VIEWS.includes(v)) { v = 'inicio'; sub = null; }
  if (current !== v) {
    $$('.view').forEach((s) => { s.hidden = s.id !== 'v-' + v; s.classList.toggle('cur', s.id === 'v-' + v); });
    $$('#nav a[data-v]').forEach((a) => { if (a.dataset.v === v) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); a.classList.toggle('on', a.dataset.v === v); });
    document.title = (v === 'inicio' ? '' : TITLES[v] + ' | ') + 'ATRIL';
    if (!inited[v]) { inited[v] = true; init(v); }
    current = v;
    if (!sub) window.scrollTo(0, 0);
  }
  closeNav();
  handleSub(v, sub);
}
function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return true; }
  return false;
}
function handleSub(v, sub) {
  if (!sub) return;
  if (v === 'templates') { if (sub.startsWith('templates-')) { setTabs($('#t-tabs'), 't', 't'); scrollToId(sub); } else if (TPLIDX[sub] != null) { setTabs($('#t-tabs'), 't', 'm'); tplSelect(sub); } return; }
  if (v === 'calendario') { if (sub.startsWith('calendario-')) { setTabs($('#c-tabs'), 'c', 'base'); scrollToId(sub); } else if (sub === 'ano') setTabs($('#c-tabs'), 'c', 'ano'); return; }
  if (v === 'fundamentos') { if (sub.startsWith('fundamentos-')) { setTabs($('#f-tabs'), 'f', 'r'); scrollToId(sub); } else { setTabs($('#f-tabs'), 'f', 'b'); funSelect(sub, true); } return; }
  if (v === 'ementario') { if (sub.startsWith('ementario-')) { setTabs($('#e-tabs'), 'e', 'r'); scrollToId(sub); } else { setTabs($('#e-tabs'), 'e', 'b'); emeSelect(sub, true); } return; }
  setTimeout(() => scrollToId(sub), 30);
}
function init(v) {
  if ($('#v-' + v).dataset.doc) docView(v);
  if (v === 'templates') initTpl();
  if (v === 'calendario') initCal();
  if (v === 'fundamentos') initFun();
  if (v === 'ementario') initEme();
}
function closeNav() { $('#nav').classList.remove('open'); $('#menubtn').setAttribute('aria-expanded', 'false'); }
$('#menubtn').addEventListener('click', (e) => { e.stopPropagation(); const o = $('#nav').classList.toggle('open'); $('#menubtn').setAttribute('aria-expanded', String(o)); });
document.addEventListener('click', (e) => { if ($('#nav').classList.contains('open') && !e.target.closest('#nav')) closeNav(); });

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
function renderCal() {
  $$('#c-form [data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === cs.mode)));
  $('#c-prazo').style.display = cs.mode === 'prazo' ? 'flex' : 'none';
  $('#c-int').style.display = cs.mode === 'int' ? 'flex' : 'none';
  $('#c-ml').textContent = cs.dje ? 'Data da disponibilização no DJe' : 'Marco (intimação ou publicação)';
  $('#c-xl').innerHTML = cs.ex.map((k) => `<span class="chip">${br(pdate(k))}<button type="button" aria-label="Remover ${br(pdate(k))}" data-rm="${k}">×</button></span>`).join('');
  const out = $('#c-out'); const warns = [];
  if (cs.loc === 'out') warns.push('<div class="box warn"><div class="lbl">Outra comarca</div><p>O feriado de 8 de setembro (Curitiba) deixa de ser excluído. A tabela não incorpora os feriados locais das demais comarcas: inclua-os nas exclusões do processo.</p></div>');
  if (cs.mode === 'prazo') {
    if (!cs.marco || !(cs.n >= 1)) { out.innerHTML = '<p class="small">Informe o marco e o número de dias úteis.</p>'; return; }
    const r = calcPrazo(cs);
    if (r.hist) warns.unshift('<div class="box warn"><div class="lbl">Histórico de 2025</div><p>O intervalo alcança 2025, base preservada sem conferência normativa anual. Verifique as fontes de 2025 e a localidade antes de concluir.</p></div>');
    if (r.blocked) {
      out.innerHTML = '<div class="box warn" style="padding: 20px 24px;"><div class="lbl">Intervalo não coberto</div><p style="font-size: 16px;">A contagem sai da base disponível (2025 e 2026; não há tabela de 2027). A ferramenta não conclui o prazo: recupere a base do período antes de prosseguir.</p></div>' + warns.join('');
      return;
    }
    const exTxt = r.ex.length ? 'Excluídos pela tabela: ' + r.ex.map((x) => `${br(x.d).slice(0, 5)} (${esc(x.why.split(';')[0].replace(/ \(.*\)$/, ''))})`).join(', ') + ', além dos fins de semana.' : 'Sem feriados ou suspensões no intervalo; excluídos apenas os fins de semana.';
    const count = {}; r.rows.forEach((x) => { if (x.cls === 'c' || x.cls === 'due') count[iso(x.d)] = x.k; });
    out.innerHTML = `
      <div class="dark"><div><div class="lbl">Vencimento</div><div class="big">${pad(r.due.getDate())} de ${MESL[r.due.getMonth()]} de ${r.due.getFullYear()}</div><div style="margin-top: 4px;">${WDL[r.due.getDay()]} | ${cs.n}º dia útil</div></div>
      <div class="txt">${r.pub ? `Publicação em <strong>${br(r.pub)}</strong>. ` : ''}Início da contagem em <strong>${br(r.first)}</strong>. ${exTxt}</div></div>
      ${warns.join('')}
      ${monthsHTML(pdate(cs.marco), r.due, { o: cs, count, mk: cs.marco, due: iso(r.due) })}
      <div class="legend"><span><i style="box-shadow: inset 0 0 0 2px var(--ink);"></i>Marco</span><span><i style="background: var(--accent-tint);"></i>Dia contado</span><span><i style="background: var(--support);"></i>Excluído pela tabela</span><span><i style="background: repeating-linear-gradient(135deg, var(--support-tint) 0 4px, var(--paper) 4px 8px);"></i>Exclusão informada</span><span><i style="background: var(--ink);"></i>Vencimento</span></div>
      <div><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; gap: 12px;"><h2 class="h3w">Trilha de conferência</h2><button type="button" class="btn ghost sm" id="c-copy">Copiar trilha</button></div>
      <div class="trail">${r.rows.map((x) => `<div class="tr ${x.cls}"><span class="k">${x.k}</span><span class="mono">${br(x.d)}</span><span>${WD[x.d.getDay()]}</span><span>${esc(x.why || '')}</span></div>`).join('')}</div></div>
      <div class="box"><div class="lbl">Limites da base</div><p>Contagem pelo art. 224 do CPC: exclui o dia do começo e inclui o do vencimento. A tabela cobre 2026 (ativo) e 2025 (histórico); não há 2027. O campo de contagem não indica expediente, e a data de ciência, disponibilização ou publicação continua a ser determinada no processo.</p></div>`;
    $('#c-copy').onclick = () => copy(trailText(r, cs), 'Trilha copiada.');
  } else {
    if (!cs.a || !cs.b) { out.innerHTML = '<p class="small">Informe as duas datas.</p>'; return; }
    const r = calcInt(cs);
    if (r.bad) { out.innerHTML = '<div class="box warn"><div class="lbl">Datas</div><p>A data final deve ser posterior à inicial.</p></div>'; return; }
    if (r.blocked) { out.innerHTML = '<div class="box warn" style="padding: 20px 24px;"><div class="lbl">Intervalo não coberto</div><p style="font-size: 16px;">O intervalo sai da base disponível (2025 e 2026). A ferramenta não conclui a contagem.</p></div>'; return; }
    if (r.hist) warns.unshift('<div class="box warn"><div class="lbl">Histórico de 2025</div><p>O intervalo alcança 2025, base preservada sem conferência normativa anual.</p></div>');
    out.innerHTML = `
      <div class="dark"><div><div class="lbl">Dias úteis no intervalo</div><div class="big" style="font-size: 56px;">${r.n}</div></div>
      <div class="txt">De ${br(pdate(cs.a))} (excluída) a ${br(pdate(cs.b))} (incluída): ${r.days} dias corridos, ${r.we} de fim de semana${r.ex.length ? ' e ' + r.ex.length + ' excluídos pela tabela' : ''}.</div></div>
      ${warns.join('')}
      ${r.ex.length ? `<div class="trail">${r.ex.map((x) => `<div class="tr x"><span class="k">N</span><span class="mono">${br(x.d)}</span><span>${WD[x.d.getDay()]}</span><span>${esc(x.why)}</span></div>`).join('')}</div>` : ''}
      ${monthsHTML(pdate(cs.a), pdate(cs.b), { o: cs, mk: cs.a, due: cs.b })}
      <div class="box"><div class="lbl">Convenção</div><p>Exclui a data inicial e inclui a final, como na contagem do art. 224 do CPC. Fins de semana, feriados, recesso e suspensões da tabela não entram.</p></div>`;
  }
}
let calYear = 2026;
function renderYear() {
  $$('#c-ano [data-y]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.y === calYear)));
  $('#c-yw').innerHTML = calYear === 2025 ? '<div class="box warn" style="margin-bottom: 18px;"><div class="lbl">Histórico de origem</div><p>Preservado para evitar perda documental; não recebeu conferência normativa anual e não se confunde com a tabela ativa de 2026.</p></div>' : '';
  let h = ''; for (let m = 0; m < 12; m++) h += monthHTML(calYear, m, { o: { loc: 'cwb', ex: [] } });
  $('#c-year').innerHTML = h;
}
function initCal() {
  bindTabs('c-tabs', 'c', (t) => { if (t === 'ano') renderYear(); });
  $('#c-m').value = cs.marco; $('#c-n').value = cs.n; $('#c-a').value = cs.a; $('#c-b').value = cs.b;
  $('#c-form').addEventListener('click', (e) => {
    const b = e.target.closest('[data-mode]'); if (b) { cs.mode = b.dataset.mode; renderCal(); }
    const rm = e.target.closest('[data-rm]'); if (rm) { cs.ex = cs.ex.filter((k) => k !== rm.dataset.rm); renderCal(); }
  });
  $('#c-m').addEventListener('input', (e) => { cs.marco = e.target.value; renderCal(); });
  $('#c-n').addEventListener('input', (e) => { cs.n = Math.min(250, parseInt(e.target.value, 10) || 0); renderCal(); });
  $('#c-a').addEventListener('input', (e) => { cs.a = e.target.value; renderCal(); });
  $('#c-b').addEventListener('input', (e) => { cs.b = e.target.value; renderCal(); });
  $('#c-dje').addEventListener('change', (e) => { cs.dje = e.target.checked; renderCal(); });
  $('#c-l').addEventListener('change', (e) => { cs.loc = e.target.value; renderCal(); });
  $('#c-xadd').addEventListener('click', () => { const v = $('#c-x').value; if (v && !cs.ex.includes(v)) { cs.ex.push(v); cs.ex.sort(); $('#c-x').value = ''; renderCal(); } });
  $('#c-ano').addEventListener('click', (e) => { const b = e.target.closest('[data-y]'); if (b) { calYear = +b.dataset.y; renderYear(); } });
  renderCal();
}
function quickCal() {
  const m = $('#q-m'), n = $('#q-n'), out = $('#q-out');
  m.value = DEF_MARCO;
  const go = () => {
    const o = { marco: m.value, n: parseInt(n.value, 10) || 0, dje: false, loc: 'cwb', ex: [] };
    if (!o.marco || o.n < 1) { out.innerHTML = '<span class="small">Informe marco e dias.</span>'; return; }
    const r = calcPrazo(o);
    if (r.blocked) { out.innerHTML = '<div class="lbl">Vencimento</div><p style="margin-top: 4px;">Fora da base disponível (sem 2027).</p>'; return; }
    out.innerHTML = `<div class="lbl">Vencimento</div><div style="font: 700 24px/1.2 var(--f-display); margin-top: 4px;">${br(r.due)}</div><div class="small" style="margin-top: 2px;">${WDL[r.due.getDay()]}${r.ex.length ? ' | excluídos: ' + r.ex.map((x) => br(x.d).slice(0, 5)).join(', ') : ''}${r.hist ? ' | alcança o histórico de 2025' : ''}</div>`;
  };
  m.addEventListener('input', go); n.addEventListener('input', go); go();
  $('#q-go').addEventListener('click', () => { cs.marco = m.value || cs.marco; cs.n = parseInt(n.value, 10) || cs.n; cs.mode = 'prazo'; if (inited.calendario) { $('#c-m').value = cs.marco; $('#c-n').value = cs.n; renderCal(); } });
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
  bindTabs('t-tabs', 't', (tab) => { if (tab === 'a' && !$('#t-adoc').dataset.done) { $('#t-adoc').innerHTML = DOCS['templates-anotados']; $('#t-adoc').dataset.done = '1'; } });
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
   FUNDAMENTOS
   ===================================================================== */
const FUN = D.fun; const FBY = {}; FUN.forEach((f) => { FBY[f.id] = f; });
FUN.forEach((f) => {
  f._f = [{ t: norm(f.t), w: 10 }, { t: norm(f.g.join(' | ')), w: 8 }, { t: norm(f.e.join(' | ')), w: 4 }, { t: norm(f.f), w: 3 }, { t: norm(f.c), w: 3 }, { t: norm(f.b), w: 2 }, { t: norm(f.l.join(' | ')), w: 2 }, { t: norm(f.id), w: 20 }];
});
const fs = { q: '', cat: 'all', cur: null };
function funSearch(q) {
  const P = parseQuery(q); if (!P.terms.length) return { P, res: [] };
  const res = []; FUN.forEach((f) => { const s = score(f._f, P.terms); if (s) res.push({ f, s }); });
  res.sort((a, b) => b.s - a.s || a.f.id.localeCompare(b.f.id)); return { P, res };
}
function renderFunList() {
  const { P, res } = funSearch(fs.q);
  let items = fs.q.trim() ? res.map((r) => r.f) : FUN.slice();
  const cats = {}; items.forEach((f) => { cats[f.c] = (cats[f.c] || 0) + 1; });
  if (fs.cat !== 'all') items = items.filter((f) => f.c === fs.cat);
  $('#f-ct').textContent = `${items.length} de ${FUN.length}`;
  $('#f-syn').innerHTML = P.syn.length ? 'Também buscado: ' + P.syn.slice(0, 6).map((s) => `<strong style="color: var(--ink);">${esc(s)}</strong>`).join(', ') : '';
  const catNames = Object.keys(cats).sort();
  $('#f-cats').innerHTML = `<button type="button" class="chip" data-cat="all" aria-pressed="${fs.cat === 'all'}">Todas <span class="ct">${Object.values(cats).reduce((a, b) => a + b, 0)}</span></button>` + catNames.map((c) => `<button type="button" class="chip" data-cat="${esc(c)}" aria-pressed="${fs.cat === c}">${esc(cap(c.toLowerCase()).replace(/ — /g, ' | '))} <span class="ct">${cats[c]}</span></button>`).join('');
  $('#f-list').innerHTML = items.length ? items.map((f) => {
    let sn = f.f;
    if (fs.q.trim()) { const src = [f.g.join('; '), f.e.join('; '), f.l.join('; '), f.b].find((x) => score([{ t: norm(x), w: 1 }], P.terms)) || f.f; sn = snippet(src, P.terms, 130); }
    return `<button type="button" class="ritem" data-id="${f.id}" aria-current="${fs.cur === f.id}"><span class="id">${f.id}</span><span class="tt">${hl(f.t, P.terms)}</span><span class="sn">${hl(sn, P.terms)}</span></button>`;
  }).join('') : '<p class="small" style="padding: 16px 0;">Nenhum fundamento corresponde à busca. Tente um gatilho mais genérico ou verifique o Ementário.</p>';
  if (!fs.cur && items.length) funDetail(items[0].id, P);
  else if (fs.cur) funDetail(fs.cur, P);
}
function funDetail(id, P) {
  const f = FBY[id]; if (!f) return; fs.cur = id; P = P || parseQuery(fs.q);
  $$('#f-list .ritem').forEach((b) => b.setAttribute('aria-current', String(b.dataset.id === id)));
  const none = f.l.some((x) => /^nenhum/i.test(x));
  $('#f-det').innerHTML = `
    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 10px;"><span class="idl">${f.id}</span><span class="tagw mute">${esc(cap(f.c.toLowerCase()).replace(/ — /g, ' | '))}</span>${f.co && f.co !== f.c ? `<span class="tagw amber">Categoria de origem: ${esc(f.co.toLowerCase())}</span>` : ''}</div>
    <h2>${hl(f.t, P.terms)}</h2>
    <div class="deftw">
      <div class="row"><div class="dt">Gatilhos de uso</div><div class="dd"><ul>${f.g.map((x) => `<li>${hl(x, P.terms)}</li>`).join('')}</ul></div></div>
      <div class="row"><div class="dt">Função no voto</div><div class="dd">${hl(f.f, P.terms)}</div></div>
      <div class="row"><div class="dt">Elementos de aplicação</div><div class="dd"><ul>${f.e.map((x) => `<li>${hl(x, P.terms)}</li>`).join('')}</ul></div></div>
    </div>
    <div><div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 8px;"><div class="lbl">Formulação-base</div><span class="small">Adaptável: reescrever conforme o caso e o Guia</span></div><div class="formula">${hl(f.b, P.terms)}</div></div>
    <div class="box warn"><div class="lbl">Excludentes e limites</div><ul style="padding-left: 18px;">${f.l.map((x) => `<li>${hl(x, P.terms)}</li>`).join('')}</ul>${none ? '<p class="small" style="margin-top: 6px; color: var(--ink);">“Nenhum” significa que a fonte não listou limite adicional; não autoriza afirmar aplicação sem exceções.</p>' : ''}</div>
    ${f.x.length ? `<details class="corr"><summary>Correções desta edição (${f.x.length})</summary>${f.x.map((x) => `<div class="ci"><strong>${esc(cap(x.campo))}</strong> | ${esc(x.razao)}<div class="small" style="margin-top: 4px;">Texto de origem substituído: ${esc(x.origem)}</div></div>`).join('')}</details>` : ''}
    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
      <button type="button" class="btn pri" id="f-cp">Copiar formulação-base</button>
      <button type="button" class="btn ghost" id="f-lk">Copiar link</button>
      <button type="button" class="btn ghost" id="f-em">Buscar no Ementário</button>
    </div>`;
  $('#f-cp').onclick = () => copy(f.b, 'Formulação copiada. Adapte ao caso e ao Guia antes de usar.');
  $('#f-lk').onclick = () => copy(BASE + '#fundamentos/' + f.id, 'Link do registro copiado.');
  $('#f-em').onclick = () => { es.q = fs.q.trim() || f.t.replace(/\s*\(.*\)\s*$/, ''); location.hash = '#ementario'; if (inited.ementario) { $('#e-q').value = es.q; renderEmeLeft(); } };
}
function funSelect(id, fromRoute) {
  if (!FBY[id]) return;
  if (fs.cat !== 'all' && FBY[id].c !== fs.cat) { fs.cat = 'all'; }
  fs.cur = id; renderFunList();
  if (fromRoute && window.innerWidth < 900) $('#f-det').scrollIntoView({ behavior: 'smooth' });
}
let fTimer;
function initFun() {
  bindTabs('f-tabs', 'f');
  $('#f-q').value = fs.q;
  $('#f-q').addEventListener('input', (e) => { clearTimeout(fTimer); fTimer = setTimeout(() => { fs.q = e.target.value; fs.cur = null; renderFunList(); }, 120); });
  $('#f-cats').addEventListener('click', (e) => { const b = e.target.closest('[data-cat]'); if (b) { fs.cat = b.dataset.cat; fs.cur = null; renderFunList(); } });
  $('#f-list').addEventListener('click', (e) => { const b = e.target.closest('[data-id]'); if (b) { history.replaceState(null, '', '#fundamentos/' + b.dataset.id); funDetail(b.dataset.id); if (window.innerWidth < 900) $('#f-det').scrollIntoView({ behavior: 'smooth' }); } });
  renderFunList();
}

/* =====================================================================
   EMENTÁRIO
   ===================================================================== */
const EME = D.eme; const EBY = {}; EME.forEach((e) => { EBY[e.c] = e; });
const KIDS = {}; EME.forEach((e) => { if (EBY[e.m]) (KIDS[e.m] = KIDS[e.m] || []).push(e.c); });
const SCOPE = new Set(['DIREITO CIVIL', 'DIREITO DO CONSUMIDOR', 'DIREITO PROCESSUAL CIVIL E DO TRABALHO']);
const pathOf = (e) => { const p = []; let x = e; let g = 0; while (x && EBY[x.m] && g++ < 10) { x = EBY[x.m]; p.unshift(x); } return p; };
EME.forEach((e) => { e._p = pathOf(e); e._f = [{ t: norm(e.c), w: 30 }, { t: norm(e.d), w: 10 }, { t: norm(e._p.map((x) => x.d).join(' > ')), w: 3 }, { t: norm(e.eb), w: 2 }, { t: norm(e.fd), w: 1 }, { t: norm(e.r), w: 1 }]; });
const ROOTS = {}; EME.forEach((e) => { if (!EBY[e.m]) (ROOTS[e.r] = ROOTS[e.r] || []).push(e.c); });
const RAMOS = Object.keys(ROOTS).sort();
const es = { sc: 'g', q: '', cur: null, open: new Set() };
const inSc = (e) => es.sc === 'a' || SCOPE.has(e.r);
const byDesc = (a, b) => EBY[a].d.localeCompare(EBY[b].d, 'pt');
function emeSearch(q, all) {
  const P = parseQuery(q); if (!P.terms.length) return { P, res: [] };
  const res = [];
  EME.forEach((e) => { if (!all && !inSc(e)) return; let s = score(e._f, P.terms); if (s) { if (norm(q).trim() === e.c) s += 100; res.push({ e, s: s + (SCOPE.has(e.r) ? 2 : 0) }); } });
  res.sort((a, b) => b.s - a.s); return { P, res };
}
function treeHTML(codes, depth) {
  return codes.filter((c) => inSc(EBY[c])).sort(byDesc).map((c) => {
    const e = EBY[c]; const kids = (KIDS[c] || []).filter((k) => inSc(EBY[k])); const open = es.open.has(c);
    return `<button type="button" class="tn${es.cur === c ? ' cur' : ''}" data-c="${c}" style="padding-left: ${4 + depth * 18}px" aria-expanded="${kids.length ? open : ''}"><span class="tw">${kids.length ? (open ? '▾' : '▸') : ''}</span><span>${esc(e.d)}</span>${e.tr ? '<span class="cnt" title="Assunto já abordado pela TR (dado da planilha)">TR</span>' : ''}</button>` + (open && kids.length ? treeHTML(kids, depth + 1) : '');
  }).join('');
}
function renderEmeLeft() {
  $$('#v-ementario [data-sc]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.sc === es.sc)));
  const left = $('#e-left');
  if (es.q.trim()) {
    const { P, res } = emeSearch(es.q, false);
    const outside = es.sc === 'g' ? emeSearch(es.q, true).res.filter((r) => !SCOPE.has(r.e.r)).length : 0;
    $('#e-ct').textContent = `${res.length} resultado${res.length === 1 ? '' : 's'}`;
    $('#e-lh').textContent = 'Resultados';
    left.innerHTML = '<div class="rlist">' + res.slice(0, 80).map(({ e }) => `<button type="button" class="ritem" data-c="${e.c}" aria-current="${es.cur === e.c}"><span class="id">${e.c}${e.tr ? ' | TR' : ''}</span><span class="tt">${hl(e.d, P.terms)}</span><span class="sn">${esc(cap(e.r.toLowerCase()))}${e._p.length ? ' › ' + e._p.map((x) => esc(x.d)).join(' › ') : ''}</span></button>`).join('') + '</div>' +
      (res.length > 80 ? `<p class="small" style="margin-top: 10px;">Mostrando 80 de ${res.length}. Refine a busca.</p>` : '') +
      (outside ? `<p class="small" style="margin-top: 10px;">${outside} resultado${outside === 1 ? '' : 's'} fora do escopo do Guia. <button type="button" class="btn ghost sm" data-sc="a" style="margin-top: 6px;">Ver no acervo completo</button></p>` : '') +
      (!res.length ? '<p class="small" style="padding: 12px 0;">Nada encontrado neste alcance.</p>' : '');
    if (!es.cur && res.length) emeDetail(res[0].e.c, P); else if (es.cur) emeDetail(es.cur, P);
  } else {
    const ramos = RAMOS.filter((r) => es.sc === 'a' || SCOPE.has(r));
    const n = EME.filter(inSc).length;
    $('#e-ct').textContent = `${n.toLocaleString('pt-BR')} registros`;
    $('#e-lh').textContent = 'Árvore taxonômica';
    left.innerHTML = '<div class="tree">' + ramos.map((r) => { const open = es.open.has('R:' + r); const cnt = EME.filter((e) => e.r === r).length; return `<button type="button" class="tn ramo" data-r="${esc(r)}" aria-expanded="${open}"><span class="tw">${open ? '▾' : '▸'}</span><span>${esc(cap(r.toLowerCase()))}</span><span class="cnt">${cnt}</span></button>` + (open ? treeHTML(ROOTS[r], 1) : ''); }).join('') + '</div>';
    if (es.cur) emeDetail(es.cur); else emeIntro();
  }
}
function emeIntro() {
  const n = EME.filter((e) => SCOPE.has(e.r)).length; const tr = EME.filter((e) => e.tr).length;
  $('#e-det').innerHTML = `
    <div class="g3" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px;">
      <div class="stat"><div class="v">${EME.length.toLocaleString('pt-BR')}</div><div class="l"><strong>Registros</strong>aba principal da planilha</div></div>
      <div class="stat"><div class="v">${n}</div><div class="l"><strong>No escopo do Guia</strong>civil, consumidor e processual civil</div></div>
      <div class="stat"><div class="v">${tr}</div><div class="l"><strong>Abordados pela TR</strong>informação da planilha</div></div>
    </div>
    <div class="box"><div class="lbl">Como usar</div><p>Busque por assunto, código ou texto-base, ou navegue pela árvore. Ementa-base com lacunas não é ementa final, e “abordado pela TR” não certifica tese, número de julgados ou caráter vinculante.</p></div>`;
}
function emeDetail(c, P) {
  const e = EBY[c]; if (!e) return; es.cur = c; P = P || parseQuery(es.q);
  $$('#e-left [data-c]').forEach((b) => { b.classList.toggle('cur', b.dataset.c === c && b.classList.contains('tn')); if (b.classList.contains('ritem')) b.setAttribute('aria-current', String(b.dataset.c === c)); });
  const gaps = (e.eb.match(/\[\.\.\.\]/g) || []).length;
  const ebh = esc(e.eb).replace(/\[\.\.\.\]/g, '<span class="gapm">[...]</span>');
  const val = (s) => /^\[(SEM VALOR|TEXTO VAZIO) NA FONTE\]$/.test(s) ? `<span class="empty">${s === '[SEM VALOR NA FONTE]' ? 'Sem valor na fonte' : 'Texto vazio na fonte'}</span>` : hl(s, P.terms);
  const kids = (KIDS[c] || []).slice().sort(byDesc);
  $('#e-det').innerHTML = `
    <div class="crumb"><span>${esc(cap(e.r.toLowerCase()))}</span>${e._p.map((x) => `<span>›</span><button type="button" data-go="${x.c}">${esc(x.d)}</button>`).join('')}</div>
    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 10px;"><span class="idl">${e.c}</span><span class="tagw mute">Hierarquia ${esc(e.h)}</span><span class="tagw ${e.tr ? '' : 'mute'}">Abordado pela TR: ${e.tr ? 'Sim' : 'Não'} | dado da planilha</span>${SCOPE.has(e.r) ? '' : '<span class="tagw amber">Fora do escopo do Guia</span>'}</div>
    <h2>${hl(e.d, P.terms)}</h2>
    ${SCOPE.has(e.r) ? '' : '<div class="box warn"><div class="lbl">Ramo fora do escopo</div><p>O ramo é categoria taxonômica de origem e não entra automaticamente na ementa de um voto do escopo civil e de consumo.</p></div>'}
    <div><div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 8px;"><div class="lbl">Ementa-base de origem</div><span class="tagw amber">Não é ementa final</span></div><div class="specw">${ebh}</div>
    <p class="small" style="margin-top: 8px;">${gaps} lacuna${gaps === 1 ? '' : 's'}. Estrutura final pelo Guia: área; classe; subárea quando cabível; tema; tese; resultado.</p></div>
    <div class="deftw">
      <div class="row"><div class="dt">Fundamento / descrição</div><div class="dd">${val(e.fd)}</div></div>
      <div class="row"><div class="dt">Código-mãe</div><div class="dd">${EBY[e.m] ? `<button type="button" class="chip" data-go="${e.m}">${e.m} | ${esc(EBY[e.m].d)}</button>` : esc(e.m || '')}</div></div>
      <div class="row"><div class="dt">Origem</div><div class="dd">Aba Ementário, linha ${esc(e.ln)}</div></div>
      ${kids.length ? `<div class="row"><div class="dt">Assuntos filhos</div><div class="dd"><div class="kids">${kids.map((k) => `<button type="button" class="chip" data-go="${k}">${esc(EBY[k].d)}</button>`).join('')}</div></div></div>` : ''}
    </div>
    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
      <button type="button" class="btn pri" id="e-cp">Copiar ementa-base</button>
      <button type="button" class="btn ghost" id="e-lk">Copiar link</button>
      <button type="button" class="btn ghost" id="e-fn">Buscar nos Fundamentos</button>
    </div>`;
  $('#e-cp').onclick = () => copy(e.eb, 'Ementa-base copiada. Preencha as lacunas conforme o Guia.');
  $('#e-lk').onclick = () => copy(BASE + '#ementario/' + e.c, 'Link do registro copiado.');
  $('#e-fn').onclick = () => { fs.q = es.q.trim() || e.d; fs.cur = null; location.hash = '#fundamentos'; if (inited.fundamentos) { $('#f-q').value = fs.q; renderFunList(); } };
}
function emeSelect(c, fromRoute) {
  const e = EBY[c]; if (!e) return;
  if (!SCOPE.has(e.r)) es.sc = 'a';
  es.open.add('R:' + e.r); e._p.forEach((x) => es.open.add(x.c));
  es.cur = c; renderEmeLeft();
  if (fromRoute && window.innerWidth < 900) $('#e-det').scrollIntoView({ behavior: 'smooth' });
}
let eTimer;
function initEme() {
  bindTabs('e-tabs', 'e');
  $('#e-q').value = es.q;
  $('#e-q').addEventListener('input', (ev) => { clearTimeout(eTimer); eTimer = setTimeout(() => { es.q = ev.target.value; es.cur = null; renderEmeLeft(); }, 150); });
  $('#v-ementario').addEventListener('click', (ev) => {
    const sc = ev.target.closest('[data-sc]'); if (sc) { es.sc = sc.dataset.sc; if (es.cur && !inSc(EBY[es.cur])) es.cur = null; renderEmeLeft(); return; }
    const r = ev.target.closest('[data-r]'); if (r) { const k = 'R:' + r.dataset.r; es.open.has(k) ? es.open.delete(k) : es.open.add(k); renderEmeLeft(); return; }
    const go = ev.target.closest('[data-go]'); if (go) { history.replaceState(null, '', '#ementario/' + go.dataset.go); emeSelect(go.dataset.go); return; }
    const n = ev.target.closest('[data-c]');
    if (n) {
      const c = n.dataset.c;
      if (n.classList.contains('tn') && (KIDS[c] || []).length) { if (es.open.has(c) && es.cur === c) es.open.delete(c); else es.open.add(c); }
      history.replaceState(null, '', '#ementario/' + c); es.cur = c;
      if (n.classList.contains('tn')) renderEmeLeft(); else emeDetail(c);
      if (window.innerWidth < 900) $('#e-det').scrollIntoView({ behavior: 'smooth' });
    }
  });
  renderEmeLeft();
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
    let cur = { id: null, h: name, txt: [] }; const push = () => { const t = cur.txt.join(' ').replace(/\s+/g, ' ').trim(); if (t || cur.id) secs.push({ v, comp: name, id: cur.id, h: cur.h, t, f: [{ t: norm(cur.h), w: 6 }, { t: norm(t), w: 1 }] }); };
    Array.from(tpl.content.children).forEach((el) => {
      const h = el.matches('h2.h2[id]') ? el : el.querySelector('h1[id]');
      if (h) { push(); cur = { id: h.id, h: h.textContent.trim(), txt: el === h ? [] : [tx(el).replace(h.textContent, '')] }; }
      else cur.txt.push(tx(el));
    });
    push();
  });
  const tpls = D.tpl.map((t) => { const all = []; const w = (it) => it.forEach((x) => { if (x.p) all.push(x.p); else { all.push(x.c); w(x.ch); } }); w(t.items); return { t, txt: all.join(' '), f: [{ t: norm(t.id), w: 12 }, { t: norm(t.classe + ' ' + t.res + ' ' + t.apl), w: 4 }, { t: norm(all.join(' ')), w: 1 }] }; });
  SIDX = { secs, tpls };
}
let sfilter = 'all', ssel = 0;
function runSearch() {
  if (!SIDX) buildIndex();
  const q = $('#sq').value; const P = parseQuery(q);
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
  if (!P.terms.length) { L.innerHTML = '<div style="padding: 18px 0; display: flex; flex-direction: column; gap: 10px;"><p class="small">Busque em todo o ATRIL: seções dos componentes, 107 fundamentos, 2.758 registros do Ementário e os 6 modelos.</p><div style="display: flex; flex-wrap: wrap; gap: 6px;">' + ['gratuidade', 'negativação', 'dialeticidade', 'ementa resultado', 'tempestividade', 'RI-CONJUNTO', '6226'].map((s) => `<button type="button" class="chip" data-try="${s}">${s}</button>`).join('') + '</div></div>'; return; }
  if (!total) { L.innerHTML = '<p class="small" style="padding: 18px 0;">Nenhum resultado. Tente um termo mais geral.</p>'; return; }
  L.innerHTML = keys.filter((k) => (sfilter === 'all' || sfilter === k) && out[k].length).map((k) => `<div class="sgrp"><span class="lbl">${k}</span><span class="small">${out[k].length}</span></div>` + out[k].slice(0, sfilter === 'all' ? (k === 'Ementário' ? 6 : 5) : 60).map((r) => r.html).join('')).join('');
  ssel = 0; markSel();
}
function markSel() { const rs = $$('#sl .res'); rs.forEach((r, i) => r.classList.toggle('sel', i === ssel)); if (rs[ssel]) rs[ssel].scrollIntoView({ block: 'nearest' }); }
function openSearch(q) { $('#sov').hidden = false; document.body.style.overflow = 'hidden'; const i = $('#sq'); if (q != null) i.value = q; i.focus(); i.select(); runSearch(); }
function closeSearch() { $('#sov').hidden = true; document.body.style.overflow = ''; $('#searchbtn').focus(); }
let sTimer;
$('#searchbtn').addEventListener('click', () => openSearch());
$('#sx').addEventListener('click', closeSearch);
$('#sov').addEventListener('click', (e) => {
  if (e.target.id === 'sov') { closeSearch(); return; }
  const f = e.target.closest('[data-f]'); if (f) { sfilter = f.dataset.f; runSearch(); return; }
  const t = e.target.closest('[data-try]'); if (t) { $('#sq').value = t.dataset.try; runSearch(); return; }
  if (e.target.closest('.res')) closeSearch();
});
$('#sq').addEventListener('input', () => { clearTimeout(sTimer); sTimer = setTimeout(runSearch, 110); });
$('#sq').addEventListener('keydown', (e) => {
  const rs = $$('#sl .res');
  if (e.key === 'ArrowDown') { e.preventDefault(); ssel = Math.min(rs.length - 1, ssel + 1); markSel(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); ssel = Math.max(0, ssel - 1); markSel(); }
  else if (e.key === 'Enter') { e.preventDefault(); if (rs[ssel]) { location.hash = rs[ssel].getAttribute('href'); closeSearch(); } }
});
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); $('#sov').hidden ? openSearch() : closeSearch(); return; }
  if (e.key === 'Escape' && !$('#sov').hidden) { closeSearch(); return; }
  if (e.key === '/' && $('#sov').hidden && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
});

/* ---------- início ---------- */
quickCal();
$('#q-fun').innerHTML = ['negativação', 'gratuidade', 'dialeticidade', 'voo cancelado'].map((s) => `<button type="button" class="chip" data-fq="${s}">${s}</button>`).join('');
$('#q-fun').addEventListener('click', (e) => { const b = e.target.closest('[data-fq]'); if (!b) return; fs.q = b.dataset.fq; fs.cur = null; fs.cat = 'all'; if (inited.fundamentos) { $('#f-q').value = fs.q; renderFunList(); } location.hash = '#fundamentos'; });

window.addEventListener('hashchange', route);
route();
})();
