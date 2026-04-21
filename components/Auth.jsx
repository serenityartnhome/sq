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

          <button className="btn-primary" onClick={submit} disabled={loading}
            style={{width:"100%",marginTop:8}}>
            <Icon name="sparkle" size={16}/>
            {loading ? "Please wait…" : mode==="login" ? "Log In" : mode==="signup" ? "Create Account" : "Send Reset Link"}
            <Icon name="sparkle" size={16}/>
          </button>

          <div style={{textAlign:"center",marginTop:14,fontSize:11,
                       fontFamily:"Silkscreen,monospace",color:"var(--plum-soft)"}}>
            {mode==="login" && <>
              <button onClick={()=>{setMode("forgot");setError("");setMessage("");}}
                style={{background:"none",border:"none",color:"var(--plum-soft)",cursor:"pointer",
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
            <button onClick={()=>SB.auth.signInWithGoogle()}
              style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:10,
                      background:"#fff",border:"1px solid #ddd",borderRadius:6,padding:"10px 16px",
                      cursor:"pointer",fontSize:13,fontWeight:"600",color:"#3c3c3c"}}>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </button>
          </>}

          <div style={{borderTop:"1px solid var(--gold-soft)",marginTop:16,paddingTop:14,
                       textAlign:"center"}}>
            <button onClick={()=>onAuth(null)}
              style={{background:"none",border:"2px solid var(--gold-soft)",color:"var(--plum-soft)",
                      cursor:"pointer",fontFamily:"Silkscreen,monospace",fontSize:10,
                      padding:"6px 14px",borderRadius:4,letterSpacing:".04em"}}>
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

window.Auth = Auth;
window.ResetPassword = ResetPassword;
