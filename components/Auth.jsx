function Auth({ onAuth }) {
  const [mode, setMode] = React.useState("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");

  const validatePassword = (p) => {
    if(p.length < 8) return "Password must be at least 8 characters";
    if(!/[a-zA-Z]/.test(p)) return "Password must include at least one letter";
    if(!/[0-9]/.test(p)) return "Password must include at least one number";
    return null;
  };

  const submit = async () => {
    setError(""); setMessage("");
    if(!email.trim()){ setError("Please enter your email"); return; }

    if(mode === "forgot"){
      setLoading(true);
      try {
        const { error: err } = await SB.auth.resetPasswordForEmail(email.trim());
        if(err) throw err;
        setMessage("Reset link sent! Check your email.");
      } catch(e){ setError(e.message); }
      setLoading(false);
      return;
    }

    const pwErr = validatePassword(password);
    if(pwErr){ setError(pwErr); return; }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error: err } = await SB.auth.signUp({ email: email.trim(), password });
        if (err) throw err;
        if (data.session) {
          onAuth(data.user);
        } else {
          setMessage("Account created! Check your email to confirm, then log in.");
          setMode("login");
        }
      } else {
        const { data, error: err } = await SB.auth.signInWithPassword({ email: email.trim(), password });
        if (err) throw err;
        onAuth(data.user);
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="app-shell">
      <div className="scene-img scene-onboarding"/>
      <div className="scene-veil"/>
      <div className="onboard-safe-top"/>

      <h1 className="hero-title">
        <Icon name="sparkle" size={28}/>
        Serenity Quest
        <Icon name="sparkle" size={28}/>
      </h1>
      <div className="hero-sub">
        Your journey, saved forever <span className="dot">◆</span> Sync across devices
      </div>

      <div style={{display:"flex",justifyContent:"center",marginTop:24,padding:"0 16px"}}>
        <div className="panel" style={{maxWidth:420,width:"100%"}}>
          <h2 style={{textAlign:"center",fontSize:16,marginBottom:4}}>
            {mode==="login" ? "✦ Welcome Back ✦" : mode==="signup" ? "✦ Create Account ✦" : "✦ Reset Password ✦"}
          </h2>
          <div style={{textAlign:"center",fontSize:12,color:"var(--plum-soft)",marginBottom:18,
                       fontFamily:"Pixelify Sans, monospace"}}>
            {mode==="login" ? "Log in to continue your quest" : mode==="signup" ? "Sign up to save your progress forever" : "We'll send a reset link to your email"}
          </div>

          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="your@email.com"
              onKeyDown={e=>e.key==="Enter"&&submit()}/>
          </div>

          {mode !== "forgot" && <div className="field">
            <label>Password <span style={{fontSize:10,color:"var(--plum-soft)"}}>(min 8 characters, letters &amp; numbers)</span></label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e=>e.key==="Enter"&&submit()}/>
          </div>}

          {error && (
            <div style={{color:"#c0392b",fontSize:11,textAlign:"center",marginBottom:8,
                         fontFamily:"Silkscreen,monospace",padding:"6px 8px",
                         background:"rgba(192,57,43,.1)",border:"1px solid rgba(192,57,43,.3)",borderRadius:4}}>
              {error}
            </div>
          )}
          {message && (
            <div style={{color:"#27ae60",fontSize:11,textAlign:"center",marginBottom:8,
                         fontFamily:"Silkscreen,monospace",padding:"6px 8px",
                         background:"rgba(39,174,96,.1)",border:"1px solid rgba(39,174,96,.3)",borderRadius:4}}>
              {message}
            </div>
          )}

          <button className="btn-primary btn-pink" onClick={submit} disabled={loading}
            style={{width:"100%",marginTop:8}}>
            <Icon name="sparkle" size={16}/>
            {loading ? "Please wait…" : mode==="login" ? "Log In" : mode==="signup" ? "Create Account" : "Send Reset Link"}
            <Icon name="sparkle" size={16}/>
          </button>

          <div style={{textAlign:"center",marginTop:14,fontSize:11,
                       fontFamily:"Silkscreen,monospace",color:"var(--plum-soft)"}}>
            {mode==="login" && <>
              <button onClick={()=>{setMode("forgot");setError("");setMessage("");}}
                style={{background:"none",border:"none",color:"#d4607e",cursor:"pointer",
                        fontFamily:"Silkscreen,monospace",fontSize:11,textDecoration:"underline",padding:0}}>
                Forgot password?
              </button>
              <span style={{margin:"0 8px"}}>·</span>
            </>}
            {mode==="login" ? "No account? " : mode==="signup" ? "Already have one? " : "Remember it? "}
            <button onClick={()=>{setMode(mode==="login"?"signup":"login");setError("");setMessage("");}}
              style={{background:"none",border:"none",color:"var(--rose)",cursor:"pointer",
                      fontFamily:"Silkscreen,monospace",fontSize:11,textDecoration:"underline",
                      padding:0}}>
              {mode==="login" ? "Sign up free" : "Log in"}
            </button>
          </div>

          {mode !== "forgot" && <>
            <div style={{display:"flex",alignItems:"center",gap:8,margin:"16px 0 12px"}}>
              <div style={{flex:1,height:1,background:"var(--gold-soft)"}}/>
              <span style={{fontSize:10,color:"var(--plum-soft)",fontFamily:"Silkscreen,monospace"}}>or</span>
              <div style={{flex:1,height:1,background:"var(--gold-soft)"}}/>
            </div>
            <button onClick={()=>SB.auth.signInWithGoogle()} className="btn-google-pixel">
              <img src="assets/icon-google.png" style={{width:18,height:18,imageRendering:"pixelated",flexShrink:0}} alt="Google"/>
              Continue with Google
            </button>
          </>}

          <div style={{borderTop:"1px solid var(--gold-soft)",marginTop:16,paddingTop:14,
                       textAlign:"center"}}>
            <button onClick={()=>onAuth(null)} className="btn-primary btn-pink"
              style={{width:"100%",fontSize:12}}>
              Continue as Guest (no save)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResetPassword({ accessToken, onDone }){
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm]   = React.useState("");
  const [loading, setLoading]   = React.useState(false);
  const [error, setError]       = React.useState("");
  const [done, setDone]         = React.useState(false);

  const validatePassword = (p) => {
    if(p.length < 8) return "Password must be at least 8 characters";
    if(!/[a-zA-Z]/.test(p)) return "Password must include at least one letter";
    if(!/[0-9]/.test(p)) return "Password must include at least one number";
    return null;
  };

  const submit = async () => {
    setError("");
    const pwErr = validatePassword(password);
    if(pwErr){ setError(pwErr); return; }
    if(password !== confirm){ setError("Passwords don't match"); return; }
    setLoading(true);
    try {
      const { error: err } = await SB.auth.updatePassword(password, accessToken);
      if(err) throw err;
      setDone(true);
      setTimeout(onDone, 2000);
    } catch(e){ setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="app-shell">
      <div className="scene-img scene-onboarding"/>
      <div className="scene-veil"/>
      <div className="onboard-safe-top"/>
      <h1 className="hero-title"><Icon name="sparkle" size={28}/> Serenity Quest <Icon name="sparkle" size={28}/></h1>
      <div style={{display:"flex",justifyContent:"center",marginTop:24,padding:"0 16px"}}>
        <div className="panel" style={{maxWidth:420,width:"100%"}}>
          <h2 style={{textAlign:"center",fontSize:16,marginBottom:4}}>✦ Set New Password ✦</h2>
          <div style={{textAlign:"center",fontSize:12,color:"var(--plum-soft)",marginBottom:18,fontFamily:"Pixelify Sans, monospace"}}>
            Choose a strong password to protect your quest
          </div>
          {done ? (
            <div style={{color:"#27ae60",fontSize:12,textAlign:"center",padding:"12px 8px",background:"rgba(39,174,96,.1)",border:"1px solid rgba(39,174,96,.3)",borderRadius:4,fontFamily:"Silkscreen,monospace"}}>
              Password updated! Redirecting…
            </div>
          ) : <>
            <div className="field">
              <label>New Password <span style={{fontSize:10,color:"var(--plum-soft)"}}>(min 8 chars, letters &amp; numbers)</span></label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&submit()}/>
            </div>
            <div className="field">
              <label>Confirm Password</label>
              <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&submit()}/>
            </div>
            {error && <div style={{color:"#c0392b",fontSize:11,textAlign:"center",marginBottom:8,fontFamily:"Silkscreen,monospace",padding:"6px 8px",background:"rgba(192,57,43,.1)",border:"1px solid rgba(192,57,43,.3)",borderRadius:4}}>{error}</div>}
            <button className="btn-primary" onClick={submit} disabled={loading} style={{width:"100%",marginTop:8}}>
              <Icon name="sparkle" size={16}/>
              {loading ? "Saving…" : "Update Password"}
              <Icon name="sparkle" size={16}/>
            </button>
          </>}
        </div>
      </div>
    </div>
  );
}

function EmailConfirmed({ onContinue }){
  const [isIOS] = React.useState(()=> /iphone|ipad|ipod/i.test(navigator.userAgent));
  const [isAndroid] = React.useState(()=> /android/i.test(navigator.userAgent));
  const [showInstructions, setShowInstructions] = React.useState(false);

  return (
    <div className="app-shell">
      <div className="scene-img scene-onboarding"/>
      <div className="scene-veil"/>
      <div className="onboard-safe-top"/>

      <h1 className="hero-title">
        <Icon name="sparkle" size={28}/>
        Serenity Quest
        <Icon name="sparkle" size={28}/>
      </h1>

      <div style={{display:"flex",justifyContent:"center",padding:"0 16px",marginTop:24}}>
        <div className="panel" style={{maxWidth:420,width:"100%",textAlign:"center"}}>

          <div style={{fontSize:48,marginBottom:8}}>🌸</div>
          <h2 style={{fontSize:18,color:"var(--gold)",marginBottom:6,fontFamily:"Silkscreen,monospace",letterSpacing:".04em"}}>
            You're in!
          </h2>
          <p style={{fontSize:13,color:"var(--plum-soft)",fontFamily:"Pixelify Sans,monospace",lineHeight:1.7,marginBottom:24}}>
            Your email is confirmed. Welcome to your Serenity Quest — your 21-day journey starts now. ✦
          </p>

          <div style={{background:"rgba(201,127,165,.12)",border:"1px solid var(--rose)",borderRadius:8,padding:"16px",marginBottom:20}}>
            <p style={{fontSize:13,fontFamily:"Silkscreen,monospace",color:"var(--plum)",marginBottom:10,lineHeight:1.5}}>
              ✦ Add to your Home Screen
            </p>
            <p style={{fontSize:12,color:"var(--plum-soft)",fontFamily:"Pixelify Sans,monospace",lineHeight:1.6,marginBottom:12}}>
              Serenity Quest works best as an app on your phone — no app store needed.
            </p>

            {!showInstructions ? (
              <button className="coming-soon-btn" onClick={()=>setShowInstructions(true)} style={{width:"100%"}}>
                Show Me How ✦
              </button>
            ) : (
              <div style={{textAlign:"left"}}>
                {isIOS && (
                  <ol style={{fontSize:12,color:"var(--plum-soft)",fontFamily:"Pixelify Sans,monospace",lineHeight:2,paddingLeft:18,margin:0}}>
                    <li>Tap the <strong>Share</strong> button at the bottom of Safari <span style={{fontSize:16}}>⎙</span></li>
                    <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                    <li>Tap <strong>Add</strong> in the top right</li>
                    <li>Open <strong>Serenity Quest</strong> from your home screen ✦</li>
                  </ol>
                )}
                {isAndroid && (
                  <ol style={{fontSize:12,color:"var(--plum-soft)",fontFamily:"Pixelify Sans,monospace",lineHeight:2,paddingLeft:18,margin:0}}>
                    <li>Tap the <strong>⋮ menu</strong> in Chrome (top right)</li>
                    <li>Tap <strong>"Add to Home screen"</strong></li>
                    <li>Tap <strong>Add</strong></li>
                    <li>Open <strong>Serenity Quest</strong> from your home screen ✦</li>
                  </ol>
                )}
                {!isIOS && !isAndroid && (
                  <div style={{fontSize:12,color:"var(--plum-soft)",fontFamily:"Pixelify Sans,monospace",lineHeight:1.7}}>
                    On your phone, open this page in <strong>Safari (iPhone)</strong> or <strong>Chrome (Android)</strong> and use the browser menu to <strong>"Add to Home Screen"</strong>.
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="btn-primary" onClick={onContinue} style={{width:"100%"}}>
            <Icon name="sparkle" size={16}/>
            Continue to My Quest
            <Icon name="sparkle" size={16}/>
          </button>

        </div>
      </div>
    </div>
  );
}

window.Auth = Auth;
window.ResetPassword = ResetPassword;
window.EmailConfirmed = EmailConfirmed;
