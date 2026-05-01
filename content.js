const SESSION_KEY = "loopbreaker:v3:active-session";
const SESSION_TIMEOUT_MS = 10 * 60 * 1000;
const DWELL_MS = 550;
const FULLSCREEN_COOLDOWN_MS = 1800;
const MAX_SEEN_REELS = 700;

function getTodayKey() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createFreshSession() {
  return {
    date: getTodayKey(),
    startTime: Date.now(),
    lastActive: Date.now(),
    reelCount: 0,
    seenReels: [],
    reelEvents: [],
    triggeredMilestones: [],
    continueCount: 0,
    lastReelKey: null,
    lastCountAt: 0,
    pendingLock: null
  };
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);

    if (!raw) return createFreshSession();

    const saved = JSON.parse(raw);
    const isSameDay = saved.date === getTodayKey();
    const isRecent = Date.now() - saved.lastActive < SESSION_TIMEOUT_MS;

    if (isSameDay && isRecent) {
      return {
        ...createFreshSession(),
        ...saved
      };
    }

    return createFreshSession();
  } catch {
    return createFreshSession();
  }
}

let savedSession = loadSession();

let reelCount = savedSession.reelCount || 0;
let startTime = savedSession.startTime || Date.now();
let lastReelKey = savedSession.lastReelKey || null;
let lastCountAt = savedSession.lastCountAt || 0;
let modalShown = false;
let lastStatus = "loaded";
let fullscreenCooldownUntil = 0;
let currentCandidateKey = null;
let currentCandidateSince = 0;
let isHardLocked = false;
let sessionEnded = false;

let seenReels = new Set(savedSession.seenReels || []);
let reelEvents = savedSession.reelEvents || [];
let triggeredMilestones = new Set(savedSession.triggeredMilestones || []);
let continueCount = savedSession.continueCount || 0;
let pendingLock = savedSession.pendingLock || null;

const WARNING_MESSAGES = [
  "The algorithm is getting comfortable.",
  "The loop is tightening.",
  "This is where quick breaks become scroll holes.",
  "The feed has no finish line.",
  "Your thumb is on autopilot.",
  "Tiny videos. Huge time leak.",
  "You can stop here and win.",
  "This is the moment the loop usually wins.",
  "Still choosing, or just scrolling?",
  "The next reel is not the exit."
];

const NIGHT_MESSAGES = [
  "Sleep debt mode activated.",
  "You are trading tomorrow’s energy for tonight’s scroll.",
  "Night scroll detected. The loop is stronger now.",
  "Tomorrow-you is watching this decision.",
  "This is the hour where the feed wins quietly."
];

const LEVELS = [
  { min: 0, max: 9, label: "Open Loop", emoji: "↻" },
  { min: 10, max: 19, label: "Tightening", emoji: "↻↻" },
  { min: 20, max: 34, label: "Autopilot", emoji: "↻↻↻" },
  { min: 35, max: 59, label: "Spiral", emoji: "↻↻↻↻" },
  { min: 60, max: 9999, label: "Captured", emoji: "↻↻↻↻↻" }
];

function persistSession() {
  if (sessionEnded) return;

  const seenArray = Array.from(seenReels);

  const state = {
    date: getTodayKey(),
    startTime,
    lastActive: Date.now(),
    reelCount,
    seenReels: seenArray.slice(Math.max(0, seenArray.length - MAX_SEEN_REELS)),
    reelEvents: reelEvents.slice(-250),
    triggeredMilestones: Array.from(triggeredMilestones),
    continueCount,
    lastReelKey,
    lastCountAt,
    pendingLock
  };

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch {
    // If storage fails, the extension still works for the current page session.
  }
}

function clearSession() {
  sessionEnded = true;
  localStorage.removeItem(SESSION_KEY);
}

// Prevent duplicate overlays if the script is reloaded.
document.getElementById("loopbreaker-overlay")?.remove();
document.getElementById("loopbreaker-modal")?.remove();

const overlay = document.createElement("div");
overlay.id = "loopbreaker-overlay";
document.body.appendChild(overlay);

function formatTime(seconds) {
  if (seconds < 60) return `${seconds}s`;

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins < 60) return `${mins}m ${secs}s`;

  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;

  return `${hours}h ${remMins}m`;
}

function getImpactLine() {
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  const reelWord = reelCount === 1 ? "reel" : "reels";

  if (reelCount === 0) {
    return "No reels counted yet.";
  }

  return `${reelCount} ${reelWord} watched in ${formatTime(seconds)}.`;
}

function getWeightLine() {
  if (reelCount >= 100) return "The feed has fully captured the session.";
  if (reelCount >= 75) return "This is a full spiral.";
  if (reelCount >= 50) return "This stopped being casual.";
  if (reelCount >= 35) return "You are deep in the loop.";
  if (reelCount >= 20) return "This is not a break anymore.";
  if (reelCount >= 10) return "The loop is starting to stick.";
  return "Still easy to leave.";
}

function getLevel() {
  return LEVELS.find(level => reelCount >= level.min && reelCount <= level.max) || LEVELS[0];
}

function isNightScroll() {
  const hour = new Date().getHours();
  return hour >= 21 || hour <= 5;
}

function getRecentReelCount(windowMs = 2 * 60 * 1000) {
  const cutoff = Date.now() - windowMs;
  return reelEvents.filter(event => event.time >= cutoff).length;
}

function getLoopPressure() {
  const recent = getRecentReelCount();
  const nightBonus = isNightScroll() ? 14 : 0;
  const continuePenalty = Math.min(30, continueCount * 8);

  return Math.min(
    100,
    Math.round(reelCount * 1.25 + recent * 4 + nightBonus + continuePenalty)
  );
}

function getPressureLabel() {
  const pressure = getLoopPressure();

  if (pressure >= 90) return "Critical";
  if (pressure >= 70) return "Extreme";
  if (pressure >= 50) return "High";
  if (pressure >= 25) return "Building";
  return "Low";
}

function updateUI(status = lastStatus) {
  lastStatus = status;

  const seconds = Math.floor((Date.now() - startTime) / 1000);
  const level = getLevel();
  const pressure = getLoopPressure();
  const pressureLabel = getPressureLabel();

  const nightWarning = isNightScroll()
    ? `<div class="loopbreaker-night">🌙 Night scroll detected</div>`
    : "";

  overlay.innerHTML = `
    <div class="loopbreaker-header">
      <span class="loopbreaker-logo">Loopbreaker</span>
      <span class="loopbreaker-pill">${level.emoji} ${level.label}</span>
    </div>

    <div class="loopbreaker-stats">
      <div>
        <div class="loopbreaker-number">${reelCount}</div>
        <div class="loopbreaker-label">reels watched</div>
      </div>
      <div>
        <div class="loopbreaker-number">${formatTime(seconds)}</div>
        <div class="loopbreaker-label">session</div>
      </div>
    </div>

    <div class="loopbreaker-impact">
      <strong>${getImpactLine()}</strong>
      <span>${getWeightLine()}</span>
    </div>

    <div class="loopbreaker-meter-wrap">
      <div class="loopbreaker-meter-label">
        <span>Loop pressure</span>
        <span>${pressureLabel}</span>
      </div>
      <div class="loopbreaker-meter">
        <div class="loopbreaker-meter-fill" style="width:${pressure}%"></div>
      </div>
    </div>

    <div class="loopbreaker-small">
      ${level.emoji} ${status}
    </div>

    ${nightWarning}

    <div class="loopbreaker-status">
      Refresh will not reset this loop.
    </div>
  `;
}

function pauseAllVideos() {
  document.querySelectorAll("video").forEach(video => {
    try {
      video.pause();
    } catch {
      // Ignore pause failures.
    }
  });
}

function blockIfHardLocked(event) {
  if (!isHardLocked) return;

  const modal = document.getElementById("loopbreaker-modal");

  if (modal && modal.contains(event.target)) {
    return;
  }

  event.preventDefault();
  event.stopImmediatePropagation();
  return false;
}

[
  "wheel",
  "touchstart",
  "touchmove",
  "keydown",
  "mousedown",
  "mouseup",
  "click"
].forEach(eventName => {
  document.addEventListener(eventName, blockIfHardLocked, {
    capture: true,
    passive: false
  });
});

function showSoftNudge(message) {
  updateUI(message);
}

function getMilestonePlan() {
  if (isNightScroll()) {
    return [
      { count: 6, type: "soft", seconds: 0 },
      { count: 15, type: "lock", seconds: 8 },
      { count: 25, type: "lock", seconds: 16 },
      { count: 40, type: "lock", seconds: 30 },
      { count: 60, type: "lock", seconds: 45 },
      { count: 90, type: "lock", seconds: 60 }
    ];
  }

  return [
    { count: 12, type: "soft", seconds: 0 },
    { count: 20, type: "lock", seconds: 7 },
    { count: 35, type: "lock", seconds: 15 },
    { count: 50, type: "lock", seconds: 30 },
    { count: 75, type: "lock", seconds: 45 },
    { count: 100, type: "lock", seconds: 60 }
  ];
}

function makeLockReason() {
  if (isNightScroll()) {
    return NIGHT_MESSAGES[Math.floor(Math.random() * NIGHT_MESSAGES.length)];
  }

  return WARNING_MESSAGES[Math.floor(Math.random() * WARNING_MESSAGES.length)];
}

function createPendingLock(milestone) {
  const penaltySeconds = Math.min(30, continueCount * 5);
  const lockSeconds = milestone.seconds + penaltySeconds;

  pendingLock = {
    milestoneCount: milestone.count,
    reason: makeLockReason(),
    lockSeconds,
    unlockAt: Date.now() + lockSeconds * 1000,
    createdAt: Date.now()
  };

  persistSession();
  return pendingLock;
}

function resolvePendingLockAsContinued(lock) {
  triggeredMilestones.add(lock.milestoneCount);
  pendingLock = null;
  continueCount += 1;
  persistSession();
}

function showHardLock(lock) {
  if (modalShown) return;

  const sessionSeconds = Math.floor((Date.now() - startTime) / 1000);

  modalShown = true;
  isHardLocked = true;

  document.documentElement.classList.add("loopbreaker-hard-locked");
  pauseAllVideos();

  const modal = document.createElement("div");
  modal.id = "loopbreaker-modal";

  modal.innerHTML = `
    <div id="loopbreaker-modal-box">
      <div class="loopbreaker-modal-eyebrow">Pattern interrupt</div>

      <div class="loopbreaker-lock-ring" id="loopbreaker-lock-ring">
        <div class="loopbreaker-lock-inner">
          <span id="loopbreaker-countdown">...</span>
          <small>sec pause</small>
        </div>
      </div>

      <h2>${lock.reason}</h2>

      <p class="loopbreaker-impact-modal">
        <strong>${reelCount}</strong> reels watched in <strong>${formatTime(sessionSeconds)}</strong>.
      </p>

      <p>
        ${getWeightLine()}
      </p>

      <p class="loopbreaker-danger-note">
        The next reel is designed to feel easier than stopping.
      </p>

      <div class="loopbreaker-modal-actions">
        <button id="loopbreaker-continue" disabled>Pause first</button>
        <button id="loopbreaker-exit">Break the loop</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const countdownEl = document.getElementById("loopbreaker-countdown");
  const ringEl = document.getElementById("loopbreaker-lock-ring");
  const continueBtn = document.getElementById("loopbreaker-continue");
  const exitBtn = document.getElementById("loopbreaker-exit");

  let intervalId = null;

  function unlockChoices() {
    isHardLocked = false;
    document.documentElement.classList.remove("loopbreaker-hard-locked");

    continueBtn.disabled = false;

    if (continueCount >= 2) {
      continueBtn.textContent = "I am choosing the loop";
    } else {
      continueBtn.textContent = "Continue intentionally";
    }

    updateUI("choice point");
  }

  function tick() {
    const remainingMs = Math.max(0, lock.unlockAt - Date.now());
    const remainingSeconds = Math.ceil(remainingMs / 1000);

    countdownEl.textContent = String(remainingSeconds);

    const totalMs = Math.max(1, lock.lockSeconds * 1000);
    const progress = Math.max(0, Math.min(100, (remainingMs / totalMs) * 100));

    ringEl.style.setProperty("--lock-progress", `${progress}%`);

    if (remainingMs > 0) {
      pauseAllVideos();
      return;
    }

    clearInterval(intervalId);
    unlockChoices();
  }

  continueBtn.onclick = () => {
    if (isHardLocked) return;

    clearInterval(intervalId);
    modal.remove();
    modalShown = false;

    resolvePendingLockAsContinued(lock);
    updateUI("continued intentionally");
  };

  exitBtn.onclick = () => {
    clearInterval(intervalId);
    isHardLocked = false;
    document.documentElement.classList.remove("loopbreaker-hard-locked");

    showExitSummary(modal);
  };

  intervalId = setInterval(tick, 250);
  tick();
}

function showExitSummary(existingModal) {
  const seconds = Math.floor((Date.now() - startTime) / 1000);

  pendingLock = null;
  persistSession();

  existingModal.innerHTML = `
    <div id="loopbreaker-modal-box">
      <div class="loopbreaker-modal-eyebrow">Session ended</div>
      <h2>You broke the loop.</h2>

      <p class="loopbreaker-impact-modal">
        <strong>${reelCount}</strong> reels watched in <strong>${formatTime(seconds)}</strong>.
      </p>

      <p>
        You stopped before the feed did.
      </p>

      <p class="loopbreaker-danger-note">
        Breaking here counts. The feed was not going to stop for you.
      </p>

      <div class="loopbreaker-modal-actions">
        <button id="loopbreaker-close">Close Instagram</button>
      </div>
    </div>
  `;

  document.getElementById("loopbreaker-close").onclick = () => {
    clearSession();
    window.location.href = "https://www.google.com";
  };
}

function maybeShowWarning() {
  if (modalShown) return;

  const milestones = getMilestonePlan();

  for (const milestone of milestones) {
    if (reelCount < milestone.count) continue;
    if (triggeredMilestones.has(milestone.count)) continue;

    if (milestone.type === "soft") {
      triggeredMilestones.add(milestone.count);
      persistSession();

      showSoftNudge(makeLockReason());
      return;
    }

    const lock = createPendingLock(milestone);
    showHardLock(lock);
    return;
  }

  const endgameStart = isNightScroll() ? 105 : 125;
  const endgameStep = isNightScroll() ? 15 : 25;

  if (reelCount >= endgameStart) {
    const endgameMilestone =
      endgameStart + Math.floor((reelCount - endgameStart) / endgameStep) * endgameStep;

    const key = `endgame:${endgameMilestone}`;

    if (!triggeredMilestones.has(key)) {
      triggeredMilestones.add(key);
      persistSession();

      const lock = {
        milestoneCount: key,
        reason: isNightScroll()
          ? "Night spiral. This needs a real stop."
          : "You passed the final checkpoint. The loop is still going.",
        lockSeconds: 60,
        unlockAt: Date.now() + 60 * 1000,
        createdAt: Date.now()
      };

      pendingLock = lock;
      persistSession();
      showHardLock(lock);
    }
  }
}

// ---------- Visibility ----------
function getVisibleRatio(element) {
  const rect = element.getBoundingClientRect();

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

  const visibleTop = Math.max(rect.top, 0);
  const visibleLeft = Math.max(rect.left, 0);
  const visibleBottom = Math.min(rect.bottom, viewportHeight);
  const visibleRight = Math.min(rect.right, viewportWidth);

  const visibleWidth = Math.max(0, visibleRight - visibleLeft);
  const visibleHeight = Math.max(0, visibleBottom - visibleTop);

  const visibleArea = visibleWidth * visibleHeight;
  const totalArea = Math.max(1, rect.width * rect.height);

  return visibleArea / totalArea;
}

function getMostVisibleVideo() {
  const videos = Array.from(document.querySelectorAll("video"));

  let bestVideo = null;
  let bestRatio = 0;

  for (const video of videos) {
    const rect = video.getBoundingClientRect();

    if (rect.width < 150 || rect.height < 150) continue;

    const ratio = getVisibleRatio(video);

    if (ratio > bestRatio) {
      bestRatio = ratio;
      bestVideo = video;
    }
  }

  if (bestRatio < 0.28) return null;

  return bestVideo;
}

// ---------- Stable Reel Identity ----------
function getReelIdFromUrl() {
  const match =
    location.pathname.match(/\/reel\/([^/?#]+)/) ||
    location.pathname.match(/\/reels\/([^/?#]+)/);

  return match ? match[1] : "";
}

function getReelIdFromNearbyLinks(video) {
  let node = video;

  for (let depth = 0; depth < 8 && node; depth++) {
    if (node.querySelectorAll) {
      const links = Array.from(node.querySelectorAll('a[href*="/reel/"]'));

      for (const link of links) {
        const href = link.getAttribute("href") || "";
        const match = href.match(/\/reel\/([^/?#]+)/);

        if (match && match[1]) {
          return match[1];
        }
      }
    }

    node = node.parentElement;
  }

  return "";
}

function cleanMediaUrl(url) {
  if (!url) return "";

  try {
    const parsed = new URL(url, location.origin);
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return url.split("?")[0].split("#")[0];
  }
}

function normalizeText(text) {
  return (text || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function getReelKey(video) {
  const reelIdFromUrl = getReelIdFromUrl();

  if (reelIdFromUrl) {
    return `url:${reelIdFromUrl}`;
  }

  const reelIdFromNearbyLinks = getReelIdFromNearbyLinks(video);

  if (reelIdFromNearbyLinks) {
    return `link:${reelIdFromNearbyLinks}`;
  }

  const src = cleanMediaUrl(
    video.currentSrc ||
    video.src ||
    video.getAttribute("src") ||
    ""
  );

  if (src) {
    return `src:${src}`;
  }

  const poster = cleanMediaUrl(
    video.poster ||
    video.getAttribute("poster") ||
    ""
  );

  if (poster) {
    return `poster:${poster}`;
  }

  const ariaLabel = normalizeText(video.getAttribute("aria-label") || "");
  const articleText = normalizeText(video.closest("article")?.innerText || "");

  if (ariaLabel || articleText) {
    return `text:${ariaLabel}|${articleText}`;
  }

  return "";
}

// ---------- Counting ----------
function recordReel(reelKey) {
  const now = Date.now();

  if (now - lastCountAt < 700) {
    return;
  }

  lastReelKey = reelKey;
  lastCountAt = now;

  if (seenReels.has(reelKey)) {
    updateUI("already counted");
    persistSession();
    return;
  }

  seenReels.add(reelKey);
  reelCount++;

  reelEvents.push({
    key: reelKey,
    time: now
  });

  const tenMinutesAgo = now - 10 * 60 * 1000;

  while (reelEvents.length && reelEvents[0].time < tenMinutesAgo) {
    reelEvents.shift();
  }

  updateUI("new reel");
  persistSession();
  maybeShowWarning();
}

function checkReelChange() {
  if (modalShown || isHardLocked) return;

  const now = Date.now();

  const isInstagram = location.hostname.includes("instagram.com");
  const hasVideos = document.querySelectorAll("video").length > 0;

  const isReelsContext =
  location.pathname.includes("/reels") ||
  location.pathname.includes("/reel/") ||
  hasVideos;
  
  if (!isInstagram || !isReelsContext) {
    updateUI("idle");
    return;
  }
  if (document.fullscreenElement || now < fullscreenCooldownUntil) {
    updateUI("fullscreen ignored");
    return;
  }

  
  const video = getMostVisibleVideo();

  if (!video) {
    updateUI("looking...");
    return;
  }

  if (video.paused) {
    updateUI("not playing");
    return;
  }

  const reelKey = getReelKey(video);

  if (!reelKey) {
    updateUI("weak signal");
    return;
  }

  if (reelKey !== currentCandidateKey) {
    currentCandidateKey = reelKey;
    currentCandidateSince = now;

    if (seenReels.has(reelKey)) {
      updateUI("already counted");
    } else {
      updateUI("confirming reel...");
    }

    return;
  }

  const dwellTime = now - currentCandidateSince;

  if (dwellTime < DWELL_MS) {
    if (seenReels.has(reelKey)) {
      updateUI("already counted");
    } else {
      updateUI("confirming reel...");
    }

    return;
  }

  if (!lastReelKey || reelKey !== lastReelKey) {
    recordReel(reelKey);
    return;
  }

  updateUI("watching");
}

// ---------- Fullscreen Guard ----------
document.addEventListener("fullscreenchange", () => {
  fullscreenCooldownUntil = Date.now() + FULLSCREEN_COOLDOWN_MS;
  updateUI("fullscreen ignored");
});

// ---------- Resume pending lock after refresh ----------
setTimeout(() => {
  if (pendingLock) {
    showHardLock(pendingLock);
  }
}, 500);

// ---------- Run ----------
setInterval(checkReelChange, 600);

setInterval(() => {
  persistSession();
  updateUI();
  maybeShowWarning();
}, 1000);

window.addEventListener(
  "scroll",
  () => {
    setTimeout(checkReelChange, 250);
  },
  true
);

window.addEventListener("beforeunload", () => {
  persistSession();
});

updateUI("loaded");