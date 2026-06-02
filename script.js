/* ============================================
   RADAR RANGER — Game Engine
   ============================================ */

(() => {
  'use strict';

  // ─── Constants ──────────────────────────────
  const CANVAS_RESOLUTION = 800; // Internal render resolution
  const PADDING = 50; // px padding inside canvas for labels

  const PYTHAGOREAN_TRIPLES = [
    [3, 4, 5],
    [4, 3, 5],
    [5, 12, 13],
    [12, 5, 13],
    [6, 8, 10],
    [8, 6, 10],
    [8, 15, 17],
    [15, 8, 17],
    [9, 12, 15],
    [12, 9, 15],
  ];

  const SCORE_PER_ROUND = 100;
  const STORAGE_KEY = 'radarRanger_players';
  const NEXT_ROUND_DELAY = 2800; // ms

  // ─── Game State ─────────────────────────────
  const state = {
    level: 1,
    radar: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    correctAnswer: 0,
    correctAnswerSquared: 0, // For √ display on level 3
    score: 0,
    streak: 0,
    bestStreak: 0,
    roundCount: 1,
    showTriangle: false,
    isAnimating: false,
    currentPlayer: null, // nickname string
    gridMinX: -10,
    gridMaxX: 10,
    gridMinY: -10,
    gridMaxY: 10,
    leaderboardTab: 1,
    timeLeft: 0,
    timerDuration: 60,
    timerActive: false
  };

  // Animation state
  const anim = {
    rings: [],        // { cx, cy, radius, maxRadius, speed, color, opacity }
    particles: [],    // { x, y, vx, vy, life, color, size }
    hitFlash: 0,      // countdown for hit flash
    missFlash: 0,
    running: false,
    radarSweepAngle: 0,
    lastTimestamp: 0,
  };

  // ─── DOM References ─────────────────────────
  const $ = (id) => document.getElementById(id);
  const dom = {};

  function cacheDom() {
    dom.loginModal = $('loginModal');
    dom.nicknameInput = $('nicknameInput');
    dom.btnStartGame = $('btnStartGame');
    dom.gameContainer = $('gameContainer');
    dom.displayPlayerName = $('displayPlayerName');
    dom.btnLeaderboard = $('btnLeaderboard');
    dom.btnSwitchPlayer = $('btnSwitchPlayer');
    dom.scoreDisplay = $('scoreDisplay');
    dom.streakDisplay = $('streakDisplay');
    dom.streakEmoji = $('streakEmoji');
    dom.bestStreakDisplay = $('bestStreakDisplay');
    dom.roundDisplay = $('roundDisplay');
    dom.diffBtns = [
      $('diffBtn1'),
      $('diffBtn2'),
      $('diffBtn3'),
    ];
    dom.canvas = $('gameCanvas');
    dom.coordRadar = $('coordRadar');
    dom.coordTarget = $('coordTarget');
    dom.btnTriangle = $('btnTriangle');
    dom.btnToggleMusic = $('btnToggleMusic');
    dom.iconMusic = $('iconMusic');
    dom.btnNewRound = $('btnNewRound');
    dom.answerInput = $('answerInput');
    dom.btnPing = $('btnPing');
    dom.feedbackContainer = $('feedbackContainer');
    dom.timerDisplay = $('timerDisplay');
    dom.timerBar = $('timerBar');
    dom.lbTabs = document.querySelectorAll('.lb-tab');
    dom.leaderboardModal = $('leaderboardModal');
    dom.leaderboardList = $('leaderboardList');
    dom.btnCloseLeaderboard = $('btnCloseLeaderboard');
  }

  // ─── Canvas Context ─────────────────────────
  let ctx;
  let cellSize;
  let originX, originY;

  function setupCanvas() {
    const canvas = dom.canvas;
    canvas.width = CANVAS_RESOLUTION;
    canvas.height = CANVAS_RESOLUTION;
    ctx = canvas.getContext('2d');

    // Calculate cell size and origin dynamically
    const drawArea = CANVAS_RESOLUTION - PADDING * 2;
    const rangeX = state.gridMaxX - state.gridMinX;
    // ensure cellSize doesn't divide by zero
    cellSize = drawArea / (rangeX || 1); 
    
    originX = PADDING + (0 - state.gridMinX) * cellSize;
    originY = PADDING + (state.gridMaxY - 0) * cellSize;
  }

  function gridToPixel(gx, gy) {
    return {
      x: PADDING + (gx - state.gridMinX) * cellSize,
      y: PADDING + (state.gridMaxY - gy) * cellSize,
    };
  }

  // ─── Player Management (localStorage) ──────
  function loadPlayers() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  function savePlayers(players) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
    } catch { /* silent */ }
  }

  function getPlayer(nickname) {
    const players = loadPlayers();
    return players[nickname] || null;
  }

  function saveCurrentPlayer() {
    const players = loadPlayers();
    
    if (!players[state.currentPlayer]) {
      players[state.currentPlayer] = {
        nickname: state.currentPlayer,
        lastPlayed: new Date().toISOString(),
        levels: {
          1: { highscore: 0, bestStreak: 0 },
          2: { highscore: 0, bestStreak: 0 },
          3: { highscore: 0, bestStreak: 0 }
        }
      };
    }
    
    const player = players[state.currentPlayer];
    player.lastPlayed = new Date().toISOString();
    
    if (!player.levels) {
      player.levels = {
        1: { highscore: 0, bestStreak: 0 },
        2: { highscore: 0, bestStreak: 0 },
        3: { highscore: 0, bestStreak: 0 }
      };
      player.levels[state.level].highscore = Math.max(0, state.score);
      player.levels[state.level].bestStreak = Math.max(0, state.bestStreak);
    } else {
      player.levels[state.level].highscore = Math.max(player.levels[state.level].highscore, state.score);
      player.levels[state.level].bestStreak = Math.max(player.levels[state.level].bestStreak, state.bestStreak);
    }
    
    player.totalScore = Math.max(player.totalScore || 0, state.score);
    player.bestStreak = Math.max(player.bestStreak || 0, state.bestStreak);
    
    savePlayers(players);
  }

  function getLeaderboard() {
    const players = loadPlayers();
    return Object.values(players)
      .filter(p => p.levels && p.levels[state.leaderboardTab])
      .sort((a, b) => b.levels[state.leaderboardTab].highscore - a.levels[state.leaderboardTab].highscore || b.levels[state.leaderboardTab].bestStreak - a.levels[state.leaderboardTab].bestStreak);
  }

  // ─── Timer System ─────────────────────────────
  let timerInterval = null;

  function resetAndStartTimer() {
    pauseTimer();
    if (state.level === 1) state.timerDuration = 45;
    else if (state.level === 2) state.timerDuration = 60;
    else state.timerDuration = 90;
    
    state.timeLeft = state.timerDuration;
    resumeTimer();
  }

  function pauseTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    state.timerActive = false;
  }

  function resumeTimer() {
    if (state.timerActive || state.timeLeft <= 0) return;
    state.timerActive = true;
    updateTimerUI();
    
    timerInterval = setInterval(() => {
      if (!state.timerActive) return;
      state.timeLeft -= 0.1;
      
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        updateTimerUI();
        handleTimeout();
        return;
      }
      
      updateTimerUI();
      
      if (state.timeLeft <= 10 && Math.abs(state.timeLeft % 1) < 0.05) {
        playTickWarningSound();
      }
    }, 100);
  }

  function updateTimerUI() {
    const seconds = Math.ceil(state.timeLeft);
    dom.timerDisplay.textContent = seconds + 's';
    
    const pct = (state.timeLeft / state.timerDuration) * 100;
    dom.timerBar.style.width = Math.max(0, pct) + '%';
    
    if (state.timeLeft <= 10 && state.timeLeft > 0) {
      dom.timerBar.classList.add('timer-warning');
      dom.timerDisplay.classList.add('timer-warning', 'timer-pulse');
    } else {
      dom.timerBar.classList.remove('timer-warning');
      dom.timerDisplay.classList.remove('timer-warning', 'timer-pulse');
    }
  }

  function handleTimeout() {
    pauseTimer();
    state.isAnimating = true;
    dom.answerInput.disabled = true;
    dom.btnPing.disabled = true;
    
    state.streak = 0;
    updateUI();
    saveCurrentPlayer();
    
    playTimeoutSound();
    
    showFeedback('error', `Time's up! The submarine has slipped away.`);
    triggerFailAnimation();
    
    setTimeout(() => {
      state.roundCount += 1;
      startNewRound(true);
    }, 2800);
  }

  // ─── Coordinate Generator ──────────────────
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomBool() {
    return Math.random() < 0.5;
  }

  function generatePoints() {
    if (state.level === 1) {
      return generateLevel1();
    } else if (state.level === 2) {
      return generateLevel2();
    } else {
      return generateLevel3();
    }
  }

  function generateLevel1() {
    // Quadrant 1 only, Pythagorean triples → integer distance
    const triple = PYTHAGOREAN_TRIPLES[randomInt(0, PYTHAGOREAN_TRIPLES.length - 1)];
    const [dx, dy, dist] = triple;

    const x1 = randomInt(0, 10);
    const y1 = randomInt(0, 10);
    const x2 = x1 + dx;
    const y2 = y1 + dy;

    return {
      radar: { x: x1, y: y1 },
      target: { x: x2, y: y2 },
      answer: dist,
      answerSquared: dist * dist,
    };
  }

  function generateLevel2() {
    // All quadrants, Pythagorean triples → integer distance
    const triple = PYTHAGOREAN_TRIPLES[randomInt(0, PYTHAGOREAN_TRIPLES.length - 1)];
    const [dx, dy, dist] = triple;

    const x1 = randomInt(-10, 10);
    const y1 = randomInt(-10, 10);
    const x2 = x1 + (randomBool() ? dx : -dx);
    const y2 = y1 + (randomBool() ? dy : -dy);

    return {
      radar: { x: x1, y: y1 },
      target: { x: x2, y: y2 },
      answer: dist,
      answerSquared: dist * dist,
    };
  }

  function generateLevel3() {
    // Random positions, distance may be irrational
    const x1 = randomInt(-15, 15);
    const y1 = randomInt(-15, 15);
    const dx = randomInt(1, 15) * (randomBool() ? 1 : -1);
    const dy = randomInt(1, 15) * (randomBool() ? 1 : -1);
    const x2 = x1 + dx;
    const y2 = y1 + dy;

    const dxAbs = Math.abs(dx);
    const dyAbs = Math.abs(dy);
    const distSq = dxAbs * dxAbs + dyAbs * dyAbs;
    const dist = Math.sqrt(distSq);

    return {
      radar: { x: x1, y: y1 },
      target: { x: x2, y: y2 },
      answer: dist,
      answerSquared: distSq,
    };
  }

  function startNewRound(keepScore = true) {
    if (!keepScore) {
      state.score = 0;
      state.streak = 0;
      state.roundCount = 1;
    }

    const pts = generatePoints();
    state.radar = pts.radar;
    state.target = pts.target;
    state.correctAnswer = pts.answer;
    state.correctAnswerSquared = pts.answerSquared;
    state.isAnimating = false;

    // Calculate dynamic grid bounds
    const allX = [state.radar.x, state.target.x, 0];
    const allY = [state.radar.y, state.target.y, 0]; // 0 is included to always show origin
    const minX = Math.min(...allX) - 2;
    const maxX = Math.max(...allX) + 2;
    const minY = Math.min(...allY) - 2;
    const maxY = Math.max(...allY) + 2;
    
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    const maxRange = Math.max(rangeX, rangeY, 10); // keep it square, minimum range 10
    
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    
    state.gridMinX = Math.floor(midX - maxRange / 2);
    state.gridMaxX = Math.ceil(midX + maxRange / 2);
    state.gridMinY = Math.floor(midY - maxRange / 2);
    state.gridMaxY = Math.ceil(midY + maxRange / 2);

    // Call setupCanvas to recalculate cellSize and origins
    setupCanvas();

    // Reset animation
    anim.rings = [];
    anim.particles = [];
    anim.hitFlash = 0;
    anim.missFlash = 0;

    updateUI();
    clearFeedback();
    dom.answerInput.value = '';
    dom.answerInput.classList.remove('correct', 'incorrect');
    dom.answerInput.disabled = false;
    dom.btnPing.disabled = false;
    dom.answerInput.focus();
    renderStatic();
    resetAndStartTimer();
  }

  // ─── UI Updates ─────────────────────────────
  function updateUI() {
    dom.scoreDisplay.textContent = state.score;
    dom.streakDisplay.textContent = state.streak;
    dom.bestStreakDisplay.textContent = state.bestStreak;
    dom.roundDisplay.textContent = `#${state.roundCount}`;
    dom.coordRadar.textContent = `A(${state.radar.x}, ${state.radar.y})`;
    dom.coordTarget.textContent = `B(${state.target.x}, ${state.target.y})`;

    // Streak fire emoji
    if (state.streak >= 3) {
      dom.streakEmoji.style.display = 'inline';
      dom.streakDisplay.classList.add('on-fire');
    } else {
      dom.streakEmoji.style.display = 'none';
      dom.streakDisplay.classList.remove('on-fire');
    }

    // Difficulty buttons
    dom.diffBtns.forEach((btn) => {
      btn.classList.toggle('active', parseInt(btn.dataset.level) === state.level);
    });

    // Triangle toggle
    dom.btnTriangle.classList.toggle('active', state.showTriangle);
  }

  function showFeedback(type, message) {
    const icons = { success: '✅', error: '❌', hint: '💡' };
    dom.feedbackContainer.innerHTML = `
      <div class="feedback-msg ${type}">
        <span class="feedback-icon">${icons[type] || ''}</span>
        <span>${message}</span>
      </div>
    `;
  }

  function clearFeedback() {
    dom.feedbackContainer.innerHTML = '';
  }

  function animateScoreChange() {
    dom.scoreDisplay.classList.remove('score-pop');
    void dom.scoreDisplay.offsetWidth; // force reflow
    dom.scoreDisplay.classList.add('score-pop');
  }

  // ─── Rendering ──────────────────────────────
  function renderStatic() {
    ctx.clearRect(0, 0, CANVAS_RESOLUTION, CANVAS_RESOLUTION);
    drawBackground();
    drawGrid();
    if (state.showTriangle) drawTriangleHelper();
    drawRadarSprite();
    drawSubmarineSprite();
    drawRadarSweepStatic();
  }

  function drawBackground() {
    // Dark gradient background
    const grad = ctx.createRadialGradient(
      CANVAS_RESOLUTION / 2, CANVAS_RESOLUTION / 2, 0,
      CANVAS_RESOLUTION / 2, CANVAS_RESOLUTION / 2, CANVAS_RESOLUTION * 0.7
    );
    grad.addColorStop(0, 'hsl(220, 25%, 10%)');
    grad.addColorStop(1, 'hsl(220, 30%, 5%)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_RESOLUTION, CANVAS_RESOLUTION);
  }

  function drawGrid() {
    const gridColor = 'hsla(140, 60%, 40%, 0.12)';
    const axisColor = 'hsla(140, 80%, 50%, 0.45)';
    const labelColor = 'hsla(140, 50%, 55%, 0.6)';
    const labelFont = '11px Orbitron, monospace';

    ctx.lineWidth = 1;

    // Grid lines - X axis
    for (let i = state.gridMinX; i <= state.gridMaxX; i++) {
      const isAxis = i === 0;
      const p = gridToPixel(i, 0);

      // Vertical line
      ctx.beginPath();
      ctx.strokeStyle = isAxis ? axisColor : gridColor;
      ctx.lineWidth = isAxis ? 2 : 0.5;
      ctx.moveTo(p.x, PADDING);
      ctx.lineTo(p.x, CANVAS_RESOLUTION - PADDING);
      ctx.stroke();

      // X axis labels (skip 0)
      if (i !== 0) {
        ctx.fillStyle = labelColor;
        ctx.font = labelFont;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(i.toString(), p.x, originY + 6);
      }
    }

    // Grid lines - Y axis
    for (let i = state.gridMinY; i <= state.gridMaxY; i++) {
      const isAxis = i === 0;
      const pY = gridToPixel(0, i);

      // Horizontal line
      ctx.beginPath();
      ctx.strokeStyle = isAxis ? axisColor : gridColor;
      ctx.lineWidth = isAxis ? 2 : 0.5;
      ctx.moveTo(PADDING, pY.y);
      ctx.lineTo(CANVAS_RESOLUTION - PADDING, pY.y);
      ctx.stroke();

      // Y axis labels (skip 0)
      if (i !== 0) {
        ctx.fillStyle = labelColor;
        ctx.font = labelFont;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(i.toString(), originX - 6, pY.y);
      }
    }

    // Origin label
    ctx.fillStyle = labelColor;
    ctx.font = labelFont;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('0', originX - 6, originY + 6);

    // Axis arrows / labels
    ctx.fillStyle = 'hsla(140, 70%, 55%, 0.7)';
    ctx.font = 'bold 14px Orbitron, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('x', CANVAS_RESOLUTION - PADDING + 20, originY - 4);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText('y', originX + 8, PADDING - 18);
  }

  function drawRadarSweepStatic() {
    // A subtle sweep line from origin of radar
    const rp = gridToPixel(state.radar.x, state.radar.y);
    const sweepLen = 25;
    const angle = anim.radarSweepAngle;
    ctx.beginPath();
    ctx.moveTo(rp.x, rp.y);
    ctx.lineTo(rp.x + Math.cos(angle) * sweepLen, rp.y + Math.sin(angle) * sweepLen);
    ctx.strokeStyle = 'hsla(140, 80%, 50%, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawTriangleHelper() {
    const rp = gridToPixel(state.radar.x, state.radar.y);
    const tp = gridToPixel(state.target.x, state.target.y);
    const cp = gridToPixel(state.target.x, state.radar.y); // corner point

    const dx = Math.abs(state.target.x - state.radar.x);
    const dy = Math.abs(state.target.y - state.radar.y);

    ctx.save();
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2.5;

    // Horizontal leg (a)
    ctx.beginPath();
    ctx.strokeStyle = 'hsla(40, 95%, 55%, 0.7)';
    ctx.moveTo(rp.x, rp.y);
    ctx.lineTo(cp.x, cp.y);
    ctx.stroke();

    // Vertical leg (b)
    ctx.beginPath();
    ctx.strokeStyle = 'hsla(40, 95%, 55%, 0.7)';
    ctx.moveTo(cp.x, cp.y);
    ctx.lineTo(tp.x, tp.y);
    ctx.stroke();

    // Hypotenuse (c)
    ctx.setLineDash([12, 6]);
    ctx.beginPath();
    ctx.strokeStyle = 'hsla(185, 90%, 55%, 0.8)';
    ctx.lineWidth = 2.5;
    ctx.moveTo(rp.x, rp.y);
    ctx.lineTo(tp.x, tp.y);
    ctx.stroke();

    ctx.setLineDash([]);

    // Right angle indicator at corner
    const sqSize = 12;
    const dirX = state.radar.x < state.target.x ? -1 : 1;
    const dirY = state.radar.y < state.target.y ? 1 : -1;
    ctx.beginPath();
    ctx.strokeStyle = 'hsla(40, 95%, 55%, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.moveTo(cp.x + dirX * sqSize, cp.y);
    ctx.lineTo(cp.x + dirX * sqSize, cp.y + dirY * sqSize);
    ctx.lineTo(cp.x, cp.y + dirY * sqSize);
    ctx.stroke();

    // Labels
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.textAlign = 'center';

    // Label a (horizontal)
    const midHx = (rp.x + cp.x) / 2;
    const midHy = rp.y + (state.radar.y > state.target.y ? 22 : -12);
    ctx.fillStyle = 'hsla(40, 95%, 60%, 0.95)';
    ctx.fillText(`a = ${dx}`, midHx, midHy);

    // Label b (vertical)
    const midVx = cp.x + (state.radar.x < state.target.x ? 28 : -28);
    const midVy = (cp.y + tp.y) / 2;
    ctx.textAlign = state.radar.x < state.target.x ? 'left' : 'right';
    ctx.fillText(`b = ${dy}`, midVx, midVy);

    // Label c (hypotenuse)
    const midCx = (rp.x + tp.x) / 2;
    const midCy = (rp.y + tp.y) / 2;
    const offsetX = (state.radar.y < state.target.y) ? -18 : 18;
    const offsetY = (state.radar.x < state.target.x) ? -14 : 14;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'hsla(185, 90%, 65%, 0.95)';
    ctx.fillText('c = ?', midCx + offsetX, midCy + offsetY);

    ctx.restore();
  }

  function drawRadarSprite() {
    const p = gridToPixel(state.radar.x, state.radar.y);
    const size = 18;

    ctx.save();
    ctx.translate(p.x, p.y);

    // Glow
    ctx.shadowColor = 'hsla(140, 85%, 50%, 0.5)';
    ctx.shadowBlur = 15;

    // Base circle
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fillStyle = 'hsl(140, 70%, 25%)';
    ctx.fill();
    ctx.strokeStyle = 'hsl(140, 85%, 50%)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner circle
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = 'hsl(140, 85%, 45%)';
    ctx.fill();

    // Antenna line
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.3);
    ctx.lineTo(0, -size * 1.6);
    ctx.strokeStyle = 'hsl(140, 85%, 50%)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Antenna tip
    ctx.beginPath();
    ctx.arc(0, -size * 1.6, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'hsl(140, 90%, 60%)';
    ctx.fill();

    // Small dish arcs
    ctx.beginPath();
    ctx.arc(0, -size * 1.2, 8, -Math.PI * 0.7, -Math.PI * 0.3);
    ctx.strokeStyle = 'hsla(140, 85%, 55%, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Label
    ctx.fillStyle = 'hsl(140, 85%, 60%)';
    ctx.font = 'bold 13px Orbitron, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('A', 0, size + 16);

    ctx.restore();
  }

  function drawSubmarineSprite() {
    const p = gridToPixel(state.target.x, state.target.y);
    const w = 28;
    const h = 12;

    ctx.save();
    ctx.translate(p.x, p.y);

    // Glow
    ctx.shadowColor = 'hsla(0, 80%, 55%, 0.4)';
    ctx.shadowBlur = 12;

    // Body (ellipse)
    ctx.beginPath();
    ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'hsl(220, 25%, 22%)';
    ctx.fill();
    ctx.strokeStyle = 'hsl(0, 70%, 50%)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Conning tower
    ctx.beginPath();
    ctx.roundRect(-6, -h - 6, 12, 8, 3);
    ctx.fillStyle = 'hsl(220, 25%, 28%)';
    ctx.fill();
    ctx.strokeStyle = 'hsl(0, 70%, 50%)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Periscope
    ctx.beginPath();
    ctx.moveTo(0, -h - 6);
    ctx.lineTo(0, -h - 18);
    ctx.lineTo(5, -h - 18);
    ctx.strokeStyle = 'hsl(0, 60%, 45%)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Porthole
    ctx.beginPath();
    ctx.arc(-10, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'hsla(185, 90%, 60%, 0.5)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(2, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'hsla(185, 90%, 60%, 0.5)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(14, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'hsla(185, 90%, 60%, 0.5)';
    ctx.fill();

    ctx.shadowBlur = 0;

    // Propeller
    ctx.beginPath();
    ctx.moveTo(-w - 2, -5);
    ctx.lineTo(-w - 8, -9);
    ctx.moveTo(-w - 2, 0);
    ctx.lineTo(-w - 8, 0);
    ctx.moveTo(-w - 2, 5);
    ctx.lineTo(-w - 8, 9);
    ctx.strokeStyle = 'hsl(0, 50%, 40%)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label
    ctx.fillStyle = 'hsl(0, 75%, 60%)';
    ctx.font = 'bold 13px Orbitron, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('B', 0, h + 20);

    ctx.restore();
  }

  // ─── Animation System ──────────────────────
  function startAnimationLoop() {
    if (anim.running) return;
    anim.running = true;
    anim.lastTimestamp = performance.now();
    requestAnimationFrame(animationLoop);
  }

  function stopAnimationLoop() {
    anim.running = false;
  }

  function animationLoop(timestamp) {
    if (!anim.running) return;

    const dt = (timestamp - anim.lastTimestamp) / 1000; // seconds
    anim.lastTimestamp = timestamp;

    // Update radar sweep
    anim.radarSweepAngle += dt * 1.5;

    // Render everything
    ctx.clearRect(0, 0, CANVAS_RESOLUTION, CANVAS_RESOLUTION);
    drawBackground();
    drawGrid();
    if (state.showTriangle) drawTriangleHelper();
    drawRadarSprite();
    drawSubmarineSprite();

    // Update & draw rings
    updateRings(dt);
    drawRings();

    // Update & draw particles
    updateParticles(dt);
    drawParticles();

    // Hit/miss flash
    if (anim.hitFlash > 0) {
      drawHitFlash();
      anim.hitFlash -= dt;
    }
    if (anim.missFlash > 0) {
      drawMissFlash();
      anim.missFlash -= dt;
    }

    // Draw sweep
    drawRadarSweepStatic();

    // Check if animation is done
    const stillActive = anim.rings.length > 0 || anim.particles.length > 0
      || anim.hitFlash > 0 || anim.missFlash > 0;

    if (stillActive) {
      requestAnimationFrame(animationLoop);
    } else {
      anim.running = false;
      renderStatic();
    }
  }

  function updateRings(dt) {
    for (let i = anim.rings.length - 1; i >= 0; i--) {
      const r = anim.rings[i];
      r.radius += r.speed * dt;
      r.opacity -= dt * 0.4;
      if (r.opacity <= 0 || r.radius > r.maxRadius) {
        anim.rings.splice(i, 1);
      }
    }
  }

  function drawRings() {
    for (const r of anim.rings) {
      ctx.beginPath();
      ctx.arc(r.cx, r.cy, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = r.color.replace('ALPHA', Math.max(0, r.opacity).toFixed(2));
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  function updateParticles(dt) {
    for (let i = anim.particles.length - 1; i >= 0; i--) {
      const p = anim.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        anim.particles.splice(i, 1);
      }
    }
  }

  function drawParticles() {
    for (const p of anim.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fillStyle = p.color.replace('ALPHA', alpha.toFixed(2));
      ctx.fill();
    }
  }

  function drawHitFlash() {
    const tp = gridToPixel(state.target.x, state.target.y);
    const alpha = Math.min(1, anim.hitFlash * 2);
    const grad = ctx.createRadialGradient(tp.x, tp.y, 0, tp.x, tp.y, 60);
    grad.addColorStop(0, `hsla(140, 90%, 70%, ${alpha * 0.6})`);
    grad.addColorStop(1, `hsla(140, 90%, 50%, 0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(tp.x - 60, tp.y - 60, 120, 120);
  }

  function drawMissFlash() {
    const alpha = Math.min(1, anim.missFlash * 3);
    ctx.fillStyle = `hsla(0, 80%, 50%, ${alpha * 0.08})`;
    ctx.fillRect(0, 0, CANVAS_RESOLUTION, CANVAS_RESOLUTION);
  }

  // ─── Trigger Animations ────────────────────
  function triggerSuccessAnimation() {
    state.isAnimating = true;
    const rp = gridToPixel(state.radar.x, state.radar.y);
    const tp = gridToPixel(state.target.x, state.target.y);
    const dist = Math.hypot(tp.x - rp.x, tp.y - rp.y);

    // Create expanding rings from radar
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        anim.rings.push({
          cx: rp.x,
          cy: rp.y,
          radius: 0,
          maxRadius: dist + 40,
          speed: 220,
          color: 'hsla(140, 85%, 55%, ALPHA)',
          opacity: 0.8,
        });
      }, i * 180);
    }

    // Hit flash and particles after delay
    const hitTime = (dist / 220) * 1000 + 200;
    setTimeout(() => {
      anim.hitFlash = 0.8;
      // Spawn particles at target
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20 + Math.random() * 0.3;
        const speed = 80 + Math.random() * 120;
        anim.particles.push({
          x: tp.x,
          y: tp.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0.8 + Math.random() * 0.5,
          maxLife: 1.3,
          color: 'hsla(140, 85%, 60%, ALPHA)',
          size: 3 + Math.random() * 4,
        });
      }
    }, hitTime);

    startAnimationLoop();
  }

  function triggerFailAnimation() {
    state.isAnimating = true;
    const rp = gridToPixel(state.radar.x, state.radar.y);
    const tp = gridToPixel(state.target.x, state.target.y);
    const dist = Math.hypot(tp.x - rp.x, tp.y - rp.y);

    // Red rings that fade before reaching target
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        anim.rings.push({
          cx: rp.x,
          cy: rp.y,
          radius: 0,
          maxRadius: dist * 0.55, // Don't reach target
          speed: 180,
          color: 'hsla(0, 80%, 55%, ALPHA)',
          opacity: 0.7,
        });
      }, i * 200);
    }

    anim.missFlash = 0.6;
    startAnimationLoop();
  }

  // ─── Sound Engine (Web Audio API) ──────────
  let audioCtx = null;

  const ambient = {
    playing: true,
    timerID: null,
    step: 0,
    nextNoteTime: 0,
    mainBus: null,
    delayNode: null
  };

  const CHILL_SCALE = [261.63, 293.66, 329.63, 392.00, 440.00]; // C Major Pentatonic (more fun/happy)
  const CHILL_PATTERN = [0, -1, 2, -1, 4, 2, -1, 3, 0, -1, 2, 4, 3, -1, 1, 2];

  function toggleMusic() {
    ambient.playing = !ambient.playing;
    if (ambient.playing) {
      dom.iconMusic.textContent = '🔊';
      startAmbientMusic();
    } else {
      dom.iconMusic.textContent = '🔇';
      stopAmbientMusic();
    }
  }

  function playSynth(freq, time, type, duration, vol) {
    if(!audioCtx || !ambient.mainBus) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    
    osc.connect(gain);
    gain.connect(ambient.mainBus);
    
    osc.start(time);
    osc.stop(time + duration);
  }

  function playKick(time) {
    if(!audioCtx || !ambient.mainBus) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(ambient.mainBus);
    
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.3);
    
    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
    
    osc.start(time);
    osc.stop(time + 0.3);
  }

  function musicScheduler() {
    if (!ambient.playing) return;
    const ctx = getAudioCtx();
    
    while (ambient.nextNoteTime < ctx.currentTime + 0.1) {
      const beat = ambient.step % 16;
      
      // Kick on 1 and 3 (beat 0 and 8)
      if (beat === 0 || beat === 8) {
        playKick(ambient.nextNoteTime);
      }

      // Arpeggio
      const noteIdx = CHILL_PATTERN[beat];
      if (noteIdx !== -1) {
        playSynth(CHILL_SCALE[noteIdx], ambient.nextNoteTime, 'sine', 0.3, 0.08);
      }
      
      // Bass line
      if (beat % 8 === 0) {
        const root = CHILL_SCALE[0] / 2; // Octave down
        playSynth(root, ambient.nextNoteTime, 'triangle', 0.6, 0.15);
      } else if (beat % 8 === 6) {
         playSynth(CHILL_SCALE[2] / 2, ambient.nextNoteTime, 'triangle', 0.3, 0.1);
      }
      
      ambient.nextNoteTime += 0.14; // speed/tempo (approx 107 BPM)
      ambient.step++;
    }
    
    ambient.timerID = requestAnimationFrame(musicScheduler);
  }

  function startAmbientMusic() {
    if (ambient.timerID) return;
    try {
      const ctx = getAudioCtx();
      if(ctx.state === 'suspended') ctx.resume();
      
      // Setup master bus and delay effect for chill vibe
      ambient.mainBus = ctx.createGain();
      ambient.mainBus.gain.value = 0.6; // Overall volume
      ambient.mainBus.connect(ctx.destination);
      
      ambient.delayNode = ctx.createDelay();
      ambient.delayNode.delayTime.value = 0.42; // dotted 8th note delay
      
      const delayFeedback = ctx.createGain();
      delayFeedback.gain.value = 0.35; // Echo volume
      
      ambient.mainBus.connect(ambient.delayNode);
      ambient.delayNode.connect(delayFeedback);
      delayFeedback.connect(ambient.delayNode);
      ambient.delayNode.connect(ctx.destination);
      
      ambient.step = 0;
      ambient.nextNoteTime = ctx.currentTime + 0.1;
      musicScheduler();
      
    } catch (e) {
      console.warn("Audio not supported or blocked", e);
    }
  }

  function stopAmbientMusic() {
    if (ambient.timerID) {
      cancelAnimationFrame(ambient.timerID);
      ambient.timerID = null;
    }
    if (ambient.mainBus) {
      ambient.mainBus.disconnect();
      ambient.mainBus = null;
    }
    if (ambient.delayNode) {
      ambient.delayNode.disconnect();
      ambient.delayNode = null;
    }
  }

  function getAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function playPingSound() {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch { /* audio not supported */ }
  }

  function playSuccessSound() {
    try {
      const ctx = getAudioCtx();
      const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.3);
      });
    } catch { /* audio not supported */ }
  }

  function playFailSound() {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch { /* audio not supported */ }
  }

  function playClickSound() {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch { /* audio not supported */ }
  }

  function playTickWarningSound() {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.value = 1500;
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.04);
    } catch { /* audio not supported */ }
  }

  function playTimeoutSound() {
    try {
      const ctx = getAudioCtx();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(100, ctx.currentTime);
      osc2.frequency.setValueAtTime(150, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      
      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.8);
      osc2.stop(ctx.currentTime + 0.8);
    } catch { /* audio not supported */ }
  }

  // ─── Input Parsing ─────────────────────────
  function parseAnswer(input) {
    if (!input || typeof input !== 'string') return NaN;
    input = input.trim();

    // Try √N or sqrt(N) or sqrt N
    let sqrtMatch = input.match(/^[√](\d+\.?\d*)$/);
    if (sqrtMatch) return Math.sqrt(parseFloat(sqrtMatch[1]));

    sqrtMatch = input.match(/^sqrt\s*\(?\s*(\d+\.?\d*)\s*\)?\s*$/i);
    if (sqrtMatch) return Math.sqrt(parseFloat(sqrtMatch[1]));

    // Try plain number
    const num = parseFloat(input);
    if (!isNaN(num)) return num;

    return NaN;
  }

  // ─── Answer Validation ─────────────────────
  function checkAnswer() {
    if (state.isAnimating) return;

    const raw = dom.answerInput.value;
    const userVal = parseAnswer(raw);

    if (isNaN(userVal) || userVal < 0) {
      showFeedback('hint', 'Please enter a valid distance (e.g. 5, 4.47, or √20)');
      dom.answerInput.classList.add('incorrect');
      setTimeout(() => dom.answerInput.classList.remove('incorrect'), 500);
      return;
    }

    // Determine tolerance based on level
    const tolerance = (state.level <= 2) ? 0.01 : 0.1;
    const isCorrect = Math.abs(userVal - state.correctAnswer) <= tolerance;

    if (isCorrect) {
      handleCorrect();
    } else {
      handleIncorrect();
    }
  }

  function handleCorrect() {
    pauseTimer();
    state.isAnimating = true;
    dom.answerInput.classList.add('correct');
    dom.answerInput.disabled = true;
    dom.btnPing.disabled = true;

    // Update score
    state.score += SCORE_PER_ROUND;
    state.streak += 1;
    if (state.streak > state.bestStreak) {
      state.bestStreak = state.streak;
    }

    updateUI();
    animateScoreChange();
    saveCurrentPlayer();

    playPingSound();
    setTimeout(() => playSuccessSound(), 400);

    // Build feedback message
    let msg = `Target detected! Distance = ${formatAnswer(state.correctAnswer, state.correctAnswerSquared)}`;
    if (state.streak >= 3) msg += ` — 🔥 ${state.streak} streak!`;
    showFeedback('success', msg);

    triggerSuccessAnimation();

    // Auto next round
    setTimeout(() => {
      state.roundCount += 1;
      startNewRound(true);
    }, NEXT_ROUND_DELAY);
  }

  function handleIncorrect() {
    pauseTimer();
    state.isAnimating = true;
    dom.answerInput.classList.add('incorrect');
    dom.answerInput.disabled = true;
    dom.btnPing.disabled = true;

    state.streak = 0;
    updateUI();
    saveCurrentPlayer();

    playPingSound();
    setTimeout(() => playFailSound(), 300);

    const dx = Math.abs(state.target.x - state.radar.x);
    const dy = Math.abs(state.target.y - state.radar.y);
    showFeedback('error', `Missed! Remember: a² + b² = c². Check Δx=${dx} and Δy=${dy}.`);

    triggerFailAnimation();

    // Auto next round
    setTimeout(() => {
      state.roundCount += 1;
      startNewRound(true);
    }, NEXT_ROUND_DELAY);
  }

  function formatAnswer(answer, answerSquared) {
    // Check if it's an integer
    if (Number.isInteger(answer)) {
      return answer.toString();
    }
    // Show both √ form and decimal
    return `√${answerSquared} ≈ ${answer.toFixed(2)}`;
  }

  // ─── Leaderboard ────────────────────────────
  function renderLeaderboard() {
    dom.lbTabs.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.level) === state.leaderboardTab);
    });

    const list = getLeaderboard();
    if (list.length === 0) {
      dom.leaderboardList.innerHTML = '<li class="lb-empty">No agents ranked on this level yet.</li>';
      return;
    }

    dom.leaderboardList.innerHTML = list.map((p, i) => {
      const isCurrent = p.nickname === state.currentPlayer;
      const stats = p.levels[state.leaderboardTab];
      return `
        <li class="lb-item ${isCurrent ? 'current-player' : ''}">
          <div class="lb-rank">${i + 1}</div>
          <div class="lb-info">
            <div class="lb-name">${escapeHtml(p.nickname)}${isCurrent ? ' (you)' : ''}</div>
            <div class="lb-stats">Best streak: ${stats.bestStreak || 0}</div>
          </div>
          <div class="lb-score">${stats.highscore || 0}</div>
        </li>
      `;
    }).join('');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ─── Event Handlers ─────────────────────────
  function bindEvents() {
    // Login
    dom.nicknameInput.addEventListener('input', () => {
      dom.btnStartGame.disabled = dom.nicknameInput.value.trim().length === 0;
    });

    dom.nicknameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !dom.btnStartGame.disabled) {
        startGame();
      }
    });

    dom.btnStartGame.addEventListener('click', startGame);

    // Difficulty
    dom.diffBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        playClickSound();
        state.level = parseInt(btn.dataset.level);
        startNewRound(false);
      });
    });

    // Triangle toggle
    dom.btnTriangle.addEventListener('click', () => {
      playClickSound();
      state.showTriangle = !state.showTriangle;
      updateUI();
      renderStatic();
    });

    // Music toggle
    dom.btnToggleMusic.addEventListener('click', () => {
      playClickSound();
      toggleMusic();
    });

    // New round
    dom.btnNewRound.addEventListener('click', () => {
      if (state.isAnimating) return;
      playClickSound();
      state.roundCount += 1;
      startNewRound(true);
    });

    // Ping
    dom.btnPing.addEventListener('click', () => {
      checkAnswer();
    });

    dom.answerInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        checkAnswer();
      }
    });

    // Leaderboard
    dom.lbTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        playClickSound();
        state.leaderboardTab = parseInt(btn.dataset.level);
        renderLeaderboard();
      });
    });

    dom.btnLeaderboard.addEventListener('click', () => {
      pauseTimer();
      playClickSound();
      state.leaderboardTab = state.level;
      renderLeaderboard();
      dom.leaderboardModal.classList.remove('hidden');
    });

    dom.btnCloseLeaderboard.addEventListener('click', () => {
      dom.leaderboardModal.classList.add('hidden');
      if (state.timeLeft > 0 && !state.isAnimating) resumeTimer();
    });

    dom.leaderboardModal.addEventListener('click', (e) => {
      if (e.target === dom.leaderboardModal) {
        dom.leaderboardModal.classList.add('hidden');
        if (state.timeLeft > 0 && !state.isAnimating) resumeTimer();
      }
    });

    // Switch player
    dom.btnSwitchPlayer.addEventListener('click', () => {
      pauseTimer();
      playClickSound();
      saveCurrentPlayer();
      dom.gameContainer.classList.add('hidden');
      dom.loginModal.classList.remove('hidden');
      dom.nicknameInput.value = '';
      dom.nicknameInput.focus();
      dom.btnStartGame.disabled = true;
    });

    // Window resize → recalculate canvas (it's CSS-scaled, so resolution stays same)
    // Canvas internal resolution is fixed; CSS scales it responsively.
  }

  function startGame() {
    const nickname = dom.nicknameInput.value.trim();
    if (!nickname) return;

    state.currentPlayer = nickname;

    // Load existing player data or create new
    const existing = getPlayer(nickname);
    if (existing) {
      state.score = existing.totalScore || 0;
      state.bestStreak = existing.bestStreak || 0;
    } else {
      state.score = 0;
      state.bestStreak = 0;
    }
    state.streak = 0;
    state.roundCount = 1;

    dom.loginModal.classList.add('hidden');
    dom.gameContainer.classList.remove('hidden');
    dom.displayPlayerName.textContent = nickname;

    setupCanvas();
    startNewRound(true);

    if (ambient.playing) {
      startAmbientMusic();
    }
  }

  // ─── Init ───────────────────────────────────
  function init() {
    cacheDom();
    bindEvents();
    dom.nicknameInput.focus();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
