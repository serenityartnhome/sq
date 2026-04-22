const ADMIN_EMAIL = "serenityartnhome@gmail.com";

function CommunityBoard({ userId, pendingReports, onReportClear, isAdmin }) {
  const [posts, setPosts]         = React.useState([]);
  const [liked, setLiked]         = React.useState(new Set());
  const [reported, setReported]   = React.useState(new Set());
  const [reportConfirm, setReportConfirm] = React.useState(null);
  const [loading, setLoading]     = React.useState(true);
  const [err, setErr]             = React.useState(null);
  const [flagged, setFlagged]       = React.useState([]);
  const [showAdmin, setShowAdmin]   = React.useState(()=> pendingReports > 0);
  const [adminLoading, setAdminLoading] = React.useState(false);
  const [adminStats, setAdminStats] = React.useState(null);

  const hashAnimal = (str) => {
    const animals = ["rat","ox","tiger","rabbit","dragon","snake","horse","goat","monkey","rooster","dog","pig"];
    let h = 0;
    for(let i = 0; i < (str||"").length; i++) h = (Math.imul(31, h) + (str||"").charCodeAt(i)) | 0;
    return animals[Math.abs(h) % animals.length];
  };

  const loadPosts = async () => {
    setLoading(true); setErr(null);
    try {
      const { data: postsData, error: postsErr } = await window.SB
        .from("gratitude_posts").select("*")
        .order("created_at", { ascending: false }).limit(60);
      if (postsErr || !postsData) { setErr("Could not load posts."); setLoading(false); return; }

      const { data: likesData }   = await window.SB.from("post_likes").select("post_id, user_id");
      const { data: reportsData } = await window.SB.from("post_reports").select("post_id, user_id");

      const likes   = likesData   || [];
      const reports = reportsData || [];

      const countMap = {};
      likes.forEach(l => { countMap[l.post_id] = (countMap[l.post_id] || 0) + 1; });

      const reportCountMap = {};
      reports.forEach(r => { reportCountMap[r.post_id] = (reportCountMap[r.post_id] || 0) + 1; });

      // Hide posts with 3+ reports (pending admin review) unless admin
      const visiblePosts = postsData.filter(p => isAdmin || (reportCountMap[p.id] || 0) < 3);

      const mapped = visiblePosts.map(p => ({
        ...p,
        likeCount: countMap[p.id] || 0,
        reportCount: reportCountMap[p.id] || 0
      }));
      mapped.sort((a, b) => {
        const aOwn = a.user_id === userId ? 0 : 1;
        const bOwn = b.user_id === userId ? 0 : 1;
        if(aOwn !== bOwn) return aOwn - bOwn;
        return new Date(b.created_at) - new Date(a.created_at);
      });
      setPosts(mapped);

      if (userId) {
        setLiked(new Set(likes.filter(l => l.user_id === userId).map(l => l.post_id)));
        setReported(new Set(reports.filter(r => r.user_id === userId).map(r => r.post_id)));
      }
    } catch {
      setErr("Could not load posts.");
    }
    setLoading(false);
  };

  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await loadPosts();
      if(cancelled) return;
      if(isAdmin) loadFlagged();
    };
    run();
    return () => { cancelled = true; };
  }, []);

  const loadFlagged = async () => {
    setAdminLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const [{ data: modData }, { data: profileData }, { data: postsData }, { data: activeData }, { data: newData }] = await Promise.all([
        window.SB.from("moderation_log").select("*").order("created_at", {ascending:false}),
        window.SB.from("profiles").select("id"),
        window.SB.from("gratitude_posts").select("id"),
        window.SB.from("daily_data").select("user_id").eq("date", today),
        window.SB.from("profiles").select("id").gte("created_at", today+"T00:00:00").lt("created_at", today+"T23:59:59"),
      ]);
      setFlagged(modData || []);
      setAdminStats({
        users:   (profileData || []).length,
        posts:   (postsData   || []).length,
        active:  (activeData  || []).length,
        newToday:(newData     || []).length,
        reports: (modData     || []).length,
      });
    } catch {}
    setAdminLoading(false);
  };

  const adminBan = async (entry) => {
    try {
      await window.SB.from("banned_users").insert({ user_id: entry.user_id, reason: "admin ban" });
      await window.SB.from("gratitude_posts").delete().eq("user_id", entry.user_id);
      await window.SB.from("moderation_log").delete().eq("post_id", entry.post_id);
      setFlagged(prev => {
        const next = prev.filter(f => f.post_id !== entry.post_id);
        if(next.length === 0 && onReportClear) onReportClear();
        return next;
      });
      setPosts(prev => prev.filter(p => p.user_id !== entry.user_id));
    } catch {}
  };

  const adminDismiss = async (entry) => {
    try {
      await window.SB.from("moderation_log").delete().eq("post_id", entry.post_id);
      setFlagged(prev => {
        const next = prev.filter(f => f.post_id !== entry.post_id);
        if(next.length === 0 && onReportClear) onReportClear();
        return next;
      });
    } catch {}
  };

  const toggleLike = async (postId) => {
    if (!userId) return;
    const isLiked = liked.has(postId);
    setLiked(prev => { const n = new Set(prev); isLiked ? n.delete(postId) : n.add(postId); return n; });
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likeCount: p.likeCount + (isLiked ? -1 : 1) } : p));
    try {
      if (isLiked) {
        await window.SB.from("post_likes").delete().match({ user_id: userId, post_id: postId });
      } else {
        await window.SB.from("post_likes").insert({ user_id: userId, post_id: postId });
      }
    } catch {}
  };

  const confirmReport = (postId) => {
    if (!userId || reported.has(postId)) return;
    setReportConfirm(postId);
  };

  const doReport = async (postId) => {
    setReportConfirm(null);
    setReported(prev => { const n = new Set(prev); n.add(postId); return n; });
    // Hide immediately for this user
    setPosts(prev => prev.filter(p => p.id !== postId));
    try {
      await window.SB.from("post_reports").insert({ user_id: userId, post_id: postId });
      const { data: reportData } = await window.SB.from("post_reports").select("post_id").eq("post_id", postId);
      if (reportData && reportData.length >= 3) {
        const post = posts.find(p => p.id === postId);
        if (post) {
          await window.SB.from("moderation_log").insert({
            post_id: String(postId),
            user_id: post.user_id,
            display_name: post.display_name,
            content: post.content,
            reason: "3 reports — pending review"
          });
        }
      }
    } catch {}
  };

  const deletePost = async (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    const { error: e1 } = await window.SB.from("post_likes").delete().eq("post_id", postId);
    const { error: e2 } = await window.SB.from("post_reports").delete().eq("post_id", postId);
    const { error: e3 } = await window.SB.from("gratitude_posts").delete().eq("id", postId);
    if(e3) {
      console.error("Delete failed:", e3.message);
      // Revert optimistic remove and show error
      setErr("Delete failed: " + e3.message);
      loadPosts();
    }
  };

  const timeAgo = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="grat-wall">
      <div className="grat-wall-header">
        <h2 className="grat-wall-title">✦ Gratitude Wall ✦</h2>
        <div className="grat-wall-sub">Share what you're grateful for from your Daily Quest</div>
      </div>

      {/* Admin panel */}
      {isAdmin && (
        <div style={{marginBottom:16,background:"rgba(255,240,245,.9)",border:"3px solid rgba(201,127,165,.6)",boxShadow:"4px 4px 0 rgba(201,127,165,.35)",padding:"12px 14px"}}>

          {/* Stats row — always visible */}
          {adminStats && (
            <div style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap"}}>
              {[
                { label:"Adventurers", value: adminStats.users    },
                { label:"New Today",   value: adminStats.newToday },
                { label:"Active Today",value: adminStats.active   },
                { label:"Wall Posts",  value: adminStats.posts    },
                { label:"Reports",     value: adminStats.reports  },
              ].map(s => (
                <div key={s.label} style={{
                  flex:"1 1 80px",
                  background:"rgba(255,255,255,.7)", border:"2px solid rgba(201,127,165,.4)",
                  boxShadow:"2px 2px 0 rgba(201,127,165,.2)", padding:"8px 12px", textAlign:"center"
                }}>
                  <div style={{fontFamily:"Silkscreen,monospace",fontSize:20,color:"var(--rose)",lineHeight:1.2}}>{s.value}</div>
                  <div style={{fontFamily:"Pixelify Sans,monospace",fontSize:11,color:"var(--plum-soft)",marginTop:2}}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Reports header */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontFamily:"Silkscreen,monospace",fontSize:10,color:"var(--plum)",display:"flex",alignItems:"center",gap:8}}>
              Reports
              {flagged.length > 0 && (
                <span style={{background:"var(--rose)",color:"#fff",padding:"1px 7px",fontSize:10}}>
                  {flagged.length}
                </span>
              )}
            </div>
            <button onClick={()=>{ setShowAdmin(v=>!v); if(!showAdmin) loadFlagged(); }}
              style={{background:"none",border:"none",cursor:"pointer",fontFamily:"Silkscreen,monospace",fontSize:10,color:"var(--rose)",textDecoration:"underline"}}>
              {showAdmin ? "Hide" : "Review"}
            </button>
          </div>

          {showAdmin && (
            adminLoading ? (
              <div style={{fontSize:12,fontFamily:"Pixelify Sans,monospace",color:"var(--plum-soft)"}}>Loading…</div>
            ) : flagged.length === 0 ? (
              <div style={{fontSize:12,fontFamily:"Pixelify Sans,monospace",color:"var(--plum-soft)"}}>No flagged posts ✦</div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {flagged.map(entry => (
                  <div key={entry.post_id} style={{background:"#fff8ec",border:"2px solid #e9c98a",boxShadow:"2px 2px 0 rgba(201,127,165,.2)",padding:"8px 10px"}}>
                    <div style={{fontFamily:"Silkscreen,monospace",fontSize:10,color:"var(--plum)",marginBottom:4,display:"flex",justifyContent:"space-between"}}>
                      <span>{entry.display_name}</span>
                      <span style={{color:"#8b1a1a",fontSize:9}}>{entry.reason}</span>
                    </div>
                    <div style={{fontFamily:"Pixelify Sans,monospace",fontSize:12,color:"var(--plum-soft)",marginBottom:8,lineHeight:1.5}}>
                      "{entry.content}"
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>adminBan(entry)}
                        style={{background:"#8b1a1a",color:"#fff",border:"none",fontFamily:"Silkscreen,monospace",
                                fontSize:10,padding:"5px 12px",cursor:"pointer",textTransform:"uppercase"}}>
                        Ban User
                      </button>
                      <button onClick={()=>adminDismiss(entry)}
                        style={{background:"#f5c9cc",color:"#5c2a35",border:"2px solid #e39aa0",fontFamily:"Silkscreen,monospace",
                                fontSize:10,padding:"5px 12px",cursor:"pointer",textTransform:"uppercase"}}>
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* Report confirmation dialog */}
      {reportConfirm && (
        <div className="coming-soon-overlay" onClick={()=>setReportConfirm(null)}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()} style={{maxWidth:300,width:"88%",textAlign:"center"}}>
            <h3 className="coming-soon-title" style={{fontSize:13,marginBottom:20}}>Report this post?</h3>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button onClick={()=>doReport(reportConfirm)}
                style={{background:"rgba(192,57,43,.15)",color:"#8b1a1a",border:"2px solid #c0392b",
                        fontFamily:"Silkscreen,monospace",fontSize:11,padding:"8px 16px",cursor:"pointer",
                        textTransform:"uppercase",boxShadow:"none"}}>
                Yes
              </button>
              <button onClick={()=>setReportConfirm(null)}
                style={{background:"#fff8ec",color:"#5c2a35",border:"2px solid #e9c98a",
                        fontFamily:"Silkscreen,monospace",fontSize:11,padding:"8px 16px",cursor:"pointer",
                        textTransform:"uppercase",boxShadow:"none"}}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grat-wall-empty">Loading…</div>
      ) : err ? (
        <div className="grat-wall-empty">{err}</div>
      ) : posts.length === 0 ? (
        <div className="grat-wall-empty">
          No gratitudes shared yet ✦<br/>
          <span style={{fontSize:11,fontFamily:"Pixelify Sans,monospace"}}>
            Share yours from the Daily Quest gratitude section!
          </span>
        </div>
      ) : (
        <div className="grat-wall-grid">
          {posts.map(post => {
            const animal = post.animal || hashAnimal(post.user_id || post.display_name);
            const firstName = (post.display_name||"Adventurer").trim().split(" ")[0];
            const isLiked = liked.has(post.id);
            const isReported = reported.has(post.id);
            const isOwn = userId === post.user_id;
            const streak = post.streak || 0;
            const avatarEl = <img src={`assets/icon-account-${animal}.png`} alt={animal}
                style={{width:24,height:24,imageRendering:"pixelated",display:"block"}}
                onError={e=>{e.currentTarget.style.opacity=0;}}/>;
            return (
              <div key={post.id} className="grat-card"
                style={isAdmin && post.reportCount >= 3 ? {borderColor:"#c0392b",opacity:.85} : {}}>
                <div className="grat-card-top">
                  <div className="grat-card-avatar">{avatarEl}</div>
                  <div className="grat-card-meta">
                    <div className="grat-card-name">{firstName}</div>
                    {post.loc && post.loc.trim() && <div className="grat-card-loc">{post.loc.trim()}</div>}
                  </div>
                  <div className="grat-card-streak">
                    <img src="assets/icon-flame.png?v=5" alt="flame"
                      style={{width:14,height:14,imageRendering:"pixelated",verticalAlign:"middle"}}/>
                    <span>{streak}</span>
                  </div>
                </div>
                <div className="grat-card-content">✦ {post.content}</div>
                <div className="grat-card-footer">
                  <div className="grat-card-time">{timeAgo(post.created_at)}</div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    {(isOwn || (isAdmin && !isOwn)) && (
                      <button onClick={()=>deletePost(post.id)} className="grat-card-delete">del</button>
                    )}
                    {!isOwn && userId && (
                      <button onClick={()=>confirmReport(post.id)}
                        className={"grat-card-report"+(isReported?" reported":"")}
                        disabled={isReported} title="Report this post">
                        {isReported ? "⚑" : "⚑"}
                      </button>
                    )}
                    <button onClick={()=>toggleLike(post.id)} className={"grat-card-like"+(isLiked?" liked":"")}>
                      ♥ {post.likeCount}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

window.CommunityBoard = CommunityBoard;
