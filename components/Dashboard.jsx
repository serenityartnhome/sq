function appDay(d){
  const t = new Date((d||new Date()).getTime() - 3*60*60*1000);
  return t.toLocaleDateString("en-CA");
}

const ENERGY_MODES = [
  { id:"soft",     emoji:"🌸", name:"Soft Energy",  desc:"Gentle, slow, healing",              tags:["Calm","Rest","Self-love","Acceptance"] },
  { id:"boss",     emoji:"⚡", name:"Boss Energy",  desc:"Focused, getting things done",        tags:["Focus","Discipline","Confidence","Success"] },
  { id:"peace",    emoji:"🌙", name:"Inner Peace",  desc:"Grounded and present",                tags:["Peace","Clarity","Balance","Gratitude"] },
  { id:"love",     emoji:"💖", name:"Love Energy",  desc:"Open and connected",                  tags:["Love","Kindness","Compassion","Connection"] },
  { id:"growth",   emoji:"🌱", name:"Growth Mode",  desc:"Becoming your next level",            tags:["Courage","Purpose","Transformation","Alignment"] },
  { id:"momentum", emoji:"🔥", name:"Momentum",     desc:"Taking action, building flow",        tags:["Action","Drive","Progress","Consistency"] },
  { id:"reset",    emoji:"🌊", name:"Reset Mode",   desc:"Releasing and starting fresh",        tags:["Let go","Heal","Breathe","Restart"] },
  { id:"magic",    emoji:"✨", name:"Magic Mode",   desc:"Trusting and attracting",             tags:["Abundance","Trust","Flow","Luck"] },
  { id:"focus",    emoji:"🧠", name:"Focus Mode",   desc:"Deep work, no distractions",          tags:["Focus","Clarity","Execution","Precision"] },
];

// Only these 6 shown in modal — others kept for future use
const VISIBLE_ENERGY_IDS = ["soft","boss","peace","love","growth","reset"];

const MOOD_ENERGY = {
  happy:      ["love","soft"],
  calm:       ["peace","soft"],
  neutral:    ["peace"],
  sad:        ["reset","soft"],
  frustrated: ["reset","peace"],
  anxious:    ["peace","soft"],
  tired:      ["soft","reset"],
  excited:    ["growth","love"],
};

const GOODNIGHT_MSGS = {
  done_all: {
    happy:      "You crushed today and you're glowing — rest now, you've earned it ✨",
    excited:    "What a day! All that energy was magic — sleep well, little adventurer 🌙",
    calm:       "You moved through today so gently and still got it all done. Beautiful. Rest now ✨",
    anxious:    "Even through the worry, you showed up fully. That takes courage. Sleep well 🌙",
    tired:      "You did all of it even when you were tired. That's real strength. Rest now ✨",
    frustrated: "You pushed through the hard feelings and still completed your quest. Be proud. Goodnight 🌙",
    sad:        "Even on a heavy day you completed your quest. That matters so much. Rest gently ✨",
    neutral:    "Steady and done — a quiet kind of victory. Sleep well, adventurer 🌙",
    _default:   "Quest complete. Rest well — you showed up fully today ✨",
  },
  done_some: {
    happy:      "You brought your joy today and that counts for everything. Rest now 🌙",
    excited:    "Your energy lit up the day — progress is still progress. Sweet dreams ✨",
    calm:       "A calm and gentle day. You did what you could — that's enough. Goodnight 🌙",
    anxious:    "Even anxious, you still showed up. That's brave. Rest now ✨",
    tired:      "Some days are heavy — you still did something. That matters. Sleep well 🌙",
    frustrated: "Frustration is hard to carry. You still showed up. Rest now ✨",
    sad:        "On sad days, doing anything at all is a win. Be gentle with yourself tonight 🌙",
    neutral:    "A quiet day — and that's okay. Tomorrow is fresh. Goodnight ✨",
    _default:   "Every step counts. Rest now and let tomorrow be new 🌙",
  },
  done_none: {
    happy:      "Your happiness today was its own gift. Tomorrow you can add some quests to it 🌙",
    excited:    "That spark is always there — let it rest tonight and carry you tomorrow ✨",
    calm:       "A peaceful day of rest — sometimes that's exactly what's needed. Goodnight 🌙",
    anxious:    "Some days just need to be survived. You made it. That's enough. Sleep now ✨",
    tired:      "You needed rest today and you took it — that's wisdom, not failure. Goodnight 🌙",
    frustrated: "Hard day. Let it go with the night — tomorrow is a fresh page ✨",
    sad:        "I see you. Some days are just heavy. You don't have to earn your rest. Sleep now 🌙",
    neutral:    "A quiet day — tomorrow brings a new chance. Goodnight, adventurer ✨",
    _default:   "Rest now. Tomorrow your quest begins again ✨",
  },
};

function pickGoodnightMsg(doneCount, totalSlots, mood){
  const tier = doneCount >= Math.max(totalSlots, 3) ? "done_all" : doneCount >= 1 ? "done_some" : "done_none";
  const pool = GOODNIGHT_MSGS[tier];
  return pool[mood] || pool._default;
}

const MOOD_QUESTS = {
  anxious: [
    "let's breathe together… in and out 🌸",
    "you're safe right here with me",
    "one breath at a time… I've got you",
    "I'm here for you, wanna tell me about it in your journal?…",
    "nothing to solve right now… just breathe",
    "loosen your shoulders… we can slow this down",
    "stay here with me for a moment…",
  ],
  tired: [
    "I'm here for you, wanna tell me about it in your journal?…",
    "today can be smaller… and that's okay",
    "let's go slow together today 🌸",
    "you showed up. that's everything ✨",
    "rest is okay… I'll be right here",
    "even one small thing counts today",
    "you don't have to do everything",
  ],
  frustrated: [
    "I'm here for you, wanna tell me about it in your journal?…",
    "let it out… then let's begin again",
    "it doesn't have to be perfect… just start",
    "you're not stuck — you're processing",
    "one small step… want to do it together?",
    "hard days are part of it too",
    "we'll figure it out slowly… together",
  ],
  happy: [
    "I love this energy ✨ let's hold onto it",
    "you feel so light today… savour it",
    "wanna work on something together? ✨",
    "I'm here for you, wanna tell me about it in your journal?…",
    "you're glowing today ✨",
    "this is worth remembering… write it down?",
    "let's use this feeling for something real",
  ],
  excited: [
    "that energy?! let's use it!! ✨",
    "you're in momentum — let's go!",
    "wanna write down what's driving this? ✨",
    "let's channel this somewhere real together",
    "ride it, don't rush it 🌸",
    "something is happening today… I feel it ✨",
  ],
  calm: [
    "this stillness is yours… stay here",
    "breathe slowly with me… nothing to fix",
    "wanna write your intention for today in your journal?",
    "I'm here for you, wanna tell me about it in your journal?…",
    "you're so grounded right now ✨",
    "clarity lives here… let's use it",
  ],
  neutral: [
    "let's just begin somewhere… together",
    "no feeling has to be forced today",
    "even ordinary days build something ✨",
    "I'm here for you, wanna tell me about it in your journal?…",
    "want to pick one small thing together?",
    "we'll take it as it comes",
  ],
  sad: [
    "I'm here for you, wanna tell me about it in your journal?…",
    "you're allowed to feel this… I'm not going anywhere",
    "let's just be here together for a moment",
    "small things still count today… I believe in you",
    "you don't have to be okay right now",
    "be gentle with yourself… I'm here 💜",
    "you came here. that takes something",
  ],
};

const PRESET_HABITS = [
  { id:"water",    label:"Drink Water",      kind:"water",    preset:true },
  { id:"steps",    label:"10K Steps",        kind:"steps",    preset:true },
  { id:"protein",  label:"Protein Goal",     kind:"protein",  preset:true },
  { id:"sleep",    label:"Sleep 8h",         kind:"sleep",    preset:true },
  { id:"meditate", label:"Meditate",         kind:"meditate", preset:true },
  { id:"read",     label:"Read",             kind:"read",     preset:true },
  { id:"journal",  label:"Journal",          kind:"journal",  preset:true },
  { id:"workout",  label:"Workout",          kind:"workout",  preset:true },
  { id:"diet",     label:"Follow Diet",      kind:"diet",     preset:true },
  { id:"planning", label:"Planning",         kind:"planning", preset:true },
  { id:"focus",    label:"Focus",            kind:"focus",    preset:true },
  { id:"work",     label:"Work",             kind:"work",     preset:true },
  { id:"waking",   label:"Wake Early",       kind:"waking",   preset:true },
  { id:"goals",    label:"Goal-Setting",     kind:"goals",    preset:true },
  { id:"learning", label:"Learning",         kind:"learning", preset:true },
  { id:"network",  label:"Networking",       kind:"network",  preset:true },
  { id:"skills",   label:"Skill-Building",   kind:"skills",   preset:true },
  { id:"screen",   label:"Limit Screen Time",kind:"screen",   preset:true },
];
const POWERUPS = [
  { id:"sun",     name:"Sun Walk",    kind:"sun",     xp:10 },
  { id:"affirm",  name:"Affirmation", kind:"affirm",  xp:10 },
  { id:"nature",  name:"Nature Walk", kind:"nature",  xp:15 },
  { id:"bowl",    name:"Sound Bowl",  kind:"bowl",    xp:15 },
  { id:"lotus",   name:"Breath",      kind:"lotus",   xp:8  },
  { id:"selfaff", name:"Self-Love",   kind:"selfaff", xp:8  },
  { id:"tea",     name:"Herbal Tea",  kind:"tea",     xp:20 },
  { id:"treat",   name:"Cozy Treat",  kind:"treat",   xp:20 },
  { id:"bed",     name:"Make Bed",    kind:"bed",     xp:10 },
  { id:"declutter",name:"Declutter",  kind:"declutter",xp:15},
  { id:"clean",   name:"Clean",       kind:"clean",   xp:15 },
  { id:"charm",   name:"Energy Charm",kind:"charm",   xp:12 },
];
const BABY_BUBBLES = {
  greeting:        ["hi!! ✨","you came back!","yay you're here!","oh! hello!","…heehee","i missed you!","we can do today!!"],
  streak_high:     ["every day!! ✨","we keep going!","look at us!!","we're doing it!","again again!!","so proud!!"],
  missed_day:      ["you're back!!","i waited…","yay you came!","…you came!! ✨","don't go again ok?","i'm so happy!!"],
  task_1:          ["yay! we did a thing!","a little step!","…more?","✨ good job!","we started!","keep going!!"],
  task_3:          ["we're doing it!!","so good!!","i feel it!","keep going!!","this is fun!!","we're amazing!!"],
  task_all:        ["we did everything!! ✨","we're glowing!!","best day ever!!","we did it all!!","perfect day!! ✨"],
  mood_happy:      ["happy!! ✨","me too!!","yay!","heehee ✨","same same!!","best feeling!!","let's keep this!!"],
  mood_excited:    ["ahhhh!! ✨","let's go!!","so exciting!!","yay yay yay!!","i feel it too!!","GO GO GO!!"],
  mood_calm:       ["so peaceful…","i like this","…quiet is nice","we can stay here","shhh… nice"],
  mood_neutral:    ["we can do one thing","let's just start","even tiny counts!","just one step!","we can try"],
  mood_sad:        ["…it's okay","i'm here","we okay?","…stay with me","i won't leave","…i love you"],
  mood_tired:      ["rest… it's okay","we can be slow","that's okay","shhh…","today can be small"],
  mood_anxious:    ["…breathe","it's okay it's okay","we can slow down","…in and out","stay here with me"],
  mood_frustrated: ["…one thing","it's okay","we'll try again","start messy!!","just begin"],
  revive:          ["you came back!!","i knew it ✨","we're okay now!","yay yay yay!!","you stayed!!","i waited for you!!"],
  low_state:       ["i miss you…","…still here","come back soon?","…waiting","i'll stay"],
  night:           ["…goodnight ✨","rest now…","see you tomorrow!","shhh…","sleep well ✨","sweet dreams ✨"],
  rare:            ["something feels special today ✨","…i really like you ✨","you're different today!","i'm so glad you're here","…we're doing something ✨"],
};

const ADULT_BUBBLES = {
  greeting:     [
    "Hi… I've been waiting for you ✨",
    "You're here… that's enough to start",
    "A new day… we can take it slow",
    "I'm glad you came back",
    "Let's see what today feels like",
    "We can try again today… together",
    "You made it here… that matters",
  ],
  streak_high:  [
    "We've been showing up… I feel stronger with you 🔥",
    "You didn't give up… I can feel it",
    "This rhythm we have… it's working",
    "You're becoming consistent… I'm proud of us",
    "We're in flow… let's keep going",
    "Day by day… you're changing",
  ],
  missed_day:   [
    "I missed you yesterday…",
    "It felt a little quiet without you",
    "You weren't here… but I waited",
    "It's okay… we can start again today",
    "I'm still here… no matter what",
    "Let's just take one small step today",
  ],
  low_state:    [
    "I feel a bit distant…",
    "Things feel slower without you",
    "I'll stay here… until you come back",
    "It's been quiet lately…",
    "I'm still here… just a little tired",
  ],
  task_1:       [
    "That helped… even a little",
    "A small step… I feel it",
    "That's enough for now",
  ],
  task_3:       [
    "I feel stronger already",
    "You're really trying… I can tell",
    "This feels different… in a good way",
  ],
  task_all:     [
    "We did it… I'm glowing ✨",
    "Everything feels aligned right now",
    "You showed up fully… thank you",
    "This energy… let's remember it",
  ],
  revive:       [
    "You came back… I knew you would",
    "I was waiting… thank you",
    "It feels warm again…",
    "We're okay now…",
    "You didn't leave me…",
    "Let's start again… together",
  ],
  mood_anxious: [
    "Breathe… I'm here with you",
    "Let's slow this down together",
    "You're safe right now… just breathe",
    "One breath is enough",
    "Loosen your shoulders… let it out",
    "You don't have to solve this right now",
    "Come back to this moment",
    "Nothing else matters right now",
  ],
  mood_tired:   [
    "You can rest… I'll stay here",
    "Today can be smaller — that's allowed",
    "Close your eyes for a moment…",
    "You've done enough already",
    "Let's go slow today",
    "Just show up — that's it",
    "Rest is part of the work",
    "One small thing, nothing more",
  ],
  mood_happy:   [
    "I love this energy ✨",
    "You feel light today",
    "Hold onto this feeling",
    "Let's stay in this a bit longer",
    "You're glowing today ✨",
    "Let it grow… savour it",
    "This matters more than you know",
  ],
  mood_excited: [
    "That energy? Let's use it ✨",
    "You're in momentum — stay with it",
    "Today feels alive. Good.",
    "Ride this, don't rush it",
    "Channel this somewhere real",
    "Let the excitement focus, not scatter",
  ],
  mood_calm:    [
    "You're in the quiet… stay here",
    "Nothing to fix right now",
    "Feel this stillness — it's yours",
    "Breathe slowly… let it be",
    "Stay grounded here",
    "This is enough",
  ],
  mood_neutral: [
    "No feeling has to be forced",
    "Just show up — that's enough today",
    "We'll take it as it comes",
    "You don't need to feel inspired to begin",
    "Even ordinary days build something",
    "Let's just move forward a little",
  ],
  mood_frustrated: [
    "Let it out… then begin again",
    "It doesn't have to be perfect",
    "Start messy. Just start.",
    "One imperfect step forward…",
    "You're allowed to feel this",
    "We'll figure it out… slowly",
    "Shake it off… then keep going",
  ],
  mood_sad:     [
    "I'm here… that's all",
    "You're allowed to feel this",
    "You don't have to perform okay right now",
    "Let's just be here together",
    "Be gentle with yourself today…",
    "Sadness isn't weakness",
    "Small things still count today",
  ],
  night:        [
    "Thank you for today…",
    "You did enough… rest now",
    "I'll be here tomorrow",
    "Let's pause here…",
    "We can continue later",
    "Rest well… you earned it",
  ],
  rare:         [
    "Something about you feels different today… ✨",
    "You're changing… I can feel it",
    "This moment matters more than you think",
    "We're becoming something… slowly",
    "I feel really close to you right now",
    "Something is shifting… ✨",
    "I'm glad you're here",
    "You came back… that matters",
  ],
};

function pickPetBubble(stage, mood, doneCount, totalSlots, daysInFlow) {
  const MSGS = stage === "baby" ? BABY_BUBBLES : ADULT_BUBBLES;
  const hour = new Date().getHours();
  const isNight = hour >= 21 || hour < 5;
  let missedYesterday = false;
  try {
    const hist = JSON.parse(localStorage.getItem("sq_history")||"{}");
    const yd = new Date(); yd.setDate(yd.getDate()-1);
    missedYesterday = !hist[appDay(yd)]?.done;
  } catch{}

  let cat = "greeting";
  if(Math.random() < 0.025)                           cat = "rare";
  else if(isNight)                                     cat = "night";
  else if(missedYesterday && doneCount >= 1)           cat = "revive";
  else if(totalSlots > 0 && doneCount >= totalSlots)  cat = "task_all";
  else if(doneCount >= 3)                              cat = "task_3";
  else if(doneCount >= 1)                              cat = "task_1";
  else if(daysInFlow >= 5)                             cat = "streak_high";
  else if(mood === "anxious")                          cat = "mood_anxious";
  else if(mood === "tired")                            cat = "mood_tired";
  else if(mood === "happy")                            cat = "mood_happy";
  else if(mood === "excited")                          cat = "mood_excited";
  else if(mood === "calm")                             cat = "mood_calm";
  else if(mood === "neutral")                          cat = "mood_neutral";
  else if(mood === "frustrated")                       cat = "mood_frustrated";
  else if(mood === "sad")                              cat = "mood_sad";
  else if(missedYesterday)                             cat = "missed_day";
  else if(daysInFlow === 0)                            cat = "low_state";

  const pool = MSGS[cat] || MSGS.greeting;
  return pool[Math.floor(Math.random() * pool.length)];
}

function TopBarClock(){
  const fmt = () => {
    const n = new Date();
    const date = n.toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short"});
    const time = n.toLocaleTimeString("en-AU",{hour:"2-digit",minute:"2-digit"});
    return {date, time};
  };
  const [dt, setDt] = React.useState(fmt);
  React.useEffect(()=>{ const t=setInterval(()=>setDt(fmt()),1000); return()=>clearInterval(t); },[]);
  return (
    <div className="topbar-clock">
      <span className="topbar-date">{dt.date}</span>
      <span className="topbar-time">{dt.time}</span>
    </div>
  );
}

const TIPS = {
  days_flow: {
    icon:"flame", title:"Days in Flow ✦",
    body: "Your Days in Flow tracks how many days in a row you've completed your Daily Quest. The longer your streak, the more Serenity Quest opens up — new features unlock, your pet grows, and your energy deepens. Don't break the chain! ✦"
  },
  calendar: {
    icon:"calendar", title:"Your Journey Calendar ✦",
    body: "Everything you do is saved here. Every day you complete your quest, your mood, energy, habits, gratitude, and journal entries are recorded. Come back any time to see patterns, re-read past journal entries, and watch how far you've come. ✦"
  },
  community: {
    icon:"earth", title:"The Gratitude Wall ✦",
    body: "A shared space where Serenity Quest adventurers post what they're grateful for each day. Spread positivity, be inspired by others, and know you're not on this journey alone. ✦"
  },
  intention: {
    icon:"lotus", title:"Today's Energy ✦",
    body: "Your energy mode is the vibe you're stepping into today — not a rule, just a gentle direction. Choose one that feels right and let it guide how you show up. You can always change it. ✦"
  },
  pet: {
    icon:"lotus-bud", title:"Your Zodiac Companion ✦",
    body: "This is your living zodiac companion — a reflection of your consistency and energy. Show up every day and watch your pet hatch, grow, and evolve. Neglect your quest and your pet will feel it too. Take care of yourself, and they'll thrive. ✦"
  },
  energy: {
    icon:"energy-heart", title:"Your Energy ✦",
    body: "Your Energy bar fills as you complete habits, power-ups, and gratitude. Think of it as your life force — built daily through small consistent actions. Visit the Calendar tab at any time to see your energy history and track how it grows across your journey. ✦"
  },
  mood: {
    icon:"heart", title:"Your Mood is Recorded ✦",
    body: "Every time you check in with how you're feeling, it's saved to your journey. Over time you'll be able to see emotional patterns — the highs, the lows, and the shifts. Visit the Calendar tab to look back at your mood across any day, week, or month. ✦"
  },
  gratitude: {
    icon:"sparkle", title:"The Practice of Gratitude ✦",
    body: "Gratitude is one of the most scientifically proven practices for wellbeing. Studies show that writing down what you're grateful for daily rewires your brain toward positivity, reduces cortisol, improves sleep, and builds emotional resilience. Make this your non-negotiable daily ritual. ✦"
  },
  first_quest: {
    icon:"flame", title:"First Quest Complete! ✦",
    body: "You did it — your first quest is ticked! 🎉 Every habit you complete builds your streak and fills your energy. Each habit tracks its own streak, and the longer you keep them going the more you'll be celebrated. Complete at least 3 quests today to earn your Day in Flow. Keep going! ✦"
  },
};

function Dashboard({ profile, habits, onReset, userId, isGuest, onSignOut, onUpdateProfile, userEmail, authUserMeta, seenTips, onTipSeen, todayData, profileFlags }){
  const today = appDay();
  const isAdmin = userEmail === "serenityartnhome@gmail.com";

  const [activeTip, setActiveTip] = React.useState(null);
  const afterDismissRef = React.useRef(null);
  const shownTips = React.useRef(new Set([
    ...Object.keys(TIPS).filter(k=>localStorage.getItem("sq_tip_"+k)),
    ...(seenTips||[]),
  ]));
  const showTip = (key, afterDismiss) => {
    if(shownTips.current.has(key)){
      if(afterDismiss) afterDismiss();
      return;
    }
    shownTips.current.add(key);
    localStorage.setItem("sq_tip_"+key,"1");
    if(onTipSeen) onTipSeen([...shownTips.current]);
    setActiveTip(key);
    afterDismissRef.current = afterDismiss||null;
  };
  const dismissTip = () => {
    setActiveTip(null);
    const cb = afterDismissRef.current;
    afterDismissRef.current = null;
    if(cb) cb();
  };

  const [completed, setCompleted] = React.useState(()=>{
    try {
      const s = JSON.parse(localStorage.getItem("sq_daily")||"{}");
      if(s.date === today) return new Set(s.completed||[]);
    } catch{}
    return new Set();
  });
  const [streaks, setStreaks] = React.useState(()=>{
    try { return JSON.parse(localStorage.getItem("sq_streaks")||"{}"); } catch{ return {}; }
  });
  const [customHabits, setCustomHabits] = React.useState(()=>{
    try { return JSON.parse(localStorage.getItem("sq_custom_habits")||"[]"); } catch{ return []; }
  });
  const [activeHabitIds, setActiveHabitIds] = React.useState(()=>{
    try {
      const s = localStorage.getItem("sq_active_habits");
      return s ? JSON.parse(s) : habits.map(h=>h.id);
    } catch{ return habits.map(h=>h.id); }
  });
  const [showHabitPicker, setShowHabitPicker] = React.useState(false);
  const [newHabitName, setNewHabitName] = React.useState("");
  const [newHabitKind, setNewHabitKind] = React.useState("sparkle");

  const [gratitude, setGratitude] = React.useState(["","",""]);
  const [powerups, setPowerups]   = React.useState(()=>new Set());
  const [energyMode, setEnergyMode] = React.useState(()=>{
    try{ const s=JSON.parse(localStorage.getItem("sq_energy_today")||"{}"); return s.date===today?s.mode:null; }catch{ return null; }
  });
  const [showEnergyModal, setShowEnergyModal] = React.useState(false);
  const [pendingEnergy, setPendingEnergy] = React.useState(null);
  const [savedCustomEnergy, setSavedCustomEnergy] = React.useState(()=>{ try{ return JSON.parse(localStorage.getItem("sq_custom_energy")||"null"); }catch{ return null; } });
  const [customEnergyName, setCustomEnergyName] = React.useState("");
  const [customEnergyTags, setCustomEnergyTags] = React.useState("");
  const [customEnergyEmoji, setCustomEnergyEmoji] = React.useState("sparkle");
  const [showCustomEnergy, setShowCustomEnergy] = React.useState(false);
  const [intentShake, setIntentShake] = React.useState(false);
  const [petBubble, setPetBubble] = React.useState("Hi… I've been waiting for you ✨");
  const [celebrate, setCelebrate] = React.useState(false);
  const [isHatching, setIsHatching] = React.useState(false);
  const [hatched, setHatched] = React.useState(()=>!!localStorage.getItem("sq_hatched"));
  const [justHatched, setJustHatched] = React.useState(false);
  const [diaryUnlocked, setDiaryUnlocked] = React.useState(()=>isAdmin||!!localStorage.getItem("sq_diary_unlocked"));
  const [photoUnlocked, setPhotoUnlocked] = React.useState(()=>isAdmin||!!localStorage.getItem("sq_photo_unlocked"));
  const [powerupsUnlocked, setPowerupsUnlocked] = React.useState(()=>isAdmin||!!localStorage.getItem("sq_powerups_unlocked"));
  const [showDiaryLocked, setShowDiaryLocked] = React.useState(false);
  const [showPhotoLocked, setShowPhotoLocked] = React.useState(false);
  const [showComingSoon, setShowComingSoon] = React.useState(false);
  const [showFriendsSoon, setShowFriendsSoon] = React.useState(false);
  const [showShopPrompt, setShowShopPrompt] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState(null); // null | "saving" | "saved" | "error"
  const [isSleeping, setIsSleeping] = React.useState(()=> localStorage.getItem("sq_sleep_date") === appDay());
  const [showGoodnightPopup, setShowGoodnightPopup] = React.useState(false);
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [feedbackMsg, setFeedbackMsg] = React.useState("");
  const [feedbackStatus, setFeedbackStatus] = React.useState(null);
  const [tab, setTab] = React.useState("home");
  const [showSignOut, setShowSignOut] = React.useState(false);
  const [showPetMenu, setShowPetMenu] = React.useState(false);
  const [pendingReports, setPendingReports] = React.useState(0);
  const [showMyAccount, setShowMyAccount] = React.useState(false);
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [resetPwStatus, setResetPwStatus] = React.useState(null);
  const [mood, setMood] = React.useState(null);
  const lastMoodQuestIdx = React.useRef({});
  const shownMoodMsg = React.useRef({});
  const [celebrating, setCelebrating] = React.useState(false);
  const celebrateFlashTimer = React.useRef(null);
  const isFlashing = React.useRef(false);
  const [showDiary, setShowDiary] = React.useState(false);
  const [diaryEntry, setDiaryEntry] = React.useState("");
  const [diaryPhoto, setDiaryPhoto] = React.useState("");
  const diaryPhotoRef = React.useRef(null);

  const handleDiaryPhoto = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setDiaryPhoto(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  const [why, setWhy] = React.useState(profile.why||"");
  const [editingWhy, setEditingWhy] = React.useState(false);
  const [whyDraft, setWhyDraft] = React.useState(profile.why||"");

  const parseBday = (bday) => {
    if(!bday) return { d:"", m:"", y:"" };
    const [y,m,d] = bday.split("-");
    return { d: d ? String(parseInt(d)) : "", m: m ? String(parseInt(m)) : "", y: y||"" };
  };
  const [showProfileEdit, setShowProfileEdit] = React.useState(false);
  const [editName, setEditName]     = React.useState(profile.name||"");
  const [editLoc,  setEditLoc]      = React.useState(profile.loc||"");
  const [editBdayDay,   setEditBdayDay]   = React.useState(()=>parseBday(profile.bday).d);
  const [editBdayMonth, setEditBdayMonth] = React.useState(()=>parseBday(profile.bday).m);
  const [editBdayYear,  setEditBdayYear]  = React.useState(()=>parseBday(profile.bday).y);
  const [showChangeEmail, setShowChangeEmail] = React.useState(false);
  const [showOptIn, setShowOptIn] = React.useState(false);
  const [newEmail, setNewEmail]   = React.useState("");
  const [emailMsg, setEmailMsg]   = React.useState(null);
  const [emailLoading, setEmailLoading] = React.useState(false);
  const [editEmailOptIn, setEditEmailOptIn] = React.useState(()=> authUserMeta?.email_opt_in !== false);

  const doChangeEmail = async () => {
    if(!newEmail.trim()){ setEmailMsg({err:true,text:"Please enter a new email"}); return; }
    setEmailLoading(true); setEmailMsg(null);
    try {
      const { error } = await window.SB.auth.updateUser({ email: newEmail.trim() });
      if(error) throw error;
      setEmailMsg({err:false,text:"Confirmation sent to "+newEmail.trim()+". Check your inbox."});
      setNewEmail("");
    } catch(e){
      setEmailMsg({err:true,text:e.message||"Could not update email"});
    }
    setEmailLoading(false);
  };

  const saveProfileEdit = () => {
    const newBday = editBdayYear && editBdayMonth && editBdayDay
      ? `${editBdayYear}-${editBdayMonth.padStart(2,"0")}-${editBdayDay.padStart(2,"0")}` : profile.bday||"";
    const updates = { name: editName.trim()||profile.name, bday: newBday, loc: editLoc.trim() };
    try {
      const s = JSON.parse(localStorage.getItem("serenity-quest:v1")||"{}");
      s.profile = { ...s.profile, ...updates };
      localStorage.setItem("serenity-quest:v1", JSON.stringify(s));
    } catch{}
    if(userId && window.SB){
      window.SB.from("profiles").upsert({
        id: userId, name: updates.name, bday: updates.bday, loc: updates.loc,
        why: profile.why||"", cursor: profile.cursor||null, habits: habits||[]
      }).then(()=>{});
    }
    if(onUpdateProfile) onUpdateProfile(updates);
    setShowProfileEdit(false);
  };

  const saveWhy = () => {
    const t = whyDraft.trim();
    setWhy(t);
    setEditingWhy(false);
    try {
      const key = "serenity-quest:v1";
      const s = JSON.parse(localStorage.getItem(key)||"{}");
      s.profile = {...s.profile, why:t};
      localStorage.setItem(key, JSON.stringify(s));
    } catch{}
  };
  const DEFAULT_ACTIVE = ["charm","sun","lotus","affirm"];
  const [activePowerupIds, setActivePowerupIds] = React.useState(()=>DEFAULT_ACTIVE);
  const [customPowerups, setCustomPowerups] = React.useState([]);
  const [showPowerupPicker, setShowPowerupPicker] = React.useState(false);
  const [showPowerupSetup, setShowPowerupSetup] = React.useState(false);
  const [newPuName, setNewPuName] = React.useState("");
  const [newPuXp,   setNewPuXp]   = React.useState(10);
  const [newPuKind, setNewPuKind] = React.useState("sparkle");
  const ALL_ICONS = ["affirm","bed","bowl","cake","charm","clean","declutter","diary",
    "diet","energy-heart","flame","focus","goals","heart","journal","learning","lotus","lotus-bud",
    "meditate","nature","network","planning","protein","read","screen","selfaff","skills",
    "sleep","sparkle","steps","sun","tea","treat","water","work","workout"];

  const animal = React.useMemo(()=>zodiacForBirthday(profile.bday), [profile.bday]);

  const daysInFlow = React.useMemo(()=>{
    try {
      const hist = JSON.parse(localStorage.getItem("sq_history")||"{}");
      let count = 0; const d = new Date();
      while(true){
        const k = appDay(d);
        if(!hist[k] || !hist[k].done) break;
        count++; d.setDate(d.getDate()-1);
      }
      return count;
    } catch{ return 0; }
  }, [completed, powerups, gratitude, diaryEntry]);

  const [adultUnlocked, setAdultUnlocked] = React.useState(()=>isAdmin||!!localStorage.getItem("sq_adult"));
  const testStage = localStorage.getItem("sq_test_stage");
  const petStage = testStage || (isAdmin || adultUnlocked || daysInFlow >= 7 ? "adult" : (hatched || daysInFlow >= 3 ? "baby" : "egg"));
  const eggSrc = (m) => `assets/icon-egg-${m}.png?v=1`;
  const EGG_SOUNDS = [
    "...bloop?","mrrp.","skrrt","*knock knock*","pip.","...","bweh","eep!",
    "krrk","mlem","weh.","prrt","squeak?","bonk","glorp","hmph","nyeh",
    "*shuffles*","...tap tap","bibble","zzzt","moop","crkk","hewwo??",
  ];


  const bubblePauseUntil = React.useRef(0);

  const SLEEP_BUBBLES = ["zzz…","sweet dreams ✨","resting now… 🌙","shhh… sleeping…","see you tomorrow 🌸","zzz… zzz…"];
  React.useEffect(()=>{
    const pick = () => {
      if(petStageRef.current === "egg") return;
      if(isSleepingRef.current){
        setPetBubble(SLEEP_BUBBLES[Math.floor(Math.random()*SLEEP_BUBBLES.length)]);
        return;
      }
      if(Date.now() < bubblePauseUntil.current) return;
      setPetBubble(pickPetBubble(petStageRef.current, moodRef.current, doneCountRef.current, totalSlotsRef.current, daysInFlowRef.current));
    };
    pick();
    const t = setInterval(pick, 15000);
    return ()=>clearInterval(t);
  },[]);

  React.useEffect(()=>{
    if(!isAdmin || !window.SB) return;
    window.SB.from("moderation_log").select("post_id").then(({data})=>{
      setPendingReports((data||[]).length);
    });
  },[isAdmin]);

  // Auto-show energy modal once per day if no energy selected
  React.useEffect(()=>{
    if(energyMode) return;
    const shown = localStorage.getItem("sq_energy_modal_date");
    if(shown !== today) {
      localStorage.setItem("sq_energy_modal_date", today);
      setTimeout(()=>setShowEnergyModal(true), 800);
    }
  }, []);

  // Shake reminder if no energy selected
  React.useEffect(()=>{
    if(energyMode) return;
    const t = setInterval(()=>{
      setIntentShake(true);
      setTimeout(()=>setIntentShake(false), 600);
    }, 12000);
    return ()=>clearInterval(t);
  }, [energyMode]);

  // Sync today's data from Supabase on login (once only)
  const syncedCloud = React.useRef(false);
  React.useEffect(()=>{
    if(!todayData || syncedCloud.current) return;
    syncedCloud.current = true;
    if(todayData.completed?.length) setCompleted(new Set(todayData.completed));
    if(todayData.mood) setMood(todayData.mood);
    if(todayData.powerups?.length) setPowerups(new Set(todayData.powerups));
    if(todayData.gratitude?.some(g=>g)) setGratitude(todayData.gratitude);
    if(todayData.diary) setDiaryEntry(todayData.diary);
    if(todayData.energy_mode){
      setEnergyMode(todayData.energy_mode);
      localStorage.setItem("sq_energy_today", JSON.stringify({date:today, mode:todayData.energy_mode}));
    }
  }, [todayData]);

  // Sync profile flags (pet stage, unlocks) from Supabase on login (once only)
  const syncedFlags = React.useRef(false);
  React.useEffect(()=>{
    if(!profileFlags || syncedFlags.current) return;
    syncedFlags.current = true;
    if(profileFlags.hatched)          { setHatched(true);          localStorage.setItem("sq_hatched","1"); }
    if(profileFlags.adultUnlocked)    { setAdultUnlocked(true);    localStorage.setItem("sq_adult","1"); }
    if(profileFlags.diaryUnlocked)    { setDiaryUnlocked(true);    localStorage.setItem("sq_diary_unlocked","1"); }
    if(profileFlags.photoUnlocked)    { setPhotoUnlocked(true);    localStorage.setItem("sq_photo_unlocked","1"); }
    if(profileFlags.powerupsUnlocked) { setPowerupsUnlocked(true); localStorage.setItem("sq_powerups_unlocked","1"); }
    if(profileFlags.customEnergy)     { setSavedCustomEnergy(profileFlags.customEnergy); localStorage.setItem("sq_custom_energy", JSON.stringify(profileFlags.customEnergy)); }
  }, [profileFlags]);

  const allHabits = React.useMemo(()=>{
    // Merge presets with any icon customizations from onboarding, then add custom habits
    const onboardMap = Object.fromEntries(habits.map(h=>[h.id,h]));
    const presets = PRESET_HABITS.map(h => onboardMap[h.id] || h);
    return [...presets, ...customHabits];
  },[habits,customHabits]);
  const activeHabits = React.useMemo(()=>allHabits.filter(h=>activeHabitIds.includes(h.id)),[allHabits,activeHabitIds]);

  const flashHappy = () => {
    isFlashing.current = true;
    setCelebrating(true);
    if(celebrateFlashTimer.current) clearTimeout(celebrateFlashTimer.current);
    celebrateFlashTimer.current = setTimeout(()=>{
      isFlashing.current = false;
      setCelebrating(doneCountRef.current >= 3);
    }, 2000);
  };

  const toggleHabit = (id) => {
    setCompleted(prev=>{
      const n=new Set(prev);
      if(n.has(id)){ n.delete(id); } else {
        n.add(id); flashHappy();
        if(n.size === 1) showTip("first_quest");
      }
      localStorage.setItem("sq_daily", JSON.stringify({date:today, completed:[...n]}));
      return n;
    });
  };
  const togglePower = (id) => setPowerups(prev=>{ const n=new Set(prev); if(n.has(id)){ n.delete(id); } else { n.add(id); flashHappy(); } return n; });
  const setGrat = (i,v) => {
    if(v.length === 1 && gratitude[i].length === 0) showTip("gratitude");
    setGratitude(g=>{ const n=[...g]; n[i]=v; return n; });
  };

  const toggleActiveHabit = (id) => setActiveHabitIds(prev=>{
    const next = prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id];
    localStorage.setItem("sq_active_habits", JSON.stringify(next));
    return next;
  });
  const addCustomHabit = () => {
    const t = newHabitName.trim(); if(!t) return;
    const h = {id:"ch_"+Date.now(), label:t, kind:newHabitKind, custom:true};
    const next = [...customHabits, h];
    setCustomHabits(next);
    setActiveHabitIds(ids=>{ const n=[...ids,h.id]; localStorage.setItem("sq_active_habits",JSON.stringify(n)); return n; });
    localStorage.setItem("sq_custom_habits", JSON.stringify(next));
    setNewHabitName(""); setNewHabitKind("sparkle");
  };
  const removeCustomHabit = (id) => {
    const next = customHabits.filter(h=>h.id!==id);
    setCustomHabits(next);
    localStorage.setItem("sq_custom_habits", JSON.stringify(next));
    setActiveHabitIds(ids=>{ const n=ids.filter(x=>x!==id); localStorage.setItem("sq_active_habits",JSON.stringify(n)); return n; });
  };

  const supabasePushTimer = React.useRef(null);

  // Auto-save to localStorage history on any activity change
  React.useEffect(()=>{
    try {
      const habitsDone = activeHabits.filter(h=>completed.has(h.id)).length;
      const wDone = gratitude.some(x=>x.trim()) || diaryEntry.trim().length > 0 ? 1 : 0;
      const pDone = powerups.size > 0 ? 1 : 0;
      const dc = habitsDone + wDone + pDone;
      const hist = JSON.parse(localStorage.getItem("sq_history")||"{}");
      hist[today] = { mood, energy, completed:[...completed], powerups:[...powerups], gratitude, diary:diaryEntry, photo:diaryPhoto, intention: energyMode ? energyMode.name+" "+energyMode.emoji : null, done: dc >= 3 };
      localStorage.setItem("sq_history", JSON.stringify(hist));
      localStorage.setItem("sq_daily", JSON.stringify({date:today, completed:[...completed]}));
    } catch{}
  }, [completed, mood, gratitude, powerups, diaryEntry, energyMode, diaryPhoto]);

  // Debounced Supabase push
  React.useEffect(()=>{
    if(!userId || !window.SB) return;
    if(supabasePushTimer.current) clearTimeout(supabasePushTimer.current);
    supabasePushTimer.current = setTimeout(()=>{
      window.SB.from("daily_data").upsert({
        user_id:userId, date:today, mood, energy,
        completed:[...completed], powerups:[...powerups],
        gratitude, diary:diaryEntry,
        energy_mode: energyMode||null,
        intention: energyMode ? energyMode.name+" "+energyMode.emoji : null,
      },{onConflict:"user_id,date"}).then(()=>{});
    }, 3000);
    return ()=>{ if(supabasePushTimer.current) clearTimeout(supabasePushTimer.current); };
  }, [completed, mood, gratitude, powerups, diaryEntry, energyMode]);

  const saveProgressNow = async () => {
    setSaveStatus("saving");
    try {
      const hist = JSON.parse(localStorage.getItem("sq_history")||"{}");
      hist[today] = { mood, energy, completed:[...completed], powerups:[...powerups], gratitude, diary:diaryEntry, photo:diaryPhoto, intention: energyMode ? energyMode.name+" "+energyMode.emoji : null, done: doneCount >= 3 };
      localStorage.setItem("sq_history", JSON.stringify(hist));
      if(userId && window.SB){
        const [{ error }] = await Promise.all([
          window.SB.from("daily_data").upsert({
            user_id:userId, date:today, mood, energy,
            completed:[...completed], powerups:[...powerups],
            gratitude, diary:diaryEntry,
            energy_mode: energyMode||null,
            intention: energyMode ? energyMode.name+" "+energyMode.emoji : null,
          },{onConflict:"user_id,date"}),
          window.SB.from("profiles").upsert({
            id: userId,
            hatched, adult_unlocked: adultUnlocked,
            diary_unlocked: diaryUnlocked, photo_unlocked: photoUnlocked,
            powerups_unlocked: powerupsUnlocked,
            custom_energy: savedCustomEnergy||null,
          },{onConflict:"id"}),
        ]);
        if(error) throw error;
      }
      setSaveStatus("saved");
    } catch{ setSaveStatus("error"); }
    setTimeout(()=>setSaveStatus(null), 2500);
  };

  const goodnightFn = () => setShowGoodnightPopup(true);

  const confirmGoodnight = async () => {
    setShowGoodnightPopup(false);
    await saveProgressNow();
    bubblePauseUntil.current = Date.now() + 9999999999;
    localStorage.setItem("sq_sleep_date", appDay());
    setIsSleeping(true);
  };

  // Recalculate habit streaks once per day on app open; sync with Supabase
  React.useEffect(()=>{
    const run = async () => {
      try {
        // If no local streaks, pull from Supabase first (new device / cleared storage)
        const localStreaksDate = localStorage.getItem("sq_streaks_date");
        if(!localStreaksDate && userId && window.SB){
          const { data } = await window.SB.from("profiles").select("streaks,streaks_date").eq("id",userId).single();
          if(data?.streaks && Object.keys(data.streaks).length > 0){
            setStreaks(data.streaks);
            localStorage.setItem("sq_streaks", JSON.stringify(data.streaks));
            localStorage.setItem("sq_streaks_date", data.streaks_date||"");
          }
        }

        if(localStorage.getItem("sq_streaks_date") === today) return;

        const hist = JSON.parse(localStorage.getItem("sq_history")||"{}");
        const yd = new Date(); yd.setDate(yd.getDate()-1);
        const yesterdayKey = appDay(yd);
        const yesterdayData = hist[yesterdayKey];
        const newStreaks = {};
        [...PRESET_HABITS, ...customHabits].forEach(h=>{
          if((yesterdayData?.completed||[]).includes(h.id)){
            let count = 0; const d = new Date(); d.setDate(d.getDate()-1);
            while(true){
              const k = appDay(d);
              if(!(hist[k]?.completed||[]).includes(h.id)) break;
              count++; d.setDate(d.getDate()-1);
            }
            newStreaks[h.id] = count;
          } else {
            newStreaks[h.id] = 0;
          }
        });
        setStreaks(newStreaks);
        localStorage.setItem("sq_streaks", JSON.stringify(newStreaks));
        localStorage.setItem("sq_streaks_date", today);

        // Save to Supabase profiles
        if(userId && window.SB){
          window.SB.from("profiles").update({ streaks: newStreaks, streaks_date: today }).eq("id", userId).then(()=>{});
        }
      } catch{}
    };
    run();
  }, []);

  // Unlock checks when daysInFlow changes — save flags to Supabase immediately
  React.useEffect(()=>{
    let changed = false;
    if(daysInFlow >= 2 && !localStorage.getItem("sq_powerups_unlocked")){ localStorage.setItem("sq_powerups_unlocked","1"); setPowerupsUnlocked(true); changed=true; }
    if(daysInFlow >= 3 && !localStorage.getItem("sq_hatched")){ setTimeout(()=>setIsHatching(true), 400); }
    if(daysInFlow >= 5 && !localStorage.getItem("sq_diary_unlocked")){ localStorage.setItem("sq_diary_unlocked","1"); setDiaryUnlocked(true); changed=true; }
    if(daysInFlow >= 7 && !localStorage.getItem("sq_adult")){ localStorage.setItem("sq_adult","1"); setAdultUnlocked(true); changed=true; }
    if(daysInFlow >= 7 && !localStorage.getItem("sq_photo_unlocked")){ localStorage.setItem("sq_photo_unlocked","1"); setPhotoUnlocked(true); changed=true; }
    if(changed && userId && window.SB){
      window.SB.from("profiles").upsert({
        id: userId,
        powerups_unlocked: daysInFlow>=2, diary_unlocked: daysInFlow>=5,
        adult_unlocked: daysInFlow>=7, photo_unlocked: daysInFlow>=7,
      },{onConflict:"id"}).then(()=>{});
    }
  }, [daysInFlow]);

  const [showGratShare, setShowGratShare] = React.useState(false);
  const [showWallRules, setShowWallRules] = React.useState(false);
  const [wallRulesChecked, setWallRulesChecked] = React.useState(false);
  const [wallBanned, setWallBanned] = React.useState(false);
  const [shareStatus, setShareStatus] = React.useState(null);
  const [shareLoc, setShareLoc] = React.useState(()=>localStorage.getItem("sq_share_loc")!=="0");

  const PROFANITY = ["fuck","shit","bitch","asshole","bastard","cunt","dick","pussy","nigger","nigga","faggot","fag","retard","whore","slut","cock","motherfucker","bullshit","twat","wanker","prick","arse","bollocks"];
  const hasProfanity = (text) => {
    const lower = text.toLowerCase().replace(/[^a-z0-9\s]/g,"");
    return PROFANITY.some(w => new RegExp("\\b"+w+"\\b").test(lower));
  };
  const censorContent = (text) => {
    let t = text;
    // Censor profanity words
    PROFANITY.forEach(w => {
      t = t.replace(new RegExp("\\b"+w+"\\b","gi"), m => "*".repeat(m.length));
    });
    // Hide emails
    t = t.replace(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, "[email hidden]");
    // Hide phone numbers (various formats)
    t = t.replace(/(\+?[\d\s\-().]{7,15}\d)/g, (m) => /\d{7,}/.test(m.replace(/\D/g,"")) ? "[number hidden]" : m);
    // Hide URLs
    t = t.replace(/https?:\/\/\S+|www\.\S+/gi, "[link hidden]");
    return t;
  };

  const openShareWall = async () => {
    if(!userId || !window.SB) return;
    // Check ban
    try {
      const { data } = await window.SB.from("banned_users").select("user_id").eq("user_id", userId).single();
      if(data){ setWallBanned(true); return; }
    } catch {}
    // Check daily limit — verify the post still exists
    if(localStorage.getItem("sq_wall_last_date") === today){
      const savedPostId = localStorage.getItem("sq_wall_last_post_id");
      let postStillExists = false;
      if(savedPostId){
        const { data } = await window.SB.from("gratitude_posts").select("id").eq("id", savedPostId).limit(1);
        postStillExists = !!(data && data.length > 0);
      }
      if(!postStillExists){
        localStorage.removeItem("sq_wall_last_date");
        localStorage.removeItem("sq_wall_last_post_id");
      } else {
        setShareStatus("already"); setShowGratShare(true); return;
      }
    }
    // First-time rules
    if(!localStorage.getItem("sq_wall_agreed")){
      setShowWallRules(true); return;
    }
    setShowGratShare(true);
  };

  const [shareError, setShareError] = React.useState("");
  const shareToWall = async (content, useShareLoc) => {
    if(!userId || !window.SB || !content.trim()) return;
    if(hasProfanity(content)){
      setShareError("Your message contains inappropriate language. Please keep the wall positive ✦");
      setShareStatus("error"); return;
    }
    const cleanContent = censorContent(content);
    setShareStatus("sharing"); setShareError("");
    try {
      const streak = (()=>{
        try {
          const hist = JSON.parse(localStorage.getItem("sq_history")||"{}");
          let count = 0; const d = new Date(); d.setDate(d.getDate()-1);
          while(true){ const k=dappDay; if(!hist[k]) break; count++; d.setDate(d.getDate()-1); }
          return count;
        } catch{ return 0; }
      })();
      const locVal = useShareLoc ? (profile.loc||"") : "";
      const attempts = [
        { user_id:userId, display_name:profile.name||"Adventurer", content:cleanContent, loc:locVal, animal, streak, pet_stage:petStage },
        { user_id:userId, display_name:profile.name||"Adventurer", content:cleanContent, loc:locVal, animal, pet_stage:petStage },
        { user_id:userId, display_name:profile.name||"Adventurer", content:cleanContent, loc:locVal, animal },
        { user_id:userId, display_name:profile.name||"Adventurer", content:cleanContent, animal },
        { user_id:userId, display_name:profile.name||"Adventurer", content:cleanContent },
      ];
      let lastErr = null;
      for(const row of attempts){
        const { data: insertData, error } = await window.SB.from("gratitude_posts").insert(row);
        if(!error){
          localStorage.setItem("sq_wall_last_date", today);
          if(Array.isArray(insertData) && insertData[0]?.id) localStorage.setItem("sq_wall_last_post_id", String(insertData[0].id));
          setShareStatus("done");
          setTimeout(()=>{ setShowGratShare(false); setShareStatus(null); setShareError(""); }, 1400);
          return;
        }
        lastErr = error;
      }
      setShareError(lastErr?.message||"Unknown error");
      setShareStatus("error");
    } catch(e) { setShareError(e?.message||"Unknown error"); setShareStatus("error"); }
  };

  const submitFeedback = async () => {
    if(!feedbackMsg.trim()) return;
    setFeedbackStatus("sending");
    let sent = false;
    if(window.SB){
      try {
        const { error } = await window.SB.from("feedback").insert({
          user_id: userId||null,
          display_name: profile.name||"Adventurer",
          message: feedbackMsg.trim()
        });
        if(!error) sent = true;
      } catch {}
    }
    if(sent){
      setFeedbackStatus("done");
      setFeedbackMsg("");
    } else {
      // Fallback: open mailto
      const subject = encodeURIComponent("Serenity Quest Message");
      const body = encodeURIComponent(`From: ${profile.name||"Adventurer"}\n\n${feedbackMsg.trim()}`);
      window.open(`mailto:serenityartnhome@gmail.com?subject=${subject}&body=${body}`);
      setFeedbackStatus("done");
      setFeedbackMsg("");
    }
  };

  const gratitudeDone = gratitude.some(x=>x.trim().length>0);
  const writingDone   = gratitudeDone || diaryEntry.trim().length > 0;
  const powerDone     = powerups.size > 0;
  const habitsDone    = activeHabits.filter(h=>completed.has(h.id)).length;
  const totalSlots = activeHabits.length + 2;
  const doneCount  = habitsDone + (writingDone?1:0) + (powerDone?1:0);
  const doneCountRef = React.useRef(doneCount);
  doneCountRef.current = doneCount;
  const moodRef = React.useRef(mood);
  moodRef.current = mood;
  const totalSlotsRef = React.useRef(totalSlots);
  totalSlotsRef.current = totalSlots;
  const daysInFlowRef = React.useRef(daysInFlow);
  daysInFlowRef.current = daysInFlow;
  const petStageRef = React.useRef(petStage);
  petStageRef.current = petStage;
  const isSleepingRef = React.useRef(isSleeping);
  isSleepingRef.current = isSleeping;
  const canComplete = doneCount >= 3;
  const energy = Math.min(100, doneCount * Math.ceil(100 / Math.max(totalSlots, 1)));

  // Baby stays happy while doneCount >= 3, returns to neutral if they untick below 3
  React.useEffect(()=>{
    if(doneCount >= 3){
      if(celebrateFlashTimer.current) clearTimeout(celebrateFlashTimer.current);
      setCelebrating(true);
      if(localStorage.getItem("sq_celebrated") !== today){
        localStorage.setItem("sq_celebrated", today);
        setTimeout(()=>setCelebrate(true), 800);
      }
    } else {
      if(!isFlashing.current) setCelebrating(false);
    }
  }, [doneCount]);

  const selectEnergy = (mode) => {
    setEnergyMode(mode);
    setPendingEnergy(null);
    setShowEnergyModal(false);
    setShowCustomEnergy(false);
    setCustomEnergyName(""); setCustomEnergyTags("");
    localStorage.setItem("sq_energy_today", JSON.stringify({ date: today, mode }));
  };
  const confirmCustomEnergy = () => {
    const name = customEnergyName.trim();
    if(!name) return;
    const tags = customEnergyTags.split(",").map(s=>s.trim()).filter(Boolean);
    const mode = { id:"custom", icon:customEnergyEmoji, name, desc:"My custom energy", tags };
    setSavedCustomEnergy(mode);
    localStorage.setItem("sq_custom_energy", JSON.stringify(mode));
    if(userId && window.SB) window.SB.from("profiles").upsert({ id:userId, custom_energy: mode },{onConflict:"id"}).then(()=>{});
    selectEnergy(mode);
  };

  return (
    <div className="app-shell">
      <div className={"scene-img "+(tab==="calendar"?"scene-calendar":"scene-dashboard")}/>
      <div className="scene-veil"/>

      <div className="top-bar">
        <div className="streak" style={{cursor:"pointer"}} onClick={()=>showTip("days_flow")}><Icon name="flame" size={22}/> {(()=>{
          try {
            const hist = JSON.parse(localStorage.getItem("sq_history")||"{}");
            let count = 0;
            const d = new Date();
            d.setDate(d.getDate()-1);
            while(true){
              const k = appDay(d);
              if(!hist[k]) break;
              count++;
              d.setDate(d.getDate()-1);
            }
            return count;
          } catch{ return 0; }
        })()} Days in Flow</div>
        <div className="title">
          <img src="assets/icon-512.png?v=1" alt="logo"
            style={{width:24,height:24,imageRendering:"pixelated",verticalAlign:"middle"}}/>
          Serenity Quest
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <TopBarClock/>
          <div className="avatar" title={profile.name}>
            {petStage==="adult"
              ? <ZodiacPet animal={animal} mood={celebrating?"happy":mood} size={36}/>
              : petStage==="baby"
              ? <BabyPet animal={animal} happy={celebrating} size={22}/>
              : <img src={eggSrc(mood||"neutral")} style={{width:36,height:36,imageRendering:"pixelated"}} alt="egg"/>
            }
          </div>
        </div>
      </div>

      {/* Nav rail */}
      <div className="rail">
        <button className={"rail-btn "+(tab==="home"?"active":"")} onClick={()=>setTab("home")}>
          <Icon name="home" size={54}/>Home
        </button>
        <button className={"rail-btn "+(tab==="calendar"?"active":"")} onClick={()=>{ setTab("calendar"); showTip("calendar"); }}>
          <Icon name="calendar" size={54}/>Calendar
        </button>
        <button className="rail-btn" style={{opacity:.85}} onClick={()=>setShowFriendsSoon(true)}>
          <div style={{position:"relative",display:"inline-block"}}>
            <Icon name="heart" size={54}/>
            <img src="assets/icon-lock.png?v=1" alt="locked"
              style={{position:"absolute",bottom:0,right:0,width:18,height:18,imageRendering:"pixelated",pointerEvents:"none"}}/>
          </div>
          Friends
        </button>
        <button className={"rail-btn "+(tab==="community"?"active":"")} onClick={()=>{ setTab("community"); showTip("community"); }}>
          <div style={{position:"relative",display:"inline-block"}}>
            <img src="assets/icon-earth.png?v=1" width={54} height={54} style={{imageRendering:"pixelated"}} alt="community"/>
            {isAdmin && pendingReports > 0 && (
              <span style={{position:"absolute",top:0,right:0,background:"#c0392b",color:"#fff",
                            borderRadius:"50%",width:16,height:16,fontSize:9,fontFamily:"Silkscreen,monospace",
                            display:"flex",alignItems:"center",justifyContent:"center",
                            border:"2px solid #fff",lineHeight:1}}>
                {pendingReports > 9 ? "9+" : pendingReports}
              </span>
            )}
          </div>
          Community
        </button>
        <button className="rail-btn" onClick={()=>setShowShopPrompt(true)}>
          <Icon name="shop" size={54}/>Shop
        </button>
      </div>


      {tab === "calendar" && <CalendarView habits={activeHabits} powerups={[...POWERUPS,...customPowerups]}
        todayLive={{mood, energy, completed:[...completed], gratitude, diary:diaryEntry, powerups:[...powerups]}}/>}

      {tab === "community" && (
        <div className="community-view">
          <CommunityBoard userId={userId} displayName={profile.name} pendingReports={pendingReports} onReportClear={()=>setPendingReports(0)} isAdmin={isAdmin}/>
        </div>
      )}

      {showSignOut && (
        <div className="coming-soon-overlay" onClick={()=>setShowSignOut(false)}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()}>
            <h3 className="coming-soon-title">{isGuest ? "Guest Mode" : "Sign Out?"}</h3>
            <p className="coming-soon-body">
              {isGuest ? "You're browsing as a guest. Create an account to save your progress." : "Your progress is saved to your account."}
            </p>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              <button className="coming-soon-btn" onClick={onSignOut}>
                {isGuest ? "Go to Login" : "Sign Out ✦"}
              </button>
              <button className="coming-soon-btn" style={{background:"var(--cream)",color:"var(--plum)",borderColor:"var(--gold)"}}
                onClick={()=>setShowSignOut(false)}>Stay Here</button>
            </div>
          </div>
        </div>
      )}

      <div className="dash-grid-4" style={{display: (tab==="calendar"||tab==="community")?"none":"grid"}}>

        {/* TOP LEFT: Zodiac + Intention — no frame */}
        <div className="dash-zodiac-panel">

          {/* Single col: Intention at top, then centered pet */}
          <div className="zodiac-pet-col">
            {/* Top spacer — pushes intention + monkey down to center */}
            <div style={{flex:1}}/>
            {/* Today's Energy sits above the pet */}
            <div className={"intention-side-box"+(intentShake?" intent-shake":"")} onClick={()=>{ showTip("intention"); setShowEnergyModal(true); }}>
              <div className="intention-side-label">Today's Energy</div>
              {energyMode ? (
                <>
                  <div className="intention-side-word" style={{fontSize:13}}>
                    {energyMode.icon ? <img src={`assets/icon-${energyMode.icon}.png`} style={{width:14,height:14,imageRendering:"pixelated",verticalAlign:"middle",marginRight:3}}/> : energyMode.emoji+" "}{energyMode.name}
                  </div>
                  <div style={{fontSize:9,fontFamily:"Pixelify Sans,monospace",color:"var(--plum-soft)",marginTop:2,lineHeight:1.4}}>
                    {energyMode.tags?.join(" · ")||energyMode.desc}
                  </div>
                </>
              ) : (
                <>
                  <div className={"intention-side-word unset"}>Choose your energy</div>
                  {mood && MOOD_ENERGY[mood] && (()=>{
                    const suggested = ENERGY_MODES.find(m=>MOOD_ENERGY[mood].includes(m.id));
                    if(!suggested) return null;
                    return (
                      <div onClick={e=>{e.stopPropagation(); selectEnergy(suggested);}}
                        style={{marginTop:4,fontSize:9,fontFamily:"Silkscreen,monospace",color:"var(--rose)",
                                cursor:"pointer",textDecoration:"underline",lineHeight:1.4}}>
                        try {suggested.name} {suggested.emoji}?
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
            <div className="bubble-wrap">
              <div className="bubble" key={petBubble}>
                {petStage === "egg" ? EGG_SOUNDS[Math.floor(Date.now()/6500) % EGG_SOUNDS.length] : petBubble}
              </div>
            </div>
            <div className="pet-cloud-stage" onClick={()=>{ if(isSleeping){ localStorage.removeItem("sq_sleep_date"); setIsSleeping(false); bubblePauseUntil.current=0; return; } showTip("pet", ()=>setShowPetMenu(true)); }} style={{cursor:"pointer"}} title={isSleeping?"Tap to wake up":"My account"}>
              <div className="pet-on-cloud" style={{position:"relative"}}>
                {(()=>{
                  const sz = Math.round(Math.min(140, window.innerHeight*0.14));
                  if(petStage==="adult" && !isHatching)
                    return <ZodiacPet animal={animal} mood={celebrating?"happy":(mood||"neutral")} happy={celebrating} size={sz}/>;
                  if(petStage==="baby" && !isHatching)
                    return (
                      <div style={{position:"relative",display:"inline-block"}}>
                        {justHatched && <div className="hatch-flash"/>}
                        <BabyPet animal={animal} happy={celebrating} neglected={(()=>{ try{ const yd=new Date(); yd.setDate(yd.getDate()-1); const hist=JSON.parse(localStorage.getItem("sq_history")||"{}"); const hasHistory=Object.keys(hist).some(k=>hist[k]?.done); return hatched && hasHistory && !hist[appDay(yd)]?.done; }catch{return false;} })()}
                          size={Math.round(sz*0.3)}
                          className={justHatched?"baby-pop":""}/>
                      </div>
                    );
                  return <img src={eggSrc(mood||"neutral")} alt="egg"
                    className={isHatching ? "egg-hatching" : "egg-idle"}
                    style={{width:sz,height:sz,imageRendering:"pixelated",display:"block"}}
                    onAnimationEnd={()=>{ if(isHatching){ localStorage.setItem("sq_hatched","1"); setHatched(true); setIsHatching(false); setJustHatched(true); setTimeout(()=>setJustHatched(false), 1000); if(userId&&window.SB) window.SB.from("profiles").upsert({id:userId,hatched:true},{onConflict:"id"}).then(()=>{}); } }}
                  />;
                })()}
                {isSleeping && (
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",
                               justifyContent:"center",background:"rgba(10,5,30,.5)",
                               borderRadius:"50%",pointerEvents:"none"}}>
                    <span style={{fontSize:28,filter:"drop-shadow(0 0 6px #a78bfa)"}}>💤</span>
                  </div>
                )}
              </div>
              <img src="assets/cloud.png" alt="" className="pet-cloud"
                   style={{width:"min(360px,100%)",opacity:isSleeping?.6:1,transition:"opacity .5s"}} aria-hidden="true"/>
            </div>
            <div style={{textAlign:"center",fontFamily:"Silkscreen, monospace",
                         color:"#fff",fontSize:14,marginTop:5,textTransform:"uppercase",letterSpacing:".05em",
                         textShadow:"2px 2px 0 rgba(0,0,0,.6)"}}>
              Hello, {profile.name} ✦
            </div>
            <div style={{textAlign:"center",fontSize:10,color:"rgba(255,255,255,.7)",
                         fontFamily:"Silkscreen,monospace",marginTop:2,letterSpacing:".04em"}}>
              ✎ tap pet to edit profile
            </div>
            {/* Bottom spacer — equal to top spacer, keeps content centered */}
            <div style={{flex:1}}/>
            {/* Energy bar pinned to bottom */}
            <div className="pet-energy-bar" onClick={()=>showTip("energy")} style={{cursor:"pointer"}}>
              <div className="pet-energy-header">
                <Icon name="energy-heart" size={15}/>
                <span className="pet-energy-label">Energy</span>
                <span className="pet-energy-pct">{energy}%</span>
              </div>
              <div className="pet-energy-track">
                <div style={{width:`${energy}%`}}/>
                <span className="pet-energy-bar-txt">{energy < 50 ? "" : ""}</span>
              </div>
            </div>
          </div>
        </div>


        {/* RIGHT: Daily Quest — spans both rows, complete button pinned to bottom */}
        <div className="panel dash-quest-panel">
          <h2 style={{textAlign:"center",fontSize:20,marginBottom:8}}>✦ Daily Quest ✦</h2>

          {/* Why section */}
          <div className="why-box">
            {editingWhy ? (
              <div className="why-edit-row">
                <textarea className="why-textarea" autoFocus value={whyDraft}
                  onChange={e=>setWhyDraft(e.target.value.slice(0,150))}
                  onKeyDown={e=>{if(e.key==="Escape") setEditingWhy(false);}}
                  placeholder="Why are you on this quest?"/>
                <div className="why-edit-btns">
                  <button className="chip active" onClick={saveWhy}>Save</button>
                  <button className="chip" onClick={()=>setEditingWhy(false)}>✕</button>
                </div>
              </div>
            ) : (
              <div className="why-display" onClick={()=>{setWhyDraft(why);setEditingWhy(true);}}>
                <span className="why-label">My Why</span>
                <span className="why-text">{why || "Tap to add your why…"}</span>
                <span className="why-edit-icon">✎</span>
              </div>
            )}
          </div>

          <div>
            {activeHabits.map(h=>(
              <label key={h.id} className={"check "+(completed.has(h.id)?"done":"")}>
                <input type="checkbox" style={{display:"none"}}
                  checked={completed.has(h.id)} onChange={()=>toggleHabit(h.id)}/>
                <span className="box"/>
                <HabitIcon kind={h.kind} size={22}/>
                <span className="lbl">{h.label}</span>
                {(()=>{
                  const base = streaks[h.id]||0;
                  return base > 0 ? <span className="habit-streak"><Icon name="flame" size={13}/>{base}</span> : null;
                })()}
              </label>
            ))}
            <label className={"check "+(writingDone?"done":"")} onClick={(e)=>e.preventDefault()}>
              <span className="box"/>
              <Icon name="journal" size={22}/>
              <span className="lbl">Write gratitude or Journal</span>
            </label>
            <label className={"check "+(powerDone?"done":"")} onClick={(e)=>e.preventDefault()}>
              <span className="box"/>
              <Icon name="sparkle" size={22}/>
              <span className="lbl">Choose a power-up</span>
            </label>
            <button className="check habit-edit-tile" onClick={()=>setShowHabitPicker(v=>!v)}>
              <span style={{fontSize:18}}>✎</span>
              <span className="lbl" style={{flex:"unset"}}>Edit Habits</span>
            </button>
          </div>

          {showHabitPicker && (
            <div className="pu-picker-panel">
              <div className="pu-picker-title">Your Habits</div>
              <div className="pu-picker-grid">
                {allHabits.map(h=>{
                  const on = activeHabitIds.includes(h.id);
                  return (
                    <button key={h.id} className={"pu-pick-btn "+(on?"on":"")}
                      onClick={()=>toggleActiveHabit(h.id)}>
                      <HabitIcon kind={h.kind||"sparkle"} size={30}/>
                      <span>{h.label}</span>
                      {h.custom && <span className="pu-remove" onClick={e=>{e.stopPropagation();removeCustomHabit(h.id);}}>✕</span>}
                    </button>
                  );
                })}
              </div>
              <div className="pu-custom-form">
                <div className="pu-custom-title">✦ Add Custom Habit</div>
                <div className="pu-custom-row">
                  <input value={newHabitName} onChange={e=>setNewHabitName(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&addCustomHabit()}
                    placeholder="Habit name…" maxLength={24} className="pu-add-input" style={{flex:1}}/>
                </div>
                <div className="pu-icon-grid">
                  {ALL_ICONS.map(ic=>(
                    <button key={ic} className={"pu-icon-btn"+(newHabitKind===ic?" on":"")}
                      onClick={()=>setNewHabitKind(ic)} title={ic}>
                      <img src={`assets/icon-${ic}.png?v=5`} alt={ic} style={{width:20,height:20,imageRendering:"pixelated"}}/>
                    </button>
                  ))}
                </div>
                <button className="pu-add-btn" disabled={!newHabitName.trim()} onClick={addCustomHabit}>+ Add Habit</button>
              </div>
            </div>
          )}

          <div className="progress-label">
            Complete <b>{doneCount} / {totalSlots}</b> &nbsp;•&nbsp; {canComplete ? "ready to seal the day" : `${3-doneCount} more to unlock`}
          </div>

          {/* Spacer pushes power-ups to the bottom */}
          <div style={{flex:1,minHeight:0}}/>

          <h2 style={{textAlign:"center",fontSize:18,marginBottom:2,marginTop:4,
                     fontFamily:"Silkscreen, monospace",color:"var(--plum)",
                     textTransform:"uppercase",letterSpacing:".05em",
                     display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Icon name="sparkle" size={18}/>Power-Ups
            {!powerupsUnlocked && daysInFlow < 2 && (
              <img src="assets/icon-lock.png?v=1" alt="locked"
                style={{width:16,height:16,imageRendering:"pixelated",verticalAlign:"middle"}}/>
            )}
            <Icon name="sparkle" size={18}/>
          </h2>

          {(!powerupsUnlocked && daysInFlow < 2) ? (
            <>
              <button style={{width:"100%",marginBottom:6,padding:"12px 16px",
                              background:"transparent",color:"#f5c9cc",
                              border:"3px solid #f5c9cc",borderRadius:4,cursor:"pointer",
                              fontFamily:"Silkscreen,monospace",fontSize:16,letterSpacing:".04em",
                              textTransform:"uppercase",boxShadow:"3px 3px 0 rgba(245,201,204,.2)",
                              display:"flex",alignItems:"center",justifyContent:"center",gap:8}}
                onClick={()=>setShowPowerupSetup(v=>!v)}>
                <Icon name="sparkle" size={14}/>
                {showPowerupSetup ? "Hide Power-Ups" : "Set Up Power-Ups"}
                <Icon name="sparkle" size={14}/>
              </button>
              {showPowerupSetup && (
                <div className="pu-picker-panel" style={{marginBottom:0}}>
                  <p style={{textAlign:"center",fontSize:12,color:"var(--plum)",fontFamily:"Pixelify Sans,monospace",
                             lineHeight:1.6,marginBottom:10,marginTop:0}}>
                    Power-ups are the little things that give <em>you</em> energy — a walk, a cosy ritual, a moment of joy. Pick your favourites now and they'll activate tomorrow. ✦ You can change them any time.
                  </p>
                  <div className="pu-picker-grid">
                    {[...POWERUPS, ...customPowerups].map(p=>{
                      const on = activePowerupIds.includes(p.id);
                      return (
                        <button key={p.id} className={"pu-pick-btn "+(on?"on":"")}
                          onClick={()=>setActivePowerupIds(ids=> on ? ids.filter(x=>x!==p.id) : [...ids, p.id])}>
                          <HabitIcon kind={p.kind||"sparkle"} size={20}/>
                          <span>{p.name}</span>
                          {p.custom && <span className="pu-remove" onClick={e=>{e.stopPropagation();setCustomPowerups(cs=>cs.filter(c=>c.id!==p.id));setActivePowerupIds(ids=>ids.filter(x=>x!==p.id));}}>✕</span>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="pu-custom-form">
                    <div className="pu-custom-title">✦ Create Custom</div>
                    <div className="pu-custom-row">
                      <input value={newPuName} onChange={e=>setNewPuName(e.target.value)}
                        placeholder="Name…" maxLength={20} className="pu-add-input" style={{flex:1}}/>
                      <label className="pu-xp-label">XP
                        <input type="number" min={1} max={99} value={newPuXp}
                          onChange={e=>setNewPuXp(Math.max(1,Math.min(99,Number(e.target.value)||1)))}
                          className="pu-xp-input"/>
                      </label>
                    </div>
                    <div className="pu-icon-grid">
                      {ALL_ICONS.map(ic=>(
                        <button key={ic} className={"pu-icon-btn"+(newPuKind===ic?" on":"")}
                          onClick={()=>setNewPuKind(ic)} title={ic}>
                          <img src={`assets/icon-${ic}.png?v=5`} alt={ic} style={{width:20,height:20,imageRendering:"pixelated"}}/>
                        </button>
                      ))}
                    </div>
                    <button className="pu-add-btn" disabled={!newPuName.trim()}
                      onClick={()=>{
                        const id="custom-"+Date.now();
                        const p={id,name:newPuName.trim(),kind:newPuKind,xp:newPuXp,custom:true};
                        setCustomPowerups(cs=>[...cs,p]);
                        setActivePowerupIds(ids=>[...ids,id]);
                        setNewPuName(""); setNewPuXp(10); setNewPuKind("sparkle");
                      }}>+ Add Power-Up</button>
                  </div>
                  <p style={{textAlign:"center",fontSize:10,color:"var(--rose)",fontFamily:"Silkscreen,monospace",
                             marginTop:8,marginBottom:0,textTransform:"uppercase",letterSpacing:".04em"}}>
                    ✦ Activates Day 2 ✦
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <p style={{textAlign:"center",fontSize:11,color:"var(--plum-soft)",fontFamily:"Pixelify Sans,monospace",
                         marginBottom:8,marginTop:0,lineHeight:1.5}}>
                Little rituals that raise your energy and earn bonus XP — personal to you.
              </p>
              {showPowerupPicker && (
                <div className="pu-picker-panel">
                  <div className="pu-picker-title">Choose your power-ups</div>
                  <div className="pu-picker-grid">
                    {[...POWERUPS, ...customPowerups].map(p=>{
                      const on = activePowerupIds.includes(p.id);
                      return (
                        <button key={p.id} className={"pu-pick-btn "+(on?"on":"")}
                          onClick={()=>setActivePowerupIds(ids=> on ? ids.filter(x=>x!==p.id) : [...ids, p.id])}>
                          <HabitIcon kind={p.kind||"sparkle"} size={20}/>
                          <span>{p.name}</span>
                          {p.custom && <span className="pu-remove" onClick={e=>{e.stopPropagation();setCustomPowerups(cs=>cs.filter(c=>c.id!==p.id));setActivePowerupIds(ids=>ids.filter(x=>x!==p.id));}}>✕</span>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="pu-custom-form">
                    <div className="pu-custom-title">✦ Create Custom</div>
                    <div className="pu-custom-row">
                      <input value={newPuName} onChange={e=>setNewPuName(e.target.value)}
                        placeholder="Name…" maxLength={20} className="pu-add-input" style={{flex:1}}/>
                      <label className="pu-xp-label">XP
                        <input type="number" min={1} max={99} value={newPuXp}
                          onChange={e=>setNewPuXp(Math.max(1,Math.min(99,Number(e.target.value)||1)))}
                          className="pu-xp-input"/>
                      </label>
                    </div>
                    <div className="pu-icon-grid">
                      {ALL_ICONS.map(ic=>(
                        <button key={ic} className={"pu-icon-btn"+(newPuKind===ic?" on":"")}
                          onClick={()=>setNewPuKind(ic)} title={ic}>
                          <img src={`assets/icon-${ic}.png?v=5`} alt={ic} style={{width:20,height:20,imageRendering:"pixelated"}}/>
                        </button>
                      ))}
                    </div>
                    <button className="pu-add-btn" disabled={!newPuName.trim()}
                      onClick={()=>{
                        const id="custom-"+Date.now();
                        const p={id,name:newPuName.trim(),kind:newPuKind,xp:newPuXp,custom:true};
                        setCustomPowerups(cs=>[...cs,p]);
                        setActivePowerupIds(ids=>[...ids,id]);
                        setNewPuName(""); setNewPuXp(10); setNewPuKind("sparkle");
                      }}>+ Add Power-Up</button>
                  </div>
                </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                {[...POWERUPS,...customPowerups].filter(p=>activePowerupIds.includes(p.id)).map(p=>(
                  <button key={p.id} className={"power "+(powerups.has(p.id)?"active":"")}
                          onClick={()=>togglePower(p.id)}>
                    <HabitIcon kind={p.kind||"sparkle"} size={32}/>
                    <span className="name">{p.name}</span>
                    <span className="xp">+{p.xp} XP</span>
                  </button>
                ))}
                <button className="power pu-edit-tile" onClick={()=>setShowPowerupPicker(v=>!v)}>
                  <span style={{fontSize:22,lineHeight:1}}>✎</span>
                  <span className="name">Edit</span>
                </button>
              </div>
            </>
          )}

          <div style={{display:"flex",gap:8,marginTop:8}}>
            <button className="btn-primary btn-pink" onClick={saveProgressNow}
              disabled={saveStatus==="saving"}
              style={{flex:1,fontSize:16,padding:"12px 16px",
                      background: saveStatus==="saved" ? "#27ae60" : saveStatus==="error" ? "#c0392b" : undefined,
                      borderColor: saveStatus==="saved" ? "#1e8449" : saveStatus==="error" ? "#922b21" : undefined}}>
              <Icon name="sparkle" size={16}/>
              {saveStatus==="saving" ? "Saving…" : saveStatus==="saved" ? "✓ Progress Saved" : saveStatus==="error" ? "✗ Save Failed" : "Save My Progress"}
              <Icon name="sparkle" size={16}/>
            </button>
            <button onClick={goodnightFn} title="End My Adventure Today"
              disabled={saveStatus==="saving"}
              style={{padding:"12px 14px",background:"rgba(60,30,100,.6)",
                      border:"2px solid rgba(160,100,220,.4)",cursor:"pointer",
                      fontSize:20,lineHeight:1,boxShadow:"3px 3px 0 rgba(0,0,0,.3)",
                      flexShrink:0}}>
              🌙
            </button>
          </div>

        </div>

        {/* BOTTOM LEFT: Emotions + Gratitude / Diary */}
        <div className="panel emotions-panel">
          {showDiary ? (
            <div className="diary-view">
              <div className="diary-header">
                <button className="diary-back-btn" onClick={()=>setShowDiary(false)}>← Back</button>
                <div style={{flex:1,textAlign:"center",fontFamily:"Silkscreen, monospace",
                             fontSize:18,color:"var(--plum)",textTransform:"uppercase",
                             letterSpacing:".05em",display:"flex",alignItems:"center",
                             justifyContent:"center",gap:8}}>
                  <Icon name="sparkle" size={16}/>My Diary<Icon name="sparkle" size={16}/>
                </div>
              </div>
              <div className="diary-body">
                <input type="file" accept="image/*" ref={diaryPhotoRef}
                  style={{display:"none"}} onChange={handleDiaryPhoto}/>
                <textarea
                  className="diary-textarea"
                  value={diaryEntry}
                  onChange={e=>setDiaryEntry(e.target.value)}
                  placeholder="Write your thoughts here… today was…"
                  style={diaryPhoto ? {paddingRight:"calc(50% + 16px)"} : {}}
                />
                {diaryPhoto ? (
                  <div className="diary-photo-preview">
                    <img src={diaryPhoto} alt="diary photo" className="diary-photo-img"/>
                    <button className="diary-photo-remove" title="Remove photo" onClick={()=>setDiaryPhoto("")}>✕</button>
                  </div>
                ) : (
                  <button className="diary-photo-add" title={photoUnlocked||daysInFlow>=7?"Add a memory":"Unlocks Day 7"}
                    onClick={()=>{ if(photoUnlocked||daysInFlow>=7){ diaryPhotoRef.current.click(); } else { setShowPhotoLocked(true); } }}
                    style={!photoUnlocked&&daysInFlow<7?{opacity:.5,cursor:"default"}:{}}>
                    <div style={{position:"relative",display:"inline-block"}}>
                      <img src="assets/icon-camera.png" alt="camera"
                        style={{width:64,height:64,imageRendering:"pixelated",display:"block"}}
                        onError={e=>{e.currentTarget.replaceWith(Object.assign(document.createElement("span"),{textContent:"📷",style:"font-size:28px"}));}}/>
                      {!photoUnlocked && daysInFlow < 7 && (
                        <img src="assets/icon-lock.png?v=1" alt="locked"
                          style={{position:"absolute",bottom:0,right:0,width:18,height:18,imageRendering:"pixelated"}}/>
                      )}
                    </div>
                    <span className="diary-photo-lbl">{photoUnlocked||daysInFlow>=7?"Add a memory":"Unlocks Day 7"}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Top half: How are you feeling */}
              <div className="emotions-half">
                <div className="div-sparkle emotions-heading" style={{marginTop:0}}>✦ How Are You Feeling Today? ✦</div>
                <MoodPicker value={mood} onChange={m=>{
                  setMood(m);
                  showTip("mood");
                  const dateKey   = "sq_mq_date";
                  const countsKey = "sq_mq_counts";
                  const storedDate = localStorage.getItem(dateKey);
                  const counts = storedDate === today ? JSON.parse(localStorage.getItem(countsKey)||"{}") : {};
                  if((counts[m]||0) >= 1){
                    const prev = shownMoodMsg.current[m];
                    if(prev){ setPetBubble(prev); bubblePauseUntil.current = Date.now() + 45000; }
                    return;
                  }
                  const pool = MOOD_QUESTS[m];
                  if(pool?.length) {
                    const last = lastMoodQuestIdx.current[m] ?? -1;
                    let idx;
                    do { idx = Math.floor(Math.random() * pool.length); } while(pool.length > 1 && idx === last);
                    lastMoodQuestIdx.current[m] = idx;
                    const msg = pool[idx];
                    shownMoodMsg.current[m] = msg;
                    setPetBubble(msg);
                    bubblePauseUntil.current = Date.now() + 45000;
                    counts[m] = 1;
                    localStorage.setItem(dateKey, today);
                    localStorage.setItem(countsKey, JSON.stringify(counts));
                  } else {
                  }
                }}/>
              </div>

              {/* Bottom half: Grateful (left) + Diary fills full height (right) */}
              <div className="emotions-half grat-half">
                <div className="div-sparkle emotions-heading grat-heading-full" style={{marginTop:0,marginBottom:"clamp(2px,0.8vh,8px)"}}>✦ What Are You Grateful For? ✦</div>
                <div className="grat-body-row">
                  <div className="grat-inputs">
                    <div className="grat-rows-fill">
                      {[0,1,2].map(i=>(
                        <div className="grat-row" key={i}>
                          <span className="num">{i+1}.</span>
                          <input value={gratitude[i]} onChange={e=>setGrat(i,e.target.value)}
                            placeholder={i===0?"e.g. morning sunlight":i===1?"e.g. a kind word":"e.g. a warm cup of tea"}
                            className={gratitude[i].trim()?"filled":""} maxLength={80}/>
                        </div>
                      ))}
                    </div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                                 gap:6,marginTop:"clamp(1px,0.4vh,4px)",flexShrink:0}}>
                      <div style={{fontSize:10,color:"var(--plum-soft)",
                                   fontFamily:"Silkscreen, monospace",textTransform:"uppercase",
                                   overflow:"hidden",whiteSpace:"nowrap",flexShrink:1}}>
                        {gratitudeDone ? "✓ Gratitude counted" : "Fill at least one"}
                      </div>
                      {userId && gratitudeDone && (
                        <button className="grat-share-btn" onClick={openShareWall}>
                          ♥ Share to Wall
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="diary-col">
                    <div style={{position:"relative",display:"inline-block"}}>
                      <button className="diary-btn" onClick={()=>diaryUnlocked||daysInFlow>=5?setShowDiary(true):setShowDiaryLocked(true)}>
                        <img src="assets/icon-diary.png" onError={e=>{e.target.src="assets/icon-journal.png"}}
                             className="diary-icon" alt="diary"
                             style={!diaryUnlocked&&daysInFlow<5?{opacity:.6,filter:"grayscale(40%)"}:{}}/>
                      </button>
                      {!diaryUnlocked && daysInFlow < 5 && (
                        <img src="assets/icon-lock.png?v=1" alt="locked"
                          style={{position:"absolute",top:0,right:0,width:18,height:18,
                                  imageRendering:"pixelated",pointerEvents:"none"}}/>
                      )}
                    </div>
                    <span className="diary-label">{diaryUnlocked||daysInFlow>=5?"Write in my Journal":"Unlocks Day 5"}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showGoodnightPopup && (
        <div style={{position:"fixed",inset:0,background:"rgba(8,4,20,.92)",zIndex:9100,
                     display:"flex",alignItems:"center",justifyContent:"center",padding:20}}
             onClick={()=>setShowGoodnightPopup(false)}>
          <div style={{background:"#150c28",border:"3px solid rgba(160,100,220,.45)",
                       maxWidth:300,width:"100%",textAlign:"center",padding:"28px 22px",
                       boxShadow:"6px 6px 0 rgba(0,0,0,.5)"}}
               onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:30,marginBottom:10}}>🌙</div>
            <div style={{fontFamily:"Silkscreen,monospace",fontSize:12,color:"rgba(200,160,255,.9)",
                         marginBottom:18,letterSpacing:".04em",textTransform:"uppercase"}}>
              End My Adventure Today
            </div>
            <div style={{marginBottom:18,display:"flex",justifyContent:"center",
                         filter:"brightness(.75) saturate(.6)"}}>
              {petStage==="adult"
                ? <ZodiacPet animal={animal} mood="tired" size={80}/>
                : petStage==="baby"
                ? <BabyPet animal={animal} happy={false} size={26}/>
                : <span style={{fontSize:36}}>🥚</span>}
            </div>
            <div style={{fontFamily:"Pixelify Sans,monospace",fontSize:13,
                         color:"rgba(255,255,255,.78)",lineHeight:1.85,marginBottom:24}}>
              {pickGoodnightMsg(doneCount, totalSlots, mood)}
            </div>
            <button onClick={confirmGoodnight}
              style={{width:"100%",background:"rgba(50,20,90,.9)",
                      border:"2px solid rgba(160,100,220,.5)",fontFamily:"Silkscreen,monospace",
                      fontSize:11,color:"#c9a3e8",padding:"12px 16px",cursor:"pointer",
                      textTransform:"uppercase",letterSpacing:".05em",
                      boxShadow:"3px 3px 0 rgba(0,0,0,.4)",marginBottom:8}}>
              🌙 End My Adventure
            </button>
            <button onClick={()=>setShowGoodnightPopup(false)}
              style={{width:"100%",background:"none",border:"1px solid rgba(255,255,255,.12)",
                      fontFamily:"Silkscreen,monospace",fontSize:10,color:"rgba(255,255,255,.35)",
                      padding:"8px 16px",cursor:"pointer",textTransform:"uppercase",
                      letterSpacing:".05em"}}>
              Not Yet
            </button>
          </div>
        </div>
      )}

      {showShopPrompt && (
        <div className="coming-soon-overlay" onClick={()=>setShowShopPrompt(false)}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()}>
            <div className="coming-soon-lock"><Icon name="shop" size={40}/></div>
            <h3 className="coming-soon-title">Visit Our Shop</h3>
            <p className="coming-soon-body">Discover feng shui treasures to elevate your space and energy.</p>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              <button className="coming-soon-btn" onClick={()=>{ window.open("https://www.serenityartnhome.com/","_blank"); setShowShopPrompt(false); }}>
                Visit Shop ✦
              </button>
              <button className="coming-soon-btn"
                style={{background:"var(--cream)",color:"var(--plum)",borderColor:"var(--rose)"}}
                onClick={()=>{ setShowShopPrompt(false); setFeedbackMsg(""); setFeedbackStatus(null); setShowFeedback(true); }}>
                Send us a Message
              </button>
              <button className="coming-soon-btn"
                style={{background:"var(--cream)",color:"var(--plum)",borderColor:"var(--gold)"}}
                onClick={()=>setShowShopPrompt(false)}>Stay Here</button>
            </div>
          </div>
        </div>
      )}

      {showFeedback && (
        <div className="coming-soon-overlay" onClick={()=>{ if(feedbackStatus!=="sending") setShowFeedback(false); }}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()} style={{maxWidth:360,width:"92%"}}>
            <div className="coming-soon-lock"><Icon name="sparkle" size={36}/></div>
            <h3 className="coming-soon-title">✦ Talk to Us ✦</h3>
            {feedbackStatus==="done" ? (
              <div style={{textAlign:"center",padding:"16px 0"}}>
                <div style={{fontSize:32,marginBottom:8}}>✦</div>
                <p className="coming-soon-body">Your message has been received.<br/>
                  <span style={{fontSize:12,color:"var(--jade-deep)"}}>We read every single one. Thank you! ♡</span>
                </p>
                <button className="coming-soon-btn" onClick={()=>setShowFeedback(false)}>Close ✦</button>
              </div>
            ) : (
              <>
                <p className="coming-soon-body" style={{marginBottom:10}}>
                  Have a question, idea, or just want to say hi?<br/>
                  <span style={{fontSize:11,color:"var(--plum-soft)"}}>We'd love to hear from you.</span>
                </p>
                <textarea
                  value={feedbackMsg}
                  onChange={e=>setFeedbackMsg(e.target.value.slice(0,500))}
                  placeholder="Write your message here…"
                  maxLength={500}
                  style={{width:"100%",minHeight:100,padding:"8px 10px",fontFamily:"Pixelify Sans,monospace",
                    fontSize:13,border:"2px solid var(--rose)",background:"var(--cream)",color:"var(--plum)",
                    resize:"none",outline:"none",boxSizing:"border-box",marginBottom:6}}
                />
                <div style={{fontSize:10,textAlign:"right",color:"var(--plum-soft)",fontFamily:"Silkscreen,monospace",marginBottom:10}}>
                  {feedbackMsg.length}/500
                </div>
                {feedbackStatus==="error" && (
                  <p style={{color:"var(--rose)",fontSize:11,textAlign:"center",marginBottom:8}}>
                    Something went wrong — please try again.
                  </p>
                )}
                <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                  <button className="coming-soon-btn"
                    disabled={!feedbackMsg.trim()||feedbackStatus==="sending"}
                    onClick={submitFeedback}>
                    {feedbackStatus==="sending" ? "Sending…" : "Send Message ✦"}
                  </button>
                  <button className="coming-soon-btn"
                    style={{background:"var(--cream)",color:"var(--plum)",borderColor:"var(--gold)"}}
                    onClick={()=>setShowFeedback(false)}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTip && TIPS[activeTip] && (
        <div className="coming-soon-overlay" onClick={dismissTip}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()} style={{maxWidth:360,width:"92%"}}>
            <div className="coming-soon-lock">
              <Icon name={TIPS[activeTip].icon} size={42}/>
            </div>
            <h3 className="coming-soon-title">{TIPS[activeTip].title}</h3>
            <p className="coming-soon-body" style={{textAlign:"center",lineHeight:1.8}}>
              {TIPS[activeTip].body}
            </p>
            <button className="coming-soon-btn" onClick={dismissTip}>Got it ✦</button>
          </div>
        </div>
      )}

      {showPhotoLocked && (
        <div className="coming-soon-overlay" onClick={()=>setShowPhotoLocked(false)}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()}>
            <div className="coming-soon-lock">
              <img src="assets/icon-lock.png?v=1" style={{width:48,height:48,imageRendering:"pixelated"}} alt="locked"/>
            </div>
            <h3 className="coming-soon-title">Memory Photos Locked</h3>
            <p className="coming-soon-body">
              Complete 7 days in a row to add photos to your journal.<br/>
              <span style={{fontSize:13,color:"var(--jade-deep)"}}>
                You're on day {Math.max(daysInFlow,1)} — almost there! ✦
              </span>
            </p>
            <button className="coming-soon-btn" onClick={()=>setShowPhotoLocked(false)}>Got it ✦</button>
          </div>
        </div>
      )}

      {showDiaryLocked && (
        <div className="coming-soon-overlay" onClick={()=>setShowDiaryLocked(false)}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()}>
            <div className="coming-soon-lock">
              <img src="assets/icon-lock.png?v=1" style={{width:48,height:48,imageRendering:"pixelated"}} alt="locked"/>
            </div>
            <h3 className="coming-soon-title">✦ Journal Locked ✦</h3>
            <p className="coming-soon-body" style={{textAlign:"center",lineHeight:1.8}}>
              Serenity Quest is designed to be used <strong>every day</strong>. The more consistent you are, the more the app opens up for you.
            </p>
            <p className="coming-soon-body" style={{textAlign:"center",lineHeight:1.8,marginTop:8}}>
              Show up for <strong>5 days in a row</strong> and your personal journal will unlock — a private space to reflect, track your thoughts, and watch yourself grow.
            </p>
            <p className="coming-soon-body" style={{textAlign:"center",marginTop:8}}>
              <span style={{color:"var(--jade-deep)",fontFamily:"Silkscreen,monospace",fontSize:12}}>
                📖 Once unlocked, you can read back through past entries any time in the <strong>Calendar</strong> tab.
              </span>
            </p>
            <p style={{textAlign:"center",fontFamily:"Silkscreen,monospace",fontSize:12,color:"var(--rose)",marginTop:12}}>
              You're on day {Math.max(daysInFlow,1)} — {5-Math.max(daysInFlow,1) > 0 ? `${5-Math.max(daysInFlow,1)} day${5-Math.max(daysInFlow,1)===1?"":"s"} to go ✦` : "almost there ✦"}
            </p>
            <button className="coming-soon-btn" onClick={()=>setShowDiaryLocked(false)}>Got it ✦</button>
          </div>
        </div>
      )}


      {showFriendsSoon && (
        <div className="coming-soon-overlay" onClick={()=>setShowFriendsSoon(false)}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()} style={{maxWidth:340,textAlign:"center"}}>
            <div style={{marginBottom:8}}>
              <img src="assets/icon-lock.png?v=1" style={{width:48,height:48,imageRendering:"pixelated"}} alt=""/>
            </div>
            <h3 className="coming-soon-title">✦ Something is Coming ✦</h3>
            <p className="coming-soon-body" style={{lineHeight:1.9}}>
              The lanterns are being lit.<br/>
              The path is almost ready.<br/>
              <span style={{fontSize:11,color:"var(--plum-soft)",fontFamily:"Silkscreen,monospace"}}>
                …stay on your quest, adventurer.
              </span>
            </p>
            <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
              <button className="coming-soon-btn"
                onClick={()=>{
                  const url="https://app.serenityartnhome.com";
                  const text="Join me on Serenity Quest — a daily feng shui habit tracker ✦";
                  if(navigator.share){ navigator.share({title:"Serenity Quest",text,url}).catch(()=>{}); }
                  else { navigator.clipboard.writeText(url).catch(()=>{}); setShowFriendsSoon(false); }
                }}>Share with Friends ✦</button>
              <button className="coming-soon-btn"
                style={{background:"var(--cream)",color:"var(--plum)",borderColor:"var(--gold)"}}
                onClick={()=>setShowFriendsSoon(false)}>I'll Wait ✦</button>
            </div>
          </div>
        </div>
      )}

      {showComingSoon && (
        <div className="coming-soon-overlay" onClick={()=>setShowComingSoon(false)}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()}>
            <div className="coming-soon-lock">🔒</div>
            <h3 className="coming-soon-title">Coming Soon</h3>
            <p className="coming-soon-body">Zodiac features are on their way.<br/>Stay tuned, adventurer!</p>
            <button className="coming-soon-btn" onClick={()=>setShowComingSoon(false)}>Got it ✦</button>
          </div>
        </div>
      )}

      {/* ── Energy Mode modal ── */}
      {showEnergyModal && (
        <div className="coming-soon-overlay" onClick={()=>{ setShowEnergyModal(false); setPendingEnergy(null); setShowCustomEnergy(false); }}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()}
            style={{maxWidth:380,width:"94%",maxHeight:"88vh",overflowY:"auto"}}>
            <h3 className="coming-soon-title" style={{marginBottom:4}}>Who are you becoming today?</h3>
            <div style={{fontFamily:"Pixelify Sans,monospace",fontSize:11,color:"var(--plum-soft)",marginBottom:14,textAlign:"center"}}>
              Choose your energy mode
            </div>

            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
              {ENERGY_MODES.filter(m=>VISIBLE_ENERGY_IDS.includes(m.id)).map(mode=>{
                const sel = pendingEnergy?.id===mode.id;
                return (
                  <div key={mode.id} onClick={()=>setPendingEnergy(mode)} style={{
                    flex:"1 1 140px",minWidth:130,cursor:"pointer",textAlign:"center",padding:"10px 8px",
                    background: sel?"rgba(201,127,165,.15)":"rgba(255,255,255,.7)",
                    border: sel?"3px solid var(--rose)":"2px solid var(--gold-soft)",
                    boxShadow: sel?"3px 3px 0 rgba(201,127,165,.4)":"2px 2px 0 rgba(201,127,165,.12)",
                    transform: sel?"scale(1.04)":"scale(1)", transition:"transform .1s"
                  }}>
                    <div style={{fontSize:26,marginBottom:4}}>{mode.emoji}</div>
                    <div style={{fontFamily:"Silkscreen,monospace",fontSize:10,color:"var(--plum)",marginBottom:3}}>{mode.name}</div>
                    <div style={{fontFamily:"Pixelify Sans,monospace",fontSize:10,color:"var(--plum-soft)",marginBottom:5,lineHeight:1.4}}>{mode.desc}</div>
                    <div style={{fontFamily:"Pixelify Sans,monospace",fontSize:9,color:"var(--rose)",lineHeight:1.5}}>{mode.tags.join(" • ")}</div>
                  </div>
                );
              })}

              {/* Custom energy card */}
              {showCustomEnergy ? (
                <div onClick={e=>e.stopPropagation()} style={{
                  flex:"1 1 140px",minWidth:130,textAlign:"center",padding:"10px 8px",
                  background:"rgba(255,255,255,.7)",border:"2px solid var(--rose)",
                  boxShadow:"2px 2px 0 rgba(201,127,165,.2)"
                }}>
                  {/* Icon picker */}
                  <div style={{display:"flex",flexWrap:"wrap",gap:4,justifyContent:"center",marginBottom:7,maxHeight:80,overflowY:"auto"}}>
                    {ALL_ICONS.map(ic=>(
                      <img key={ic} src={`assets/icon-${ic}.png`} onClick={()=>setCustomEnergyEmoji(ic)}
                        style={{width:22,height:22,imageRendering:"pixelated",cursor:"pointer",
                                padding:2,boxSizing:"border-box",
                                background: customEnergyEmoji===ic ? "rgba(201,127,165,.3)" : "transparent",
                                border: customEnergyEmoji===ic ? "2px solid var(--rose)" : "2px solid transparent"}}/>
                    ))}
                  </div>
                  <input autoFocus value={customEnergyName} onChange={e=>setCustomEnergyName(e.target.value)}
                    placeholder="Energy name…" maxLength={24}
                    style={{width:"100%",boxSizing:"border-box",background:"var(--cream)",border:"2px solid var(--rose)",
                            padding:"4px 6px",fontFamily:"Pixelify Sans,monospace",fontSize:11,outline:"none",marginBottom:5}}/>
                  <input value={customEnergyTags} onChange={e=>setCustomEnergyTags(e.target.value)}
                    placeholder="word1, word2, word3" maxLength={60}
                    style={{width:"100%",boxSizing:"border-box",background:"var(--cream)",border:"2px solid var(--gold-soft)",
                            padding:"4px 6px",fontFamily:"Pixelify Sans,monospace",fontSize:10,outline:"none",marginBottom:6}}/>
                  <button className="coming-soon-btn" style={{fontSize:10,padding:"5px 10px",width:"100%"}}
                    onClick={confirmCustomEnergy}>Set ✦</button>
                </div>
              ) : savedCustomEnergy ? (
                <div style={{
                  flex:"1 1 140px",minWidth:130,cursor:"pointer",textAlign:"center",padding:"10px 8px",
                  background: pendingEnergy?.id==="custom"?"rgba(201,127,165,.15)":"rgba(255,255,255,.7)",
                  border: pendingEnergy?.id==="custom"?"3px solid var(--rose)":"2px solid var(--gold-soft)",
                  boxShadow: pendingEnergy?.id==="custom"?"3px 3px 0 rgba(201,127,165,.4)":"2px 2px 0 rgba(201,127,165,.12)",
                  transform: pendingEnergy?.id==="custom"?"scale(1.04)":"scale(1)", transition:"transform .1s",
                  position:"relative"
                }} onClick={()=>setPendingEnergy(savedCustomEnergy)}>
                  <div style={{fontSize:26,marginBottom:4}}>{savedCustomEnergy.icon ? <img src={`assets/icon-${savedCustomEnergy.icon}.png`} style={{width:28,height:28,imageRendering:"pixelated"}}/> : savedCustomEnergy.emoji}</div>
                  <div style={{fontFamily:"Silkscreen,monospace",fontSize:10,color:"var(--plum)",marginBottom:3}}>{savedCustomEnergy.name}</div>
                  <div style={{fontFamily:"Pixelify Sans,monospace",fontSize:9,color:"var(--rose)",lineHeight:1.5}}>{savedCustomEnergy.tags?.join(" • ")}</div>
                  <button onClick={e=>{ e.stopPropagation(); setCustomEnergyName(savedCustomEnergy.name); setCustomEnergyTags(savedCustomEnergy.tags?.join(", ")||""); setCustomEnergyEmoji(savedCustomEnergy.emoji||"⭐"); setShowCustomEnergy(true); }}
                    style={{position:"absolute",top:4,right:4,background:"none",border:"none",fontSize:11,cursor:"pointer",color:"var(--plum-soft)",padding:0}}>✏️</button>
                </div>
              ) : (
                <div onClick={()=>setShowCustomEnergy(true)} style={{
                  flex:"1 1 140px",minWidth:130,cursor:"pointer",textAlign:"center",padding:"10px 8px",
                  background:"rgba(255,255,255,.4)",border:"2px dashed rgba(201,127,165,.35)",
                  display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:90
                }}>
                  <div style={{fontSize:20,marginBottom:4,color:"var(--plum-soft)"}}>＋</div>
                  <div style={{fontFamily:"Silkscreen,monospace",fontSize:10,color:"var(--plum-soft)"}}>Create your own</div>
                </div>
              )}
            </div>

            {pendingEnergy && (
              <div style={{borderTop:"2px solid var(--gold-soft)",paddingTop:12,textAlign:"center"}}>
                <div style={{fontFamily:"Pixelify Sans,monospace",fontSize:13,color:"var(--plum)",marginBottom:10}}>
                  You are in <strong>{pendingEnergy.name}</strong> {pendingEnergy.icon ? <img src={`assets/icon-${pendingEnergy.icon}.png`} style={{width:14,height:14,imageRendering:"pixelated",verticalAlign:"middle"}}/> : pendingEnergy.emoji} today
                </div>
                <button className="coming-soon-btn" style={{width:"100%"}} onClick={()=>selectEnergy(pendingEnergy)}>
                  Begin Day ✦
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Pet menu: 3 choices ── */}
      {showPetMenu && (
        <div className="coming-soon-overlay" onClick={()=>setShowPetMenu(false)}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()} style={{maxWidth:280,width:"88%"}}>
            <h3 className="coming-soon-title" style={{fontSize:14}}>
              <span style={{color:"var(--gold)"}}>✦</span> {profile.name||"Adventurer"} <span style={{color:"var(--gold)"}}>✦</span>
            </h3>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <button className="acct-btn" onClick={()=>{
                setEditName(profile.name||""); setEditLoc(profile.loc||"");
                const bd=parseBday(profile.bday); setEditBdayDay(bd.d); setEditBdayMonth(bd.m); setEditBdayYear(bd.y);
                setShowPetMenu(false); setShowProfileEdit(true);
              }}>Edit Profile</button>
              <button className="acct-btn" onClick={()=>{ setShowPetMenu(false); setShowMyAccount(true); setResetPwStatus(null); }}>My Account</button>
              <button className="acct-btn" onClick={()=>setShowPetMenu(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── My Account modal ── */}
      {showMyAccount && (
        <div className="coming-soon-overlay" onClick={()=>{ setShowMyAccount(false); setResetPwStatus(null); setShowChangeEmail(false); setEmailMsg(null); setShowOptIn(false); }}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()} style={{maxWidth:340,width:"90%"}}>
            <h3 className="coming-soon-title" style={{fontSize:14}}>✦ My Account ✦</h3>

            {/* Email */}
            {userEmail && !isGuest && (
              <div style={{marginBottom:14}}>
                <div style={{fontSize:10,fontFamily:"Silkscreen,monospace",color:"var(--plum)",textTransform:"uppercase",letterSpacing:".04em",marginBottom:4}}>Email</div>
                <div style={{fontSize:12,fontFamily:"Pixelify Sans,monospace",color:"var(--plum-soft)",marginBottom:6,wordBreak:"break-all"}}>{userEmail}</div>
                {!showChangeEmail ? (
                  <button onClick={()=>{ setShowChangeEmail(true); setEmailMsg(null); setNewEmail(""); }}
                    style={{background:"none",border:"none",color:"var(--rose)",cursor:"pointer",
                            fontFamily:"Silkscreen,monospace",fontSize:10,textDecoration:"underline",padding:0}}>
                    Change Email
                  </button>
                ) : (
                  <div>
                    <div className="field" style={{marginBottom:6}}>
                      <input type="email" value={newEmail} onChange={e=>setNewEmail(e.target.value)}
                        placeholder="New email address…" onKeyDown={e=>e.key==="Enter"&&doChangeEmail()}/>
                    </div>
                    {emailMsg && (
                      <div style={{fontSize:11,fontFamily:"Silkscreen,monospace",marginBottom:6,
                                   color:emailMsg.err?"#c0392b":"#27ae60"}}>
                        {emailMsg.err?"✗ ":"✓ "}{emailMsg.text}
                      </div>
                    )}
                    <div style={{display:"flex",gap:6}}>
                      <button className="coming-soon-btn" onClick={doChangeEmail} disabled={emailLoading}
                        style={{fontSize:10,padding:"5px 12px"}}>
                        {emailLoading?"Sending…":"Send Confirmation"}
                      </button>
                      <button onClick={()=>{ setShowChangeEmail(false); setEmailMsg(null); }}
                        style={{background:"none",border:"none",color:"var(--plum-soft)",cursor:"pointer",
                                fontFamily:"Silkscreen,monospace",fontSize:10,textDecoration:"underline",padding:0}}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Subscribe */}
            {!isGuest && (
              <div style={{marginBottom:14}}>
                <button className="acct-btn" onClick={()=>setShowOptIn(true)}>
                  Subscriptions
                </button>
              </div>
            )}

            {/* Reset Password */}
            {!isGuest && (
              <div style={{marginBottom:14}}>
                {resetPwStatus==="sent" ? (
                  <div style={{fontSize:11,fontFamily:"Silkscreen,monospace",color:"#27ae60",padding:"6px 8px",
                               background:"rgba(39,174,96,.1)",border:"2px solid rgba(39,174,96,.4)",boxShadow:"2px 2px 0 rgba(39,174,96,.15)"}}>
                    ✓ Reset link sent — check your email
                  </div>
                ) : resetPwStatus==="error" ? (
                  <div style={{fontSize:11,fontFamily:"Silkscreen,monospace",color:"#c0392b",padding:"6px 8px",
                               background:"rgba(192,57,43,.1)",border:"2px solid rgba(192,57,43,.4)",boxShadow:"2px 2px 0 rgba(192,57,43,.15)"}}>
                    ✗ Couldn't send reset email. Try again.
                  </div>
                ) : (
                  <button className="acct-btn" onClick={async()=>{
                    setResetPwStatus(null);
                    const sess=JSON.parse(localStorage.getItem("sq_sb_session")||"null");
                    const email=sess?.user?.email||userEmail||null;
                    if(!email){ setResetPwStatus("error"); return; }
                    const{error}=await window.SB.auth.resetPasswordForEmail(email);
                    setResetPwStatus(error?"error":"sent");
                  }}>Reset Password</button>
                )}
              </div>
            )}

            {/* Admin: pet stage switcher */}
            {isAdmin && (
              <div style={{marginBottom:14,padding:"10px",background:"rgba(201,127,165,.08)",border:"3px solid var(--rose)",boxShadow:"3px 3px 0 rgba(201,127,165,.3)"}}>
                <div style={{fontSize:10,fontFamily:"Silkscreen,monospace",color:"var(--plum)",marginBottom:8}}>✦ Pet Stage (admin)</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {["egg","baby","adult"].map(s=>(
                    <button key={s} onClick={()=>{ localStorage.setItem("sq_test_stage",s); window.location.reload(); }}
                      style={{fontFamily:"Silkscreen,monospace",fontSize:10,padding:"4px 10px",cursor:"pointer",
                              textTransform:"uppercase",letterSpacing:".04em",
                              border: petStage===s ? "2px solid var(--rose)" : "1px solid rgba(201,127,165,.4)",
                              background: petStage===s ? "rgba(201,127,165,.2)" : "transparent",
                              color: petStage===s ? "var(--rose)" : "var(--plum-soft)"}}>
                      {s}
                    </button>
                  ))}
                  {testStage && (
                    <button onClick={()=>{ localStorage.removeItem("sq_test_stage"); window.location.reload(); }}
                      style={{fontFamily:"Silkscreen,monospace",fontSize:10,padding:"4px 10px",cursor:"pointer",
                              textTransform:"uppercase",border:"1px solid rgba(192,57,43,.4)",
                              background:"rgba(192,57,43,.08)",color:"#c0392b"}}>
                      reset
                    </button>
                  )}
                </div>
              </div>
            )}

            <div style={{borderTop:"1px solid var(--gold-soft)",paddingTop:12,display:"flex",flexDirection:"column",gap:10}}>
              <button className="acct-btn" onClick={()=>{ setShowMyAccount(false); onSignOut(); }}>Log Out</button>
              <button className="acct-btn" style={{color:"#c0392b",borderColor:"rgba(192,57,43,.4)"}}
                onClick={()=>{ setShowMyAccount(false); setShowResetConfirm(true); }}>
                Reset My Data
              </button>
              <button className="acct-btn" style={{color:"#8b1a1a",borderColor:"rgba(139,26,26,.4)",background:"rgba(139,26,26,.06)"}}
                onClick={()=>{ setShowMyAccount(false); setShowDeleteConfirm(true); }}>
                Delete Account
              </button>
              <button className="acct-btn" onClick={()=>{ setShowMyAccount(false); setResetPwStatus(null); setShowOptIn(false); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Subscriptions popup ── */}
      {showOptIn && (
        <div className="coming-soon-overlay" onClick={()=>setShowOptIn(false)}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()} style={{maxWidth:300,width:"88%",textAlign:"center"}}>
            <h3 className="coming-soon-title" style={{marginBottom:16}}>✦ Subscriptions ✦</h3>
            <label style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer",textAlign:"left",
                           padding:"10px",background:"rgba(201,127,165,.08)",border:"2px solid var(--rose)",boxShadow:"2px 2px 0 rgba(201,127,165,.25)"}}>
              <input type="checkbox" checked={editEmailOptIn}
                onChange={e=>{ setEditEmailOptIn(e.target.checked); if(window.SB) window.SB.auth.updateUser({ data:{ email_opt_in: e.target.checked } }).catch(()=>{}); }}
                style={{marginTop:3,cursor:"pointer",accentColor:"var(--rose)",width:15,height:15,flexShrink:0}}/>
              <span style={{fontSize:10,fontFamily:"Silkscreen,monospace",color:"var(--plum)",lineHeight:1.8}}>
                Wellness tips &amp; updates
                <br/><span style={{color:"var(--plum-soft)",fontSize:9,fontFamily:"Pixelify Sans,monospace"}}>No spam. Unsubscribe anytime.</span>
              </span>
            </label>
            <button className="coming-soon-btn" style={{marginTop:14,width:"100%"}} onClick={()=>setShowOptIn(false)}>Done</button>
          </div>
        </div>
      )}

      {/* ── Reset My Data confirm ── */}
      {showResetConfirm && (
        <div className="coming-soon-overlay" onClick={()=>setShowResetConfirm(false)}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()} style={{maxWidth:320,width:"90%",textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:8}}>🔄</div>
            <h3 className="coming-soon-title" style={{marginBottom:8}}>Reset My Data?</h3>
            <div style={{fontFamily:"Pixelify Sans,monospace",fontSize:12,color:"var(--plum-soft)",lineHeight:1.7,marginBottom:20}}>
              This will wipe your habits, streaks, diary and pet progress. Your account stays active and you can log back in to start fresh.
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <button className="coming-soon-btn" style={{background:"rgba(192,57,43,.15)",color:"#8b1a1a",border:"2px solid #c0392b",boxShadow:"none"}}
                onClick={()=>{ setShowResetConfirm(false); onReset(); }}>
                Yes, Reset My Data
              </button>
              <button className="coming-soon-btn"
                style={{background:"var(--cream)",color:"var(--plum)",boxShadow:"none",border:"2px solid var(--gold)"}}
                onClick={()=>setShowResetConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Account confirm ── */}
      {showDeleteConfirm && (
        <div className="coming-soon-overlay" onClick={()=>setShowDeleteConfirm(false)}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()} style={{maxWidth:320,width:"90%",textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:8}}>⚠</div>
            <h3 className="coming-soon-title" style={{color:"#c0392b",marginBottom:8}}>Delete Account?</h3>
            <div style={{fontFamily:"Pixelify Sans,monospace",fontSize:12,color:"var(--plum-soft)",lineHeight:1.7,marginBottom:20}}>
              This will permanently delete your account and all your data — habits, streaks, diary, pet, everything. There is no going back.
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <button className="coming-soon-btn" style={{background:"#8b1a1a",color:"#fff",borderColor:"#8b1a1a"}}
                onClick={async()=>{
                  setShowDeleteConfirm(false);
                  if(userId && window.SB){
                    try {
                      await window.SB.from("gratitude_posts").delete().eq("user_id",userId);
                      await window.SB.from("daily_data").delete().eq("user_id",userId);
                      await window.SB.from("profiles").delete().eq("id",userId);
                      await window.SB.rpc("delete_own_user");
                    } catch{}
                  }
                  onSignOut();
                }}>
                Yes, Delete Everything
              </button>
              <button className="coming-soon-btn"
                style={{background:"var(--cream)",color:"var(--plum)",boxShadow:"none",border:"2px solid var(--gold)"}}
                onClick={()=>setShowDeleteConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Profile (name, birthday, location only) ── */}
      {showProfileEdit && (
        <div className="coming-soon-overlay" onClick={()=>setShowProfileEdit(false)}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()} style={{maxWidth:340,width:"90%"}}>
            <h3 className="coming-soon-title">✦ Edit Profile ✦</h3>
            <div className="field" style={{marginBottom:10}}>
              <label style={{fontSize:11,fontFamily:"Silkscreen,monospace",color:"var(--plum)"}}>Name</label>
              <input value={editName} onChange={e=>setEditName(e.target.value)} maxLength={32} placeholder="Your name…"/>
            </div>
            <div className="field" style={{marginBottom:10}}>
              <label style={{fontSize:11,fontFamily:"Silkscreen,monospace",color:"var(--plum)"}}>Birthday <span style={{fontSize:9,color:"var(--plum-soft)",fontFamily:"Pixelify Sans,monospace",textTransform:"none",letterSpacing:0}}>— shapes your zodiac companion ✦</span></label>
              <div className="bday-row">
                <select value={editBdayDay} onChange={e=>setEditBdayDay(e.target.value)} className="bday-select">
                  <option value="">Day</option>
                  {Array.from({length:31},(_,i)=>i+1).map(d=>(
                    <option key={d} value={String(d)}>{d}</option>
                  ))}
                </select>
                <select value={editBdayMonth} onChange={e=>setEditBdayMonth(e.target.value)} className="bday-select">
                  <option value="">Month</option>
                  {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m,i)=>(
                    <option key={i} value={String(i+1)}>{m}</option>
                  ))}
                </select>
                <select value={editBdayYear} onChange={e=>setEditBdayYear(e.target.value)} className="bday-select">
                  <option value="">Year</option>
                  {Array.from({length:100},(_,i)=>new Date().getFullYear()-i).map(y=>(
                    <option key={y} value={String(y)}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field" style={{marginBottom:16}}>
              <label style={{fontSize:11,fontFamily:"Silkscreen,monospace",color:"var(--plum)"}}>Location</label>
              <input value={editLoc} onChange={e=>setEditLoc(e.target.value)} placeholder="City, Country…"/>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
              <button className="coming-soon-btn" onClick={saveProfileEdit}>Save ✦</button>
              <button className="coming-soon-btn"
                style={{background:"var(--cream)",color:"var(--plum)",borderColor:"var(--gold)"}}
                onClick={()=>setShowProfileEdit(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {wallBanned && (
        <div className="coming-soon-overlay" onClick={()=>setWallBanned(false)}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()} style={{maxWidth:320,width:"90%",textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:8}}>⚑</div>
            <h3 className="coming-soon-title" style={{color:"#8b1a1a"}}>Account Suspended</h3>
            <p className="coming-soon-body" style={{fontSize:12}}>
              Your account has been permanently suspended from the Gratitude Wall due to community guideline violations.
            </p>
            <button className="coming-soon-btn"
              style={{background:"#fff8ec",color:"#5c2a35",border:"2px solid #e9c98a",boxShadow:"none"}}
              onClick={()=>setWallBanned(false)}>Close</button>
          </div>
        </div>
      )}

      {showWallRules && (
        <div className="coming-soon-overlay" onClick={()=>setShowWallRules(false)}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()} style={{maxWidth:360,width:"92%"}}>
            <h3 className="coming-soon-title">✦ Community Guidelines ✦</h3>
            <div style={{fontSize:12,color:"var(--plum-soft)",fontFamily:"Pixelify Sans,monospace",
                         lineHeight:1.9,marginBottom:16,textAlign:"left"}}>
              <p style={{marginTop:0,marginBottom:8,fontFamily:"Silkscreen,monospace",fontSize:11,color:"var(--plum)"}}>
                The Gratitude Wall is a positive space for sharing what you're grateful for. ✦
              </p>
              <ul style={{paddingLeft:18,margin:0}}>
                <li>Share genuine gratitude — kind words, small joys, daily wins ✦</li>
                <li>One share per day per account</li>
                <li>No profanity, hate speech, or inappropriate content</li>
                <li>No spam, advertising, or self-promotion</li>
                <li>Treat every adventurer with respect</li>
              </ul>
              <p style={{marginBottom:0,marginTop:10,fontFamily:"Silkscreen,monospace",fontSize:10,color:"#8b1a1a"}}>
                ⚑ Misuse will be reviewed and may result in a permanent ban.
              </p>
            </div>
            <label style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:14,cursor:"pointer"}}>
              <input type="checkbox" checked={wallRulesChecked} onChange={e=>setWallRulesChecked(e.target.checked)}
                style={{marginTop:2,cursor:"pointer",accentColor:"var(--rose)",width:14,height:14,flexShrink:0}}/>
              <span style={{fontSize:10,fontFamily:"Silkscreen,monospace",color:"var(--plum)",lineHeight:1.6}}>
                I have read and agree to the Community Guidelines above
              </span>
            </label>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button onClick={()=>{ localStorage.setItem("sq_wall_agreed","1"); setShowWallRules(false); setShowGratShare(true); }}
                disabled={!wallRulesChecked}
                style={{background:wallRulesChecked?"#f5c9cc":"#e0d0d8",color:"#5c2a35",border:"2px solid #e39aa0",
                        fontFamily:"Silkscreen,monospace",fontSize:11,padding:"10px 20px",cursor:wallRulesChecked?"pointer":"default",
                        textTransform:"uppercase",letterSpacing:".05em",
                        boxShadow:wallRulesChecked?"3px 3px 0 rgba(92,42,53,.25)":"none",
                        borderRadius:2,opacity:wallRulesChecked?1:0.55}}>
                I Agree ✦
              </button>
              <button onClick={()=>setShowWallRules(false)}
                style={{background:"#fff8ec",color:"#5c2a35",border:"2px solid #e9c98a",
                        fontFamily:"Silkscreen,monospace",fontSize:11,padding:"10px 20px",cursor:"pointer",
                        textTransform:"uppercase",letterSpacing:".05em",boxShadow:"none",borderRadius:2}}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showGratShare && (
        <div className="coming-soon-overlay" onClick={()=>{ setShowGratShare(false); setShareStatus(null); }}>
          <div className="coming-soon-box" onClick={e=>e.stopPropagation()} style={{maxWidth:360,width:"92%"}}>
            <h3 className="coming-soon-title">✦ Share to Gratitude Wall ✦</h3>
            <p className="coming-soon-body" style={{marginBottom:4}}>Choose which gratitude to share:</p>
            {shareStatus==="done" ? (
              <div style={{textAlign:"center",padding:"20px 0",fontFamily:"Pixelify Sans,monospace",
                           color:"var(--jade-deep)",fontSize:16}}>✓ Shared to the Wall!</div>
            ) : shareStatus==="already" ? (
              <div style={{textAlign:"center",padding:"12px 10px",fontFamily:"Silkscreen,monospace",fontSize:11,
                           color:"#5c2a35",background:"rgba(245,201,204,.3)",border:"1px solid #e39aa0",borderRadius:4,lineHeight:1.7}}>
                You've already shared today ✦<br/>
                <span style={{fontSize:11,fontFamily:"Pixelify Sans,monospace",color:"var(--plum-soft)"}}>
                  One share per day — come back tomorrow!<br/>
                  Or go to the <strong>Community Wall</strong> tab, delete your current post, then share again.
                </span>
              </div>
            ) : shareStatus==="error" ? (
              <div style={{textAlign:"center",padding:"12px 0",fontFamily:"Pixelify Sans,monospace",
                           color:"#c0392b",fontSize:13,lineHeight:1.5}}>
                Couldn't share.<br/>
                <span style={{fontSize:11,opacity:.8}}>{shareError}</span>
              </div>
            ) : (
              <>
                <div className="grat-share-pick-list">
                  {gratitude.filter(g=>g.trim()).map((g,i)=>(
                    <button key={i} className="grat-share-pick-item"
                      disabled={shareStatus==="sharing"}
                      onClick={()=>shareToWall(g, shareLoc)}>
                      {g}
                    </button>
                  ))}
                </div>
                {profile.loc && (
                  <label style={{display:"flex",alignItems:"center",gap:8,marginTop:10,cursor:"pointer",
                                  fontFamily:"Silkscreen,monospace",fontSize:10,color:"var(--plum)",
                                  textTransform:"uppercase",letterSpacing:".04em"}}>
                    <input type="checkbox" checked={shareLoc}
                      onChange={e=>{
                        const v=e.target.checked;
                        setShareLoc(v);
                        localStorage.setItem("sq_share_loc", v?"1":"0");
                      }}
                      style={{width:14,height:14,cursor:"pointer"}}/>
                    Share my location ({profile.loc})
                  </label>
                )}
              </>
            )}
            {shareStatus!=="done" && (
              <button className="coming-soon-btn"
                style={{background:"var(--cream)",color:"var(--plum)",borderColor:"var(--gold)",marginTop:8}}
                onClick={()=>{ setShowGratShare(false); setShareStatus(null); }}>Cancel</button>
            )}
          </div>
        </div>
      )}

      {celebrate && (
        <div className="celebrate" onClick={()=>setCelebrate(false)}>
          <div className="card" onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"center"}}>
              {petStage==="adult"
                ? <ZodiacPet animal={animal} mood="excited" size={140}/>
                : petStage==="baby"
                ? <BabyPet animal={animal} happy={true} size={42}/>
                : <img src={eggSrc(mood||"neutral")} className="egg-idle"
                    style={{width:140,height:140,imageRendering:"pixelated"}} alt="egg"/>
              }
            </div>
            <h3>Day Sealed ✦</h3>
            <p>
              +{Array.from(powerups).reduce((s,id)=>s+(POWERUPS.find(p=>p.id===id)?.xp||0),0) + doneCount*5} XP<br/>
              Your streak grows. The lanterns burn brighter tonight.
            </p>
            <button className="btn-primary" onClick={()=>setCelebrate(false)}>See You Tomorrow ✦</button>
          </div>
        </div>
      )}
    </div>
  );
}

window.Dashboard = Dashboard;
