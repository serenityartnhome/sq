function CommunityBoard({ userId, displayName }) {
  const [posts, setPosts]   = React.useState([]);
  const [liked, setLiked]   = React.useState(new Set());
  const [newPost, setNewPost] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [posting, setPosting] = React.useState(false);
  const [err, setErr]       = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true); setErr(null);
      try {
        const { data: postsData, error: postsErr } = await window.SB
          .from("gratitude_posts").select("*")
          .order("created_at", { ascending: false }).limit(50);
        if (cancelled) return;
        if (postsErr || !postsData) { setErr("Could not load posts."); setLoading(false); return; }

        const { data: likesData } = await window.SB.from("post_likes").select("post_id, user_id");
        if (cancelled) return;

        const likes = likesData || [];
        const countMap = {};
        likes.forEach(l => { countMap[l.post_id] = (countMap[l.post_id] || 0) + 1; });

        setPosts(postsData.map(p => ({ ...p, likeCount: countMap[p.id] || 0 })));
        if (userId) setLiked(new Set(likes.filter(l => l.user_id === userId).map(l => l.post_id)));
      } catch(e) {
        if (!cancelled) setErr("Could not load posts.");
      }
      if (!cancelled) setLoading(false);
    };
    run();
    return () => { cancelled = true; };
  }, []);

  const submitPost = async () => {
    const text = newPost.trim();
    if (!text || posting || !userId) return;
    setPosting(true);
    try {
      const { data, error } = await window.SB.from("gratitude_posts").insert({
        user_id: userId, display_name: displayName || "Adventurer", content: text
      }).select().single();
      if (!error && data) {
        setPosts(prev => [{ ...data, likeCount: 0 }, ...prev]);
        setNewPost("");
      }
    } catch{}
    setPosting(false);
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
    } catch{}
  };

  const deletePost = async (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    try {
      await window.SB.from("post_likes").delete().eq("post_id", postId);
      await window.SB.from("gratitude_posts").delete().eq("id", postId);
    } catch{}
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
    <div style={{maxWidth:680,margin:"0 auto",padding:"16px 0 40px"}}>
      <div className="div-sparkle" style={{marginBottom:16}}>✦ Community Gratitude ✦</div>
      <div style={{textAlign:"center",fontSize:12,color:"var(--plum-soft)",
                   fontFamily:"Pixelify Sans,monospace",marginBottom:20}}>
        See what others are grateful for today
      </div>

      {userId ? (
        <div className="panel" style={{marginBottom:16}}>
          <div style={{fontSize:12,color:"var(--plum-soft)",fontFamily:"Pixelify Sans,monospace",marginBottom:8}}>
            Share what you're grateful for ✦
          </div>
          <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
            <textarea value={newPost} onChange={e=>setNewPost(e.target.value.slice(0,200))}
              placeholder="Today I'm grateful for…"
              style={{flex:1,minHeight:56,resize:"none"}}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submitPost();}}}/>
            <button className="btn-primary" onClick={submitPost}
              disabled={posting||!newPost.trim()}
              style={{flexShrink:0,padding:"8px 14px",height:56}}>
              {posting ? "…" : "✦ Share"}
            </button>
          </div>
          <div className="charcount">{newPost.length}/200</div>
        </div>
      ) : (
        <div className="panel" style={{marginBottom:16,textAlign:"center",
                                        color:"var(--plum-soft)",fontSize:12,
                                        fontFamily:"Silkscreen,monospace"}}>
          Log in to share your gratitude ✦
        </div>
      )}

      {loading ? (
        <div style={{textAlign:"center",padding:40,fontFamily:"Silkscreen,monospace",
                     fontSize:12,color:"var(--plum-soft)"}}>
          Loading…
        </div>
      ) : err ? (
        <div style={{textAlign:"center",padding:40,fontFamily:"Silkscreen,monospace",
                     fontSize:12,color:"var(--plum-soft)"}}>
          {err}
        </div>
      ) : posts.length === 0 ? (
        <div style={{textAlign:"center",padding:40,fontFamily:"Silkscreen,monospace",
                     fontSize:12,color:"var(--plum-soft)"}}>
          Be the first to share ✦
        </div>
      ) : (
        posts.map(post => (
          <div key={post.id} className="panel" style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,color:"var(--plum)",marginBottom:6,
                             fontFamily:"Pixelify Sans,monospace",lineHeight:1.5}}>
                  {post.content}
                </div>
                <div style={{fontSize:10,color:"var(--plum-soft)",fontFamily:"Silkscreen,monospace"}}>
                  ✦ {post.display_name || "Adventurer"} · {timeAgo(post.created_at)}
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <button onClick={()=>toggleLike(post.id)}
                  style={{background:liked.has(post.id)?"var(--blush)":"var(--cream)",
                           border:`2px solid ${liked.has(post.id)?"var(--rose)":"var(--gold-soft)"}`,
                           borderRadius:6,cursor:userId?"pointer":"default",
                           padding:"4px 10px",display:"flex",alignItems:"center",gap:4,
                           color:"var(--plum)",fontFamily:"Silkscreen,monospace",fontSize:11}}>
                  <Icon name="heart" size={14}/>
                  {post.likeCount}
                </button>
                {userId === post.user_id && (
                  <button onClick={()=>deletePost(post.id)}
                    style={{background:"none",border:"none",cursor:"pointer",
                             color:"var(--plum-soft)",fontSize:10,fontFamily:"Silkscreen,monospace"}}>
                    delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

window.CommunityBoard = CommunityBoard;
