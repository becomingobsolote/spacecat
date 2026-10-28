// ========================================================
// 🚀 PROJECT LAIKA: SPACE CAT ENGINE (GAME.JS)
// ========================================================

(function () {
  'use strict';

  // --- AUDIO SYNTHESIZER (Web Audio API - No External Files Needed) ---
  class SoundSynth {
    constructor() {
      this.ctx = null;
      this.bgmPlaying = false;
      this.bgmTimer = null;
      this.masterGain = null;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playNote(freq, type = 'square', duration = 0.18, timeOffset = 0, vol = 0.28) {
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime + timeOffset;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(vol, now + 0.02);
        gain.gain.linearRampToValueAtTime(0.001, now + duration);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + duration + 0.03);
      } catch (e) {
        console.warn('Audio error:', e);
      }
    }

    playClick() {
      this.init();
      this.playNote(520, 'square', 0.06, 0, 0.15);
    }

    playWarp() {
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.26);
      } catch (e) {
        console.warn('Audio error:', e);
      }
    }

    playCollect() {
      this.init();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((f, idx) => {
        this.playNote(f, 'sine', 0.12, idx * 0.06, 0.18);
      });
    }

    playMeow() {
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.linearRampToValueAtTime(750, now + 0.18);
        osc.frequency.linearRampToValueAtTime(600, now + 0.38);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.08);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.42);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.45);
      } catch (e) {
        console.warn('Audio error:', e);
      }
    }

    playFanfare() {
      this.init();
      const melody = [523, 659, 783, 1046, 783, 1046];
      const durations = [0.12, 0.12, 0.12, 0.25, 0.12, 0.4];
      let offset = 0;
      melody.forEach((f, i) => {
        this.playNote(f, 'square', durations[i], offset, 0.25);
        offset += durations[i] * 0.85;
      });
    }

    toggleBGM() {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      if (this.bgmPlaying) {
        this.stopBGM();
        return false;
      } else {
        this.startBGM();
        this.playCollect(); // Immediate audible feedback
        return true;
      }
    }

    startBGM() {
      this.bgmPlaying = true;
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      // Sweet, bright 8-bit arpeggio chords in clear 400Hz - 1000Hz range
      // (Sounds crystal clear on mobile phone speakers!)
      const chords = [
        [523.25, 659.25, 783.99, 987.77], // C5, E5, G5, B5 (Cmaj7)
        [440.00, 523.25, 659.25, 783.99], // A4, C5, E5, G5 (Am7)
        [349.23, 440.00, 523.25, 659.25], // F4, A4, C5, E5 (Fmaj7)
        [392.00, 493.88, 587.33, 783.99]  // G4, B4, D5, G5 (G7)
      ];
      const bassNotes = [261.63, 220.00, 174.61, 196.00];
      let chordIdx = 0;
      let noteStep = 0;

      const tick = () => {
        if (!this.bgmPlaying) return;
        const currentChord = chords[chordIdx];
        const pattern = [0, 1, 2, 3, 2, 1, 0, 2];
        const freq = currentChord[pattern[noteStep % pattern.length]];
        
        // Lead melody: crisp retro chiptune
        this.playNote(freq, 'square', 0.16, 0, 0.22);
        
        // Soft bass pulse on beat 0 and beat 4
        if (noteStep === 0 || noteStep === 4) {
          this.playNote(bassNotes[chordIdx], 'triangle', 0.28, 0, 0.32);
        }

        noteStep++;
        if (noteStep >= 8) {
          noteStep = 0;
          chordIdx = (chordIdx + 1) % chords.length;
        }

        this.bgmTimer = setTimeout(tick, 200);
      };
      tick();
    }

    stopBGM() {
      this.bgmPlaying = false;
      if (this.bgmTimer) clearTimeout(this.bgmTimer);
    }
  }

  const sound = new SoundSynth();

  // --- SPACE FLIGHT GAME STATE & SETUP ---
  const canvas = document.getElementById('space-canvas');
  const ctx = canvas.getContext('2d');

  let width = 0;
  let height = 0;

  function handleResize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  handleResize();

  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', () => {
    setTimeout(handleResize, 150);
  });

  // World & Camera
  const world = {
    width: 3200,
    height: 2400
  };

  const camera = {
    x: 0,
    y: 0
  };

  // Player Rocket
  const rocket = {
    x: 400,
    y: 1200,
    vx: 0,
    vy: 0,
    angle: 0,
    speed: 0.22,
    maxSpeed: 4.8,
    friction: 0.985,
    size: 24,
    trail: []
  };

  // Controller keys
  const keys = {
    up: false,
    down: false,
    left: false,
    right: false
  };

  // Generate Starfield
  const stars = [];
  for (let i = 0; i < 280; i++) {
    stars.push({
      x: Math.random() * world.width,
      y: Math.random() * world.height,
      size: Math.random() * 2 + 1,
      brightness: Math.random() * 0.7 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.01
    });
  }

  // Floating Cosmic Hearts/Stardust
  const stardust = [];
  for (let i = 0; i < 40; i++) {
    stardust.push({
      x: Math.random() * world.width,
      y: Math.random() * world.height,
      size: 14,
      collected: false
    });
  }

  // Planets configuration mapped to 5 Milestones
  const planets = [
    {
      id: 1,
      x: 500,
      y: 1200,
      radius: 54,
      color: '#4ea8de',
      ringColor: 'rgba(114, 239, 221, 0.4)',
      hasRing: false,
      data: CONFIG.milestones[0],
      visited: false
    },
    {
      id: 2,
      x: 1100,
      y: 800,
      radius: 65,
      color: '#ff9aa2',
      ringColor: '#ffb7b2',
      hasRing: true,
      data: CONFIG.milestones[1],
      visited: false
    },
    {
      id: 3,
      x: 1800,
      y: 1300,
      radius: 60,
      color: '#ffdac1',
      ringColor: '#ffe45e',
      hasRing: false,
      data: CONFIG.milestones[2],
      visited: false
    },
    {
      id: 4,
      x: 2300,
      y: 750,
      radius: 68,
      color: '#b5ead7',
      ringColor: '#c7ceea',
      hasRing: true,
      data: CONFIG.milestones[3],
      visited: false
    },
    {
      id: 5,
      x: 2750,
      y: 1250,
      radius: 80,
      color: '#ff7597',
      ringColor: '#ffe45e',
      hasRing: true,
      isGrandStation: true,
      data: CONFIG.milestones[4],
      visited: false
    }
  ];

  // Secret Easter Egg Planet (Meowter Station)
  const secretPlanet = {
    x: 1550,
    y: 350,
    radius: 38,
    color: '#9b5de5',
    visited: false
  };

  // Active nearest planet
  let nearbyPlanet = null;

  // --- CONTROLS HANDLING ---
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'KeyW'].includes(e.code)) keys.up = true;
    if (['ArrowDown', 'KeyS'].includes(e.code)) keys.down = true;
    if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.left = true;
    if (['ArrowRight', 'KeyD'].includes(e.code)) keys.right = true;

    if (flightTutorial) flightTutorial.classList.add('fade-out');

    if (
      (['Space', 'Enter'].includes(e.code) || [' ', 'Spacebar', 'Enter'].includes(e.key)) &&
      nearbyPlanet
    ) {
      e.preventDefault();
      dockAtPlanet(nearbyPlanet);
    }
  });

  window.addEventListener('keyup', (e) => {
    if (['ArrowUp', 'KeyW'].includes(e.code)) keys.up = false;
    if (['ArrowDown', 'KeyS'].includes(e.code)) keys.down = false;
    if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.left = false;
    if (['ArrowRight', 'KeyD'].includes(e.code)) keys.right = false;
  });

  // Flight Tutorial Auto-Fade
  const flightTutorial = document.getElementById('flight-tutorial');
  if (flightTutorial) {
    setTimeout(() => {
      flightTutorial.classList.add('fade-out');
    }, 6000);
  }

  // Mouse / Touch Direct Navigation on Canvas
  let isNavigatingToTarget = false;
  let targetPos = { x: 0, y: 0 };

  canvas.addEventListener('pointerdown', (e) => {
    // Only target canvas directly, not HUD
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left + camera.x;
    const clickY = e.clientY - rect.top + camera.y;

    targetPos.x = clickX;
    targetPos.y = clickY;
    isNavigatingToTarget = true;
    sound.init();

    if (flightTutorial) {
      flightTutorial.classList.add('fade-out');
    }
  });

  canvas.addEventListener('pointermove', (e) => {
    if (isNavigatingToTarget) {
      const rect = canvas.getBoundingClientRect();
      targetPos.x = e.clientX - rect.left + camera.x;
      targetPos.y = e.clientY - rect.top + camera.y;
    }
  });

  window.addEventListener('pointerup', () => {
    isNavigatingToTarget = false;
  });

  // --- GAME LOOP ---
  function update() {
    // Keyboard Steering
    if (keys.up) {
      rocket.vx += Math.cos(rocket.angle) * rocket.speed;
      rocket.vy += Math.sin(rocket.angle) * rocket.speed;
    }
    if (keys.down) {
      rocket.vx -= Math.cos(rocket.angle) * (rocket.speed * 0.6);
      rocket.vy -= Math.sin(rocket.angle) * (rocket.speed * 0.6);
    }
    if (keys.left) {
      rocket.angle -= 0.055;
    }
    if (keys.right) {
      rocket.angle += 0.055;
    }

    // Touch / Pointer Navigation
    if (isNavigatingToTarget) {
      const dx = targetPos.x - rocket.x;
      const dy = targetPos.y - rocket.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 25) {
        const desiredAngle = Math.atan2(dy, dx);
        // Smoothly rotate towards target
        let angleDiff = desiredAngle - rocket.angle;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        rocket.angle += angleDiff * 0.1;

        rocket.vx += Math.cos(rocket.angle) * rocket.speed;
        rocket.vy += Math.sin(rocket.angle) * rocket.speed;
      }
    }

    // Clamp speed & friction
    const currentSpeed = Math.hypot(rocket.vx, rocket.vy);
    if (currentSpeed > rocket.maxSpeed) {
      rocket.vx = (rocket.vx / currentSpeed) * rocket.maxSpeed;
      rocket.vy = (rocket.vy / currentSpeed) * rocket.maxSpeed;
    }
    rocket.vx *= rocket.friction;
    rocket.vy *= rocket.friction;

    rocket.x += rocket.vx;
    rocket.y += rocket.vy;

    // World boundary
    rocket.x = Math.max(50, Math.min(world.width - 50, rocket.x));
    rocket.y = Math.max(50, Math.min(world.height - 50, rocket.y));

    // Particle Trail
    if (currentSpeed > 0.5) {
      rocket.trail.push({
        x: rocket.x - Math.cos(rocket.angle) * 16,
        y: rocket.y - Math.sin(rocket.angle) * 16,
        life: 1.0,
        color: Math.random() > 0.5 ? '#ffe45e' : '#ff7597'
      });
    }

    for (let i = rocket.trail.length - 1; i >= 0; i--) {
      rocket.trail[i].life -= 0.04;
      if (rocket.trail[i].life <= 0) {
        rocket.trail.splice(i, 1);
      }
    }

    // Camera follow rocket smoothly
    camera.x = rocket.x - width / 2;
    camera.y = rocket.y - height / 2;
    camera.x = Math.max(0, Math.min(world.width - width, camera.x));
    camera.y = Math.max(0, Math.min(world.height - height, camera.y));

    // Check Stardust collisions
    stardust.forEach((dust) => {
      if (!dust.collected && Math.hypot(rocket.x - dust.x, rocket.y - dust.y) < 30) {
        dust.collected = true;
        sound.playCollect();
        spawnFloatingHeart(width / 2, height / 2, '✨');
      }
    });

    // Check Nearest Planet
    nearbyPlanet = null;
    let closestDist = Infinity;

    planets.forEach((p) => {
      const dist = Math.hypot(rocket.x - p.x, rocket.y - p.y);
      if (dist < p.radius + 70) {
        nearbyPlanet = p;
        closestDist = dist;
      }
    });

    // Check Secret Planet
    const secretDist = Math.hypot(rocket.x - secretPlanet.x, rocket.y - secretPlanet.y);
    if (secretDist < secretPlanet.radius + 50) {
      nearbyPlanet = { isSecret: true, ...secretPlanet };
    }

    // Update Cockpit Info
    updateCockpitHUD();
  }

  function updateCockpitHUD() {
    const locElem = document.getElementById('current-location');
    const quickLandBox = document.getElementById('land-action-container');
    const quickLandBtn = document.getElementById('btn-quick-land');

    if (nearbyPlanet) {
      if (nearbyPlanet.isSecret) {
        locElem.innerHTML = '🪐 Secret Meowter Station Detected!';
      } else {
        locElem.innerHTML = `🪐 Near ${nearbyPlanet.data.badge} — ${nearbyPlanet.data.title}`;
      }

      if (quickLandBox) {
        quickLandBox.classList.remove('hidden');
        if (quickLandBtn) {
          const planetName = nearbyPlanet.isSecret
            ? 'Secret Station'
            : nearbyPlanet.data.badge || nearbyPlanet.data.title;
          quickLandBtn.innerText = `🚀 Land on ${planetName}!`;
        }
      }
    } else {
      locElem.innerHTML = `Deep Space (X:${Math.round(rocket.x)}, Y:${Math.round(rocket.y)})`;
      if (quickLandBox) {
        quickLandBox.classList.add('hidden');
      }
    }

    // Progress bar count
    const visitedCount = planets.filter((p) => p.visited).length;
    const progressPct = Math.max(20, (visitedCount / planets.length) * 100);
    const progressFill = document.getElementById('journey-progress');
    if (progressFill) progressFill.style.width = `${progressPct}%`;
  }

  // --- DRAWING PIPELINE ---
  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Deep space gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0a0b16');
    bgGrad.addColorStop(1, '#13122c');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    // Draw Parallax Stars
    stars.forEach((star) => {
      star.brightness += star.twinkleSpeed;
      if (star.brightness > 1 || star.brightness < 0.2) {
        star.twinkleSpeed = -star.twinkleSpeed;
      }
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(star.brightness)})`;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    });

    // Draw Floating Hearts / Stardust
    stardust.forEach((dust) => {
      if (!dust.collected) {
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💖', dust.x, dust.y);
      }
    });

    // Draw Secret Easter Egg Planet
    drawSecretPlanet(secretPlanet);

    // Draw Orbiting Planets
    planets.forEach((p) => {
      drawPlanet(p);
    });

    // Draw Rocket Trail
    rocket.trail.forEach((t) => {
      ctx.fillStyle = t.color;
      ctx.globalAlpha = t.life;
      ctx.fillRect(t.x - 2, t.y - 2, 4, 4);
    });
    ctx.globalAlpha = 1.0;

    // Draw Player Rocket Ship & Space Cat Laika!
    drawRocket(rocket);

    // Touch Navigation Indicator
    if (isNavigatingToTarget) {
      ctx.save();
      ctx.strokeStyle = 'rgba(77, 238, 234, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(targetPos.x, targetPos.y, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✦', targetPos.x, targetPos.y);
      ctx.restore();
    }

    ctx.restore();
  }

  function drawPlanet(p) {
    ctx.save();
    ctx.translate(p.x, p.y);

    // Glow
    const glow = ctx.createRadialGradient(0, 0, p.radius * 0.7, 0, 0, p.radius * 1.5);
    glow.addColorStop(0, p.color);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Rings if any
    if (p.hasRing) {
      ctx.strokeStyle = p.ringColor;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.radius * 1.6, p.radius * 0.5, -0.2, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Planet Body (Pixel-style dithering feel)
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();

    // Planet Icon / Details
    ctx.font = `${p.radius * 0.7}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.data.icon, 0, 0);

    // Month Label
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.fillText(`MOON ${p.data.month}`, 0, p.radius + 24);

    if (p.visited) {
      ctx.font = '14px sans-serif';
      ctx.fillText('⭐', 0, -p.radius - 14);
    }

    ctx.restore();
  }

  function drawSecretPlanet(sp) {
    ctx.save();
    ctx.translate(sp.x, sp.y);
    ctx.fillStyle = '#6b2d99';
    ctx.beginPath();
    ctx.arc(0, 0, sp.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐱', 0, 0);

    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffe45e';
    ctx.fillText('MEOWTER STATION', 0, sp.radius + 16);
    ctx.restore();
  }

  function drawRocket(r) {
    ctx.save();
    ctx.translate(r.x, r.y);
    ctx.rotate(r.angle);

    // Rocket Body (Retro Pixel-Art Aesthetic)
    // Wings
    ctx.fillStyle = '#ff7597';
    ctx.beginPath();
    ctx.moveTo(-12, -14);
    ctx.lineTo(-2, -6);
    ctx.lineTo(-12, 0);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-12, 14);
    ctx.lineTo(-2, 6);
    ctx.lineTo(-12, 0);
    ctx.fill();

    // Main fuselage
    ctx.fillStyle = '#f0f3f8';
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(-10, -9);
    ctx.lineTo(-14, 0);
    ctx.lineTo(-10, 9);
    ctx.closePath();
    ctx.fill();

    // Nose cone
    ctx.fillStyle = '#e6396e';
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(6, -5);
    ctx.lineTo(6, 5);
    ctx.closePath();
    ctx.fill();

    // Cockpit Bubble with Space Cat Ears!
    ctx.fillStyle = '#4deeea';
    ctx.beginPath();
    ctx.arc(2, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // Cat ears on the helmet
    ctx.fillStyle = '#2c2523';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(3, -11);
    ctx.lineTo(5, -6);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.lineTo(3, 11);
    ctx.lineTo(5, 6);
    ctx.fill();

    ctx.restore();
  }

  function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);

  // --- DOCKING & MODAL INTERACTION ---
  function dockAtPlanet(planet) {
    if (!planet) return;
    try {
      if (sound && sound.playWarp) sound.playWarp();
    } catch (err) {
      console.warn('Audio warning:', err);
    }

    if (planet.isSecret) {
      openSecretModal();
      return;
    }

    planet.visited = true;

    // If month 5, trigger the Grand Celebration Banner Modal!
    if (planet.data && planet.data.month === 5) {
      openCelebrationModal();
    } else if (planet.data) {
      openPlanetModal(planet.data);
    }
  }

  // Click on planet prompt or nearby planet to dock
  canvas.addEventListener('click', () => {
    if (nearbyPlanet) {
      dockAtPlanet(nearbyPlanet);
    }
  });

  const btnQuickLand = document.getElementById('btn-quick-land');
  if (btnQuickLand) {
    btnQuickLand.addEventListener('click', (e) => {
      e.stopPropagation();
      if (nearbyPlanet) {
        dockAtPlanet(nearbyPlanet);
      }
    });
    btnQuickLand.addEventListener('touchend', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (nearbyPlanet) {
        dockAtPlanet(nearbyPlanet);
      }
    });
  }

  // --- MODALS CONTROLLER ---
  const planetModal = document.getElementById('planet-modal');
  const celebrationModal = document.getElementById('celebration-modal');
  const lettersModal = document.getElementById('letters-modal');
  const singleLetterModal = document.getElementById('single-letter-modal');
  const minigameModal = document.getElementById('minigame-modal');
  const secretModal = document.getElementById('secret-modal');

  function openPlanetModal(data) {
    document.getElementById('modal-planet-icon').innerText = data.icon;
    document.getElementById('modal-planet-badge').innerText = data.badge;
    document.getElementById('modal-planet-title').innerText = data.title;
    document.getElementById('modal-planet-summary').innerText = data.summary;
    document.getElementById('modal-planet-story').innerText = data.story;
    document.getElementById('modal-planet-quote').innerText = data.quote;
    document.getElementById('modal-polaroid-caption').innerText = data.polaroidCaption || data.title;

    // Render clean, beautiful glowing polaroid picture
    const preview = document.getElementById('modal-pixel-art');
    preview.innerHTML = `
      <div style="font-size: 68px; text-shadow: 0 0 24px ${data.color}; animation: floatSlow 3s ease-in-out infinite alternate;">
        ${data.icon}
      </div>
    `;

    planetModal.classList.remove('hidden');
  }

  function openCelebrationModal() {
    sound.playFanfare();
    celebrationModal.classList.remove('hidden');
  }

  function openSecretModal() {
    sound.playMeow();
    document.getElementById('secret-message-text').innerText = CONFIG.easterEggs.secretMessage;
    secretModal.classList.remove('hidden');
  }

  // Close Buttons
  document.getElementById('btn-close-planet').onclick = () => {
    sound.playClick();
    planetModal.classList.add('hidden');
  };
  document.getElementById('btn-collect-star').onclick = () => {
    sound.playCollect();
    planetModal.classList.add('hidden');
    spawnFloatingHeart(window.innerWidth / 2, window.innerHeight / 2, '⭐');
  };

  document.getElementById('btn-close-celebration').onclick = () => {
    sound.playClick();
    celebrationModal.classList.add('hidden');
  };
  document.getElementById('btn-close-letters').onclick = () => {
    sound.playClick();
    lettersModal.classList.add('hidden');
  };
  document.getElementById('btn-close-single-letter').onclick = () => {
    sound.playClick();
    singleLetterModal.classList.add('hidden');
  };
  document.getElementById('btn-close-minigame').onclick = () => {
    sound.playClick();
    minigameModal.classList.add('hidden');
    stopCatcherGame();
  };
  document.getElementById('btn-close-secret').onclick = () => {
    sound.playClick();
    secretModal.classList.add('hidden');
  };

  // --- OPEN WHEN LETTERS RENDERING ---
  const lettersGrid = document.getElementById('letters-list');
  function renderLetters() {
    lettersGrid.innerHTML = '';
    CONFIG.letters.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'letter-envelope-card';
      card.innerHTML = `
        <div class="envelope-icon">💌</div>
        <h4 class="envelope-title">${item.title}</h4>
        <p class="envelope-desc">${item.description}</p>
      `;
      card.onclick = () => {
        sound.playCollect();
        readLetter(item);
      };
      lettersGrid.appendChild(card);
    });
  }
  renderLetters();

  function readLetter(letter) {
    document.getElementById('read-letter-title').innerText = letter.title;
    document.getElementById('read-letter-body').innerText = letter.content;
    singleLetterModal.scrollTop = 0;
    const box = singleLetterModal.querySelector('.letter-paper-box');
    if (box) box.scrollTop = 0;
    singleLetterModal.classList.remove('hidden');
  }

  const btnBackToLetters = document.getElementById('btn-back-to-letters');
  if (btnBackToLetters) {
    btnBackToLetters.onclick = () => {
      sound.playClick();
      singleLetterModal.classList.add('hidden');
      lettersModal.classList.remove('hidden');
    };
  }

  // Letters Toggle Button
  document.getElementById('btn-letters-toggle').onclick = () => {
    sound.playClick();
    lettersModal.classList.remove('hidden');
  };
  document.getElementById('btn-show-letters-direct').onclick = () => {
    sound.playClick();
    celebrationModal.classList.add('hidden');
    lettersModal.classList.remove('hidden');
  };

  // --- INTERACTIVE SPACE CAT AVATAR (CLICK MEOW) ---
  const catCard = document.getElementById('space-cat-card');
  const catBubble = document.getElementById('cat-bubble');
  catCard.onclick = (e) => {
    sound.playMeow();
    const randomMeow =
      CONFIG.easterEggs.catMeows[Math.floor(Math.random() * CONFIG.easterEggs.catMeows.length)];
    catBubble.innerText = randomMeow;

    // Spawn heart right above the cat card
    const rect = catCard.getBoundingClientRect();
    spawnFloatingHeart(rect.left + rect.width / 2, rect.top, '♥');
  };

  // --- FLOATING HEARTS FX ---
  function spawnFloatingHeart(x, y, emoji = '♥') {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.innerText = emoji;
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1200);
  }

  // --- AUDIO TOGGLE ---
  const btnAudio = document.getElementById('btn-audio');
  const audioStatus = document.getElementById('audio-status');

  const toggleAudio = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    sound.init();
    const isPlaying = sound.toggleBGM();
    audioStatus.innerText = isPlaying ? 'ON' : 'OFF';
  };

  btnAudio.addEventListener('click', toggleAudio);
  btnAudio.addEventListener('touchend', toggleAudio);

  // Global user interaction unlock for Web Audio on iOS/Mobile
  const unlockAudio = () => {
    sound.init();
    ['touchstart', 'touchend', 'click'].forEach((evt) => {
      document.removeEventListener(evt, unlockAudio);
    });
  };
  ['touchstart', 'touchend', 'click'].forEach((evt) => {
    document.addEventListener(evt, unlockAudio, { passive: true });
  });

  // --- MINI-GAME: LAIKA'S COSMIC TREAT CATCHER ---
  const catcherCanvas = document.getElementById('catcher-canvas');
  const cctx = catcherCanvas.getContext('2d');
  const gameScoreElem = document.getElementById('game-score');
  const gameBestScoreElem = document.getElementById('game-best-score');
  const gameLivesElem = document.getElementById('game-lives');
  const complimentElem = document.getElementById('catcher-compliment');
  const btnStartCatcher = document.getElementById('btn-start-catcher');

  let catcherActive = false;
  let catcherLoopId = null;
  let catcherState = 'idle';

  const basket = {
    x: 170,
    y: 360,
    width: 60,
    height: 36,
    speed: 7
  };

  let fallingItems = [];
  let catcherScore = 0;
  let catcherLives = 3;
  let flashEffect = 0;
  const targetScore = CONFIG.miniGame.targetScore || 500;
  let bestScore = parseInt(localStorage.getItem('laika_catcher_best_score') || '0', 10);

  function updateLivesDisplay() {
    if (gameLivesElem) {
      gameLivesElem.innerHTML =
        '❤️'.repeat(Math.max(0, catcherLives)) + '🖤'.repeat(Math.max(0, 3 - catcherLives));
    }
  }

  function updateBestScoreDisplay() {
    if (gameBestScoreElem) {
      gameBestScoreElem.innerText = bestScore;
    }
  }
  updateBestScoreDisplay();

  function startCatcherGame() {
    sound.init();
    sound.playFanfare();
    catcherScore = 0;
    catcherLives = 3;
    flashEffect = 0;
    fallingItems = [];
    catcherActive = true;
    catcherState = 'playing';

    if (gameScoreElem) gameScoreElem.innerText = catcherScore;
    updateLivesDisplay();
    updateBestScoreDisplay();
    if (complimentElem) complimentElem.innerText = '';
    if (btnStartCatcher) btnStartCatcher.innerText = '🔄 Restart Game';

    if (catcherLoopId) cancelAnimationFrame(catcherLoopId);
    catcherGameLoop();
  }

  function stopCatcherGame() {
    catcherActive = false;
    if (catcherLoopId) cancelAnimationFrame(catcherLoopId);
  }

  function triggerGameOver() {
    catcherActive = false;
    catcherState = 'gameover';

    const previousBest = parseInt(localStorage.getItem('laika_catcher_best_score') || '0', 10);
    const isNewRecord = catcherScore > previousBest && catcherScore > 0;

    if (catcherScore > bestScore) {
      bestScore = catcherScore;
      localStorage.setItem('laika_catcher_best_score', bestScore.toString());
      updateBestScoreDisplay();
    }

    if (isNewRecord) {
      sound.playFanfare();
      if (complimentElem) {
        complimentElem.innerHTML = `🌟 NEW HIGH SCORE: ${catcherScore}! Rakhel is so proud of you, Laika! <3`;
      }
    } else {
      sound.playNote(300, 'sawtooth', 0.15, 0, 0.12);
      sound.playNote(250, 'sawtooth', 0.15, 0.15, 0.12);
      sound.playNote(175, 'sawtooth', 0.35, 0.3, 0.14);
      if (complimentElem) {
        complimentElem.innerHTML = `Score: ${catcherScore} | Best: ${bestScore}. Try again to beat your record! <3`;
      }
    }

    if (btnStartCatcher) {
      btnStartCatcher.innerText = '🔄 Play Again';
    }

    drawGameOverScreen(isNewRecord);
  }

  function drawGameOverScreen(isNewRecord) {
    cctx.fillStyle = 'rgba(15, 16, 35, 0.9)';
    cctx.fillRect(0, 0, catcherCanvas.width, catcherCanvas.height);

    if (isNewRecord) {
      cctx.font = '16px "Press Start 2P", monospace';
      cctx.fillStyle = '#ffe45e';
      cctx.textAlign = 'center';
      cctx.fillText('🌟 NEW BEST SCORE! 🌟', catcherCanvas.width / 2, 130);

      cctx.font = '14px "Silkscreen", monospace';
      cctx.fillStyle = '#74ee94';
      cctx.fillText(`Final Score: ${catcherScore}`, catcherCanvas.width / 2, 180);
      cctx.fillStyle = '#ffe45e';
      cctx.fillText(`All-Time Best: ${bestScore}`, catcherCanvas.width / 2, 215);

      cctx.font = '13px "Quicksand", sans-serif';
      cctx.fillStyle = '#ff7597';
      cctx.fillText('Rakhel is so proud of you, my Spacecat! <3', catcherCanvas.width / 2, 265);
    } else {
      cctx.font = '20px "Press Start 2P", monospace';
      cctx.fillStyle = '#ff7597';
      cctx.textAlign = 'center';
      cctx.fillText('GAME OVER', catcherCanvas.width / 2, 130);

      cctx.font = '14px "Silkscreen", monospace';
      cctx.fillStyle = '#f0f3f8';
      cctx.fillText(`Final Score: ${catcherScore}`, catcherCanvas.width / 2, 180);
      cctx.fillStyle = '#ffe45e';
      cctx.fillText(`Best Score: ${bestScore}`, catcherCanvas.width / 2, 215);

      cctx.font = '13px "Quicksand", sans-serif';
      cctx.fillStyle = '#9aa5b8';
      cctx.fillText('Good try, Laika! Rakhel always believes in you <3', catcherCanvas.width / 2, 265);
    }

    cctx.font = '11px "Silkscreen", monospace';
    cctx.fillStyle = '#4deeea';
    cctx.fillText('Click "Play Again" to start a new run! <3', catcherCanvas.width / 2, 310);
  }

  function catcherGameLoop() {
    if (!catcherActive) return;

    const speedMultiplier = 1 + Math.min(1.6, catcherScore / 2500);

    if (Math.random() < 0.045) {
      const types = [
        { type: 'fish', emoji: '🐟', score: 10, isHazard: false },
        { type: 'can', emoji: '🥫', score: 15, isHazard: false },
        { type: 'star', emoji: '⭐', score: 20, isHazard: false },
        { type: 'heart', emoji: '💖', score: 30, isHazard: false },
        { type: 'golden', emoji: '🌟', score: 50, isHazard: false },
        { type: 'comet', emoji: '☄️', score: 0, isHazard: true }
      ];
      const rand = Math.random();
      let selected;
      if (rand < 0.32) selected = types[0];
      else if (rand < 0.54) selected = types[1];
      else if (rand < 0.72) selected = types[2];
      else if (rand < 0.84) selected = types[3];
      else if (rand < 0.90) selected = types[4];
      else selected = types[5];

      fallingItems.push({
        x: Math.random() * (catcherCanvas.width - 44) + 22,
        y: -20,
        vy: (Math.random() * 1.8 + 2.2) * speedMultiplier,
        ...selected
      });
    }

    fallingItems.forEach((item) => {
      item.y += item.vy;
    });

    for (let i = fallingItems.length - 1; i >= 0; i--) {
      const item = fallingItems[i];
      if (
        item.y >= basket.y - 12 &&
        item.y <= basket.y + basket.height + 6 &&
        item.x >= basket.x - 14 &&
        item.x <= basket.x + basket.width + 14
      ) {
        if (item.isHazard) {
          catcherLives--;
          updateLivesDisplay();
          sound.playNote(140, 'sawtooth', 0.22, 0, 0.18);
          flashEffect = 6;

          if (complimentElem) {
            complimentElem.innerHTML = `Ouch! Avoid the comets! ☄️ (Lives: ${catcherLives})`;
          }

          if (catcherLives <= 0) {
            triggerGameOver();
            return;
          }
        } else {
          catcherScore += item.score;
          if (catcherScore > bestScore) {
            bestScore = catcherScore;
            localStorage.setItem('laika_catcher_best_score', bestScore.toString());
            updateBestScoreDisplay();
          }

          if (gameScoreElem) gameScoreElem.innerText = catcherScore;
          sound.playCollect();
          showCompliment();
        }

        fallingItems.splice(i, 1);
      } else if (item.y > catcherCanvas.height + 25) {
        fallingItems.splice(i, 1);
      }
    }

    cctx.fillStyle = '#111227';
    cctx.fillRect(0, 0, catcherCanvas.width, catcherCanvas.height);

    if (flashEffect > 0) {
      cctx.fillStyle = `rgba(255, 75, 75, ${flashEffect * 0.05})`;
      cctx.fillRect(0, 0, catcherCanvas.width, catcherCanvas.height);
      flashEffect--;
    }

    // Draw Basket (Space Cat Helmet Capsule)
    cctx.font = '32px sans-serif';
    cctx.textAlign = 'center';
    cctx.fillText('🐱', basket.x + basket.width / 2, basket.y + 20);

    // Helmet ring
    cctx.strokeStyle = '#4deeea';
    cctx.lineWidth = 2;
    cctx.strokeRect(basket.x, basket.y - 6, basket.width, basket.height);

    // Draw Items
    fallingItems.forEach((item) => {
      cctx.font = item.isHazard ? '26px sans-serif' : '22px sans-serif';
      cctx.textAlign = 'center';
      cctx.fillText(item.emoji, item.x, item.y);
    });

    catcherLoopId = requestAnimationFrame(catcherGameLoop);
  }

  function showCompliment() {
    const list = CONFIG.miniGame.compliments;
    complimentElem.innerText = list[Math.floor(Math.random() * list.length)];
  }

  // Mini-Game Controls (Mouse / Touch & Keyboard)
  window.addEventListener('keydown', (e) => {
    if (!catcherActive) return;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      basket.x = Math.max(0, basket.x - basket.speed * 2);
    }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      basket.x = Math.min(catcherCanvas.width - basket.width, basket.x + basket.speed * 2);
    }
  });

  catcherCanvas.addEventListener('pointermove', (e) => {
    if (!catcherActive) return;
    const rect = catcherCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    basket.x = Math.max(0, Math.min(catcherCanvas.width - basket.width, mouseX - basket.width / 2));
  });

  document.getElementById('btn-start-catcher').onclick = startCatcherGame;
  document.getElementById('btn-minigame-toggle').onclick = () => {
    sound.playClick();
    minigameModal.classList.remove('hidden');
    startCatcherGame();
  };
  document.getElementById('btn-play-fishgame').onclick = () => {
    sound.playClick();
    celebrationModal.classList.add('hidden');
    minigameModal.classList.remove('hidden');
    startCatcherGame();
  };
})();
