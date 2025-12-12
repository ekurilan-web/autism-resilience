// Audio Context
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let audioInitialized = false;

function initAudioOnFirstTouch() {
  if (!audioInitialized) {
    if (!audioCtx) {
      audioCtx = new AudioCtx();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    audioInitialized = true;
    
    document.removeEventListener('touchstart', initAudioOnFirstTouch);
    document.removeEventListener('click', initAudioOnFirstTouch);
  }
}

document.addEventListener('touchstart', initAudioOnFirstTouch, { once: true });
document.addEventListener('click', initAudioOnFirstTouch, { once: true });

function playCrackSound() {
  if (!audioCtx) initAudioOnFirstTouch();
  if (!audioCtx) return;
  
  try {
    const osc = audioCtx.createOscillator(); 
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth'; 
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime); 
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.connect(gain); 
    gain.connect(audioCtx.destination); 
    osc.start(); 
    osc.stop(audioCtx.currentTime + 0.15);
  } catch (e) {
    console.log("Audio error:", e);
  }
}

function playAmbienceChord() {
  if (!audioCtx) initAudioOnFirstTouch();
  if (!audioCtx) return;
  
  try {
    const notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        const osc = audioCtx.createOscillator(); 
        const gain = audioCtx.createGain();
        osc.type = 'sine'; 
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 1);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 6);
        osc.connect(gain); 
        gain.connect(audioCtx.destination); 
        osc.start(); 
        osc.stop(audioCtx.currentTime + 6);
      }, i * 150);
    });
  } catch (e) {
    console.log("Audio error:", e);
  }
}

function triggerHaptic(pattern) { 
  if (navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {}
  }
}

const els = {
  maskGroup: document.getElementById('maskGroup'), 
  cracks: document.querySelectorAll('.crack'),
  fragments: document.querySelectorAll('.fragment'), 
  character: document.getElementById('character'),
  realFeatures: document.getElementById('realFeatures'), 
  smile: document.getElementById('smile'),
  rhizome: document.getElementById('rhizomeSystem'), 
  rootsLayer: document.getElementById('rootsLayer'),
  nodesLayer: document.getElementById('nodesLayer'), 
  title: document.getElementById('mainTitle'),
  subtitle: document.getElementById('subTitle'), 
  instruction: document.getElementById('instruction'),
  footer: document.getElementById('footer'), 
  ambient: document.getElementById('ambientGlow')
};

let phase = 0;
let lastTouchTime = 0;

function preventDoubleTapZoom(e) {
  const now = Date.now();
  if (now - lastTouchTime < 300) {
    e.preventDefault();
  }
  lastTouchTime = now;
}

els.maskGroup.addEventListener('touchstart', function(e) {
  if (e.touches.length > 1) return;
  preventDoubleTapZoom(e);
  handleMaskClick();
  e.preventDefault();
}, { passive: false });

els.maskGroup.addEventListener('click', handleMaskClick);

function handleMaskClick() {
  initAudioOnFirstTouch();
  if (phase === 0) {
    phase = 1; 
    playCrackSound(); 
    triggerHaptic([50]);
    els.maskGroup.classList.add('shake'); 
    els.cracks.forEach(c => c.classList.add('active'));
    els.title.innerText = "המסכה נסדקת..."; 
    els.subtitle.style.opacity = 0;
  } else if (phase === 1) {
    phase = 2; 
    playCrackSound(); 
    triggerHaptic([30, 50, 30, 50, 100]);
    els.fragments.forEach(f => f.classList.add('fall'));
    els.realFeatures.classList.add('visible');
    els.title.classList.add('fade-out');
    setTimeout(() => {
      els.title.innerText = "חוסן אותנטי";
      els.title.classList.remove('fade-out');
    }, 600);
    setTimeout(() => {
      els.smile.setAttribute('d', 'M 65 95 Q 80 110 95 95');
      document.body.classList.add('smiling');
      els.character.classList.add('shrunk');
      playAmbienceChord();
      setTimeout(growRhizome, 800);
    }, 600);
  }
}

const dimensions = [
  { id: 'agency', label: 'סוכנות', color: '#a78bfa', startAngle: -130, endAngle: -50 },
  { id: 'recognition', label: 'הכרה', color: '#38bdf8', startAngle: 10, endAngle: 90 },
  { id: 'justice', label: 'צדק מוגבלות', color: '#fbbf24', startAngle: 130, endAngle: 210 }
];

const concepts = [
  { 
    id: 'identity', cat: 'סוכנות', label: 'זהות', subtitle: 'זהות אוטיסטית חיובית',
    desc: 'חוסן כהכרה בערך הזהות האוטיסטית — לא כפגם שיש לתקן, אלא כדרך קיום לגיטימית ובעלת ערך.',
    color: '#a78bfa', angle: -115 
  },
  { 
    id: 'selfRep', cat: 'סוכנות', label: 'ייצוג עצמי', subtitle: 'הזכות לדבר בשם עצמי',
    desc: 'חוסן כיכולת לייצג את עצמי, להגדיר את הצרכים שלי, ולהיות הקול המוביל בסיפור החיים שלי. הזכות לומר לא, להגדיר גבולות ולפעול מתוך רצון עצמי.',
    color: '#a78bfa', angle: -65 
  },
  { 
    id: 'mutualRec', cat: 'הכרה', label: 'הכרה הדדית', subtitle: 'מרחב אינטר-סובייקטיבי',
    desc: 'חוסן התלוי בסביבה שמכירה באדם כסובייקט מלא. המעבר ממבט מתקן למבט מכיר ומאשש.',
    color: '#38bdf8', angle: 25 
  },
  { 
    id: 'moralThird', cat: 'הכרה', label: 'השלישי המוסרי', subtitle: 'מרחב משותף של משמעות',
    desc: 'חוסן הנובע מיצירת מרחב משותף בין אנשים, שבו שני הצדדים מכירים זה בזה ויוצרים יחד משמעות.',
    color: '#38bdf8', angle: 75 
  },
  { 
    id: 'pace', cat: 'צדק מוגבלות', label: 'קצב', subtitle: 'הקצב האוטיסטי',
    desc: 'חוסן כהכרה בזמניות שונה: לגיטימציה לעיבוד, להתאוששות ולצמיחה בקצב אישי, ללא כפיית הקצב הנוירוטיפיקלי.',
    color: '#fbbf24', angle: 145 
  },
  { 
    id: 'access', cat: 'צדק מוגבלות', label: 'נגישות', subtitle: 'יצירת עתידים נגישים',
    desc: 'חוסן אינו רק באדם, אלא במערכת. האחריות ליצור סביבה המאפשרת השתתפות עוברת מהפרט לחברה.',
    color: '#fbbf24', angle: 195 
  }
];

function growRhizome() {
  els.rhizome.classList.add('active'); 
  els.instruction.classList.add('show');
  els.footer.classList.add('show'); 
  els.ambient.classList.add('active');

  dimensions.forEach((dim, i) => {
    const startRad = (dim.startAngle * Math.PI) / 180;
    const endRad = (dim.endAngle * Math.PI) / 180;
    const arcRadius = 145;
    const labelRadius = 165;
    
    const startX = 190 + Math.cos(startRad) * arcRadius;
    const startY = 190 + Math.sin(startRad) * arcRadius;
    const endX = 190 + Math.cos(endRad) * arcRadius;
    const endY = 190 + Math.sin(endRad) * arcRadius;
    
    const arc = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const largeArc = Math.abs(dim.endAngle - dim.startAngle) > 180 ? 1 : 0;
    arc.setAttribute('d', `M ${startX} ${startY} A ${arcRadius} ${arcRadius} 0 ${largeArc} 1 ${endX} ${endY}`);
    arc.setAttribute('stroke', dim.color);
    arc.setAttribute('stroke-width', '3');
    arc.setAttribute('fill', 'none');
    arc.setAttribute('opacity', '0.3');
    arc.style.strokeDasharray = '300';
    arc.style.strokeDashoffset = '300';
    arc.style.transition = 'stroke-dashoffset 1.5s ease-out';
    els.rootsLayer.appendChild(arc);
    setTimeout(() => arc.style.strokeDashoffset = '0', i * 300);
    
    const midAngle = ((dim.startAngle + dim.endAngle) / 2) * Math.PI / 180;
    const labelX = 190 + Math.cos(midAngle) * labelRadius;
    const labelY = 190 + Math.sin(midAngle) * labelRadius;
    
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute('x', labelX);
    label.setAttribute('y', labelY);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('dominant-baseline', 'middle');
    label.setAttribute('fill', dim.color);
    label.setAttribute('font-size', '11');
    label.setAttribute('font-weight', '800');
    label.setAttribute('opacity', '0');
    label.style.transition = 'opacity 0.8s ease';
    label.textContent = dim.label;
    
    els.nodesLayer.appendChild(label);
    setTimeout(() => label.setAttribute('opacity', '0.9'), 500 + i * 300);
  });

  concepts.forEach((c, i) => {
    const rad = (c.angle * Math.PI) / 180;
    const startX = 190, startY = 190;
    const endX = 190 + Math.cos(rad) * 110;
    const endY = 190 + Math.sin(rad) * 110;
    const midX = (startX + endX) / 2 + (Math.random()*30 - 15);
    const midY = (startY + endY) / 2 + (Math.random()*30 - 15);

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute('d', `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`);
    path.setAttribute('stroke', c.color); 
    path.classList.add('root-path');
    setTimeout(() => path.classList.add('grow'), 600 + i * 200);
    els.rootsLayer.appendChild(path);

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute('class', 'node-group');
    g.style.cursor = 'pointer';
    
    g.addEventListener('click', (e) => { 
      e.stopPropagation(); 
      openPopup(c); 
    });
    
    g.addEventListener('touchstart', (e) => { 
      if (e.touches.length === 1) {
        e.preventDefault();
        e.stopPropagation();
        openPopup(c);
      }
    }, { passive: false });

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute('cx', endX); 
    circle.setAttribute('cy', endY);
    circle.setAttribute('r', '28');
    circle.setAttribute('fill', '#1e293b');
    circle.setAttribute('stroke', c.color); 
    circle.setAttribute('stroke-width', '2');
    
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute('x', endX); 
    text.setAttribute('y', endY);
    text.setAttribute('class', 'node-text');
    text.setAttribute('font-size', '9');
    
    text.textContent = c.label;
    
    if (c.label.length > 6) {
      text.setAttribute('font-size', '8');
    }
    
    g.append(circle, text);
    setTimeout(() => g.classList.add('appear'), 1200 + (i * 200));
    els.nodesLayer.appendChild(g);
  });
}

const popup = document.getElementById('popup');
function openPopup(c) {
  document.getElementById('pTag').innerText = c.cat;
  document.getElementById('pTag').style.color = c.color;
  document.getElementById('pTitle').innerText = c.label;
  document.getElementById('pSubtitle').innerText = c.subtitle;
  document.getElementById('pDesc').innerText = c.desc;
  popup.classList.add('open'); 
  triggerHaptic(10);
  document.body.style.overflow = 'hidden';
}

function closePopup() { 
  popup.classList.remove('open'); 
  document.body.style.overflow = '';
}

popup.addEventListener('touchstart', function(e) {
  if (e.target === this) {
    closePopup();
  }
});

function resetExperience() {
  phase = 0;
  
  els.title.innerText = "מסיכה או חוסן?";
  els.subtitle.innerText = "הקישו על המסכה (פעמיים) כדי לגלות";
  els.subtitle.style.opacity = 1;
  els.title.classList.remove('fade-out');
  
  els.maskGroup.classList.remove('shake');
  els.cracks.forEach(c => c.classList.remove('active'));
  els.fragments.forEach(f => f.classList.remove('fall'));
  
  els.realFeatures.classList.remove('visible');
  els.smile.setAttribute('d', 'M 65 95 Q 80 90 95 95');
  document.body.classList.remove('smiling');
  
  els.character.classList.remove('shrunk');
  
  els.rhizome.classList.remove('active');
  els.rootsLayer.innerHTML = '';
  els.nodesLayer.innerHTML = '';
  
  els.instruction.classList.remove('show');
  els.footer.classList.remove('show');
  
  els.ambient.classList.remove('active');
  
  closePopup();
}

// הופך את הפונקציות לנגישות גלובלית עבור ה-HTML
window.resetExperience = resetExperience;
window.closePopup = closePopup;