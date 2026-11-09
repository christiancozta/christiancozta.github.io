#!/usr/bin/env node
// Gerador bilíngue do portfólio. A página PT é a única fonte de estrutura,
// estilo e comportamento; o catálogo EN, chaveado pelo próprio texto PT,
// produz /en/<pagina>.html e as cópias *.en.js dos scripts com texto.
//
//   node i18n/build.mjs            gera os artefatos EN e o bloco hreflang do PT
//   node i18n/build.mjs --check    falha se faltar tradução ou se algo gerado estiver defasado
//   node i18n/build.mjs --pending  lista as chaves PT sem tradução, em JSON
//   --allow-missing                grava mesmo com lacunas (o texto PT permanece no EN)
//
// Uma chave ausente significa texto PT novo ou alterado; uma chave órfã,
// texto PT que deixou de existir. As duas aparecem no relatório.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = p => readFileSync(resolve(ROOT, p), "utf8");
const readJson = p => JSON.parse(read(p));

const args = new Set(process.argv.slice(2));
const CHECK = args.has("--check");
const PENDING = args.has("--pending");
const ALLOW_MISSING = args.has("--allow-missing");

const config = readJson("i18n/pages.json");
const SITE = config.site;
const EN_PAGES = new Set(Object.keys(config.pages).map(name => `${name}.html`));
const INVARIANT = new Set(config.invariant);
const scriptCatalog = readJson(config.scripts.catalog);

const VOID = new Set("area base br col embed hr img input link meta source track wbr".split(" "));
const RAW = new Set(["script", "style", "textarea", "title"]);
const OPAQUE = new Set(["svg", "math", "script", "style", "template", "noscript"]);
const INLINE = new Set(("a abbr b bdi bdo br button cite code data del dfn em i img input ins kbd " +
  "label mark q s samp small span strong sub sup time u var wbr svg").split(" "));
const TEXT_ATTRS = new Set(["title", "alt", "aria-label", "aria-description", "aria-roledescription",
  "aria-valuetext", "placeholder", "label"]);
const META_TEXT = new Set(["description", "og:title", "og:description", "og:site_name", "og:image:alt",
  "twitter:title", "twitter:description", "twitter:image:alt"]);
const URL_ATTRS = new Set(["href", "src", "data-src", "poster", "action"]);

const report = { missing: [], orphans: [], stale: [], warnings: [] };
const outputs = new Map();

const hasLetters = s => /\p{L}/u.test(s);
// Números com separador decimal ou de milhar mudam de grafia em inglês.
// Expressões de modelo ({{ ... }}) são código, não texto.
const translatable = s => { const t = s.replace(/\{\{[^}]*\}\}/g, ""); return hasLetters(t) || /\d[.,]\d/.test(t); };
const norm = s => s.replace(/\s+/g, " ").trim();

/* ---------------- HTML: árvore mínima com posições no texto fonte ---------------- */

function parse(html) {
  const root = { type: "el", name: "#root", attrs: [], children: [], start: 0, end: html.length, openEnd: 0 };
  const stack = [root];
  const top = () => stack[stack.length - 1];
  let i = 0;

  const pushText = (start, end, raw = false) => {
    if (end > start) top().children.push({ type: "text", start, end, raw, parent: top() });
  };

  while (i < html.length) {
    if (html.startsWith("<!--", i)) {
      const end = html.indexOf("-->", i + 4);
      const stop = end < 0 ? html.length : end + 3;
      top().children.push({ type: "comment", start: i, end: stop, parent: top() });
      i = stop;
      continue;
    }
    if (html.startsWith("<!", i) || html.startsWith("<?", i)) {
      const stop = html.indexOf(">", i) + 1 || html.length;
      top().children.push({ type: "comment", start: i, end: stop, parent: top() });
      i = stop;
      continue;
    }
    if (html[i] === "<" && html[i + 1] === "/" && /[a-zA-Z]/.test(html[i + 2] || "")) {
      const m = /^<\/([a-zA-Z][\w:-]*)\s*>/.exec(html.slice(i, i + 200));
      if (m) {
        const name = m[1].toLowerCase();
        const at = stack.map(n => n.name).lastIndexOf(name);
        if (at > 0) {
          while (stack.length > at + 1) {
            const lost = stack.pop();
            lost.end = lost.closeStart = i;
            report.warnings.push(`<${lost.name}> sem fechamento antes de </${name}> (posição ${lost.start})`);
          }
          const el = stack.pop();
          el.closeStart = i;
          el.end = i + m[0].length;
        }
        i += m[0].length;
        continue;
      }
    }
    if (html[i] === "<" && /[a-zA-Z]/.test(html[i + 1] || "")) {
      const tag = readTag(html, i);
      const el = { type: "el", name: tag.name, attrs: tag.attrs, children: [], start: i, openEnd: tag.end, parent: top() };
      top().children.push(el);
      i = tag.end;
      if (VOID.has(tag.name) || tag.selfClosing) {
        el.end = el.closeStart = tag.end;
        continue;
      }
      if (RAW.has(tag.name)) {
        const re = new RegExp(`</${tag.name}\\s*>`, "ig");
        re.lastIndex = i;
        const m = re.exec(html);
        const close = m ? m.index : html.length;
        el.children.push({ type: "text", start: i, end: close, raw: tag.name !== "title", parent: el });
        el.closeStart = close;
        el.end = m ? close + m[0].length : close;
        i = el.end;
        continue;
      }
      stack.push(el);
      continue;
    }
    const next = html.indexOf("<", i + 1);
    const stop = next < 0 ? html.length : next;
    pushText(i, stop);
    i = stop;
  }
  while (stack.length > 1) {
    const lost = stack.pop();
    lost.end = lost.closeStart = html.length;
    report.warnings.push(`<${lost.name}> sem fechamento (posição ${lost.start})`);
  }
  return root;
}

function readTag(html, start) {
  let i = start + 1;
  let quote = null;
  while (i < html.length) {
    const c = html[i];
    if (quote) { if (c === quote) quote = null; }
    else if (c === '"' || c === "'") quote = c;
    else if (c === ">") break;
    i++;
  }
  const src = html.slice(start, i + 1);
  const name = /^<([a-zA-Z][\w:-]*)/.exec(src)[1].toLowerCase();
  const attrs = [];
  const re = /([^\s"'=<>\/`]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  re.lastIndex = name.length + 1;
  let m;
  while ((m = re.exec(src)) && m.index < src.length - 1) {
    const quoted = m[2] !== undefined || m[3] !== undefined;
    const value = m[2] ?? m[3] ?? m[4];
    if (value === undefined) { attrs.push({ name: m[1].toLowerCase(), value: null }); continue; }
    const vEnd = start + m.index + m[0].length - (quoted ? 1 : 0);
    attrs.push({ name: m[1].toLowerCase(), value, vStart: vEnd - value.length, vEnd });
  }
  return { name, attrs, end: i + 1, selfClosing: /\/\s*>$/.test(src) };
}

const attr = (el, name) => el.attrs.find(a => a.name === name)?.value ?? null;

/* ---------------- unidades de tradução ---------------- */

function isInline(node, memo) {
  if (node.type === "text") return true;
  if (node.type !== "el") return false;
  if (memo.has(node)) return memo.get(node);
  let ok = INLINE.has(node.name);
  if (ok && !OPAQUE.has(node.name)) ok = node.children.every(c => c.type !== "comment" && isInline(c, memo));
  memo.set(node, ok);
  return ok;
}

const textOf = (html, node) => node.type === "text" ? html.slice(node.start, node.end)
  : node.type === "el" && !OPAQUE.has(node.name) ? node.children.map(c => textOf(html, c)).join("") : "";

const blank = (html, node) => node.type === "text" && !html.slice(node.start, node.end).trim();

function collectSegments(html, root, translatableData) {
  const units = [];
  const attrSegs = [];
  const memo = new Map();

  const addAttrs = el => {
    if (el.type !== "el") return;
    for (const a of el.attrs) {
      if (a.value === null || !translatable(a.value)) continue;
      const meta = el.name === "meta" && a.name === "content" &&
        META_TEXT.has(attr(el, "name") || attr(el, "property") || "");
      if (TEXT_ATTRS.has(a.name) || translatableData.has(a.name) || meta) attrSegs.push({ start: a.vStart, end: a.vEnd, key: norm(a.value) });
    }
  };
  const addAttrsDeep = node => {
    if (node.type !== "el") return;
    addAttrs(node);
    if (!OPAQUE.has(node.name)) node.children.forEach(addAttrsDeep);
  };

  // Uma unidade é a menor sequência de texto e marcação inline que se lê
  // como frase. Um invólucro único é descascado; elementos vizinhos separados
  // só por espaço ou pontuação viram unidades independentes.
  const flush = input => {
    const run = input.slice();
    while (run.length && blank(html, run[0])) run.shift();
    while (run.length && blank(html, run[run.length - 1])) run.pop();
    if (!run.length) return;
    if (!translatable(run.map(n => textOf(html, n)).join(""))) { run.forEach(addAttrsDeep); return; }
    if (run.length === 1 && run[0].type === "el" && !OPAQUE.has(run[0].name) && run[0].children.length) {
      addAttrs(run[0]);
      return flush(run[0].children);
    }
    if (run.length > 1 && run.every(n => n.type === "el" || !translatable(html.slice(n.start, n.end)))) {
      run.forEach(n => n.type === "el" && flush([n]));
      return;
    }
    const first = run[0], last = run[run.length - 1];
    let start = first.start, end = last.end;
    if (first.type === "text") start += html.slice(first.start, first.end).length - html.slice(first.start, first.end).trimStart().length;
    if (last.type === "text") end -= html.slice(last.start, last.end).length - html.slice(last.start, last.end).trimEnd().length;
    units.push({ start, end, key: norm(html.slice(start, end)) });
  };

  const walk = el => {
    addAttrs(el);
    if (OPAQUE.has(el.name) || (RAW.has(el.name) && el.name !== "title")) return;
    let run = [];
    for (const child of el.children) {
      if (child.type === "text" || (child.type === "el" && isInline(child, memo))) run.push(child);
      else {
        flush(run);
        run = [];
        if (child.type === "el") walk(child);
      }
    }
    flush(run);
  };
  root.children.forEach(c => c.type === "el" && walk(c));
  return [...units, ...attrSegs];
}

/* ---------------- caminhos: /en/ fica um nível abaixo da raiz ---------------- */

function rewriteUrl(url, links) {
  if (links[url]) return links[url];
  // expressões de modelo ({{ ... }}) resolvem caminhos já reescritos no script
  if (!url || url.includes("{{") || /^(#|\/|\?|\.\.?\/|[a-z][a-z0-9+.-]*:)/i.test(url)) return url;
  const path = url.split(/[?#]/)[0];
  if (!path.includes("/") && EN_PAGES.has(path)) return url;
  return `../${url}`;
}

const rewriteCssUrls = (css, links) =>
  css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, u) => `url(${q}${rewriteUrl(u, links)}${q})`);

// Em scripts do EN: recursos sobem um nível; páginas sem versão EN também.
const rewriteJsPaths = js => js
  .replace(/(["'`])assets\//g, "$1../assets/")
  .replace(/(["'`])([\w-]+\.html)(?=[#?"'`])/g, (m, q, page) => EN_PAGES.has(page) ? m : `${q}../${page}`);

function rewritePaths(html, links, localized, textAttrs) {
  const root = parse(html);
  const edits = [];
  const visit = node => {
    if (node.type !== "el") return;
    for (const a of node.attrs) {
      if (a.value === null) continue;
      let v = a.value;
      if (textAttrs.has(a.name)) continue;
      if (URL_ATTRS.has(a.name) || (a.name.startsWith("data-") && /^[\w./-]+\.(html|md|pdf|png|jpe?g|svg|webp|ico|js|css|csv|xlsx|txt|sha256)([?#].*)?$/i.test(v))) {
        v = rewriteUrl(v, links);
        if (node.name === "script" && a.name === "src") {
          const bare = v.replace(/^\.\.\//, "").split("?")[0];
          if (localized.has(bare)) v = v.replace(/\.js(\?|$)/, ".en.js$1");
        }
      } else if (a.name === "srcset") {
        v = v.split(",").map(part => part.trim().replace(/^\S+/, u => rewriteUrl(u, links))).join(", ");
      } else if (a.name === "style") {
        v = rewriteCssUrls(v, links);
      } else if (a.name === "content" && v === `${SITE}/${links.__source}`) {
        v = `${SITE}/en/${links.__source}`;
      }
      if (v !== a.value) edits.push({ start: a.vStart, end: a.vEnd, text: v });
    }
    for (const child of node.children) {
      if (child.type === "text" && child.raw && node.name === "style")
        edits.push({ start: child.start, end: child.end, text: rewriteCssUrls(html.slice(child.start, child.end), links) });
      else if (child.type === "text" && child.raw && node.name === "script" && !attr(node, "src"))
        edits.push({ start: child.start, end: child.end, text: rewriteJsPaths(html.slice(child.start, child.end)) });
      else visit(child);
    }
  };
  visit(root);
  return applyEdits(html, edits);
}

function applyEdits(text, edits) {
  edits.sort((a, b) => b.start - a.start);
  let out = text, floor = Infinity;
  for (const e of edits) {
    if (e.end > floor) throw new Error(`edições sobrepostas na posição ${e.start}`);
    out = out.slice(0, e.start) + e.text + out.slice(e.end);
    floor = e.start;
  }
  return out;
}

/* ---------------- bloco hreflang ---------------- */

const ALT_OPEN = "<!-- i18n:alternates -->";
const ALT_CLOSE = "<!-- /i18n:alternates -->";

function alternates(source, lang) {
  const pt = `${SITE}/${source}`, en = `${SITE}/en/${source}`;
  return [ALT_OPEN,
    `<link rel="canonical" href="${lang === "en" ? en : pt}">`,
    `<link rel="alternate" hreflang="pt-BR" href="${pt}">`,
    `<link rel="alternate" hreflang="en" href="${en}">`,
    `<link rel="alternate" hreflang="x-default" href="${pt}">`,
    ALT_CLOSE].join("\n");
}

function withAlternates(html, block, file) {
  const a = html.indexOf(ALT_OPEN), b = html.indexOf(ALT_CLOSE);
  if (a >= 0 && b > a) return html.slice(0, a) + block + html.slice(b + ALT_CLOSE.length);
  const title = /<\/title>[^\n]*\n/i.exec(html);
  if (!title) throw new Error(`${file}: sem <title> para ancorar o bloco hreflang`);
  const at = title.index + title[0].length;
  return html.slice(0, at) + block + "\n" + html.slice(at);
}

/* ---------------- scripts ---------------- */

const enScriptPath = p => p.replace(/\.js$/, ".en.js");
const KEY_NAMES = new Set(["Escape", "Enter", "Tab", "Home", "End", "Space", "Backspace", "Delete"]);

function localizeScript(path) {
  const entry = scriptCatalog[path];
  const src = read(path);
  let out = src;
  for (const [pt, en] of Object.entries(entry.strings || {})) {
    if (!out.includes(pt)) { report.orphans.push(`${path}: "${pt}"`); continue; }
    out = out.split(pt).join(en);
  }
  const unquote = k => k.replace(/^["'`]|["'`]$/g, "");
  const known = new Set([...Object.keys(entry.strings || {}), ...(entry.ignore || [])].map(unquote));
  const body = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");
  for (const m of body.matchAll(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g)) {
    const lit = m[2];
    // Texto PT provável: tem acento, ou é rótulo capitalizado ("Fechar", "Ver mais").
    const label = /^[A-ZÀ-Ú][a-zà-ÿ]+( [a-zà-ÿ]+)*[.…:]?$/.test(lit) && !KEY_NAMES.has(lit);
    if ((/[À-ÿ]/.test(lit) || label) && ![...known].some(k => lit.includes(k)))
      report.missing.push(`${path}: literal sem catálogo "${lit.slice(0, 80)}"`);
  }
  const header = `/* GERADO por i18n/build.mjs a partir de ${path.split("/").pop()} | não editar à mão. */\n`;
  return header + rewriteJsPaths(out);
}

/* ---------------- página ---------------- */

function buildPage(name, page) {
  const source = page.source;
  const catalog = readJson(page.catalog);
  const text = catalog.text || {};
  const keep = new Set([...INVARIANT, ...(catalog.keep || [])]);
  const links = { ...(catalog.links || {}), __source: source };
  const localized = new Set(page.scripts || []);
  const used = new Set();
  const pending = [];

  let pt = read(source);
  pt = withAlternates(pt, alternates(source, "pt"), source);
  outputs.set(source, pt);

  let html = withAlternates(pt, alternates(source, "en"), source);
  for (const { pt: from, en: to } of catalog.raw || []) {
    const count = html.split(from).length - 1;
    if (count !== 1) { report.orphans.push(`${name}: raw ocorre ${count}x: "${from.slice(0, 80)}"`); continue; }
    html = html.replace(from, () => to);
  }
  html = html.replace(/<html([^>]*)\slang="[^"]*"/i, '<html$1 lang="en"');
  html = html.replace(/^(<!DOCTYPE[^>]*>\r?\n)/i, `$1<!-- GERADO por i18n/build.mjs a partir de ${source} e ${page.catalog} | não editar à mão. -->\n`);

  const segs = collectSegments(html, parse(html), new Set(page.attrs || []));
  const edits = [];
  for (const s of segs) {
    if (keep.has(s.key)) continue;
    if (Object.hasOwn(text, s.key)) {
      used.add(s.key);
      edits.push({ start: s.start, end: s.end, text: text[s.key] });
    } else if (!pending.includes(s.key)) pending.push(s.key);
  }
  html = applyEdits(html, edits);

  for (const [pt, en] of Object.entries(catalog.inline || {})) {
    if (!html.includes(pt)) { report.orphans.push(`${name}: inline "${pt.slice(0, 80)}"`); continue; }
    html = html.split(pt).join(en);
  }

  html = rewritePaths(html, links, localized, new Set(page.attrs || []));
  for (const path of page.scripts || []) {
    if (!scriptCatalog[path]) report.missing.push(`${path}: script sem entrada no catálogo de scripts`);
  }
  for (const m of html.matchAll(/<script[^>]*\ssrc="\.\.\/(assets\/[^"?]+)/g)) {
    if (!localized.has(m[1]) && existsSync(resolve(ROOT, m[1])) && /["'`]assets\//.test(read(m[1])))
      report.warnings.push(`${name}: ${m[1]} usa caminho relativo ao documento e não foi localizado`);
  }

  pending.forEach(k => report.missing.push(`${name}: ${k.slice(0, 160)}`));
  Object.keys(text).filter(k => !used.has(k)).forEach(k => report.orphans.push(`${name}: ${k.slice(0, 160)}`));
  outputs.set(`en/${source}`, html);
  return pending;
}

/* ---------------- execução ---------------- */

const allPending = {};
for (const [name, page] of Object.entries(config.pages)) {
  allPending[name] = buildPage(name, page);
  for (const path of page.scripts || [])
    if (scriptCatalog[path] && !outputs.has(enScriptPath(path))) outputs.set(enScriptPath(path), localizeScript(path));
}

if (PENDING) {
  process.stdout.write(JSON.stringify(allPending, null, 2) + "\n");
  process.exit(0);
}

// Sem tradução completa, nada é gravado: o EN nunca sai com texto PT misturado.
const blocked = report.missing.length && !ALLOW_MISSING && !CHECK;
for (const [file, content] of blocked ? [] : outputs) {
  const abs = resolve(ROOT, file);
  const current = existsSync(abs) ? readFileSync(abs, "utf8") : null;
  if (current === content) continue;
  if (CHECK) report.stale.push(file);
  else writeFileSync(abs, content);
}

const section = (title, list) => list.length && console.log(`\n${title} (${list.length})\n  ` + list.join("\n  "));
section("Sem tradução", report.missing);
section("Órfãs no catálogo", report.orphans);
section("Defasados (rode node i18n/build.mjs)", report.stale);
section("Avisos", report.warnings);

const failed = report.missing.length || (CHECK && (report.stale.length || report.orphans.length));
console.log(failed ? "\ni18n: pendências acima." : `\ni18n: ${outputs.size} arquivos em dia.`);
process.exit(failed ? 1 : 0);
