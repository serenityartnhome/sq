const { useState, useEffect } = React;

const STORAGE = "serenity-quest:v1";

let _cursorStyleEl = null;
function applyCursor(name){
  if(!_cursorStyleEl){
    _cursorStyleEl = document.createElement("style");
    _cursorStyleEl.id = "sq-cursor-style";
    document.head.appendChild(_cursorStyleEl);
  }
  if(!name){
    _cursorStyleEl.textContent = "";
    return;
  }
  _cursorStyleEl.textContent = `
    * { cursor: url(assets/${name}.png?v=4) 0 0, auto !important; }
    a, button, [role="button"], label, select,
    input[type="checkbox"], input[type="radio"],
    .rail-btn, .chip, .habit-card, .power,
    .cursor-pick-btn, .btn-primary, .add-custom,
    .diary-btn, .pu-pick-btn, .pu-icon-btn,
    .intention-side-box, .check {
      cursor: url(assets/cursor-pointer.png?v=5) 0 0, pointer !important;
    }
  `;
}

function load(){
  try { const s = localStorage.getItem(STORAGE); return s ? JSON.parse(s) : null; } catch { return null; }
}
function save(s){ try{ localStorage.setItem(STORAGE, JSON.stringify(s)); }catch{} }

function App(){
  const [saved, setSaved] = useState(()=>load());
  const [tweaks, setTweaks] = useState(()=>({
    palette: window.__SQ_DEFAULTS.palette,
    petMood: window.__SQ_DEFAULTS.petMood,
    showLanterns: window.__SQ_DEFAULTS.showLanterns,
    glowIntensity: window.__SQ_DEFAULTS.glowIntensity,
  }));
  const [tweaksOpen, setTweaksOpen] = useState(false);

  // apply palette/lantern/glow to body
  useEffect(()=>{
    document.body.dataset.palette    = tweaks.palette;
    document.body.dataset.lanterns   = tweaks.showLanterns ? "true":"false";
    document.documentElement.style.setProperty("--glow", tweaks.glowIntensity);
    window.__sqShowLanterns = tweaks.showLanterns;
  },[tweaks]);

  // apply saved cursor
  useEffect(()=>{
    const c = saved?.profile?.cursor;
    applyCursor(c || null);
  },[saved]);

  // edit mode host bridge
  useEffect(()=>{
    const onMsg = (e) => {
      const d = e.data;
      if(!d || typeof d !== "object") return;
      if(d.type === "__activate_edit_mode")   setTweaksOpen(true);
      if(d.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({type:"__edit_mode_available"}, "*");
    return ()=>window.removeEventListener("message", onMsg);
  },[]);

  const completeOnboarding = (data) => { save(data); setSaved(data); };
  const reset = () => {
    if(confirm("Start over? Your progress will be cleared.")){
      [STORAGE,"sq_streaks","sq_daily","sq_history","sq_custom_habits","sq_active_habits","sq_notes","sq_week_mon"].forEach(k=>localStorage.removeItem(k));
      setSaved(null);
    }
  };

  return (
    <>
      {!saved
        ? <Onboarding onComplete={completeOnboarding}/>
        : <Dashboard profile={saved.profile} habits={saved.habits} onReset={reset}/>
      }
      {tweaksOpen && <Tweaks state={tweaks} setState={setTweaks}/>}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
