(() => {
"use strict";

const $ = id => document.getElementById(id);
const els = {
  setup:$("setup-screen"),play:$("play-screen"),results:$("results-screen"),
  home:$("home-button"),modes:[...document.querySelectorAll("[data-mode]")],
  durations:[...document.querySelectorAll("[data-duration]")],
  languages:[...document.querySelectorAll("[data-language]")],
  timeConfig:$("time-config"),start:$("start-button"),history:$("history-container"),
  playKicker:$("play-kicker"),playTitle:$("play-title"),instruction:$("play-instruction"),
  newText:$("new-text-button"),wpm:$("live-wpm"),accuracy:$("live-accuracy"),
  errors:$("live-errors"),timer:$("live-timer"),timerLabel:$("time-label"),
  testTag:$("test-mode-tag"),testState:$("test-state"),
  promptContainer:$("prompt-container"),prompt:$("prompt-text"),
  zenContainer:$("zen-container"),zenInspiration:$("zen-inspiration"),
  input:$("typing-input"),inputLabel:$("typing-label"),inputHint:$("typing-hint"),
  progressCaption:$("progress-caption"),characters:$("characters-caption"),
  progressRail:$("progress-rail"),progressFill:$("progress-fill"),
  shortcut:$("shortcut-tip"),restart:$("restart-button"),finish:$("finish-button"),
  resultTitle:$("results-title"),resultSummary:$("result-summary"),
  resultWpm:$("result-wpm"),resultRating:$("result-rating"),
  resultAccuracy:$("result-accuracy"),resultRaw:$("result-raw"),
  resultErrors:$("result-errors"),resultDuration:$("result-duration"),
  resultCorrect:$("result-correct"),resultBest:$("result-best"),
  resultRecord:$("result-record-note"),resultHome:$("result-home-button"),
  resultRetry:$("result-retry-button"),toast:$("toast")
};
const STORAGE = "hisokatype-results-v1";
const SETTINGS = "hisokatype-settings-v1";
const MODES = {
  time:{name:"Time Attack",heading:"Race the clock.",hint:"Type the highlighted text as quickly and accurately as you can.",tag:"TIME ATTACK"},
  quote:{name:"Quote Challenge",heading:"Every word counts.",hint:"Finish the entire passage. Fix highlighted mistakes to complete the challenge.",tag:"QUOTE CHALLENGE"},
  zen:{name:"Zen Practice",heading:"Make it your own.",hint:"Write whatever is on your mind. No deadline, no wrong answers.",tag:"ZEN PRACTICE"}
};
const LINES = {
  en:[
    "Small steps create lasting progress. Focus on the next word instead of chasing a perfect score, and your speed will grow naturally.",
    "The quiet rhythm of a keyboard can turn a simple thought into something meaningful. Every sentence begins with one letter.",
    "Great ideas rarely arrive all at once. They take shape through patient practice, a curious mind, and the courage to try again.",
    "A bright morning brings fresh energy to the city. People open their windows, make coffee, and prepare for new adventures.",
    "Learning a new skill is a journey of attention and repetition. Progress is easier to see when you celebrate the little wins.",
    "The best way to improve your typing is to stay relaxed, keep your eyes on the screen, and let your fingers find their way.",
    "Digital tools help us connect, create, and explore. Behind every useful application is a person who kept learning.",
    "Consistency beats intensity when you are building a habit. Ten minutes of focused practice can make a real difference."
  ],
  fr:[
    "Chaque petit effort compte. Concentre-toi sur le prochain mot et avance tranquillement vers une meilleure vitesse de frappe.",
    "Le rythme du clavier transforme une idée en phrase. Avec de la patience, chaque nouvelle journée apporte du progrès.",
    "Les grandes idées commencent souvent par une question simple. La curiosité et la pratique ouvrent de nouvelles portes.",
    "Le matin, la ville se réveille doucement. Les gens préparent leur café et organisent une journée pleine de possibilités.",
    "Apprendre une compétence demande du temps, de la confiance et surtout de la régularité. Chaque séance est utile.",
    "Pour écrire plus vite, garde les mains détendues et regarde le texte. La précision est aussi importante que la vitesse.",
    "Les outils numériques permettent de partager des connaissances, de créer des projets et de découvrir le monde.",
    "Une habitude solide se construit avec de petits gestes répétés. Quelques minutes de concentration peuvent tout changer."
  ]
};
const QUOTES = {
  en:[
    "Progress begins when you decide to try one more time. The speed will come; the habit comes first.",
    "A calm mind and a steady rhythm can take you further than a perfect plan that never begins.",
    "The road to mastery is made of simple moments: focus, practice, reflect, and begin again.",
    "Create something useful today, even if it is small. Tomorrow you will know more than you did yesterday.",
    "Your keyboard is a tool for ideas. Write with confidence, correct your mistakes, and enjoy the journey.",
    "Every great developer started by typing a single line. Keep practicing and trust the process.",
    "A few quiet minutes of focused work can turn an ordinary day into a memorable one.",
    "Let curiosity guide your learning, and let persistence carry you through the difficult parts."
  ],
  fr:[
    "La progression commence avec un nouvel essai. La vitesse viendra, mais la régularité se construit aujourd'hui.",
    "Un esprit calme et un rythme constant peuvent te mener plus loin qu'un projet parfait jamais commencé.",
    "Le chemin vers la maîtrise passe par de petites étapes : apprendre, pratiquer, réfléchir et recommencer.",
    "Crée quelque chose d'utile aujourd'hui, même si c'est simple. Demain, tu en sauras davantage.",
    "Ton clavier donne une forme aux idées. Écris avec confiance, corrige les erreurs et profite du parcours.",
    "Chaque développeur a commencé par une seule ligne. Continue à pratiquer sans perdre ta curiosité.",
    "Quelques minutes de concentration peuvent transformer une journée ordinaire en belle réussite.",
    "Laisse la curiosité guider ton apprentissage et la patience t'aider dans les moments difficiles."
  ]
};
const ZEN_HINT = {
  en:"Take a moment. Write a story, a thought, or anything you feel like.",
  fr:"Prends ton temps. Écris une histoire, une idée ou simplement ce qui te passe par la tête."
};

function safeGet(key,defaultValue="") {
  try{return localStorage.getItem(key)??defaultValue}catch(_){return defaultValue}
}
function safeSet(key,val) {
  try{localStorage.setItem(key,val);return true}catch(_){return false}
}
function readJSON(key,fallback) {
  try{return JSON.parse(safeGet(key,JSON.stringify(fallback)))??fallback}catch(_){return fallback}
}
const settings=readJSON(SETTINGS,{});
const game={
  mode:MODES[settings.mode]?settings.mode:"time",
  duration:[15,30,60,120].includes(Number(settings.duration))?Number(settings.duration):30,
  language:["en","fr"].includes(settings.language)?settings.language:"en",
  phase:"setup",prompt:"",lastPrompt:"",startAt:null,elapsed:0,ticker:null,
  value:"",correct:0,incorrect:0,keystrokes:0,mistyped:0,spans:[],lastDisplayed:"",
  screen:"setup",finished:false
};

function formatTimer(seconds) {
  const n=Math.max(0,Math.ceil(seconds));
  return String(Math.floor(n/60)).padStart(2,"0")+":"+String(n%60).padStart(2,"0");
}
function selectSettings() {
  els.modes.forEach(el=>{
    const selected=el.dataset.mode===game.mode;
    el.classList.toggle("is-selected",selected);
    el.setAttribute("aria-pressed",String(selected));
  });
  els.durations.forEach(el=>{
    const selected=Number(el.dataset.duration)===game.duration;
    el.classList.toggle("is-selected",selected);
    el.setAttribute("aria-pressed",String(selected));
  });
  els.languages.forEach(el=>{
    const selected=el.dataset.language===game.language;
    el.classList.toggle("is-selected",selected);
    el.setAttribute("aria-pressed",String(selected));
  });
  els.timeConfig.hidden=game.mode!=="time";
  safeSet(SETTINGS,JSON.stringify({mode:game.mode,duration:game.duration,language:game.language}));
}
function toast(message) {
  els.toast.textContent=message;
  els.toast.hidden=false;
  clearTimeout(toast.pending);
  toast.pending=setTimeout(()=>{els.toast.hidden=true},2800);
}
function showScreen(name) {
  game.screen=name;
  els.setup.hidden=name!=="setup";
  els.play.hidden=name!=="play";
  els.results.hidden=name!=="results";
  els.home.hidden=name==="setup";
  if(name==="setup")renderHistory();
  window.scrollTo?.({top:0,behavior:"instant"});
}
function shuffled(list) {
  const copy=[...list];
  for(let i=copy.length-1;i>0;i--){
    const index=Math.floor(Math.random()*(i+1));
    [copy[i],copy[index]]=[copy[index],copy[i]];
  }
  return copy;
}
function getPrompt() {
  const list=game.mode==="quote"?QUOTES[game.language]:LINES[game.language];
  if(game.mode==="zen")return "";
  if(game.mode==="quote"){
    const alternatives=list.filter(line=>line!==game.lastPrompt);
    const source=alternatives.length?alternatives:list;
    return source[Math.floor(Math.random()*source.length)];
  }
  // Long-enough stream for fast typists even during the two-minute test.
  let text="";
  while(text.length<2900)text+=shuffled(list).join(" ")+" ";
  return text.trimEnd();
}
function stopClock(){
  if(game.ticker!==null)clearInterval(game.ticker);
  game.ticker=null;
}
function secondsElapsed() {
  return game.startAt !== null ? Math.max(0,(performance.now()-game.startAt)/1000) : 0;
}
function startClock() {
  if(game.phase!=="ready")return;
  game.phase="typing";
  game.startAt=performance.now();
  els.testState.textContent="In progress";
  stopClock();
  game.ticker=setInterval(()=>{
    if(game.phase!=="typing")return;
    const elapsed=secondsElapsed();
    game.elapsed=game.mode==="time"?Math.min(elapsed,game.duration):elapsed;
    updateStats();
    if(game.mode==="time"&&elapsed>=game.duration)finishRound("timeout");
  },100);
}
function countCorrect(text) {
  let count=0;
  const max=Math.min(text.length,game.prompt.length);
  for(let i=0;i<max;i++)if(text[i]===game.prompt[i])count++;
  return count;
}
function stats(){
  const elapsed=game.phase==="typing"?secondsElapsed():game.elapsed;
  const minutes=Math.max(elapsed,1)/60;
  const size=game.value.length;
  const correct=game.mode==="zen"?size:countCorrect(game.value);
  const remainingErrors=game.mode==="zen"?0:size-correct;
  const accuracy=game.mode==="zen"||size===0?100:Math.round(correct/size*100);
  const wpm=Math.round(correct/5/minutes);
  const raw=Math.round(size/5/minutes);
  return{correct,errors:remainingErrors,accuracy,wpm,raw,elapsed,size};
}
function updateStats() {
  const metrics=stats();
  game.correct=metrics.correct;game.incorrect=metrics.errors;
  els.wpm.textContent=String(metrics.wpm);
  els.accuracy.textContent=String(metrics.accuracy)+"%";
  els.errors.textContent=String(metrics.errors);
  els.timer.textContent=game.mode==="time"
    ?formatTimer(game.duration-(game.phase==="typing"?metrics.elapsed:game.elapsed))
    :formatTimer(metrics.elapsed);
  els.timer.classList.toggle("is-urgent",game.mode==="time"&&metrics.elapsed>=game.duration-10&&game.phase==="typing");
  let percent=0;
  if(game.mode==="time"){
    percent=game.phase==="typing"?Math.min(100,metrics.elapsed/game.duration*100):0;
    els.progressCaption.textContent=Math.floor(percent)+"% of time";
  }else if(game.mode==="quote"){
    percent=game.prompt.length?Math.min(100,game.value.length/game.prompt.length*100):0;
    els.progressCaption.textContent=Math.floor(percent)+"% of passage";
  }else{
    percent=0;
    els.progressCaption.textContent="Free practice · no limit";
  }
  els.progressFill.style.width=percent+"%";
  els.progressRail.setAttribute("aria-valuenow",String(Math.round(percent)));
  els.characters.textContent=game.value.length+" characters";
}
function renderPrompt() {
  const frag=document.createDocumentFragment();
  game.spans=[];
  for(const char of game.prompt){
    const span=document.createElement("span");
    span.className="char-pending";
    span.textContent=char;
    frag.appendChild(span);
    game.spans.push(span);
  }
  els.prompt.replaceChildren(frag);
  els.promptContainer.scrollTop=0;
  if(game.spans.length)game.spans[0].classList.add("char-caret");
}
function refreshPrompt(oldText,newText){
  if(game.mode==="zen")return;
  const start=(() => {
    const max=Math.min(oldText.length,newText.length);
    let n=0;while(n<max&&oldText[n]===newText[n])n++;return n;
  })();
  for(let i=start;i<Math.max(oldText.length,newText.length);i++){
    const span=game.spans[i];if(!span)break;
    span.className=i>=newText.length?"char-pending":(newText[i]===game.prompt[i]?"char-correct":"char-wrong");
  }
  const previous=game.spans[Math.min(oldText.length,game.spans.length-1)];
  if(previous)previous.classList.remove("char-caret");
  const next=game.spans[Math.min(newText.length,game.spans.length-1)];
  if(next){
    next.classList.add("char-caret");
    const panel=els.promptContainer;
    // Scroll just the text panel, never the whole page / mobile keyboard.
    const relativeTop=next.offsetTop-els.prompt.offsetTop;
    if(relativeTop>panel.scrollTop+panel.clientHeight-43 || relativeTop<panel.scrollTop+4)
      panel.scrollTop=Math.max(0,relativeTop-32);
  }
}
function resetRound(newText=true) {
  stopClock();
  game.phase="ready";game.startAt=null;game.elapsed=0;
  game.value="";game.correct=game.incorrect=game.keystrokes=game.mistyped=0;
  els.input.disabled=false;
  els.input.value="";
  if(game.mode!=="zen" && (newText||!game.prompt)){
    game.prompt=getPrompt();game.lastPrompt=game.prompt;
  }else if(game.mode==="zen")game.prompt="";
  els.input.maxLength=game.mode==="zen"?50000:game.prompt.length;
  els.input.placeholder=game.mode==="zen"
    ?"Write freely. Your ideas, your words, your pace…"
    :"Start typing the text shown above…";
  els.inputHint.textContent=game.mode==="zen"?"Free writing. No fixed passage.":"Type the passage above; mistakes highlight as you go.";
  els.promptContainer.hidden=game.mode==="zen";
  els.zenContainer.hidden=game.mode!=="zen";
  els.zenInspiration.textContent=ZEN_HINT[game.language];
  els.progressRail.hidden=game.mode==="zen";
  els.testTag.textContent=MODES[game.mode].tag+" / "+(game.language==="en"?"ENGLISH":"FRANÇAIS");
  els.playKicker.textContent=MODES[game.mode].tag;
  els.playTitle.textContent=MODES[game.mode].heading;
  els.instruction.textContent=MODES[game.mode].hint;
  els.timerLabel.textContent=game.mode==="time"?"Time left":game.mode==="quote"?"Elapsed":"Practice time";
  els.finish.textContent=game.mode==="zen"?"Finish practice →":"Finish test →";
  els.newText.hidden=game.mode==="zen";
  els.shortcut.textContent=game.mode==="quote"
    ?"Finish the entire passage perfectly to complete this challenge."
    :game.mode==="zen"?"Write at your own pace; end whenever you like."
    :"Timer begins only when you start typing.";
  if(game.mode!=="zen")renderPrompt();
  else{game.spans=[];els.prompt.replaceChildren();}
  els.testState.textContent="Ready when you are";
  updateStats();
  els.input.focus({preventScroll:true});
}
function begin(mode=game.mode){
  game.mode=mode;selectSettings();showScreen("play");resetRound(true);
}
function finishRound(reason) {
  if(game.phase==="done")return;
  if(game.phase==="ready"||game.value.length===0){
    toast("Type a little first to record your result.");
    return;
  }
  const elapsed=game.mode==="time"?Math.min(game.duration,secondsElapsed()):secondsElapsed();
  game.elapsed=Math.max(0,elapsed);
  game.phase="done";stopClock();
  els.input.disabled=true;
  const m=stats();
  const record={
    id:Date.now(),mode:game.mode,language:game.language,
    duration:game.mode==="time"?game.duration:null,
    wpm:m.wpm,raw:m.raw,accuracy:m.accuracy,errors:m.errors,
    mistyped:game.mistyped,correct:m.correct,chars:m.size,elapsed:Math.round(m.elapsed*10)/10,
    completed:reason==="completed"||reason==="timeout",
    at:new Date().toISOString()
  };
  const scores=readJSON(STORAGE,[]);
  const history=Array.isArray(scores)?scores.filter(item=>item&&item.mode):[];
  const previous=history.filter(s=>s.mode===record.mode && s.language===record.language &&
    s.duration===record.duration);
  const bestBefore=previous.reduce((max,s)=>Math.max(max,Number(s.wpm)||0),0);
  const personalBest=Math.max(bestBefore,record.wpm);
  const newBest=record.wpm>bestBefore && record.chars>=5;
  history.unshift(record);
  safeSet(STORAGE,JSON.stringify(history.slice(0,25)));
  els.resultWpm.textContent=String(record.wpm);
  els.resultRating.textContent=record.wpm>=80?"Lightning fast ⚡":
    record.wpm>=55?"Fast & focused":record.wpm>=35?"Great momentum":"Keep practicing";
  els.resultAccuracy.textContent=record.accuracy+"%";
  els.resultRaw.textContent=String(record.raw);
  els.resultErrors.textContent=String(record.mistyped);
  els.resultDuration.textContent=record.elapsed.toFixed(1)+"s";
  els.resultCorrect.textContent=String(record.correct);
  els.resultBest.textContent=personalBest+" WPM";
  els.resultRecord.textContent=newBest?"★ New personal best for this mode!":
    "Every session is progress. Keep building your rhythm.";
  const stateLabel=reason==="timeout"?"Time is up!":
    reason==="completed"?"Challenge completed!":"Practice complete.";
  els.resultSummary.textContent=stateLabel+" "+MODES[game.mode].name+" · "+
    (game.language==="en"?"English":"Français")+
    (game.mode==="time"?" · "+game.duration+"s":"");
  showScreen("results");
  els.resultRetry.focus({preventScroll:true});
}
function readInsertions(before,after){
  if(after.length<=before.length)return [];
  let left=0;
  while(left<before.length && before[left]===after[left])left++;
  let right=0;
  while(right<before.length-left && before[before.length-1-right]===after[after.length-1-right])right++;
  const inserted=after.slice(left,after.length-right);
  return[...inserted].map((ch,index)=>({character:ch,position:left+index}));
}
function handleInput(event) {
  if(game.phase==="done"||game.phase==="setup"||game.phase==="results")return;
  if(event?.isComposing)return; // Wait until the IME finishes before scoring.
  let value=els.input.value.replace(/\r\n?/g,"\n");
  if(game.mode!=="zen"&&value.length>game.prompt.length){
    value=value.slice(0,game.prompt.length);
    els.input.value=value;
  }
  if(game.phase==="ready" && value.length>0)startClock();
  const before=game.value;
  const added=readInsertions(before,value);
  game.keystrokes+=added.length;
  if(game.mode!=="zen"){
    game.mistyped+=added.filter(x=>x.character!==game.prompt[x.position]).length;
  }
  game.value=value;
  refreshPrompt(before,value);
  updateStats();
  if(game.mode==="quote"&&value===game.prompt&&value.length>0){
    finishRound("completed");
  }else if(game.mode==="time" && value.length===game.prompt.length){
    // A complete prompt is possible for exceptionally fast typists.
    finishRound("completed");
  }else if(game.mode==="quote"&&value.length===game.prompt.length){
    els.testState.textContent="Correct the highlighted characters to finish.";
  }
}
function renderHistory() {
  const history=readJSON(STORAGE,[]);
  els.history.replaceChildren();
  if(!Array.isArray(history)||!history.length){
    const p=document.createElement("p");p.className="history-empty";
    p.textContent="No sessions yet. Complete a challenge to see your progress here.";
    els.history.append(p);return;
  }
  const recent=history.filter(row=>row&&MODES[row.mode]).slice(0,6);
  if(!recent.length)return;
  const maxWpm=Math.max(40,...recent.map(x=>Number(x.wpm)||0));
  for(const run of recent){
    const row=document.createElement("div");row.className="history-row";
    const left=document.createElement("div");left.className="history-info";
    const name=document.createElement("strong");name.textContent=MODES[run.mode].name;
    const meta=document.createElement("span");meta.textContent=
      (run.language==="fr"?"Français":"English")+
      (run.mode==="time"?" · "+run.duration+"s":"")+" · "+
      new Date(run.at).toLocaleDateString();
    left.append(name,meta);
    const bar=document.createElement("div");bar.className="history-track";
    const fill=document.createElement("span");fill.style.width=Math.min(100,(Number(run.wpm)||0)/maxWpm*100)+"%";
    bar.append(fill);
    const figure=document.createElement("div");figure.className="history-number";
    const value=document.createElement("strong");value.textContent=String(run.wpm);
    const unit=document.createElement("span");unit.textContent="WPM";
    figure.append(value,unit);
    row.append(left,bar,figure);
    els.history.append(row);
  }
}
function goHome(){
  stopClock();game.phase="setup";game.startAt=null;game.elapsed=0;
  els.input.blur();
  selectSettings();showScreen("setup");
}
els.modes.forEach(btn=>btn.addEventListener("click",()=>{
  game.mode=btn.dataset.mode;selectSettings();
}));
els.durations.forEach(btn=>btn.addEventListener("click",()=>{
  game.duration=Number(btn.dataset.duration);selectSettings();
}));
els.languages.forEach(btn=>btn.addEventListener("click",()=>{
  game.language=btn.dataset.language;selectSettings();
}));
els.start.addEventListener("click",()=>begin());
els.home.addEventListener("click",goHome);
els.resultHome.addEventListener("click",goHome);
els.resultRetry.addEventListener("click",()=>begin());
els.restart.addEventListener("click",()=>{resetRound(false);toast("Test restarted.");});
els.newText.addEventListener("click",()=>{resetRound(true);toast("New text ready.");});
els.finish.addEventListener("click",()=>finishRound("manual"));
els.input.addEventListener("input",handleInput);
els.input.addEventListener("compositionend",handleInput);
els.input.addEventListener("paste",event=>{
  event.preventDefault();toast("Paste is disabled during a typing test.");
});
els.input.addEventListener("drop",event=>event.preventDefault());
els.input.addEventListener("keydown",event=>{
  if(event.key==="Tab")return; // Preserve keyboard navigation.
  if(event.key==="Escape"){els.input.blur();}
});
window.addEventListener("pagehide",stopClock);
selectSettings();
renderHistory();
showScreen("setup");
})();