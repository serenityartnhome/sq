// Friends — social features: friends list, messaging, privacy

const PRESET_MESSAGES = [
  { key:"thinking",   text:"Thinking of you 🌸" },
  { key:"yougotthis", text:"You've got this ✨" },
  { key:"goodenergy", text:"Sending you good energy 🌙" },
  { key:"howareyou",  text:"How are you really? 💙" },
];

const MOOD_EMOJI = {
  happy:"😊", calm:"🌸", neutral:"😌", sad:"💧",
  frustrated:"😤", anxious:"😰", tired:"😴", excited:"✨",
};

function FriendAvatar({ animal, stage, size=40 }){
  if(!animal) return <HabitIcon kind="sparkle" size={size}/>;
  const s = stage||"baby";
  if(s === "egg")
    return <img src="assets/icon-egg-neutral.png?v=1" width={size} height={size}
                style={{imageRendering:"pixelated"}} alt=""/>;
  if(s === "baby")  return <BabyPet  animal={animal} size={size}/>;
  if(s === "child") return <ChildPet animal={animal} mood="neutral" size={size}/>;
  if(typeof ZodiacPet !== "undefined" && (s === "adult" || s === "final"))
    return <ZodiacPet animal={animal} mood="neutral" size={size}/>;
  return <TeenPet animal={animal} mood="neutral" size={size}/>;
}

// ── Incoming message walk-in overlay (rendered by Dashboard on app open) ──────
function FriendMessageNotif({ userId, onBoost }){
  const [msg,   setMsg]   = React.useState(null);
  const [phase, setPhase] = React.useState("idle"); // idle|walkin|showing|walkout
  const checkedRef = React.useRef(false);
  const timerRef   = React.useRef(null);

  React.useEffect(()=>{
    if(!userId || !window.SB || checkedRef.current) return;
    checkedRef.current = true;
    if(sessionStorage.getItem("sq_notif_session")) return;

    (async()=>{
      const { data: msgs } = await window.SB.from("messages")
        .select("id, content, sender_id")
        .eq("receiver_id", userId)
        .eq("read", false)
        .order("created_at",{ascending:false})
        .limit(1);
      if(!msgs?.length) return;
      const m = msgs[0];
      const { data: sender } = await window.SB.from("profiles")
        .select("id, name, username, animal, pet_stage")
        .eq("id", m.sender_id)
        .single();
      if(!sender) return;

      sessionStorage.setItem("sq_notif_session","1");
      setMsg({ id:m.id, text:m.content, sender });
      setPhase("walkin");
      if(onBoost) onBoost(5);
      window.SB.from("messages").update({read:true}).eq("id",m.id).then(()=>{});
      timerRef.current = setTimeout(()=>setPhase("showing"), 1100);
    })();
    return ()=>{ if(timerRef.current) clearTimeout(timerRef.current); };
  },[userId]);

  const dismiss = React.useCallback(()=>{
    setPhase("walkout");
    setTimeout(()=>setMsg(null), 900);
  },[]);

  React.useEffect(()=>{
    if(phase !== "showing") return;
    timerRef.current = setTimeout(dismiss, 60000);
    return ()=>{ if(timerRef.current) clearTimeout(timerRef.current); };
  },[phase, dismiss]);

  if(!msg || phase === "idle") return null;

  return (
    <div className={"friend-notif-wrap "+(phase==="walkout"?"notif-out":phase==="walkin"?"notif-in":"notif-show")}
         onClick={dismiss}>
      <FriendAvatar animal={msg.sender.animal} stage={msg.sender.pet_stage} size={56}/>
      {phase === "showing" && (
        <div className="friend-notif-bubble">
          <div className="friend-notif-name">{msg.sender.name||msg.sender.username||"A friend"}</div>
          <div className="friend-notif-text">{msg.text}</div>
          <div className="friend-notif-energy">+5 energy ✨</div>
        </div>
      )}
    </div>
  );
}

// ── Main Friends component ─────────────────────────────────────────────────────
function Friends({ userId, profile, animal, petStage, onEnergyBoost }){
  const [view,         setView]         = React.useState("list");
  const [friends,      setFriends]      = React.useState([]);
  const [pendingIn,    setPendingIn]    = React.useState([]);
  const [messages,     setMessages]     = React.useState([]);
  const [unread,       setUnread]       = React.useState(0);
  const [loading,      setLoading]      = React.useState(true);
  const [selectedLetter, setSelectedLetter] = React.useState(null);
  const [composeTo,    setComposeTo]    = React.useState(null);
  const [sendAnim,     setSendAnim]     = React.useState(false);
  const [sendDone,     setSendDone]     = React.useState(false);

  const [usernameInput, setUsernameInput] = React.useState("");
  const [usernameError, setUsernameError] = React.useState("");
  const [savingUn,      setSavingUn]      = React.useState(false);

  const [searchInput,  setSearchInput]  = React.useState("");
  const [searchResult, setSearchResult] = React.useState(null);
  const [addStatus,    setAddStatus]    = React.useState({});

  const [shareMood, setShareMood] = React.useState(profile.share_mood !== false);
  const [shareGrat, setShareGrat] = React.useState(!!profile.share_gratitude);
  const [localUsername, setLocalUsername] = React.useState(
    profile.username || localStorage.getItem("sq_username") || ""
  );

  const username = localUsername;

  React.useEffect(()=>{ if(userId && window.SB && localUsername) load(); },[userId, localUsername]);

  const load = async () => {
    setLoading(true);
    try { await Promise.all([loadFriends(), loadMessages()]); } catch{}
    setLoading(false);
  };

  const loadFriends = async () => {
    const { data: fships } = await window.SB.from("friends")
      .select("id, requester_id, addressee_id, status")
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
    if(!fships?.length){ setFriends([]); setPendingIn([]); return; }

    const accepted = fships.filter(f=>f.status==="accepted");
    const incoming = fships.filter(f=>f.status==="pending" && f.addressee_id===userId);

    if(accepted.length){
      const ids = accepted.map(f=>f.requester_id===userId ? f.addressee_id : f.requester_id);
      const { data: profs } = await window.SB.from("profiles")
        .select("id, username, name, animal, pet_stage, share_mood, share_gratitude, today_mood, today_gratitude")
        .in("id", ids);
      setFriends((profs||[]).map(p=>({
        ...p,
        friendshipId: accepted.find(f=>f.requester_id===p.id||f.addressee_id===p.id)?.id
      })));
    } else { setFriends([]); }

    if(incoming.length){
      const ids = incoming.map(f=>f.requester_id);
      const { data: reqProfs } = await window.SB.from("profiles")
        .select("id, username, name, animal, pet_stage")
        .in("id", ids);
      setPendingIn((reqProfs||[]).map(p=>({
        ...p,
        requestId: incoming.find(f=>f.requester_id===p.id)?.id
      })));
    } else { setPendingIn([]); }
  };

  const loadMessages = async () => {
    const { data } = await window.SB.from("messages")
      .select("id, sender_id, content, preset_key, read, created_at")
      .eq("receiver_id", userId)
      .order("created_at",{ascending:false})
      .limit(50);
    const msgs = data||[];
    setMessages(msgs);
    setUnread(msgs.filter(m=>!m.read).length);
  };

  const saveUsername = async () => {
    const u = usernameInput.trim().toLowerCase().replace(/[^a-z0-9_]/g,"");
    if(!u || u.length < 3){ setUsernameError("3+ characters. Letters, numbers, underscore only."); return; }
    setSavingUn(true); setUsernameError("");
    try {
      const { error } = await window.SB.from("profiles").update({username:u}).eq("id",userId);
      if(error){
        const msg = error.message||"";
        setUsernameError(
          msg.includes("23505")||msg.includes("unique") ? "Username taken — try another." : msg||"Could not save"
        );
        setSavingUn(false); return;
      }
      setLocalUsername(u);
      localStorage.setItem("sq_username", u);
    } catch(e){ setUsernameError(e.message||"Could not save"); }
    setSavingUn(false);
  };

  const acceptRequest = async (requestId) => {
    await window.SB.from("friends").update({status:"accepted"}).eq("id",requestId);
    load();
  };

  const declineRequest = async (requestId) => {
    await window.SB.from("friends").delete().eq("id",requestId);
    load();
  };

  const searchUser = async () => {
    const q = searchInput.trim().toLowerCase();
    if(!q) return;
    setSearchResult("loading");
    if(q === username){ setSearchResult({self:true}); return; }
    const { data } = await window.SB.from("profiles")
      .select("id, username, name, animal, pet_stage")
      .ilike("username", q)
      .limit(1);
    const found = data?.[0];
    if(!found){ setSearchResult({notFound:true}); return; }
    const { data: existing } = await window.SB.from("friends")
      .select("id, status, requester_id, addressee_id")
      .or(
        `and(requester_id.eq.${userId},addressee_id.eq.${found.id}),and(requester_id.eq.${found.id},addressee_id.eq.${userId})`
      )
      .limit(1);
    setSearchResult({ found, rel: existing?.[0]||null });
  };

  const sendRequest = async (toId) => {
    setAddStatus(s=>({...s,[toId]:"sending"}));
    const { error } = await window.SB.from("friends")
      .insert({requester_id:userId, addressee_id:toId, status:"pending"});
    setAddStatus(s=>({...s,[toId]: error?"error":"sent"}));
  };

  const sendMessage = async (preset) => {
    if(!composeTo) return;
    setSendAnim(true);
    setTimeout(async ()=>{
      await window.SB.from("messages").insert({
        sender_id: userId,
        receiver_id: composeTo.id,
        content: preset.text,
        preset_key: preset.key,
        read: false,
      });
      setSendAnim(false);
      setSendDone(true);
      setTimeout(()=>{ setSendDone(false); setComposeTo(null); setView("list"); }, 2000);
    }, 1200);
  };

  const savePrivacy = async () => {
    await window.SB.from("profiles")
      .update({share_mood:shareMood, share_gratitude:shareGrat})
      .eq("id",userId);
    setView("list");
  };

  const openInbox = async () => {
    setView("inbox");
    if(unread > 0){
      await window.SB.from("messages").update({read:true})
        .eq("receiver_id",userId).eq("read",false);
      setMessages(msgs=>msgs.map(m=>({...m,read:true})));
      setUnread(0);
    }
  };

  // ── Username setup modal ────────────────────────────────────────────────────
  if(!username){
    return (
      <div className="coming-soon-overlay" onClick={e=>e.stopPropagation()}>
        <div className="coming-soon-box" onClick={e=>e.stopPropagation()}
             style={{maxWidth:320,textAlign:"center"}}>
          <div style={{marginBottom:12}}>
            <FriendAvatar animal={animal} stage={petStage} size={64}/>
          </div>
          <h3 className="coming-soon-title">✦ Choose a Username ✦</h3>
          <p className="coming-soon-body" style={{lineHeight:1.8,marginBottom:14}}>
            Friends will find you by this name.<br/>
            <span style={{fontSize:10,color:"var(--plum-soft)",fontFamily:"Silkscreen,monospace"}}>
              letters · numbers · underscore only
            </span>
          </p>
          <input
            className="friends-un-input"
            style={{marginBottom:8,maxWidth:"100%",boxSizing:"border-box"}}
            value={usernameInput}
            onChange={e=>setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,""))}
            onKeyDown={e=>e.key==="Enter"&&saveUsername()}
            placeholder="e.g. moonwalker99"
            maxLength={20}
            autoFocus
          />
          {usernameError && (
            <p style={{fontFamily:"Silkscreen,monospace",fontSize:8,color:"var(--rose)",
                       marginBottom:8,textAlign:"center"}}>
              {usernameError}
            </p>
          )}
          <button className="coming-soon-btn" onClick={saveUsername} disabled={savingUn}
                  style={{width:"100%"}}>
            {savingUn ? "Saving…" : "Set Username ✦"}
          </button>
        </div>
      </div>
    );
  }

  // ── Compose view ────────────────────────────────────────────────────────────
  if(view === "compose" && composeTo){
    return (
      <div className="friends-panel panel">
        <div className="friends-header">
          <button className="friends-back" onClick={()=>{ setComposeTo(null); setView("list"); }}>← Back</button>
          <span className="friends-header-title">Send a Message</span>
          <span style={{width:48}}/>
        </div>
        <div className="friends-compose-body">
          <div className="friends-compose-to">
            <FriendAvatar animal={composeTo.animal} stage={composeTo.pet_stage} size={48}/>
            <span className="friends-compose-name">to {composeTo.name||composeTo.username}</span>
          </div>

          <div className="friends-send-stage">
            {!sendDone && (
              <div className={"friends-my-pet"+(sendAnim?" pet-walk-out":"")}>
                <FriendAvatar animal={animal} stage={petStage} size={64}/>
              </div>
            )}
            {sendDone && <div className="friends-sent-confirm">Message sent! ✨</div>}
          </div>

          <div className="friends-presets">
            {PRESET_MESSAGES.map(p=>(
              <button key={p.key} className="friends-preset-btn"
                      onClick={()=>sendMessage(p)}
                      disabled={sendAnim||sendDone}>
                {p.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Letter view ─────────────────────────────────────────────────────────────
  if(view === "letter" && selectedLetter){
    const d = new Date(selectedLetter.created_at);
    const dateStr = d.toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long"});
    return (
      <div className="friends-panel panel">
        <div className="friends-header">
          <button className="friends-back" onClick={()=>setView("inbox")}>← Inbox</button>
          <span className="friends-header-title">A Letter ✦</span>
          <span style={{width:48}}/>
        </div>
        <div className="friends-letter-parchment">
          <div className="friends-letter-top">
            <span className="friends-letter-from">{selectedLetter._senderName||"A friend"} wrote</span>
            <span className="friends-letter-date">{dateStr}</span>
          </div>
          <div className="friends-letter-seal">✦</div>
          <div className="friends-letter-body">{selectedLetter.content}</div>
          <div className="friends-letter-footer">with love ✦</div>
        </div>
      </div>
    );
  }

  // ── Inbox view ──────────────────────────────────────────────────────────────
  if(view === "inbox"){
    return (
      <div className="friends-panel panel">
        <div className="friends-header">
          <button className="friends-back" onClick={()=>setView("list")}>← Back</button>
          <span className="friends-header-title">Messages</span>
          <span style={{width:48}}/>
        </div>
        {messages.length === 0 ? (
          <div className="friends-empty">
            <p>No messages yet.<br/>When friends send you love, it lands here ✦</p>
          </div>
        ) : (
          <div className="friends-inbox-list">
            {messages.map(m=>{
              const f   = friends.find(fr=>fr.id===m.sender_id);
              const name = f?.name||f?.username||"Friend";
              const d   = new Date(m.created_at);
              const ds  = d.toLocaleDateString("en-AU",{day:"numeric",month:"short"});
              return (
                <button key={m.id}
                        className={"friends-inbox-row"+(m.read?"":" unread")}
                        onClick={()=>{ setSelectedLetter({...m,_senderName:name}); setView("letter"); }}>
                  <FriendAvatar animal={f?.animal} stage={f?.pet_stage} size={36}/>
                  <div className="friends-inbox-info">
                    <span className="friends-inbox-name">{name}</span>
                    <span className="friends-inbox-preview">{m.content}</span>
                  </div>
                  <div className="friends-inbox-meta">
                    <span className="friends-inbox-date">{ds}</span>
                    {!m.read && <span className="friends-inbox-dot"/>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Privacy / settings view ─────────────────────────────────────────────────
  if(view === "settings"){
    return (
      <div className="friends-panel panel">
        <div className="friends-header">
          <button className="friends-back" onClick={()=>setView("list")}>← Back</button>
          <span className="friends-header-title">Privacy</span>
          <span style={{width:48}}/>
        </div>
        <div className="friends-settings-body">
          <div className="friends-un-display">
            <span className="friends-settings-label">Your username</span>
            <span className="friends-un-badge">@{username}</span>
          </div>
          <div className="friends-toggle-row">
            <div>
              <div className="friends-settings-label">Share mood</div>
              <div className="friends-settings-desc">Friends can see your mood emoji today</div>
            </div>
            <button className={"friends-toggle"+(shareMood?" on":"")} onClick={()=>setShareMood(v=>!v)}>
              {shareMood?"ON":"OFF"}
            </button>
          </div>
          <div className="friends-toggle-row">
            <div>
              <div className="friends-settings-label">Share gratitude</div>
              <div className="friends-settings-desc">Friends see a glimpse of your gratitude</div>
            </div>
            <button className={"friends-toggle"+(shareGrat?" on":"")} onClick={()=>setShareGrat(v=>!v)}>
              {shareGrat?"ON":"OFF"}
            </button>
          </div>
          <button className="friends-btn-primary" onClick={savePrivacy} style={{marginTop:24}}>
            Save ✦
          </button>
        </div>
      </div>
    );
  }

  // ── Add friend view ─────────────────────────────────────────────────────────
  if(view === "add"){
    const sr = searchResult;
    return (
      <div className="friends-panel panel">
        <div className="friends-header">
          <button className="friends-back" onClick={()=>{ setView("list"); setSearchInput(""); setSearchResult(null); }}>← Back</button>
          <span className="friends-header-title">Add Friend</span>
          <span style={{width:48}}/>
        </div>
        <div className="friends-add-body">
          <p className="friends-add-hint">Search by exact username ✦</p>
          <div className="friends-search-row">
            <input
              className="friends-search-input"
              value={searchInput}
              onChange={e=>{ setSearchInput(e.target.value); setSearchResult(null); }}
              onKeyDown={e=>e.key==="Enter"&&searchUser()}
              placeholder="@username"
            />
            <button className="friends-btn-search" onClick={searchUser}>Search</button>
          </div>

          {sr === "loading" && <p className="friends-searching">Searching…</p>}
          {sr && sr !== "loading" && (
            <div className="friends-search-result">
              {sr.self     && <p className="friends-search-msg">That's you 🌸</p>}
              {sr.notFound && <p className="friends-search-msg">No one found. Check the username.</p>}
              {sr.found && (
                <div className="friends-result-card">
                  <FriendAvatar animal={sr.found.animal} stage={sr.found.pet_stage} size={52}/>
                  <div className="friends-result-info">
                    <div className="friends-result-name">{sr.found.name||sr.found.username}</div>
                    <div className="friends-result-un">@{sr.found.username}</div>
                  </div>
                  {sr.rel?.status==="accepted"
                    ? <span className="friends-rel-tag">Friends ✦</span>
                    : (sr.rel?.status==="pending" || addStatus[sr.found.id]==="sent")
                      ? <span className="friends-rel-tag">Sent ✦</span>
                      : <button className="friends-btn-add"
                                onClick={()=>sendRequest(sr.found.id)}
                                disabled={addStatus[sr.found.id]==="sending"}>
                          {addStatus[sr.found.id]==="sending"?"Sending…":"Add ✦"}
                        </button>
                  }
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Main list view ──────────────────────────────────────────────────────────
  return (
    <div className="friends-panel">
      <div className="friends-header">
        <div>
          <div className="friends-title">Friends</div>
          <div className="friends-my-un">@{username}</div>
        </div>
        <div className="friends-header-icons">
          <button className="friends-icon-btn" onClick={openInbox} title="Inbox">
            <img src="assets/icon-mail.png" width={28} height={28}
                 style={{imageRendering:"pixelated"}} alt="mail"/>
            {unread > 0 && <span className="friends-badge">{unread > 9?"9+":unread}</span>}
          </button>
          <button className="friends-icon-btn" onClick={()=>setView("settings")} title="Privacy">
            <img src="assets/icon-friends.png?v=1" width={28} height={28}
                 style={{imageRendering:"pixelated"}} alt="settings"/>
          </button>
        </div>
      </div>

      {loading && <div className="friends-loading">Loading…</div>}

      {!loading && <>
        {/* Pending requests */}
        {pendingIn.length > 0 && (
          <div className="friends-section">
            <div className="quest-section-label">Friend Requests</div>
            {pendingIn.map(p=>(
              <div key={p.id} className="friends-request-card">
                <FriendAvatar animal={p.animal} stage={p.pet_stage} size={40}/>
                <div className="friends-request-info">
                  <div className="friends-request-name">{p.name||p.username}</div>
                  <div className="friends-request-un">@{p.username}</div>
                </div>
                <div className="friends-request-btns">
                  <button className="friends-btn-accept" onClick={()=>acceptRequest(p.requestId)}>Accept</button>
                  <button className="friends-btn-decline" onClick={()=>declineRequest(p.requestId)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Friends list */}
        <div className="friends-section">
          <div className="quest-section-label">My Circle</div>
          {friends.length === 0 ? (
            <div className="friends-empty">
              <p>Your circle is quiet for now…<br/>Add a friend and journey together ✦</p>
            </div>
          ) : (
            friends.map(f=>(
              <div key={f.id} className="friends-card">
                <FriendAvatar animal={f.animal} stage={f.pet_stage} size={48}/>
                <div className="friends-card-info">
                  <div className="friends-card-name">{f.name||f.username}</div>
                  <div className="friends-card-un">@{f.username}</div>
                  {f.share_mood && f.today_mood && (
                    <div className="friends-card-mood">
                      {MOOD_EMOJI[f.today_mood]||"✨"} {f.today_mood}
                    </div>
                  )}
                  {f.share_gratitude && f.today_gratitude?.some(g=>g) && (
                    <div className="friends-card-grat">
                      "{(f.today_gratitude.find(g=>g)||"").slice(0,42)}{(f.today_gratitude.find(g=>g)||"").length>42?"…":""}"
                    </div>
                  )}
                </div>
                <button className="friends-send-btn"
                        onClick={()=>{ setComposeTo(f); setView("compose"); }}>
                  Send ✦
                </button>
              </div>
            ))
          )}
        </div>

        <button className="friends-add-btn" onClick={()=>setView("add")}>
          + Add a Friend
        </button>
      </>}
    </div>
  );
}

window.Friends           = Friends;
window.FriendMessageNotif = FriendMessageNotif;
