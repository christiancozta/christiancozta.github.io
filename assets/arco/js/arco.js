/* ========================================================================== 
   ARCO — entrada desktop/mobile + proveniência sob demanda + contatos orbitais
   O runtime estabilizado permanece em arco-runtime.js. Esta camada acrescenta
   leitura territorial no desktop e mantém marca/contatos disponíveis no scroll.
   ========================================================================== */
(() => {
  "use strict";

  const current = document.currentScript;
  const src = current?.src || new URL("assets/arco/js/arco.js", document.baseURI).href;
  const runtimeUrl = new URL("arco-runtime.js?v=20260912-provenance-v1", src);

  const runtime = document.createElement("script");
  runtime.src = runtimeUrl.href;
  runtime.async = false;
  runtime.onload = () => {
    installArcadeNarrative();
    installTranslationFrontier();
    installProvenanceHover();
    installContactOrbit();
  };
  runtime.onerror = () => console.error("ARCO: falha ao carregar o runtime estabilizado.");
  document.head.appendChild(runtime);

  function installArcadeNarrative(){
    const home = document.querySelector('.view[data-view="home"] .home');
    const movements = [...(home?.querySelectorAll('.arcade > .mov') || [])];
    if (!home || movements.length < 3) return;

    const openTale = (id, trigger) => {
      const tale = document.getElementById(id);
      if (!tale) return;
      if (!tale.open) tale.showModal();
      tale.scrollTop = 0;
      tale.addEventListener('close',() => trigger?.focus(),{once:true});
    };

    const atrioTaleTitle = document.querySelector('#tale-atrio .tale__title');
    if (atrioTaleTitle) atrioTaleTitle.textContent = 'Quando o raciocínio tentou acelerar antes do método';

    const foundation = movements[0].querySelector('.mov__t');
    if (foundation){
      foundation.innerHTML = foundation.innerHTML.replace(
        'O primeiro movimento ocorreu na Vara de Execuções Fiscais',
        'O primeiro movimento ocorreu em gabinete judicial de primeira instância'
      );
      if (!foundation.querySelector('.b-data')){
        foundation.innerHTML = foundation.innerHTML.replace(
          /Ali se\s+formou a percepção inicial: antes de acelerar a produção jurídica, era preciso tornar o\s+acervo legível\./,
          'Ali se formou a percepção inicial: antes de acelerar a produção jurídica, era preciso tornar o acervo legível e a atuação mensurável. Daí viria <button class="b-data" type="button">DATA</button>.'
        );
      }
      foundation.querySelector('.b-data')?.addEventListener('click',() =>
        document.querySelector('.rail__link--data[data-view="data"]')?.click());
    }

    const regency = movements[1];
    const paragraph = regency.querySelector('.mov__t');
    const legacyStory = regency.querySelector('.idlink--echo[data-tale="tale-echo"]');
    if (paragraph && !paragraph.querySelector('.storylink--echo')){
      paragraph.lang = 'pt-BR';
      paragraph.innerHTML = `
        O segundo movimento amadureceu em instância recursal, com a passagem da gestão de volume
        para a regência do fluxo decisório. <span class="storylink storylink--echo" role="button" tabindex="0" aria-haspopup="dialog" lang="pt-BR">Como não havia a quem perguntar</span>, o <button class="b-echo" type="button">ECHO</button> nasce como método de estruturação operacional:
        organização de acervo, segmentação temática, padronização de rotinas, controle de prioridades
        e qualidade de minutas. É o ponto em que a experiência se converte em método de operação jurídica.
      `;

      const echo = paragraph.querySelector('.b-echo');
      echo?.addEventListener('click',() =>
        document.querySelector('.rail__link[data-view="echo"]')?.click());

      const story = paragraph.querySelector('.storylink--echo');
      const openStory = () => openTale('tale-echo',story);
      story?.addEventListener('click',openStory);
      story?.addEventListener('keydown',event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        openStory();
      });

      legacyStory?.remove();

      if (!document.getElementById('arco-arcade-narrative-style')){
        const style = document.createElement('style');
        style.id = 'arco-arcade-narrative-style';
        style.textContent = String.raw`
.b-data{
  display:inline;padding:.1em .36em .14em;margin:0 .02em;border:0;
  font:inherit;font-weight:600;letter-spacing:.008em;text-decoration:none;
  -webkit-box-decoration-break:clone;box-decoration-break:clone;
  background:#0057FF;color:#FCFCFC;cursor:pointer;
  transition:box-shadow var(--fast) var(--ease)
}
.b-data:hover,.b-data:focus-visible{box-shadow:0 0 0 1px var(--ink)}
.view[data-view="home"] .arcade > .mov:nth-child(2) .mov__t,
.view[data-view="home"] .arcade > .mov:nth-child(3) .mov__t{
  -webkit-hyphens:auto;
  hyphens:auto;
}
.view[data-view="home"] .arcade > .mov:nth-child(2) > .idlink--echo,
.view[data-view="home"] .arcade > .mov:nth-child(3) > .idlink--atrio{
  display:none!important;
}
.storylink{
  display:inline;
  margin:0;padding:0;border:0;background:none;color:inherit;
  font:inherit;font-style:normal;font-weight:700;cursor:pointer;
  -webkit-hyphens:auto;hyphens:auto;
  text-decoration-line:underline;text-decoration-thickness:1px;
  text-underline-offset:.14em;text-decoration-color:currentColor;
  transition:text-decoration-color var(--fast) var(--ease)
}
.storylink:hover,.storylink:focus-visible{text-decoration-color:transparent}
`;
        document.head.appendChild(style);
      }

      const mq = matchMedia('(max-width:820px)');
      const tag = document.createElement('span');
      tag.className = 'arco-provenance-tag arco-provenance-tag--echo';
      tag.textContent = 'ECHO';
      tag.setAttribute('aria-hidden','true');
      document.body.appendChild(tag);

      const moveTag = event => {
        const gapX = 14,gapY = 12,margin = 8;
        const rect = tag.getBoundingClientRect();
        let x = event.clientX + gapX;
        let y = event.clientY + gapY;
        if (x + rect.width + margin > innerWidth) x = event.clientX - rect.width - gapX;
        if (y + rect.height + margin > innerHeight) y = event.clientY - rect.height - gapY;
        tag.style.left = `${Math.max(margin, x)}px`;
        tag.style.top = `${Math.max(margin, y)}px`;
      };
      const hideTag = () => tag.classList.remove('is-visible');
      story?.addEventListener('pointerenter',event => {
        if (mq.matches || (event.pointerType && event.pointerType !== 'mouse')) return;
        tag.classList.add('is-visible');
        moveTag(event);
      });
      story?.addEventListener('pointermove',event => {
        if (!mq.matches && (!event.pointerType || event.pointerType === 'mouse')) moveTag(event);
      });
      story?.addEventListener('pointerleave',hideTag);
      story?.addEventListener('click',hideTag);
      window.addEventListener('scroll',hideTag,{passive:true,capture:true});
      window.addEventListener('blur',hideTag);
      mq.addEventListener?.('change',hideTag);
    }

    const architecture = movements[2];
    const architectureParagraph = architecture.querySelector('.mov__t');
    const legacyArchitectureStory = architecture.querySelector('.idlink--atrio[data-tale="tale-atrio"]');
    if (architectureParagraph && !architectureParagraph.querySelector('.storylink--atrio')){
      architectureParagraph.lang = 'pt-BR';
      architectureParagraph.innerHTML = `
        O terceiro movimento surge quando o raciocínio, ao encontrar a inteligência artificial, <span class="storylink storylink--atrio" role="button" tabindex="0" aria-haspopup="dialog" lang="pt-BR">tentou acelerar antes do método</span>. O <button class="b-atrio" type="button">ATRIO</button> transforma a lógica já construída em arquitetura modular, com base documental, raciocínio assistido, validação humana, rastreabilidade e controle de qualidade. A IA não substitui a decisão: passa a operar dentro de um percurso governado.
      `;

      const atrio = architectureParagraph.querySelector('.b-atrio');
      atrio?.addEventListener('click',() =>
        document.querySelector('.rail__link[data-view="atrio"]')?.click());

      const architectureStory = architectureParagraph.querySelector('.storylink--atrio');
      const openArchitectureStory = () => openTale('tale-atrio',architectureStory);
      architectureStory?.addEventListener('click',openArchitectureStory);
      architectureStory?.addEventListener('keydown',event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        openArchitectureStory();
      });

      legacyArchitectureStory?.remove();

      const mq = matchMedia('(max-width:820px)');
      const tag = document.createElement('span');
      tag.className = 'arco-provenance-tag arco-provenance-tag--atrio';
      tag.textContent = 'ATRIO';
      tag.setAttribute('aria-hidden','true');
      document.body.appendChild(tag);

      const moveTag = event => {
        const gapX = 14,gapY = 12,margin = 8;
        const rect = tag.getBoundingClientRect();
        let x = event.clientX + gapX;
        let y = event.clientY + gapY;
        if (x + rect.width + margin > innerWidth) x = event.clientX - rect.width - gapX;
        if (y + rect.height + margin > innerHeight) y = event.clientY - rect.height - gapY;
        tag.style.left = `${Math.max(margin, x)}px`;
        tag.style.top = `${Math.max(margin, y)}px`;
      };
      const hideTag = () => tag.classList.remove('is-visible');
      architectureStory?.addEventListener('pointerenter',event => {
        if (mq.matches || (event.pointerType && event.pointerType !== 'mouse')) return;
        tag.classList.add('is-visible');
        moveTag(event);
      });
      architectureStory?.addEventListener('pointermove',event => {
        if (!mq.matches && (!event.pointerType || event.pointerType === 'mouse')) moveTag(event);
      });
      architectureStory?.addEventListener('pointerleave',hideTag);
      architectureStory?.addEventListener('click',hideTag);
      window.addEventListener('scroll',hideTag,{passive:true,capture:true});
      window.addEventListener('blur',hideTag);
      mq.addEventListener?.('change',hideTag);
    }
  }

  function installTranslationFrontier(){
    const opening = document.querySelector('.abertura');
    const stats = opening?.querySelector('.eq__stats--rank');
    const frontierText = opening?.querySelector('.band--fronteira .fronteira-txt');
    const introLead = document.querySelector('#h-repertorio')?.parentElement?.querySelector('.eq__lead');
    const repertoire = document.querySelector('#repertorio');
    const limitSection = document.querySelector('section[aria-labelledby="eq-limite"]');
    const sourceChips = limitSection?.querySelector('.outchips');
    if (!opening || !stats || !frontierText) return;

    if (introLead){
      introLead.textContent = 'Desenvolvi ferramentas sem saber que já eram batizadas. Reformulei o que “sempre foi assim” quando ele não respondia ao problema.';
      let second = introLead.parentElement?.querySelector('.translation-intro__second');
      if (!second){
        second = document.createElement('p');
        second.className = 'eq__lead translation-intro__second';
        introLead.after(second);
      }
      second.innerHTML = 'A presente seção apresenta o que foi construído na prática, traduzido em problemas, mecanismos e linguagem profissional reconhecível. <strong>8</strong> dores reconhecíveis no mercado privado, enfrentadas por <strong>17</strong> mecanismos construídos na prática, organizados em domínios profissionais e traduzidos por <strong>136</strong> correspondências de mercado.';
    }

    stats.className = 'translation-method';
    stats.innerHTML = `
      <header class="eqhead translation-method__head">
        <h3>Como a tradução é atualizada</h3>
      </header>
      <p class="translation-method__intro">Hipóteses, revisões e decisões abandonadas permanecem registradas. O erro assumido e documentado é o acerto pelo método.</p>
      <ol class="translation-method__list">
        <li>só entra o que possui implementação e evidência;</li>
        <li>aliases não aumentam a contagem;</li>
        <li>uma correspondência pode ser demonstrada por mais de uma classe;</li>
        <li>uma classe pode sustentar várias correspondências;</li>
        <li>uma nova ferramenta ou tecnologia não cria automaticamente nova classe;</li>
        <li>o número só muda quando surge unidade com função própria, evidência específica e possibilidade de teste independente.</li>
      </ol>
    `;

    frontierText.replaceChildren();

    const dataBoundary = document.createElement('p');
    dataBoundary.className = 'fronteira-data';
    dataBoundary.innerHTML = 'Extraí métricas e calculei indicadores a partir de listas que o sistema entregava brutas. Durante a experiência profissional, porém, a mensuração sistemática restringiu-se ao indicador de produtividade dos colaboradores. Os demais indicadores foram calculados posteriormente, em exercício retrospectivo, para desenvolvimento da habilidade. Por isso, este exercício não contabiliza mecanismos de jurimetria atribuídos a <button class="b-data" type="button">DATA</button>.';
    frontierText.appendChild(dataBoundary);
    dataBoundary.querySelector('.b-data')?.addEventListener('click',() =>
      document.querySelector('.rail__link--data[data-view="data"]')?.click());

    const limitCopy = document.createElement('p');
    limitCopy.className = 'fronteira-limit';
    limitCopy.innerHTML = '<strong>Ainda não demonstrado:</strong> Nenhuma entrada toca a face financeira de Legal Ops. Não há evidência para reivindicá-la. RAG e busca semântica ficam de fora porque preparo não é mecanismo; os demais, porque analogia não é transferência desenhada. Declarar a fronteira custa menos do que deixá-la ser descoberta.';
    frontierText.appendChild(limitCopy);

    if (sourceChips){
      const allowed = new Set([
        'e-billing','spend management','outside counsel management','vendor management',
        'matter budgeting','rag','busca semântica'
      ]);
      [...sourceChips.querySelectorAll('.chip')].forEach(chip => {
        if (!allowed.has(chip.textContent.trim().toLocaleLowerCase('pt-BR'))) chip.remove();
      });
      frontierText.appendChild(sourceChips);
    }

    if (!document.getElementById('arco-translation-frontier-style')){
      const style = document.createElement('style');
      style.id = 'arco-translation-frontier-style';
      style.textContent = String.raw`
.translation-intro__second{margin-top:.65rem!important}
.translation-intro__second strong{font-weight:700;color:inherit}
.translation-method{
  min-width:0;
  font-family:var(--f-body);
  color:var(--ink-78)
}
.translation-method__head{
  display:flex;align-items:baseline;justify-content:space-between;gap:1rem;
  margin:0 0 .75rem;padding-top:.85rem;border-top:1px solid var(--hair)
}
.translation-method__head h3{
  margin:0;
  font-family:var(--f-display);
  font-weight:700;
  font-size:clamp(.98rem,1.45vw,1.14rem);
  line-height:1.1;
  letter-spacing:-.018em;
  color:var(--ink)
}
.translation-method__intro{
  margin:0 0 .8rem;
  font-family:var(--f-body);
  font-size:.78rem;
  line-height:1.6;
  color:var(--ink-78)
}
.translation-method__list{
  margin:0;
  padding-left:1.45rem;
  font-family:var(--f-body);
  font-size:.78rem;
  line-height:1.6;
  color:var(--ink-78)
}
.translation-method__list li{padding-left:.48rem}
.translation-method__list li + li{margin-top:.28rem}
.band--fronteira .fronteira-limit strong{
  font-family:var(--f-body);font-size:inherit;line-height:inherit;font-style:normal;
  font-weight:700;color:inherit;letter-spacing:inherit;text-transform:none
}
.band--fronteira .outchips{margin-top:.7rem}
.progress-rail__mark{display:none!important}
.doors{background:var(--paper)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
.translation-end-space{display:block;width:100%;height:var(--translation-end-space,6rem);background:transparent;pointer-events:none}
@media (max-width:820px){
  .translation-end-space{height:max(clamp(5rem,12vh,8rem),calc(5rem + env(safe-area-inset-bottom,0px)))}
}
`;
      document.head.appendChild(style);
    }

    limitSection?.remove();

    if (repertoire){
      let endSpace = repertoire.querySelector(':scope > .translation-end-space');
      if (!endSpace){
        endSpace = document.createElement('div');
        endSpace.className = 'translation-end-space';
        endSpace.setAttribute('aria-hidden','true');
        repertoire.appendChild(endSpace);
      }

      const mqMobile = matchMedia('(max-width:820px)');
      let endRaf = 0;
      const measureEndSpace = () => {
        endRaf = 0;
        if (mqMobile.matches){
          endSpace.style.removeProperty('--translation-end-space');
          return;
        }
        const railName = document.querySelector('.rail__name');
        const top = railName?.getBoundingClientRect().top;
        const height = Number.isFinite(top) ? Math.max(0,innerHeight - top) : 0;
        endSpace.style.setProperty('--translation-end-space',`${height}px`);
      };
      const scheduleEndSpace = () => {
        if (endRaf) return;
        endRaf = requestAnimationFrame(measureEndSpace);
      };
      scheduleEndSpace();
      window.addEventListener('resize',scheduleEndSpace,{passive:true});
      window.addEventListener('orientationchange',scheduleEndSpace,{passive:true});
      mqMobile.addEventListener?.('change',scheduleEndSpace);
    }
  }

  function installProvenanceHover(){
    const homeView = document.querySelector('.view[data-view="home"]');
    const home = homeView?.querySelector(".home");
    const zone = home?.querySelector(".narr-zone");
    const stats = zone ? [...zone.querySelectorAll(".narr__stat")] : [];
    const mq = matchMedia("(max-width:820px)");
    if (!homeView || !home || !zone || stats.length !== 5) return;

    const projects = {
      "5": {tag:"ARCO", cls:"arco"},
      "4": {tag:"ATRIO", cls:"atrio"},
      "3": {tag:"ECHO", cls:"echo"},
      "2": {tag:"DATA", cls:"data"}
    };

    stats.forEach(stat => {
      const button = stat.querySelector(".narr__n");
      if (!button || button.querySelector(".narr__glyph")) return;
      const glyph = document.createElement("span");
      glyph.className = "narr__glyph";
      glyph.textContent = button.textContent.trim();
      button.textContent = "";
      button.appendChild(glyph);
    });

    if (!document.getElementById("arco-provenance-hover-style")){
      const style = document.createElement("style");
      style.id = "arco-provenance-hover-style";
      style.textContent = String.raw`
@media (min-width:821px){
  .view[data-view="home"] .home .narr__tag{display:none!important}
  .view[data-view="home"] .bio__list li:first-child a{
    background:none!important;color:inherit!important;border:2px solid #8A8A8A!important;
    padding:calc(.44em - 1px) calc(.78em - 1px)!important;font-weight:600!important;
    transition:color var(--fast) var(--ease),border-color var(--fast) var(--ease)!important
  }
  .view[data-view="home"] .bio__list li:first-child a:hover,
  .view[data-view="home"] .bio__list li:first-child a:focus-visible{
    background:none!important;color:var(--ink)!important;border-color:#8A8A8A!important
  }
  .view[data-view="home"] .home.hero-commit01-final .narr__n{
    position:relative!important;isolation:isolate!important;overflow:visible!important;
    transition:color 120ms cubic-bezier(.22,.68,0,1)!important
  }
  .view[data-view="home"] .home.hero-commit01-final .narr__n::before{
    content:"";position:absolute;left:50%;top:50%;width:42px;height:42px;
    transform:translate(-50%,-50%);background:transparent;opacity:0;z-index:0;pointer-events:none;
    transition:opacity 120ms cubic-bezier(.22,.68,0,1),background-color 120ms cubic-bezier(.22,.68,0,1)
  }
  .view[data-view="home"] .home.hero-commit01-final .narr__glyph{position:relative;z-index:1}
  .view[data-view="home"] .home.hero-commit01-final .narr__stat.is-provenance-hover .narr__n{background:transparent!important;box-shadow:none!important}
  .view[data-view="home"] .home.hero-commit01-final .narr__stat.is-provenance-hover .narr__n::before{opacity:1}
  .view[data-view="home"] .home.hero-commit01-final .narr__stat[data-step="5"].is-provenance-hover .narr__n::before{background:#181818}
  .view[data-view="home"] .home.hero-commit01-final .narr__stat[data-step="5"].is-provenance-hover .narr__n{color:#FCFCFC!important}
  .view[data-view="home"] .home.hero-commit01-final .narr__stat[data-step="4"].is-provenance-hover .narr__n::before{background:#A63A23}
  .view[data-view="home"] .home.hero-commit01-final .narr__stat[data-step="4"].is-provenance-hover .narr__n{color:#FCFCFC!important}
  .view[data-view="home"] .home.hero-commit01-final .narr__stat[data-step="3"].is-provenance-hover .narr__n::before{background:#FFB627}
  .view[data-view="home"] .home.hero-commit01-final .narr__stat[data-step="3"].is-provenance-hover .narr__n{color:#181818!important}
  .view[data-view="home"] .home.hero-commit01-final .narr__stat[data-step="2"].is-provenance-hover .narr__n::before{background:#0057FF}
  .view[data-view="home"] .home.hero-commit01-final .narr__stat[data-step="2"].is-provenance-hover .narr__n{color:#FCFCFC!important}
  .arco-provenance-tag{
    position:fixed;left:0;top:0;z-index:1000;display:inline-flex;align-items:center;min-height:1.42em;
    padding:.08em .38em .12em;border-radius:0;font-family:var(--f-micro);font-size:.54rem;font-weight:700;
    line-height:1.2;letter-spacing:.085em;text-transform:uppercase;white-space:nowrap;opacity:0;visibility:hidden;
    pointer-events:none;transition:opacity 120ms cubic-bezier(.22,.68,0,1),visibility 0s linear 120ms
  }
  .arco-provenance-tag.is-visible{opacity:1;visibility:visible;transition:opacity 120ms cubic-bezier(.22,.68,0,1)}
  .arco-provenance-tag--arco{background:#181818;color:#FCFCFC}
  .arco-provenance-tag--atrio{background:#A63A23;color:#FCFCFC}
  .arco-provenance-tag--echo{background:#FFB627;color:#181818}
  .arco-provenance-tag--data{background:#0057FF;color:#FCFCFC}
}
@media (max-width:820px){.arco-provenance-tag{display:none!important}}
@media (prefers-reduced-motion:reduce){
  .arco-provenance-tag,.view[data-view="home"] .home.hero-commit01-final .narr__n,
  .view[data-view="home"] .home.hero-commit01-final .narr__n::before{transition:none!important}
}`;
      document.head.appendChild(style);
    }

    const cursorTag = document.createElement("span");
    cursorTag.className = "arco-provenance-tag";
    cursorTag.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursorTag);

    let activeStat = null;
    const clearHover = () => {
      if (activeStat) activeStat.classList.remove("is-provenance-hover");
      activeStat = null;
      cursorTag.className = "arco-provenance-tag";
      cursorTag.textContent = "";
    };

    const bandAt = (clientX, clientY) => {
      const rows = stats.map(stat => {
        const number = stat.querySelector(".narr__n");
        if (!number) return null;
        const statRect = stat.getBoundingClientRect();
        const numberRect = number.getBoundingClientRect();
        return {
          stat,step:stat.dataset.step,center:numberRect.top + numberRect.height / 2,
          left:Math.min(statRect.left, numberRect.left) - 8,right:Math.max(statRect.right, numberRect.right) + 8
        };
      }).filter(Boolean).sort((a,b) => a.center - b.center);

      for (let i = 0; i < rows.length; i++){
        const row = rows[i];
        const previous = rows[i - 1];
        const next = rows[i + 1];
        const top = previous ? (previous.center + row.center) / 2 : row.center - (next ? (next.center - row.center) / 2 : 24);
        const bottom = next ? (row.center + next.center) / 2 : row.center + (previous ? (row.center - previous.center) / 2 : 24);
        if (clientY >= top && clientY < bottom && clientX >= row.left && clientX <= row.right) return row;
      }
      return null;
    };

    const moveTag = event => {
      const gapX = 14,gapY = 12,margin = 8;
      const rect = cursorTag.getBoundingClientRect();
      let x = event.clientX + gapX;
      let y = event.clientY + gapY;
      if (x + rect.width + margin > innerWidth) x = event.clientX - rect.width - gapX;
      if (y + rect.height + margin > innerHeight) y = event.clientY - rect.height - gapY;
      cursorTag.style.left = `${Math.max(margin, x)}px`;
      cursorTag.style.top = `${Math.max(margin, y)}px`;
    };

    const handlePointerMove = event => {
      if (mq.matches || (event.pointerType && event.pointerType !== "mouse") || homeView.dataset.active === "false" || !home.classList.contains("hero-commit01-final")){
        clearHover();
        return;
      }
      const row = bandAt(event.clientX, event.clientY);
      const project = row ? projects[row.step] : null;
      if (!row || !project){clearHover();return;}
      if (activeStat !== row.stat){
        if (activeStat) activeStat.classList.remove("is-provenance-hover");
        activeStat = row.stat;
        activeStat.classList.add("is-provenance-hover");
        cursorTag.textContent = project.tag;
        cursorTag.className = `arco-provenance-tag arco-provenance-tag--${project.cls} is-visible`;
      }
      moveTag(event);
    };

    window.addEventListener("pointermove", handlePointerMove, {passive:true});
    window.addEventListener("scroll", clearHover, {passive:true,capture:true});
    window.addEventListener("resize", clearHover, {passive:true});
    window.addEventListener("blur", clearHover);
    document.addEventListener("pointerout", event => {if (!event.relatedTarget) clearHover();});
    document.addEventListener("visibilitychange", () => {if (document.hidden) clearHover();});
    mq.addEventListener?.("change", clearHover);
    new MutationObserver(() => {if (homeView.dataset.active === "false") clearHover();})
      .observe(homeView,{attributes:true,attributeFilter:["data-active"]});
  }

  function installContactOrbit(){
    const homeView = document.querySelector('.view[data-view="home"]');
    const mark = homeView?.querySelector('.bio__mark');
    const contactList = homeView?.querySelector('.bio__list');
    const rail = document.querySelector('.rail');
    const contentEdge = homeView?.querySelector('.bio__head > div');
    const railCreed = document.querySelector('.rail__creed');
    const legacyMobileCred = document.querySelector('.mobile-cred');
    if (!homeView || !mark || !contactList) return;

    const links = [...contactList.querySelectorAll('a')].slice(0,4);
    if (links.length !== 4) return;

    const mqMobile = matchMedia('(max-width:820px)');
    const mqReduce = matchMedia('(prefers-reduced-motion:reduce)');
    const labels = ['Currículo','LinkedIn','E-mail','WhatsApp'];
    const icons = [
      '<path d="M7 3.5h7l4 4v13H7z"/><path d="M14 3.5v4h4"/><path d="M10 12h5M10 15h5"/>',
      '<rect x="5.5" y="9.5" width="3" height="9"/><path d="M7 6.5v.01"/><path d="M11.5 18.5v-5.1c0-2.8 4-3 4 0v5.1M11.5 10v8.5"/>',
      '<rect x="3.5" y="6" width="17" height="12"/><path d="m4.5 7 7.5 6 7.5-6"/>',
      '<path d="M12 4.2a7.8 7.8 0 0 0-6.7 11.8L4 20l4-1.2A7.8 7.8 0 1 0 12 4.2Z"/><path d="M9.2 8.6c.5 2.6 2 4.1 4.5 4.9"/><path d="m9.1 8.4-.8 1.1M13.8 13.5l1.1-.8"/>'
    ];

    const orbit = document.createElement('aside');
    orbit.className = 'arco-contact-orbit';
    orbit.setAttribute('aria-label','Acesso rápido');

    const brand = document.createElement('button');
    brand.className = 'arco-contact-orbit__brand';
    brand.type = 'button';
    brand.setAttribute('aria-label','ARCO — voltar ao início');
    brand.innerHTML = mark.outerHTML.replace('class="bio__mark"','class="arco-contact-orbit__brandmark"').replace(/ role="img" aria-label="[^"]*"/,' aria-hidden="true" focusable="false"');

    const stack = document.createElement('nav');
    stack.className = 'arco-contact-orbit__links';
    stack.setAttribute('aria-label','Contato');

    links.forEach((source,index) => {
      const a = source.cloneNode(false);
      a.className = 'arco-contact-orbit__link';
      a.textContent = '';
      a.setAttribute('aria-label',labels[index]);
      a.setAttribute('title',labels[index]);
      if (index === 3 && /^tel:/i.test(a.getAttribute('href') || '')){
        a.setAttribute('href','https://wa.me/5541991521304');
        a.setAttribute('target','_blank');
        a.setAttribute('rel','noopener');
      }
      a.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${icons[index]}</svg>`;
      stack.appendChild(a);
    });

    orbit.append(brand,stack);
    document.body.appendChild(orbit);

    if (!document.getElementById('arco-contact-orbit-style')){
      const style = document.createElement('style');
      style.id = 'arco-contact-orbit-style';
      style.textContent = String.raw`
.rail__creed{display:none!important}
.arco-contact-orbit{--orbit-size:42px;--orbit-left:24px;--orbit-top:22px;color:var(--ink,#181818)}
.arco-contact-orbit__brand,.arco-contact-orbit__link{
  box-sizing:border-box;border:0;border-radius:0;color:inherit;background:var(--paper,#FCFCFC);
  display:grid;place-items:center;text-decoration:none;cursor:pointer;-webkit-tap-highlight-color:transparent
}
.arco-contact-orbit__brandmark{display:block;width:100%;height:100%;color:currentColor}
.arco-contact-orbit__link svg{width:47%;height:47%;fill:none;stroke:currentColor;stroke-width:1.55;stroke-linecap:square;stroke-linejoin:miter}
.arco-contact-orbit__link:hover,.arco-contact-orbit__link:focus-visible,.arco-contact-orbit__brand:hover,.arco-contact-orbit__brand:focus-visible{background:var(--ink,#181818);color:var(--paper,#FCFCFC)}
.arco-contact-orbit__link:focus-visible,.arco-contact-orbit__brand:focus-visible{outline:2px solid currentColor;outline-offset:2px}

@media (min-width:821px){
  .arco-contact-orbit{
    position:fixed;z-index:72;left:var(--orbit-left);top:var(--orbit-top);width:var(--orbit-size);
    opacity:0;visibility:hidden;pointer-events:none
  }
  .arco-contact-orbit.is-collected,.arco-contact-orbit.is-external-view{
    opacity:1;visibility:visible;pointer-events:auto
  }
  .arco-contact-orbit__brand{display:none;width:var(--orbit-size);height:var(--orbit-size);padding:0}
  .arco-contact-orbit.is-external-view .arco-contact-orbit__brand{display:grid}
  .arco-contact-orbit__links{
    display:grid;grid-template-columns:1fr;gap:6px;width:var(--orbit-size);
    margin-top:calc(var(--orbit-size) + 8px);
    opacity:0;visibility:hidden;pointer-events:none
  }
  .arco-contact-orbit.is-collected .arco-contact-orbit__links,
  .arco-contact-orbit.is-external-view .arco-contact-orbit__links{
    opacity:1;visibility:visible;pointer-events:auto
  }
  .arco-contact-orbit__link{
    width:var(--orbit-size);height:var(--orbit-size);border:1px solid color-mix(in srgb,var(--ink,#181818) 52%,transparent)
  }
  .view[data-view="home"].arco-contacts-collected .bio__list{opacity:0!important;visibility:hidden!important;pointer-events:none!important}
}

@media (max-width:820px){
  .mobile-cred{display:none!important}
  .arco-contact-orbit{
    position:fixed;z-index:72;left:50%;right:auto;bottom:max(12px,env(safe-area-inset-bottom));top:auto;
    width:auto;display:grid;grid-template-columns:repeat(5,46px);gap:4px;padding:4px;
    background:color-mix(in srgb,var(--paper,#FCFCFC) 94%,transparent);backdrop-filter:blur(12px);
    border:1px solid color-mix(in srgb,var(--ink,#181818) 24%,transparent);
    box-shadow:0 10px 28px rgba(0,0,0,.10);opacity:0;visibility:hidden;pointer-events:none;
    transform:translate(-50%,calc(100% + 18px));
    transition:opacity 150ms cubic-bezier(.22,.68,0,1),transform 170ms cubic-bezier(.22,.68,0,1),visibility 0s linear 170ms
  }
  .arco-contact-orbit.is-mobile-visible,.arco-contact-orbit.is-external-view{
    opacity:1;visibility:visible;pointer-events:auto;transform:translate(-50%,0);transition-delay:0s
  }
  .arco-contact-orbit__brand{width:46px;height:46px;padding:9px}
  .arco-contact-orbit__links{display:contents}
  .arco-contact-orbit__link{width:46px;height:46px;border-left:1px solid color-mix(in srgb,var(--ink,#181818) 20%,transparent)}
  .arco-contact-orbit__link svg{width:45%;height:45%}
}

@media (max-width:360px){
  .arco-contact-orbit{grid-template-columns:repeat(5,43px);gap:2px;padding:3px}
  .arco-contact-orbit__brand,.arco-contact-orbit__link{width:43px;height:43px}
}

@media (prefers-reduced-motion:reduce){
  .arco-contact-orbit{transition:none!important}
}`;
      document.head.appendChild(style);
    }

    railCreed?.setAttribute('aria-hidden','true');
    legacyMobileCred?.setAttribute('aria-hidden','true');

    const initialMarkStyle = mark.getAttribute('style');
    const initialRole = mark.getAttribute('role');
    const initialTabIndex = mark.getAttribute('tabindex');

    const restoreMark = () => {
      if (initialMarkStyle == null) mark.removeAttribute('style');
      else mark.setAttribute('style',initialMarkStyle);
      if (initialRole == null) mark.removeAttribute('role');
      else mark.setAttribute('role',initialRole);
      if (initialTabIndex == null) mark.removeAttribute('tabindex');
      else mark.setAttribute('tabindex',initialTabIndex);
      mark.removeAttribute('aria-label');
    };

    const returnHome = () => {
      const homeTrigger = document.querySelector('.rail__title[data-view="home"]') || document.querySelector('[data-view="home"]');
      if (homeView.dataset.active === 'false') homeTrigger?.click();
      requestAnimationFrame(() => window.scrollTo({top:0,behavior:mqReduce.matches ? 'auto' : 'smooth'}));
    };
    brand.addEventListener('click',returnHome);
    mark.addEventListener('click',() => {
      if (mark.dataset.floating === 'true') returnHome();
    });
    mark.addEventListener('keydown',event => {
      if (mark.dataset.floating !== 'true') return;
      if (event.key === 'Enter' || event.key === ' '){
        event.preventDefault();
        returnHome();
      }
    });

    let raf = 0;
    let floating = false;
    let originTopDoc = null;
    let originLeft = null;
    let originWidth = null;
    let originHeight = null;
    let gutterLeft = null;
    const stickyTop = () => innerWidth <= 1000 ? 18 : Math.max(20,Math.min(28,innerWidth * .02));

    const centeredGutterLeft = () => {
      if (originWidth == null) return originLeft;
      const railRect = rail?.getBoundingClientRect();
      const contentRect = contentEdge?.getBoundingClientRect();
      if (!railRect || !contentRect) return originLeft;
      const start = railRect.right;
      const end = contentRect.left;
      const free = end - start;
      if (free <= originWidth) return originLeft;
      return start + (free - originWidth) / 2;
    };

    const captureOrigin = () => {
      const rect = mark.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      originTopDoc = rect.top + scrollY;
      originLeft = rect.left;
      originWidth = rect.width;
      originHeight = rect.height;
      gutterLeft = centeredGutterLeft();
    };

    const floatMark = top => {
      if (originLeft == null || originWidth == null || originHeight == null) return;
      gutterLeft = centeredGutterLeft();
      const left = gutterLeft ?? originLeft;
      floating = true;
      mark.dataset.floating = 'true';
      mark.setAttribute('role','button');
      mark.setAttribute('tabindex','0');
      mark.setAttribute('aria-label','ARCO — voltar ao início');
      mark.style.setProperty('position','fixed','important');
      mark.style.setProperty('left',`${left}px`,'important');
      mark.style.setProperty('right','auto','important');
      mark.style.setProperty('top',`${top}px`,'important');
      mark.style.setProperty('margin','0','important');
      mark.style.setProperty('width',`${originWidth}px`,'important');
      mark.style.setProperty('height',`${originHeight}px`,'important');
      mark.style.setProperty('z-index','73','important');
      mark.style.setProperty('cursor','pointer','important');
    };

    const unfloatMark = () => {
      floating = false;
      delete mark.dataset.floating;
      restoreMark();
    };

    const sync = () => {
      raf = 0;
      const mobile = mqMobile.matches;
      const homeActive = homeView.dataset.active !== 'false';
      const top = stickyTop();

      if (mobile || !homeActive){
        if (floating) unfloatMark();
        orbit.classList.remove('is-collected','is-mobile-visible');
        orbit.classList.toggle('is-external-view',!homeActive);
        homeView.classList.remove('arco-contacts-collected');

        if (mobile && homeActive){
          const listRect = contactList.getBoundingClientRect();
          orbit.classList.remove('is-external-view');
          orbit.classList.toggle('is-mobile-visible',listRect.bottom <= 8);
        }
        return;
      }

      orbit.classList.remove('is-mobile-visible','is-external-view');

      if (!floating) captureOrigin();
      if (originTopDoc == null || originLeft == null || originWidth == null || originHeight == null) return;

      gutterLeft = centeredGutterLeft();
      const dockLeft = gutterLeft ?? originLeft;
      const shouldFloat = scrollY + top >= originTopDoc;
      if (shouldFloat){
        floatMark(top);
      }else if (floating){
        unfloatMark();
        captureOrigin();
      }

      const size = originWidth;
      orbit.style.setProperty('--orbit-left',`${dockLeft}px`);
      orbit.style.setProperty('--orbit-size',`${size}px`);
      orbit.style.setProperty('--orbit-top',`${top}px`);

      const listRect = contactList.getBoundingClientRect();
      const collected = shouldFloat && listRect.top <= top + originHeight + 12;
      orbit.classList.toggle('is-collected',collected);
      homeView.classList.toggle('arco-contacts-collected',collected);
    };

    const requestSync = () => {
      if (raf) return;
      raf = requestAnimationFrame(sync);
    };

    window.addEventListener('scroll',requestSync,{passive:true});
    window.addEventListener('resize',() => {
      if (floating) unfloatMark();
      originTopDoc = originLeft = originWidth = originHeight = gutterLeft = null;
      requestSync();
    },{passive:true});
    window.addEventListener('orientationchange',requestSync,{passive:true});
    mqMobile.addEventListener?.('change',() => {
      if (floating) unfloatMark();
      originTopDoc = originLeft = originWidth = originHeight = gutterLeft = null;
      requestSync();
    });
    new MutationObserver(requestSync).observe(homeView,{attributes:true,attributeFilter:['data-active']});
    sync();
  }
})();