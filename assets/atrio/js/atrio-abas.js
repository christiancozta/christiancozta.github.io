(() => {
"use strict";

const TAB_ORDER = ["fluxo", "aplicacao", "evolucao"];
const TAB_LABELS = { fluxo: "Fluxo", aplicacao: "Aplicação", evolucao: "Evolução" };
const EVOLUTION_COPY = {
  atrio: "Release única e imutável: os quatro módulos avançam sob a mesma versão registrada.",
  corpus: "Versão da base governada, com ingestão incremental e cofre apartado do acervo.",
  ratio: "Versão da máquina de estados, com as três vias processuais isoladas.",
  cerne: "Versão do contrato de confronto crítico, com gate técnico em cinco estados.",
  lux: "Versão do refinamento formal, com anonimização propagada aos três blocos."
};

const cards = [...document.querySelectorAll(".module-card--detail[data-module-card]")];
let activeTab = "fluxo";

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

cards.forEach(buildCardTabs);
})();
