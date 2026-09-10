const state = {
  money: Number(localStorage.getItem("dl_money") || 12500),
  category: "wheels",
  selected: null,
  installed: JSON.parse(localStorage.getItem("dl_build") || "{}"),
  stats: {
    power: 425,
    torque: 890,
    weight: 7150,
    grip: 62,
    style: 48
  }
};

const parts = {
  wheels: [
    { id:"factory-wheel", name:"Factory Wheel", price:0, note:"18 inch", style:0, wheel:"factory" },
    { id:"black-forged", name:"Black Forged", price:1400, note:"22x12", style:8, wheel:"black" },
    { id:"chrome-deep", name:"Chrome Deep Dish", price:1900, note:"24x14", style:13, wheel:"chrome" },
    { id:"show-polished", name:"Polished Show Wheel", price:2600, note:"26x16", style:20, wheel:"polished" }
  ],
  tires: [
    { id:"street-tire", name:"Street Tire", price:0, note:"Factory grip", grip:0 },
    { id:"all-terrain", name:"All Terrain", price:850, note:"+5 grip", grip:5 },
    { id:"drag-radial", name:"Drag Radial", price:1200, note:"+12 grip", grip:12 },
    { id:"mud-tire", name:"Mud Tire", price:1450, note:"Show + pull", grip:7, style:5 }
  ],
  lift: [
    { id:"stock-height", name:"Stock Height", price:0, note:"Factory", lift:0 },
    { id:"level-2", name:'2" Level', price:650, note:"Front level", lift:2, style:3 },
    { id:"lift-6", name:'6" Lift', price:1800, note:"Aggressive stance", lift:6, style:10 },
    { id:"lift-10", name:'10" Show Lift', price:3600, note:"Massive stance", lift:10, style:18 }
  ],
  paint: [
    { id:"factory-paint", name:"Factory Paint", price:0, note:"Original", color:null },
    { id:"black-paint", name:"Gloss Black", price:1100, note:"Full respray", color:"#111111", style:5 },
    { id:"red-paint", name:"Deep Red", price:1350, note:"Candy style", color:"#8b1111", style:9 },
    { id:"blue-paint", name:"Midnight Blue", price:1350, note:"Metallic", color:"#123d8a", style:9 }
  ],
  lights: [
    { id:"stock-lights", name:"Stock Lighting", price:0, note:"Factory", glow:false },
    { id:"white-led", name:"LED Conversion", price:500, note:"+2 style", style:2 },
    { id:"blue-underglow", name:"Blue Underglow", price:700, note:"Show lighting", glow:true, style:9 }
  ],
  bumper: [
    { id:"factory-bumper", name:"Factory Bumper", price:0, note:"Stock", style:0 },
    { id:"painted-bumper", name:"Painted Bumper", price:900, note:"Color matched", style:7 },
    { id:"offroad-bumper", name:"Heavy Offroad Bumper", price:1600, note:"+85 lb", weight:85, style:6 }
  ],
  performance: [
    { id:"stock-tune", name:"Stock Tune", price:0, note:"425 HP", power:0, torque:0 },
    { id:"street-tune", name:"Street Tune", price:650, note:"+75 HP", power:75, torque:130 },
    { id:"race-tune", name:"Race Tune", price:1700, note:"+170 HP", power:170, torque:290 },
    { id:"big-turbo", name:"Big Turbo Setup", price:4200, note:"+300 HP", power:300, torque:460 }
  ]
};

const el = id => document.getElementById(id);
el("money").textContent = state.money.toLocaleString();

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    btn.classList.add("active");
    el(btn.dataset.screen).classList.add("active");
    if (btn.dataset.screen === "race") resizeCanvas();
  });
});

document.querySelectorAll(".category").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".category").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.category = btn.dataset.cat;
    renderParts();
  });
});

function renderParts() {
  const list = parts[state.category];
  if (!state.selected || !list.some(p => p.id === state.selected.id)) {
    state.selected = list[0];
  }
  const strip = el("partsStrip");
  strip.innerHTML = "";
  list.forEach(part => {
    const card = document.createElement("div");
    card.className = "part-card" + (part.id === state.selected.id ? " active" : "");
    card.innerHTML = `
      <div class="name">${part.name}</div>
      <div class="price">${part.price === 0 ? "OWNED" : "$" + part.price.toLocaleString()}</div>
      <div class="mini">${part.note || ""}</div>
    `;
    card.onclick = () => {
      state.selected = part;
      renderParts();
      showSelected();
      previewPart(part);
    };
    strip.appendChild(card);
  });
  showSelected();
}

function showSelected() {
  if (!state.selected) return;
  el("selectedPart").textContent = state.selected.name;
  const installed = state.installed[state.category] === state.selected.id;
  el("selectedPrice").textContent = installed
    ? "INSTALLED"
    : state.selected.price === 0 ? "OWNED" : "$" + state.selected.price.toLocaleString();
  el("buyBtn").textContent = installed ? "INSTALLED" : "INSTALL";
}

function previewPart(part) {
  applyVisual(state.category, part);
}

function applyVisual(category, part) {
  if (category === "wheels") {
    const showOverlay = part.wheel && part.wheel !== "factory";
    ["frontWheel","rearWheel"].forEach(id => {
      const w = el(id);
      w.style.opacity = showOverlay ? "1" : "0";
      if (part.wheel === "black") {
        w.style.filter = "brightness(.55)";
      } else if (part.wheel === "chrome") {
        w.style.filter = "brightness(1.4) contrast(1.15)";
      } else if (part.wheel === "polished") {
        w.style.filter = "brightness(1.8)";
      } else {
        w.style.filter = "";
      }
    });
  }

  if (category === "lift") {
    const scale = 1 + ((part.lift || 0) * 0.012);
    const y = -((part.lift || 0) * 2.2);
    el("truckWrap").style.transform = `translateY(${y}px) scale(${scale})`;
  }

  if (category === "paint") {
    const tint = el("paintTint");
    if (part.color) {
      tint.style.background = part.color;
      tint.style.opacity = ".62";
    } else {
      tint.style.opacity = "0";
    }
  }

  if (category === "lights") {
    el("underglow").style.opacity = part.glow ? ".85" : "0";
  }
}

function recalcStats() {
  let stats = { power:425, torque:890, weight:7150, grip:62, style:48 };

  Object.entries(state.installed).forEach(([category, id]) => {
    const part = parts[category]?.find(p => p.id === id);
    if (!part) return;
    stats.power += part.power || 0;
    stats.torque += part.torque || 0;
    stats.weight += part.weight || 0;
    stats.grip += part.grip || 0;
    stats.style += part.style || 0;
  });

  state.stats = stats;
  el("powerStat").textContent = `${stats.power} HP`;
  el("torqueStat").textContent = `${stats.torque} LB-FT`;
  el("weightStat").textContent = `${stats.weight.toLocaleString()} LB`;
  el("gripStat").textContent = `${stats.grip}%`;
  el("styleStat").textContent = stats.style;
}

el("buyBtn").addEventListener("click", () => {
  const part = state.selected;
  if (!part) return;

  const alreadyInstalled = state.installed[state.category] === part.id;
  if (alreadyInstalled) return;

  if (part.price > state.money) {
    alert("Not enough money.");
    return;
  }

  if (part.price > 0) {
    state.money -= part.price;
  }

  state.installed[state.category] = part.id;
  localStorage.setItem("dl_build", JSON.stringify(state.installed));
  localStorage.setItem("dl_money", state.money);
  el("money").textContent = state.money.toLocaleString();
  applyVisual(state.category, part);
  recalcStats();
  renderParts();
});

el("saveBtn").addEventListener("click", () => {
  localStorage.setItem("dl_build", JSON.stringify(state.installed));
  localStorage.setItem("dl_money", state.money);
  el("saveBtn").textContent = "SAVED";
  setTimeout(() => el("saveBtn").textContent = "SAVE BUILD", 900);
});

function loadInstalledVisuals() {
  Object.entries(state.installed).forEach(([category, id]) => {
    const part = parts[category]?.find(p => p.id === id);
    if (part) applyVisual(category, part);
  });
}

renderParts();
loadInstalledVisuals();
recalcStats();

// ------------------- RACING -------------------
const canvas = el("raceCanvas");
const ctx = canvas.getContext("2d");

const race = {
  active: false,
  started: false,
  finished: false,
  throttle: false,
  nitrousOn: false,
  gear: 1,
  rpm: 900,
  speed: 0,
  distance: 0,
  opponentDistance: 0,
  opponentSpeed: 0,
  nitrous: 100,
  launchTime: 0,
  lastTime: 0,
  resultShown: false
};

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener("resize", resizeCanvas);

function resetRace() {
  race.active = false;
  race.started = false;
  race.finished = false;
  race.throttle = false;
  race.nitrousOn = false;
  race.gear = 1;
  race.rpm = 900;
  race.speed = 0;
  race.distance = 0;
  race.opponentDistance = 0;
  race.opponentSpeed = 0;
  race.nitrous = 100;
  race.resultShown = false;
  el("raceResult").classList.add("hidden");
  updateHud();
}

async function startRace() {
  resetRace();
  resizeCanvas();
  race.active = true;

  const cd = el("countdown");
  for (const t of ["3","2","1","GO!"]) {
    cd.textContent = t;
    await new Promise(r => setTimeout(r, t === "GO!" ? 450 : 700));
  }
  cd.textContent = "";
  race.started = true;
  race.launchTime = performance.now();
  race.lastTime = performance.now();
}

el("startRaceBtn").addEventListener("click", startRace);

function shiftGear() {
  if (!race.started || race.finished) return;
  if (race.gear < 6) {
    const sweet = race.rpm >= 4200 && race.rpm <= 5200;
    race.gear++;
    race.rpm = sweet ? 2850 : 2300;
  }
}

function setThrottle(on) {
  race.throttle = on;
}

function setNitrous(on) {
  race.nitrousOn = on && race.nitrous > 0;
}

const throttleBtn = el("throttleBtn");
["pointerdown","touchstart"].forEach(evt => throttleBtn.addEventListener(evt, e => {
  e.preventDefault();
  setThrottle(true);
}, {passive:false}));
["pointerup","pointercancel","pointerleave","touchend"].forEach(evt => throttleBtn.addEventListener(evt, e => {
  e.preventDefault();
  setThrottle(false);
}, {passive:false}));

el("shiftBtn").addEventListener("pointerdown", shiftGear);

const nitrousBtn = el("nitrousBtn");
["pointerdown","touchstart"].forEach(evt => nitrousBtn.addEventListener(evt, e => {
  e.preventDefault();
  setNitrous(true);
}, {passive:false}));
["pointerup","pointercancel","pointerleave","touchend"].forEach(evt => nitrousBtn.addEventListener(evt, e => {
  e.preventDefault();
  setNitrous(false);
}, {passive:false}));

window.addEventListener("keydown", e => {
  if (["ArrowUp","w","W"].includes(e.key)) setThrottle(true);
  if (e.key === "Shift") shiftGear();
  if (["n","N"].includes(e.key)) setNitrous(true);
});
window.addEventListener("keyup", e => {
  if (["ArrowUp","w","W"].includes(e.key)) setThrottle(false);
  if (["n","N"].includes(e.key)) setNitrous(false);
});

function updateRace(dt) {
  if (!race.started || race.finished) return;

  const powerFactor = state.stats.power / 425;
  const gripFactor = Math.max(.75, state.stats.grip / 62);
  const weightFactor = 7150 / state.stats.weight;

  const gearMax = [0, 38, 66, 96, 128, 158, 185];
  const maxForGear = gearMax[race.gear];
  const rpmTarget = 900 + (race.speed / maxForGear) * 4400;

  if (race.throttle) {
    let accel = (24 * powerFactor * weightFactor * Math.min(gripFactor, 1.35)) / (1 + (race.gear - 1) * .18);

    if (race.rpm > 5300) accel *= .42;
    if (race.rpm < 1600 && race.gear > 1) accel *= .55;

    if (race.nitrousOn && race.nitrous > 0) {
      accel *= 1.28;
      race.nitrous = Math.max(0, race.nitrous - 22 * dt);
    }

    race.speed += accel * dt;
    race.rpm += (rpmTarget - race.rpm) * Math.min(1, dt * 7);
  } else {
    race.speed -= 5.5 * dt;
    race.rpm += (900 - race.rpm) * Math.min(1, dt * 4);
  }

  race.speed = Math.max(0, Math.min(race.speed, maxForGear + 9));
  race.rpm = Math.max(850, Math.min(5900, race.rpm));

  race.distance += race.speed * 1.46667 * dt;

  // Opponent AI
  const targetOpponent = 118 + Math.sin((performance.now() - race.launchTime) / 1200) * 3;
  race.opponentSpeed += (targetOpponent - race.opponentSpeed) * dt * .75;
  if ((performance.now() - race.launchTime) < 1000) race.opponentSpeed *= .96;
  race.opponentDistance += Math.max(0, race.opponentSpeed) * 1.46667 * dt;

  if (race.distance >= 1320 || race.opponentDistance >= 1320) {
    race.finished = true;
    finishRace();
  }
}

function finishRace() {
  if (race.resultShown) return;
  race.resultShown = true;

  const win = race.distance >= 1320 && race.distance >= race.opponentDistance;
  const elapsed = ((performance.now() - race.launchTime) / 1000).toFixed(2);
  const payout = win ? 1800 : 250;

  state.money += payout;
  localStorage.setItem("dl_money", state.money);
  el("money").textContent = state.money.toLocaleString();

  const box = el("raceResult");
  box.classList.remove("hidden");
  box.textContent = win
    ? `WIN — ${elapsed}s — Prize $${payout.toLocaleString()}`
    : `LOSS — ${elapsed}s — Participation $${payout.toLocaleString()}`;
}

function updateHud() {
  el("speed").textContent = Math.round(race.speed);
  el("rpm").textContent = Math.round(race.rpm);
  el("gear").textContent = race.gear;
  el("distance").textContent = Math.min(1320, Math.round(race.distance));
  el("nitrous").textContent = Math.round(race.nitrous);
}

function drawTrack() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  ctx.clearRect(0,0,w,h);

  const sky = ctx.createLinearGradient(0,0,0,h*.45);
  sky.addColorStop(0,"#101820");
  sky.addColorStop(1,"#20262b");
  ctx.fillStyle = sky;
  ctx.fillRect(0,0,w,h*.42);

  ctx.fillStyle = "#12181c";
  ctx.fillRect(0,h*.42,w,h*.58);

  // horizon lights
  for (let i=0;i<18;i++) {
    ctx.fillStyle = i%2 ? "rgba(255,170,80,.18)" : "rgba(255,255,255,.10)";
    ctx.fillRect(i*(w/18),h*.39,3,10);
  }

  // Track
  ctx.fillStyle = "#2b2c2d";
  ctx.beginPath();
  ctx.moveTo(w*.06,h);
  ctx.lineTo(w*.30,h*.42);
  ctx.lineTo(w*.70,h*.42);
  ctx.lineTo(w*.94,h);
  ctx.closePath();
  ctx.fill();

  // lane divider perspective
  ctx.strokeStyle = "rgba(255,255,255,.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w*.5,h);
  ctx.lineTo(w*.5,h*.42);
  ctx.stroke();

  // side lines
  ctx.strokeStyle = "rgba(255,165,62,.7)";
  ctx.beginPath();
  ctx.moveTo(w*.06,h);
  ctx.lineTo(w*.30,h*.42);
  ctx.moveTo(w*.94,h);
  ctx.lineTo(w*.70,h*.42);
  ctx.stroke();

  const playerProgress = Math.min(1, race.distance / 1320);
  const oppProgress = Math.min(1, race.opponentDistance / 1320);

  drawTruck(w*.40, h*.82 - playerProgress*h*.32, 1 - playerProgress*.55, false);
  drawTruck(w*.61, h*.76 - oppProgress*h*.32, 1 - oppProgress*.55, true);

  // Finish marker
  ctx.fillStyle = "rgba(255,255,255,.8)";
  ctx.font = "12px Arial";
  ctx.fillText("FINISH 1/4 MILE", w*.44, h*.45);
}

function drawTruck(x,y,scale,opponent) {
  ctx.save();
  ctx.translate(x,y);
  ctx.scale(scale,scale);

  ctx.fillStyle = opponent ? "#6d2020" : "#252c32";
  ctx.fillRect(-48,-22,96,34);
  ctx.fillRect(-30,-44,55,28);

  ctx.fillStyle = opponent ? "#8f2d2d" : "#39434b";
  ctx.fillRect(-24,-39,42,17);

  ctx.fillStyle = "#080808";
  ctx.beginPath();
  ctx.arc(-30,14,13,0,Math.PI*2);
  ctx.arc(31,14,13,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle = "#bbb";
  ctx.beginPath();
  ctx.arc(-30,14,5,0,Math.PI*2);
  ctx.arc(31,14,5,0,Math.PI*2);
  ctx.fill();

  ctx.restore();
}

function raceLoop(now) {
  const dt = Math.min(.033, (now - (race.lastTime || now)) / 1000);
  race.lastTime = now;
  if (race.active) updateRace(dt);
  drawTrack();
  updateHud();
  requestAnimationFrame(raceLoop);
}

resizeCanvas();
requestAnimationFrame(raceLoop);
