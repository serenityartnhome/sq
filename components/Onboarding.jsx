const DEFAULT_HABITS = [
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

const ALL_ICONS = ["affirm","bed","bowl","cake","charm","clean","declutter","diary",
  "diet","energy-heart","flame","focus","goals","heart","journal","learning","lotus","lotus-bud",
  "meditate","nature","network","planning","protein","read","screen","selfaff","skills",
  "sleep","sparkle","steps","sun","tea","treat","water","work","workout"];

function validatePassword(p){
  if(p.length < 8) return "Password must be at least 8 characters";
  if(!/[a-zA-Z]/.test(p)) return "Password must include at least one letter";
  if(!/[0-9]/.test(p)) return "Password must include at least one number";
  return null;
}

/* ── Login popup ─────────────────────────────────────────────── */
function LoginPopup({ onClose, onLogin }){
  const [email, setEmail]       = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError]       = React.useState("");
  const [loading, setLoading]   = React.useState(false);
  const [forgotSent, setForgotSent] = React.useState(false);
  const [forgotMode, setForgotMode] = React.useState(false);

  const submit = async () => {
    setError("");
    if(!email.trim()){ setError("Please enter your email"); return; }
    if(forgotMode){
      setLoading(true);
      try {
        const { error: err } = await window.SB.auth.resetPasswordForEmail(email.trim());
        if(err) throw err;
        setForgotSent(true);
      } catch(e){ setError(e.message||"Could not send reset email"); }
      setLoading(false);
      return;
    }
    if(!password){ setError("Please enter your password"); return; }
    setLoading(true);
    try {
      const { data, error: err } = await window.SB.auth.signInWithPassword({ email:email.trim(), password });
      if(err) throw err;
      if(onLogin) await onLogin(data.user);
      onClose();
    } catch(e){ setError(e.message||"Login failed"); }
    setLoading(false);
  };

  return (
    <div className="coming-soon-overlay" onClick={onClose}>
      <div className="coming-soon-box" onClick={e=>e.stopPropagation()} style={{maxWidth:360,width:"92%"}}>
        <h3 className="coming-soon-title">{forgotMode ? "✦ Reset Password ✦" : "✦ Welcome Back ✦"}</h3>
        <div style={{textAlign:"center",fontSize:12,color:"var(--plum-soft)",marginBottom:16,fontFamily:"Pixelify Sans,monospace"}}>
          {forgotMode ? "We'll send a reset link to your email" : "Log in to continue your quest"}
        </div>

        {forgotSent ? (
          <div style={{textAlign:"center",padding:"12px 8px",background:"rgba(39,174,96,.1)",border:"1px solid rgba(39,174,96,.3)",borderRadius:4,color:"#27ae60",fontSize:12,fontFamily:"Silkscreen,monospace",marginBottom:12}}>
            Reset link sent! Check your email.
          </div>
        ) : <>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="your@email.com" onKeyDown={e=>e.key==="Enter"&&submit()}/>
          </div>
          {!forgotMode && (
            <div className="field" style={{marginBottom:6}}>
              <label>Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&submit()}/>
            </div>
          )}
          {!forgotMode && (
            <div style={{textAlign:"right",marginBottom:12}}>
              <button onClick={()=>{setForgotMode(true);setError("");}}
                style={{background:"none",border:"none",color:"var(--plum-soft)",cursor:"pointer",
                        fontFamily:"Silkscreen,monospace",fontSize:10,textDecoration:"underline",padding:0}}>
                Forgot password?
              </button>
            </div>
          )}
          {error && <div style={{color:"#c0392b",fontSize:11,textAlign:"center",marginBottom:10,fontFamily:"Silkscreen,monospace",padding:"6px 8px",background:"rgba(192,57,43,.1)",border:"1px solid rgba(192,57,43,.3)",borderRadius:4}}>{error}</div>}
          <button className="btn-primary btn-pink" onClick={submit} disabled={loading} style={{width:"100%",marginBottom:10}}>
            <Icon name="sparkle" size={16}/>
            {loading ? "Please wait…" : forgotMode ? "Send Reset Link" : "Log In"}
            <Icon name="sparkle" size={16}/>
          </button>
          {!forgotMode && <>
            <div style={{display:"flex",alignItems:"center",gap:8,margin:"4px 0 10px"}}>
              <div style={{flex:1,height:1,background:"var(--gold-soft)"}}/>
              <span style={{fontSize:10,color:"var(--plum-soft)",fontFamily:"Silkscreen,monospace"}}>or</span>
              <div style={{flex:1,height:1,background:"var(--gold-soft)"}}/>
            </div>
            <button onClick={()=>window.SB.auth.signInWithGoogle()} className="btn-google-pixel" style={{marginBottom:10}}>
              <svg width="16" height="16" viewBox="0 0 18 18" style={{flexShrink:0}}>
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.017 17.64 11.71 17.64 9.2z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </button>
          </>}
        </>}
        {forgotMode && !forgotSent && (
          <button onClick={()=>{setForgotMode(false);setError("");}}
            style={{width:"100%",background:"none",border:"none",color:"var(--plum-soft)",cursor:"pointer",
                    fontFamily:"Silkscreen,monospace",fontSize:10,textDecoration:"underline",padding:"4px 0"}}>
            ← Back to login
          </button>
        )}
        <button onClick={onClose}
          style={{width:"100%",marginTop:6,background:"none",border:"none",color:"var(--plum-soft)",cursor:"pointer",
                  fontFamily:"Silkscreen,monospace",fontSize:10,padding:"4px 0"}}>
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ── Save Progress popup ─────────────────────────────────────── */
function SaveProgressPopup({ profileData, onComplete, onClose }){
  const [email, setEmail]       = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPw, setConfirmPw] = React.useState("");
  const [showPw, setShowPw]     = React.useState(false);
  const [error, setError]       = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const submit = async () => {
    setError("");
    if(!email.trim()){ setError("Please enter your email"); return; }
    const pwErr = validatePassword(password);
    if(pwErr){ setError(pwErr); return; }
    if(password !== confirmPw){ setError("Passwords do not match"); return; }
    setSubmitting(true);
    await onComplete(profileData, { email:email.trim(), password });
    setSubmitting(false);
  };

  return (
    <div className="coming-soon-overlay" onClick={onClose}>
      <div className="coming-soon-box" onClick={e=>e.stopPropagation()} style={{maxWidth:380,width:"92%"}}>
        <h3 className="coming-soon-title">✦ Save Your Progress ✦</h3>
        <div style={{textAlign:"center",fontSize:12,color:"var(--plum-soft)",marginBottom:16,fontFamily:"Pixelify Sans,monospace"}}>
          Create an account to sync across devices and never lose your journey
        </div>

        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
            placeholder="your@email.com" onKeyDown={e=>e.key==="Enter"&&submit()}/>
        </div>
        <div className="field">
          <label>Password <span style={{fontSize:10,color:"var(--plum-soft)"}}>(min 8 chars, letters &amp; numbers)</span></label>
          <div style={{position:"relative",display:"flex"}}>
            <input type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)}
              placeholder="••••••••" style={{flex:1,paddingRight:36}} onKeyDown={e=>e.key==="Enter"&&submit()}/>
            <button type="button" onClick={()=>setShowPw(v=>!v)}
              style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",
                      background:"none",border:"none",cursor:"pointer",padding:"2px 4px"}}>
              <img src={showPw?"assets/icon-eye-closed.png":"assets/icon-eye-open.png"}
                style={{width:20,height:20,imageRendering:"pixelated"}} alt={showPw?"hide":"show"}/>
            </button>
          </div>
        </div>
        <div className="field" style={{marginBottom:14}}>
          <label>Confirm Password</label>
          <input type={showPw?"text":"password"} value={confirmPw} onChange={e=>setConfirmPw(e.target.value)}
            placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&submit()}/>
        </div>

        {error && <div style={{color:"#c0392b",fontSize:11,textAlign:"center",marginBottom:10,fontFamily:"Silkscreen,monospace",padding:"6px 8px",background:"rgba(192,57,43,.1)",border:"1px solid rgba(192,57,43,.3)",borderRadius:4}}>{error}</div>}

        <button className="btn-primary btn-pink" onClick={submit} disabled={submitting} style={{width:"100%",marginBottom:10}}>
          <Icon name="sparkle" size={16}/>
          {submitting ? "Creating account…" : "Begin My Quest & Save Progress"}
          <Icon name="sparkle" size={16}/>
        </button>

        <div style={{display:"flex",alignItems:"center",gap:8,margin:"4px 0 10px"}}>
          <div style={{flex:1,height:1,background:"var(--gold-soft)"}}/>
          <span style={{fontSize:10,color:"var(--plum-soft)",fontFamily:"Silkscreen,monospace"}}>or</span>
          <div style={{flex:1,height:1,background:"var(--gold-soft)"}}/>
        </div>

        <button onClick={()=>window.SB.auth.signInWithGoogle()} className="btn-google-pixel">
          <svg width="16" height="16" viewBox="0 0 18 18" style={{flexShrink:0}}>
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.017 17.64 11.71 17.64 9.2z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        <button onClick={()=>onComplete(profileData, null)} className="btn-primary btn-pink"
          style={{width:"100%",fontSize:11,marginBottom:6}}>
          Continue as Guest (no cloud save)
        </button>
        <button onClick={onClose}
          style={{width:"100%",background:"none",border:"none",color:"var(--plum-soft)",cursor:"pointer",
                  fontFamily:"Silkscreen,monospace",fontSize:10,padding:"4px 0",textDecoration:"underline"}}>
          ← Back to profile
        </button>
      </div>
    </div>
  );
}

/* ── Main Onboarding ─────────────────────────────────────────── */
function Onboarding({ onComplete, onLogin }){
  const [name, setName] = React.useState("");
  const [bdayDay, setBdayDay]     = React.useState("");
  const [bdayMonth, setBdayMonth] = React.useState("");
  const [bdayYear, setBdayYear]   = React.useState("");
  const bday = bdayYear && bdayMonth && bdayDay
    ? `${bdayYear}-${bdayMonth.padStart(2,"0")}-${bdayDay.padStart(2,"0")}` : "";
  const [loc, setLoc]   = React.useState("");
  const [why, setWhy]   = React.useState("");
  const [habits, setHabits] = React.useState(DEFAULT_HABITS.map(h=>({...h})));
  const [selected, setSelected] = React.useState(new Set());
  const [customDraft, setCustomDraft] = React.useState("");
  const [customKind, setCustomKind] = React.useState("sparkle");
  const [showCustomInput, setShowCustomInput] = React.useState(false);
  const [editingIconFor, setEditingIconFor] = React.useState(null);
  const [showForm, setShowForm] = React.useState(false);
  const [cursor, setCursor] = React.useState(null);
  const [showSavePopup, setShowSavePopup] = React.useState(false);
  const [showLoginPopup, setShowLoginPopup] = React.useState(false);

  const CURSORS = [null,"cursor-1","cursor-2","cursor-3","cursor-4","cursor-5","cursor-6"];
  React.useEffect(()=>{
    applyCursor(cursor);
    return ()=>{ applyCursor(null); };
  },[cursor]);

  const changeHabitIcon = (id, kind) => {
    setHabits(hs => hs.map(h => h.id===id ? {...h, kind} : h));
    setEditingIconFor(null);
  };

  const toggleHabit = (id) => setSelected(prev=>{
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const addCustom = () => {
    const t = customDraft.trim();
    if(!t) return;
    const id = "c_"+Date.now();
    setHabits(h=>[...h, { id, label:t, kind:customKind, preset:false }]);
    setSelected(s=>new Set([...s, id]));
    setCustomDraft(""); setCustomKind("sparkle"); setShowCustomInput(false);
  };

  const selCount = selected.size;
  const canSubmit = name.trim().length > 0 && selCount >= 3 && selCount <= 8;

  const profileData = () => ({
    profile:{ name:name.trim(), bday, loc:loc.trim(), why:why.trim(), cursor },
    habits: habits.filter(h=>selected.has(h.id))
  });

  return (
    <div className="app-shell">
      <div className="scene-img scene-onboarding"/>
      <div className="scene-veil"/>
      <div className="onboard-safe-top"/>

      <h1 className="hero-title">
        <Icon name="sparkle" size={28}/>
        Begin Your Serenity Quest
        <Icon name="sparkle" size={28}/>
      </h1>
      <div className="hero-sub">
        Align your habits <span className="dot">◆</span> Raise your energy <span className="dot">◆</span> Become your best self
      </div>

      <div className="features-row">
        <span className="feature-pill"><Icon name="lotus-bud" size={18}/> Virtual Pet Companion</span>
        <span className="feature-pill"><Icon name="flame" size={18}/> Energy & Streak</span>
        <span className="feature-pill"><Icon name="sparkle" size={18}/> Daily Intentions</span>
        <span className="feature-pill"><Icon name="lotus" size={18}/> Feng Shui Inspired</span>
      </div>

      <div className={"onboard-two"+(showForm?" onboard-form-open":" onboard-centered")}>
        {/* LEFT: Journey + CTA buttons */}
        <div>
          <div className="panel">
            <h2 style={{textAlign:"center",fontSize:16,marginBottom:12}}>✦ Your Journey Starts Here ✦</h2>
            <ul className="journey">
              <li>
                <span className="mini"><Icon name="lotus-bud" size={28}/></span>
                <div><strong>A Living Companion</strong><span>A zodiac pet that grows with you</span></div>
              </li>
              <li>
                <span className="mini"><Icon name="energy-heart" size={28}/></span>
                <div><strong>Build Your Energy</strong><span>Complete habits, gain energy, maintain flow</span></div>
              </li>
              <li>
                <span className="mini"><Icon name="flame" size={28}/></span>
                <div><strong>Protect Your Streak</strong><span>Never lose progress with Energy Charms</span></div>
              </li>
              <li>
                <span className="mini"><Icon name="lotus" size={28}/></span>
                <div><strong>Set Daily Intentions</strong><span>Focus your mind, shape your reality</span></div>
              </li>
            </ul>
          </div>

          <div className="quote-card">
            <span className="em">"The journey of a thousand miles<br/>begins with a single step…"</span>
            <div style={{marginTop:8,fontSize:12}}>Today is your first day.</div>
          </div>

          {!showForm && (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <button className="btn-primary btn-pink onboard-cta-btn" onClick={()=>setShowForm(true)}>
                <HabitIcon kind="lotus-bud" size={22}/> Create Your Profile <HabitIcon kind="lotus-bud" size={22}/>
              </button>
              <button onClick={()=>setShowLoginPopup(true)}
                style={{width:"100%",background:"var(--cream)",color:"var(--plum)",
                        border:"3px solid var(--plum)",borderRadius:4,
                        boxShadow:"3px 3px 0 rgba(0,0,0,.35), inset 0 0 0 2px var(--gold)",
                        cursor:"pointer",padding:"12px 20px",
                        fontFamily:"Silkscreen,monospace",fontSize:11,letterSpacing:".04em",
                        display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                Already have an account? Log in →
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: Profile + Habits form */}
        {showForm && (
        <div className="panel">
          <h2 style={{textAlign:"center",fontSize:16}}>✦ Create Your Profile ✦</h2>
          <div style={{textAlign:"center",color:"var(--plum-soft)",fontSize:12,marginBottom:14,fontFamily:"Pixelify Sans, monospace"}}>
            Tell us about yourself to begin your journey
          </div>

          <div className="field">
            <label><Icon name="name" size={18} style={{marginRight:2}}/> Your Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your name…" maxLength={32}/>
          </div>

          <div className="field">
            <label><Icon name="cake" size={18}/> Your Birthday</label>
            <div className="bday-row">
              <select value={bdayDay} onChange={e=>setBdayDay(e.target.value)} className="bday-select">
                <option value="">Day</option>
                {Array.from({length:31},(_,i)=>i+1).map(d=>(
                  <option key={d} value={String(d)}>{d}</option>
                ))}
              </select>
              <select value={bdayMonth} onChange={e=>setBdayMonth(e.target.value)} className="bday-select">
                <option value="">Month</option>
                {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m,i)=>(
                  <option key={i} value={String(i+1)}>{m}</option>
                ))}
              </select>
              <select value={bdayYear} onChange={e=>setBdayYear(e.target.value)} className="bday-select">
                <option value="">Year</option>
                {Array.from({length:100},(_,i)=>new Date().getFullYear()-i).map(y=>(
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label><Icon name="pin" size={18}/> Location</label>
            <input value={loc} onChange={e=>setLoc(e.target.value)} placeholder="City, Country…"/>
          </div>

          <div className="field">
            <label><Icon name="heart" size={18}/> Your Why</label>
            <textarea value={why} onChange={e=>setWhy(e.target.value.slice(0,200))}
              placeholder='e.g. "I want more energy", "To feel confident", "For better health"'/>
            <div className="charcount">{why.length} / 200</div>
          </div>

          <div className="div-sparkle">✦ Select Your Habits ✦</div>
          <div style={{textAlign:"center",color:"var(--plum-soft)",fontSize:12,marginBottom:10,fontFamily:"Pixelify Sans, monospace"}}>
            Choose or create daily habits (pick 3–8)
          </div>

          <div className="habit-pick-grid">
            {habits.map(h=>(
              <div key={h.id}
                   className={"habit-card "+(selected.has(h.id)?"active":"")+(editingIconFor===h.id?" icon-editing":"")}
                   onClick={()=>toggleHabit(h.id)}>
                <span className="habit-card-icon" title="Change icon"
                  onClick={e=>{e.stopPropagation(); setEditingIconFor(editingIconFor===h.id?null:h.id); setShowCustomInput(false);}}>
                  <HabitIcon kind={h.kind} size={32}/>
                </span>
                <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.label}</span>
              </div>
            ))}
          </div>

          {editingIconFor && (
            <div className="pu-picker-panel" style={{marginBottom:8}}>
              <div className="pu-picker-title">
                Choose icon for <b>{habits.find(h=>h.id===editingIconFor)?.label}</b>
                <button onClick={()=>setEditingIconFor(null)}
                  style={{float:"right",background:"none",border:"none",cursor:"pointer",color:"var(--plum-soft)"}}>✕</button>
              </div>
              <div className="pu-icon-grid">
                {ALL_ICONS.map(ic=>(
                  <button key={ic} title={ic}
                    className={"pu-icon-btn"+(habits.find(h=>h.id===editingIconFor)?.kind===ic?" on":"")}
                    onClick={()=>changeHabitIcon(editingIconFor, ic)}>
                    <img src={`assets/icon-${ic}.png?v=5`} alt={ic}
                         style={{width:28,height:28,imageRendering:"pixelated"}}
                         onError={e=>{e.currentTarget.src="assets/icon-sparkle.png";e.currentTarget.onerror=null;}}/>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!showCustomInput ? (
            <button className="add-custom" onClick={()=>setShowCustomInput(true)}>
              + Add Custom Habit
            </button>
          ) : (
            <div className="pu-picker-panel" style={{marginBottom:0}}>
              <div className="pu-custom-row" style={{marginBottom:8}}>
                <HabitIcon kind={customKind} size={32}/>
                <input autoFocus value={customDraft} onChange={e=>setCustomDraft(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter") addCustom(); if(e.key==="Escape"){setShowCustomInput(false);setCustomDraft("")}}}
                  placeholder="e.g. Evening yoga…" maxLength={28}
                  className="pu-add-input" style={{flex:1}}/>
                <button className="chip" onClick={addCustom}>Add</button>
                <button className="chip" onClick={()=>{setShowCustomInput(false);setCustomDraft(""); setCustomKind("sparkle")}}>✕</button>
              </div>
              <div className="pu-icon-grid">
                {ALL_ICONS.map(ic=>(
                  <button key={ic} className={"pu-icon-btn"+(customKind===ic?" on":"")}
                    onClick={()=>setCustomKind(ic)} title={ic}>
                    <img src={`assets/icon-${ic}.png?v=5`} alt={ic}
                         style={{width:28,height:28,imageRendering:"pixelated"}}
                         onError={e=>{e.currentTarget.src="assets/icon-sparkle.png";e.currentTarget.onerror=null;}}/>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="cursor-section">
            <div className="div-sparkle" style={{marginTop:16}}>✦ Choose Your Cursor ✦</div>
            <div className="cursor-pick-row">
              {CURSORS.map(c=>(
                <button key={c||"none"} className={"cursor-pick-btn"+(cursor===c?" active":"")}
                  onClick={()=>setCursor(c)} title={c||"Default"}>
                  {c ? (
                    <img src={`assets/${c}.png?v=5`} alt={c}
                      style={{width:40,height:40,imageRendering:"pixelated",display:"block"}}
                      onError={e=>{e.currentTarget.style.opacity=".3";e.currentTarget.onerror=null;}}/>
                  ) : (
                    <span style={{width:40,height:40,display:"flex",alignItems:"center",
                      justifyContent:"center",fontSize:10,fontFamily:"Silkscreen,monospace",
                      color:"var(--plum-soft)",textAlign:"center",lineHeight:1.2}}>
                      Default
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div style={{marginTop:18,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
            <div style={{fontSize:11,color:"var(--plum-soft)",fontFamily:"Silkscreen, monospace",
                         textTransform:"uppercase",letterSpacing:".04em",textAlign:"center"}}>
              {selCount < 3 ? `Pick ${3-selCount} more habit${3-selCount===1?"":"s"} to begin` :
               selCount > 8 ? "Pick at most 8 habits" :
               name.trim().length===0 ? "Enter your name to continue" :
               "✦ You're ready to begin ✦"}
            </div>
            <button className="btn-primary btn-pink" disabled={!canSubmit} onClick={()=>setShowSavePopup(true)} style={{width:"100%"}}>
              <Icon name="sparkle" size={18}/>
              Save My Progress
              <Icon name="sparkle" size={18}/>
            </button>
            <button onClick={()=>{ if(canSubmit) onComplete(profileData(), null); }} disabled={!canSubmit}
              style={{width:"100%",background:"none",border:"2px solid var(--gold-soft)",
                      color:"var(--plum-soft)",fontFamily:"Silkscreen,monospace",fontSize:11,
                      padding:"8px",cursor:canSubmit?"pointer":"not-allowed",borderRadius:4,
                      letterSpacing:".04em"}}>
              Begin My Quest (no save)
            </button>
            <div style={{width:"100%",borderTop:"1px solid var(--gold-soft)",paddingTop:10,textAlign:"center"}}>
              <button onClick={()=>setShowLoginPopup(true)}
                style={{background:"none",border:"none",color:"var(--rose)",cursor:"pointer",
                        fontFamily:"Silkscreen,monospace",fontSize:10,textDecoration:"underline",padding:0}}>
                Already have an account? Log in
              </button>
            </div>
          </div>
        </div>
        )}
      </div>

      {showLoginPopup && (
        <LoginPopup
          onClose={()=>setShowLoginPopup(false)}
          onLogin={onLogin}
        />
      )}

      {showSavePopup && (
        <SaveProgressPopup
          profileData={profileData()}
          onComplete={onComplete}
          onClose={()=>setShowSavePopup(false)}
        />
      )}
    </div>
  );
}

window.Onboarding = Onboarding;
