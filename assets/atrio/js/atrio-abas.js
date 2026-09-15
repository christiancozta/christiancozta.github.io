(() => {
"use strict";

const TAB_ORDER = ["fluxo", "aplicacao", "evolucao"];
const TAB_LABELS = { fluxo: "Fluxo", aplicacao: "Aplicação", evolucao: "Evolução" };
const EVOLUTION_COPY = {
  atrio: "A execução registra a composição de versões dos quatro módulos, preservando o estado técnico sob o qual o percurso foi realizado.",
  corpus: "Versão da base governada, com ingestão incremental e cofre apartado do acervo.",
  ratio: "Versão da máquina de estados, com as três vias processuais isoladas.",
  cerne: "Versão do contrato de confronto crítico, com onze eixos, vinte e três confrontos e gate técnico em três estados.",
  lux: "Versão do refinamento formal, com pseudonimização orientada pelo destino e pelos princípios da LGPD e da Resolução CNJ 615/2025."
};
const CERNE_HISTORY = [
  {v:"2.0.0",d:"18/08/2026",t:"Consolidação canônica. Core e Cartuchos de Domínio, VIGOR versionado, Audit Bundle e adjudicação humana no contrato."},
  {v:"1.2.0",d:"data não recuperável",t:"Identidade de módulo na integração com o ATRIO. Auditoria adversarial a partir do handoff do RATIO, com cinco gates."},
  {v:"0.2.0",d:"data não recuperável",t:"Segunda versão autônoma da API. Onze eixos e saídas para interface e relatório técnico."},
  {v:"0.1.0",d:"data não recuperável",t:"Primeiro protótipo executável: triagem, roteamento por modo decisório e dois eixos fixos."}
];

const cards = [...document.querySelectorAll(".module-card--detail[data-module-card]")];
const architectureSystem = document.getElementById("architecture-system");
const atrioCard = document.querySelector('[data-module-card="atrio"]');
let activeTab = "fluxo";
let defaultFrame = 0;

function tabsFor(card){return [...card.querySelectorAll(".module-card__tab[role='tab']")]}
function panelsFor(card){return [...card.querySelectorAll(".module-card__tab-panel[role='tabpanel']")]}

function syncCard(card){
  tabsFor(card).forEach(tab => {
    const selected = tab.dataset.moduleTab === activeTab;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  panelsFor(card).forEach(panel => { panel.hidden = panel.dataset.modulePanel !== activeTab; });
}

function selectTab(next){
  if(!TAB_ORDER.includes(next)) return;
  activeTab = next;
  cards.forEach(syncCard);
}

function accentSecondLetter(card){
  const trigger=card.querySelector(".module-card__title-trigger");
  if(!trigger || trigger.querySelector(".module-card__title-accent")) return;
  const title=trigger.textContent.trim();
  if(title.length<2) return;
  const accent=document.createElement("span");
  accent.className="module-card__title-accent";
  accent.textContent=title.slice(1,2);
  trigger.replaceChildren(
    document.createTextNode(title.slice(0,1)),
    accent,
    document.createTextNode(title.slice(2))
  );
}

function buildEvolution(card,key,footer){
  const panel=document.createElement("section");
  panel.className="module-card__section module-card__tab-panel module-card__evolution";
  panel.dataset.modulePanel="evolucao";
  panel.id=`module-panel-${key}-evolucao`;
  panel.setAttribute("role","tabpanel");
  panel.setAttribute("aria-labelledby",`module-inner-tab-${key}-evolucao`);

  const version=footer?.querySelector(".module-card__version")||null;
  const records=footer?[...footer.querySelectorAll(".module-sample-button")]:[];
  const versionBlock=document.createElement("div");
  versionBlock.className="module-card__evolution-version";
  if(version) versionBlock.append(version);
  const copy=document.createElement("p");
  copy.className="module-card__evolution-text";
  copy.textContent=EVOLUTION_COPY[key]||"";
  versionBlock.append(copy);
  panel.append(versionBlock);

  if(records.length){
    const recordBlock=document.createElement("div");
    recordBlock.className="module-card__evolution-records";
    records.forEach(button=>recordBlock.append(button));
    panel.append(recordBlock);
  }
  footer?.remove();
  return panel;
}

function buildCardTabs(card){
  if(card.querySelector(".module-card__tabs")) return;
  const key=card.dataset.moduleCard;
  const flow=card.querySelector(".module-card__flow");
  const flux=flow?.querySelector(".module-card__architecture");
  const application=flow?.querySelector(".module-card__operation");
  const footer=flow?.querySelector(".module-card__footer");
  if(!key||!flow||!flux||!application) return;

  accentSecondLetter(card);

  const lead=flux.querySelector(".module-lead");
  if(lead){
    lead.classList.add("module-card__tab-lead");
    flow.prepend(lead);
  }

  application.querySelectorAll("b").forEach(label=>{
    if(label.textContent.trim().toLocaleLowerCase("pt-BR")==="aplicação") label.textContent="Resposta";
  });

  const tablist=document.createElement("div");
  tablist.className="module-card__tabs";
  tablist.setAttribute("role","tablist");
  tablist.setAttribute("aria-label",`Conteúdo de ${key.toUpperCase()}`);

  TAB_ORDER.forEach(tabKey=>{
    const tab=document.createElement("button");
    tab.type="button";
    tab.className="module-card__tab";
    tab.id=`module-inner-tab-${key}-${tabKey}`;
    tab.dataset.moduleTab=tabKey;
    tab.setAttribute("role","tab");
    tab.setAttribute("aria-controls",`module-panel-${key}-${tabKey}`);
    tab.textContent=TAB_LABELS[tabKey];
    tab.addEventListener("click",()=>selectTab(tabKey));
    tab.addEventListener("keydown",event=>{
      if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key)) return;
      event.preventDefault();
      const tabs=tabsFor(card);
      const current=tabs.indexOf(tab);
      const next=event.key==="Home"?0:event.key==="End"?tabs.length-1:(current+(event.key==="ArrowRight"?1:-1)+tabs.length)%tabs.length;
      const target=tabs[next];
      if(!target) return;
      selectTab(target.dataset.moduleTab);
      target.focus();
    });
    tablist.append(tab);
  });

  flux.classList.add("module-card__tab-panel");
  flux.dataset.modulePanel="fluxo";
  flux.id=`module-panel-${key}-fluxo`;
  flux.setAttribute("role","tabpanel");
  flux.setAttribute("aria-labelledby",`module-inner-tab-${key}-fluxo`);

  application.classList.add("module-card__tab-panel");
  application.dataset.modulePanel="aplicacao";
  application.id=`module-panel-${key}-aplicacao`;
  application.setAttribute("role","tabpanel");
  application.setAttribute("aria-labelledby",`module-inner-tab-${key}-aplicacao`);

  const evolution=buildEvolution(card,key,footer);
  flow.insertBefore(tablist,flux);
  flow.append(evolution);
  syncCard(card);
}

function patchCerneVersionLabel(){
  const label=document.querySelector('.module-card__version[data-module-version="cerne"] .module-card__version-label');
  if(label) label.textContent="CERNE 3.0.0";
}

function patchCerneVersionDialog(){
  const title=document.getElementById("version-note-title");
  const current=document.getElementById("version-note-current");
  const list=document.getElementById("version-note-list");
  if(!title||!current||!list||title.textContent.trim()!=="CERNE") return;
  current.textContent="Versão corrente 3.0.0";
  list.replaceChildren(...CERNE_HISTORY.map(item=>{
    const li=document.createElement("li");
    const mark=document.createElement("b");
    mark.textContent=`v. ${item.v} (${item.d})`;
    const text=document.createElement("span");
    text.textContent=item.t;
    li.append(mark,text);
    return li;
  }));
}

function activateDefaultAtrio(){
  defaultFrame=0;
  if(!architectureSystem || !atrioCard || typeof window.atrioActivateModule!=="function") return;
  const phase=architectureSystem.dataset.modulePhase;
  const active=architectureSystem.dataset.activeModule;
  if(phase!=="idle" || active==="atrio") return;
  window.atrioActivateModule("atrio");
}

function scheduleDefaultAtrio(){
  if(defaultFrame) cancelAnimationFrame(defaultFrame);
  defaultFrame=requestAnimationFrame(activateDefaultAtrio);
}

cards.forEach(buildCardTabs);
patchCerneVersionLabel();

document.addEventListener("click",event=>{
  const versionLabel=event.target instanceof Element ? event.target.closest('.module-card__version[data-module-version="cerne"] .module-card__version-label') : null;
  if(versionLabel) requestAnimationFrame(patchCerneVersionDialog);
},false);

if(architectureSystem && atrioCard){
  architectureSystem.dataset.defaultModule="atrio";

  /* ATRIO é a posição de repouso da arquitetura. Quando já está selecionado,
     um novo clique não o recolhe para o overview: card e peça permanecem
     estacionados no landing central, em desktop e mobile. */
  document.addEventListener("click",event=>{
    const piece=event.target instanceof Element ? event.target.closest("[data-module-piece]") : null;
    if(!piece || !architectureSystem.contains(piece) || piece.dataset.modulePiece!=="atrio") return;
    if(architectureSystem.dataset.modulePhase==="active" && architectureSystem.dataset.activeModule==="atrio"){
      event.preventDefault();
      event.stopPropagation();
    }
  },true);

  const observer=new MutationObserver(()=>{
    if(architectureSystem.dataset.modulePhase==="idle") scheduleDefaultAtrio();
    if(architectureSystem.dataset.modulePhase==="active" && architectureSystem.dataset.activeModule==="atrio") syncCard(atrioCard);
  });
  observer.observe(architectureSystem,{attributes:true,attributeFilter:["data-module-phase","data-active-module"]});
  scheduleDefaultAtrio();
}
})();
