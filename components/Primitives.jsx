// Shared primitives — icons and small building blocks

const ICON = (name) => `assets/icon-${name}.png`;

function Icon({ name, size=24, alt="", style }){
  return <img className="pixel" src={ICON(name)} width={size} height={size} alt={alt}
              style={{display:"inline-block",verticalAlign:"middle",...style}}/>;
}

function HabitIcon({ kind, size=24 }){
  const valid = new Set([
    "water","steps","protein","sleep","meditate","read","journal","workout",
    "sun","affirm","nature","bowl","lotus","selfaff","tea","treat",
    "bed","declutter","clean","charm",
    "diet","planning","focus","work","waking","goals","learning","network","skills","screen",
    "calendar",
  ]);
  const n = valid.has(kind) ? kind : "sparkle";
  return <img className="pixel" src={`assets/icon-${n}.png?v=5`} width={size} height={size} alt={kind}
    style={{display:"inline-block",verticalAlign:"middle",imageRendering:"pixelated"}}
    onError={e=>{ e.currentTarget.src="assets/icon-sparkle.png"; e.currentTarget.onerror=null; }}/>;
}

function Sparkle({ size=18 }){ return <Icon name="sparkle" size={size}/>; }
function Flame(){ return <Icon name="flame" size={22}/>; }

function BabyPet({ animal, happy, neglected, size=64, className="" }){
  const animClass = neglected ? "baby-neglected" : happy ? "baby-happy" : "baby-idle";
  return (
    <div className={`baby-sprite ${animClass} ${className}`}
      style={{
        width: size,
        height: size,
        "--bframe": `${size}px`,
        backgroundImage: `url(assets/zodiac/baby-${animal}-sheet.png?v=1)`,
        backgroundSize: `${size * 7}px ${size}px`,
      }}
    />
  );
}

window.Icon = Icon;
window.HabitIcon = HabitIcon;
window.Sparkle = Sparkle;
window.Flame = Flame;
window.BabyPet = BabyPet;
