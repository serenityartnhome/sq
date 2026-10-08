// Lightweight Supabase client — no CDN needed, uses fetch directly
(function(){
  const URL  = "https://hplmgpxnbgmdmqmsuisz.supabase.co";
  const KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwbG1ncHhuYmdtZG1xbXN1aXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODM3OTAsImV4cCI6MjA5MjI1OTc5MH0.eKh6KMxsyOls_3V9KoCE0b7TECFKmpbYEDCDJ4QN67A";
  const SESS = "sq_sb_session";

  let _session = null;
  const _listeners = [];

  function _notify(event, session){ _listeners.forEach(fn=>fn(event, session)); }

  // --- PKCE helpers (native OAuth only) ---
  function _b64url(bytes){
    let s = ""; for(const b of bytes) s += String.fromCharCode(b);
    return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  }
  function _makeVerifier(){
    const a = new Uint8Array(64); crypto.getRandomValues(a); return _b64url(a);
  }
  async function _challenge(verifier){
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
    return _b64url(new Uint8Array(digest));
  }

  function _hdrs(extra){
    const h = { "apikey": KEY, "Content-Type": "application/json" };
    if(_session) h["Authorization"] = "Bearer " + _session.access_token;
    return Object.assign(h, extra||{});
  }

  async function _refreshSession(){
    if(!_session || !_session.refresh_token) return false;
    try {
      const r = await fetch(URL+"/auth/v1/token?grant_type=refresh_token", {
        method:"POST", headers:_hdrs(),
        body: JSON.stringify({ refresh_token: _session.refresh_token })
      });
      const d = await r.json();
      if(d.access_token){ _session={ ..._session, ...d }; localStorage.setItem(SESS, JSON.stringify(_session)); return true; }
    } catch{}
    return false;
  }

  async function _fetch(url, opts){
    let r = await fetch(url, opts);
    if(r.status===401 && _session){
      const ok = await _refreshSession();
      if(ok){
        opts.headers = _hdrs(opts.prefer ? {"Prefer":opts.prefer} : {});
        r = await fetch(url, opts);
      } else {
        // Refresh token expired — clear session and retry as anon so public reads still work
        _session = null;
        localStorage.removeItem(SESS);
        _notify("SIGNED_OUT", null);
        const anonHdrs = { "apikey": KEY, "Content-Type": "application/json" };
        if(opts.prefer) anonHdrs["Prefer"] = opts.prefer;
        opts.headers = anonHdrs;
        r = await fetch(url, opts);
      }
    }
    return r;
  }

  const auth = {
    getSession(){
      try {
        const s = JSON.parse(localStorage.getItem(SESS)||"null");
        if(s && s.access_token){ _session=s; }
      } catch{}
      return Promise.resolve({ data:{ session: _session } });
    },

    setSession(s){
      if(s && s.access_token){
        _session = s;
        try{ localStorage.setItem(SESS, JSON.stringify(s)); }catch{}
      }
    },

    async signUp({ email, password, options }){
      const redirectTo = (options?.emailRedirectTo) || "https://app.serenityartnhome.com";
      const body = { email, password };
      if(options?.data) body.data = options.data;
      const r = await fetch(URL+"/auth/v1/signup?redirect_to="+encodeURIComponent(redirectTo), {
        method:"POST", headers:_hdrs(),
        body: JSON.stringify(body)
      });
      const d = await r.json();
      if(d.error||d.msg) return { data:null, error:{ message: d.error_description||d.msg||"Signup failed" }};
      if(d.access_token){ _session=d; localStorage.setItem(SESS,JSON.stringify(d)); _notify("SIGNED_IN",d); }
      return { data:{ user:d.user||d, session:d.access_token?d:null }, error:null };
    },

    async signInWithPassword({ email, password }){
      const r = await fetch(URL+"/auth/v1/token?grant_type=password", {
        method:"POST", headers:_hdrs(),
        body: JSON.stringify({ email, password })
      });
      const d = await r.json();
      if(d.error||d.error_code) return { data:null, error:{ message: d.error_description||d.message||"Login failed" }};
      _session=d; localStorage.setItem(SESS,JSON.stringify(d)); _notify("SIGNED_IN",d);
      return { data:{ user:d.user, session:d }, error:null };
    },

    async signOut(){
      if(_session){
        await fetch(URL+"/auth/v1/logout", { method:"POST", headers:_hdrs() }).catch(()=>{});
      }
      _session=null; localStorage.removeItem(SESS); _notify("SIGNED_OUT",null);
      return { error:null };
    },

    onAuthStateChange(cb){
      _listeners.push(cb);
      return { data:{ subscription:{ unsubscribe(){ const i=_listeners.indexOf(cb); if(i>-1)_listeners.splice(i,1); }}}};
    },

    async resendConfirmation(email){
      const r = await fetch(URL+"/auth/v1/resend", {
        method:"POST", headers:_hdrs(),
        body: JSON.stringify({ type:"signup", email })
      });
      const d = await r.json().catch(()=>({}));
      if(d.error) return { error:{ message: d.error_description||d.error||"Could not resend" }};
      return { error:null };
    },

    async resetPasswordForEmail(email){
      const r = await fetch(URL+"/auth/v1/recover", {
        method:"POST", headers:_hdrs(),
        body: JSON.stringify({ email })
      });
      const d = await r.json();
      if(d.error) return { error:{ message: d.error_description||d.error||"Reset failed" }};
      return { error:null };
    },

    async signInWithGoogle(){
      // Native app: Google forbids OAuth inside webviews, so open the system browser
      // (SFSafariViewController) and come back via the app's custom URL scheme.
      const isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
      if(!isNative){
        window.location.href = URL+"/auth/v1/authorize?provider=google&prompt=select_account&redirect_to="+encodeURIComponent("https://app.serenityartnhome.com");
        return;
      }
      // PKCE: tokens come back as a ?code= query param, which survives the custom-scheme
      // redirect (a #fragment does not).
      const verifier = _makeVerifier();
      try{ localStorage.setItem("sq_pkce_verifier", verifier); }catch{}
      const authUrl = URL+"/auth/v1/authorize?provider=google&prompt=select_account"
        + "&redirect_to="+encodeURIComponent("com.serenityartnhome.quest://auth-callback")
        + "&flow_type=pkce&code_challenge_method=s256&code_challenge="+encodeURIComponent(await _challenge(verifier));
      window.Capacitor.Plugins.Browser.open({ url: authUrl });
    },

    async updatePassword(newPassword, accessToken){
      const hdrs = { "apikey": KEY, "Content-Type": "application/json", "Authorization": "Bearer "+(accessToken||(_session&&_session.access_token)||"") };
      const r = await fetch(URL+"/auth/v1/user", {
        method:"PUT", headers:hdrs,
        body: JSON.stringify({ password: newPassword })
      });
      const d = await r.json();
      if(d.error||d.msg) return { error:{ message: d.error_description||d.msg||"Update failed" }};
      return { error:null };
    },

    async updateUser(attrs){
      const r = await fetch(URL+"/auth/v1/user", {
        method:"PUT", headers:_hdrs(),
        body: JSON.stringify(attrs)
      });
      const d = await r.json();
      if(d.error||d.msg) return { data:null, error:{ message: d.error_description||d.msg||"Update failed" }};
      if(d.id && _session){ _session = { ..._session, user: d }; try{ localStorage.setItem(SESS, JSON.stringify(_session)); }catch{} }
      return { data:{ user: d }, error:null };
    }
  };

  function from(table){
    let _sel="*", _filters=[], _order=null, _lim=null;
    let _method="GET", _body=null, _prefer=null, _single=false, _onConflict=null;

    const q = {
      select(cols){ _sel=cols; return q; },
      eq(col,val){ _filters.push(col+"=eq."+encodeURIComponent(val)); return q; },
      neq(col,val){ _filters.push(col+"=neq."+encodeURIComponent(val)); return q; },
      gte(col,val){ _filters.push(col+"=gte."+encodeURIComponent(val)); return q; },
      lt(col,val){ _filters.push(col+"=lt."+encodeURIComponent(val)); return q; },
      match(obj){ Object.entries(obj).forEach(([k,v])=>_filters.push(k+"=eq."+encodeURIComponent(v))); return q; },
      order(col,{ascending=true}={}){ _order=col+"."+(ascending?"asc":"desc"); return q; },
      limit(n){ _lim=n; return q; },
      single(){ _single=true; return q; },
      or(filterStr){ _filters.push("or=("+filterStr+")"); return q; },
      ilike(col,val){ _filters.push(col+"=ilike."+encodeURIComponent(val)); return q; },
      in(col,vals){ _filters.push(col+"=in.("+vals.join(",")+")")  ; return q; },
      update(data){ _method="PATCH"; _body=JSON.stringify(data); _prefer="return=representation"; return q; },
      insert(data){ _method="POST"; _body=JSON.stringify(Array.isArray(data)?data:[data]); _prefer="return=representation"; return q; },
      upsert(data,{onConflict}={}){ _method="POST"; _body=JSON.stringify(Array.isArray(data)?data:[data]); _prefer="return=representation,resolution=merge-duplicates"; if(onConflict) _onConflict=onConflict; return q; },
      delete(){ _method="DELETE"; return q; },

      then(resolve){
        const params = [];
        if(_method==="GET") params.push("select="+encodeURIComponent(_sel));
        _filters.forEach(f=>params.push(f));
        if(_order) params.push("order="+_order);
        if(_lim)   params.push("limit="+_lim);
        const url = URL+"/rest/v1/"+table+(params.length?"?"+params.join("&"):"");
        const hdrs = _hdrs(_prefer?{"Prefer":_prefer}:{});
        let finalUrl = url;
        if((_method==="POST") && _prefer && _prefer.includes("return=representation")){
          finalUrl = URL+"/rest/v1/"+table+"?select="+encodeURIComponent(_sel)+(_onConflict?"&on_conflict="+encodeURIComponent(_onConflict):"")+(_filters.length?"&"+_filters.join("&"):"");
        }
        _fetch(finalUrl, { method:_method, headers:hdrs, body:_body||undefined })
          .then(async r=>{
            if(r.status===204){ return resolve({ data:null, error:null }); }
            const text = await r.text();
            let data = null;
            try { data = JSON.parse(text); } catch{}
            if(!r.ok){ return resolve({ data:null, error:{ message:(data&&(data.message||data.hint))||("HTTP "+r.status) }}); }
            if(_single){ data = Array.isArray(data)?(data[0]||null):data; }
            resolve({ data, error:null });
          })
          .catch(e=>resolve({ data:null, error:{ message:e.message }}));
      }
    };
    return q;
  }

  function rpc(fn, params){
    return {
      then(resolve){
        _fetch(URL+"/rest/v1/rpc/"+fn, {
          method:"POST", headers:_hdrs(), body: JSON.stringify(params||{})
        }).then(async r=>{
          if(r.status===204) return resolve({ data:null, error:null });
          const text = await r.text();
          let data = null; try{ data=JSON.parse(text); }catch{}
          if(!r.ok) return resolve({ data:null, error:{ message:(data&&(data.message||data.hint))||("HTTP "+r.status) }});
          resolve({ data, error:null });
        }).catch(e=>resolve({ data:null, error:{ message:e.message }}));
      }
    };
  }

  // Native app: catch the OAuth redirect (com.serenityartnhome.quest://auth-callback#access_token=...)
  if(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()){
    window.Capacitor.Plugins.App.addListener("appUrlOpen", async ({ url })=>{
      if(!url || !url.startsWith("com.serenityartnhome.quest://auth-callback")) return;
      try{ window.Capacitor.Plugins.Browser.close(); }catch{}
      try{
        const q = new URLSearchParams((url.split("?")[1]||"").split("#")[0]);
        const code = q.get("code");
        let sess = null;

        if(code){
          // PKCE: exchange the code for a session using the stored verifier
          let verifier = null;
          try{ verifier = localStorage.getItem("sq_pkce_verifier"); }catch{}
          const r = await fetch(URL+"/auth/v1/token?grant_type=pkce", {
            method:"POST",
            headers:{ "apikey":KEY, "Content-Type":"application/json" },
            body: JSON.stringify({ auth_code: code, code_verifier: verifier })
          });
          const d = await r.json();
          if(d.access_token) sess = d;
          try{ localStorage.removeItem("sq_pkce_verifier"); }catch{}
        } else {
          // Fallback: implicit flow tokens in the fragment
          const p = new URLSearchParams((url.split("#")[1])||"");
          const access_token = p.get("access_token");
          if(access_token){
            const ur = await fetch(URL+"/auth/v1/user", { headers:{ "apikey":KEY, "Authorization":"Bearer "+access_token }});
            sess = { access_token, refresh_token:p.get("refresh_token"), token_type:p.get("token_type")||"bearer",
                     expires_in:parseInt(p.get("expires_in")||"3600",10), user: await ur.json() };
          }
        }

        if(!sess || !sess.access_token) return;
        _session = sess;
        try{ localStorage.setItem(SESS, JSON.stringify(sess)); }catch{}
        _notify("SIGNED_IN", sess);
      }catch{}
    });
  }

  window.SB = { auth, from, rpc };
})();
