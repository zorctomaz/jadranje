(function () {
  "use strict";

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Language toggle (SI/EN), matching the FOTRA hub convention ---------- */
  var PAGE_DESC = {
    sl: 'Individualni tečaji jadranja, vzdrževanje plovil in skiperiranje/transfer. Odjadraj v neznano — z osebnim pristopom.',
    en: 'Individual sailing courses, boat maintenance and skippering/transfer. Sail into the unknown — with a personal touch.'
  };
  var VIDEO_TITLE = { sl: 'Jadranje', en: 'Sailing' };
  var currentLang = 'sl';

  function applyLang(lang) {
    if (lang !== 'en' && lang !== 'sl') lang = 'sl';
    currentLang = lang;

    var htmlRoot = document.getElementById('htmlRoot');
    if (htmlRoot) htmlRoot.lang = lang;

    var descEl = document.getElementById('pageDescription');
    if (descEl) descEl.setAttribute('content', PAGE_DESC[lang]);

    document.querySelectorAll('[data-sl][data-en]').forEach(function (el) {
      el.innerHTML = lang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-sl');
    });

    var videoIframe = document.getElementById('videoIframe');
    if (videoIframe) videoIframe.setAttribute('title', VIDEO_TITLE[lang]);

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    var termInputEl = document.getElementById('termInput');
    if (termInputEl) {
      termInputEl.placeholder = termInputEl.getAttribute(lang === 'en' ? 'data-en-ph' : 'data-sl-ph');
    }

    try { localStorage.setItem('jadranjeLang', lang); } catch (e) {}
  }

  document.querySelectorAll('.lang-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyLang(btn.getAttribute('data-lang'));
    });
  });

  /* ---------- SNAKE game + BACK/SNAKE terminal commands ---------- */
  (function () {
    var overlay = document.getElementById('snakeOverlay');
    var canvas = document.getElementById('snakeCanvas');
    var termInput = document.getElementById('termInput');
    if (!overlay || !canvas || !termInput) return;
    var ctx = canvas.getContext('2d');
    var scoreEl = document.getElementById('snakeScore');
    var msgEl = document.getElementById('snakeMsg');
    var closeBtn = document.getElementById('snakeClose');

    var GRID = 20;
    var CELL = canvas.width / GRID;
    var snake, dir, nextDir, food, score, loopId, gameOver, gameStarted;
    var msgState = 'idle';
    var msgs = {
      sl: { idle: 'PUŠČICE/GUMBI = PREMIK', playing: 'IGRA SE...', over: 'KONEC - ENTER/GUMB=ZNOVA' },
      en: { idle: 'ARROWS/BTNS = MOVE', playing: 'PLAYING...', over: 'GAME OVER - ENTER/BTN=RESTART' }
    };
    function updateMsg() { msgEl.textContent = msgs[currentLang][msgState]; }

    function resetGame() {
      snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
      dir = { x: 1, y: 0 }; nextDir = { x: 1, y: 0 };
      score = 0; gameOver = false; gameStarted = false;
      placeFood();
      scoreEl.textContent = 'SCORE: 0';
      msgState = 'idle'; updateMsg();
      drawGame();
    }
    function placeFood() {
      var ok = false;
      while (!ok) {
        food = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
        ok = !snake.some(function (s) { return s.x === food.x && s.y === food.y; });
      }
    }
    function drawGame() {
      ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#FF5555'; ctx.fillRect(food.x * CELL, food.y * CELL, CELL, CELL);
      snake.forEach(function (seg, i) {
        ctx.fillStyle = i === 0 ? '#FFFFFF' : '#55FF55';
        ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
      });
    }
    function tick() {
      if (gameOver) return;
      dir = nextDir;
      var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      var hitWall = head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID;
      var hitSelf = snake.some(function (s) { return s.x === head.x && s.y === head.y; });
      if (hitWall || hitSelf) {
        gameOver = true; clearInterval(loopId); msgState = 'over'; updateMsg();
        return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score += 10; scoreEl.textContent = 'SCORE: ' + score; placeFood();
      } else {
        snake.pop();
      }
      drawGame();
    }
    function startGame() {
      if (gameStarted) return;
      gameStarted = true; msgState = 'playing'; updateMsg();
      loopId = setInterval(tick, 120);
    }
    function applyDir(d) {
      if (gameOver) return;
      if (dir.x + d.x !== 0 || dir.y + d.y !== 0) { nextDir = d; }
      startGame();
    }
    var dirMap = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
    document.querySelectorAll('.dpad-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (gameOver) { resetGame(); return; }
        applyDir(dirMap[btn.getAttribute('data-dir')]);
      });
    });

    var snakeHistoryPushed = false;
    function openSnake() {
      overlay.hidden = false;
      resetGame();
      history.pushState({ fotraScreen: 'snake' }, '');
      snakeHistoryPushed = true;
    }
    function closeSnake(viaPopstate) {
      clearInterval(loopId);
      overlay.hidden = true;
      termInput.focus({ preventScroll: true });
      if (snakeHistoryPushed && !viaPopstate) {
        snakeHistoryPushed = false;
        history.back();
      } else {
        snakeHistoryPushed = false;
      }
    }
    window.addEventListener('popstate', function () {
      if (!overlay.hidden) { closeSnake(true); }
    });
    if (closeBtn) closeBtn.addEventListener('click', function () { closeSnake(); });

    document.addEventListener('keydown', function (e) {
      if (!overlay.hidden) {
        var arrowMap = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 } };
        if (e.key === 'Escape') { e.preventDefault(); closeSnake(); return; }
        if (arrowMap[e.key]) { e.preventDefault(); applyDir(arrowMap[e.key]); return; }
        if (gameOver && e.key === 'Enter') { e.preventDefault(); resetGame(); return; }
        return;
      }
      if (e.key === 'Escape') {
        window.location.href = 'https://fotra.net/';
      }
    });

    var termLog = document.getElementById('termLog');
    var termHelp = {
      sl: ['Ukazi: BACK = nazaj na fotra.net    SNAKE = igra Kača', 'CLS = počisti zaslon    HELP = ta pomoč'],
      en: ['Commands: BACK = back to fotra.net    SNAKE = Snake game', 'CLS = clear screen    HELP = this help']
    };
    var termUnknown = {
      sl: function (c) { return ["'" + c + "' ni prepoznan kot ukaz.", 'Vtipkaj HELP za pomoč.']; },
      en: function (c) { return ["'" + c + "' is not a recognized command.", 'Type HELP for help.']; }
    };
    function termPrint(lines) {
      lines.forEach(function (line) {
        var row = document.createElement('div');
        row.textContent = line;
        termLog.appendChild(row);
      });
      termLog.scrollTop = termLog.scrollHeight;
    }
    function termRunCommand(raw) {
      var cmd = raw.trim();
      if (!cmd) return;
      termPrint(['C:\\FOTRA\\JADRANJE>' + cmd]);
      var norm = cmd.toUpperCase();
      if (norm === 'BACK') {
        termPrint([currentLang === 'sl' ? 'Odpiram ...' : 'Opening ...']);
        window.setTimeout(function () { window.location.href = 'https://fotra.net/'; }, 200);
        return;
      }
      if (norm === 'SNAKE') {
        termPrint([currentLang === 'sl' ? 'Zaganjam KACA.EXE ...' : 'Launching SNAKE.EXE ...']);
        window.setTimeout(openSnake, 200);
        return;
      }
      if (norm === 'HELP' || norm === '?') { termPrint(termHelp[currentLang]); return; }
      if (norm === 'CLS' || norm === 'CLEAR') { termLog.innerHTML = ''; return; }
      termPrint(termUnknown[currentLang](cmd));
    }
    termInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        termRunCommand(termInput.value);
        termInput.value = '';
      }
    });
    document.querySelector('.foot-terminal').addEventListener('click', function () { termInput.focus(); });

    // Deferred: runs after applyLang(initialLang) below, so the greeting
    // prints in the language the page actually loads in.
    setTimeout(function () {
      termPrint([currentLang === 'sl' ? 'Vtipkaj HELP za seznam ukazov.' : 'Type HELP for a list of commands.']);
    }, 0);
  })();

  var initialLang = 'sl';
  try {
    var urlLang = new URLSearchParams(window.location.search).get('lang');
    var storedLang = localStorage.getItem('jadranjeLang');
    if (urlLang === 'en' || urlLang === 'sl') { initialLang = urlLang; }
    else if (storedLang === 'en' || storedLang === 'sl') { initialLang = storedLang; }
  } catch (e) {}

  applyLang(initialLang);
})();
