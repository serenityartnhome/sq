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
function save(s){
  try{
    // Don't persist todayData/flags to localStorage — always reload fresh from Supabase
    const { todayData, flags, ...rest } = s;
    localStorage.setItem(STORAGE,JSON.stringify(rest));
  }catch{}
}

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
  const [checkEmailMsg, setCheckEmailMsg] = React.useState(null);
  const [sessionLoading, setSessionLoading] = React.useState(()=>{
    const p = parseHashParams();
    return !!p.access_token || !!localStorage.getItem("sq_sb_session");
  });
  const [showPwaPrompt, setShowPwaPrompt] = React.useState(()=>{
    const p = parseHashParams();
    const isGoogleOAuth = !!p.access_token && !p.type;
    return isGoogleOAuth && !localStorage.getItem("sq_pwa_shown");
  });
  React.useEffect(()=>{
    const c = saved?.profile?.cursor;
    applyCursor(c||null);
  },[saved]);


  // Restore Supabase session in background — doesn't block rendering
  React.useEffect(()=>{
    if(!window.SB) return;
    (async()=>{
      try {
        const loadProfile = async (userId) => {
          const today = new Date(Date.now() - 3*60*60*1000).toLocaleDateString("en-CA");
          const ninetyDaysAgo = new Date(Date.now() - 90*24*60*60*1000).toLocaleDateString("en-CA");
          const [{ data }, { data: dayData }, { data: historyData }] = await Promise.all([
            window.SB.from("profiles").select("*").eq("id", userId).single(),
            window.SB.from("daily_data").select("*").eq("user_id", userId).eq("date", today).single(),
            window.SB.from("daily_data")
              .select("date,mood,energy,completed,powerups,gratitude,diary,intention")
              .eq("user_id", userId)
              .gte("date", ninetyDaysAgo)
              .neq("date", today),
          ]);
          if(historyData?.length){
            try {
              const hist = JSON.parse(localStorage.getItem("sq_history")||"{}");
              historyData.forEach(row => {
                if(!hist[row.date]){
                  hist[row.date] = {
                    mood:      row.mood,
                    energy:    row.energy || 0,
                    completed: row.completed || [],
                    powerups:  row.powerups || [],
                    gratitude: row.gratitude || [],
                    diary:     row.diary || "",
                    intention: row.intention || null,
                    done:      (row.completed||[]).length >= 3,
                  };
                }
              });
              localStorage.setItem("sq_history", JSON.stringify(hist));
            } catch{}
          }
          if(data && data.name){
            const p = {
              profile:{ name:data.name, bday:data.bday||"", loc:data.loc||"", why:data.why||"", cursor:data.cursor||null },
              habits: data.habits||[],
              seenTips: data.seen_tips ? JSON.parse(data.seen_tips) : [],
              flags: {
                hatched:          !!data.hatched,
                adultUnlocked:    !!data.adult_unlocked,
                diaryUnlocked:    !!data.diary_unlocked,
                photoUnlocked:    !!data.photo_unlocked,
                powerupsUnlocked: !!data.powerups_unlocked,
                customEnergy:     data.custom_energy || null,
                activePowerupIds: data.active_powerup_ids || null,
                customPowerups:   data.custom_powerups || null,
              },
              todayData: dayData || null,
            };
            setSaved(p); save(p);
            return true;
          }
          return false;
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
              window.SB.auth.setSession(session);
              setAuthUser(user);
              const found = await loadProfile(user.id);
              const local = load();
              if(local?.profile?.name){
                try {
                  await window.SB.from("profiles").upsert({
                    id:user.id, name:local.profile.name, bday:local.profile.bday||"",
                    loc:local.profile.loc||"", why:local.profile.why||"",
                    cursor:local.profile.cursor||null, habits:local.habits||[]
                  });
                } catch{}
              }
              // If DB had no profile, fall back to local data so user lands on Dashboard
              if(!found){
                const fallback = local || load();
                if(fallback?.profile?.name) { setSaved(fallback); save(fallback); }
              }
              return;
            }
          } catch{}
        }

        const { data:{ session } } = await window.SB.auth.getSession();
        if(!session) return;
        let user = session.user;
        if((!user || !user.email) && session.access_token){
          try {
            const SB_URL2 = "https://hplmgpxnbgmdmqmsuisz.supabase.co";
            const SB_KEY2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwbG1ncHhuYmdtZG1xbXN1aXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODM3OTAsImV4cCI6MjA5MjI1OTc5MH0.eKh6KMxsyOls_3V9KoCE0b7TECFKmpbYEDCDJ4QN67A";
            const res = await fetch(SB_URL2+"/auth/v1/user", {
              headers:{ "apikey": SB_KEY2, "Authorization": "Bearer "+session.access_token }
            });
            const fetched = await res.json();
            if(fetched.id){
              user = fetched;
              const fixed = { ...session, user };
              window.SB.auth.setSession(fixed);
            }
          } catch{}
        }
        if(!user) return;
        setAuthUser(user);
        const found = await loadProfile(user.id);
        if(!found){
          const local = load();
          if(local?.profile?.name) { setSaved(local); }
        }
      } catch{}
      setSessionLoading(false);
    })();
  },[]);

  // Called from Onboarding with optional email/password for account creation
  const completeOnboarding = async (data, credentials)=>{
    save(data);
    setSaved(data);
    if(!window.SB) return;
    // Already signed in via Google — just save profile to their account
    if(!credentials && authUser){
      try {
        await window.SB.from("profiles").upsert({
          id:authUser.id, name:data.profile.name, bday:data.profile.bday||"",
          loc:data.profile.loc||"", why:data.profile.why||"",
          cursor:data.profile.cursor||null, habits:data.habits||[]
        });
        if(data.emailOptIn !== undefined){
          await window.SB.auth.updateUser({ data:{ email_opt_in: !!data.emailOptIn } });
        }
      } catch{}
      return;
    }
    if(!credentials) return;
    try {
      let user = null;
      const { data:signUpData, error:signUpErr } = await window.SB.auth.signUp({
        email: credentials.email, password: credentials.password,
        options: { emailRedirectTo: "https://app.serenityartnhome.com", data: { email_opt_in: credentials.emailOptIn||false } }
      });
      if(!signUpErr && signUpData?.user){
        if(!signUpData.session){
          // Email confirmation required — data saved locally, tell user to check email
          setCheckEmailMsg(credentials.email);
          return;
        }
        user = signUpData.user;
      } else {
        // Email already registered — try signing in instead
        const { data:signInData, error:signInErr } = await window.SB.auth.signInWithPassword({ email:credentials.email, password:credentials.password });
        if(!signInErr && signInData?.user) user = signInData.user;
      }
      if(user){
        setAuthUser(user);
        await window.SB.from("profiles").upsert({
          id:user.id, name:data.profile.name, bday:data.profile.bday||"",
          loc:data.profile.loc||"", why:data.profile.why||"",
          cursor:data.profile.cursor||null, habits:data.habits||[]
        });
      }
    } catch{}
  };

  const clearAllLocalData = () => {
    ["serenity-quest:v1","sq_streaks","sq_daily","sq_history","sq_custom_habits","sq_active_habits",
     "sq_notes","sq_week_mon","sq_hatched","sq_adult","sq_celebrated","sq_powerups_unlocked",
     "sq_diary_unlocked","sq_photo_unlocked","sq_streaks_date","sq_wall_agreed",
     "sq_wall_last_date","sq_wall_last_post_id","sq_share_loc","sq_sb_session"]
      .forEach(k=>localStorage.removeItem(k));
  };

  const reset = async ()=>{
    {
      clearAllLocalData();
      if(authUser && window.SB){
        try {
          await window.SB.from("profiles").delete().eq("id",authUser.id);
          await window.SB.from("daily_data").delete().eq("user_id",authUser.id);
          await window.SB.from("gratitude_posts").delete().eq("user_id",authUser.id);
        } catch{}
      }
      // Keep authUser so they return to onboarding as already-logged-in
      setSaved(null);
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
    clearAllLocalData();
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
          : sessionLoading && !saved
            ? (
              <div style={{position:"fixed",inset:0,background:"#2a0e1a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
                <img src="assets/icon-lotus.png" alt="" style={{width:48,height:48,imageRendering:"pixelated",animation:"spin 1.2s linear infinite"}}/>
                <div style={{fontFamily:"Silkscreen,monospace",fontSize:11,color:"#e8c5cc",letterSpacing:".08em"}}>Loading your quest…</div>
              </div>
            )
            : !saved
            ? <Onboarding onComplete={completeOnboarding} onLogin={handleLogin} authUser={authUser} onSignOut={signOut}/>
            : <Dashboard profile={saved.profile} habits={saved.habits}
                         onReset={reset} userId={userId} isGuest={!authUser} onSignOut={signOut}
                         onUpdateProfile={handleUpdateProfile} userEmail={authUser?.email||null}
                         authUserMeta={authUser?.user_metadata||null}
                         seenTips={saved.seenTips||[]}
                         todayData={saved.todayData||null}
                         profileFlags={saved.flags||null}
                         onTipSeen={userId ? (keys)=>{
                           setSaved(prev=>({...prev, seenTips: keys}));
                           window.SB.from("profiles").upsert({ id: userId, seen_tips: JSON.stringify(keys) }, { onConflict:"id" }).then(()=>{});
                         } : null}/>
      }
      {checkEmailMsg && (
        <div style={{position:"fixed",inset:0,background:"rgba(26,14,46,.85)",zIndex:9999,
                     display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{background:"#2a1a3e",border:"3px solid #f5c9cc",borderRadius:0,
                       boxShadow:"6px 6px 0 rgba(0,0,0,.4)",maxWidth:360,width:"100%",
                       textAlign:"center",padding:"28px 24px"}}>
            <div style={{fontSize:40,marginBottom:12}}>📧</div>
            <div style={{fontFamily:"Silkscreen,monospace",fontSize:13,color:"#f5c9cc",
                         marginBottom:10,letterSpacing:".04em"}}>Check Your Email</div>
            <div style={{fontFamily:"Pixelify Sans,monospace",fontSize:12,color:"rgba(255,255,255,.75)",
                         lineHeight:1.7,marginBottom:20}}>
              We sent a confirmation link to<br/>
              <strong style={{color:"#f5c9cc"}}>{checkEmailMsg}</strong><br/><br/>
              Click the link to activate your account and save your progress permanently. Your data is safely stored on this device in the meantime.
            </div>
            <button onClick={()=>setCheckEmailMsg(null)}
              style={{background:"#f5c9cc",color:"#5c2a35",border:"2px solid #e39aa0",
                      fontFamily:"Silkscreen,monospace",fontSize:11,padding:"10px 24px",
                      cursor:"pointer",textTransform:"uppercase",letterSpacing:".05em",
                      boxShadow:"3px 3px 0 rgba(0,0,0,.3)"}}>
              ✦ Got It ✦
            </button>
          </div>
        </div>
      )}
      {showPwaPrompt && <PwaPrompt onDone={()=>{ localStorage.setItem("sq_pwa_shown","1"); setShowPwaPrompt(false); }}/>}
    </>
  );
}

function PwaPrompt({ onDone }){
  const isIOS     = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isAndroid = /android/i.test(navigator.userAgent);
  const isMobile  = isIOS || isAndroid;
  const [showSteps, setShowSteps] = React.useState(false);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(26,14,46,.88)",zIndex:9999,
                 display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{background:"#2a1a3e",border:"3px solid #e8c97a",borderRadius:0,
                   boxShadow:"6px 6px 0 rgba(0,0,0,.4)",maxWidth:360,width:"100%",
                   textAlign:"center",padding:"28px 20px"}}>
        <div style={{fontSize:40,marginBottom:10}}>{isMobile ? "📱" : "🌸"}</div>
        <div style={{fontFamily:"Silkscreen,monospace",fontSize:13,color:"#e8c97a",
                     marginBottom:10,letterSpacing:".04em"}}>
          {isMobile ? "Best on Your Phone" : "Save Serenity Quest"}
        </div>
        <div style={{fontFamily:"Pixelify Sans,monospace",fontSize:12,color:"rgba(255,255,255,.75)",
                     lineHeight:1.7,marginBottom:20}}>
          {isMobile
            ? "Serenity Quest works like a real app — no App Store needed. Add it to your home screen for the full experience."
            : "Bookmark this page so you can come back to your quest any time — no app store, no downloads needed."}
        </div>

        {isMobile && !showSteps && (
          <button onClick={()=>setShowSteps(true)}
            style={{background:"#e8c97a",color:"#2a1a3e",border:"none",
                    fontFamily:"Silkscreen,monospace",fontSize:11,padding:"10px 24px",
                    cursor:"pointer",textTransform:"uppercase",letterSpacing:".05em",
                    boxShadow:"3px 3px 0 rgba(0,0,0,.3)",marginBottom:12,display:"block",width:"100%"}}>
            ✦ Show Me How ✦
          </button>
        )}

        {isMobile && showSteps && (
          <div style={{textAlign:"left",marginBottom:16,background:"rgba(255,255,255,.05)",
                       borderRadius:6,padding:"12px 14px"}}>
            {isIOS && (
              <ol style={{fontSize:12,color:"rgba(255,255,255,.8)",fontFamily:"Pixelify Sans,monospace",
                          lineHeight:2.2,paddingLeft:18,margin:0}}>
                <li>Tap the <strong style={{color:"#e8c97a"}}>Share</strong> button at the bottom of Safari ⎙</li>
                <li>Scroll and tap <strong style={{color:"#e8c97a"}}>"Add to Home Screen"</strong></li>
                <li>Tap <strong style={{color:"#e8c97a"}}>Add</strong> in the top right</li>
                <li>Open <strong style={{color:"#e8c97a"}}>Serenity Quest</strong> from your home screen ✦</li>
              </ol>
            )}
            {isAndroid && (
              <ol style={{fontSize:12,color:"rgba(255,255,255,.8)",fontFamily:"Pixelify Sans,monospace",
                          lineHeight:2.2,paddingLeft:18,margin:0}}>
                <li>Tap the <strong style={{color:"#e8c97a"}}>⋮ menu</strong> in Chrome (top right)</li>
                <li>Tap <strong style={{color:"#e8c97a"}}>"Add to Home screen"</strong></li>
                <li>Tap <strong style={{color:"#e8c97a"}}>Add</strong></li>
                <li>Open <strong style={{color:"#e8c97a"}}>Serenity Quest</strong> from your home screen ✦</li>
              </ol>
            )}
          </div>
        )}

        {!isMobile && (
          <div style={{marginBottom:16,background:"rgba(255,255,255,.05)",borderRadius:6,padding:"12px 14px",
                       textAlign:"left"}}>
            <div style={{fontSize:12,color:"rgba(255,255,255,.8)",fontFamily:"Pixelify Sans,monospace",lineHeight:2}}>
              Press <strong style={{color:"#e8c97a"}}>
                {/mac/i.test(navigator.platform) ? "⌘ Cmd + D" : "Ctrl + D"}
              </strong> to bookmark this page, or click the <strong style={{color:"#e8c97a"}}>★ star</strong> in your browser's address bar.
            </div>
          </div>
        )}

        <button onClick={onDone}
          style={{background:"none",border:"2px solid rgba(255,255,255,.2)",color:"rgba(255,255,255,.5)",
                  fontFamily:"Silkscreen,monospace",fontSize:10,padding:"8px 20px",
                  cursor:"pointer",textTransform:"uppercase",letterSpacing:".05em",width:"100%"}}>
          Got It ✦
        </button>
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { crashed: false }; }
  static getDerivedStateFromError(){ return { crashed: true }; }
  render(){
    if(!this.state.crashed) return this.props.children;
    return (
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",
                   justifyContent:"center",background:"#1a0e2e",padding:24,textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16}}>🌸</div>
        <div style={{fontFamily:"Silkscreen,monospace",fontSize:14,color:"#f5c9cc",marginBottom:8,letterSpacing:".04em"}}>
          Oops — something went wrong
        </div>
        <div style={{fontFamily:"Pixelify Sans,monospace",fontSize:12,color:"rgba(255,255,255,.6)",marginBottom:28,lineHeight:1.7}}>
          A new version may be loading.<br/>Tap below to refresh.
        </div>
        <button onClick={()=>window.location.reload()}
          style={{background:"#f5c9cc",color:"#5c2a35",border:"2px solid #e39aa0",
                  fontFamily:"Silkscreen,monospace",fontSize:12,padding:"12px 28px",
                  cursor:"pointer",textTransform:"uppercase",letterSpacing:".05em",
                  boxShadow:"4px 4px 0 rgba(0,0,0,.3)"}}>
          ✦ Reload App ✦
        </button>
      </div>
    );
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(<ErrorBoundary><App/></ErrorBoundary>);
