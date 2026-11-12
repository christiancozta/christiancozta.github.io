/* GERADO por i18n/build.mjs a partir de atrio.js | não editar à mão. */
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
const versionNote = document.getElementById("version-note");
const versionClose = document.getElementById("version-note-close");
const versionTitle = document.getElementById("version-note-title");
const versionCurrent = document.getElementById("version-note-current");
const versionList = document.getElementById("version-note-list");
let lastVersionTrigger = null;
const sampleTriggers = [...document.querySelectorAll("[data-sample]")];
const sampleNote = document.getElementById("sample-note");
const sampleClose = document.getElementById("sample-note-close");
const sampleTitle = document.getElementById("sample-note-title");
const sampleIndexLabel = document.getElementById("sample-note-index");
const sampleNotice = document.getElementById("sample-note-notice");
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
atrio:{selo:"API 0.7.0",historico:[{"v": "0.7.0", "d": "Jul 2026", "t": "Local backend for the method: typed contracts, state machine, persistence, encrypted vault, and provenance. 31 routes, 33 HTTP operations, and 188 automated tests passed."}],asset:"../assets/atrio/brand/atrio-rei.svg",title:"ATRIO",piece:"King | parent structure",meaning:"Portico, governed entry, unity, and conducting.",rationale:"The form gathers entrances under a common structure and makes the conducting principle visible.",relation:"The King stands for specialization under common conducting, never a hierarchy of importance: unity through grammar; distinction through movement."},
corpus:{selo:"CORPUS 1.5.0",historico:[{"v": "1.0.0", "d": "date not recoverable", "t": "Intake robot with vault-based pseudonymization, screening for sealed cases, and a run log."}, {"v": "1.1.0", "d": "date not recoverable", "t": "CSV inventory as the source of truth. SHA-256 hash as key, deduplication by file and by CNJ case number."}, {"v": "1.2.0", "d": "date not recoverable", "t": "OCR for scanned PDFs without a text layer, reusing the existing engines and vault."}, {"v": "1.3.0", "d": "date not recoverable", "t": "Read-only operational dashboard in the ATRIO visual language."}, {"v": "1.4.0", "d": "date not recoverable", "t": "Separate inventories, one documentary and one of pseudonyms, with a consolidated XLSX."}, {"v": "1.5.0", "d": "26 Jul 2026", "t": "Monorepo reorganized and CORPUS closed as a versioned package. Validated against a live PostgreSQL on 27 Jul 2026."}],asset:"../assets/atrio/brand/corpus-torre.svg",title:"CORPUS",piece:"Rook | documentary memory",meaning:"Strata, classification, preservation, and grounding.",rationale:"The form organizes layers and supports a stable, legible, and preservable base.",relation:"The Rook expresses the task of classifying, keeping, and retrieving the documentary memory that grounds the system."},
ratio:{selo:"RATIO 8.0.0",historico:[{"v": "1.0.0", "d": "24 Mar 2026", "t": "Initial release. Operational prompt with golden rules, logical sanction, and a nine-year caseload."}, {"v": "2.0.0", "d": "27 Mar 2026", "t": "The template bank gives way to a library of legal grounds, with material fit and temporal priority."}, {"v": "3.0.0", "d": "28 Mar 2026", "t": "A package of ten named files replaces the hosted collections."}, {"v": "4.0.0", "d": "9 Apr 2026", "t": "Small-claims appeals and motions for clarification unified under automatic identification of the document type."}, {"v": "5.0.0", "d": "19 Apr 2026", "t": "Authorized sources reduced to three files. Consulting an unlisted source is now prohibited."}, {"v": "6.0.0", "d": "May 2026", "t": "Modularization by phase. Case Status as an explicit object and a formal separation between RATIO and LUX."}, {"v": "7.0.0", "d": "Jul 2026", "t": "Instructions layer taking precedence over the core. One file per module, writs of mandamus with their own procedure, and cascading invalidation."}, {"v": "7.0.1", "d": "17 Sep 2026", "t": "Governance patch. Risk classification adjusts only the density of the exposition; it does not allow phases, gates, mandatory outputs, or validations to be condensed. The workflow remains unchanged."}, {"v": "8.0.0", "d": "28 Sep 2026", "t": "Applicability governance and modular isolation. A firewall excludes inactive modules from the precedence chain; the Critical Layer becomes platform-agnostic, with no presumption that sources are available and portable distribution as a plugin."}],asset:"../assets/atrio/brand/ratio-cavalo.svg",title:"RATIO",piece:"Knight | phased drafting",meaning:"Path, direction, inflection, and controlled deviation.",rationale:"The movement does not advance in an automatic line: it changes direction according to verifiable choices.",relation:"The Knight expresses drafting in phases, with controlled inflections and human validation along the path."},
cerne:{selo:"CERNE 5.1.0",historico:[{"v":"0.1.0","d":"date not recoverable","t":"First executable prototype, with triage and two fixed axes."},{"v":"0.2.0","d":"date not recoverable","t":"Second standalone version of the API, with eleven axes and outputs for an interface and a technical report."},{"v":"1.2.0","d":"date not recoverable","t":"Integration into ATRIO, with auditing from RATIO’s delivery and defined control points."},{"v":"2.0.0","d":"18 Aug 2026","t":"Separation between core and domain modules, a versioned audit package, and human adjudication set out in the contract."},{"v":"3.0.0","d":"9 Sep 2026","t":"Canonical manual for the eleven-axis audit, with a formalized flow, technical and plain outputs, and trace and grounding controls."},{"v":"4.0.0","d":"23 Sep 2026","t":"Canonical consolidation. Formation, admission, and reassessment of doubts in distinct stages, with end-to-end traceability; 156 checks passed."},{"v":"4.0.1","d":"23 Sep 2026","t":"Formalization of the controls and resolution of implementation blockers, without changing the lenses."},{"v":"4.0.2","d":"23 Sep 2026","t":"Computational closure. Correction of conditional rules and formal verification of the package’s dependencies."},{"v":"5.0.0","d":"12 Oct 2026","t":"Adversarial restructuring. Each doubt is now argued for and against independently before the decision; reports in two layers, technical and plain."},{"v":"5.1.0","d":"current","t":"Official manual 1.1.0. Audit through eleven lenses, with independent confrontation of each doubt and questions linked to the passages of the ruling."}],asset:"../assets/atrio/brand/cerne-rainha.svg",title:"CERNE",piece:"Queen | critical core",meaning:"Scrutiny, confrontation, productive tension, and return to the legal ground.",rationale:"The form concentrates strength at the core and widens the field of confrontation without losing its point of origin.",relation:"The Queen expresses the breadth of scrutiny and the return to the legal ground when a formulation needs to be put under tension."},
lux:{selo:"LUX 6.0.0",historico:[{"v": "1.0.0", "d": "30 Mar 2026", "t": "Final refiner delivering in three blocks, with no phases and no handshake."}, {"v": "2.0.0", "d": "13 Apr 2026", "t": "Seven-phase protocol with mandatory approval, a markup system, and a hierarchy of rules."}, {"v": "3.0.0", "d": "21 Apr 2026", "t": "Mode triggers give way to #GUIA. Six phases, with style promoted to a phase of its own."}, {"v": "4.0.0", "d": "22 Apr 2026", "t": "Mandatory flow revoked. Full delivery by default and optional intermediate questions."}, {"v": "5.0.0", "d": "4 May 2026", "t": "Modularization into eleven files, with silent validation and its own installation. The system stops being a prompt."}, {"v": "6.0.0", "d": "Jul 2026", "t": "Anonymization layer with three destination modes and forty identifier types. Eleven files reduced to three."}],asset:"../assets/atrio/brand/lux-bispo.svg",title:"LUX",piece:"Bishop | formal refinement",meaning:"Diagonality, projection, refinement, legibility, and finish.",rationale:"The diagonal projects and refines, guiding the eye without breaking the grounding of the earlier form.",relation:"The Bishop expresses the refinement that improves legibility and finish without crossing the boundary of the merits."}
};
const sampleCopy = {corpus:{title:"CORPUS",template:"sample-template-corpus"},
cerne:{title:"CERNE",template:"sample-template-cerne"},
ratio:{title:"RATIO",template:"sample-template-cerne",placeholder:true},
lux:{title:"LUX",template:"sample-template-cerne",placeholder:true}};
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
const footer=card.querySelector(".module-card__footer");
return[body,footer].filter(Boolean);
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
// A ativacao inicial do ATRIO monta o estado-padrao sem sequestrar a rolagem do Hero.
// O sinal e consumido uma unica vez; interacoes posteriores continuam enquadrando a arquitetura.
if(moduleSystem?.dataset.suppressNextFrame==="true"){delete moduleSystem.dataset.suppressNextFrame;return}
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
if(overviewSubtitle&&overviewIndex&&overviewMother&&!atrioCard.querySelector(".module-card__flow")){
currentMother?.remove();
const flow=document.createElement("div");flow.className="module-card__flow module-card__flow--atrio";
const architecture=document.createElement("section");architecture.className="module-card__section module-card__architecture module-card__system-map";
const lead=document.createElement("p");lead.className="module-lead";lead.textContent=overviewSubtitle.textContent.trim();
architecture.append(lead,overviewIndex.cloneNode(true));
const regency=document.createElement("section");regency.className="module-card__section module-card__operation module-card__regency";regency.append(...[...overviewMother.childNodes].map(node=>node.cloneNode(true)));
flow.append(architecture,regency);atrioCard.append(flow);
}
const prompt=document.createElement("p");prompt.className="module-card__idle-prompt";prompt.innerHTML="<strong>Select a piece.</strong><span>Anticipate the move.</span>";moduleOverviewCard.replaceChildren(prompt);
}
function buildModuleVersion(card,key){
if(!card||card.querySelector(".module-card__version"))return;
const version=document.createElement("div");
version.className="module-card__version";
version.dataset.moduleVersion=key;
const label=document.createElement("button");
label.type="button";
label.className="module-card__version-label";
label.dataset.versionOf=key;
label.setAttribute("aria-haspopup","dialog");
label.setAttribute("aria-controls","version-note");
label.setAttribute("aria-expanded","false");
const atual=((brandCopy[key]&&brandCopy[key].historico)||[]).at(-1);
label.textContent=atual?(key==="cerne"?"CERNE "+atual.v:"v. "+atual.v):"—";
label.setAttribute("aria-label","Version history: "+((brandCopy[key]&&brandCopy[key].title)||key.toUpperCase()));
const value=document.createElement("strong");
value.className="module-card__version-value";
const defined=(card.dataset.version||"").trim();
value.textContent=defined||"—";
if(!defined)value.setAttribute("aria-label","Version not stated");
version.append(label,value);
const footer=document.createElement("div");
footer.className="module-card__footer";
footer.append(version);
(card.querySelector(".module-card__flow")||card).append(footer);
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
const footer=card.querySelector(".module-card__footer");
if(!footer||footer.querySelector(".module-sample-button"))return;
const copy=sampleCopy[key];
const items=sampleItemsFor(key);
if(!copy||!items.length)return;
// O registro deixa de ser miniatura ilegivel e passa a ser controle nomeado,
// no mesmo rodape da versao. Dois botoes dividem a largura restante da coluna.
items.forEach(item=>{
const button=document.createElement("button");
button.type="button";
button.className="module-sample-button";
button.dataset.sample=key;
button.dataset.sampleIndex=String(item.index);
if(copy.placeholder)button.dataset.placeholder="true";
button.setAttribute("aria-haspopup","dialog");
button.setAttribute("aria-controls","sample-note");
button.setAttribute("aria-expanded","false");
const ordem=String(item.index+1).padStart(2,"0");
button.setAttribute("aria-label",`Open visual record ${ordem} of ${copy.title}`);
const texto=document.createElement("span");
texto.textContent=`Record ${ordem}`;
const seta=document.createElement("span");
seta.className="module-sample-button__mark";
seta.setAttribute("aria-hidden","true");
seta.textContent="↗";
button.append(texto,seta);
footer.append(button);
});
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
modulePieces.forEach(piece=>{piece.dataset.label=piece.dataset.modulePiece.toUpperCase()});
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
titleTrigger.setAttribute("aria-label",`Open brand construction: ${heading.textContent.trim()}`);
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
sampleTriggers.splice(0,sampleTriggers.length,...document.querySelectorAll(".module-sample-button[data-sample]"));
document.getElementById("module-stream-vision")?.remove();showOverview();clearPieceStates();setModuleState("idle",null);
}

function setVersionOpen(open,{trigger=lastVersionTrigger,restoreFocus=true}={}){
if(!versionNote)return;
document.querySelectorAll(".module-card__version-label").forEach(b=>b.setAttribute("aria-expanded","false"));
if(open&&trigger){
const copy=brandCopy[trigger.dataset.versionOf];
if(!copy)return;
lastVersionTrigger=trigger;trigger.setAttribute("aria-expanded","true");
const linhas=(copy.historico||[]).slice();
const atual=linhas.at(-1);
/* Nome em Science Gothic com a segunda letra em terracota, como na hero. */
const nome=String(copy.title||"");
versionTitle.replaceChildren(document.createTextNode(nome.slice(0,1)),Object.assign(document.createElement("span"),{className:"version-note__acento",textContent:nome.slice(1,2)}),document.createTextNode(nome.slice(2)));
versionTitle.setAttribute("aria-label",nome);
versionCurrent.textContent=atual?("Current version "+atual.v+", "+atual.d):"";
/* Linha do tempo, da corrente para a mais antiga: número em Clash, data em mono, uma frase por linha. */
const itensHistorico=linhas.slice().reverse();
versionList.replaceChildren(...itensHistorico.map((item,indice)=>{
const li=document.createElement("li");li.className="version-note__item"+(indice===0?" version-note__item--atual":"");
const marca=document.createElement("div");marca.className="version-note__marca";
const numero=document.createElement("b");numero.textContent=item.v;
const data=document.createElement("time");data.textContent=item.d;
marca.append(numero,data);
const pontos=document.createElement("ul");pontos.className="version-note__pontos";
String(item.t||"").split(/(?<=\.)\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9])/).forEach(frase=>{const ponto=document.createElement("li");ponto.textContent=frase;pontos.append(ponto);});
li.append(marca,pontos);return li;}));
versionList.hidden=itensHistorico.length===0;
versionNote.hidden=false;document.body.classList.add("sample-dialog-open");
versionNote.scrollTop=0;requestAnimationFrame(()=>versionNote.focus({preventScroll:true}));
return;
}
versionNote.hidden=true;document.body.classList.remove("sample-dialog-open");
if(restoreFocus&&lastVersionTrigger)lastVersionTrigger.focus({preventScroll:true});
}
function setBrandOpen(open,{trigger=lastBrandTrigger,restoreFocus=true}={}){
if(!brandNote)return;brandTriggers.forEach(item=>item.setAttribute("aria-expanded","false"));
if(open&&trigger){const copy=brandCopy[trigger.dataset.brand];if(!copy)return;lastBrandTrigger=trigger;trigger.setAttribute("aria-expanded","true");brandPiece.textContent=copy.piece;brandTitle.textContent=copy.title;brandMeaning.textContent=copy.meaning;brandRationale.textContent=copy.rationale;brandRelation.textContent=copy.relation;brandImage.src=copy.asset;brandImage.alt=`${copy.title} symbol`;brandNote.hidden=false;document.body.classList.add("brand-dialog-open");brandNote.scrollTop=0;requestAnimationFrame(()=>brandNote.focus({preventScroll:true}));return}
brandNote.hidden=true;document.body.classList.remove("brand-dialog-open");if(restoreFocus&&lastBrandTrigger)lastBrandTrigger.focus({preventScroll:true});
}
function setSampleOpen(open,{trigger=lastSampleTrigger,restoreFocus=true}={}){
if(!sampleNote||!sampleContent)return;sampleTriggers.forEach(item=>item.setAttribute("aria-expanded","false"));
if(open&&trigger){
const copy=sampleCopy[trigger.dataset.sample];
const index=Number.parseInt(trigger.dataset.sampleIndex||"0",10);
if(!copy||!renderSampleSelection(copy,Number.isFinite(index)?index:0))return;
lastSampleTrigger=trigger;trigger.setAttribute("aria-expanded","true");sampleTitle.textContent=copy.title;const total=sampleItemsFor(trigger.dataset.sample).length;const atual=(Number.isFinite(index)?index:0)+1;if(sampleIndexLabel)sampleIndexLabel.textContent=total>1?`Record ${String(atual).padStart(2,"0")} of ${String(total).padStart(2,"0")}`:"Record 01";if(sampleNotice){const emprestado=Boolean(copy.placeholder);sampleNotice.hidden=!emprestado;sampleNotice.textContent=emprestado?`CERNE screen, shown as a placeholder until the ${copy.title} record is published.`:"";}sampleNote.hidden=false;document.body.classList.add("sample-dialog-open");sampleContent.scrollTop=0;requestAnimationFrame(()=>sampleNote.focus({preventScroll:true}));return;
}
sampleNote.hidden=true;sampleContent.replaceChildren();document.body.classList.remove("sample-dialog-open");if(restoreFocus&&lastSampleTrigger)lastSampleTrigger.focus({preventScroll:true});
}
function trapDialogTab(event,dialog){const controls=[...dialog.querySelectorAll("a[href],button:not([disabled])")].filter(control=>!control.hidden&&control.getClientRects().length),first=controls[0],last=controls.at(-1);if(!first||!last)return;if(!dialog.contains(document.activeElement)||document.activeElement===dialog){event.preventDefault();(event.shiftKey?last:first).focus()}else if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}
function setArchitectureInputMode(mode){root.dataset.architectureInput=mode}

prepareArchitecture();
/* A mae aciona um modulo pelo cordao. activateModule ja enquadra a secao pelo
   frameArchitecture, entao nao ha rolagem propria aqui: a jogada acontece com a
   secao em quadro, nunca durante o trajeto. */
/* A Arquitetura é a matriz das fichas: acionar um módulo destaca a sua coluna. */
window.atrioActivateModule = key => {
if(!MODULE_ORDER.includes(key))return;
const matrix=document.getElementById("at-mx");if(matrix)matrix.dataset.active=key;
};
/* Matriz presa ao grid visível: começa numa linha do grid e cada faixa (cabeçalho,
   linhas da tabela, autoria) cresce até o múltiplo seguinte da fileira do fundo:
   --board-row (168px) no desktop, --grid-row (84px) no celular; base fixa de 21px. */
const atMatrix=document.getElementById("at-mx");
function snapMatrix(){
const table=atMatrix?.querySelector(".at-mx__table"),frame=atMatrix?.closest(".frame");if(!table||!frame)return;
const unit=mobileArchitecture.matches?84:168,up=h=>Math.max(unit,Math.ceil(Math.round(h)/unit)*unit);
const bands=[atMatrix.querySelector(".at-mx__head"),atMatrix.querySelector(".at-mx__autoria")].filter(Boolean);
atMatrix.style.marginTop="";bands.forEach(el=>el.style.minHeight="");table.style.gridTemplateRows="";
const offset=Math.round(atMatrix.getBoundingClientRect().top-frame.getBoundingClientRect().top),gap=(unit-offset%unit)%unit;
if(gap)atMatrix.style.marginTop=`${gap}px`;
bands.forEach(el=>el.style.minHeight=`${up(el.getBoundingClientRect().height)}px`);
table.style.gridTemplateRows=[...table.rows].map(row=>`${up(row.cells[0].getBoundingClientRect().height)}px`).join(" ");
guardJustify();
}
/* Salvaguarda da justificação: mede o vão entre palavras vizinhas em cada linha
   da casa; se algum passar de 3 espaços, a casa volta ao alinhamento à esquerda
   (.is-ragged). Se mais de 4 casas precisarem disso, a matriz inteira volta,
   para o tabuleiro não ficar misturado. A justificação não muda as quebras, só
   os vãos, então a altura das fileiras já encaixadas não se altera. */
function guardJustify(){
const cells=[...(atMatrix?.querySelectorAll("tbody td")||[])];
cells.forEach(td=>td.classList.remove("is-ragged"));
const wideCells=cells.filter(td=>{
if(getComputedStyle(td).textAlign!=="justify")return false;
const probe=document.createElement("span");probe.textContent="\u00a0";td.append(probe);const space=probe.getBoundingClientRect().width;probe.remove();
const words=[],walker=document.createTreeWalker(td,NodeFilter.SHOW_TEXT);let node;
while((node=walker.nextNode())){for(const m of node.data.matchAll(/\S+/g)){const r=document.createRange();r.setStart(node,m.index);r.setEnd(node,m.index+m[0].length);const rects=[...r.getClientRects()].filter(x=>x.width>0);if(rects.length)words.push([rects[0],rects.at(-1)])}}
return words.some((w,i)=>{const prev=words[i-1];return prev&&Math.abs(prev[1].top-w[0].top)<3&&w[0].left-prev[1].right>space*3});
});
(wideCells.length>4?cells:wideCells).forEach(td=>td.classList.add("is-ragged"));
}
/* reencaixa quando a largura muda (já com --cell novo) e quando as fontes chegam */
let atMatrixWidth=0;if(atMatrix)new ResizeObserver(([entry])=>{const width=Math.round(entry.contentRect.width);if(width!==atMatrixWidth){atMatrixWidth=width;snapMatrix()}}).observe(atMatrix);
document.fonts?.ready.then(snapMatrix);addEventListener("load",snapMatrix);
/* Faixas presas ao grid visível no desktop: cada [data-grid-band] cresce até o
   múltiplo seguinte de --board-row (168px). As internas são medidas antes das
   que as contêm, para que a externa já some as alturas encaixadas. A folga
   de 2px absorve a borda de 1px que coincide com a linha do fundo. */
const gridBands=[...document.querySelectorAll("[data-grid-band]")].reverse();
function snapBands(){
gridBands.forEach(el=>el.style.minHeight="");
if(mobileArchitecture.matches)return;
const unit=168;
gridBands.forEach(el=>{const h=Math.round(el.getBoundingClientRect().height);el.style.minHeight=`${Math.max(unit,Math.ceil((h-2)/unit)*unit)}px`});
}
let bandsWidth=0;new ResizeObserver(([entry])=>{const width=Math.round(entry.contentRect.width);if(width!==bandsWidth){bandsWidth=width;snapBands()}}).observe(document.body);
document.fonts?.ready.then(snapBands);addEventListener("load",snapBands);
/* Contextual entry from ARCO, using this page's canonical version history. */
const documentationRequest = new URLSearchParams(location.search);
const requestedModule = documentationRequest.get("module");
if(MODULE_ORDER.includes(requestedModule)){
  window.addEventListener("load",async()=>{
    window.atrioActivateModule(requestedModule);
    if(documentationRequest.get("panel")==="history"){
      const trigger=document.querySelector(`[data-version-of="${requestedModule}"]`);
      if(trigger)setVersionOpen(true,{trigger});
    }
  },{once:true});
}
document.addEventListener("pointerdown",event=>{if(moduleSystem?.contains(event.target))setArchitectureInputMode("pointer")},true);
document.addEventListener("keydown",event=>{if(ARCHITECTURE_NAV_KEYS.has(event.key))setArchitectureInputMode("keyboard")},true);
brandTriggers.forEach(trigger=>trigger.addEventListener("click",()=>{const open=trigger.getAttribute("aria-expanded")!=="true";if(open){setLegalTechOpen(false,{restoreFocus:false});setSampleOpen(false,{restoreFocus:false})}setBrandOpen(open,{trigger,restoreFocus:false})}));
sampleTriggers.forEach(trigger=>trigger.addEventListener("click",()=>{setBrandOpen(false,{restoreFocus:false});setLegalTechOpen(false,{restoreFocus:false});setSampleOpen(true,{trigger,restoreFocus:false})}));
modulePieces.forEach(piece=>{piece.addEventListener("click",()=>activateModule(piece.dataset.modulePiece));piece.addEventListener("keydown",event=>{if(!["ArrowDown","ArrowUp","ArrowRight","ArrowLeft","Home","End"].includes(event.key))return;event.preventDefault();const current=modulePieces.indexOf(piece),next=event.key==="Home"?0:event.key==="End"?modulePieces.length-1:(current+(["ArrowDown","ArrowRight"].includes(event.key)?1:-1)+modulePieces.length)%modulePieces.length;modulePieces[next]?.focus()})});
brandClose?.addEventListener("click",()=>setBrandOpen(false));sampleClose?.addEventListener("click",()=>setSampleOpen(false));
versionClose?.addEventListener("click",()=>setVersionOpen(false));
versionNote?.addEventListener("click",event=>{if(event.target===versionNote)setVersionOpen(false)});
document.addEventListener("click",event=>{
const alvo=event.target.closest(".module-card__version-label");
if(!alvo)return;
setSampleOpen(false,{restoreFocus:false});setBrandOpen(false,{restoreFocus:false});
setVersionOpen(alvo.getAttribute("aria-expanded")!=="true",{trigger:alvo,restoreFocus:false});
});sampleNote?.addEventListener("click",event=>{if(event.target===sampleNote)setSampleOpen(false)});
document.addEventListener("keydown",event=>{if(event.key==="Tab"&&sampleNote&&!sampleNote.hidden){trapDialogTab(event,sampleNote);return}if(event.key==="Tab"&&brandNote&&!brandNote.hidden){trapDialogTab(event,brandNote);return}if(event.key==="Tab"&&versionNote&&!versionNote.hidden){trapDialogTab(event,versionNote);return}if(event.key!=="Escape")return;if(!versionNote?.hidden){event.preventDefault();setVersionOpen(false);return}if(!sampleNote?.hidden){event.preventDefault();setSampleOpen(false);return}if(!brandNote?.hidden){event.preventDefault();setBrandOpen(false);return}if(legalTechNote?.hidden)return;event.preventDefault();setLegalTechOpen(false)});
function post(section){if(window.parent===window||location.protocol==="file:")return;window.parent.postMessage({type:"ATRIO_SECTION",section},location.origin)}
window.addEventListener("message",event=>{if(event.source!==window.parent||event.origin!==location.origin)return;const data=event.data;if(!data||data.type!=="ATRIO_NAVIGATE"||!allowed.has(data.section))return;document.getElementById(data.section)?.scrollIntoView({behavior:"auto",block:"start"})});
const heroObserver=new IntersectionObserver(([entry])=>{visible=Boolean(entry?.isIntersecting);syncAnimation()},{threshold:.01});heroObserver.observe(hero);
const sectionObserver=new IntersectionObserver(entries=>{const current=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(current){syncScrollField(current.target);post(current.target.id)}},{threshold:[.2,.4,.6],rootMargin:"-12% 0px -52% 0px"});sections.forEach(section=>sectionObserver.observe(section));
const revealItems=[...document.querySelectorAll(".architecture-system,.metric-row,.authorship-row,.responsibility-row,.relations-row,.final-row")];
if(!reduceMotion.matches&&"IntersectionObserver" in window){root.classList.add("motion-ready");revealItems.forEach(item=>item.classList.add("reveal-item"));const revealObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.classList.add("is-visible");revealObserver.unobserve(entry.target)})},{threshold:.08,rootMargin:"0px 0px -8% 0px"});revealItems.forEach(item=>revealObserver.observe(item))}
const ro=new ResizeObserver(measure);ro.observe(document.documentElement);const scrollResizeObserver=new ResizeObserver(scheduleScrollProgress);scrollResizeObserver.observe(document.body);reduceMotion.addEventListener?.("change",syncAnimation);document.fonts?.ready.then(measure);document.fonts?.ready.then(scheduleScrollProgress);window.addEventListener("load",measure);window.addEventListener("load",scheduleScrollProgress);window.addEventListener("resize",scheduleScrollProgress,{passive:true});window.addEventListener("scroll",scheduleScrollProgress,{passive:true});measure();paintScrollProgress();syncAnimation();
})();

/* Camada de comprovação: um tooltip compartilhado por todas as métricas. */
(() => {
  "use strict";

  const tooltip = document.getElementById("data-tooltip");
  if (!tooltip) return;

  const REGIMES = {
    lastro: { nome: "Documentary trace", campos: ["SOURCE", "COUNT", "POPULATION", "TIMEFRAME", "SEE IN"] },
    derivacao: { nome: "Derived trace", campos: ["DERIVED FROM", "COUNT", "POPULATION", "TIMEFRAME", "SEE IN"] }
  };
  const TIP_KEYS = ["source", "numerator", "denominator", "period", "detail"];
  const LASTRO_KEYS = ["numerator", "denominator", "period"];
  const SLOT_ORDER = ["source", "detail", "numerator", "denominator", "period"];
  const DATUM_SELECTOR = "[data-datum][data-regime]";
  const tipFields = {};
  const tipLabels = {};
  const tipSlots = {};
  TIP_KEYS.forEach((key) => {
    tipFields[key] = tooltip.querySelector(`[data-tip-${key}]`);
    tipLabels[key] = tooltip.querySelector(`[data-tip-label="${key}"]`);
    tipSlots[key] = tooltip.querySelector(`[data-tip-slot="${key}"]`);
  });
  const lastroHead = tooltip.querySelector("[data-tip-lastro]");
  let activeDatum = null;

  const datumFrom = node => node instanceof Element ? node.closest(DATUM_SELECTOR) : null;

  const positionTooltip = target => {
    if (tooltip.hidden) return;
    const rect = target.getBoundingClientRect();
    const gap = 12;
    const tipRect = tooltip.getBoundingClientRect();
    let left = rect.left + (rect.width - tipRect.width) / 2;
    let top = rect.top - tipRect.height - gap;

    left = Math.max(gap, Math.min(left, window.innerWidth - tipRect.width - gap));
    if (top < gap) top = Math.min(window.innerHeight - tipRect.height - gap, rect.bottom + gap);

    tooltip.style.left = left + "px";
    tooltip.style.top = top + "px";
  };

  const showTooltip = target => {
    const regime = REGIMES[target.dataset.regime];
    if (!regime) return;
    if (activeDatum && activeDatum !== target) activeDatum.removeAttribute("aria-describedby");
    activeDatum = target;
    tooltip.className = "data-tooltip is-" + target.dataset.regime;
    tooltip.querySelector("[data-tip-regime]").textContent = regime.nome;
    TIP_KEYS.forEach((key, index) => {
      const value = target.dataset[key] || "";
      if (tipLabels[key]) tipLabels[key].textContent = regime.campos[index];
      if (tipFields[key]) tipFields[key].textContent = value;
      if (tipSlots[key]) tipSlots[key].hidden = !value;
    });
    lastroHead.hidden = !LASTRO_KEYS.some((key) => target.dataset[key]);
    let lastVisible = null;
    SLOT_ORDER.forEach((key) => {
      const slot = tipSlots[key];
      if (!slot) return;
      slot.classList.remove("is-last");
      if (!slot.hidden) lastVisible = slot;
    });
    if (lastVisible) lastVisible.classList.add("is-last");
    target.setAttribute("aria-describedby", tooltip.id);
    tooltip.hidden = false;
    requestAnimationFrame(() => positionTooltip(target));
  };

  const hideTooltip = () => {
    if (activeDatum) activeDatum.removeAttribute("aria-describedby");
    activeDatum = null;
    tooltip.hidden = true;
  };

  document.addEventListener("mouseover", event => {
    const target = datumFrom(event.target);
    if (!target || target === datumFrom(event.relatedTarget)) return;
    showTooltip(target);
  });
  document.addEventListener("mouseout", event => {
    const target = datumFrom(event.target);
    if (!target || target !== activeDatum) return;
    const next = datumFrom(event.relatedTarget);
    if (next && next !== target) showTooltip(next);
    else if (!next) hideTooltip();
  });
  document.addEventListener("focusin", event => {
    const target = datumFrom(event.target);
    if (target) showTooltip(target);
  });
  document.addEventListener("focusout", event => {
    const target = datumFrom(event.target);
    if (!target || target !== activeDatum) return;
    const next = datumFrom(event.relatedTarget);
    if (next) showTooltip(next);
    else hideTooltip();
  });
// M3: no toque nao ha hover. O ponteiro abre sobre o dado e fecha fora dele.
  document.addEventListener("pointerdown", event => {
    const target = datumFrom(event.target);
    if (target) showTooltip(target);
    else if (activeDatum) hideTooltip();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") hideTooltip();
  });
  window.addEventListener("scroll", hideTooltip, { passive: true });
  window.addEventListener("resize", hideTooltip, { passive: true });
})();
