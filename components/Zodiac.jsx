// Chinese zodiac: animal lookup by birth year + mood system
// Zodiac cycle starts at Rat for year 1900 → 1900 % 12 = 4 gives offset 0 for Rat
// Order: Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, Pig
const ZODIAC = ["rat","ox","tiger","rabbit","dragon","snake","horse","goat","monkey","rooster","dog","pig"];
const ZODIAC_LABELS = {
  rat:"Rat",ox:"Ox",tiger:"Tiger",rabbit:"Rabbit",dragon:"Dragon",snake:"Snake",
  horse:"Horse",goat:"Goat",monkey:"Monkey",rooster:"Rooster",dog:"Dog",pig:"Pig"
};

// Chinese New Year falls late Jan / mid Feb. Simple rule: if born before Feb 5, use previous year.
// (Good-enough approximation without a full CNY date table.)
function zodiacForBirthday(bdayStr){
  if(!bdayStr) return "monkey"; // fallback
  const [y,m,d] = bdayStr.split("-").map(Number);
  if(!y) return "monkey";
  let year = y;
  if(m === 1 || (m === 2 && d < 5)) year = y - 1;
  // 1900 was Year of the Rat
  const idx = ((year - 1900) % 12 + 12) % 12;
  return ZODIAC[idx];
}

const MOODS = [
  { id:"happy",      label:"Happy",      glyph:"☺" },
  { id:"calm",       label:"Calm",       glyph:"☯" },
  { id:"neutral",    label:"Neutral",    glyph:"◌" },
  { id:"sad",        label:"Sad",        glyph:"☂" },
  { id:"frustrated", label:"Frustrated", glyph:"✷" },
  { id:"anxious",    label:"Anxious",    glyph:"❋" },
  { id:"tired",      label:"Tired",      glyph:"☾" },
  { id:"excited",    label:"Excited",    glyph:"✦" },
];

function ZodiacPet({ animal, mood, size=200, happy=false }){
  const src = `assets/zodiac/${animal}-${mood}.png?v=2`;
  return <img className={"pixel zodiac-pet"+(happy?" happy-mode":"")}
              src={src} alt={`${animal} ${mood}`}
              width={size} height={size}
              style={{imageRendering:"pixelated",display:"block"}}/>;
}

function MoodGlyph({ id, glyph }){
  // Try to load a pixel-art mood icon first, fall back to unicode glyph.
  const [imgOk, setImgOk] = React.useState(true);
  if(!imgOk) return <span>{glyph}</span>;
  return (
    <img src={`assets/feel-${id}.png`} alt={id}
         onError={()=>setImgOk(false)}
         className="mood-glyph-img"
         style={{imageRendering:"pixelated",display:"block"}}/>
  );
}

function MoodPicker({ value, onChange }){
  return (
    <div className="mood-picker">
      {MOODS.map(m=>(
        <button key={m.id}
                className={"mood-btn "+(value===m.id?"active":"")}
                onClick={()=>onChange(m.id)}
                title={m.label}>
          <span className="mood-glyph"><MoodGlyph id={m.id} glyph={m.glyph}/></span>
          <span className="mood-lbl">{m.label}</span>
        </button>
      ))}
    </div>
  );
}

window.ZODIAC = ZODIAC;
window.ZODIAC_LABELS = ZODIAC_LABELS;
window.zodiacForBirthday = zodiacForBirthday;
window.MOODS = MOODS;
window.ZodiacPet = ZodiacPet;
window.MoodPicker = MoodPicker;
