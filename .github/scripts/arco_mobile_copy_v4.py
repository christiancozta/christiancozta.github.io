from pathlib import Path
import re

p = Path('arco.html')
s = p.read_text(encoding='utf-8')

# Remove prior mobile-copy layer if the harness is rerun.
s = re.sub(r'\n?<!-- mobile-copy-v4:start -->.*?<!-- mobile-copy-v4:end -->\n?', '\n', s, flags=re.S)

copies = {
    '5': 'domínios organizam 17 mecanismos, com ao menos 86 nomenclaturas equivalentes usadas no mercado privado.',
    '4': 'módulos de IA jurídica compõem ATRIO: arquitetura local end-to-end, com 175 testes e 115.114 julgados.',
    '3': 'núcleos estruturam 10 temáticas de 102 assuntos, em taxonomia aplicada à triagem de 1.792 processos.',
    '2': 'projetos implementados e documentados — ECHO e ATRIO — derivados de uma operação jurídica de alto volume.',
    '1': 'percurso entre gestão, operação e tecnologia, na encruzilhada entre Direito, dados, IA e governança.'
}

# Remove prior generated spans, if any.
s = re.sub(r'\n?\s*<span class="narr__l narr__mobile-copy">.*?</span>', '', s)

for step, copy in copies.items():
    pat = re.compile(r'(<li class="narr__stat" data-step="' + re.escape(step) + r'">.*?)(\n\s*</li>)', re.S)
    m = pat.search(s)
    if not m:
        raise SystemExit(f'metric step {step} not found')
    insertion = m.group(1) + f'\n    <span class="narr__l narr__mobile-copy">{copy}</span>' + m.group(2)
    s = s[:m.start()] + insertion + s[m.end():]

block = r'''
<!-- mobile-copy-v4:start -->
<style id="mobile-copy-v4">
.narr__mobile-copy{ display:none !important; }
@media (max-width:820px){
  /* Mobile mantém a física validada; troca apenas o texto visível das cinco estações. */
  .narr__stat .narr__short,
  .narr__stat .narr__detail,
  .narr__stat .narr__detail[hidden]{ display:none !important; }
  .narr__stat .narr__mobile-copy{
    display:block !important;
    grid-column:2 !important;
    grid-row:1 !important;
    min-width:0;
    white-space:normal;
    overflow-wrap:anywhere;
  }
}
</style>
<!-- mobile-copy-v4:end -->
'''

if '</body>' not in s:
    raise SystemExit('closing body not found')
s = s.replace('</body>', block + '\n</body>', 1)
p.write_text(s, encoding='utf-8')

print('mobile copy v4 applied:', {k: len(v) for k, v in copies.items()})
