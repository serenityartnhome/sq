function Tweaks({ state, setState }){
  const setKey = (k,v)=>{
    setState(s=>({...s,[k]:v}));
    window.parent?.postMessage({type:"__edit_mode_set_keys", edits:{[k]:v}},"*");
  };
  return (
    <div className="tweaks">
      <h4>Tweaks ✦</h4>

      <div className="tweak-row">
        <label>Palette</label>
        <div className="tweak-chips">
          {["dusk","mint","twilight"].map(p=>(
            <button key={p} className={state.palette===p?"on":""} onClick={()=>setKey("palette",p)}>{p}</button>
          ))}
        </div>
      </div>

      <div className="tweak-row">
        <label>Pet mood</label>
        <div className="tweak-chips">
          {["calm","happy"].map(p=>(
            <button key={p} className={state.petMood===p?"on":""} onClick={()=>setKey("petMood",p)}>{p}</button>
          ))}
        </div>
      </div>

    </div>
  );
}

window.Tweaks = Tweaks;
