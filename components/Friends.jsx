// Friends — social features: friends list, messaging, privacy

const DUO_PRESETS = [
  { id:"dp-water",    label:"Drink 8 glasses of water",  kind:"water"    },
  { id:"dp-steps",    label:"10-min walk outside",       kind:"steps"    },
  { id:"dp-journal",  label:"Write in your journal",     kind:"journal"  },
  { id:"dp-meditate", label:"Meditate 5 minutes",        kind:"meditate" },
  { id:"dp-screen",   label:"No screens before bed",     kind:"screen"   },
  { id:"dp-gratitude",label:"Share one gratitude",       kind:"heart"    },
  { id:"dp-read",     label:"Read for 20 minutes",       kind:"read"     },
  { id:"dp-workout",  label:"Morning stretch",           kind:"workout"  },
  { id:"dp-diet",     label:"Eat a nourishing meal",     kind:"diet"     },
  { id:"dp-sleep",    label:"Sleep before midnight",     kind:"sleep"    },
];

const DUO_ALL_ICONS = ["affirm","bed","bowl","cake","charm","clean","declutter","diary",
  "diet","energy-heart","flame","focus","goals","heart","journal","learning","lotus","lotus-bud",
  "meditate","nature","network","planning","protein","read","screen","selfaff","skills",
  "sleep","sparkle","steps","sun","tea","treat","water","work","workout"];

const PRESET_MESSAGES = [
  { key:"thinking",   text:"Thinking of you 🌸" },
  { key:"yougotthis", text:"You've got this ✨" },
  { key:"goodenergy", text:"Sending you good energy 🌙" },
  { key:"howareyou",  text:"How are you really? 💙" },
];

function MoodIcon({ mood, size=20 }){
  if(!mood) return null;
  return <img src={`assets/mood-${mood}.png?v=1`} width={size} height={size}
              style={{imageRendering:"pixelated",verticalAlign:"middle",flexShrink:0}} alt={mood}/>;
}

const firstName = (name) => (name||"").split(" ")[0] || (name||"");

function FriendIcon({ animal, size=40 }){
  if(!animal) return <HabitIcon kind="sparkle" size={size}/>;
  return (
    <img src={`assets/icon-account-${animal}.png?v=1`}
         width={size} height={size}
         style={{imageRendering:"pixelated",flexShrink:0}} alt={animal}
         onError={e=>{e.currentTarget.onerror=null;e.currentTarget.style.opacity=".3";}}/>
  );
}

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
          <div className="friend-notif-name">{firstName(msg.sender.name)||msg.sender.username||"A friend"}</div>
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
  const [loading,       setLoading]       = React.useState(true);
  const [loadError,     setLoadError]     = React.useState(false);
  const [newlyAccepted, setNewlyAccepted] = React.useState([]);
  const [selectedLetter, setSelectedLetter] = React.useState(null);
  const [composeTo,    setComposeTo]    = React.useState(null);
  const [sendAnim,     setSendAnim]     = React.useState(false);
  const [sendDone,     setSendDone]     = React.useState(false);
  const [customMsg,    setCustomMsg]    = React.useState("");

  const [usernameInput, setUsernameInput] = React.useState("");
  const [usernameError, setUsernameError] = React.useState("");
  const [savingUn,      setSavingUn]      = React.useState(false);

  const [editingUn,    setEditingUn]    = React.useState(false);
  const [editUnInput,  setEditUnInput]  = React.useState("");
  const [editUnError,  setEditUnError]  = React.useState("");
  const [savingEditUn, setSavingEditUn] = React.useState(false);

  const [editingName,    setEditingName]    = React.useState(false);
  const [editFirstInput, setEditFirstInput] = React.useState("");
  const [editLastInput,  setEditLastInput]  = React.useState("");
  const [editNameError,  setEditNameError]  = React.useState("");
  const [savingName,     setSavingName]     = React.useState(false);

  const [duoTarget,       setDuoTarget]       = React.useState(null);
  const [duoQuests,       setDuoQuests]       = React.useState(()=>DUO_PRESETS.map(q=>({...q})));
  const [duoSelectedIds,  setDuoSelectedIds]  = React.useState(new Set());
  const [duoEditIconFor,  setDuoEditIconFor]  = React.useState(null);
  const [duoCustomDraft,  setDuoCustomDraft]  = React.useState("");
  const [duoCustomKind,   setDuoCustomKind]   = React.useState("sparkle");
  const [duoShowCustom,   setDuoShowCustom]   = React.useState(false);
  const [duoDays,         setDuoDays]         = React.useState(7);
  const [duoDaysCustom,   setDuoDaysCustom]   = React.useState(false);
  const [duoReward,       setDuoReward]       = React.useState("");
  const [duoSending,      setDuoSending]      = React.useState(false);
  const [duoSent,         setDuoSent]         = React.useState(false);
  const [duoPendingIn,    setDuoPendingIn]    = React.useState([]);

  const [shareCopied,  setShareCopied]  = React.useState(false);

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

  React.useEffect(()=>{
    if(!userId || !window.SB) return;
    window.SB.from("profiles").select("share_mood,share_gratitude").eq("id",userId).single()
      .then(({data})=>{ if(data){ setShareMood(data.share_mood!==false); setShareGrat(!!data.share_gratitude); } });
  },[userId]);

  const load = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const timeout = new Promise((_,rej)=>setTimeout(()=>rej("timeout"),8000));
      await Promise.race([Promise.all([loadFriends(), loadMessages(), loadDuoRequests()]), timeout]);
    } catch{
      setLoadError(true);
    }
    setLoading(false);
  };

  const loadFriends = async () => {
    const { data: fships } = await window.SB.from("friends")
      .select("id, requester_id, addressee_id, status")
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
    if(!fships?.length){ setFriends([]); setPendingIn([]); return; }

    const accepted = fships.filter(f=>f.status==="accepted");
    const incoming = fships.filter(f=>f.status==="pending" && f.addressee_id===userId);

    // Detect newly accepted requests (requests I sent that got accepted)
    const knownKey = "sq_friends_known_"+userId;
    const knownStr = localStorage.getItem(knownKey);
    const mySentAccepted = accepted.filter(f=>f.requester_id===userId);
    if(knownStr !== null){
      let knownIds = []; try{ knownIds=JSON.parse(knownStr); }catch{}
      const knownSet = new Set(knownIds);
      const brandNew = mySentAccepted.filter(f=>!knownSet.has(f.addressee_id));
      if(brandNew.length){
        const newIds = brandNew.map(f=>f.addressee_id);
        const { data: newProfs } = await window.SB.from("profiles")
          .select("id, name, username, animal").in("id", newIds);
        setNewlyAccepted(newProfs||[]);
      }
    }
    localStorage.setItem(knownKey, JSON.stringify(mySentAccepted.map(f=>f.addressee_id)));

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

  const saveEditUsername = async () => {
    const u = editUnInput.trim().toLowerCase().replace(/[^a-z0-9_]/g,"");
    if(!u || u.length < 3){ setEditUnError("3+ characters. Letters, numbers, underscore only."); return; }
    if(u === localUsername){ setEditingUn(false); return; }
    setSavingEditUn(true); setEditUnError("");
    try {
      const { error } = await window.SB.from("profiles").update({username:u}).eq("id",userId);
      if(error){
        const msg = error.message||"";
        setEditUnError(
          msg.includes("23505")||msg.includes("unique") ? "Username taken — try another." : msg||"Could not save"
        );
        setSavingEditUn(false); return;
      }
      setLocalUsername(u);
      localStorage.setItem("sq_username", u);
      setEditingUn(false);
    } catch(e){ setEditUnError(e.message||"Could not save"); }
    setSavingEditUn(false);
  };

  const saveEditName = async () => {
    const first = editFirstInput.trim();
    const last  = editLastInput.trim();
    if(!first){ setEditNameError("First name required."); return; }
    const full = last ? first+" "+last : first;
    setSavingName(true); setEditNameError("");
    try {
      const { error } = await window.SB.from("profiles").update({name:full}).eq("id",userId);
      if(error){ setEditNameError(error.message||"Could not save"); setSavingName(false); return; }
      profile.name = full;
      setEditingName(false);
    } catch(e){ setEditNameError(e.message||"Could not save"); }
    setSavingName(false);
  };

  const loadDuoRequests = async () => {
    const { data } = await window.SB.from("duo_quests")
      .select("id, requester_id, quest_name, total_days, created_at")
      .eq("addressee_id", userId)
      .eq("status", "pending")
      .limit(10);
    if(!data?.length){ setDuoPendingIn([]); return; }
    const ids = data.map(d => d.requester_id);
    const { data: profs } = await window.SB.from("profiles")
      .select("id, name, username, animal").in("id", ids);
    setDuoPendingIn(data.map(d => ({
      ...d,
      requester: (profs||[]).find(p => p.id === d.requester_id) || null
    })));
  };

  const resetDuoForm = () => {
    setDuoTarget(null); setDuoQuests(DUO_PRESETS.map(q=>({...q}))); setDuoSelectedIds(new Set());
    setDuoEditIconFor(null); setDuoCustomDraft(""); setDuoCustomKind("sparkle"); setDuoShowCustom(false);
    setDuoDays(7); setDuoDaysCustom(false); setDuoReward("");
  };

  const sendDuoRequest = async () => {
    if(!duoSelectedIds.size || !duoTarget || !duoDays) return;
    setDuoSending(true);
    const rows = duoQuests
      .filter(q => duoSelectedIds.has(q.id))
      .map(q => ({
        requester_id: userId,
        addressee_id: duoTarget.id,
        quest_name: q.label,
        total_days: duoDays,
        reward: duoReward.trim() || null,
        status: "pending",
      }));
    await window.SB.from("duo_quests").insert(rows);
    setDuoSending(false);
    setDuoSent(true);
    setTimeout(() => { setDuoSent(false); resetDuoForm(); setView("list"); }, 2000);
  };

  const acceptDuoRequest = async (id) => {
    await window.SB.from("duo_quests").update({status:"active"}).eq("id", id);
    setDuoPendingIn(prev => prev.filter(d => d.id !== id));
  };

  const declineDuoRequest = async (id) => {
    await window.SB.from("duo_quests").delete().eq("id", id);
    setDuoPendingIn(prev => prev.filter(d => d.id !== id));
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
    setAddStatus(s=>({...s,[toId]: error?(error.message||"error"):"sent"}));
  };

  const sendMessage = async (preset, customText) => {
    if(!composeTo) return;
    const content = customText || preset?.text;
    if(!content?.trim()) return;
    setSendAnim(true);
    setTimeout(async ()=>{
      await window.SB.from("messages").insert({
        sender_id: userId,
        receiver_id: composeTo.id,
        content: content.trim(),
        preset_key: preset?.key || null,
        read: false,
      });
      setSendAnim(false);
      setSendDone(true);
      setCustomMsg("");
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
            <FriendIcon animal={composeTo.animal} size={48}/>
            <span className="friends-compose-name">to {firstName(composeTo.name)||composeTo.username}</span>
          </div>

          <div className="friends-send-stage">
            {!sendDone && (
              <div className={"friends-my-pet"+(sendAnim?" pet-walk-out":"")}>
                <FriendAvatar animal={animal} stage={petStage} size={64}/>
              </div>
            )}
            {sendDone && <div className="friends-sent-confirm">Message sent! ✨</div>}
          </div>

          <div className="friends-custom-msg">
            <textarea
              className="friends-custom-input"
              value={customMsg}
              onChange={e=>setCustomMsg(e.target.value.slice(0,200))}
              placeholder="Write your own message… (200 chars)"
              rows={3}
              disabled={sendAnim||sendDone}
            />
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6}}>
              <span style={{fontFamily:"Silkscreen,monospace",fontSize:8,color:"var(--plum-soft)"}}>
                {customMsg.length}/200
              </span>
              <button className="friends-btn-primary"
                      onClick={()=>sendMessage(null, customMsg)}
                      disabled={sendAnim||sendDone||!customMsg.trim()}
                      style={{padding:"8px 16px"}}>
                Send ✦
              </button>
            </div>
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
              const name = firstName(f?.name)||f?.username||"Friend";
              const d   = new Date(m.created_at);
              const ds  = d.toLocaleDateString("en-AU",{day:"numeric",month:"short"});
              return (
                <button key={m.id}
                        className={"friends-inbox-row"+(m.read?"":" unread")}
                        onClick={()=>{ setSelectedLetter({...m,_senderName:name}); setView("letter"); }}>
                  <FriendIcon animal={f?.animal} size={36}/>
                  <div className="friends-inbox-info">
                    <span className="friends-inbox-name">{name}</span>
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

  // ── Duo Quest request view ──────────────────────────────────────────────────
  if(view === "duo-request" && duoTarget){
    return (
      <div className="friends-panel panel">
        <div className="friends-header">
          <button className="friends-back" onClick={()=>{ resetDuoForm(); setView("list"); }}>← Back</button>
          <span className="friends-header-title">Duo Quest</span>
          <span style={{width:48}}/>
        </div>
        <div className="friends-settings-body">
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <FriendIcon animal={duoTarget.animal} size={40}/>
            <div>
              <div style={{fontFamily:"Silkscreen,monospace",fontSize:10,color:"var(--plum)"}}>with {firstName(duoTarget.name)||duoTarget.username}</div>
              <div style={{fontFamily:"Silkscreen,monospace",fontSize:8,color:"var(--plum-soft)"}}>Both must complete each day for it to count ✦</div>
            </div>
          </div>

          {duoSent ? (
            <div style={{textAlign:"center",fontFamily:"Pixelify Sans,monospace",fontSize:14,color:"var(--rose)",padding:"24px 0"}}>
              Quest request sent! ✦
            </div>
          ) : <>
            <div className="friends-settings-label" style={{marginBottom:8}}>✦ Select Your Quest</div>

            <div className="habit-pick-grid" style={{gridTemplateColumns:"repeat(2,1fr)",marginBottom:0}}>
              {duoQuests.map(q=>{
                const isSel = duoSelectedIds.has(q.id);
                const isEditing = duoEditIconFor === q.id;
                return (
                  <div key={q.id}
                    className={"habit-card"+(isSel?" active":"")+(isEditing?" icon-editing":"")}
                    style={{position:"relative",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"8px 4px",gap:4}}
                    onClick={()=>{ setDuoSelectedIds(prev=>{ const n=new Set(prev); n.has(q.id)?n.delete(q.id):n.add(q.id); return n; }); setDuoEditIconFor(null); }}>
                    <span className="habit-card-icon" title="Change icon"
                      onClick={e=>{ e.stopPropagation(); setDuoEditIconFor(duoEditIconFor===q.id?null:q.id); }}>
                      <HabitIcon kind={q.kind} size={28}/>
                    </span>
                    <span style={{overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",fontSize:11,lineHeight:1.3,width:"100%"}}>{q.label}</span>
                  </div>
                );
              })}
            </div>

            {duoEditIconFor && (
              <div className="pu-picker-panel" style={{marginBottom:8,marginTop:8}}>
                <div className="pu-picker-title">
                  Change icon
                  <button onClick={()=>setDuoEditIconFor(null)} style={{float:"right",background:"none",border:"none",cursor:"pointer",color:"var(--plum-soft)"}}>✕</button>
                </div>
                <div className="pu-icon-grid">
                  {DUO_ALL_ICONS.map(ic=>(
                    <button key={ic} title={ic}
                      className={"pu-icon-btn"+(duoQuests.find(q=>q.id===duoEditIconFor)?.kind===ic?" on":"")}
                      onClick={()=>{ setDuoQuests(prev=>prev.map(q=>q.id===duoEditIconFor?{...q,kind:ic}:q)); }}>
                      <img src={`assets/icon-${ic}.png?v=5`} alt={ic}
                        style={{width:28,height:28,imageRendering:"pixelated"}}
                        onError={e=>{e.currentTarget.src="assets/icon-sparkle.png";e.currentTarget.onerror=null;}}/>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!duoShowCustom ? (
              <button className="add-custom" style={{marginTop:8,marginBottom:4}}
                onClick={()=>setDuoShowCustom(true)}>
                + Add Custom Quest
              </button>
            ) : (
              <div className="pu-picker-panel" style={{marginTop:8,marginBottom:4}}>
                <div className="pu-custom-row" style={{marginBottom:8}}>
                  <HabitIcon kind={duoCustomKind} size={28}/>
                  <input autoFocus value={duoCustomDraft}
                    onChange={e=>setDuoCustomDraft(e.target.value.slice(0,40))}
                    onKeyDown={e=>{
                      if(e.key==="Enter"&&duoCustomDraft.trim()){
                        setDuoQuests(prev=>[...prev,{id:"custom-"+Date.now(),label:duoCustomDraft.trim(),kind:duoCustomKind}]);
                        setDuoCustomDraft(""); setDuoShowCustom(false); setDuoCustomKind("sparkle");
                      }
                      if(e.key==="Escape"){setDuoShowCustom(false);setDuoCustomDraft("");}
                    }}
                    placeholder="e.g. Evening yoga…" maxLength={40}
                    className="pu-add-input" style={{flex:1}}/>
                  <button className="chip" onClick={()=>{
                    if(!duoCustomDraft.trim()) return;
                    setDuoQuests(prev=>[...prev,{id:"custom-"+Date.now(),label:duoCustomDraft.trim(),kind:duoCustomKind}]);
                    setDuoCustomDraft(""); setDuoShowCustom(false); setDuoCustomKind("sparkle");
                  }}>Add</button>
                  <button className="chip" onClick={()=>{setDuoShowCustom(false);setDuoCustomDraft("");setDuoCustomKind("sparkle");}}>✕</button>
                </div>
                <div className="pu-icon-grid">
                  {DUO_ALL_ICONS.map(ic=>(
                    <button key={ic} title={ic}
                      className={"pu-icon-btn"+(duoCustomKind===ic?" on":"")}
                      onClick={()=>setDuoCustomKind(ic)}>
                      <img src={`assets/icon-${ic}.png?v=5`} alt={ic}
                        style={{width:28,height:28,imageRendering:"pixelated"}}
                        onError={e=>{e.currentTarget.src="assets/icon-sparkle.png";e.currentTarget.onerror=null;}}/>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="friends-settings-label" style={{marginTop:14,marginBottom:8}}>Number of days</div>
            <div className="duo-days-row">
              {[7,21,90].map(d=>(
                <button key={d} className={"duo-day-btn"+((!duoDaysCustom && duoDays===d)?" selected":"")}
                  onClick={()=>{ setDuoDays(d); setDuoDaysCustom(false); }}>
                  {d}
                </button>
              ))}
              <button className={"duo-day-btn"+(duoDaysCustom?" selected":"")}
                onClick={()=>{ setDuoDaysCustom(true); setDuoDays(null); }}>
                Custom
              </button>
            </div>
            {duoDaysCustom && (
              <input type="number" min={1} max={365}
                className="friends-custom-input"
                style={{marginTop:6,padding:"8px 12px",width:"100%",boxSizing:"border-box"}}
                placeholder="How many days?"
                value={duoDays || ""}
                onChange={e=>{ const v=parseInt(e.target.value); setDuoDays(v>0?v:null); }}
              />
            )}

            <div className="friends-settings-label" style={{marginTop:14,marginBottom:6}}>Reward (optional)</div>
            <textarea className="friends-custom-input"
              value={duoReward}
              onChange={e=>setDuoReward(e.target.value.slice(0,80))}
              placeholder="What do you both get for finishing? ✦"
              rows={2} disabled={duoSending}
            />

            <button className="friends-btn-primary"
              onClick={sendDuoRequest}
              disabled={duoSending || !duoSelectedIds.size || !duoDays}
              style={{marginTop:20,width:"100%"}}>
              {duoSending ? "Sending…" : `Send ${duoSelectedIds.size||""} Quest${duoSelectedIds.size!==1?"s":""} ✦`}
            </button>
          </>}
        </div>
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
            {editingUn ? (
              <div style={{display:"flex",flexDirection:"column",gap:6,width:"100%",marginTop:6}}>
                <input
                  className="friends-un-input"
                  value={editUnInput}
                  onChange={e=>{ setEditUnInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,"")); setEditUnError(""); }}
                  onKeyDown={e=>e.key==="Enter"&&saveEditUsername()}
                  placeholder={username}
                  maxLength={20}
                  autoFocus
                  style={{maxWidth:"100%",boxSizing:"border-box"}}
                />
                {editUnError && (
                  <span style={{fontFamily:"Silkscreen,monospace",fontSize:8,color:"var(--rose)"}}>
                    {editUnError}
                  </span>
                )}
                <div style={{display:"flex",gap:8}}>
                  <button className="friends-btn-primary" onClick={saveEditUsername} disabled={savingEditUn}>
                    {savingEditUn?"Saving…":"Save ✦"}
                  </button>
                  <button className="friends-btn-cancel" onClick={()=>{ setEditingUn(false); setEditUnError(""); }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{display:"flex",alignItems:"center",gap:10,marginTop:4}}>
                <span className="friends-un-badge">@{username}</span>
                <button className="friends-btn-edit" onClick={()=>{ setEditUnInput(username); setEditingUn(true); }}>
                  Edit
                </button>
              </div>
            )}
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
                  <FriendIcon animal={sr.found.animal} size={52}/>
                  <div className="friends-result-info">
                    <div className="friends-result-name">{firstName(sr.found.name)||sr.found.username}</div>
                    <div className="friends-result-un">@{sr.found.username}</div>
                  </div>
                  {sr.rel?.status==="accepted"
                    ? <span className="friends-rel-tag">Friends ✦</span>
                    : (sr.rel?.status==="pending" || addStatus[sr.found.id]==="sent")
                      ? <span className="friends-rel-tag">Sent ✦</span>
                      : addStatus[sr.found.id] && addStatus[sr.found.id]!=="sending"
                        ? <span className="friends-rel-tag" style={{color:"var(--rose)",fontSize:8}}>{addStatus[sr.found.id]}</span>
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
    <div className="friends-panel panel">
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
          <button className="friends-icon-btn" style={{position:"relative"}} onClick={()=>{
            const text = `Join me on Serenity Quest — a daily wellness journey ✦\nFind me as @${username}\nhttps://app.serenityartnhome.com`;
            if(navigator.share) {
              navigator.share({title:"Serenity Quest",text,url:"https://app.serenityartnhome.com"}).catch(()=>{});
            } else {
              navigator.clipboard?.writeText(text).then(()=>{
                setShareCopied(true);
                setTimeout(()=>setShareCopied(false), 2200);
              }).catch(()=>{});
            }
          }} title="Invite friends">
            <img src="assets/icon-share.png?v=1" width={28} height={28}
                 style={{imageRendering:"pixelated"}} alt="share"/>
            {shareCopied && (
              <span style={{
                position:"absolute",bottom:-28,left:"50%",transform:"translateX(-50%)",
                background:"var(--plum)",color:"#fff",fontFamily:"Pixelify Sans,monospace",
                fontSize:10,padding:"3px 8px",whiteSpace:"nowrap",pointerEvents:"none",
                boxShadow:"2px 2px 0 rgba(0,0,0,.3)"
              }}>✓ Copied!</span>
            )}
          </button>
        </div>
      </div>

      {loading && <div className="friends-loading">Loading…</div>}
      {!loading && loadError && (
        <div className="friends-empty">
          <p>Couldn't load — check your connection.</p>
          <button className="friends-btn-primary" onClick={load} style={{marginTop:12}}>
            Try again ✦
          </button>
        </div>
      )}

      {!loading && newlyAccepted.length > 0 && (
        <div className="friends-accepted-banner">
          {newlyAccepted.map(p=>(
            <div key={p.id} className="friends-accepted-row">
              <FriendIcon animal={p.animal} size={32}/>
              <span>✦ <strong>{firstName(p.name)||p.username}</strong> accepted your friend request!</span>
              <button className="friends-accepted-dismiss"
                onClick={()=>setNewlyAccepted(a=>a.filter(x=>x.id!==p.id))}>✕</button>
            </div>
          ))}
        </div>
      )}

      {!loading && <>
        {/* Duo Quest promo */}
        <div className="duo-quest-empty" style={{marginBottom:10}}
          onClick={()=>{ if(friends.length>0) setView("list"); }}>
          <div>
            <div className="duo-quest-label" style={{marginBottom:3}}>⚔ Duo Quest ✦</div>
            <div style={{fontFamily:"Pixelify Sans,monospace",fontSize:12,color:"var(--plum)",fontWeight:600,marginBottom:2}}>Go on an adventure with a companion</div>
            <div style={{fontFamily:"Pixelify Sans,monospace",fontSize:10,color:"var(--plum-soft)"}}>Tap Duo ✦ on any friend to begin your journey</div>
          </div>
          <span style={{fontFamily:"Silkscreen,monospace",fontSize:10,color:"var(--rose)"}}>⚔</span>
        </div>

        {/* Pending duo quest requests */}
        {duoPendingIn.length > 0 && (
          <div className="friends-section">
            <div className="quest-section-label" style={{color:"var(--rose)"}}>✦ Duo Quest Invites</div>
            {duoPendingIn.map(d=>(
              <div key={d.id} className="friends-request-card">
                <FriendIcon animal={d.requester?.animal} size={40}/>
                <div className="friends-request-info">
                  <div className="friends-request-name">{firstName(d.requester?.name)||d.requester?.username||"A friend"}</div>
                  <div className="friends-request-un" style={{fontSize:9,color:"var(--plum)"}}>{d.quest_name}</div>
                  <div className="friends-request-un">{d.total_days} days</div>
                </div>
                <div className="friends-request-btns">
                  <button className="friends-btn-accept" onClick={()=>acceptDuoRequest(d.id)}>Accept</button>
                  <button className="friends-btn-decline" onClick={()=>declineDuoRequest(d.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pending requests */}
        {pendingIn.length > 0 && (
          <div className="friends-section">
            <div className="quest-section-label">Friend Requests</div>
            {pendingIn.map(p=>(
              <div key={p.id} className="friends-request-card">
                <FriendIcon animal={p.animal} size={40}/>
                <div className="friends-request-info">
                  <div className="friends-request-name">{firstName(p.name)||p.username}</div>
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
                <FriendIcon animal={f.animal} size={48}/>
                <div className="friends-card-info">
                  <div className="friends-card-name">{firstName(f.name)||f.username}</div>
                  <div className="friends-card-un">@{f.username}</div>
                  {(f.share_mood !== false) && f.today_mood && (
                    <div className="friends-card-mood">
                      <MoodIcon mood={f.today_mood} size={18}/> {f.today_mood}
                    </div>
                  )}
                  {f.share_gratitude && f.today_gratitude?.some(g=>g) && (
                    <div className="friends-card-grat">
                      "{(f.today_gratitude.find(g=>g)||"").slice(0,42)}{(f.today_gratitude.find(g=>g)||"").length>42?"…":""}"
                    </div>
                  )}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  <button className="friends-send-btn"
                          onClick={()=>{ setComposeTo(f); setView("compose"); }}>
                    Send ✦
                  </button>
                  <button className="friends-send-btn" style={{fontSize:8,padding:"5px 10px",background:"var(--plum)"}}
                          onClick={()=>{ setDuoTarget(f); setDuoQuests(DUO_PRESETS.map(q=>({...q}))); setDuoSelectedIds(new Set()); setView("duo-request"); }}>
                    Duo ✦
                  </button>
                </div>
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
