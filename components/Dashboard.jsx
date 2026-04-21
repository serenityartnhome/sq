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

function Dashboard({ profile, habits, onReset, userId, isGuest, onSignOut, onUpdateProfile }){
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
  const [isHatching, setIsHatching] = React.useState(false);
  const [hatched, setHatched] = React.useState(()=>!!localStorage.getItem("sq_hatched"));
  const [justHatched, setJustHatched] = React.useState(false);
  const [diaryUnlocked, setDiaryUnlocked] = React.useState(()=>!!localStorage.getItem("sq_diary_unlocked"));
  const [photoUnlocked, setPhotoUnlocked] = React.useState(()=>!!localStorage.getItem("sq_photo_unlocked"));
  const [powerupsUnlocked, setPowerupsUnlocked] = React.useState(()=>!!localStorage.getItem("sq_powerups_unlocked"));
  const [showDiaryLocked, setShowDiaryLocked] = React.useState(false);
  const [showPhotoLocked, setShowPhotoLocked] = React.useState(false);
  const [showComingSoon, setShowComingSoon] = React.useState(false);
  const [showFriendsSoon, setShowFriendsSoon] = React.useState(false);
  const [showShopPrompt, setShowShopPrompt] = React.useState(false);
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [feedbackMsg, setFeedbackMsg] = React.useState("");
  const [feedbackStatus, setFeedbackStatus] = React.useState(null);
  const [tab, setTab] = React.useState("home");
  const [showSignOut, setShowSignOut] = React.useState(false);
  const [mood, setMood] = React.useState("neutral");
  const [celebrating, setCelebrating] = React.useState(false);
  const celebrateFlashTimer = React.useRef(null);
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

  const parseBday = (bday) => {
    if(!bday) return { d:"", m:"", y:"" };
    const [y,m,d] = bday.split("-");
    return { d: d ? String(parseInt(d)) : "", m: m ? String(parseInt(m)) : "", y: y||"" };
  };
  const [showProfileEdit, setShowProfileEdit] = React.useState(false);
  const [editName, setEditName]     = React.useState(profile.name||"");
  const [editLoc,  setEditLoc]      = React.useState(profile.loc||"");
  const [editBdayDay,   setEditBdayDay]   = React.useState(()=>parseBday(profile.bday).d);
  const [editBdayMonth, setEditBdayMonth] = React.useState(()=>parseBday(profile.bday).m);
  const [editBdayYear,  setEditBdayYear]  = React.useState(()=>parseBday(profile.bday).y);

  const saveProfileEdit = () => {
    const newBday = editBdayYear && editBdayMonth && editBdayDay
      ? `${editBdayYear}-${editBdayMonth.padStart(2,"0")}-${editBdayDay.padStart(2,"0")}` : profile.bday||"";
    const updates = { name: editName.trim()||profile.name, bday: newBday, loc: editLoc.trim() };
    try {
      const s = JSON.parse(localStorage.getItem("serenity-quest:v1")||"{}");
      s.profile = { ...s.profile, ...updates };
      localStorage.setItem("serenity-quest:v1", JSON.stringify(s));
    } catch{}
    if(userId && window.SB){
      window.SB.from("profiles").upsert({
        id: userId, name: updates.name, bday: updates.bday, loc: updates.loc,
        why: profile.why||"", cursor: profile.cursor||null, habits: habits||[]
      }).then(()=>{});
    }
    if(onUpdateProfile) onUpdateProfile(updates);
    setShowProfileEdit(false);
  };

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
  const [showPowerupSetup, setShowPowerupSetup] = React.useState(false);
  const [newPuName, setNewPuName] = React.useState("");
  const [newPuXp,   setNewPuXp]   = React.useState(10);
  const [newPuKind, setNewPuKind] = React.useState("sparkle");
  const ALL_ICONS = ["affirm","bed","bowl","cake","charm","clean","declutter","diary",
    "diet","energy-heart","flame","focus","goals","heart","journal","learning","lotus","lotus-bud",
    "meditate","nature","network","planning","protein","read","screen","selfaff","skills",
    "sleep","sparkle","steps","sun","tea","treat","water","work","workout"];

  const animal = React.useMemo(()=>zodiacForBirthday(profile.bday), [profile.bday]);

  const daysInFlow = React.useMemo(()=>{
    try {
      const hist = JSON.parse(localStorage.getItem("sq_history")||"{}");
      let count = 0; const d = new Date();
      while(true){
        const k = d.toISOString().slice(0,10);
        if(!hist[k] || !hist[k].done) break;
        count++; d.setDate(d.getDate()-1);
      }
      return count;
    } catch{ return 0; }
  }, [completed, powerups, gratitude, diaryEntry]);

  const [adultUnlocked, setAdultUnlocked] = React.useState(()=>!!localStorage.getItem("sq_adult"));
  const testStage = localStorage.getItem("sq_test_stage");
  const petStage = testStage || (adultUnlocked || daysInFlow >= 7 ? "adult" : (hatched || daysInFlow >= 3 ? "baby" : "egg"));
  const eggSrc = (m) => `assets/icon-egg-${m}.png?v=1`;

  const EGG_SOUNDS = [
    "...bloop?","mrrp.","skrrt","*knock knock*","pip.","...","bweh","eep!",
    "krrk","mlem","weh.","prrt","squeak?","bonk","glorp","hmph","nyeh",
    "*shuffles*","...tap tap","bibble","zzzt","moop","crkk","hewwo??",
  ];

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

  const flashHappy = () => {
    setCelebrating(true);
    if(celebrateFlashTimer.current) clearTimeout(celebrateFlashTimer.current);
    celebrateFlashTimer.current = setTimeout(()=>setCelebrating(doneCountRef.current >= 3), 800);
  };

  const toggleHabit = (id) => {
    flashHappy();
    setCompleted(prev=>{
      const n=new Set(prev); n.has(id)?n.delete(id):n.add(id);
      localStorage.setItem("sq_daily", JSON.stringify({date:today, completed:[...n]}));
      return n;
    });
  };
  const togglePower = (id) => { flashHappy(); setPowerups(prev=>{ const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; }); };
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

  const supabasePushTimer = React.useRef(null);

  // Auto-save to localStorage history on any activity change
  React.useEffect(()=>{
    try {
      const habitsDone = activeHabits.filter(h=>completed.has(h.id)).length;
      const wDone = gratitude.some(x=>x.trim()) || diaryEntry.trim().length > 0 ? 1 : 0;
      const pDone = powerups.size > 0 ? 1 : 0;
      const dc = habitsDone + wDone + pDone;
      const hist = JSON.parse(localStorage.getItem("sq_history")||"{}");
      hist[today] = { mood, energy, completed:[...completed], powerups:[...powerups], gratitude, diary:diaryEntry, photo:diaryPhoto, intention, done: dc >= 3 };
      localStorage.setItem("sq_history", JSON.stringify(hist));
      localStorage.setItem("sq_daily", JSON.stringify({date:today, completed:[...completed]}));
    } catch{}
  }, [completed, mood, gratitude, powerups, diaryEntry, intention, diaryPhoto]);

  // Debounced Supabase push
  React.useEffect(()=>{
    if(!userId || !window.SB) return;
    if(supabasePushTimer.current) clearTimeout(supabasePushTimer.current);
    supabasePushTimer.current = setTimeout(()=>{
      window.SB.from("daily_data").upsert({
        user_id:userId, date:today, mood, energy,
        completed:[...completed], powerups:[...powerups],
        gratitude, diary:diaryEntry
      }).then(()=>{});
    }, 3000);
    return ()=>{ if(supabasePushTimer.current) clearTimeout(supabasePushTimer.current); };
  }, [completed, mood, gratitude, powerups, diaryEntry]);

  // Recalculate habit streaks once per day on app open; sync with Supabase
  React.useEffect(()=>{
    const run = async () => {
      try {
        // If no local streaks, pull from Supabase first (new device / cleared storage)
        const localStreaksDate = localStorage.getItem("sq_streaks_date");
        if(!localStreaksDate && userId && window.SB){
          const { data } = await window.SB.from("profiles").select("streaks,streaks_date").eq("id",userId).single();
          if(data?.streaks && Object.keys(data.streaks).length > 0){
            setStreaks(data.streaks);
            localStorage.setItem("sq_streaks", JSON.stringify(data.streaks));
            localStorage.setItem("sq_streaks_date", data.streaks_date||"");
          }
        }

        if(localStorage.getItem("sq_streaks_date") === today) return;

        const hist = JSON.parse(localStorage.getItem("sq_history")||"{}");
        const yd = new Date(); yd.setDate(yd.getDate()-1);
        const yesterdayKey = yd.toISOString().slice(0,10);
        const yesterdayData = hist[yesterdayKey];
        const newStreaks = {};
        [...PRESET_HABITS, ...customHabits].forEach(h=>{
          if((yesterdayData?.completed||[]).includes(h.id)){
            let count = 0; const d = new Date(); d.setDate(d.getDate()-1);
            while(true){
              const k = d.toISOString().slice(0,10);
              if(!(hist[k]?.completed||[]).includes(h.id)) break;
              count++; d.setDate(d.getDate()-1);
            }
            newStreaks[h.id] = count;
          } else {
            newStreaks[h.id] = 0;
          }
        });
        setStreaks(newStreaks);
        localStorage.setItem("sq_streaks", JSON.stringify(newStreaks));
        localStorage.setItem("sq_streaks_date", today);

        // Save to Supabase profiles
        if(userId && window.SB){
          window.SB.from("profiles").update({ streaks: newStreaks, streaks_date: today }).eq("id", userId).then(()=>{});
        }
      } catch{}
    };
    run();
  }, []);

  // Unlock checks when daysInFlow changes
  React.useEffect(()=>{
    if(daysInFlow >= 2 && !localStorage.getItem("sq_powerups_unlocked")){ localStorage.setItem("sq_powerups_unlocked","1"); setPowerupsUnlocked(true); }
    if(daysInFlow >= 3 && !localStorage.getItem("sq_hatched")){ setTimeout(()=>setIsHatching(true), 400); }
    if(daysInFlow >= 5 && !localStorage.getItem("sq_diary_unlocked")){ localStorage.setItem("sq_diary_unlocked","1"); setDiaryUnlocked(true); }
    if(daysInFlow >= 7 && !localStorage.getItem("sq_adult")){ localStorage.setItem("sq_adult","1"); setAdultUnlocked(true); }
    if(daysInFlow >= 7 && !localStorage.getItem("sq_photo_unlocked")){ localStorage.setItem("sq_photo_unlocked","1"); setPhotoUnlocked(true); }
  }, [daysInFlow]);

  const [showGratShare, setShowGratShare] = React.useState(false);
  const [shareStatus, setShareStatus] = React.useState(null);

  const [shareError, setShareError] = React.useState("");
  const shareToWall = async (content) => {
    if(!userId || !window.SB || !content.trim()) return;
    setShareStatus("sharing"); setShareError("");
    try {
      const streak = (()=>{
        try {
          const hist = JSON.parse(localStorage.getItem("sq_history")||"{}");
          let count = 0;
          const d = new Date();
          d.setDate(d.getDate()-1); // start from yesterday — today is day 0
          while(true){
            const k = d.toISOString().slice(0,10);
            if(!hist[k]) break;
            count++;
            d.setDate(d.getDate()-1);
          }
          return count;
        } catch{ return 0; }
      })();
      const attempts = [
        { user_id: userId, display_name: profile.name||"Adventurer", content: content.trim(), loc: profile.loc||"", animal, streak },
        { user_id: userId, display_name: profile.name||"Adventurer", content: content.trim(), animal, streak },
        { user_id: userId, display_name: profile.name||"Adventurer", content: content.trim() },
      ];
      let lastErr = null;
      for(const row of attempts){
        const { error } = await window.SB.from("gratitude_posts").insert(row);
        if(!error){ setShareStatus("done"); setTimeout(()=>{ setShowGratShare(false); setShareStatus(null); setShareError(""); }, 1400); return; }
        lastErr = error;
      }
      setShareError(lastErr?.message||"Unknown error");
      setShareStatus("error");
    } catch(e) { setShareError(e?.message||"Unknown error"); setShareStatus("error"); }
  };

  const submitFeedback = async () => {
    if(!feedbackMsg.trim()) return;
    setFeedbackStatus("sending");
    try {
      const { error } = await window.SB.from("feedback").insert({
        user_id: userId||null,
        display_name: profile.name||"Adventurer",
        message: feedbackMsg.trim()
      });
      if(error) throw error;
      setFeedbackStatus("done");
      setFeedbackMsg("");
    } catch { setFeedbackStatus("error"); }
  };

  const gratitudeDone = gratitude.some(x=>x.trim().length>0);
  const writingDone   = gratitudeDone || diaryEntry.trim().length > 0;
  const powerDone     = powerups.size > 0;
  const habitsDone    = activeHabits.filter(h=>completed.has(h.id)).length;
  const totalSlots = activeHabits.length + 2;
  const doneCount  = habitsDone + (writingDone?1:0) + (powerDone?1:0);
  const doneCountRef = React.useRef(doneCount);
  doneCountRef.current = doneCount;
  const canComplete = doneCount >= 3;
  const energy = Math.min(100, doneCount * Math.ceil(100 / Math.max(totalSlots, 1)));

  // Baby stays happy while doneCount >= 3, returns to neutral if they untick below 3
  React.useEffect(()=>{
    if(doneCount >= 3){
      if(celebrateFlashTimer.current) clearTimeout(celebrateFlashTimer.current);
      setCelebrating(true);
      if(localStorage.getItem("sq_celebrated") !== today){
        localStorage.setItem("sq_celebrated", today);
        setTimeout(()=>setCelebrate(true), 800);
      }
    } else {
      setCelebrating(false);
    }
  }, [doneCount]);

  const addCustomIntent = () => {
    const t = customIntent.trim();
    if(!t) return;
    setIntention(t); setCustomIntent(""); setShowCustomI(false); setShowIntentPicker(false);
  };
  const selectIntention = (v) => { setIntention(v); setShowIntentPicker(false); setShowCustomI(false); };

  return (
    <div className="app-shell">
      <div className={"scene-img "+(tab==="calendar"?"scene-calendar":"scene-dashboard")}/>
      <div className="scene-veil"/>

      <div className="top-bar">
        <div className="streak"><Icon name="flame" size={22}/> {(()=>{
          try {
            const hist = JSON.parse(localStorage.getItem("sq_history")||"{}");
            let count = 0;
            const d = new Date();
            d.setDate(d.getDate()-1);
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
            {petStage==="adult"
              ? <ZodiacPet animal={animal} mood={celebrating?"happy":mood} size={36}/>
              : petStage==="baby"
              ? <BabyPet animal={animal} happy={celebrating} size={22}/>
              : <img src={eggSrc(mood)} style={{width:36,height:36,imageRendering:"pixelated"}} alt="egg"/>
            }
          </div>
        </div>
      </div>

      {/* Nav rail */}
      <div className="rail">
        <button className={"rail-btn "+(tab==="home"?"active":"")} onClick={()=>setTab("home")}>
          <Icon name="home" size={54}/>Home
        </button>
        <button className={"rail-btn "+(tab==="calendar"?"active":"")} onClick={()=>setTab("calendar")}>
          <Icon name="calendar" size={54}/>Calendar
        </button>
        <button className="rail-btn" style={{opacity:.85}} onClick={()=>setShowFriendsSoon(true)}>
          <div style={{position:"relative",display:"inline-block"}}>
            <Icon name="heart" size={54}/>
            <img src="assets/icon-lock.png?v=1" alt="locked"
              style={{position:"absolute",bottom:0,right:0,width:18,height:18,imageRendering:"pixelated",pointerEvents:"none"}}/>
          </div>
          Friends
        </button>
        <button className={"rail-btn "+(tab==="community"?"active":"")} onClick={()=>setTab("community")}>
          <img src="assets/icon-earth.png?v=1" width={54} height={54} style={{imageRendering:"pixelated"}} alt="community"/>Community
        </button>
        <button className="rail-btn" onClick={()=>setShowShopPrompt(true)}>
          <Icon name="shop" size={54}/>Shop
        </button>
      </div>


      {tab === "calendar" && <CalendarView habits={activeHabits} powerups={[...POWERUPS,...customPowerups]}
        todayLive={{mood, energy, completed:[...completed], gratitude, diary:diaryEntry, powerups:[...powerups]}}/>}

      {tab === "community" && (
        <div className="community-view">
          <CommunityBoard userId={userId} displayName={profile.name}/>
        </div>
      )}

      {showSignOut && (
        <div className="coming-soon-overlay" onClick={()=>setShowSignOut(false)}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()}>
            <h3 className="coming-soon-title">{isGuest ? "Guest Mode" : "Sign Out?"}</h3>
            <p className="coming-soon-body">
              {isGuest ? "You're browsing as a guest. Create an account to save your progress." : "Your progress is saved to your account."}
            </p>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              <button className="coming-soon-btn" onClick={onSignOut}>
                {isGuest ? "Go to Login" : "Sign Out ✦"}
              </button>
              <button className="coming-soon-btn" style={{background:"var(--cream)",color:"var(--plum)",borderColor:"var(--gold)"}}
                onClick={()=>setShowSignOut(false)}>Stay Here</button>
            </div>
          </div>
        </div>
      )}

      <div className="dash-grid-4" style={{display: (tab==="calendar"||tab==="community")?"none":"grid"}}>

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
              <div className="bubble" key={bubbleIdx}>
                {petStage==="adult" ? BUBBLES[bubbleIdx] : EGG_SOUNDS[bubbleIdx % EGG_SOUNDS.length]}
              </div>
            </div>
            <div className="pet-cloud-stage" onClick={()=>{
                setEditName(profile.name||"");
                setEditLoc(profile.loc||"");
                const bd = parseBday(profile.bday);
                setEditBdayDay(bd.d); setEditBdayMonth(bd.m); setEditBdayYear(bd.y);
                setShowProfileEdit(true);
              }} style={{cursor:"pointer"}} title="Edit your profile">
              <div className="pet-on-cloud">
                {(()=>{
                  const sz = Math.round(Math.min(160, window.innerHeight*0.17));
                  if(petStage==="adult" && !isHatching)
                    return <ZodiacPet animal={animal} mood={celebrating?"happy":mood} happy={celebrating} size={sz}/>;
                  if(petStage==="baby" && !isHatching)
                    return (
                      <div style={{position:"relative",display:"inline-block"}}>
                        {justHatched && <div className="hatch-flash"/>}
                        <BabyPet animal={animal} happy={celebrating} neglected={(()=>{ try{ const yd=new Date(); yd.setDate(yd.getDate()-1); const hist=JSON.parse(localStorage.getItem("sq_history")||"{}"); return hatched && !hist[yd.toISOString().slice(0,10)]?.done; }catch{return false;} })()}
                          size={Math.round(sz*0.3)}
                          className={justHatched?"baby-pop":""}/>
                      </div>
                    );
                  return <img src={eggSrc(mood)} alt="egg"
                    className={isHatching ? "egg-hatching" : "egg-idle"}
                    style={{width:sz,height:sz,imageRendering:"pixelated",display:"block"}}
                    onAnimationEnd={()=>{ if(isHatching){ localStorage.setItem("sq_hatched","1"); setHatched(true); setIsHatching(false); setJustHatched(true); setTimeout(()=>setJustHatched(false), 1000); } }}
                  />;
                })()}
              </div>
              <img src="assets/cloud.png" alt="" className="pet-cloud"
                   style={{width:"min(360px,100%)"}} aria-hidden="true"/>
            </div>
            <div style={{textAlign:"center",fontFamily:"Silkscreen, monospace",
                         color:"#fff",fontSize:14,marginTop:5,textTransform:"uppercase",letterSpacing:".05em",
                         textShadow:"2px 2px 0 rgba(0,0,0,.6)"}}>
              Hello, {profile.name} ✦
            </div>
            <div style={{textAlign:"center",fontSize:10,color:"rgba(255,255,255,.7)",
                         fontFamily:"Silkscreen,monospace",marginTop:2,letterSpacing:".04em"}}>
              ✎ tap pet to edit profile
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
                  return base > 0 ? <span className="habit-streak"><Icon name="flame" size={13}/>{base}</span> : null;
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

          <h2 style={{textAlign:"center",fontSize:18,marginBottom:2,marginTop:4,
                     fontFamily:"Silkscreen, monospace",color:"var(--plum)",
                     textTransform:"uppercase",letterSpacing:".05em",
                     display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Icon name="sparkle" size={18}/>Power-Ups<Icon name="sparkle" size={18}/>
          </h2>

          {(!powerupsUnlocked && daysInFlow < 2) ? (
            <>
              <button className="coming-soon-btn" style={{width:"100%",marginBottom:6}}
                onClick={()=>setShowPowerupSetup(v=>!v)}>
                {showPowerupSetup ? "Hide ✦" : "Set Up Power-Ups ✦"}
              </button>
              {showPowerupSetup && (
                <div className="pu-picker-panel" style={{marginBottom:0}}>
                  <p style={{textAlign:"center",fontSize:12,color:"var(--plum)",fontFamily:"Pixelify Sans,monospace",
                             lineHeight:1.6,marginBottom:10,marginTop:0}}>
                    Power-ups are the little things that give <em>you</em> energy — a walk, a cosy ritual, a moment of joy. Pick your favourites now and they'll activate tomorrow. ✦ You can change them any time.
                  </p>
                  <div className="pu-picker-grid">
                    {[...POWERUPS, ...customPowerups].map(p=>{
                      const on = activePowerupIds.includes(p.id);
                      return (
                        <button key={p.id} className={"pu-pick-btn "+(on?"on":"")}
                          onClick={()=>setActivePowerupIds(ids=> on ? ids.filter(x=>x!==p.id) : [...ids, p.id])}>
                          <HabitIcon kind={p.kind||"sparkle"} size={20}/>
                          <span>{p.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p style={{textAlign:"center",fontSize:10,color:"var(--rose)",fontFamily:"Silkscreen,monospace",
                             marginTop:8,marginBottom:0,textTransform:"uppercase",letterSpacing:".04em"}}>
                    ✦ Activates Day 2 ✦
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <p style={{textAlign:"center",fontSize:11,color:"var(--plum-soft)",fontFamily:"Pixelify Sans,monospace",
                         marginBottom:8,marginTop:0,lineHeight:1.5}}>
                Little rituals that raise your energy and earn bonus XP — personal to you.
              </p>
              {showPowerupPicker && (
                <div className="pu-picker-panel">
                  <div className="pu-picker-title">Choose your power-ups</div>
                  <div className="pu-picker-grid">
                    {[...POWERUPS, ...customPowerups].map(p=>{
                      const on = activePowerupIds.includes(p.id);
                      return (
                        <button key={p.id} className={"pu-pick-btn "+(on?"on":"")}
                          onClick={()=>setActivePowerupIds(ids=> on ? ids.filter(x=>x!==p.id) : [...ids, p.id])}>
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
                          <img src={`assets/icon-${ic}.png?v=5`} alt={ic} style={{width:20,height:20,imageRendering:"pixelated"}}/>
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
            </>
          )}

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
                  <button className="diary-photo-add" title={photoUnlocked||daysInFlow>=7?"Add a memory":"Unlocks Day 7"}
                    onClick={()=>{ if(photoUnlocked||daysInFlow>=7){ diaryPhotoRef.current.click(); } else { setShowPhotoLocked(true); } }}
                    style={!photoUnlocked&&daysInFlow<7?{opacity:.5,cursor:"default"}:{}}>
                    <div style={{position:"relative",display:"inline-block"}}>
                      <img src="assets/icon-camera.png" alt="camera"
                        style={{width:64,height:64,imageRendering:"pixelated",display:"block"}}
                        onError={e=>{e.currentTarget.replaceWith(Object.assign(document.createElement("span"),{textContent:"📷",style:"font-size:28px"}));}}/>
                      {!photoUnlocked && daysInFlow < 7 && (
                        <img src="assets/icon-lock.png?v=1" alt="locked"
                          style={{position:"absolute",bottom:0,right:0,width:18,height:18,imageRendering:"pixelated"}}/>
                      )}
                    </div>
                    <span className="diary-photo-lbl">{photoUnlocked||daysInFlow>=7?"Add a memory":"Unlocks Day 7"}</span>
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
                    {userId && gratitudeDone && (
                      <button className="grat-share-btn" onClick={()=>setShowGratShare(true)}>
                        ♥ Share to Wall
                      </button>
                    )}
                  </div>
                  <div className="diary-col">
                    <div style={{position:"relative",display:"inline-block"}}>
                      <button className="diary-btn" onClick={()=>diaryUnlocked||daysInFlow>=5?setShowDiary(true):setShowDiaryLocked(true)}>
                        <img src="assets/icon-diary.png" onError={e=>{e.target.src="assets/icon-journal.png"}}
                             className="diary-icon" alt="diary"
                             style={!diaryUnlocked&&daysInFlow<5?{opacity:.6,filter:"grayscale(40%)"}:{}}/>
                      </button>
                      {!diaryUnlocked && daysInFlow < 5 && (
                        <img src="assets/icon-lock.png?v=1" alt="locked"
                          style={{position:"absolute",top:0,right:0,width:18,height:18,
                                  imageRendering:"pixelated",pointerEvents:"none"}}/>
                      )}
                    </div>
                    <span className="diary-label">{diaryUnlocked||daysInFlow>=5?"Write in my Journal":"Unlocks Day 5"}</span>
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
            <p className="coming-soon-body">Discover feng shui treasures to elevate your space and energy.</p>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              <button className="coming-soon-btn" onClick={()=>{ window.open("https://www.serenityartnhome.com/","_blank"); setShowShopPrompt(false); }}>
                Visit Shop ✦
              </button>
              <button className="coming-soon-btn"
                style={{background:"var(--cream)",color:"var(--plum)",borderColor:"var(--rose)"}}
                onClick={()=>{ setShowShopPrompt(false); setFeedbackMsg(""); setFeedbackStatus(null); setShowFeedback(true); }}>
                Send us a Message
              </button>
              <button className="coming-soon-btn"
                style={{background:"var(--cream)",color:"var(--plum)",borderColor:"var(--gold)"}}
                onClick={()=>setShowShopPrompt(false)}>Stay Here</button>
            </div>
          </div>
        </div>
      )}

      {showFeedback && (
        <div className="coming-soon-overlay" onClick={()=>{ if(feedbackStatus!=="sending") setShowFeedback(false); }}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()} style={{maxWidth:360,width:"92%"}}>
            <div className="coming-soon-lock"><Icon name="sparkle" size={36}/></div>
            <h3 className="coming-soon-title">✦ Talk to Us ✦</h3>
            {feedbackStatus==="done" ? (
              <div style={{textAlign:"center",padding:"16px 0"}}>
                <div style={{fontSize:32,marginBottom:8}}>✦</div>
                <p className="coming-soon-body">Your message has been received.<br/>
                  <span style={{fontSize:12,color:"var(--jade-deep)"}}>We read every single one. Thank you! ♡</span>
                </p>
                <button className="coming-soon-btn" onClick={()=>setShowFeedback(false)}>Close ✦</button>
              </div>
            ) : (
              <>
                <p className="coming-soon-body" style={{marginBottom:10}}>
                  Have a question, idea, or just want to say hi?<br/>
                  <span style={{fontSize:11,color:"var(--plum-soft)"}}>We'd love to hear from you.</span>
                </p>
                <textarea
                  value={feedbackMsg}
                  onChange={e=>setFeedbackMsg(e.target.value.slice(0,500))}
                  placeholder="Write your message here…"
                  maxLength={500}
                  style={{width:"100%",minHeight:100,padding:"8px 10px",fontFamily:"Pixelify Sans,monospace",
                    fontSize:13,border:"2px solid var(--rose)",background:"var(--cream)",color:"var(--plum)",
                    resize:"none",outline:"none",boxSizing:"border-box",marginBottom:6}}
                />
                <div style={{fontSize:10,textAlign:"right",color:"var(--plum-soft)",fontFamily:"Silkscreen,monospace",marginBottom:10}}>
                  {feedbackMsg.length}/500
                </div>
                {feedbackStatus==="error" && (
                  <p style={{color:"var(--rose)",fontSize:11,textAlign:"center",marginBottom:8}}>
                    Something went wrong — please try again.
                  </p>
                )}
                <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                  <button className="coming-soon-btn"
                    disabled={!feedbackMsg.trim()||feedbackStatus==="sending"}
                    onClick={submitFeedback}>
                    {feedbackStatus==="sending" ? "Sending…" : "Send Message ✦"}
                  </button>
                  <button className="coming-soon-btn"
                    style={{background:"var(--cream)",color:"var(--plum)",borderColor:"var(--gold)"}}
                    onClick={()=>setShowFeedback(false)}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showPhotoLocked && (
        <div className="coming-soon-overlay" onClick={()=>setShowPhotoLocked(false)}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()}>
            <div className="coming-soon-lock">
              <img src="assets/icon-lock.png?v=1" style={{width:48,height:48,imageRendering:"pixelated"}} alt="locked"/>
            </div>
            <h3 className="coming-soon-title">Memory Photos Locked</h3>
            <p className="coming-soon-body">
              Complete 7 days in a row to add photos to your journal.<br/>
              <span style={{fontSize:13,color:"var(--jade-deep)"}}>
                You're on day {Math.max(daysInFlow,1)} — almost there! ✦
              </span>
            </p>
            <button className="coming-soon-btn" onClick={()=>setShowPhotoLocked(false)}>Got it ✦</button>
          </div>
        </div>
      )}

      {showDiaryLocked && (
        <div className="coming-soon-overlay" onClick={()=>setShowDiaryLocked(false)}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()}>
            <div className="coming-soon-lock">
              <img src="assets/icon-lock.png?v=1" style={{width:48,height:48,imageRendering:"pixelated"}} alt="locked"/>
            </div>
            <h3 className="coming-soon-title">Journal Locked</h3>
            <p className="coming-soon-body">
              Complete 5 days in a row to unlock your journal.<br/>
              <span style={{fontSize:13,color:"var(--jade-deep)"}}>
                You're on day {Math.max(daysInFlow,1)} — keep going! ✦
              </span>
            </p>
            <button className="coming-soon-btn" onClick={()=>setShowDiaryLocked(false)}>Got it ✦</button>
          </div>
        </div>
      )}

      {showFriendsSoon && (
        <div className="coming-soon-overlay" onClick={()=>setShowFriendsSoon(false)}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()} style={{maxWidth:340,textAlign:"center"}}>
            <div style={{marginBottom:8}}>
              <img src="assets/icon-lock.png?v=1" style={{width:48,height:48,imageRendering:"pixelated"}} alt=""/>
            </div>
            <h3 className="coming-soon-title">✦ Something is Coming ✦</h3>
            <p className="coming-soon-body" style={{lineHeight:1.9}}>
              The lanterns are being lit.<br/>
              The path is almost ready.<br/>
              <span style={{fontSize:11,color:"var(--plum-soft)",fontFamily:"Silkscreen,monospace"}}>
                …stay on your quest, adventurer.
              </span>
            </p>
            <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
              <button className="coming-soon-btn"
                onClick={()=>{
                  const url="https://app.serenityartnhome.com";
                  const text="Join me on Serenity Quest — a daily feng shui habit tracker ✦";
                  if(navigator.share){ navigator.share({title:"Serenity Quest",text,url}).catch(()=>{}); }
                  else { navigator.clipboard.writeText(url).catch(()=>{}); setShowFriendsSoon(false); }
                }}>Share with Friends ✦</button>
              <button className="coming-soon-btn"
                style={{background:"var(--cream)",color:"var(--plum)",borderColor:"var(--gold)"}}
                onClick={()=>setShowFriendsSoon(false)}>I'll Wait ✦</button>
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

      {showProfileEdit && (
        <div className="coming-soon-overlay" onClick={()=>setShowProfileEdit(false)}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()}
            style={{maxWidth:340,width:"90%"}}>
            <h3 className="coming-soon-title">✦ Edit Profile ✦</h3>
            <div className="field" style={{marginBottom:10}}>
              <label style={{fontSize:11,fontFamily:"Silkscreen,monospace",color:"var(--plum)"}}>Name</label>
              <input value={editName} onChange={e=>setEditName(e.target.value)} maxLength={32}
                placeholder="Your name…"/>
            </div>
            <div className="field" style={{marginBottom:10}}>
              <label style={{fontSize:11,fontFamily:"Silkscreen,monospace",color:"var(--plum)"}}>Birthday</label>
              <div className="bday-row">
                <select value={editBdayDay} onChange={e=>setEditBdayDay(e.target.value)} className="bday-select">
                  <option value="">Day</option>
                  {Array.from({length:31},(_,i)=>i+1).map(d=>(
                    <option key={d} value={String(d)}>{d}</option>
                  ))}
                </select>
                <select value={editBdayMonth} onChange={e=>setEditBdayMonth(e.target.value)} className="bday-select">
                  <option value="">Month</option>
                  {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m,i)=>(
                    <option key={i} value={String(i+1)}>{m}</option>
                  ))}
                </select>
                <select value={editBdayYear} onChange={e=>setEditBdayYear(e.target.value)} className="bday-select">
                  <option value="">Year</option>
                  {Array.from({length:100},(_,i)=>new Date().getFullYear()-i).map(y=>(
                    <option key={y} value={String(y)}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field" style={{marginBottom:16}}>
              <label style={{fontSize:11,fontFamily:"Silkscreen,monospace",color:"var(--plum)"}}>Location</label>
              <input value={editLoc} onChange={e=>setEditLoc(e.target.value)}
                placeholder="City, Country…"/>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
              <button className="coming-soon-btn" onClick={saveProfileEdit}>Save ✦</button>
              <button className="coming-soon-btn"
                style={{background:"var(--cream)",color:"var(--plum)",borderColor:"var(--gold)"}}
                onClick={()=>setShowProfileEdit(false)}>Cancel</button>
              <button className="coming-soon-btn"
                style={{background:"var(--cream)",color:"#c0392b",borderColor:"#c0392b"}}
                onClick={()=>{ setShowProfileEdit(false); onSignOut(); }}>Log Out</button>
            </div>
          </div>
        </div>
      )}

      {showGratShare && (
        <div className="coming-soon-overlay" onClick={()=>{ setShowGratShare(false); setShareStatus(null); }}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()} style={{maxWidth:360,width:"92%"}}>
            <h3 className="coming-soon-title">✦ Share to Gratitude Wall ✦</h3>
            <p className="coming-soon-body" style={{marginBottom:4}}>Choose which gratitude to share:</p>
            {shareStatus==="done" ? (
              <div style={{textAlign:"center",padding:"20px 0",fontFamily:"Pixelify Sans,monospace",
                           color:"var(--jade-deep)",fontSize:16}}>✓ Shared to the Wall!</div>
            ) : shareStatus==="error" ? (
              <div style={{textAlign:"center",padding:"12px 0",fontFamily:"Pixelify Sans,monospace",
                           color:"var(--rose)",fontSize:13,lineHeight:1.5}}>
                Couldn't share.<br/>
                <span style={{fontSize:11,opacity:.8}}>{shareError}</span>
              </div>
            ) : (
              <div className="grat-share-pick-list">
                {gratitude.filter(g=>g.trim()).map((g,i)=>(
                  <button key={i} className="grat-share-pick-item"
                    disabled={shareStatus==="sharing"}
                    onClick={()=>shareToWall(g)}>
                    {g}
                  </button>
                ))}
              </div>
            )}
            {shareStatus!=="done" && (
              <button className="coming-soon-btn"
                style={{background:"var(--cream)",color:"var(--plum)",borderColor:"var(--gold)",marginTop:8}}
                onClick={()=>{ setShowGratShare(false); setShareStatus(null); }}>Cancel</button>
            )}
          </div>
        </div>
      )}

      {celebrate && (
        <div className="celebrate" onClick={()=>setCelebrate(false)}>
          <div className="card" onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"center"}}>
              {petStage==="adult"
                ? <ZodiacPet animal={animal} mood="excited" size={140}/>
                : petStage==="baby"
                ? <BabyPet animal={animal} happy={true} size={42}/>
                : <img src={eggSrc(mood)} className="egg-idle"
                    style={{width:140,height:140,imageRendering:"pixelated"}} alt="egg"/>
              }
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
    </div>
  );
}

window.Dashboard = Dashboard;
