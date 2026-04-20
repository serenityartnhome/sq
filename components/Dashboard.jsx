const INTENTIONS = ["Wealth","Peace","Confidence","Love","Health","Focus"];

const PRESET_HABITS = [
  { id:"water",    label:"Drink Water",      kind:"water",    preset:true },
  { id:"steps",    label:"10K Steps",        kind:"steps",    preset:true },
  { id:"protein",  label:"Protein Goal",     kind:"protein",  preset:true },
  { id:"sleep",    label:"Sleep 8h",         kind:"sleep",    preset:true },
  { id:"meditate", label:"Meditate",         kind:"meditate", preset:true },
  { id:"read",     label:"Read",             kind:"read",     preset:true },
  { id:"journal",  label:"Journal",          kind:"journal",  preset:true },
  { id:"workout",  label:"Workout",          kind:"workout",  preset:true },
  { id:"diet",     label:"Follow Diet",      kind:"diet",     preset:true },
  { id:"planning", label:"Planning",         kind:"planning", preset:true },
  { id:"focus",    label:"Focus",            kind:"focus",    preset:true },
  { id:"work",     label:"Work",             kind:"work",     preset:true },
  { id:"waking",   label:"Wake Early",       kind:"waking",   preset:true },
  { id:"goals",    label:"Goal-Setting",     kind:"goals",    preset:true },
  { id:"learning", label:"Learning",         kind:"learning", preset:true },
  { id:"network",  label:"Networking",       kind:"network",  preset:true },
  { id:"skills",   label:"Skill-Building",   kind:"skills",   preset:true },
  { id:"screen",   label:"Limit Screen Time",kind:"screen",   preset:true },
];
const POWERUPS = [
  { id:"sun",     name:"Sun Walk",    kind:"sun",     xp:10 },
  { id:"affirm",  name:"Affirmation", kind:"affirm",  xp:10 },
  { id:"nature",  name:"Nature Walk", kind:"nature",  xp:15 },
  { id:"bowl",    name:"Sound Bowl",  kind:"bowl",    xp:15 },
  { id:"lotus",   name:"Breath",      kind:"lotus",   xp:8  },
  { id:"selfaff", name:"Self-Love",   kind:"selfaff", xp:8  },
  { id:"tea",     name:"Herbal Tea",  kind:"tea",     xp:20 },
  { id:"treat",   name:"Cozy Treat",  kind:"treat",   xp:20 },
  { id:"bed",     name:"Make Bed",    kind:"bed",     xp:10 },
  { id:"declutter",name:"Declutter",  kind:"declutter",xp:15},
  { id:"clean",   name:"Clean",       kind:"clean",   xp:15 },
  { id:"charm",   name:"Energy Charm",kind:"charm",   xp:12 },
];
const BUBBLES = [
  "Let's align your energy today…",
  "What will we build together?",
  "I believe in you, tiny human ♡",
  "Small steps, great magic ✦",
  "The lanterns are lit for you tonight.",
];

function TopBarClock(){
  const fmt = () => {
    const n = new Date();
    const date = n.toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short"});
    const time = n.toLocaleTimeString("en-AU",{hour:"2-digit",minute:"2-digit"});
    return {date, time};
  };
  const [dt, setDt] = React.useState(fmt);
  React.useEffect(()=>{ const t=setInterval(()=>setDt(fmt()),1000); return()=>clearInterval(t); },[]);
  return (
    <div className="topbar-clock">
      <span className="topbar-date">{dt.date}</span>
      <span className="topbar-time">{dt.time}</span>
    </div>
  );
}

function Dashboard({ profile, habits, onReset }){
  const today = new Date().toISOString().slice(0,10);

  const [completed, setCompleted] = React.useState(()=>{
    try {
      const s = JSON.parse(localStorage.getItem("sq_daily")||"{}");
      if(s.date === today) return new Set(s.completed||[]);
    } catch{}
    return new Set();
  });
  const [streaks, setStreaks] = React.useState(()=>{
    try { return JSON.parse(localStorage.getItem("sq_streaks")||"{}"); } catch{ return {}; }
  });
  const [dayCompleted, setDayCompleted] = React.useState(()=>{
    try { return !!JSON.parse(localStorage.getItem("sq_history")||"{}")[today]; } catch{ return false; }
  });
  const [customHabits, setCustomHabits] = React.useState(()=>{
    try { return JSON.parse(localStorage.getItem("sq_custom_habits")||"[]"); } catch{ return []; }
  });
  const [activeHabitIds, setActiveHabitIds] = React.useState(()=>{
    try {
      const s = localStorage.getItem("sq_active_habits");
      return s ? JSON.parse(s) : habits.map(h=>h.id);
    } catch{ return habits.map(h=>h.id); }
  });
  const [showHabitPicker, setShowHabitPicker] = React.useState(false);
  const [newHabitName, setNewHabitName] = React.useState("");
  const [newHabitKind, setNewHabitKind] = React.useState("sparkle");

  const [gratitude, setGratitude] = React.useState(["","",""]);
  const [powerups, setPowerups]   = React.useState(()=>new Set());
  const [intention, setIntention] = React.useState(null);
  const [customIntent, setCustomIntent] = React.useState("");
  const [showCustomI, setShowCustomI] = React.useState(false);
  const [showIntentPicker, setShowIntentPicker] = React.useState(false);
  const [bubbleIdx, setBubbleIdx] = React.useState(0);
  const [celebrate, setCelebrate] = React.useState(false);
  const [showComingSoon, setShowComingSoon] = React.useState(false);
  const [showShopPrompt, setShowShopPrompt] = React.useState(false);
  const [tab, setTab] = React.useState("home");
  const [mood, setMood] = React.useState("calm");
  const [showDiary, setShowDiary] = React.useState(false);
  const [diaryEntry, setDiaryEntry] = React.useState("");
  const [diaryPhoto, setDiaryPhoto] = React.useState("");
  const diaryPhotoRef = React.useRef(null);

  const handleDiaryPhoto = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setDiaryPhoto(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  const [why, setWhy] = React.useState(profile.why||"");
  const [editingWhy, setEditingWhy] = React.useState(false);
  const [whyDraft, setWhyDraft] = React.useState(profile.why||"");

  const saveWhy = () => {
    const t = whyDraft.trim();
    setWhy(t);
    setEditingWhy(false);
    try {
      const key = "serenity-quest:v1";
      const s = JSON.parse(localStorage.getItem(key)||"{}");
      s.profile = {...s.profile, why:t};
      localStorage.setItem(key, JSON.stringify(s));
    } catch{}
  };
  const DEFAULT_ACTIVE = ["charm","sun","lotus","affirm"];
  const [activePowerupIds, setActivePowerupIds] = React.useState(()=>DEFAULT_ACTIVE);
  const [customPowerups, setCustomPowerups] = React.useState([]);
  const [showPowerupPicker, setShowPowerupPicker] = React.useState(false);
  const [newPuName, setNewPuName] = React.useState("");
  const [newPuXp,   setNewPuXp]   = React.useState(10);
  const [newPuKind, setNewPuKind] = React.useState("sparkle");
  const ALL_ICONS = ["affirm","bed","bowl","cake","charm","clean","declutter","diary",
    "diet","energy-heart","flame","focus","goals","heart","journal","learning","lotus","lotus-bud",
    "meditate","nature","network","planning","protein","read","screen","selfaff","skills",
    "sleep","sparkle","steps","sun","tea","treat","water","work","workout"];

  const animal = React.useMemo(()=>zodiacForBirthday(profile.bday), [profile.bday]);

  React.useEffect(()=>{
    const t = setInterval(()=>setBubbleIdx(i=>(i+1)%BUBBLES.length), 6500);
    return ()=>clearInterval(t);
  },[]);

  const allHabits = React.useMemo(()=>{
    // Merge presets with any icon customizations from onboarding, then add custom habits
    const onboardMap = Object.fromEntries(habits.map(h=>[h.id,h]));
    const presets = PRESET_HABITS.map(h => onboardMap[h.id] || h);
    return [...presets, ...customHabits];
  },[habits,customHabits]);
  const activeHabits = React.useMemo(()=>allHabits.filter(h=>activeHabitIds.includes(h.id)),[allHabits,activeHabitIds]);

  const toggleHabit = (id) => setCompleted(prev=>{
    const n=new Set(prev); n.has(id)?n.delete(id):n.add(id);
    localStorage.setItem("sq_daily", JSON.stringify({date:today, completed:[...n]}));
    return n;
  });
  const togglePower = (id) => setPowerups(prev=>{ const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
  const setGrat = (i,v) => setGratitude(g=>{ const n=[...g]; n[i]=v; return n; });

  const toggleActiveHabit = (id) => setActiveHabitIds(prev=>{
    const next = prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id];
    localStorage.setItem("sq_active_habits", JSON.stringify(next));
    return next;
  });
  const addCustomHabit = () => {
    const t = newHabitName.trim(); if(!t) return;
    const h = {id:"ch_"+Date.now(), label:t, kind:newHabitKind, custom:true};
    const next = [...customHabits, h];
    setCustomHabits(next);
    setActiveHabitIds(ids=>{ const n=[...ids,h.id]; localStorage.setItem("sq_active_habits",JSON.stringify(n)); return n; });
    localStorage.setItem("sq_custom_habits", JSON.stringify(next));
    setNewHabitName(""); setNewHabitKind("sparkle");
  };
  const removeCustomHabit = (id) => {
    const next = customHabits.filter(h=>h.id!==id);
    setCustomHabits(next);
    localStorage.setItem("sq_custom_habits", JSON.stringify(next));
    setActiveHabitIds(ids=>{ const n=ids.filter(x=>x!==id); localStorage.setItem("sq_active_habits",JSON.stringify(n)); return n; });
  };

  const completeDay = () => {
    const hist = JSON.parse(localStorage.getItem("sq_history")||"{}");
    const yd = new Date(); yd.setDate(yd.getDate()-1);
    const yesterdayKey = yd.toISOString().slice(0,10);
    const yesterdayCompleted = new Set(hist[yesterdayKey]?.completed||[]);

    const newStreaks = {};
    activeHabits.forEach(h=>{
      if(completed.has(h.id)){
        newStreaks[h.id] = yesterdayCompleted.has(h.id) ? (streaks[h.id]||0)+1 : 1;
      } else {
        newStreaks[h.id] = 0;
      }
    });
    setStreaks(newStreaks);
    setDayCompleted(true);
    localStorage.setItem("sq_streaks", JSON.stringify(newStreaks));
    localStorage.setItem("sq_daily", JSON.stringify({date:today, completed:[...completed]}));
    try {
      hist[today] = { mood, energy, completed:[...completed], powerups:[...powerups], gratitude, diary:diaryEntry, photo:diaryPhoto };
      localStorage.setItem("sq_history", JSON.stringify(hist));
    } catch{}
    setCelebrate(true);
  };

  const gratitudeDone = gratitude.some(x=>x.trim().length>0);
  const writingDone   = gratitudeDone || diaryEntry.trim().length > 0;
  const powerDone     = powerups.size > 0;
  const habitsDone    = activeHabits.filter(h=>completed.has(h.id)).length;
  const totalSlots = activeHabits.length + 2;
  const doneCount  = habitsDone + (writingDone?1:0) + (powerDone?1:0);
  const canComplete = doneCount >= 3;
  const energy = Math.min(100, doneCount * Math.ceil(100 / Math.max(totalSlots, 1)));
  const happyMood = doneCount>=3;

  const addCustomIntent = () => {
    const t = customIntent.trim();
    if(!t) return;
    setIntention(t); setCustomIntent(""); setShowCustomI(false); setShowIntentPicker(false);
  };
  const selectIntention = (v) => { setIntention(v); setShowIntentPicker(false); setShowCustomI(false); };

  return (
    <React.Fragment>
      {/* Sticky header: topbar + nav rail — outside scroll container */}
      <div className="nav-header">
      <div className="top-bar">
        <div className="streak"><Icon name="flame" size={22}/> {(()=>{
          try {
            const hist = JSON.parse(localStorage.getItem("sq_history")||"{}");
            let count = 0;
            const d = new Date();
            while(true){
              const k = d.toISOString().slice(0,10);
              if(!hist[k]) break;
              count++;
              d.setDate(d.getDate()-1);
            }
            return count;
          } catch{ return 0; }
        })()} Days in Flow</div>
        <div className="title">
          <img src="assets/icon-512.png?v=1" alt="logo"
            style={{width:24,height:24,imageRendering:"pixelated",verticalAlign:"middle"}}/>
          Serenity Quest
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <TopBarClock/>
          <div className="avatar" title={profile.name}>
            <ZodiacPet animal={animal} mood={happyMood?"happy":mood} size={36}/>
          </div>
        </div>
      </div>

      {/* Nav rail inside sticky header */}
      <div className="rail">
        <button className={"rail-btn "+(tab==="home"?"active":"")} onClick={()=>setTab("home")}>
          <Icon name="home" size={54}/>Home
        </button>
        <button className={"rail-btn "+(tab==="calendar"?"active":"")} onClick={()=>setTab("calendar")}>
          <Icon name="calendar" size={54}/>Calendar
        </button>
        <button className="rail-btn rail-btn-locked" onClick={()=>setShowComingSoon(true)}>
          <div style={{position:"relative",display:"inline-block"}}>
            <Icon name="zodiac" size={54}/>
            <span className="rail-lock-badge">🔒</span>
          </div>
          Zodiac
        </button>
        <button className={"rail-btn "+(tab==="shop"?"active":"")} onClick={()=>setShowShopPrompt(true)}>
          <Icon name="shop" size={54}/>Shop
        </button>
        <button className="rail-btn" onClick={onReset} title="Start over" style={{opacity:.75}}>
          <span style={{fontSize:36,lineHeight:1,color:"var(--plum)"}}>↺</span>Reset
        </button>
      </div>
      </div>{/* end nav-header */}

      <div className="app-shell">
      <div className={"scene-img "+(tab==="calendar"?"scene-calendar":"scene-dashboard")}/>
      <div className="scene-veil"/>

      {tab === "calendar" && <CalendarView habits={activeHabits} powerups={[...POWERUPS,...customPowerups]}
        todayLive={{mood, energy, completed:[...completed], gratitude, diary:diaryEntry, powerups:[...powerups]}}/>}

      <div className="dash-grid-4" style={{display: tab==="calendar"?"none":"grid"}}>

        {/* TOP LEFT: Zodiac + Intention — no frame */}
        <div className="dash-zodiac-panel">

          {/* Single col: Intention at top, then centered pet */}
          <div className="zodiac-pet-col">
            {/* Top spacer — pushes intention + monkey down to center */}
            <div style={{flex:1}}/>
            {/* Today's Intention sits above the monkey */}
            <div className="intention-side-box" onClick={()=>setShowIntentPicker(v=>!v)}>
              <div className="intention-side-label">Today's Intention</div>
              <div className={"intention-side-word"+(intention?"":" unset")}>
                {intention || "Set intention"}
              </div>
              {showIntentPicker && (
                <div className="intention-picker-popup" onClick={e=>e.stopPropagation()}>
                  {INTENTIONS.map(v=>(
                    <button key={v} className={"chip "+(intention===v?"active":"")}
                      onClick={()=>selectIntention(v)}>{v}</button>
                  ))}
                  {!showCustomI ? (
                    <button className="chip" onClick={()=>setShowCustomI(true)}>+ Custom</button>
                  ) : (
                    <span style={{display:"inline-flex",gap:4,alignItems:"center",marginTop:4}}>
                      <input autoFocus value={customIntent} onChange={e=>setCustomIntent(e.target.value)}
                        onKeyDown={e=>{if(e.key==="Enter")addCustomIntent(); if(e.key==="Escape"){setShowCustomI(false);setCustomIntent("")}}}
                        placeholder="My intention…" maxLength={40}
                        style={{background:"var(--cream)",border:"2px solid var(--rose)",padding:"4px 8px",
                                font:"inherit",fontFamily:"Pixelify Sans, monospace",fontSize:12,outline:"none",width:140}}/>
                      <button className="chip active" onClick={addCustomIntent}>✓</button>
                    </span>
                  )}
                </div>
              )}
            </div>
            <div style={{display:"flex",justifyContent:"center",marginBottom:4,marginTop:20}}>
              <div className="bubble" key={bubbleIdx}>{BUBBLES[bubbleIdx]}</div>
            </div>
            <div className="pet-cloud-stage">
              <div className="pet-on-cloud">
                <ZodiacPet animal={animal} mood={happyMood?"happy":mood} happy={happyMood} size={Math.round(Math.min(160, window.innerHeight*0.17))}/>
              </div>
              <img src="assets/cloud.png" alt="" className="pet-cloud"
                   style={{width:"min(360px,100%)"}} aria-hidden="true"/>
            </div>
            <div style={{textAlign:"center",fontFamily:"Silkscreen, monospace",
                         color:"#fff",fontSize:14,marginTop:5,textTransform:"uppercase",letterSpacing:".05em",
                         textShadow:"2px 2px 0 rgba(0,0,0,.6)"}}>
              Hello, {profile.name} ✦
            </div>
            {/* Bottom spacer — equal to top spacer, keeps content centered */}
            <div style={{flex:1}}/>
            {/* Energy bar pinned to bottom */}
            <div className="pet-energy-bar">
              <div className="pet-energy-header">
                <Icon name="energy-heart" size={15}/>
                <span className="pet-energy-label">Energy</span>
                <span className="pet-energy-pct">{energy}%</span>
              </div>
              <div className="pet-energy-track">
                <div style={{width:`${energy}%`}}/>
                <span className="pet-energy-bar-txt">{energy < 50 ? "" : ""}</span>
              </div>
            </div>
          </div>
        </div>


        {/* RIGHT: Daily Quest — spans both rows, complete button pinned to bottom */}
        <div className="panel dash-quest-panel">
          <h2 style={{textAlign:"center",fontSize:20,marginBottom:8}}>✦ Daily Quest ✦</h2>

          {/* Why section */}
          <div className="why-box">
            {editingWhy ? (
              <div className="why-edit-row">
                <textarea className="why-textarea" autoFocus value={whyDraft}
                  onChange={e=>setWhyDraft(e.target.value.slice(0,150))}
                  onKeyDown={e=>{if(e.key==="Escape") setEditingWhy(false);}}
                  placeholder="Why are you on this quest?"/>
                <div className="why-edit-btns">
                  <button className="chip active" onClick={saveWhy}>Save</button>
                  <button className="chip" onClick={()=>setEditingWhy(false)}>✕</button>
                </div>
              </div>
            ) : (
              <div className="why-display" onClick={()=>{setWhyDraft(why);setEditingWhy(true);}}>
                <span className="why-label">My Why</span>
                <span className="why-text">{why || "Tap to add your why…"}</span>
                <span className="why-edit-icon">✎</span>
              </div>
            )}
          </div>

          <div>
            {activeHabits.map(h=>(
              <label key={h.id} className={"check "+(completed.has(h.id)?"done":"")}>
                <input type="checkbox" style={{display:"none"}}
                  checked={completed.has(h.id)} onChange={()=>toggleHabit(h.id)}/>
                <span className="box"/>
                <HabitIcon kind={h.kind} size={22}/>
                <span className="lbl">{h.label}</span>
                {(()=>{
                  const base = streaks[h.id]||0;
                  const live = (!dayCompleted && completed.has(h.id) && base > 0) ? base+1 : base;
                  return live > 0 ? <span className="habit-streak"><Icon name="flame" size={13}/>{live}</span> : null;
                })()}
              </label>
            ))}
            <label className={"check "+(writingDone?"done":"")} onClick={(e)=>e.preventDefault()}>
              <span className="box"/>
              <Icon name="journal" size={22}/>
              <span className="lbl">Write gratitude or Journal</span>
            </label>
            <label className={"check "+(powerDone?"done":"")} onClick={(e)=>e.preventDefault()}>
              <span className="box"/>
              <Icon name="sparkle" size={22}/>
              <span className="lbl">Choose a power-up</span>
            </label>
            <button className="check habit-edit-tile" onClick={()=>setShowHabitPicker(v=>!v)}>
              <span style={{fontSize:18}}>✎</span>
              <span className="lbl" style={{flex:"unset"}}>Edit Habits</span>
            </button>
          </div>

          {showHabitPicker && (
            <div className="pu-picker-panel">
              <div className="pu-picker-title">Your Habits</div>
              <div className="pu-picker-grid">
                {allHabits.map(h=>{
                  const on = activeHabitIds.includes(h.id);
                  return (
                    <button key={h.id} className={"pu-pick-btn "+(on?"on":"")}
                      onClick={()=>toggleActiveHabit(h.id)}>
                      <HabitIcon kind={h.kind||"sparkle"} size={30}/>
                      <span>{h.label}</span>
                      {h.custom && <span className="pu-remove" onClick={e=>{e.stopPropagation();removeCustomHabit(h.id);}}>✕</span>}
                    </button>
                  );
                })}
              </div>
              <div className="pu-custom-form">
                <div className="pu-custom-title">✦ Add Custom Habit</div>
                <div className="pu-custom-row">
                  <input value={newHabitName} onChange={e=>setNewHabitName(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&addCustomHabit()}
                    placeholder="Habit name…" maxLength={24} className="pu-add-input" style={{flex:1}}/>
                </div>
                <div className="pu-icon-grid">
                  {ALL_ICONS.map(ic=>(
                    <button key={ic} className={"pu-icon-btn"+(newHabitKind===ic?" on":"")}
                      onClick={()=>setNewHabitKind(ic)} title={ic}>
                      <img src={`assets/icon-${ic}.png?v=5`} alt={ic} style={{width:20,height:20,imageRendering:"pixelated"}}/>
                    </button>
                  ))}
                </div>
                <button className="pu-add-btn" disabled={!newHabitName.trim()} onClick={addCustomHabit}>+ Add Habit</button>
              </div>
            </div>
          )}

          <div className="progress-label">
            Complete <b>{doneCount} / {totalSlots}</b> &nbsp;•&nbsp; {canComplete ? "ready to seal the day" : `${3-doneCount} more to unlock`}
          </div>

          {/* Spacer pushes power-ups to the bottom */}
          <div style={{flex:1,minHeight:0}}/>

          <h2 style={{textAlign:"center",fontSize:18,marginBottom:8,marginTop:4,
                     fontFamily:"Silkscreen, monospace",color:"var(--plum)",
                     textTransform:"uppercase",letterSpacing:".05em",
                     display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Icon name="sparkle" size={18}/>Boost Your Energy with Power-Ups<Icon name="sparkle" size={18}/>
          </h2>

          {showPowerupPicker && (
            <div className="pu-picker-panel">
              <div className="pu-picker-title">Choose your power-ups</div>
              <div className="pu-picker-grid">
                {[...POWERUPS, ...customPowerups].map(p=>{
                  const on = activePowerupIds.includes(p.id);
                  return (
                    <button key={p.id}
                      className={"pu-pick-btn "+(on?"on":"")}
                      onClick={()=>setActivePowerupIds(ids=>
                        on ? ids.filter(x=>x!==p.id) : [...ids, p.id]
                      )}>
                      <HabitIcon kind={p.kind||"sparkle"} size={20}/>
                      <span>{p.name}</span>
                      {p.custom && <span className="pu-remove" onClick={e=>{e.stopPropagation();setCustomPowerups(cs=>cs.filter(c=>c.id!==p.id));setActivePowerupIds(ids=>ids.filter(x=>x!==p.id));}}>✕</span>}
                    </button>
                  );
                })}
              </div>
              <div className="pu-custom-form">
                <div className="pu-custom-title">✦ Create Custom</div>
                <div className="pu-custom-row">
                  <input value={newPuName} onChange={e=>setNewPuName(e.target.value)}
                    placeholder="Name…" maxLength={20} className="pu-add-input" style={{flex:1}}/>
                  <label className="pu-xp-label">XP
                    <input type="number" min={1} max={99} value={newPuXp}
                      onChange={e=>setNewPuXp(Math.max(1,Math.min(99,Number(e.target.value)||1)))}
                      className="pu-xp-input"/>
                  </label>
                </div>
                <div className="pu-icon-grid">
                  {ALL_ICONS.map(ic=>(
                    <button key={ic} className={"pu-icon-btn"+(newPuKind===ic?" on":"")}
                      onClick={()=>setNewPuKind(ic)} title={ic}>
                      <img src={`assets/icon-${ic}.png?v=5`} alt={ic}
                           style={{width:20,height:20,imageRendering:"pixelated"}}/>
                    </button>
                  ))}
                </div>
                <button className="pu-add-btn" disabled={!newPuName.trim()}
                  onClick={()=>{
                    const id="custom-"+Date.now();
                    const p={id,name:newPuName.trim(),kind:newPuKind,xp:newPuXp,custom:true};
                    setCustomPowerups(cs=>[...cs,p]);
                    setActivePowerupIds(ids=>[...ids,id]);
                    setNewPuName(""); setNewPuXp(10); setNewPuKind("sparkle");
                  }}>+ Add Power-Up</button>
              </div>
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {[...POWERUPS,...customPowerups].filter(p=>activePowerupIds.includes(p.id)).map(p=>(
              <button key={p.id} className={"power "+(powerups.has(p.id)?"active":"")}
                      onClick={()=>togglePower(p.id)}>
                <HabitIcon kind={p.kind||"sparkle"} size={32}/>
                <span className="name">{p.name}</span>
                <span className="xp">+{p.xp} XP</span>
              </button>
            ))}
            <button className="power pu-edit-tile" onClick={()=>setShowPowerupPicker(v=>!v)}>
              <span style={{fontSize:22,lineHeight:1}}>✎</span>
              <span className="name">Edit</span>
            </button>
          </div>

          <div style={{marginTop:"auto",paddingTop:10,flexShrink:0}}>
            <button className="btn-primary" disabled={!canComplete}
                    onClick={completeDay} style={{width:"100%"}}>
              Complete Today <Icon name="sparkle" size={16}/>
            </button>
          </div>
        </div>

        {/* BOTTOM LEFT: Emotions + Gratitude / Diary */}
        <div className="panel emotions-panel">
          {showDiary ? (
            <div className="diary-view">
              <div className="diary-header">
                <button className="diary-back-btn" onClick={()=>setShowDiary(false)}>← Back</button>
                <div style={{flex:1,textAlign:"center",fontFamily:"Silkscreen, monospace",
                             fontSize:18,color:"var(--plum)",textTransform:"uppercase",
                             letterSpacing:".05em",display:"flex",alignItems:"center",
                             justifyContent:"center",gap:8}}>
                  <Icon name="sparkle" size={16}/>My Diary<Icon name="sparkle" size={16}/>
                </div>
              </div>
              <div className="diary-body">
                <input type="file" accept="image/*" ref={diaryPhotoRef}
                  style={{display:"none"}} onChange={handleDiaryPhoto}/>
                <textarea
                  className="diary-textarea"
                  value={diaryEntry}
                  onChange={e=>setDiaryEntry(e.target.value)}
                  placeholder="Write your thoughts here… today was…"
                  style={diaryPhoto ? {paddingRight:"calc(50% + 16px)"} : {}}
                />
                {diaryPhoto ? (
                  <div className="diary-photo-preview">
                    <img src={diaryPhoto} alt="diary photo" className="diary-photo-img"/>
                    <button className="diary-photo-remove" title="Remove photo" onClick={()=>setDiaryPhoto("")}>✕</button>
                  </div>
                ) : (
                  <button className="diary-photo-add" title="Add a memory" onClick={()=>diaryPhotoRef.current.click()}>
                    <img src="assets/icon-camera.png" alt="camera"
                      style={{width:64,height:64,imageRendering:"pixelated",display:"block"}}
                      onError={e=>{e.currentTarget.replaceWith(Object.assign(document.createElement("span"),{textContent:"📷",style:"font-size:28px"}));}}/>
                    <span className="diary-photo-lbl">Add a memory</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Top half: How are you feeling */}
              <div className="emotions-half">
                <div className="div-sparkle emotions-heading" style={{marginTop:0}}>✦ How Are You Feeling Today? ✦</div>
                <MoodPicker value={mood} onChange={setMood}/>
              </div>

              {/* Bottom half: Grateful (left) + Diary fills full height (right) */}
              <div className="emotions-half grat-half">
                <div className="div-sparkle emotions-heading grat-heading-full" style={{marginTop:0,marginBottom:"clamp(2px,0.8vh,8px)"}}>✦ What Are You Grateful For? ✦</div>
                <div className="grat-body-row">
                  <div className="grat-inputs">
                    <div className="grat-rows-fill">
                      {[0,1,2].map(i=>(
                        <div className="grat-row" key={i}>
                          <span className="num">{i+1}.</span>
                          <input value={gratitude[i]} onChange={e=>setGrat(i,e.target.value)}
                            placeholder={i===0?"e.g. morning sunlight":i===1?"e.g. a kind word":"e.g. a warm cup of tea"}
                            className={gratitude[i].trim()?"filled":""} maxLength={80}/>
                        </div>
                      ))}
                    </div>
                    <div style={{fontSize:10,color:"var(--plum-soft)",textAlign:"center",marginTop:"clamp(1px,0.4vh,4px)",
                                 fontFamily:"Silkscreen, monospace",textTransform:"uppercase",flexShrink:1,overflow:"hidden",whiteSpace:"nowrap"}}>
                      {gratitudeDone ? "✓ Gratitude counted" : "Fill at least one"}
                    </div>
                  </div>
                  <div className="diary-col">
                    <button className="diary-btn" onClick={()=>setShowDiary(true)}>
                      <img src="assets/icon-diary.png" onError={e=>{e.target.src="assets/icon-journal.png"}}
                           className="diary-icon" alt="diary"/>
                    </button>
                    <span className="diary-label">Write in<br/>my Journal</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showShopPrompt && (
        <div className="coming-soon-overlay" onClick={()=>setShowShopPrompt(false)}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()}>
            <div className="coming-soon-lock"><Icon name="shop" size={40}/></div>
            <h3 className="coming-soon-title">Visit Our Shop</h3>
            <p className="coming-soon-body">You're about to leave Serenity Quest<br/>and visit our online store.</p>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              <button className="coming-soon-btn" onClick={()=>{ window.open("https://www.serenityartnhome.com/","_blank"); setShowShopPrompt(false); }}>
                Visit Shop ✦
              </button>
              <button className="coming-soon-btn" style={{background:"var(--cream)",color:"var(--plum)",borderColor:"var(--gold)"}}
                onClick={()=>setShowShopPrompt(false)}>
                Stay Here
              </button>
            </div>
          </div>
        </div>
      )}

      {showComingSoon && (
        <div className="coming-soon-overlay" onClick={()=>setShowComingSoon(false)}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()}>
            <div className="coming-soon-lock">🔒</div>
            <h3 className="coming-soon-title">Coming Soon</h3>
            <p className="coming-soon-body">Zodiac features are on their way.<br/>Stay tuned, adventurer!</p>
            <button className="coming-soon-btn" onClick={()=>setShowComingSoon(false)}>Got it ✦</button>
          </div>
        </div>
      )}

      {celebrate && (
        <div className="celebrate" onClick={()=>setCelebrate(false)}>
          <div className="card" onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"center"}}>
              <ZodiacPet animal={animal} mood="excited" size={140}/>
            </div>
            <h3>Day Sealed ✦</h3>
            <p>
              +{Array.from(powerups).reduce((s,id)=>s+(POWERUPS.find(p=>p.id===id)?.xp||0),0) + doneCount*5} XP<br/>
              Your streak grows. The lanterns burn brighter tonight.
            </p>
            <button className="btn-primary" onClick={()=>setCelebrate(false)}>See You Tomorrow ✦</button>
          </div>
        </div>
      )}
      </div>{/* end app-shell */}
    </React.Fragment>
  );
}

window.Dashboard = Dashboard;
