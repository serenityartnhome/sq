function CommunityBoard({ userId }) {
  const [posts, setPosts]       = React.useState([]);
  const [liked, setLiked]       = React.useState(new Set());
  const [reported, setReported] = React.useState(new Set());
  const [loading, setLoading]   = React.useState(true);
  const [err, setErr]           = React.useState(null);

  const hashAnimal = (str) => {
    const animals = ["rat","ox","tiger","rabbit","dragon","snake","horse","goat","monkey","rooster","dog","pig"];
    let h = 0;
    for(let i = 0; i < (str||"").length; i++) h = (Math.imul(31, h) + (str||"").charCodeAt(i)) | 0;
    return animals[Math.abs(h) % animals.length];
  };

  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true); setErr(null);
      try {
        const { data: postsData, error: postsErr } = await window.SB
          .from("gratitude_posts").select("*")
          .order("created_at", { ascending: false }).limit(60);
        if (cancelled) return;
        if (postsErr || !postsData) { setErr("Could not load posts."); setLoading(false); return; }

        const { data: likesData } = await window.SB.from("post_likes").select("post_id, user_id");
        if (cancelled) return;

        const { data: reportsData } = await window.SB.from("post_reports").select("post_id, user_id");
        if (cancelled) return;

        const likes = likesData || [];
        const reports = reportsData || [];

        const countMap = {};
        likes.forEach(l => { countMap[l.post_id] = (countMap[l.post_id] || 0) + 1; });

        const reportCountMap = {};
        reports.forEach(r => { reportCountMap[r.post_id] = (reportCountMap[r.post_id] || 0) + 1; });

        // Filter out posts with 3+ reports
        const visiblePosts = postsData.filter(p => (reportCountMap[p.id] || 0) < 3);

        setPosts(visiblePosts.map(p => ({ ...p, likeCount: countMap[p.id] || 0 })));
        if (userId) {
          setLiked(new Set(likes.filter(l => l.user_id === userId).map(l => l.post_id)));
          setReported(new Set(reports.filter(r => r.user_id === userId).map(r => r.post_id)));
        }
      } catch {
        if (!cancelled) setErr("Could not load posts.");
      }
      if (!cancelled) setLoading(false);
    };
    run();
    return () => { cancelled = true; };
  }, []);

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

  const reportPost = async (postId) => {
    if (!userId || reported.has(postId)) return;
    setReported(prev => { const n = new Set(prev); n.add(postId); return n; });
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
            reason: "auto-reported"
          });
        }
        setPosts(prev => prev.filter(p => p.id !== postId));
        await window.SB.from("post_likes").delete().eq("post_id", postId);
        await window.SB.from("post_reports").delete().eq("post_id", postId);
        await window.SB.from("gratitude_posts").delete().eq("id", postId);
      }
    } catch {}
  };

  const deletePost = async (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    try {
      await window.SB.from("post_likes").delete().eq("post_id", postId);
      await window.SB.from("post_reports").delete().eq("post_id", postId);
      await window.SB.from("gratitude_posts").delete().eq("id", postId);
    } catch {}
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
            return (
              <div key={post.id} className="grat-card">
                <div className="grat-card-heart-deco">♡</div>
                <div className="grat-card-top">
                  <div className="grat-card-avatar">
                    <img src={`assets/icon-account-${animal}.png?v=1`} alt={animal}
                      style={{width:52,height:52,imageRendering:"pixelated",display:"block"}}
                      onError={e=>{e.target.style.opacity=0;}}/>
                  </div>
                  <div className="grat-card-meta">
                    <div className="grat-card-name">{firstName}</div>
                    {post.loc && post.loc.trim() && <div className="grat-card-loc">{post.loc.trim()}</div>}
                    <div className="grat-card-time">{timeAgo(post.created_at)}</div>
                  </div>
                  {post.streak > 1 && (
                    <div className="grat-card-streak">
                      <img src="assets/icon-flame.png?v=5" alt="streak"
                        style={{width:14,height:14,imageRendering:"pixelated",verticalAlign:"middle"}}/>
                      <span>{post.streak}</span>
                    </div>
                  )}
                </div>
                <div className="grat-card-content">✦ {post.content}</div>
                <div className="grat-card-footer">
                  {isOwn ? (
                    <button onClick={()=>deletePost(post.id)} className="grat-card-delete">delete</button>
                  ) : userId && (
                    <button onClick={()=>reportPost(post.id)}
                      className={"grat-card-report"+(isReported?" reported":"")}
                      disabled={isReported} title="Report this post">
                      {isReported ? "⚑ reported" : "⚑"}
                    </button>
                  )}
                  <button onClick={()=>toggleLike(post.id)} className={"grat-card-like"+(isLiked?" liked":"")}>
                    ♥ {post.likeCount}
                  </button>
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
