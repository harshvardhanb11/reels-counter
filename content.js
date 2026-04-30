let reelCount = 0;
let startTime = Date.now();
let lastReelKey = null;
let lastCountAt = 0;
let modalShown = false;
let nextWarningAt = 10;
let lastStatus = "loaded";

const WARNING_MESSAGES = [
  "You said “just one” a while ago.",
  "The algorithm is getting comfortable.",
  "You are not watching reels. Reels are watching you.",
  "Tiny videos. Huge time leak.",
  "This stopped being a break.",
  "The loop noticed you.",
  "You could leave right now and win.",
  "Still here? Interesting choice.",
  "Your thumb is on autopilot.",
  "The feed has no finish line."
];

const LEVELS = [
  { min: 0, label: "Calm", emoji: "🟢", max: 9 },
  { min: 10, label: "Looping", emoji: "🟡", max: 19 },
  { min: 20, label: "Doom Mode", emoji: "🟠", max: 34 },
  { min: 35, label: "Lost in the Sauce", emoji: "🔴", max: 999 }
];

// ---------- UI ----------
const overlay = document.createElement("div");
overlay.id = "loopbreaker-overlay";
document.body.appendChild(overlay);

function formatTime(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function getLevel() {
  return LEVELS.find(level => reelCount >= level.min && reelCount <= level.max) || LEVELS[0];
}

function getLoopPercent() {
  const percent = Math.min(100, Math.round((reelCount / 35) * 100));
  return percent;
}

function getReelsPerHour() {
  const seconds = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
  return Math.round((reelCount / seconds) * 3600);
}

function isNightScroll() {
  const hour = new Date().getHours();
  return hour >= 21 || hour <= 5;
}

function updateUI(status = lastStatus) {
  lastStatus = status;

  const seconds = Math.floor((Date.now() - startTime) / 1000);
  const level = getLevel();
  const percent = getLoopPercent();
  const pace = getReelsPerHour();

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
        <div class="loopbreaker-label">reels</div>
      </div>
      <div>
        <div class="loopbreaker-number">${formatTime(seconds)}</div>
        <div class="loopbreaker-label">session</div>
      </div>
    </div>

    <div class="loopbreaker-meter-wrap">
      <div class="loopbreaker-meter-label">
        <span>Loop level</span>
        <span>${percent}%</span>
      </div>
      <div class="loopbreaker-meter">
        <div class="loopbreaker-meter-fill" style="width:${percent}%"></div>
      </div>
    </div>

    <div class="loopbreaker-small">
      ⚡ ${pace} reels/hour pace
    </div>

    ${nightWarning}

    <div class="loopbreaker-status">${status}</div>
  `;
}

// ---------- Modal ----------
function showModal(reason = "You are deep in the loop.") {
  if (modalShown) return;
  modalShown = true;

  const seconds = Math.floor((Date.now() - startTime) / 1000);
  const pace = getReelsPerHour();

  const modal = document.createElement("div");
  modal.id = "loopbreaker-modal";

  modal.innerHTML = `
    <div id="loopbreaker-modal-box">
      <div class="loopbreaker-modal-eyebrow">Reality check</div>
      <h2>${reason}</h2>
      <p>You’ve watched <strong>${reelCount}</strong> reels in <strong>${formatTime(seconds)}</strong>.</p>
      <p>Current pace: <strong>${pace} reels/hour</strong>.</p>

      <div class="loopbreaker-modal-actions">
        <button id="loopbreaker-continue">5 more reels</button>
        <button id="loopbreaker-exit">Break the loop</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("loopbreaker-continue").onclick = () => {
    modal.remove();
    modalShown = false;
    nextWarningAt = reelCount + 5;
    updateUI("you chose 5 more");
  };

  document.getElementById("loopbreaker-exit").onclick = () => {
    showExitSummary(modal);
  };
}

function showExitSummary(existingModal) {
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  const pace = getReelsPerHour();

  existingModal.innerHTML = `
    <div id="loopbreaker-modal-box">
      <div class="loopbreaker-modal-eyebrow">Session ended</div>
      <h2>You broke the loop.</h2>
      <p>You watched <strong>${reelCount}</strong> reels.</p>
      <p>Total session: <strong>${formatTime(seconds)}</strong>.</p>
      <p>That was about <strong>${pace} reels/hour</strong>.</p>

      <div class="loopbreaker-modal-actions">
        <button id="loopbreaker-close">Close Instagram</button>
      </div>
    </div>
  `;

  document.getElementById("loopbreaker-close").onclick = () => {
    window.location.href = "https://www.google.com";
  };
}

// ---------- Detection ----------
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

  if (bestRatio < 0.35) return null;

  return bestVideo;
}

function getReelKey(video) {
  const rect = video.getBoundingClientRect();

  const src =
    video.currentSrc ||
    video.src ||
    video.getAttribute("src") ||
    "";

  const poster =
    video.poster ||
    video.getAttribute("poster") ||
    "";

  const ariaLabel =
    video.getAttribute("aria-label") ||
    "";

  const articleText =
    video.closest("article")?.innerText ||
    "";

  const reelUrlMatch = location.pathname.match(/\/reel\/([^/]+)/);
  const reelIdFromUrl = reelUrlMatch ? reelUrlMatch[1] : "";

  return [
    reelIdFromUrl,
    src.slice(0, 120),
    poster.slice(0, 120),
    ariaLabel.slice(0, 80),
    articleText.slice(0, 120),
    Math.round(rect.width),
    Math.round(rect.height)
  ].join("|");
}

function maybeShowWarning() {
  if (reelCount < nextWarningAt) return;

  const message = WARNING_MESSAGES[Math.floor(Math.random() * WARNING_MESSAGES.length)];
  nextWarningAt += 10;

  if (reelCount >= 20 || isNightScroll()) {
    showModal(message);
  } else {
    updateUI(message);
  }
}

function checkReelChange() {
  const isInstagram = location.hostname.includes("instagram.com");
  const isProbablyReels =
    location.pathname.includes("/reels") ||
    location.pathname.includes("/reel/") ||
    document.querySelectorAll("video").length > 0;

  if (!isInstagram || !isProbablyReels) {
    updateUI("not reels");
    return;
  }

  const video = getMostVisibleVideo();

  if (!video) {
    updateUI("looking...");
    return;
  }

  const reelKey = getReelKey(video);

  if (!reelKey || reelKey === "||||||") {
    updateUI("weak signal");
    return;
  }

  const now = Date.now();

  if (!lastReelKey) {
    lastReelKey = reelKey;
    reelCount = 1;
    lastCountAt = now;
    updateUI("detected");
    return;
  }

  if (reelKey !== lastReelKey && now - lastCountAt > 800) {
    lastReelKey = reelKey;
    reelCount++;
    lastCountAt = now;

    updateUI("new reel");
    maybeShowWarning();
  } else {
    updateUI("watching");
  }
}

// ---------- Run ----------
setInterval(checkReelChange, 500);
setInterval(() => updateUI(), 1000);

window.addEventListener(
  "scroll",
  () => {
    setTimeout(checkReelChange, 150);
  },
  true
);

updateUI("loaded");



// let reelCount = 0;
// let startTime = Date.now();
// let lastReelKey = null;
// let lastCountAt = 0;
// let modalShown = false;

// // ---------- Overlay ----------
// const overlay = document.createElement("div");
// overlay.id = "reels-counter-overlay";
// document.body.appendChild(overlay);

// function formatTime(seconds) {
//   if (seconds < 60) return `${seconds}s`;
//   const mins = Math.floor(seconds / 60);
//   const secs = seconds % 60;
//   return `${mins}m ${secs}s`;
// }

// function updateUI(status = "") {
//   const seconds = Math.floor((Date.now() - startTime) / 1000);

//   overlay.innerText =
//     `🎯 ${reelCount} reels\n` +
//     `⏱ ${formatTime(seconds)}` +
//     (status ? `\n${status}` : "");
// }

// // ---------- Modal ----------
// function showModal() {
//   if (modalShown) return;
//   modalShown = true;

//   const modal = document.createElement("div");
//   modal.id = "reels-modal";

//   modal.innerHTML = `
//     <div id="reels-modal-box">
//       <h2>Pause.</h2>
//       <p>You’ve watched ${reelCount} reels.</p>
//       <p>Did you actually choose the last few?</p>
//       <button id="continue-btn">Continue</button>
//       <button id="exit-btn">Exit Instagram</button>
//     </div>
//   `;

//   document.body.appendChild(modal);

//   document.getElementById("continue-btn").onclick = () => {
//     modal.remove();
//     modalShown = false;

//     // Do NOT reset count anymore.
//     // Just let them continue and warn again later.
//     updateUI("continued");
//   };

//   document.getElementById("exit-btn").onclick = () => {
//     window.location.href = "https://www.google.com";
//   };
// }

// // ---------- Visibility ----------
// function getVisibleRatio(element) {
//   const rect = element.getBoundingClientRect();

//   const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
//   const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

//   const visibleTop = Math.max(rect.top, 0);
//   const visibleLeft = Math.max(rect.left, 0);
//   const visibleBottom = Math.min(rect.bottom, viewportHeight);
//   const visibleRight = Math.min(rect.right, viewportWidth);

//   const visibleWidth = Math.max(0, visibleRight - visibleLeft);
//   const visibleHeight = Math.max(0, visibleBottom - visibleTop);

//   const visibleArea = visibleWidth * visibleHeight;
//   const totalArea = Math.max(1, rect.width * rect.height);

//   return visibleArea / totalArea;
// }

// function getMostVisibleVideo() {
//   const videos = Array.from(document.querySelectorAll("video"));

//   let bestVideo = null;
//   let bestRatio = 0;

//   for (const video of videos) {
//     const rect = video.getBoundingClientRect();

//     if (rect.width < 150 || rect.height < 150) continue;

//     const ratio = getVisibleRatio(video);

//     if (ratio > bestRatio) {
//       bestRatio = ratio;
//       bestVideo = video;
//     }
//   }

//   if (bestRatio < 0.35) return null;

//   return bestVideo;
// }

// // ---------- Reel Identity ----------
// function getReelKey(video) {
//   const rect = video.getBoundingClientRect();

//   const src =
//     video.currentSrc ||
//     video.src ||
//     video.getAttribute("src") ||
//     "";

//   const poster =
//     video.poster ||
//     video.getAttribute("poster") ||
//     "";

//   const ariaLabel =
//     video.getAttribute("aria-label") ||
//     "";

//   const articleText =
//     video.closest("article")?.innerText ||
//     "";

//   const pagePath = location.pathname;

//   /**
//    * Instagram often changes /reel/<id>/ while scrolling.
//    * That is actually useful for counting.
//    * We use it as the strongest signal.
//    */
//   const reelUrlMatch = pagePath.match(/\/reel\/([^/]+)/);
//   const reelIdFromUrl = reelUrlMatch ? reelUrlMatch[1] : "";

//   return [
//     reelIdFromUrl,
//     src.slice(0, 120),
//     poster.slice(0, 120),
//     ariaLabel.slice(0, 80),
//     articleText.slice(0, 120),
//     Math.round(rect.width),
//     Math.round(rect.height)
//   ].join("|");
// }

// // ---------- Core Detection ----------
// function checkReelChange() {
//   const isInstagram = location.hostname.includes("instagram.com");
//   const isProbablyReels =
//     location.pathname.includes("/reels") ||
//     location.pathname.includes("/reel/") ||
//     document.querySelectorAll("video").length > 0;

//   if (!isInstagram || !isProbablyReels) {
//     updateUI("not reels");
//     return;
//   }

//   const video = getMostVisibleVideo();

//   if (!video) {
//     updateUI("looking...");
//     return;
//   }

//   const reelKey = getReelKey(video);

//   if (!reelKey || reelKey === "||||||") {
//     updateUI("weak signal");
//     return;
//   }

//   const now = Date.now();

//   if (!lastReelKey) {
//     lastReelKey = reelKey;
//     reelCount = 1;
//     lastCountAt = now;
//     updateUI("detected");
//     return;
//   }

//   if (reelKey !== lastReelKey && now - lastCountAt > 800) {
//     lastReelKey = reelKey;
//     reelCount++;
//     lastCountAt = now;

//     updateUI("new reel");

//     const timeSpent = (Date.now() - startTime) / 1000;

//     if (reelCount >= 20 || timeSpent >= 600) {
//       showModal();
//     }
//   } else {
//     updateUI("watching");
//   }
// }

// // ---------- Run ----------
// setInterval(checkReelChange, 500);
// setInterval(() => updateUI("watching"), 1000);

// window.addEventListener(
//   "scroll",
//   () => {
//     setTimeout(checkReelChange, 150);
//   },
//   true
// );

// updateUI("loaded");