// Lightweight Supabase client — no CDN needed, uses fetch directly
(function(){
  const URL  = "https://hplmgpxnbgmdmqmsuisz.supabase.co";
  const KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwbG1ncHhuYmdtZG1xbXN1aXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODM3OTAsImV4cCI6MjA5MjI1OTc5MH0.eKh6KMxsyOls_3V9KoCE0b7TECFKmpbYEDCDJ4QN67A";
  const SESS = "sq_sb_session";

  let _session = null;
  const _listeners = [];

  function _notify(event, session){ _listeners.forEach(fn=>fn(event, session)); }

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

    async signUp({ email, password }){
      const r = await fetch(URL+"/auth/v1/signup", {
        method:"POST", headers:_hdrs(),
        body: JSON.stringify({ email, password })
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

    async resetPasswordForEmail(email){
      const r = await fetch(URL+"/auth/v1/recover", {
        method:"POST", headers:_hdrs(),
        body: JSON.stringify({ email })
      });
      const d = await r.json();
      if(d.error) return { error:{ message: d.error_description||d.error||"Reset failed" }};
      return { error:null };
    },

    signInWithGoogle(){
      const redirectTo = "https://app.serenityartnhome.com";
      window.location.href = URL+"/auth/v1/authorize?provider=google&redirect_to="+encodeURIComponent(redirectTo);
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
    }
  };

  function from(table){
    let _sel="*", _filters=[], _order=null, _lim=null;
    let _method="GET", _body=null, _prefer=null, _single=false;

    const q = {
      select(cols){ _sel=cols; return q; },
      eq(col,val){ _filters.push(col+"=eq."+encodeURIComponent(val)); return q; },
      match(obj){ Object.entries(obj).forEach(([k,v])=>_filters.push(k+"=eq."+encodeURIComponent(v))); return q; },
      order(col,{ascending=true}={}){ _order=col+"."+(ascending?"asc":"desc"); return q; },
      limit(n){ _lim=n; return q; },
      single(){ _single=true; return q; },
      insert(data){ _method="POST"; _body=JSON.stringify(Array.isArray(data)?data:[data]); _prefer="return=representation"; return q; },
      upsert(data){ _method="POST"; _body=JSON.stringify(Array.isArray(data)?data:[data]); _prefer="return=representation,resolution=merge-duplicates"; return q; },
      delete(){ _method="DELETE"; return q; },

      then(resolve){
        const params = [];
        if(_method==="GET") params.push("select="+encodeURIComponent(_sel));
        _filters.forEach(f=>params.push(f));
        if(_order) params.push("order="+_order);
        if(_lim)   params.push("limit="+_lim);
        const url = URL+"/rest/v1/"+table+(params.length?"?"+params.join("&"):"");
        const hdrs = _hdrs(_prefer?{"Prefer":_prefer}:{});
        // For POST/upsert with select, add select param
        let finalUrl = url;
        if((_method==="POST") && _prefer && _prefer.includes("return=representation")){
          finalUrl = URL+"/rest/v1/"+table+"?select="+encodeURIComponent(_sel)+(_filters.length?"&"+_filters.join("&"):"");
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

  window.SB = { auth, from };
})();
