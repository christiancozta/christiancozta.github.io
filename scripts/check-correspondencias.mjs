// Integridade de "Do termo à prova" (arco.html e en/arco.html): o data-proj de cada
// verbete, que alimenta o filtro por projeto, tem de bater com as competências que ele
// cita; a versão EN tem de ter os mesmos verbetes, na mesma ordem.
// Rodar: node scripts/check-correspondencias.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const VERBETES = 45;

function check(file) {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  const entries = [...html.matchAll(/<p class="lex__e"[\s\S]*?<\/p>/g)].map(m => m[0]);
  assert.equal(entries.length, VERBETES, `${file}: ${VERBETES} verbetes`);

  return entries.map(e => {
    const id = e.match(/id="([^"]+)"/)[1];
    const projs = new Set([...e.matchAll(/lex__k--(data|echo|atrio)/g)].map(m => m[1]));
    if (e.includes("lex__all")) ["data", "echo", "atrio"].forEach(p => projs.add(p));
    const transversal = e.includes("lex__c") || e.includes("lex__all");

    // o transversal não cita competência própria: vive no "princípio transversal" e no data-proj
    const tokens = e.match(/data-proj="([^"]*)"/)[1].split(" ").filter(Boolean);
    assert.deepEqual(new Set(tokens), new Set([...projs, ...(transversal ? ["transversal"] : [])]), `${file} ${id}: data-proj`);
    return `${id}:${tokens.join(" ")}`;
  });
}

const pt = check("arco.html");
const en = check("en/arco.html");
assert.deepEqual(en, pt, "en/arco.html: verbetes ou projetos diferem do PT");
console.log(`ok — ${pt.length} verbetes coerentes em PT e EN`);
