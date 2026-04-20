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

      <div className="tweak-row">
        <label>Lanterns</label>
        <div className="tweak-chips">
          <button className={state.showLanterns?"on":""} onClick={()=>setKey("showLanterns",!state.showLanterns)}>
            {state.showLanterns?"on":"off"}
          </button>
        </div>
      </div>

      <div className="tweak-row">
        <label>Glow</label>
        <input type="range" min="0" max="1.5" step="0.1"
          value={state.glowIntensity}
          onChange={e=>setKey("glowIntensity",parseFloat(e.target.value))}/>
      </div>
    </div>
  );
}

window.Tweaks = Tweaks;
