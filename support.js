/* ECHO production compatibility runtime.
   Replaces prototype-only sc-for/sc-if bindings with native DOM rendering. */
(function(){
  'use strict';

  const style = document.createElement('style');
  style.textContent = `
    x-dc{display:block} helmet{display:contents}
    sc-for,sc-if{display:none!important}
    .echo-path-buttons{display:flex;flex-wrap:wrap;gap:10px}
    .echo-path-btn{cursor:pointer;border-radius:999px;padding:7px 16px;font-family:'Commissioner',system-ui,sans-serif;font-size:12.5px;font-weight:600;white-space:nowrap;border:1px solid rgba(24,24,24,.35);background:transparent;color:#181818;transition:transform .35s cubic-bezier(.32,.72,0,1),border-color .35s,background .35s,color .35s}
    .echo-path-btn:hover{border-color:#181818;background:rgba(24,24,24,.06);transform:translateY(-1px)}
    .echo-path-btn[aria-pressed="true"]{background:#181818;color:#F2EFE9;border-color:#181818}
    .echo-material-native{position:relative;display:flex;width:100%;text-align:left;align-items:baseline;gap:14px;cursor:pointer;padding:16px 14px 17px;border:0;border-bottom:1px solid rgba(24,24,24,.24);border-left:3px solid transparent;background:transparent;color:#181818;font-family:'Commissioner',system-ui,sans-serif;transition:background .25s,opacity .25s}
    .echo-material-native:hover{background:rgba(24,24,24,.05)}
    .echo-material-native:focus-visible{outline:2px solid #FFB627;outline-offset:-2px}
    .echo-material-native.is-selected{background:#FFB627;border-left-color:#181818}
    .echo-material-native.is-path{border-left-color:#181818}
    .echo-material-native.is-dim{opacity:.3}
    .echo-material-native .n{font-family:'Azeret Mono',ui-monospace,monospace;font-size:11px;width:24px;flex:none}
    .echo-material-native .body{flex:1 1 200px;min-width:0}
    .echo-material-native .title{display:block;font-family:'Schibsted Grotesk',sans-serif;font-weight:600;font-size:16.5px;letter-spacing:-.025em}
    .echo-material-native .func{display:block;margin-top:4px;font-size:12.5px;line-height:1.45}
    .echo-material-native .family{flex:none;font-size:12.5px;font-weight:600}
    .echo-sheet-native{position:sticky;top:24px;min-width:0;background:#181818;color:#F2EFE9;padding:clamp(24px,2.6vw,38px)}
    .echo-sheet-native .kicker{margin:0;font-size:12.5px;font-weight:600;color:#FFB627}
    .echo-sheet-native h3{margin:14px 0 0;font-family:'Schibsted Grotesk',sans-serif;font-weight:700;font-size:clamp(1.5rem,2.6vw,2.1rem);line-height:1.04;letter-spacing:-.04em;text-wrap:pretty}
    .echo-sheet-native .lead{margin:14px 0 0;font-size:14.5px;line-height:1.55}
    .echo-sheet-native .fields{margin-top:24px;border-top:1px solid #3a3a3a}
    .echo-sheet-native .field{display:flex;flex-wrap:wrap;gap:6px 18px;padding:13px 0;border-bottom:1px solid #3a3a3a}
    .echo-sheet-native .key{flex:0 0 112px;margin:0;font-size:12.5px;font-weight:600;line-height:1.4;color:#FFB627}
    .echo-sheet-native .val{flex:1 1 200px;margin:0;font-size:13px;line-height:1.5}
    .echo-sheet-native .action{display:inline-flex;align-items:center;gap:14px;margin-top:26px;background:#FFB627;color:#181818;border-radius:999px;padding:8px 8px 8px 22px;font-size:13.5px;font-weight:600;transition:transform .4s cubic-bezier(.32,.72,0,1)}
    .echo-sheet-native .action:hover{transform:translateY(-2px);color:#181818}
    .echo-sheet-native .action i{font-style:normal;width:30px;height:30px;border-radius:999px;background:#181818;color:#FFB627;display:flex;align-items:center;justify-content:center;font-size:13px}
    @media(max-width:719px){.echo-sheet-native{position:relative;top:auto}.echo-material-native{gap:10px;padding-left:10px;padding-right:8px}.echo-material-native .family{font-size:11px}}
  `;
  document.head.appendChild(style);

  const MATERIAIS = [
  {id:'m1',titulo:'Notas Introdutórias',familia:'Manuais',formato:'PDF',cadeia:'entrada · orientação · cultura operacional',funcao:'Alinhar cultura operacional, entrada, papéis iniciais e expectativa de trabalho.',ruido:'Onboarding informal e repetição de orientações básicas.',uso:'Documento de entrada',equivalencias:'Onboarding · Enablement · Operating Principles',href:'assets/echo/documentos/notas-introdutorias.pdf'},
  {id:'m2',titulo:'Roteiro de Entrevistas',familia:'Manuais',formato:'PDF',cadeia:'descoberta operacional · diagnóstico',funcao:'Ouvir rotinas, comparar práticas e identificar ruídos operacionais.',ruido:'Diagnóstico baseado apenas em impressão individual.',uso:'Entrevistas e diagnóstico',equivalencias:'Operational Discovery · Process Mapping · Stakeholder Interview',href:'assets/echo/documentos/a02.pdf'},
  {id:'m3',titulo:'Afinação Processual',familia:'Manuais',formato:'PDF',cadeia:'entrada · verificação · quality gate',funcao:'Registrar requisitos, prazos e pontos de entrada e orientar a checagem de cabimento, tempestividade, preparo e representação.',ruido:'Vícios simples consumindo tempo técnico qualificado e análise formal dispersa.',uso:'Triagem e verificação',equivalencias:'Quality Gates · Checklist · SOP · Intake Review',href:'assets/echo/documentos/afinacao-processual.pdf'},
  {id:'m4',titulo:'Mapa Temático',familia:'Mapas',formato:'PDF',cadeia:'classificação · distribuição',funcao:'Organizar matérias por núcleos, agrupadores, temas e afinidades.',ruido:'Distribuição casuística e baixa visibilidade de concentração temática.',uso:'Classificação temática',equivalencias:'Taxonomy · Matter Management · Knowledge Classification',href:'assets/echo/documentos/mapa-tematico.pdf'},
  {id:'m5',titulo:'Mapa de Localizadores',familia:'Mapas',formato:'PDF',cadeia:'classificação · roteamento · filas',funcao:'Converter assuntos granulares em localizadores operacionais.',ruido:'Excesso de categorias pouco úteis para a gestão do acervo.',uso:'Roteamento do acervo',equivalencias:'Matter Routing · Queue Management · Operational Taxonomy',href:'assets/echo/documentos/a04.pdf'},
  {id:'m6',titulo:'Matriz de Papéis',familia:'Matrizes',formato:'PDF',cadeia:'governança · distribuição · supervisão',funcao:'Definir responsabilidades, níveis de autonomia, supervisão e progressão.',ruido:'Ambiguidade de função e dependência de orientação oral.',uso:'Papéis e governança',equivalencias:'Operating Model · Role Design · People Operations',href:'assets/echo/documentos/a05.pdf'},
  {id:'m7',titulo:'Matriz de Competências',familia:'Matrizes',formato:'PDF',cadeia:'desenvolvimento · autonomia · qualidade',funcao:'Estruturar maturidade, autonomia e desenvolvimento por critérios.',ruido:'Avaliação intuitiva e pouco documentada da evolução da equipe.',uso:'Progressão da equipe',equivalencias:'Competency Framework · Talent Development · Performance Development',href:'assets/echo/documentos/a06.pdf'},
  {id:'m8',titulo:'Precedentes',familia:'Registros',formato:'XLSX',cadeia:'produção · pesquisa · memória',funcao:'Consolidar teses firmadas e questões submetidas a julgamento, por tema, situação e ramo.',ruido:'Pesquisa de tese dispersa e citação inconsistente do precedente aplicável.',uso:'Pesquisa jurídica',equivalencias:'Precedent Database · Case Law Retrieval · Knowledge Base',href:'assets/echo/documentos/precedentes.xlsx'},
  {id:'m9',titulo:'Controle de Produtividade',familia:'Registros',formato:'XLSX',cadeia:'acompanhamento · capacidade · memória quantitativa',funcao:'Consolidar produção, composição das entregas e evolução dos indicadores.',ruido:'Volume bruto tratado como desempenho, sem série histórica nem distinção entre tipos de entrega.',uso:'Monitoramento e controle de qualidade',equivalencias:'KPI Management · Legal Data Analytics · Operational Monitoring',href:'assets/echo/documentos/jurimetria_prod.xlsx'}
];
  const PERCURSOS = [
  {id:'p1',nome:'Entrada e triagem',antes:'Demandas podiam avançar à análise técnica antes de uma verificação mínima comum de requisitos, levando questões formais simples para etapas de maior custo técnico.',materiais:['m3','m2'],rotulo:'Afinação Processual estrutura a verificação. Roteiros e checklists tornam recorrências verificáveis antes da produção.',efeito:'A entrada passa a ser mais legível e comparável, com menor incidência de retrabalho técnico em questões previamente verificáveis.',prova:'m3'},
  {id:'p2',nome:'Distribuição temática',antes:'A distribuição dependia de leitura casuística da matéria e de conhecimento individual sobre afinidades, recorrências e concentração do acervo.',materiais:['m4','m5','m9'],rotulo:'Mapa Temático organiza assuntos por núcleos e afinidades. Mapa de Localizadores converte granularidade em categorias úteis à operação. Controle de Produtividade oferece leitura sobre carga e comportamento do fluxo.',efeito:'A carga torna-se legível por mais de uma dimensão, permitindo distribuição comparável e maior visibilidade sobre repetição e risco de gargalo.',prova:'m4'},
  {id:'p3',nome:'Novos integrantes',antes:'O ingresso de novos integrantes não dispunha de um percurso documentado que articulasse identidade, papéis, expectativas e progressão de autonomia.',materiais:['m1','m6','m7'],rotulo:'Notas Introdutórias estabelecem a referência inicial. Matriz de Papéis delimita funções e responsabilidades. Matriz de Competências organiza desenvolvimento e progressão.',efeito:'A entrada deixa de depender apenas da convivência e passa a contar com critérios comuns para orientação, supervisão e construção de autonomia.',prova:'m6'}
];
  let selected = 'm1';
  let activePath = null;

  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function setupReveal(){
    const nodes=[...document.querySelectorAll('[data-reveal]')];
    if(!nodes.length) return;
    const show=(el)=>{el.style.opacity='1';el.style.transform='none';el.dataset.revealed='1';};
    if(!('IntersectionObserver' in window)){nodes.forEach(show);return;}
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){show(e.target);io.unobserve(e.target);}}),{threshold:0,rootMargin:'0px 0px -6% 0px'});
    nodes.forEach(el=>io.observe(el));
    setTimeout(()=>nodes.forEach(el=>{if(el.dataset.revealed!=='1') show(el);}),900);
  }

  function buildDynamicAcervo(){
    const percLoop=document.querySelector('sc-for[list*="percursos"]');
    const matLoop=document.querySelector('sc-for[list*="materiais"]');
    if(!percLoop || !matLoop) return;

    const pathWrap=percLoop.parentElement;
    const label=pathWrap.firstElementChild;
    pathWrap.innerHTML='';
    if(label) pathWrap.appendChild(label);
    const pathButtons=document.createElement('div');
    pathButtons.className='echo-path-buttons';
    pathWrap.appendChild(pathButtons);

    const materialHost=matLoop.parentElement;
    materialHost.innerHTML='';
    const sheet=materialHost.nextElementSibling;
    sheet.className='echo-sheet-native';
    sheet.innerHTML='<p class="kicker"></p><h3></h3><p class="lead"></p><div class="fields"></div><a class="action" target="_blank" rel="noopener"><span></span><i aria-hidden="true">↓</i></a>';

    function currentSheet(){
      const p=PERCURSOS.find(x=>x.id===activePath);
      if(p){
        const proof=MATERIAIS.find(x=>x.id===p.prova);
        return {kicker:'Percurso de aplicação',title:p.nome,lead:p.efeito,fields:[{k:'Antes',v:p.antes},{k:'Materiais acionados',v:p.rotulo}],href:proof?.href||'',action:proof?'Abrir '+proof.titulo:''};
      }
      const m=MATERIAIS.find(x=>x.id===selected)||MATERIAIS[0];
      return {kicker:m.familia,title:m.titulo,lead:m.funcao,fields:[{k:'Papel na cadeia',v:m.cadeia},{k:'Ruído',v:m.ruido},{k:'Uso',v:m.uso},{k:'Formato',v:m.formato},{k:'Equivalências',v:m.equivalencias}],href:m.href,action:m.formato==='XLSX'?'Abrir planilha':'Baixar PDF'};
    }

    function renderPaths(){
      pathButtons.innerHTML='';
      PERCURSOS.forEach(p=>{
        const b=document.createElement('button'); b.type='button'; b.className='echo-path-btn'; b.textContent=p.nome; b.setAttribute('aria-pressed',String(activePath===p.id));
        b.addEventListener('click',()=>{activePath=activePath===p.id?null:p.id;render();}); pathButtons.appendChild(b);
      });
    }

    function renderMaterials(){
      materialHost.innerHTML='';
      const p=PERCURSOS.find(x=>x.id===activePath); const active=p?new Set(p.materiais):null;
      MATERIAIS.forEach((m,i)=>{
        const b=document.createElement('button');b.type='button';b.className='echo-material-native';
        if(!activePath&&selected===m.id)b.classList.add('is-selected');
        if(active&&active.has(m.id))b.classList.add('is-path');
        if(active&&!active.has(m.id))b.classList.add('is-dim');
        b.setAttribute('aria-pressed',String(!activePath&&selected===m.id));
        b.innerHTML=`<span class="n">${String(i+1).padStart(2,'0')}</span><span class="body"><span class="title">${esc(m.titulo)}</span><span class="func">${esc(m.funcao)}</span></span><span class="family">${esc(m.familia)}</span>`;
        b.addEventListener('click',()=>{selected=m.id;activePath=null;render();});materialHost.appendChild(b);
      });
    }

    function renderSheet(){
      const f=currentSheet(); sheet.querySelector('.kicker').textContent=f.kicker; sheet.querySelector('h3').textContent=f.title; sheet.querySelector('.lead').textContent=f.lead;
      const fields=sheet.querySelector('.fields'); fields.innerHTML=''; f.fields.forEach(c=>{const d=document.createElement('div');d.className='field';d.innerHTML=`<p class="key">${esc(c.k)}</p><p class="val">${esc(c.v)}</p>`;fields.appendChild(d);});
      const a=sheet.querySelector('.action');if(f.href){a.style.display='inline-flex';a.href=f.href;a.querySelector('span').textContent=f.action;}else{a.style.display='none';a.removeAttribute('href');}
    }

    function render(){renderPaths();renderMaterials();renderSheet();}
    render();
  }

  function enhanceHoverAttributes(){
    document.querySelectorAll('[style-hover]').forEach(el=>{
      const base=el.getAttribute('style')||''; const hover=el.getAttribute('style-hover')||'';
      el.addEventListener('mouseenter',()=>el.style.cssText=base+';'+hover);
      el.addEventListener('mouseleave',()=>el.style.cssText=base);
    });
  }

  document.addEventListener('DOMContentLoaded',()=>{
    document.title='ECHO — Metodologia de operação jurídica';
    buildDynamicAcervo();
    setupReveal();
    enhanceHoverAttributes();
  });
})();
