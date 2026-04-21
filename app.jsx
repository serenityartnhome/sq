// SB is loaded from supabase-client.js

const STORAGE = "serenity-quest:v1";

let _cursorStyleEl = null;
function applyCursor(name){
  if(!_cursorStyleEl){
    _cursorStyleEl = document.createElement("style");
    _cursorStyleEl.id = "sq-cursor-style";
    document.head.appendChild(_cursorStyleEl);
  }
  if(!name){ _cursorStyleEl.textContent = ""; return; }
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

function load(){ try{ const s=localStorage.getItem(STORAGE); return s?JSON.parse(s):null; }catch{ return null; } }
function save(s){ try{ localStorage.setItem(STORAGE,JSON.stringify(s)); }catch{} }

function parseHashParams(){
  try {
    const h = window.location.hash.replace(/^#/,"");
    return Object.fromEntries(h.split("&").map(p=>p.split("=").map(decodeURIComponent)));
  } catch{ return {}; }
}

function App(){
  const [saved, setSaved]         = React.useState(()=>load());
  const [authUser, setAuthUser]   = React.useState(null);
  const [recoveryToken, setRecoveryToken] = React.useState(()=>{
    const p = parseHashParams();
    return p.type === "recovery" && p.access_token ? p.access_token : null;
  });
  const [showConfirmed, setShowConfirmed] = React.useState(()=>{
    const p = parseHashParams();
    return p.type === "signup" && !!p.access_token;
  });
  const [tweaks, setTweaks]       = React.useState(()=>({
    palette: window.__SQ_DEFAULTS.palette,
    petMood: window.__SQ_DEFAULTS.petMood,
    showLanterns: window.__SQ_DEFAULTS.showLanterns,
    glowIntensity: window.__SQ_DEFAULTS.glowIntensity,
  }));
  const [tweaksOpen, setTweaksOpen] = React.useState(false);

  React.useEffect(()=>{
    document.body.dataset.palette    = tweaks.palette;
    document.body.dataset.lanterns   = tweaks.showLanterns?"true":"false";
    document.documentElement.style.setProperty("--glow", tweaks.glowIntensity);
    window.__sqShowLanterns = tweaks.showLanterns;
  },[tweaks]);

  React.useEffect(()=>{
    const c = saved?.profile?.cursor;
    applyCursor(c||null);
  },[saved]);

  React.useEffect(()=>{
    const onMsg = (e)=>{
      const d=e.data; if(!d||typeof d!=="object") return;
      if(d.type==="__activate_edit_mode")   setTweaksOpen(true);
      if(d.type==="__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message",onMsg);
    window.parent.postMessage({type:"__edit_mode_available"},"*");
    return ()=>window.removeEventListener("message",onMsg);
  },[]);

  // Restore Supabase session in background — doesn't block rendering
  React.useEffect(()=>{
    if(!window.SB) return;
    (async()=>{
      try {
        const loadProfile = async (userId) => {
          const { data } = await window.SB.from("profiles").select("*").eq("id", userId).single();
          if(data && data.name){
            const p = { profile:{ name:data.name, bday:data.bday||"", loc:data.loc||"", why:data.why||"", cursor:data.cursor||null }, habits:data.habits||[] };
            setSaved(p); save(p);
          }
        };

        // Handle email confirm / OAuth redirect — session arrives in URL hash
        const hash = parseHashParams();
        if(hash.access_token && hash.type !== "recovery"){
          const SB_URL = "https://hplmgpxnbgmdmqmsuisz.supabase.co";
          const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwbG1ncHhuYmdtZG1xbXN1aXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODM3OTAsImV4cCI6MjA5MjI1OTc5MH0.eKh6KMxsyOls_3V9KoCE0b7TECFKmpbYEDCDJ4QN67A";
          window.location.hash = "";
          try {
            const res = await fetch(SB_URL+"/auth/v1/user", {
              headers:{ "apikey": SB_KEY, "Authorization": "Bearer "+hash.access_token }
            });
            const user = await res.json();
            if(user.id){
              const session = { access_token: hash.access_token, refresh_token: hash.refresh_token||"", user };
              window.SB.auth._session = session;
              try{ localStorage.setItem("sq_sb_session", JSON.stringify(session)); }catch{}
              setAuthUser(user);
              await loadProfile(user.id);
              return;
            }
          } catch{}
        }

        const { data:{ session } } = await window.SB.auth.getSession();
        if(!session) return;
        setAuthUser(session.user);
        if(session.user) await loadProfile(session.user.id);
      } catch{}
    })();
  },[]);

  // Called from Onboarding with optional email/password for account creation
  const completeOnboarding = async (data, credentials)=>{
    save(data);
    setSaved(data);
    if(!credentials || !window.SB) return;
    try {
      let authUser = null;
      const { data:signUpData, error:signUpErr } = await window.SB.auth.signUp({ email:credentials.email, password:credentials.password });
      if(!signUpErr && signUpData?.user){
        authUser = signUpData.user;
      } else {
        // Email already registered — try signing in instead
        const { data:signInData, error:signInErr } = await window.SB.auth.signInWithPassword({ email:credentials.email, password:credentials.password });
        if(!signInErr && signInData?.user) authUser = signInData.user;
      }
      if(authUser){
        setAuthUser(authUser);
        await window.SB.from("profiles").upsert({
          id:authUser.id, name:data.profile.name, bday:data.profile.bday||"",
          loc:data.profile.loc||"", why:data.profile.why||"",
          cursor:data.profile.cursor||null, habits:data.habits||[]
        });
      }
    } catch{}
  };

  const reset = async ()=>{
    if(confirm("Start over? Your progress will be cleared.")){
      [STORAGE,"sq_streaks","sq_daily","sq_history","sq_custom_habits","sq_active_habits","sq_notes","sq_week_mon"]
        .forEach(k=>localStorage.removeItem(k));
      if(authUser && window.SB){
        try {
          await window.SB.from("profiles").delete().eq("id",authUser.id);
          await window.SB.from("daily_data").delete().eq("user_id",authUser.id);
        } catch{}
      }
      setSaved(null); setAuthUser(null);
    }
  };

  const handleLogin = async (user)=>{
    setAuthUser(user);
    if(window.SB){
      try {
        const { data } = await window.SB.from("profiles").select("*").eq("id", user.id).single();
        if(data && data.name){
          const p = { profile:{ name:data.name, bday:data.bday||"", loc:data.loc||"", why:data.why||"", cursor:data.cursor||null }, habits:data.habits||[] };
          save(p); setSaved(p);
          return;
        }
      } catch{}
    }
    // Profile not in DB — use localStorage data if available, else create minimal profile
    const local = load();
    if(local){ setSaved(local); }
    else {
      const p = { profile:{ name:user.email?.split("@")[0]||"Adventurer", bday:"", loc:"", why:"", cursor:null }, habits:[] };
      save(p); setSaved(p);
    }
  };

  const handleUpdateProfile = (updates)=>{
    setSaved(prev=>{
      const next = { ...prev, profile:{ ...prev.profile, ...updates } };
      save(next);
      return next;
    });
  };

  const signOut = async ()=>{
    if(window.SB) try{ await window.SB.auth.signOut(); }catch{}
    setAuthUser(null);
    setSaved(null);
  };

  const userId = authUser?.id || null;

  return (
    <>
      {recoveryToken
        ? <ResetPassword accessToken={recoveryToken} onDone={()=>{ window.location.hash=""; setRecoveryToken(null); }}/>
        : showConfirmed
          ? <EmailConfirmed onContinue={()=>setShowConfirmed(false)}/>
          : !saved
            ? <Onboarding onComplete={completeOnboarding} onLogin={handleLogin}/>
            : <Dashboard profile={saved.profile} habits={saved.habits}
                         onReset={reset} userId={userId} isGuest={!authUser} onSignOut={signOut}
                         onUpdateProfile={handleUpdateProfile}/>
      }
      {tweaksOpen && <Tweaks state={tweaks} setState={setTweaks}/>}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
