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

  const CURSORS = [null,"cursor-1","cursor-2","cursor-3","cursor-4","cursor-5","cursor-6"];
  React.useEffect(()=>{
    applyCursor(cursor);
    return ()=>{ applyCursor(null); };
  },[cursor]);

  const changeHabitIcon = (id, kind) => {
    setHabits(hs => hs.map(h => h.id===id ? {...h, kind} : h));
    setEditingIconFor(null);
  };
  const ALL_ICONS = ["affirm","bed","bowl","cake","charm","clean","declutter","diary",
    "diet","energy-heart","flame","focus","goals","heart","journal","learning","lotus","lotus-bud",
    "meditate","nature","network","planning","protein","read","screen","selfaff","skills",
    "sleep","sparkle","steps","sun","tea","treat","water","work","workout"];

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

  const [email, setEmail]       = React.useState("");
  const [password, setPassword] = React.useState("");
  const [authError, setAuthError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const [showLogin, setShowLogin]       = React.useState(false);
  const [loginEmail, setLoginEmail]     = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");
  const [loginError, setLoginError]     = React.useState("");
  const [loginLoading, setLoginLoading] = React.useState(false);

  const handleLogin = async () => {
    setLoginError("");
    if(!loginEmail.trim() || !loginPassword){ setLoginError("Enter email and password"); return; }
    setLoginLoading(true);
    try {
      const { data, error } = await SB.auth.signInWithPassword({ email:loginEmail.trim(), password:loginPassword });
      if(error) throw error;
      if(onLogin) await onLogin(data.user);
    } catch(e){
      setLoginError(e.message||"Login failed");
    }
    setLoginLoading(false);
  };

  const selCount = selected.size;
  const canSubmit = name.trim().length > 0 && selCount >= 3 && selCount <= 8;

  const submitGuest = () => {
    if(!canSubmit) return;
    const chosen = habits.filter(h=>selected.has(h.id));
    onComplete({ profile:{ name:name.trim(), bday, loc:loc.trim(), why:why.trim(), cursor }, habits:chosen }, null);
  };

  const submitWithAccount = async () => {
    if(!canSubmit) return;
    setAuthError("");
    if(!email.trim()){ setAuthError("Please enter your email"); return; }
    if(password.length < 6){ setAuthError("Password must be at least 6 characters"); return; }
    setSubmitting(true);
    const chosen = habits.filter(h=>selected.has(h.id));
    await onComplete({ profile:{ name:name.trim(), bday, loc:loc.trim(), why:why.trim(), cursor }, habits:chosen },
                     { email:email.trim(), password });
    setSubmitting(false);
  };

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
        {/* LEFT: Journey + CTA button */}
        <div>
          <div className="panel">
            <h2 style={{textAlign:"center",fontSize:16,marginBottom:12}}>
              ✦ Your Journey Starts Here ✦
            </h2>
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
            <button className="btn-primary btn-pink onboard-cta-btn" onClick={()=>setShowForm(true)}>
              <HabitIcon kind="lotus-bud" size={22}/> Create Your Profile <HabitIcon kind="lotus-bud" size={22}/>
            </button>
          )}
        </div>

        {/* RIGHT: Profile + Habits form — only shown after button click */}
        {showForm && (
        <div className="panel">
          <h2 style={{textAlign:"center",fontSize:16}}>✦ Create Your Profile ✦</h2>

          <div>
          <div style={{textAlign:"center",color:"var(--plum-soft)",fontSize:12,marginBottom:14,
                       fontFamily:"Pixelify Sans, monospace"}}>
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
          <div style={{textAlign:"center",color:"var(--plum-soft)",fontSize:12,marginBottom:10,
                       fontFamily:"Pixelify Sans, monospace"}}>
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
          </div>{/* end cursor-section */}

          <div className="div-sparkle" style={{marginTop:18}}>✦ Save Your Progress ✦</div>

          <div className="field" style={{marginTop:10}}>
            <label>Email <span style={{fontSize:10,color:"var(--plum-soft)"}}>(to save your progress)</span></label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="your@email.com"/>
          </div>
          <div className="field">
            <label>Password <span style={{fontSize:10,color:"var(--plum-soft)"}}>(min 6 characters)</span></label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
              placeholder="••••••••"/>
          </div>

          {authError && (
            <div style={{color:"#c0392b",fontSize:11,textAlign:"center",marginBottom:8,
                         fontFamily:"Silkscreen,monospace"}}>
              {authError}
            </div>
          )}

          <div style={{marginTop:10,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
            <button className="btn-primary" disabled={!canSubmit||submitting} onClick={submitWithAccount} style={{width:"100%"}}>
              <Icon name="sparkle" size={18}/>
              {submitting ? "Creating account…" : "Begin My Quest & Save Progress"}
              <Icon name="sparkle" size={18}/>
            </button>
            <button onClick={submitGuest} disabled={!canSubmit}
              style={{width:"100%",background:"none",border:"2px solid var(--gold-soft)",
                      color:"var(--plum-soft)",fontFamily:"Silkscreen,monospace",fontSize:11,
                      padding:"8px",cursor:canSubmit?"pointer":"not-allowed",borderRadius:4,
                      letterSpacing:".04em"}}>
              Continue as Guest (no cloud save)
            </button>
            <div style={{fontSize:11,color:"var(--plum-soft)",fontFamily:"Silkscreen, monospace",
                         textTransform:"uppercase",letterSpacing:".04em"}}>
              {selCount < 3 ? `Pick ${3-selCount} more habit${3-selCount===1?"":"s"} to begin` :
               selCount > 8 ? "Pick at most 8 habits" :
               name.trim().length===0 ? "Enter your name to continue" :
               "✦ You're ready to begin ✦"}
            </div>

            {/* Already have an account — below the submit buttons */}
            <div style={{width:"100%",borderTop:"1px solid var(--gold-soft)",paddingTop:10,textAlign:"center"}}>
              <button onClick={()=>{setShowLogin(v=>!v);setLoginError("");}}
                style={{background:"none",border:"none",color:"var(--rose)",cursor:"pointer",
                        fontFamily:"Silkscreen,monospace",fontSize:10,textDecoration:"underline",padding:0}}>
                {showLogin ? "← Hide login" : "Already have an account? Log in"}
              </button>
            </div>

            {showLogin && (
              <div style={{width:"100%"}}>
                <div className="field">
                  <label>Email</label>
                  <input type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)}
                    placeholder="your@email.com" onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
                </div>
                <div className="field">
                  <label>Password</label>
                  <input type="password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)}
                    placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
                </div>
                {loginError && <div style={{color:"#c0392b",fontSize:11,textAlign:"center",marginBottom:8,fontFamily:"Silkscreen,monospace"}}>{loginError}</div>}
                <button className="btn-primary" onClick={handleLogin} disabled={loginLoading} style={{width:"100%"}}>
                  <Icon name="sparkle" size={16}/> {loginLoading ? "Logging in…" : "Log In & Continue"} <Icon name="sparkle" size={16}/>
                </button>
              </div>
            )}
          </div>
        </div>
        </div>
        )}
      </div>
    </div>
  );
}

window.Onboarding = Onboarding;
