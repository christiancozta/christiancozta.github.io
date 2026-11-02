// Integridade de Correspondências (arco.html): as tags de projeto de cada verbete
// têm de bater com as competências que ele cita. Rodar: node scripts/check-correspondencias.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const html = readFileSync(new URL("../arco.html", import.meta.url), "utf8");
const entries = [...html.matchAll(/<p class="lex__e"[\s\S]*?<\/p>/g)].map(m => m[0]);
assert.equal(entries.length, 46, "46 verbetes");

for (const e of entries) {
  const id = e.match(/id="([^"]+)"/)[1];
  const projs = new Set([...e.matchAll(/lex__k--(data|echo|atrio)/g)].map(m => m[1]));
  if (e.includes("lex__all")) ["data", "echo", "atrio"].forEach(p => projs.add(p));
  const transversal = e.includes("lex__c") || e.includes("lex__all");

  const tags = [...e.matchAll(/lex__tag--(\w+)" role="img" aria-label="([^"]+)">(\w+)</g)];
  const tagged = tags.map(t => t[1]).filter(p => p !== "arco");
  assert.deepEqual(new Set(tagged), projs, `${id}: tags ≠ competências`);
  assert.equal(tags.some(t => t[1] === "arco"), transversal, `${id}: tag ARCO`);
  for (const [, p, label, text] of tags)
    assert.equal(label, p === "arco" ? "Transversal: ARCO" : `Projeto ${text}`, `${id}: aria-label`);

  const tokens = e.match(/data-proj="([^"]*)"/)[1].split(" ").filter(Boolean);
  assert.deepEqual(new Set(tokens), new Set([...projs, ...(transversal ? ["transversal"] : [])]), `${id}: data-proj`);
}
console.log(`ok — ${entries.length} verbetes coerentes`);
