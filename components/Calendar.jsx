const MONTH_NAMES = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];
const DAY_NAMES_SUN = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DAY_NAMES_MON = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function CalBattery({ level }){
  const pct = Math.max(0, Math.min(100, level||0));
  const color = pct >= 60 ? "var(--jade-deep)" : pct >= 30 ? "var(--gold)" : "var(--rose)";
  return (
    <div className="cal-battery-wrap">
      <span className="cal-bat-num" style={{color}}>{pct}</span>
      <div className="cal-battery">
        <div className="cal-bat-body">
          <div className="cal-bat-fill" style={{width:`${pct}%`, background:color}}/>
        </div>
        <div className="cal-bat-tip"/>
      </div>
    </div>
  );
}

function CalendarView({ habits, powerups, todayLive }){
  const [viewDate, setViewDate]   = React.useState(new Date());
  const [selectedDay, setSelectedDay] = React.useState(null);
  const [weekStartsMon, setWeekStartsMon] = React.useState(()=>{
    const stored = localStorage.getItem("sq_week_mon");
    return stored === null ? true : stored === "1";
  });
  const [quickNotes, setQuickNotes]   = React.useState(()=>{
    try{ return localStorage.getItem("sq_notes")||""; }catch{ return ""; }
  });
  const [history, setHistory] = React.useState(()=>{
    try{ return JSON.parse(localStorage.getItem("sq_history")||"{}"); }catch{ return {}; }
  });

  React.useEffect(()=>{
    const onStorage = () => {
      try{ setHistory(JSON.parse(localStorage.getItem("sq_history")||"{}")); }catch{}
    };
    window.addEventListener("storage", onStorage);
    return ()=>window.removeEventListener("storage", onStorage);
  },[]);

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const rawDow      = new Date(year, month, 1).getDay(); // 0=Sun
  const firstDow    = weekStartsMon ? (rawDow === 0 ? 6 : rawDow - 1) : rawDow;
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const todayStr    = new Date().toLocaleDateString("en-CA");
  const DAY_NAMES   = weekStartsMon ? DAY_NAMES_MON : DAY_NAMES_SUN;

  const dateKey = (d) =>
    `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

  const cells = [];
  for(let i=0; i<firstDow; i++) cells.push(null);
  for(let d=1; d<=daysInMonth; d++) cells.push(d);
  while(cells.length % 7 !== 0) cells.push(null);
  const numWeeks = cells.length / 7;

  const selKey  = selectedDay ? dateKey(selectedDay) : null;
  const selData = selKey ? history[selKey] : null;

  const saveNotes = (v) => {
    setQuickNotes(v);
    localStorage.setItem("sq_notes", v);
  };

  return (
    <div className="cal-view">

      {/* ── LEFT: calendar + quick notes ── */}
      <div className="cal-left">

        <div className="panel cal-main-panel">
          {/* Month nav */}
          <div className="cal-month-nav">
            <button className="cal-nav-btn"
              onClick={()=>setViewDate(new Date(year, month-1, 1))}>◀</button>
            <span className="cal-month-label">Month: {MONTH_NAMES[month]} {year}</span>
            <button className="cal-nav-btn"
              onClick={()=>setViewDate(new Date(year, month+1, 1))}>▶</button>
            <button className="cal-week-toggle"
              onClick={()=>setWeekStartsMon(v=>{ const n=!v; localStorage.setItem("sq_week_mon",n?"1":"0"); return n; })}
              title="Toggle week start">
              {weekStartsMon ? "Mon–Sun" : "Sun–Sat"}
            </button>
          </div>

          <div className="div-sparkle" style={{margin:"4px 0 6px"}}>✦ Journal Entries & Notes ✦</div>

          {/* Day-of-week headers */}
          <div className="cal-grid" style={{gridTemplateRows:`auto repeat(${numWeeks}, 1fr)`}}>
            {DAY_NAMES.map(d=>(
              <div key={d} className="cal-dow">{d}</div>
            ))}

            {cells.map((d,i)=>{
              if(!d) return <div key={`e${i}`} className="cal-cell cal-blank"/>;
              const key  = dateKey(d);
              const isToday    = key === todayStr;
              const data = isToday ? (history[key] || todayLive) : history[key];
              const isSelected = selectedDay === d;
              const hasJournal = data && (data.diary?.trim() ||
                data.gratitude?.some(g=>g?.trim()));
              return (
                <div key={d}
                  className={"cal-cell"
                    +(isToday    ? " cal-today"   : "")
                    +(isSelected ? " cal-selected" : "")
                    +(data       ? " cal-has-data" : "")}
                  onClick={()=>setSelectedDay(isSelected ? null : d)}>

                  <span className="cal-date-num">{d}</span>

                  {data?.mood && (
                    <img src={`assets/feel-${data.mood}.png`} alt={data.mood}
                         className="cal-mood-img"
                         onError={e=>{e.currentTarget.style.display="none";}}/>
                  )}

                  {data && (
                    <div className="cal-cell-foot">
                      <CalBattery level={data.energy||0}/>
                      {hasJournal && (
                        <img src="assets/icon-journal.png?v=4" className="cal-jour-img" alt="journal"/>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* This Month's Lesson */}
        <div className="panel cal-notes-panel">
          <div className="cal-notes-hdr">✦ This Month's Lesson</div>
          <textarea className="cal-notes-area" value={quickNotes}
            onChange={e=>saveNotes(e.target.value)}
            placeholder="What is this month teaching you…"/>
        </div>
      </div>

      {/* ── RIGHT: Insights ── */}
      <div className="cal-right">
        <div className="panel cal-insights-panel">
          {selData ? (
            <>
              <h3 className="cal-insight-title">
                ✦ Insights for {MONTH_NAMES[month]} {selectedDay}, {year} ✦
              </h3>

              {/* Intention */}
              {selData.intention && (
                <div className="cal-section">
                  <div className="div-sparkle" style={{fontSize:11,margin:"0 0 6px"}}>✦ Today's Intention ✦</div>
                  <div style={{textAlign:"center",fontFamily:"Silkscreen,monospace",
                               fontSize:13,color:"var(--rose)",padding:"4px 0"}}>
                    {selData.intention}
                  </div>
                </div>
              )}

              {/* Quests */}
              <div className="cal-section">
                <div className="div-sparkle" style={{fontSize:11,margin:"0 0 6px"}}>
                  ✦ Daily Quests Completed ({selData.completed?.length||0}/{habits.length+2}) ✦
                </div>
                {habits.map(h=>{
                  const done = selData.completed?.includes(h.id);
                  return (
                    <div key={h.id} className={"cal-check-row"+(done?" done":"")}>
                      <span className="cal-chk">{done?"✓":""}</span>
                      <HabitIcon kind={h.kind} size={14}/>
                      <span>{h.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Power-ups */}
              {selData.powerups?.length > 0 && (
                <div className="cal-section">
                  <div className="div-sparkle" style={{fontSize:11,margin:"0 0 6px"}}>✦ Power-Ups Used ✦</div>
                  {selData.powerups.map(id=>{
                    const p = powerups.find(x=>x.id===id);
                    return p ? (
                      <div key={id} className="cal-pu-row">
                        <HabitIcon kind={p.kind} size={14}/>
                        <span>{p.name}: +{p.xp} XP</span>
                      </div>
                    ) : null;
                  })}
                </div>
              )}

              {/* Journal / Gratitude */}
              {(selData.gratitude?.some(g=>g?.trim()) || selData.diary?.trim()) && (
                <div className="cal-section">
                  <div className="div-sparkle" style={{fontSize:11,margin:"0 0 6px"}}>✦ Daily Journal & Reflections ✦</div>
                  {selData.gratitude?.filter(g=>g?.trim()).map((g,i)=>(
                    <div key={i} className="cal-grat-row">{i+1}. {g}</div>
                  ))}
                  {selData.diary?.trim() && (
                    <div className="cal-diary-quote">"{selData.diary}"</div>
                  )}
                </div>
              )}

              {/* Mood */}
              <div className="cal-section">
                <div className="div-sparkle" style={{fontSize:11,margin:"0 0 6px"}}>✦ Daily Mood ✦</div>
                <div className="cal-mood-display">
                  <img src={`assets/feel-${selData.mood}.png`} alt={selData.mood}
                       style={{width:36,height:36,imageRendering:"pixelated"}}
                       onError={e=>{e.currentTarget.style.display="none";}}/>
                  <span className="cal-mood-lbl">{selData.mood}</span>
                </div>
              </div>

              {/* Photo of the Day */}
              {selData.photo && (
                <div className="cal-section">
                  <div className="div-sparkle" style={{fontSize:11,margin:"0 0 6px"}}>✦ Photo of the Day ✦</div>
                  <img src={selData.photo} alt="memory"
                    style={{width:"100%",height:"auto",maxHeight:200,objectFit:"contain",
                            border:"2px solid var(--gold)",display:"block"}}/>
                </div>
              )}
            </>
          ) : (
            <div className="cal-empty-state">
              <div className="cal-empty-glyph">✦</div>
              <div>Select a day to see your insights</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

window.CalendarView = CalendarView;
