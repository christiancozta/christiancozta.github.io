(() => {
"use strict";
const root = document.documentElement;
const scrollRail = document.getElementById("atrio-progress");
const scrollFill = document.getElementById("atrio-progress-fill");
const hero = document.getElementById("hero");
const runway = document.querySelector(".runway");
const light = runway?.querySelector(".runway__light");
const dark = runway?.querySelector(".runway__dark");
const origin = runway?.querySelector(".runway__origin");
const rim = runway?.querySelector(".runway__rim");
const sections = [...document.querySelectorAll("[data-section]")];
const allowed = new Set(sections.map(section => section.id));
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const mobileArchitecture = matchMedia("(max-width:760px)");
const legalTechTrigger = document.getElementById("legal-tech-trigger");
const legalTechNote = document.getElementById("legal-tech-note");
const legalTechClose = document.getElementById("legal-tech-close");
const brandTriggers = [...document.querySelectorAll(".brand-trigger")];
const brandNote = document.getElementById("brand-note");
const brandClose = document.getElementById("brand-note-close");
const brandPiece = document.getElementById("brand-note-piece");
const brandTitle = document.getElementById("brand-note-title");
const brandMeaning = document.getElementById("brand-note-meaning");
const brandRationale = document.getElementById("brand-note-rationale");
const brandRelation = document.getElementById("brand-note-relation");
const brandImage = document.getElementById("brand-note-image");
const sampleTriggers = [...document.querySelectorAll("[data-sample]")];
const sampleNote = document.getElementById("sample-note");
const sampleClose = document.getElementById("sample-note-close");
const sampleTitle = document.getElementById("sample-note-title");
const sampleContent = document.getElementById("sample-note-content");
const moduleSystem = document.getElementById("architecture-system");
const moduleField = document.getElementById("module-piece-column");
const moduleCardStage = document.querySelector(".module-card-stage");
const moduleStatus = document.getElementById("module-status");
const modulePieces = [...document.querySelectorAll("[data-module-piece]")];
const moduleCards = [...document.querySelectorAll("[data-module-card]")];
const moduleCardByKey = new Map(moduleCards.map(card => [card.dataset.moduleCard,card]));
const moduleOverviewCard = moduleCardByKey.get("overview");
const moduleDetailCards = moduleCards.filter(card => card.dataset.moduleCard !== "overview");
const brandCopy = {
atrio:{asset:"assets/atrio/brand/atrio-rei.svg",title:"ATRIO",piece:"Rei · estrutura-mãe",meaning:"Pórtico, entrada governada, unidade e regência.",rationale:"A forma reúne acessos sob uma estrutura comum e torna visível o princípio de regência.",relation:"O Rei representa especialização sob regência comum, nunca hierarquia de importância: unidade por gramática; distinção por movimento."},
corpus:{asset:"assets/atrio/brand/corpus-torre.svg",title:"CORPUS",piece:"Torre · memória documental",meaning:"Estratos, classificação, preservação e lastro.",rationale:"A forma organiza camadas e sustenta uma base estável, legível e preservável.",relation:"A Torre traduz a função de classificar, conservar e recuperar a memória documental que dá lastro ao sistema."},
ratio:{asset:"assets/atrio/brand/ratio-cavalo.svg",title:"RATIO",piece:"Cavalo · formulação faseada",meaning:"Percurso, direção, inflexão e desvio controlado.",rationale:"O movimento não avança em linha automática: muda de direção segundo escolhas verificáveis.",relation:"O Cavalo traduz a formulação em fases, com inflexões controladas e validação humana ao longo do percurso."},
cerne:{asset:"assets/atrio/brand/cerne-rainha.svg",title:"CERNE",piece:"Rainha · núcleo crítico",meaning:"Escrutínio, confronto, tensão produtiva e retorno ao fundamento.",rationale:"A forma concentra força no núcleo e amplia o campo de confronto sem perder o ponto de origem.",relation:"A Rainha traduz a amplitude do escrutínio e o retorno ao fundamento quando a formulação precisa ser tensionada."},
lux:{asset:"assets/atrio/brand/lux-bispo.svg",title:"LUX",piece:"Bispo · refinamento formal",meaning:"Diagonalidade, projeção, depuração, legibilidade e acabamento.",rationale:"A diagonal projeta e depura, conduzindo o olhar sem romper o lastro da forma anterior.",relation:"O Bispo traduz o refinamento que melhora legibilidade e acabamento sem atravessar a fronteira do mérito."}
};
const sampleCopy = {corpus:{title:"CORPUS",template:"sample-template-corpus"},cerne:{title:"CERNE",template:"sample-template-cerne"}};
const MODULE_ORDER = ["corpus","ratio","atrio","cerne","lux"];
const ARCHITECTURE_NAV_KEYS = new Set(["Tab","ArrowDown","ArrowUp","ArrowRight","ArrowLeft","Home","End"]);
const DESKTOP_GRID = 24;
const DESKTOP_CENTER = 12;
const DESKTOP_START = {corpus:2.5,ratio:7.25,atrio:12,cerne:16.75,lux:21.5};
const MODULE_DURATION = {corpus:460,ratio:520,atrio:360,cerne:500,lux:460};
const UNIT = 84;
let raf = 0;
let visible = true;
let cell = 0;
let w = 0;
let h = 0;
let horizon = 0;
let lastBrandTrigger = null;
let lastSampleTrigger = null;
let scrollRaf = 0;
let moduleAnimation = null;
let moduleToken = 0;
let architectureMode = null;
let architectureUnit = 0;
let architectureMicro = 8;
let architectureLandingY = 0;
let architecturePieceSize = 108;
const moduleState = {phase:"idle",activeKey:null,pendingKey:null};

function paintScrollProgress(){
scrollRaf = 0;
if(!scrollRail || !scrollFill) return;
const scroller = document.scrollingElement || root;
const max = Math.max(0,scroller.scrollHeight - innerHeight);
const progress = max > 0 ? Math.min(1,Math.max(0,scroller.scrollTop/max)) : 0;
scrollFill.style.transform = `scaleY(${progress.toFixed(5)})`;
scrollRail.hidden = max <= 0;
}
function scheduleScrollProgress(){if(!scrollRaf) scrollRaf=requestAnimationFrame(paintScrollProgress)}
function syncScrollField(section){
if(!scrollRail || !section) return;
scrollRail.dataset.field = section===hero ? "terra" : section.classList.contains("field-dark") ? "dark" : "light";
}
function architectureModeNow(){return mobileArchitecture.matches ? "mobile" : "desktop"}
function syncArchitectureGeometry(width){
if(!moduleSystem || !moduleField) return;
const nextMode = architectureModeNow();
if(architectureMode && architectureMode !== nextMode) normalizeArchitecture({restoreOverview:true});
architectureMode = nextMode;
moduleSystem.dataset.architectureMode = nextMode;
moduleField.setAttribute("aria-orientation","horizontal");
const fieldWidth = moduleField.clientWidth || moduleSystem.clientWidth || width;
architectureUnit = Math.max(1,fieldWidth/DESKTOP_GRID);
architectureMicro = Math.max(6,Math.min(12,fieldWidth*.02));
architecturePieceSize = Math.max(84,Math.min(132,architectureUnit*2.6));
const railPad = Math.max(18,Math.min(32,architectureUnit*.55));
const corridorGap = Math.max(8,Math.min(14,architecturePieceSize*.09));
architectureLandingY = architecturePieceSize + corridorGap;
const railHeight = railPad + architectureLandingY + architecturePieceSize*.75;
moduleSystem.style.setProperty("--architecture-unit",`${architectureUnit.toFixed(3)}px`);
moduleSystem.style.setProperty("--architecture-piece",`${architecturePieceSize.toFixed(3)}px`);
moduleSystem.style.setProperty("--architecture-rail-pad",`${railPad.toFixed(3)}px`);
moduleSystem.style.setProperty("--architecture-rail-height",`${railHeight.toFixed(3)}px`);
moduleSystem.style.setProperty("--architecture-landing-y",`${architectureLandingY.toFixed(3)}px`);
moduleSystem.style.setProperty("--architecture-corridor-gap",`${corridorGap.toFixed(3)}px`);
moduleSystem.style.setProperty("--architecture-micro",`${architectureMicro.toFixed(3)}px`);
if(moduleState.phase === "active" && moduleState.activeKey){syncActivePieceTransform();syncLandingAnchor()}
}
function measure(){
const width = document.documentElement.clientWidth;
const runwayCell = width/8;
cell = width<=760 ? width/4 : runwayCell;
root.style.setProperty("--runway-cell",`${runwayCell}px`);
root.style.setProperty("--cell",`${cell}px`);
syncArchitectureGeometry(width);
const rect = runway.getBoundingClientRect();
w = Math.max(1,Math.round(rect.width));
h = Math.max(1,Math.round(rect.height));
const depth = Math.max(UNIT*3,Math.round((h*.39)/UNIT)*UNIT);
horizon = Math.max(UNIT,h-depth);
root.style.setProperty("--horizon",`${horizon}px`);
runway.setAttribute("viewBox",`0 0 ${w} ${h}`);
drawStaticRunway();
draw(0);
}
function drawStaticRunway(){
const base=h-horizon,cx=w/2,unit=w/8,max=1.82;
const x=(i,r)=>(cx+(i-4)*unit*r).toFixed(3),y=r=>(horizon+base*r).toFixed(3);
light.setAttribute("d",`M${cx.toFixed(3)},${horizon.toFixed(3)}L${x(8,max)},${y(max)}L${x(0,max)},${y(max)}Z`);
const originDepth=Math.min(6,base*.022),originHalf=(w/2)*(originDepth/base);
origin?.setAttribute("d",`M${cx.toFixed(3)},${horizon.toFixed(3)}L${(cx+originHalf).toFixed(3)},${(horizon+originDepth).toFixed(3)}L${(cx-originHalf).toFixed(3)},${(horizon+originDepth).toFixed(3)}Z`);
rim?.setAttribute("d","");
}
function draw(phase){
if(!w||!h)return;
const base=h-horizon,cx=w/2,unit=w/8,d0=2.2,max=1.82,count=96;
const rho=n=>d0/(d0+n-phase),x=(i,r)=>(cx+(i-4)*unit*r).toFixed(3),y=r=>(horizon+base*r).toFixed(3);
const cells=[],xNear=new Array(9),xFar=new Array(9);
for(let row=0;row<count;row+=1){
const rFar=rho(row+1);if(rFar>max)continue;const rNear=Math.min(rho(row),max),yNear=y(rNear),yFar=y(rFar);
for(let i=0;i<9;i+=1){xNear[i]=x(i,rNear);xFar[i]=x(i,rFar)}
for(let col=row%2;col<8;col+=2)cells.push(`M${xNear[col]},${yNear}L${xNear[col+1]},${yNear}L${xFar[col+1]},${yFar}L${xFar[col]},${yFar}Z`);
}
dark.setAttribute("d",cells.join(""));
}
function tick(time){draw((time/14000)%1);raf=requestAnimationFrame(tick)}
function syncAnimation(){const run=visible&&!reduceMotion.matches;if(run&&!raf)raf=requestAnimationFrame(tick);if(!run&&raf){cancelAnimationFrame(raf);raf=0;draw(0)}}

function setLegalTechOpen(open,{restoreFocus=true}={}){
if(!legalTechTrigger||!legalTechNote)return;
legalTechNote.hidden=!open;legalTechTrigger.setAttribute("aria-expanded",String(open));
if(open){legalTechNote.scrollTop=0;requestAnimationFrame(()=>legalTechClose?.focus({preventScroll:true}))}
else if(restoreFocus)legalTechTrigger.focus({preventScroll:true});
}
legalTechTrigger?.addEventListener("click",()=>{const open=legalTechTrigger.getAttribute("aria-expanded")!=="true";if(open)setBrandOpen(false,{restoreFocus:false});setLegalTechOpen(open,{restoreFocus:false})});
legalTechClose?.addEventListener("click",()=>setLegalTechOpen(false));

function setModuleState(phase,key=moduleState.activeKey){
moduleState.phase=phase;moduleState.activeKey=key;if(!moduleSystem)return;moduleSystem.dataset.modulePhase=phase;if(key)moduleSystem.dataset.activeModule=key;else moduleSystem.removeAttribute("data-active-module");
}
function modulePiece(key){return modulePieces.find(piece=>piece.dataset.modulePiece===key)||null}
function moduleBody(card){
if(!card)return[];
const body=card.querySelector(".module-card__flow")||card.querySelector(".module-card__mother");
const samples=card.querySelector(".module-sample-strip");
return[body,samples].filter(Boolean);
}
function moduleHeaderParts(card){if(!card)return[];const title=card.querySelector(".module-card__header h3"),subtitle=card.querySelector(".module-card__subtitle");return[title,subtitle].filter(Boolean)}
function setPieceExpanded(key,expanded){const piece=modulePiece(key);if(!piece)return;piece.setAttribute("aria-expanded",String(expanded))}
function clearPieceStates(){modulePieces.forEach(piece=>{piece.getAnimations?.().forEach(animation=>animation.cancel());piece.style.removeProperty("transform");piece.setAttribute("aria-expanded","false")})}
function showOverview(){
if(moduleOverviewCard)moduleOverviewCard.hidden=false;
moduleDetailCards.forEach(card=>{card.hidden=true;card.removeAttribute("data-detail-phase");[...moduleHeaderParts(card),...moduleBody(card)].forEach(part=>{part.getAnimations?.().forEach(animation=>animation.cancel());part.style.removeProperty("opacity");part.style.removeProperty("transform")})});
moduleCardStage?.removeAttribute("data-header-anchor");moduleCardStage?.style.removeProperty("--landing-x");
}
function hideOverview(){if(moduleOverviewCard)moduleOverviewCard.hidden=true}
function desktopEndpoint(key,unit=architectureUnit){const start=DESKTOP_START[key]??DESKTOP_CENTER;return{x:(DESKTOP_CENTER-start)*unit,y:architectureLandingY}}
function mobileEndpoint(key){
// Mesma tese do desktop em escala de trilho: as cinco origens convergem para a
// coluna central. A descida vem antes do deslocamento lateral, para a peca sair
// da faixa das vizinhas antes de atravessar (nunca passa por cima de ninguem).
const piece=modulePiece(key),anchor=modulePiece(MODULE_ORDER[Math.floor(MODULE_ORDER.length/2)]);
if(!piece||!anchor)return{x:0,y:0};
// offsetLeft ignora transform: mede a posicao de repouso, nao a peca em movimento.
const mid=el=>el.offsetLeft+el.offsetWidth/2;
return{x:mid(anchor)-mid(piece),y:piece.offsetHeight*.55};
}
function endpointFor(key){return architectureMode==="mobile"?mobileEndpoint(key):desktopEndpoint(key)}
function forwardFrames(key){
const end=endpointFor(key);
if(architectureMode==="mobile"){
if(!end.x)return[{offset:0,transform:"translate3d(0,0,0)"},{offset:1,transform:`translate3d(0,${end.y.toFixed(2)}px,0)`}];
return[
{offset:0,transform:"translate3d(0,0,0)"},
{offset:.42,transform:`translate3d(0,${end.y.toFixed(2)}px,0)`},
{offset:1,transform:`translate3d(${end.x.toFixed(2)}px,${end.y.toFixed(2)}px,0)`}
];
}
if(key==="atrio")return[{offset:0,transform:"translate3d(0,0,0)"},{offset:1,transform:`translate3d(0,${end.y.toFixed(2)}px,0)`}];
if(key==="corpus"){
const sign=Math.sign(end.x)||1;
const safeTail=Math.min(Math.abs(end.x),architecturePieceSize+Math.max(8,architecturePieceSize*.09));
const turnX=end.x-sign*safeTail;
return[
{offset:0,transform:"translate3d(0,0,0)"},
{offset:.43,transform:`translate3d(${turnX.toFixed(2)}px,0,0)`},
{offset:.69,transform:`translate3d(${turnX.toFixed(2)}px,${end.y.toFixed(2)}px,0)`},
{offset:1,transform:`translate3d(${end.x.toFixed(2)}px,${end.y.toFixed(2)}px,0)`}
];
}
if(key==="ratio")return[
{offset:0,transform:"translate3d(0,0,0) scale(1)"},
{offset:.42,transform:`translate3d(0,${end.y.toFixed(2)}px,0) scale(1.055)`},
{offset:.72,transform:`translate3d(${(end.x*.72).toFixed(2)}px,${end.y.toFixed(2)}px,0) scale(1.025)`},
{offset:1,transform:`translate3d(${end.x.toFixed(2)}px,${end.y.toFixed(2)}px,0) scale(1)`}
];
if(key==="cerne"){
// Dama: uma linha so, sem inflexao. Alcance livre em qualquer direcao.
return[
{offset:0,transform:"translate3d(0,0,0)"},
{offset:1,transform:`translate3d(${end.x.toFixed(2)}px,${end.y.toFixed(2)}px,0)`}
];
}
if(key==="lux"){
// Bispo: aproxima pela horizontal e entra na casa em 45 graus exatos (|dx| === |dy|).
const sign=Math.sign(end.x)||1;
const diagonal=Math.min(Math.abs(end.x),end.y);
const turnX=end.x-sign*diagonal;
return[
{offset:0,transform:"translate3d(0,0,0)"},
{offset:.55,transform:`translate3d(${turnX.toFixed(2)}px,0,0)`},
{offset:1,transform:`translate3d(${end.x.toFixed(2)}px,${end.y.toFixed(2)}px,0)`}
];
}
return[{offset:0,transform:"translate3d(0,0,0)"},{offset:1,transform:`translate3d(${end.x.toFixed(2)}px,${end.y.toFixed(2)}px,0)`}];
}
function reverseFrames(frames){return[...frames].reverse().map(frame=>({...frame,offset:1-frame.offset})).sort((a,b)=>a.offset-b.offset)}
function movementDuration(key){const base=MODULE_DURATION[key]||640;return architectureMode==="mobile"?Math.min(480,Math.round(base*.82)):base}
async function animatePiece(piece,key,direction="forward",token=moduleToken){
if(!piece)return false;const frames=forwardFrames(key),selected=direction==="forward"?frames:reverseFrames(frames),end=endpointFor(key);moduleAnimation?.cancel();piece.getAnimations?.().forEach(animation=>animation.cancel());
if(reduceMotion.matches||typeof piece.animate!=="function"){piece.style.transform=direction==="forward"?`translate3d(${end.x.toFixed(2)}px,${end.y.toFixed(2)}px,0)`:"translate3d(0,0,0)";return token===moduleToken}
const animation=piece.animate(selected,{duration:movementDuration(key),easing:key==="ratio"?"cubic-bezier(.32,.02,.32,1)":"cubic-bezier(.22,.78,.08,1)",fill:"forwards"});moduleAnimation=animation;
try{await animation.finished}catch(_error){return false}if(token!==moduleToken)return false;
piece.style.transform=direction==="forward"?`translate3d(${end.x.toFixed(2)}px,${end.y.toFixed(2)}px,0)`:"translate3d(0,0,0)";animation.cancel();moduleAnimation=null;return true;
}
function syncLandingAnchor(){
if(!moduleCardStage||architectureMode!=="desktop"){moduleCardStage?.removeAttribute("data-header-anchor");moduleCardStage?.style.removeProperty("--landing-x");return}
moduleCardStage.style.setProperty("--landing-x","50%");moduleCardStage.dataset.headerAnchor="center";
}
function syncActivePieceTransform(){if(moduleState.phase!=="active"||!moduleState.activeKey)return;const piece=modulePiece(moduleState.activeKey);if(!piece)return;const end=endpointFor(moduleState.activeKey);piece.style.transform=`translate3d(${end.x.toFixed(2)}px,${end.y.toFixed(2)}px,0)`}
async function animateParts(parts,show,token=moduleToken){
const visibleParts=parts.filter(Boolean);if(!visibleParts.length)return token===moduleToken;
if(reduceMotion.matches){visibleParts.forEach(part=>{part.style.opacity=show?"1":"0";part.style.transform="translate3d(0,0,0)"});return token===moduleToken}
const animations=visibleParts.map((part,index)=>part.animate(show?[{opacity:0,transform:"translate3d(0,10px,0)"},{opacity:1,transform:"translate3d(0,0,0)"}]:[{opacity:1,transform:"translate3d(0,0,0)"},{opacity:0,transform:"translate3d(0,8px,0)"}],{duration:show?320:240,delay:show?index*35:0,easing:"cubic-bezier(.22,.68,0,1)",fill:"forwards"}));
try{await Promise.all(animations.map(animation=>animation.finished))}catch(_error){return false}if(token!==moduleToken)return false;
visibleParts.forEach((part,index)=>{part.style.opacity=show?"1":"0";part.style.transform="translate3d(0,0,0)";animations[index].cancel()});return true;
}
function announceModule(card){
// O palco inteiro em aria-live despejava o card completo no leitor de tela.
// Anuncia so a identidade do modulo.
if(!moduleStatus||!card)return;
const title=card.querySelector(".module-card__header h3")?.textContent.trim()||"";
const subtitle=card.querySelector(".module-card__subtitle")?.textContent.trim()||"";
moduleStatus.textContent=[title,subtitle].filter(Boolean).join(", ");
}
function frameArchitecture(){
// O layout ja esta final quando o card sai de hidden; so as opacidades animam.
// Poe o topo do trilho a 6% da janela: peca pousada e card cabem juntos nos dois modos.
if(!moduleField)return;
const target=Math.max(0,moduleField.getBoundingClientRect().top+scrollY-innerHeight*.06);
if(Math.abs(target-scrollY)<24)return;
scrollTo({top:target,behavior:reduceMotion.matches?"auto":"smooth"});
}
async function revealModuleCard(key,token){
const card=moduleCardByKey.get(key);if(!card)return false;announceModule(card);hideOverview();moduleDetailCards.forEach(item=>{item.hidden=item!==card});card.hidden=false;card.dataset.detailPhase="header";syncLandingAnchor();
const headerParts=moduleHeaderParts(card),bodyParts=moduleBody(card);headerParts.forEach(part=>{part.style.opacity="0"});bodyParts.forEach(part=>{part.style.opacity="0"});
frameArchitecture();
if(!await animateParts(headerParts,true,token))return false;card.dataset.detailPhase="body";if(!await animateParts(bodyParts,true,token))return false;card.dataset.detailPhase="active";return true;
}
async function concealModuleCard(key,token){const card=moduleCardByKey.get(key);if(!card||card.hidden)return true;card.dataset.detailPhase="closing";if(!await animateParts(moduleBody(card),false,token))return false;if(!await animateParts(moduleHeaderParts(card),false,token))return false;card.hidden=true;card.removeAttribute("data-detail-phase");return true}
async function activateModule(key){
if(!MODULE_ORDER.includes(key)||!moduleSystem)return;
if(moduleState.phase!=="idle"){if(moduleState.phase==="active"&&moduleState.activeKey===key)returnModule(key);else{moduleState.pendingKey=key;if(moduleState.phase==="active"&&moduleState.activeKey)returnModule(moduleState.activeKey)}return}
const token=++moduleToken;moduleState.pendingKey=null;setModuleState("moving",key);setPieceExpanded(key,true);const piece=modulePiece(key);const moved=await animatePiece(piece,key,"forward",token);if(!moved||token!==moduleToken){if(token===moduleToken)normalizeArchitecture();return}
const revealed=await revealModuleCard(key,token);if(!revealed||token!==moduleToken){if(token===moduleToken)normalizeArchitecture();return}setModuleState("active",key);syncActivePieceTransform();scheduleScrollProgress();if(moduleState.pendingKey&&moduleState.pendingKey!==key)returnModule(key);
}
async function returnModule(key){
if(!key||moduleState.phase==="returning")return;if(moduleState.activeKey!==key&&moduleState.phase!=="active")return;
const token=++moduleToken,pending=moduleState.pendingKey;setModuleState("returning",key);const piece=modulePiece(key);if(!await concealModuleCard(key,token)||token!==moduleToken){if(token===moduleToken)normalizeArchitecture();return}if(!await animatePiece(piece,key,"reverse",token)||token!==moduleToken){if(token===moduleToken)normalizeArchitecture();return}
setPieceExpanded(key,false);piece?.style.removeProperty("transform");moduleState.activeKey=null;showOverview();setModuleState("idle",null);scheduleScrollProgress();const next=moduleState.pendingKey||pending;moduleState.pendingKey=null;if(next&&next!==key)requestAnimationFrame(()=>activateModule(next));
}
function normalizeArchitecture({restoreOverview=true}={}){moduleToken+=1;moduleAnimation?.cancel();moduleAnimation=null;moduleState.pendingKey=null;moduleState.activeKey=null;clearPieceStates();if(restoreOverview)showOverview();setModuleState("idle",null)}
function integrateAtrioOverview(){
const atrioCard=moduleCardByKey.get("atrio");if(!atrioCard||!moduleOverviewCard)return;
const overviewSubtitle=moduleOverviewCard.querySelector(".module-card__subtitle");
const overviewIndex=moduleOverviewCard.querySelector(".module-card__index");
const overviewMother=moduleOverviewCard.querySelector(".module-card__mother");
const currentMother=atrioCard.querySelector(".module-card__mother");
if(overviewSubtitle&&overviewIndex&&overviewMother){
currentMother?.remove();
const flow=document.createElement("div");flow.className="module-card__flow module-card__flow--atrio";
const architecture=document.createElement("section");architecture.className="module-card__section module-card__architecture module-card__system-map";
const lead=document.createElement("p");lead.className="module-lead";lead.textContent=overviewSubtitle.textContent.trim();
architecture.append(lead,overviewIndex.cloneNode(true));
const regency=document.createElement("section");regency.className="module-card__section module-card__operation module-card__regency";regency.append(...[...overviewMother.childNodes].map(node=>node.cloneNode(true)));
flow.append(architecture,regency);atrioCard.append(flow);
}
const prompt=document.createElement("p");prompt.className="module-card__idle-prompt";prompt.innerHTML="<strong>Selecione uma peça.</strong><span>Antecipe o movimento.</span>";moduleOverviewCard.replaceChildren(prompt);
}
function buildModuleVersion(card,key){
if(!card||card.querySelector(".module-card__version"))return;
const version=document.createElement("div");
version.className="module-card__version";
version.dataset.moduleVersion=key;
const label=document.createElement("span");
label.className="module-card__version-label";
label.textContent="VERSÃO";
const value=document.createElement("strong");
value.className="module-card__version-value";
const defined=(card.dataset.version||"").trim();
value.textContent=defined||"—";
if(!defined)value.setAttribute("aria-label","Versão não informada");
version.append(label,value);
(card.querySelector(".module-card__flow")||card).append(version);
}
function sampleItemsFor(key){
const copy=sampleCopy[key];
const template=copy?document.getElementById(copy.template):null;
if(!copy||!template)return[];
return[...template.content.querySelectorAll("img")].map((image,index)=>({
index,
src:image.getAttribute("src")||"",
alt:image.getAttribute("alt")||"",
width:image.getAttribute("width")||"",
height:image.getAttribute("height")||""
})).filter(item=>item.src);
}
function buildSampleGallery(card,key){
if(!card)return;
card.querySelectorAll(".operational-sample-trigger").forEach(trigger=>trigger.remove());
if(card.querySelector(".module-sample-strip"))return;
const copy=sampleCopy[key];
const items=sampleItemsFor(key);
const title=copy?copy.title:(card.querySelector(".module-card__header h3")?.textContent.trim()||key.toUpperCase());
const strip=document.createElement("div");
strip.className="module-sample-strip";
if(!items.length){
// ATRIO e regencia, nao modulo operacional: nao produz registro, entao a
// faixa nao se aplica. Nos demais ela permanece, vazia e declarada, para os
// quatro modulos conservarem a mesma anatomia.
if(key==="atrio")return;
strip.classList.add("module-sample-strip--empty");
strip.setAttribute("role","group");
strip.setAttribute("aria-label",`Registros visuais de ${title}: em preparação`);
for(let i=0;i<2;i+=1){
const ghost=document.createElement("span");
ghost.className="module-sample-sheet module-sample-sheet--placeholder";
ghost.setAttribute("aria-hidden","true");
strip.append(ghost);
}
const nota=document.createElement("p");
nota.className="module-sample-pending";
nota.textContent="Registro visual em preparação";
strip.append(nota);
card.append(strip);
return;
}
strip.setAttribute("role","group");
strip.setAttribute("aria-label",`Registros visuais de ${title}`);
items.forEach(item=>{
const button=document.createElement("button");
button.type="button";
button.className="module-sample-sheet";
button.dataset.sample=key;
button.dataset.sampleIndex=String(item.index);
button.setAttribute("aria-haspopup","dialog");
button.setAttribute("aria-controls","sample-note");
button.setAttribute("aria-expanded","false");
button.setAttribute("aria-label",`Abrir registro visual ${item.index+1} de ${copy.title}`);
const image=document.createElement("img");
image.src=item.src;
image.alt="";
if(item.width)image.width=Number(item.width);
if(item.height)image.height=Number(item.height);
image.loading="lazy";
image.decoding="async";
button.append(image);
strip.append(button);
});
card.append(strip);
}
function renderSampleSelection(copy,index){
const template=copy?document.getElementById(copy.template):null;
if(!template||!sampleContent)return false;
const images=[...template.content.querySelectorAll("img")];
const source=images[index]||images[0];
if(!source)return false;
const sourceLink=source.closest("a");
const visual=sourceLink?sourceLink.cloneNode(true):source.cloneNode(true);
const description=template.content.querySelector("p")?.cloneNode(true);
sampleContent.replaceChildren(visual,...(description?[description]:[]));
return true;
}
function prepareArchitecture(){
if(!moduleSystem||!moduleField||!moduleCardStage)return;
const ordered=MODULE_ORDER.map(key=>modulePiece(key)).filter(Boolean);ordered.forEach(piece=>moduleField.appendChild(piece));modulePieces.splice(0,modulePieces.length,...ordered);
moduleDetailCards.forEach(card=>{
card.querySelectorAll(".module-card__back").forEach(back=>back.remove());
const legacyTrigger=card.querySelector(".module-card__piece.brand-trigger"),heading=card.querySelector(".module-card__header h3");
if(legacyTrigger&&heading){
const titleTrigger=document.createElement("button");
titleTrigger.type="button";
titleTrigger.className="module-card__title-trigger brand-trigger";
titleTrigger.dataset.brand=legacyTrigger.dataset.brand;
titleTrigger.setAttribute("aria-expanded","false");
titleTrigger.setAttribute("aria-controls","brand-note");
titleTrigger.setAttribute("aria-haspopup","dialog");
titleTrigger.setAttribute("aria-label",`Abrir construção da marca ${heading.textContent.trim()}`);
titleTrigger.textContent=heading.textContent.trim();
heading.replaceChildren(titleTrigger);
legacyTrigger.remove();
}
});
integrateAtrioOverview();
moduleDetailCards.forEach(card=>{
const key=card.dataset.moduleCard;
buildModuleVersion(card,key);
buildSampleGallery(card,key);
});
brandTriggers.splice(0,brandTriggers.length,...document.querySelectorAll(".brand-trigger"));
sampleTriggers.splice(0,sampleTriggers.length,...document.querySelectorAll(".module-sample-sheet[data-sample]"));
document.getElementById("module-stream-vision")?.remove();showOverview();clearPieceStates();setModuleState("idle",null);
}

function setBrandOpen(open,{trigger=lastBrandTrigger,restoreFocus=true}={}){
if(!brandNote)return;brandTriggers.forEach(item=>item.setAttribute("aria-expanded","false"));
if(open&&trigger){const copy=brandCopy[trigger.dataset.brand];if(!copy)return;lastBrandTrigger=trigger;trigger.setAttribute("aria-expanded","true");brandPiece.textContent=copy.piece;brandTitle.textContent=copy.title;brandMeaning.textContent=copy.meaning;brandRationale.textContent=copy.rationale;brandRelation.textContent=copy.relation;brandImage.src=copy.asset;brandImage.alt=`Símbolo ${copy.title}`;brandNote.hidden=false;document.body.classList.add("brand-dialog-open");brandNote.scrollTop=0;requestAnimationFrame(()=>brandNote.focus({preventScroll:true}));return}
brandNote.hidden=true;document.body.classList.remove("brand-dialog-open");if(restoreFocus&&lastBrandTrigger)lastBrandTrigger.focus({preventScroll:true});
}
function setSampleOpen(open,{trigger=lastSampleTrigger,restoreFocus=true}={}){
if(!sampleNote||!sampleContent)return;sampleTriggers.forEach(item=>item.setAttribute("aria-expanded","false"));
if(open&&trigger){
const copy=sampleCopy[trigger.dataset.sample];
const index=Number.parseInt(trigger.dataset.sampleIndex||"0",10);
if(!copy||!renderSampleSelection(copy,Number.isFinite(index)?index:0))return;
lastSampleTrigger=trigger;trigger.setAttribute("aria-expanded","true");sampleTitle.textContent=copy.title;sampleNote.hidden=false;document.body.classList.add("sample-dialog-open");sampleContent.scrollTop=0;requestAnimationFrame(()=>sampleNote.focus({preventScroll:true}));return;
}
sampleNote.hidden=true;sampleContent.replaceChildren();document.body.classList.remove("sample-dialog-open");if(restoreFocus&&lastSampleTrigger)lastSampleTrigger.focus({preventScroll:true});
}
function trapDialogTab(event,dialog){const controls=[...dialog.querySelectorAll("a[href],button:not([disabled])")].filter(control=>!control.hidden&&control.getClientRects().length),first=controls[0],last=controls.at(-1);if(!first||!last)return;if(!dialog.contains(document.activeElement)||document.activeElement===dialog){event.preventDefault();(event.shiftKey?last:first).focus()}else if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}
function setArchitectureInputMode(mode){root.dataset.architectureInput=mode}

prepareArchitecture();
document.addEventListener("pointerdown",event=>{if(moduleSystem?.contains(event.target))setArchitectureInputMode("pointer")},true);
document.addEventListener("keydown",event=>{if(ARCHITECTURE_NAV_KEYS.has(event.key))setArchitectureInputMode("keyboard")},true);
brandTriggers.forEach(trigger=>trigger.addEventListener("click",()=>{const open=trigger.getAttribute("aria-expanded")!=="true";if(open){setLegalTechOpen(false,{restoreFocus:false});setSampleOpen(false,{restoreFocus:false})}setBrandOpen(open,{trigger,restoreFocus:false})}));
sampleTriggers.forEach(trigger=>trigger.addEventListener("click",()=>{setBrandOpen(false,{restoreFocus:false});setLegalTechOpen(false,{restoreFocus:false});setSampleOpen(true,{trigger,restoreFocus:false})}));
modulePieces.forEach(piece=>{piece.addEventListener("click",()=>activateModule(piece.dataset.modulePiece));piece.addEventListener("keydown",event=>{if(!["ArrowDown","ArrowUp","ArrowRight","ArrowLeft","Home","End"].includes(event.key))return;event.preventDefault();const current=modulePieces.indexOf(piece),next=event.key==="Home"?0:event.key==="End"?modulePieces.length-1:(current+(["ArrowDown","ArrowRight"].includes(event.key)?1:-1)+modulePieces.length)%modulePieces.length;modulePieces[next]?.focus()})});
brandClose?.addEventListener("click",()=>setBrandOpen(false));sampleClose?.addEventListener("click",()=>setSampleOpen(false));sampleNote?.addEventListener("click",event=>{if(event.target===sampleNote)setSampleOpen(false)});
document.addEventListener("keydown",event=>{if(event.key==="Tab"&&sampleNote&&!sampleNote.hidden){trapDialogTab(event,sampleNote);return}if(event.key==="Tab"&&brandNote&&!brandNote.hidden){trapDialogTab(event,brandNote);return}if(event.key!=="Escape")return;if(!sampleNote?.hidden){event.preventDefault();setSampleOpen(false);return}if(!brandNote?.hidden){event.preventDefault();setBrandOpen(false);return}if(legalTechNote?.hidden)return;event.preventDefault();setLegalTechOpen(false)});
function post(section){if(window.parent===window||location.protocol==="file:")return;window.parent.postMessage({type:"ATRIO_SECTION",section},location.origin)}
window.addEventListener("message",event=>{if(event.source!==window.parent||event.origin!==location.origin)return;const data=event.data;if(!data||data.type!=="ATRIO_NAVIGATE"||!allowed.has(data.section))return;document.getElementById(data.section)?.scrollIntoView({behavior:"auto",block:"start"})});
const heroObserver=new IntersectionObserver(([entry])=>{visible=Boolean(entry?.isIntersecting);syncAnimation()},{threshold:.01});heroObserver.observe(hero);
const sectionObserver=new IntersectionObserver(entries=>{const current=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(current){syncScrollField(current.target);post(current.target.id)}},{threshold:[.2,.4,.6],rootMargin:"-12% 0px -52% 0px"});sections.forEach(section=>sectionObserver.observe(section));
const revealItems=[...document.querySelectorAll(".architecture-system,.metric-row,.authorship-row,.responsibility-row,.relations-row,.final-row")];
if(!reduceMotion.matches&&"IntersectionObserver" in window){root.classList.add("motion-ready");revealItems.forEach(item=>item.classList.add("reveal-item"));const revealObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.classList.add("is-visible");revealObserver.unobserve(entry.target)})},{threshold:.08,rootMargin:"0px 0px -8% 0px"});revealItems.forEach(item=>revealObserver.observe(item))}
const ro=new ResizeObserver(measure);ro.observe(document.documentElement);const scrollResizeObserver=new ResizeObserver(scheduleScrollProgress);scrollResizeObserver.observe(document.body);reduceMotion.addEventListener?.("change",syncAnimation);document.fonts?.ready.then(measure);document.fonts?.ready.then(scheduleScrollProgress);window.addEventListener("load",measure);window.addEventListener("load",scheduleScrollProgress);window.addEventListener("resize",scheduleScrollProgress,{passive:true});window.addEventListener("scroll",scheduleScrollProgress,{passive:true});measure();paintScrollProgress();syncAnimation();
})();
