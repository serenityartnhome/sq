const SB = supabase.createClient(
  "https://hplmgpxnbgmdmqmsuisz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwbG1ncHhuYmdtZG1xbXN1aXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODM3OTAsImV4cCI6MjA5MjI1OTc5MH0.eKh6KMxsyOls_3V9KoCE0b7TECFKmpbYEDCDJ4QN67A"
);
window.SB = SB;

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

function App(){
  // undefined = still checking, null = guest/logged out, object = logged in user
  const [authUser, setAuthUser] = React.useState(undefined);
  const [saved, setSaved] = React.useState(null);
  const [profileLoading, setProfileLoading] = React.useState(false);
  const [tweaks, setTweaks] = React.useState(()=>({
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

  const loadProfile = React.useCallback(async (user)=>{
    setProfileLoading(true);
    const { data } = await SB.from("profiles").select("*").eq("id",user.id).single();
    if(data){
      const profileData = {
        profile:{ name:data.name, bday:data.bday||"", loc:data.loc||"", why:data.why||"", cursor:data.cursor||null },
        habits: data.habits||[]
      };
      setSaved(profileData);
      save(profileData);
    } else {
      // Try migrating existing localStorage data
      const local = load();
      if(local?.profile?.name){
        await SB.from("profiles").upsert({
          id:user.id, name:local.profile.name, bday:local.profile.bday||"",
          loc:local.profile.loc||"", why:local.profile.why||"",
          cursor:local.profile.cursor||null, habits:local.habits||[]
        });
        setSaved(local);
      }
      // else: no profile → show onboarding
    }
    setProfileLoading(false);
  },[]);

  // Auth state
  React.useEffect(()=>{
    SB.auth.getSession().then(({ data:{ session } })=>{
      if(session?.user){
        setAuthUser(session.user);
        loadProfile(session.user);
      } else {
        setAuthUser(null);
      }
    });
    const { data:{ subscription } } = SB.auth.onAuthStateChange((event,session)=>{
      if(session?.user){
        setAuthUser(session.user);
        if(event==="SIGNED_IN") loadProfile(session.user);
      } else {
        setAuthUser(null);
        setSaved(null);
      }
    });
    return ()=>subscription.unsubscribe();
  },[loadProfile]);

  const handleAuth = (user)=>{
    if(user===null){
      // Guest mode — use localStorage only
      setAuthUser("guest");
      const local = load();
      if(local?.profile?.name) setSaved(local);
    } else {
      setAuthUser(user);
    }
  };

  const completeOnboarding = async (data)=>{
    save(data);
    setSaved(data);
    if(authUser && authUser!=="guest"){
      await SB.from("profiles").upsert({
        id:authUser.id, name:data.profile.name, bday:data.profile.bday||"",
        loc:data.profile.loc||"", why:data.profile.why||"",
        cursor:data.profile.cursor||null, habits:data.habits||[]
      });
    }
  };

  const reset = async ()=>{
    if(confirm("Start over? Your progress will be cleared.")){
      [STORAGE,"sq_streaks","sq_daily","sq_history","sq_custom_habits","sq_active_habits","sq_notes","sq_week_mon"]
        .forEach(k=>localStorage.removeItem(k));
      if(authUser && authUser!=="guest"){
        await SB.from("profiles").delete().eq("id",authUser.id);
        await SB.from("daily_data").delete().eq("user_id",authUser.id);
      }
      setSaved(null);
    }
  };

  const signOut = async ()=>{
    if(authUser==="guest"){
      setAuthUser(null);
      setSaved(null);
    } else {
      await SB.auth.signOut();
    }
  };

  // Loading state
  if(authUser===undefined || profileLoading){
    return (
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",
                   height:"100vh",background:"#2a0e1a",flexDirection:"column",gap:16}}>
        <Icon name="sparkle" size={40}/>
        <div style={{fontFamily:"Silkscreen,monospace",color:"var(--gold)",fontSize:13,letterSpacing:".06em"}}>
          Loading your quest…
        </div>
      </div>
    );
  }

  const userId = (authUser && authUser!=="guest") ? authUser.id : null;
  const isGuest = authUser==="guest";

  return (
    <>
      {!authUser
        ? <Auth onAuth={handleAuth}/>
        : !saved
          ? <Onboarding onComplete={completeOnboarding}/>
          : <Dashboard profile={saved.profile} habits={saved.habits}
                       onReset={reset} userId={userId} isGuest={isGuest} onSignOut={signOut}/>
      }
      {tweaksOpen && <Tweaks state={tweaks} setState={setTweaks}/>}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
