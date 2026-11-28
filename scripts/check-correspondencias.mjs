// Integridade do Lastro (arco.html e en/arco.html): índice relacional
// competência → termo de mercado → projeto e evidência.
// - dez competências, cada uma com projeto (data-p) e lista própria de termos;
// - todo termo citado tem um bloco de evidência, e todo bloco é alcançável;
// - cada evidência traz uma tag de projeto e um texto;
// - a versão EN tem a mesma estrutura, na mesma ordem, com as mesmas tags.
// Rodar: node scripts/check-correspondencias.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const COMPETENCIAS = 10;
const PROJETOS = new Set(["data", "echo", "atrio", "cerne"]);
const TAGS = new Set(["echo", "atrio", "ratio", "troia", "cerne"]);

function check(file) {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  const comps = [...html.matchAll(/<button class="lx__i" type="button" data-c="(c\d\d)" data-p="(\w+)"/g)];
  assert.equal(comps.length, COMPETENCIAS, `${file}: ${COMPETENCIAS} competências`);

  const termos = new Set();
  const estrutura = comps.map(([, c, p]) => {
    assert.ok(PROJETOS.has(p), `${file} ${c}: projeto ${p}`);
    const lista = html.match(new RegExp(`<ol class="lx__l" id="lx-${c}" data-of="${c}" data-p="${p}"[^>]*>([\\s\\S]*?)</ol>`));
    assert.ok(lista, `${file} ${c}: lista de termos`);
    const ts = [...lista[1].matchAll(/data-t="([^"]+)"/g)].map(m => m[1]);
    assert.ok(ts.length, `${file} ${c}: ao menos um termo`);
    ts.forEach(t => termos.add(t));
    return `${c}:${p}:${ts.join(",")}`;
  });

  const evs = [...html.matchAll(/<div class="lx__ev" id="lx-([^"]+)"[^>]*>([\s\S]*?)\n\s*<\/div>/g)];
  const comEv = new Set(evs.map(m => m[1]));
  assert.deepEqual([...termos].filter(t => !comEv.has(t)), [], `${file}: termos sem evidência`);
  assert.deepEqual([...comEv].filter(t => !termos.has(t)), [], `${file}: evidências sem termo`);
  evs.forEach(([, t, corpo]) => {
    const tags = [...corpo.matchAll(/<div class="lx__e"><span class="lx__tag lx__tag--(\w+)">[^<]+<\/span><p>[^<]+<\/p><\/div>/g)].map(m => m[1]);
    assert.ok(tags.length, `${file} ${t}: ao menos uma evidência`);
    assert.equal(tags.length, (corpo.match(/class="lx__e"/g) || []).length, `${file} ${t}: evidência fora do formato tag + texto`);
    tags.forEach(g => assert.ok(TAGS.has(g), `${file} ${t}: tag ${g}`));
    estrutura.push(`${t}:${tags.join(",")}`);
  });
  return estrutura;
}

const pt = check("arco.html");
const en = check("en/arco.html");
assert.deepEqual(en, pt, "en/arco.html: estrutura do Lastro difere do PT");
console.log(`ok: ${COMPETENCIAS} competências e ${pt.length - COMPETENCIAS} termos com evidência, coerentes em PT e EN`);
