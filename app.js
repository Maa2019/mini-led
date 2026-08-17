/* =====================================================================
   LLOYD MINI-LED ACADEMY
   Content sourced from the Lloyd New Launch Mini-LED deck.
   ===================================================================== */

const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/&(?!amp;|lt;|gt;|#)/g,"&amp;").replace(/</g,"&lt;");

function rippleAt(el, ev){
  try{
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect(), d = Math.max(r.width, r.height);
    const s = document.createElement("span");
    s.className = "rip"; s.style.width = s.style.height = d + "px";
    s.style.left = ((ev && ev.clientX ? ev.clientX : r.left + r.width/2) - r.left - d/2) + "px";
    s.style.top  = ((ev && ev.clientY ? ev.clientY : r.top + r.height/2) - r.top - d/2) + "px";
    el.appendChild(s); setTimeout(()=>s.remove(), 600);
  }catch(e){}
}
function buzz(ms){ try{ if(navigator.vibrate) navigator.vibrate(ms); }catch(e){} }

/* =====================================================================
   TV RENDERER — a screen whose backlight is really simulated
   ===================================================================== */
function tvShell(inner, opts){
  opts = opts || {};
  return '<div class="tvwrap"><div class="tv' + (opts.mini ? ' mtv' : '') + '">' +
    '<div class="bezel"><div class="scr" id="' + (opts.id || '') + '">' +
      inner + '<div class="vig"></div><div class="shine"></div>' +
    '</div></div><div class="neck"></div><div class="base"></div>' +
    (opts.mini ? '' : '<div class="brandbar">L L O Y D</div>') +
  '</div>' + (opts.cap ? '<div class="caption">' + opts.cap + '</div>' : '') + '</div>';
}

/* Build a backlight zone grid.
   cols x rows zones. scene(x,y) returns 0..1 brightness for that zone. */
function zoneGrid(cols, rows, scene, tint){
  let cells = "";
  for (let y = 0; y < rows; y++){
    for (let x = 0; x < cols; x++){
      const v = Math.max(0, Math.min(1, scene(x/(cols-1||1), y/(rows-1||1))));
      const c = tint ? tint(v) : ('rgba(' + [255,255,255].join(',') + ',' + v + ')');
      const glow = v > .35 ? 'box-shadow:0 0 ' + (10*v).toFixed(1) + 'px rgba(160,205,255,' + (v*.5).toFixed(2) + ')' : '';
      cells += '<div class="z" style="background:' + c + ';' + glow + '"></div>';
    }
  }
  return '<div class="zones" style="grid-template-columns:repeat(' + cols +
         ',1fr);grid-template-rows:repeat(' + rows + ',1fr)">' + cells + '</div>';
}

/* night scene: a bright moon top-right + a few stars, rest near black */
function nightScene(x, y){
  const dx = x - .74, dy = y - .26;
  const moon = Math.exp(-((dx*dx)/0.006 + (dy*dy)/0.012));
  const stars = Math.exp(-((x-.18)**2/0.002 + (y-.62)**2/0.004)) * .55
              + Math.exp(-((x-.42)**2/0.0016 + (y-.18)**2/0.003)) * .42
              + Math.exp(-((x-.60)**2/0.0014 + (y-.76)**2/0.003)) * .38;
  return Math.min(1, moon + stars + .012);
}

/* =====================================================================
   DATA
   ===================================================================== */
const MODELS = [
{
  id:"gtv55", line:"gtv", size:'55"', color:"#3BB8F0",
  name:'55" Mini-LED  ·  Google TV',
  spec:"1400 nits · Google TV 5.0 · 120Hz · 60W",
  nits:1400, zones:[16,9],
  hi:['1400 NITS|PEAK BRIGHTNESS','DCI-P3 94%|1.07 BILLION COLOURS',
      'GOOGLE TV 5.0|FAR FIELD VOICE','60W 2.1CH|INBUILT WOOFER'],
  feats:[
    ["1400 nits peak brightness","Picture stays clear even in a bright living room — no need to draw the curtains."],
    ["DCI-P3 94% · 1.07 billion colours","Skin tones and food look real, not painted. 100% colour accuracy."],
    ["Mini LED + full array local dimming","Thousands of tiny LEDs. Dark scenes stay black instead of turning grey."],
    ["Google TV 5.0 + Far Field Voice","Speak from the sofa without touching the remote. Open app store."],
    ["60W 2.1 channel with inbuilt woofer","Real bass from the TV itself. No soundbar needed on day one."]
  ],
  more:["Dolby Vision","MEMC","ALLM","120Hz","Google Assistant","2-Way Bluetooth"],
  demo:[
    "Play a dark night scene. Point at the black — it stays black, no grey wash.",
    "Turn the showroom lights up. Picture holds because of 1400 nits.",
    "Say a command from 3 metres away — far field voice picks it up.",
    "Play a bass-heavy track. Let him hear the inbuilt woofer, no soundbar."
  ],
  pitch:"Sir, 1400 nits matlab dopahar mein bhi parda band karne ki zarurat nahi. Aur sound ke liye alag soundbar nahi lagega."
},
{
  id:"gtv65", line:"gtv", size:'65"', color:"#3BB8F0",
  name:'65" Mini-LED  ·  Google TV',
  spec:"1400 nits · Google TV 5.0 · 120Hz · 60W",
  nits:1400, zones:[18,10],
  hi:['1400 NITS|PEAK BRIGHTNESS','DCI-P3 94%|1.07 BILLION COLOURS',
      'GOOGLE TV 5.0|FAR FIELD VOICE','120Hz + ALLM|BUILT FOR GAMING'],
  feats:[
    ["1400 nits peak brightness","Bright hall, bright picture. HDR highlights actually look like light."],
    ["DCI-P3 94% · 1.07 billion colours","Wider colour range than any normal LED at this size."],
    ["Mini LED + full array local dimming","More dimming zones than a 55\" — dark detail is even more precise."],
    ["120Hz + ALLM + MEMC","Gaming and cricket with no blur and no lag. Auto low latency mode."],
    ["60W 2.1 channel with inbuilt woofer","Cinema sound in a big room without extra spend."]
  ],
  more:["Dolby Vision","Google Assistant","Far Field Voice","2-Way Bluetooth"],
  demo:[
    "Run a fast cricket or racing clip. Show MEMC — no smear on the ball.",
    "Switch to a dark movie scene and point at the shadow detail.",
    "Raise showroom lights, picture holds at 1400 nits.",
    "Connect his phone over 2-way Bluetooth and play his own song."
  ],
  pitch:"Gaming aur cricket ke liye 120Hz aur ALLM hai — ball smear nahi karegi. Yeh 65 inch pe sabse zyada dikhta hai."
},
{
  id:"gtv75", line:"gtv", size:'75"', color:"#3BB8F0",
  name:'75" Mini-LED  ·  Google TV',
  spec:"1400 nits · Google TV 5.0 · 120Hz · 60W",
  nits:1400, zones:[20,11],
  hi:['1400 NITS|PEAK BRIGHTNESS','75 INCH|FLAGSHIP SIZE',
      'DOLBY VISION|CINEMATIC HDR','60W 2.1CH|INBUILT WOOFER'],
  feats:[
    ["75\" flagship size","Our largest Mini-LED. For halls of 5 steps or more from the sofa."],
    ["1400 nits peak brightness","At this size brightness matters most — the picture never looks flat."],
    ["Dolby Vision","Deeper contrast and close-to-reality colour on supported content."],
    ["Mini LED + full array local dimming","Highest zone count in the lineup. Dark scenes stay clean at scale."],
    ["60W 2.1 channel with inbuilt woofer","Fills a large room. Dolby Audio spatial sound."]
  ],
  more:["Google TV 5.0","MEMC","ALLM","120Hz","Far Field Voice","2-Way Bluetooth"],
  demo:[
    "Ask the steps from sofa to wall. 5 steps or more means 75\" fits.",
    "Play the same Dolby Vision title against an SDR set.",
    "Dark scene first, then bright scene — show both extremes.",
    "Let him hear 60W in the open floor, not in a corner."
  ],
  pitch:"Sir, 5 kadam ya zyada ka room hai toh 75 hi sahi baithega. Chhota lene ke baad log wapas aate hain."
},
{
  id:"web55", line:"web", size:'55"', color:"#8B5CF6",
  name:'55" Mini-LED  ·  WebOS',
  spec:"1000 nits · WebOS · ThinQ AI · Magic Remote",
  nits:1000, zones:[15,8],
  hi:['1000 NITS|VIVID BRIGHTNESS','DCI-P3 94%|WIDE COLOUR GAMUT',
      'MAGIC REMOTE|POINT AND CLICK','APPLE ECOSYSTEM|AIRPLAY · HOMEKIT'],
  feats:[
    ["1000 nits peak brightness","Rich detail and deep contrast, built for HDR10 movies and games."],
    ["DCI-P3 94% wide colour gamut","Same wide gamut as the flagship line — colours stay lifelike."],
    ["Mini LED + full array local dimming","Tiny LEDs behind the panel. Blacks are black, not grey."],
    ["WebOS with ThinQ AI + Magic Remote","Point-and-click remote. AI suggests content by his own taste."],
    ["Apple ecosystem + IoT Matter","AirPlay, HomeKit, Apple TV+, Apple Music. Works with smart home."]
  ],
  more:["HDR10","Dolby Audio","MEMC","ALLM","2-Way Bluetooth"],
  demo:[
    "Hand him the Magic Remote first. Let him move the pointer.",
    "Dark scene — point at black areas staying black.",
    "If he has an iPhone, AirPlay his own photo onto the screen.",
    "Open the app store and search an app he actually uses."
  ],
  pitch:"Ye remote ek baar haath mein lijiye. Aur agar iPhone hai toh AirPlay se apni photo abhi daal ke dekhiye."
},
{
  id:"web65", line:"web", size:'65"', color:"#8B5CF6",
  name:'65" Mini-LED  ·  WebOS',
  spec:"1000 nits · WebOS · ThinQ AI · Magic Remote",
  nits:1000, zones:[17,9],
  hi:['1000 NITS|VIVID BRIGHTNESS','DCI-P3 94%|WIDE COLOUR GAMUT',
      'THINQ AI|PERSONAL SUGGESTIONS','IOT MATTER|SMART HOME READY'],
  feats:[
    ["1000 nits peak brightness","Deeper blacks and vivid colour across a bigger 65\" panel."],
    ["DCI-P3 94% wide colour gamut","Wide gamut with HDR10 — movies look the way they were shot."],
    ["Mini LED + full array local dimming","More zones than the 55\". Better shadow control at size."],
    ["ThinQ AI + Magic Remote","Personalised suggestions and a point-and-click remote."],
    ["IoT Matter + Apple ecosystem","Controls the smart home. AirPlay, HomeKit, Apple TV+, Apple Music."]
  ],
  more:["HDR10","Dolby Audio","MEMC","ALLM","2-Way Bluetooth"],
  demo:[
    "Magic Remote in his hand before any spec talk.",
    "Play an HDR10 title and point at contrast in the dark areas.",
    "Show ThinQ AI suggestions on the home row.",
    "Mention Matter if he has smart lights or plugs at home."
  ],
  pitch:"ThinQ AI aapki pasand ke hisaab se content suggest karega — har baar dhoondhna nahi padega."
}
];

const QUIZ = [
  ["What makes a Mini-LED backlight different from a normal LED backlight?",
   ["The panel is thinner","Thousands of much smaller LEDs in many more dimming zones",
    "It uses OLED pixels","It has no backlight at all"],1,
   "Mini-LED uses far smaller LEDs, so the backlight is split into many more independently controlled zones."],
  ["What is the peak brightness of the Google TV Mini-LED line?",
   ["800 nits","1000 nits","1400 nits","2000 nits"],2,
   "The Google TV Mini-LED line reaches 1400 nits peak brightness."],
  ["What is the peak brightness of the WebOS Mini-LED line?",
   ["600 nits","1000 nits","1400 nits","1800 nits"],1,
   "The WebOS Mini-LED line is rated at 1000 nits peak brightness."],
  ["What colour gamut does Mini-LED cover?",
   ["DCI-P3 72%","DCI-P3 85%","DCI-P3 94%","sRGB 100%"],2,
   "DCI-P3 94% with 100% colour accuracy — over a billion colours from the QD display."],
  ["Why do dark scenes look better on Mini-LED?",
   ["The screen is dimmer overall","More zones + local dimming keep black areas switched off",
    "It adds a filter over the panel","It reduces the resolution"],1,
   "More dimming zones mean light can be switched off exactly where the picture is dark, instead of washing a whole area grey."],
  ["What is the speaker system on the Google TV Mini-LED line?",
   ["2.0 channel 20W","2.1 channel 60W with inbuilt woofer","5.1 channel 80W","Mono 10W"],1,
   "2.1 channel, 60W, with an inbuilt woofer — real bass without a soundbar."],
  ["Which sizes is the Google TV Mini-LED line available in?",
   ['43", 50", 55"','50", 55", 65"','55", 65", 75"','65", 75", 85"'],2,
   'The Google TV Mini-LED line comes in 55", 65" and 75".'],
  ["Which feature helps most with fast sports and gaming?",
   ["Wide colour gamut","MEMC with 120Hz and ALLM","Inbuilt woofer","Matter support"],1,
   "MEMC smooths fast motion, 120Hz keeps it fluid, and ALLM drops input lag automatically for gaming."],
  ["What does the WebOS Mini-LED line offer that the Google TV line does not?",
   ["Higher brightness","Magic Remote, ThinQ AI and the Apple ecosystem",
    "A larger 75\" size","An inbuilt woofer"],1,
   "WebOS brings the Magic Remote, ThinQ AI suggestions, and Apple TV+, AirPlay, Apple Music and HomeKit."],
  ["In the display stack, what sits directly behind the LCD panel?",
   ["The remote sensor","The Mini-LED backlight with full array local dimming",
    "The speaker array","The tuner board"],1,
   "Order is Mini-LED backlight with full array local dimming, then QD layer, then the LCD panel."],
  ["What does the 2.1 in a 2.1 channel speaker system mean?",
   ["Two tweeters and one remote","Left, right and a dedicated woofer",
    "Two HDMI ports and one USB","Version 2.1 of Dolby"],1,
   "2.1 means a left channel, a right channel and a separate woofer for bass — built into the TV."],
  ["What is the difference between colour gamut and colour accuracy?",
   ["They are the same thing","Gamut is the range of colour, accuracy is whether it is the correct colour",
    "Gamut is for HDR only","Accuracy applies only to the remote"],1,
   "Gamut is how much colour the panel can show (DCI-P3 94%). Accuracy is whether that colour is correct (100%). Mini-LED delivers both."],
  ["What does ALLM do?",
   ["Increases the brightness automatically","Switches the TV to low latency game mode automatically",
    "Adds Dolby Atmos","Extends the warranty"],1,
   "Auto Low Latency Mode switches the TV into game mode by itself when a console connects — the customer never has to find the setting."],
  ["Why does a QD panel show smoother skies than a standard panel?",
   ["It runs at a higher refresh rate","It shows 1.07 billion shades instead of 16.7 million",
    "It has more HDMI ports","It uses a different remote"],1,
   "More shades means gradients step smoothly instead of showing visible bands."]
];


/* =====================================================================
   LIVE DEMO MODULES — one animated screen per technology
   ===================================================================== */
let dIdx = 0, dState = {};

function ds(k, def){ return dState[k] === undefined ? def : dState[k]; }

/* ---- 1. LOCAL DIMMING ---- */
function dDim(){
  const mini = ds("dim", true);
  const cfg = mini ? [24,13] : [4,2];
  return {
    scr: zoneGrid(cfg[0], cfg[1], nightScene,
      v=>'rgba(' + Math.round(200+55*v) + ',' + Math.round(215+40*v) + ',255,' +
         (0.04+0.96*v).toFixed(3) + ')') +
      '<div class="ovl">' + (mini ? "MINI LED · 312 ZONES" : "NORMAL LED · 8 ZONES") + '</div>',
    cap:"Watch the black sky around the moon",
    seg:[["dim",false,"Normal LED"],["dim",true,"Mini LED"]],
    tp:[["Few big zones wash a whole block grey. That grey is called blooming.","#EF2B36"],
        ["Thousands of tiny zones switch off exactly where the picture is dark.","#31B85C"],
        ["This is full array local dimming — light controlled area by area.","#3BB8F0"]]
  };
}

/* ---- 2. BRIGHTNESS IN A BRIGHT ROOM ---- */
function dBright(){
  const n = ds("nits", 1400), sun = ds("sun", true);
  const f = n/1400;
  return {
    scr: zoneGrid(20,11,(x,y)=>{
        const s = Math.exp(-((x-.72)**2/0.012 + (y-.24)**2/0.02));
        const m = Math.exp(-((x-.36)**2/0.09 + (y-.60)**2/0.06))*.45;
        return Math.min(1, s*f + m*(0.35+0.65*f) + .02);
      }, v=>'rgba(255,244,214,' + (0.03+0.97*v).toFixed(3) + ')') +
      '<div class="sun' + (sun ? ' on' : '') + '"></div>' +
      '<div class="ovl">' + (sun ? "BRIGHT ROOM" : "DARK ROOM") + '</div>' +
      '<div class="nits">' + n + ' nits</div>',
    cap:"Drag the slider. Then switch the room lights on.",
    range:{key:"nits", min:300, max:1400, step:50, label:" nits"},
    seg:[["sun",false,"Dark room"],["sun",true,"Bright room"]],
    tp:[["A 300 nit TV looks fine in a dark showroom and washes out at home.","#EF2B36"],
        ["1400 nits holds the picture with the curtains open.","#F5B617"],
        ["Ask the customer: TV kis room mein lagega — hall ya bedroom?","#3BB8F0"]]
  };
}

/* ---- 3. SDR vs DOLBY VISION — real colour difference ---- */
const SDR_SW = ["#7E5F4B","#6B7A63","#5E6E86","#8A6B72","#7A7458","#5F6B6E"];
const DV_SW  = ["#FF6A1F","#22C55E","#1E7FD0","#EC1F5E","#F5B617","#12B8A6"];
function dColour(){
  const dv = ds("dv", true);
  const set = dv ? DV_SW : SDR_SW;
  let sw = "";
  set.forEach(c => sw += '<div style="background:' + c +
    (dv ? ';box-shadow:0 0 14px ' + c + '66' : '') + '"></div>');
  const base = dv
    ? 'linear-gradient(125deg,#06122B,#0E3A6B 34%,#1E7FD0 58%,#F5B617 84%,#EF4A1F)'
    : 'linear-gradient(125deg,#1A2233,#2C3A4E 34%,#47566B 58%,#8A8368 84%,#8A6656)';
  return {
    scr: '<div class="zones" style="grid-template-columns:1fr;grid-template-rows:1fr">' +
      '<div class="z" style="background:' + base + '"></div></div>' +
      '<div class="sw">' + sw + '</div>' +
      '<div class="ovl">' + (dv ? "DOLBY VISION" : "SDR") + '</div>' +
      '<div class="swlab">' + (dv ? "RICH · DEEP · CLOSE TO REAL" : "FLAT · MUTED · WASHED") + '</div>',
    cap:"Same scene, same swatches. Only the format changes.",
    seg:[["dv",false,"SDR"],["dv",true,"Dolby Vision"]],
    tp:[["SDR compresses the bright and dark ends — colour goes flat.","#94A2CE"],
        ["Dolby Vision carries scene-by-scene data for deeper contrast and richer colour.","#F5B617"],
        ["On the floor: play the SAME title on both sets. Never describe this — show it.","#3BB8F0"]]
  };
}

/* ---- 4. DCI-P3 94% COLOUR GAMUT ---- */
function dGamut(){
  const wide = ds("gam", true);
  const poly = wide ? "50,8 92,78 8,78" : "50,30 74,70 26,70";
  const fill = wide ? "url(#gw)" : "#4A5578";
  return {
    scr:'<div class="zones" style="grid-template-columns:1fr;grid-template-rows:1fr">' +
      '<div class="z" style="background:#050A1C"></div></div>' +
      '<div class="gam"><svg viewBox="0 0 100 88" preserveAspectRatio="xMidYMid meet">' +
      '<defs><linearGradient id="gw" x1="0" y1="1" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#1E7FD0"/><stop offset=".45" stop-color="#31B85C"/>' +
      '<stop offset=".75" stop-color="#F5B617"/><stop offset="1" stop-color="#EF2B36"/>' +
      '</linearGradient></defs>' +
      '<polygon points="50,8 92,78 8,78" fill="none" stroke="#2C3768" stroke-width="1.2"/>' +
      '<polygon class="gpoly" points="' + poly + '" fill="' + fill + '" opacity="' +
      (wide ? ".92" : ".7") + '"/></svg></div>' +
      '<div class="ovl">' + (wide ? "DCI-P3 94%" : "STANDARD GAMUT") + '</div>' +
      '<div class="swlab">' + (wide ? "WIDE COLOUR RANGE" : "NARROW COLOUR RANGE") + '</div>',
    cap:"The triangle is how much colour the panel can actually show",
    seg:[["gam",false,"Standard"],["gam",true,"DCI-P3 94%"]],
    tp:[["Gamut is the RANGE of colour. Accuracy is whether it is the CORRECT colour.","#94A2CE"],
        ["Mini-LED gives DCI-P3 94% range with 100% colour accuracy — both, not one.","#8B5CF6"],
        ["DCI-P3 is the standard cinema is graded in. Wider gamut = closer to what the director saw.","#3BB8F0"]]
  };
}

/* ---- 5. 1.07 BILLION COLOURS ---- */
function dColours(){
  const qd = ds("qd", true);
  const n = qd ? "1.07 BILLION" : "16.7 MILLION";
  const base = qd
    ? 'conic-gradient(from 200deg,#EF2B36,#F5B617,#31B85C,#12B8A6,#1E7FD0,#8B5CF6,#EF2B36)'
    : 'conic-gradient(from 200deg,#6E5560,#7A7258,#5F7061,#4F6A6C,#4A5F80,#5D5279,#6E5560)';
  return {
    scr:'<div class="zones" style="grid-template-columns:1fr;grid-template-rows:1fr">' +
      '<div class="z" style="background:' + base + ';filter:blur(9px) saturate(' +
      (qd ? 1.25 : .75) + ')"></div></div>' +
      '<div class="cnt">' + n + '</div><div class="cntsub">COLOURS ON SCREEN</div>' +
      '<div class="ovl">' + (qd ? "QD DISPLAY · 10-BIT" : "STANDARD · 8-BIT") + '</div>',
    cap:"More shades means smoother skies and skin, with no banding",
    seg:[["qd",false,"Standard panel"],["qd",true,"QD Display"]],
    tp:[["8-bit gives 16.7 million shades. Skies show visible steps, called banding.","#94A2CE"],
        ["The quantum dot layer takes it to 1.07 billion shades — gradients stay smooth.","#F5B617"],
        ["Demo it on a sunset or a dark sky. Banding is where cheap panels give themselves away.","#3BB8F0"]]
  };
}

/* ---- 6. MEMC MOTION ---- */
function dMemc(){
  const on = ds("memc", true);
  return {
    scr:'<div class="zones" style="grid-template-columns:1fr;grid-template-rows:1fr">' +
      '<div class="z" style="background:linear-gradient(160deg,#0C1B3A,#123055)"></div></div>' +
      (on ? '' : '<div class="trail"></div>') +
      '<div class="ball' + (on ? '' : ' blur') + '"></div>' +
      '<div class="ovl">' + (on ? "MEMC ON · SHARP" : "MEMC OFF · BLUR") + '</div>',
    cap:"Watch the ball as it crosses",
    seg:[["memc",false,"MEMC Off"],["memc",true,"MEMC On"]],
    tp:[["MEMC inserts frames between frames so fast motion stops smearing.","#31B85C"],
        ["120Hz keeps the whole picture fluid, not just the moving object.","#F5B617"],
        ["Demo on cricket or racing. Point at the ball, not at the spec sheet.","#3BB8F0"]]
  };
}

/* ---- 7. ALLM / GAMING LATENCY ---- */
function dAllm(){
  const on = ds("allm", true);
  const ms = on ? 12 : 88, pct = on ? 14 : 88;
  return {
    scr:'<div class="zones" style="grid-template-columns:1fr;grid-template-rows:1fr">' +
      '<div class="z" style="background:linear-gradient(160deg,#10163A,#241A44)"></div></div>' +
      '<div class="chlab">' + (on ? "GAME MODE · ALLM ON" : "STANDARD MODE") + '</div>' +
      '<div class="lat"><div class="latbar"><i style="width:' + pct + '%;background:' +
      (on ? "#31B85C" : "#EF2B36") + '"></i></div>' +
      '<div class="latlab"><span>Input lag</span><span>' + ms + ' ms</span></div></div>' +
      '<div class="ovl">' + (on ? "LOW LATENCY" : "HIGH LATENCY") + '</div>',
    cap:"Input lag is the delay between the controller and the screen",
    seg:[["allm",false,"Standard"],["allm",true,"ALLM On"]],
    tp:[["ALLM switches the TV to game mode automatically when a console connects.","#31B85C"],
        ["No menu diving. The customer never has to find the setting.","#F5B617"],
        ["Ask if anyone at home games. If yes, ALLM plus 120Hz closes the sale.","#3BB8F0"]],
    note:"Latency figures shown are illustrative, to explain the concept."
  };
}

/* ---- 8. DOLBY AUDIO · 60W 2.1 WITH WOOFER ---- */
function dAudio(){
  const big = ds("aud", true);
  let atms = "";
  if (big) for (let i=0;i<3;i++)
    atms += '<div class="atm go" style="left:22%;top:' + (26+i*13) + '%;animation-delay:' +
            (i*1.1) + 's"></div>';
  return {
    scr:'<div class="zones" style="grid-template-columns:1fr;grid-template-rows:1fr">' +
      '<div class="z" style="background:linear-gradient(160deg,#0A1230,#1D1440)"></div></div>' +
      '<div class="chlab">' + (big ? "2.1 CHANNEL · 60W · WOOFER" : "2.0 CHANNEL · 20W") + '</div>' +
      atms +
      '<div class="ring go" style="animation-delay:0s"></div>' +
      (big ? '<div class="ring go" style="animation-delay:.65s"></div>' +
             '<div class="ring go" style="animation-delay:1.3s"></div>' : '') +
      '<div class="spk">' +
        '<div class="cone pump' + (big ? '' : ' slow') + '"></div>' +
        (big ? '<div class="cone big pump"></div>' : '') +
        '<div class="cone pump' + (big ? '' : ' slow') + '"></div>' +
      '</div>' +
      '<div class="ovl">' + (big ? "DOLBY AUDIO" : "BASIC AUDIO") + '</div>',
    cap:"The big centre cone is the inbuilt woofer",
    seg:[["aud",false,"2.0 · 20W"],["aud",true,"2.1 · 60W"]],
    tp:[["2.1 means left, right AND a dedicated woofer for bass — inside the TV.","#F5B617"],
        ["60W fills a hall. Most LED sets ship 20W and need a soundbar.","#31B85C"],
        ["Dolby Audio spatial sound places effects around the room, not just left and right.","#8B5CF6"],
        ["Demo with a bass-heavy scene at MATCHED loudness, not matched volume number.","#3BB8F0"]]
  };
}

/* ---- 9. AIRPLAY / APPLE ECOSYSTEM ---- */
function dAir(){
  const on = ds("air", true);
  return {
    scr:'<div class="zones" style="grid-template-columns:1fr;grid-template-rows:1fr">' +
      '<div class="z" style="background:' + (on
        ? 'linear-gradient(150deg,#08122E,#123A6B 55%,#1E7FD0)'
        : 'linear-gradient(150deg,#0C1024,#1A2140)') + '"></div></div>' +
      '<div class="chlab">' + (on ? "AIRPLAY CONNECTED" : "NO CASTING") + '</div>' +
      '<div class="phone"><i></i><b></b></div>' +
      (on ? '<div class="fly go"></div>' +
            '<div class="apwave go"></div>' +
            '<div class="apwave go" style="animation-delay:.6s"></div>' +
            '<div class="apwave go" style="animation-delay:1.2s"></div>' : '') +
      '<div class="ovl">' + (on ? "APPLE ECOSYSTEM" : "PHONE ONLY") + '</div>',
    cap:"His own phone content, on the big screen, in seconds",
    seg:[["air",false,"Off"],["air",true,"AirPlay On"]],
    tp:[["AirPlay puts his own photos and video on the TV without any cable or app.","#3BB8F0"],
        ["Apple TV+, Apple Music and HomeKit all work with the WebOS Mini-LED line.","#8B5CF6"],
        ["If he owns an iPhone, do this FIRST. It converts faster than any spec.","#F5B617"]],
    note:"AirPlay, HomeKit, Apple TV+ and Apple Music are on the WebOS Mini-LED line."
  };
}

/* ---- 10. FAR FIELD VOICE ---- */
function dVoice(){
  const on = ds("voice", true);
  return {
    scr:'<div class="zones" style="grid-template-columns:1fr;grid-template-rows:1fr">' +
      '<div class="z" style="background:linear-gradient(160deg,#0A1330,#10304F)"></div></div>' +
      '<div class="chlab">' + (on ? "FAR FIELD VOICE" : "REMOTE MIC ONLY") + '</div>' +
      '<div class="mic">\u25CF</div>' +
      (on ? '<div class="vw go"></div><div class="vw go" style="animation-delay:.7s"></div>' +
            '<div class="vw go" style="animation-delay:1.4s"></div>' +
            '<div class="vtext go">\u201COK Google, cricket lagao\u201D</div>' : '') +
      '<div class="ovl">' + (on ? "HANDS FREE" : "REMOTE NEEDED") + '</div>',
    cap:"Speak from the sofa. No remote in hand.",
    seg:[["voice",false,"Remote mic"],["voice",true,"Far field"]],
    tp:[["Far field mics pick up the voice from across the room, not just at the remote.","#31B85C"],
        ["Google Assistant understands Hindi and regional speech.","#F5B617"],
        ["Demo it from three metres away. Ask HIM to speak, not you.","#3BB8F0"]],
    note:"Far Field Voice is on the Google TV 5.0 Mini-LED line."
  };
}

const DEMOS = [
  ["Local Dimming", dDim],
  ["Brightness",    dBright],
  ["Dolby Vision",  dColour],
  ["DCI-P3 94%",    dGamut],
  ["1.07bn Colours",dColours],
  ["MEMC Motion",   dMemc],
  ["ALLM Gaming",   dAllm],
  ["60W Audio",     dAudio],
  ["AirPlay",       dAir],
  ["Far Field Voice", dVoice]
];

function vDemos(){
  const d = DEMOS[dIdx][1]();
  let h = '<div class="chips" id="dchips">' + DEMOS.map((x,i)=>
    '<button class="chip2' + (i===dIdx?" on":"") + '" data-d="' + i + '">' + x[0] + '</button>'
  ).join("") + '</div>';

  h += '<div class="card"><h3>' + DEMOS[dIdx][0].toUpperCase() + '</h3>' +
       tvShell('<div id="dscr">' + d.scr + '</div>', {cap:d.cap});

  if (d.range){
    const v = ds(d.range.key, d.range.max);
    h += '<div class="slab"><span>Drag to change</span><b id="rlab">' + v + d.range.label + '</b></div>' +
         '<input type="range" id="drange" min="' + d.range.min + '" max="' + d.range.max +
         '" step="' + d.range.step + '" value="' + v + '">';
  }
  h += '<div class="seg" id="dseg">' + d.seg.map(s=>
    '<button data-k="' + s[0] + '" data-v="' + (s[1]?1:0) + '" class="' +
    (ds(s[0], true) === s[1] ? "on" : "") + '">' + s[2] + '</button>').join("") + '</div>';
  h += '</div>';

  h += '<div class="card"><h3>WHAT TO SAY WHILE THEY WATCH</h3>';
  d.tp.forEach(t => {
    h += '<div class="tp"><div class="tpd" style="background:' + t[1] + '"></div>' +
         '<div class="tpt">' + t[0] + '</div></div>';
  });
  h += '</div>';
  if (d.note) h += '<div class="card mut" style="font-size:12.5px">' + d.note + '</div>';

  h += '<div class="seg" style="margin-top:4px">' +
    '<button id="dprev">‹ Previous</button><button id="dnext">Next ›</button></div>';
  return h;
}

function wireDemos(){
  document.querySelectorAll("#dchips button").forEach(b=>{
    b.onclick = ev => { rippleAt(b,ev); dIdx = +b.dataset.d;
      $("screen").innerHTML = vDemos(); wireDemos(); window.scrollTo({top:0,behavior:"smooth"}); };
  });
  document.querySelectorAll("#dseg button").forEach(b=>{
    b.onclick = ev => { rippleAt(b,ev); buzz(10);
      dState[b.dataset.k] = b.dataset.v === "1";
      $("screen").innerHTML = vDemos(); wireDemos(); };
  });
  const r = $("drange");
  if (r) r.oninput = () => {
    const d = DEMOS[dIdx][1]();
    dState[d.range.key] = +r.value;
    $("rlab").textContent = r.value + d.range.label;
    $("dscr").innerHTML = DEMOS[dIdx][1]().scr;
  };
  const p = $("dprev"), n = $("dnext");
  if (p) p.onclick = ev => { rippleAt(p,ev); dIdx = (dIdx-1+DEMOS.length)%DEMOS.length;
    $("screen").innerHTML = vDemos(); wireDemos(); window.scrollTo({top:0,behavior:"smooth"}); };
  if (n) n.onclick = ev => { rippleAt(n,ev); dIdx = (dIdx+1)%DEMOS.length;
    $("screen").innerHTML = vDemos(); wireDemos(); window.scrollTo({top:0,behavior:"smooth"}); };
}

/* =====================================================================
   NAV
   ===================================================================== */
let view = "home", model = null, tab = "feat";
const MTABS = [["feat","Features"],["demo","Demo"],["pitch","Pitch"],["spec","All Specs"]];

function go(v, id){
  view = v; model = id ? MODELS.find(m=>m.id===id) : null;
  if (v === "model") tab = "feat";
  $("backBtn").classList.toggle("hide", v === "home");
  $("tabsBar").classList.toggle("hide", v !== "model");
  render(); window.scrollTo(0,0);
}
$("backBtn").onclick = () => go(view === "model" ? "models" : "home");

function head(t, s){ $("hT").textContent = t; $("hS").textContent = s; }

/* =====================================================================
   RENDER
   ===================================================================== */
function render(){
  const S = $("screen");
  if (view === "home")    { head("Mini-LED Academy","Lloyd · New Launch · Learn in 10 minutes"); S.innerHTML = vHome(); wireHome(); }
  if (view === "what")    { head("What is Mini-LED?","Tap the buttons and watch the screen"); S.innerHTML = vWhat(); wireWhat(); }
  if (view === "why")     { head("Why Mini-LED?","Against the current LED lineup"); S.innerHTML = vWhy(); wireWhy(); }
  if (view === "models")  { head("Mini-LED Models","5 models · 2 lines"); S.innerHTML = vModels(); wireModels(); }
  if (view === "model")   { head(model.name, model.spec); renderTabs(); S.innerHTML = vModel(); wireModel(); }
  if (view === "demos")   { head("Live Demos", DEMOS.length + " interactive screens"); S.innerHTML = vDemos(); wireDemos(); }
  if (view === "quiz")    { head("Knowledge Check","10 questions"); S.innerHTML = vQuiz(); wireQuiz(); }
}

/* ---------------- HOME ---------------- */
function vHome(){
  const m = MODELS[0];
  let feats = "", dots = "";
  ['MINI LED|THOUSANDS OF TINY LEDS','1400 NITS|PEAK BRIGHTNESS',
   'DCI-P3 94%|1.07 BILLION COLOURS','60W 2.1CH|INBUILT WOOFER'].forEach((t,i)=>{
    const p = t.split("|");
    feats += '<span style="animation-delay:' + (i*2.5) + 's">' + p[0] +
             '<i>' + p[1] + '</i></span>';
    dots  += '<b style="animation-delay:' + (i*2.5) + 's"></b>';
  });
  const inner = zoneGrid(18,10,(x,y)=>{
      const c = Math.exp(-((x-.5)**2/0.10 + (y-.42)**2/0.09));
      return c*.85 + .05;
    }, v => 'rgba(' + Math.round(40+140*v) + ',' + Math.round(90+130*v) + ',' +
                      Math.round(180+70*v) + ',' + (0.15+0.85*v) + ')') +
    '<div class="ovl">MINI LED</div><div class="ovr">NEW LAUNCH</div>' +
    '<div class="feathero">' + feats + '</div><div class="dots">' + dots + '</div>';

  return tvShell(inner, {cap:"Lloyd Mini-LED · 55\" · 65\" · 75\""}) +
  '<div class="tiles" style="margin-top:14px">' +
    tile("what","◉","What is Mini-LED?","See the backlight work") +
    tile("why","▲","Why Mini-LED?","Against the LED lineup") +
    tile("demos","▶","Live Demos","10 screens you can toggle","wide") +
    tile("models","▤","The 5 Models","Features &amp; benefits","wide") +
    tile("quiz","✓","Knowledge Check","10 questions","wide") +
  '</div>' +
  '<div class="card" style="margin-top:14px"><h3>THE ONE LINE</h3>' +
  '<div class="big">Normal LED lights the whole screen. Mini-LED lights only the part that needs light.</div>' +
  '<div class="p mut">That single difference is where brightness, contrast and colour all come from.</div></div>';
}
function tile(id, ic, t, s, cls){
  return '<div class="tile ' + (cls||'') + '" data-go="' + id + '">' +
    '<div class="ic">' + ic + '</div><div class="tt">' + t + '</div>' +
    '<div class="ts">' + s + '</div></div>';
}
function wireHome(){
  document.querySelectorAll("[data-go]").forEach(el=>{
    el.onclick = ev => { rippleAt(el,ev); setTimeout(()=>go(el.dataset.go),120); };
  });
}

/* ---------------- WHAT IS MINI-LED ---------------- */
let whatMode = "mini";
function whatScreen(){
  const cfg = whatMode === "normal" ? [4,2] : [24,13];
  const inner = zoneGrid(cfg[0], cfg[1], nightScene,
      v => 'rgba(' + Math.round(200+55*v) + ',' + Math.round(215+40*v) + ',255,' +
           (0.04 + 0.96*v).toFixed(3) + ')') +
    '<div class="ovl">' + (whatMode === "normal" ? "NORMAL LED  ·  8 ZONES"
                                                 : "MINI LED  ·  312 ZONES") + '</div>';
  return inner;
}
function vWhat(){
  return '<div class="card"><h3>THE IDEA</h3>' +
    '<div class="big">Same night scene. Two backlights.</div>' +
    '<div class="p">Tap the buttons and watch what happens to the black sky around the moon.</div></div>' +
    tvShell('<div id="wscr">' + whatScreen() + '</div>',
      {cap:"The moon should be bright. The sky should stay black. Zone counts are illustrative."}) +
    '<div class="seg" id="wseg">' +
      '<button data-w="normal" class="' + (whatMode==="normal"?"on":"") + '">Normal LED</button>' +
      '<button data-w="mini" class="' + (whatMode==="mini"?"on":"") + '">Mini LED</button>' +
    '</div>' +
    '<div class="card" style="margin-top:13px"><h3>WHAT YOU JUST SAW</h3>' +
    '<div class="fr"><div class="fn" style="background:#EF2B36">1</div><div>' +
    '<div class="fh">Normal LED — few big zones</div>' +
    '<div class="fb">To light the moon, a whole large block must switch on. The black sky around it turns grey. This grey glow is called blooming.</div></div></div>' +
    '<div class="fr"><div class="fn" style="background:#31B85C">2</div><div>' +
    '<div class="fh">Mini LED — thousands of tiny zones</div>' +
    '<div class="fb">Only the tiny zones under the moon light up. Everything else stays switched off, so black stays black.</div></div></div>' +
    '<div class="fr"><div class="fn" style="background:#3BB8F0">3</div><div>' +
    '<div class="fh">This is full array local dimming</div>' +
    '<div class="fb">Light is controlled area by area across the whole panel — not just from the edges.</div></div></div>' +
    '</div>' +
    '<div class="card"><h3>THE STACK — WHAT IS BEHIND THE SCREEN</h3><div class="stack">' +
      layer("Mini-LED backlight","Thousands of tiny LEDs with full array local dimming","#3BB8F0","#0E2B44") +
      layer("QD layer (QD-DP)","Quantum dots create 1.07 billion colours, DCI-P3 94%","#F5B617","#332708") +
      layer("LCD panel","Forms the actual picture from the light behind it","#8B5CF6","#241A44") +
      layer("Picture quality engine","Dolby Vision / HDR10, MEMC, 100% colour accuracy","#31B85C","#0E2E1C") +
    '</div></div>';
}
function layer(t,s,c,bg){
  return '<div class="ly" style="background:' + bg + ';border-color:' + c + '55">' +
    '<b style="color:' + c + '">' + t + '</b><span>' + s + '</span></div>';
}
function wireWhat(){
  document.querySelectorAll("#wseg button").forEach(b=>{
    b.onclick = ev => {
      rippleAt(b,ev); whatMode = b.dataset.w; buzz(10);
      document.querySelectorAll("#wseg button").forEach(x=>x.classList.toggle("on", x===b));
      $("wscr").innerHTML = whatScreen();
    };
  });
}

/* ---------------- WHY MINI-LED ---------------- */
let nits = 1400, dvOn = true, memcOn = true;
function whyScreen(){
  const f = nits / 1400;
  const inner = zoneGrid(20,11,(x,y)=>{
      const sun = Math.exp(-((x-.72)**2/0.012 + (y-.24)**2/0.02));
      const mid = Math.exp(-((x-.36)**2/0.09 + (y-.60)**2/0.06))*.45;
      return Math.min(1, sun*f + mid*(0.35+0.65*f) + .02);
    }, v => {
      const warm = dvOn;
      const r = warm ? 255 : 205, g = warm ? 236 : 208, b = warm ? 190 : 215;
      return 'rgba(' + r + ',' + g + ',' + b + ',' + (0.03 + 0.97*v).toFixed(3) + ')';
    }) +
    '<div class="ovl">' + (dvOn ? "DOLBY VISION" : "SDR") + '</div>' +
    '<div class="nits">' + nits + ' nits</div>';
  return inner;
}
function memcScreen(){
  return '<div class="zones" style="grid-template-columns:1fr;grid-template-rows:1fr">' +
    '<div class="z" style="background:linear-gradient(160deg,#0C1B3A,#123055)"></div></div>' +
    (memcOn ? '' : '<div class="trail"></div>') +
    '<div class="ball' + (memcOn ? '' : ' blur') + '"></div>' +
    '<div class="ovl">' + (memcOn ? "MEMC ON  ·  SHARP" : "MEMC OFF  ·  BLUR") + '</div>';
}
function vWhy(){
  return '<div class="card"><h3>THE COMPARISON</h3>' +
    '<div class="big">Where Mini-LED sits in the current LED lineup</div>' +
    '<div class="p mut">Drag the slider and flip the switches. Everything below is live.</div></div>' +
    tvShell('<div id="yscr">' + whyScreen() + '</div>',
      {cap:"Brightness is what makes HDR highlights look like real light"}) +
    '<div class="slab"><span>Peak brightness</span><b id="nlab">' + nits + ' nits</b></div>' +
    '<input type="range" id="nrange" min="300" max="1400" step="50" value="' + nits + '">' +
    '<div class="seg" id="dvseg">' +
      '<button data-dv="0" class="' + (!dvOn?"on":"") + '">SDR</button>' +
      '<button data-dv="1" class="' + (dvOn?"on":"") + '">Dolby Vision</button>' +
    '</div>' +
    '<div class="card" style="margin-top:13px"><h3>GO DEEPER</h3>' +
    '<div class="p">Ten interactive screens — colour, gamut, audio, AirPlay, gaming latency and more.</div>' +
    '<button class="btn" id="toDemos">Open Live Demos</button></div>' +

    '<div class="card" style="margin-top:14px"><h3>MINI-LED vs THE REST</h3>' +
      statBar("Mini-LED (Google TV)","1400 nits",100,"#3BB8F0") +
      statBar("Mini-LED (WebOS)","1000 nits",71,"#8B5CF6") +
      statBar("Premium QLED","≈ 600 nits",43,"#F5B617") +
      statBar("Standard LED","≈ 300 nits",21,"#6B7BA8") +
      '<div class="mut" style="margin-top:6px;font-size:12px">Comparison figures for the non-Lloyd rows are typical market values, not measured. Our two figures come from the launch deck.</div>' +
    '</div>' +

    '<div class="card"><h3>MOTION — MEMC</h3>' +
    tvShell('<div id="mscr">' + memcScreen() + '</div>',
      {cap:"Watch the ball as it moves across"}) +
    '<div class="seg" id="mseg">' +
      '<button data-me="0" class="' + (!memcOn?"on":"") + '">MEMC Off</button>' +
      '<button data-me="1" class="' + (memcOn?"on":"") + '">MEMC On</button>' +
    '</div>' +
    '<div class="p mut" style="margin-top:10px">MEMC removes smear from fast motion. With 120Hz and ALLM, gaming and cricket stay sharp with low input lag.</div></div>' +

    '<div class="card"><h3>THE FOUR REASONS</h3>' +
      why4("Brightness","1400 nits means the picture holds up in a bright living room. Most LED sets wash out.","#F5B617") +
      why4("Contrast","Full array local dimming keeps black black. Normal LED turns dark scenes grey.","#3BB8F0") +
      why4("Colour","DCI-P3 94% with 1.07 billion colours and 100% colour accuracy.","#8B5CF6") +
      why4("Sound","60W 2.1 channel with an inbuilt woofer. No soundbar needed on day one.","#31B85C") +
    '</div>';
}
function statBar(t, v, pct, c){
  return '<div class="bar"><div class="bl"><span>' + t + '</span><b>' + v + '</b></div>' +
    '<div class="bt"><i data-w="' + pct + '" style="background:' + c + '"></i></div></div>';
}
function why4(t,s,c){
  return '<div class="fr"><div class="fn" style="background:' + c + '">' + t[0] + '</div>' +
    '<div><div class="fh">' + t + '</div><div class="fb">' + s + '</div></div></div>';
}
function wireWhy(){
  const td = $("toDemos");
  if (td) td.onclick = ev => { rippleAt(td,ev); go("demos"); };
  setTimeout(()=>document.querySelectorAll(".bt i").forEach(i=>{
    i.style.width = i.dataset.w + "%";
  }), 90);
  const r = $("nrange");
  r.oninput = () => { nits = +r.value; $("nlab").textContent = nits + " nits";
    $("yscr").innerHTML = whyScreen(); };
  document.querySelectorAll("#dvseg button").forEach(b=>{
    b.onclick = ev => { rippleAt(b,ev); dvOn = b.dataset.dv === "1"; buzz(10);
      document.querySelectorAll("#dvseg button").forEach(x=>x.classList.toggle("on",x===b));
      $("yscr").innerHTML = whyScreen(); };
  });
  document.querySelectorAll("#mseg button").forEach(b=>{
    b.onclick = ev => { rippleAt(b,ev); memcOn = b.dataset.me === "1"; buzz(10);
      document.querySelectorAll("#mseg button").forEach(x=>x.classList.toggle("on",x===b));
      $("mscr").innerHTML = memcScreen(); };
  });
}

/* ---------------- MODEL LIST ---------------- */
function miniTV(m){
  return '<div class="mtv"><div class="bezel"><div class="scr">' +
    zoneGrid(8,5,(x,y)=>Math.exp(-((x-.5)**2/0.12+(y-.45)**2/0.10))*.9+.05,
      v=>'rgba(' + Math.round(50+150*v) + ',' + Math.round(110+120*v) + ',' +
          Math.round(200+55*v) + ',' + (0.15+0.85*v) + ')') +
    '<div class="vig"></div></div></div>' +
    '<div class="neck"></div><div class="base"></div></div>';
}
function vModels(){
  let h = '<div class="card"><h3>THE LINEUP</h3>' +
    '<div class="big">5 Mini-LED models across 2 operating systems</div>' +
    '<div class="p mut">Google TV line: 55", 65", 75" at 1400 nits.<br>' +
    'WebOS line: 55", 65" at 1000 nits.</div></div>';
  h += '<div class="sec">GOOGLE TV 5.0  ·  1400 NITS</div>';
  MODELS.filter(m=>m.line==="gtv").forEach(m=>h+=mrow(m));
  h += '<div class="sec">WEBOS  ·  1000 NITS  ·  MAGIC REMOTE</div>';
  MODELS.filter(m=>m.line==="web").forEach(m=>h+=mrow(m));
  h += '<div class="card mut" style="font-size:12.5px">Model codes were not in the launch deck. ' +
       'Add the SKU numbers when the price list is circulated.</div>';
  return h;
}
function mrow(m){
  return '<div class="mrow" data-m="' + m.id + '">' + miniTV(m) +
    '<div style="min-width:0"><div class="mn">' +
    '<span class="chip" style="background:' + m.color + '">' + m.size + '</span>' +
    (m.line==="gtv" ? "Google TV" : "WebOS") + '</div>' +
    '<div class="ms">' + m.spec + '</div></div><div class="chev">›</div></div>';
}
function wireModels(){
  document.querySelectorAll("[data-m]").forEach(el=>{
    el.onclick = ev => { rippleAt(el,ev); setTimeout(()=>go("model", el.dataset.m),120); };
  });
}

/* ---------------- MODEL DETAIL ---------------- */
function renderTabs(){
  $("tabsBar").innerHTML = MTABS.map(t=>
    '<button class="tab' + (t[0]===tab?" on":"") + '" data-t="' + t[0] + '">' + t[1] + '</button>'
  ).join("");
  document.querySelectorAll(".tab").forEach(b=>{
    b.onclick = ev => { rippleAt(b,ev); tab = b.dataset.t; renderTabs();
      $("screen").innerHTML = vModel(); wireModel();
      window.scrollTo({top:0,behavior:"smooth"}); };
  });
}
function modelTV(m){
  let feats = "", dots = "";
  m.hi.forEach((t,i)=>{
    const p = t.split("|");
    feats += '<span style="animation-delay:' + (i*2.5) + 's">' + p[0] +
             (p[1] ? '<i>' + p[1] + '</i>' : '') + '</span>';
    dots  += '<b style="animation-delay:' + (i*2.5) + 's"></b>';
  });
  const f = m.nits/1400;
  const inner = zoneGrid(m.zones[0], m.zones[1], (x,y)=>{
      const c = Math.exp(-((x-.5)**2/0.12 + (y-.45)**2/0.10));
      return Math.min(1, c*(0.55+0.45*f) + .04);
    }, v => 'rgba(' + Math.round(45+150*v) + ',' + Math.round(100+125*v) + ',' +
            Math.round(190+65*v) + ',' + (0.12+0.88*v).toFixed(3) + ')') +
    '<div class="ovl">' + (m.line==="gtv" ? "GOOGLE TV 5.0" : "WEBOS") + '</div>' +
    '<div class="ovr">' + m.nits + ' NITS</div>' +
    '<div class="feathero">' + feats + '</div><div class="dots">' + dots + '</div>';
  return tvShell(inner, {cap: m.size + '  ·  ' + m.nits + ' nits  ·  backlight zones shown for illustration'});
}
function vModel(){
  const m = model; let h = modelTV(m);
  if (tab === "feat"){
    h += '<div class="card"><h3>5 KEY FEATURES &amp; WHAT THEY MEAN</h3>';
    m.feats.forEach((f,i)=>{
      h += '<div class="fr"><div class="fn" style="background:' + m.color + '">' + (i+1) + '</div>' +
        '<div><div class="fh">' + esc(f[0]) + '</div><div class="fb">' + esc(f[1]) + '</div></div></div>';
    });
    h += '</div>';
  }
  if (tab === "demo"){
    h += '<div class="card"><h3>DEMO — IN THIS ORDER</h3>';
    m.demo.forEach((d,i)=>{
      h += '<div class="fr"><div class="fn" style="background:' + m.color + '">' + (i+1) + '</div>' +
        '<div><div class="fb" style="color:var(--txt);font-size:14px">' + esc(d) + '</div></div></div>';
    });
    h += '</div>';
  }
  if (tab === "pitch"){
    h += '<div class="card"><h3>SAY THIS</h3>' +
      '<div class="big" style="font-style:italic;font-size:17px">“' + esc(m.pitch) + '”</div></div>' +
      '<div class="card"><h3>FOUR BEATS</h3><div style="font-size:14px;line-height:1.9">' +
      '<b style="color:#fff">HOOK</b> — a question<br><b style="color:#fff">PROOF</b> — show it on screen<br>' +
      '<b style="color:#fff">GAIN</b> — his room, not a spec<br><b style="color:#fff">CLOSE</b> — one size up, once' +
      '</div></div>';
  }
  if (tab === "spec"){
    h += '<div class="card"><h3>EVERYTHING ON THIS MODEL</h3>';
    m.feats.forEach(f=>{ h += '<div class="fr"><div class="fn" style="background:' + m.color +
      '">•</div><div><div class="fh">' + esc(f[0]) + '</div></div></div>'; });
    m.more.forEach(x=>{ h += '<div class="fr"><div class="fn" style="background:#3A4674;color:#fff">•</div>' +
      '<div><div class="fh">' + esc(x) + '</div></div></div>'; });
    h += '</div>';
  }
  return h;
}
function wireModel(){}

/* ---------------- QUIZ ---------------- */
let qi = 0, qScore = 0, qDone = false, qPicked = -1;
function vQuiz(){
  if (qi >= QUIZ.length){
    const pct = Math.round(qScore/QUIZ.length*100);
    const msg = pct >= 80 ? "Ready for the floor." :
                pct >= 50 ? "Close. Revise and try again." : "Go through the lessons once more.";
    return '<div class="card" style="text-align:center;padding:26px 16px">' +
      '<div class="score">' + qScore + '/' + QUIZ.length + '</div>' +
      '<div class="p" style="font-size:16px;font-weight:700;color:#fff;margin-top:10px">' + msg + '</div>' +
      '<div class="mut" style="margin-top:6px">' + pct + '% correct</div>' +
      '<button class="btn" id="again">Try again</button>' +
      '<button class="btn ghost" id="home2">Back to home</button></div>';
  }
  const q = QUIZ[qi];
  let h = '<div class="prog"><i style="width:' + (qi/QUIZ.length*100) + '%"></i></div>' +
    '<div class="card"><div class="qn">QUESTION ' + (qi+1) + ' OF ' + QUIZ.length + '</div>' +
    '<div class="qq">' + esc(q[0]) + '</div>';
  q[1].forEach((o,i)=>{
    let cls = "";
    if (qPicked > -1) cls = (i === q[2]) ? " ok" : (i === qPicked ? " no" : "");
    h += '<button class="opt' + cls + '" data-o="' + i + '"' +
         (qPicked > -1 ? " disabled" : "") + '>' + esc(o) + '</button>';
  });
  if (qPicked > -1){
    h += '<div class="exp"><b style="color:' + (qPicked===q[2] ? "#31B85C" : "#EF2B36") + '">' +
      (qPicked===q[2] ? "Correct" : "Not quite") + '</b> — ' + esc(q[3]) + '</div>' +
      '<button class="btn" id="next">' + (qi === QUIZ.length-1 ? "See result" : "Next question") + '</button>';
  }
  return h + '</div>';
}
function wireQuiz(){
  document.querySelectorAll("[data-o]").forEach(b=>{
    b.onclick = ev => {
      if (qPicked > -1) return;
      rippleAt(b,ev); qPicked = +b.dataset.o;
      if (qPicked === QUIZ[qi][2]){ qScore++; buzz(14); } else buzz([8,50,8]);
      $("screen").innerHTML = vQuiz(); wireQuiz();
    };
  });
  const n = $("next");
  if (n) n.onclick = () => { qi++; qPicked = -1; $("screen").innerHTML = vQuiz(); wireQuiz();
    window.scrollTo({top:0,behavior:"smooth"}); };
  const a = $("again");
  if (a) a.onclick = () => { qi = 0; qScore = 0; qPicked = -1; $("screen").innerHTML = vQuiz(); wireQuiz(); };
  const hb = $("home2");
  if (hb) hb.onclick = () => { qi = 0; qScore = 0; qPicked = -1; go("home"); };
}

/* ---------------- BOOT ---------------- */
render();
if ("serviceWorker" in navigator){
  addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(()=>{}));
}
