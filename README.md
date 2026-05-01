<p align="center">
  <img src="loopbreaker-banner.jpg" alt="Loopbreaker banner" width="760">
</p>

<h1 align="center">Loopbreaker</h1>

<p align="center">
  <b>See the loop. Break the loop.</b>
</p>

<p align="center">
  <i>A browser extension that counts Instagram Reels in real time and interrupts compulsive scrolling before it becomes a doom-scroll loop.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-active-44ff99?style=for-the-badge" alt="status badge">
  <img src="https://img.shields.io/badge/version-V3-black?style=for-the-badge" alt="version badge">
  <img src="https://img.shields.io/badge/privacy-local%20only-blue?style=for-the-badge" alt="privacy badge">
  <img src="https://img.shields.io/badge/platform-Brave%20%7C%20Chrome-orange?style=for-the-badge" alt="platform badge">
</p>

---

## The idea

Instagram Reels have no finish line.

You open the app for a quick break.  
You scroll once.  
Then again.  
Then again.

Before you notice it, the “quick break” has become:

```text
30 reels watched in 46s.
This is not a break anymore.
```

**Loopbreaker adds the missing stopping point.**

It does not just track screen time.  
It interrupts the scroll loop while it is happening.

---

## What Loopbreaker does

Loopbreaker runs on Instagram Web and shows a floating overlay while you scroll.

It tracks:

| Signal | Meaning |
|---|---|
| Reels watched | How many unique reels/videos you consumed |
| Session time | How long the current scroll session has lasted |
| Loop pressure | How deep you are in the scroll loop |
| Night scroll | Whether you are scrolling during high-risk late-night hours |
| Continue behavior | Whether you keep choosing to stay in the loop |

When the loop becomes strong enough, Loopbreaker creates friction:

- pauses the video
- blocks scrolling
- shows a countdown
- disables “continue” temporarily
- then gives you a choice

```text
Continue intentionally
Break the loop
```

The goal is not to shame you.

The goal is to break autopilot.

---

## Core features

### Real-time Reel counter

Counts unique reels watched on Instagram Web.

Works on:

- Instagram Reels page
- Instagram feed section
- playable videos inside the feed

---

### Session timer

Shows how long the current scroll session has lasted.

```text
12 reels watched in 2m 10s.
```

This makes the cost of scrolling visible immediately.

---

### Loop Pressure meter

Instead of boring analytics, Loopbreaker turns behavior into a visual pressure state.

```text
Loop Pressure: Extreme
█████████░
```

Loop pressure is based on:

- total reels watched
- recent scrolling intensity
- night usage
- repeated continue behavior

The longer you stay, the tighter the loop gets.

---

### Loop stages

Loopbreaker escalates as the session gets heavier.

| Reels watched | State |
|---:|---|
| 0–9 | Open Loop |
| 10–19 | Tightening |
| 20–34 | Autopilot |
| 35–59 | Spiral |
| 60+ | Captured |

It does not say:

```text
You are addicted.
```

It says:

```text
The loop is getting stronger.
```

---

## How Loopbreaker breaks the loop

Loopbreaker uses four layers.

### 1. Awareness

The overlay constantly shows the number of reels watched and session time.

```text
24 reels watched in 5m 12s.
```

The invisible becomes visible.

---

### 2. Emotional weight

Loopbreaker adds short lines that make the number feel real.

```text
This is not a break anymore.
You are deep in the loop.
This stopped being casual.
The feed has fully captured the session.
```

The number creates accountability.  
The line gives it weight.

---

### 3. Friction

At key milestones, Loopbreaker pauses videos and blocks scrolling for a short countdown.

This is the core intervention.

The feed is designed to remove friction.  
Loopbreaker puts friction back.

---

### 4. Choice

After the pause, you choose:

```text
Continue intentionally
Break the loop
```

The product does not remove your choice.  
It gives your choice back.

---

## Intervention thresholds

### Normal mode

| Reels watched | Intervention |
|---:|---|
| 12 | Soft warning |
| 20 | 7 second pause-lock |
| 35 | 15 second pause-lock |
| 50 | 30 second pause-lock |
| 75 | 45 second pause-lock |
| 100 | 60 second pause-lock |

### Night mode

Night scrolling is treated as higher risk, so Loopbreaker intervenes earlier.

| Reels watched | Intervention |
|---:|---|
| 6 | Soft warning |
| 15 | 8 second pause-lock |
| 25 | 16 second pause-lock |
| 40 | 30 second pause-lock |
| 60 | 45 second pause-lock |
| 90 | 60 second pause-lock |

Example night messages:

```text
Sleep debt mode activated.
You are trading tomorrow’s energy for tonight’s scroll.
Night scroll detected. The loop is stronger now.
```

---

## Technical problems solved

### Duplicate counting

Early versions counted the same reel again when scrolling up and down.

**Fix:** Loopbreaker now uses a `seenReels` set and stable reel keys.

Stable signals include:

- `/reel/<id>` from the URL
- nearby reel links
- video source fallback
- poster fallback
- text fallback

Once a reel is counted, it is not counted again in the same active session.

---

### Fullscreen false counts

Fullscreen changed the video layout and caused false counts.

**Fix:** Loopbreaker ignores counting during fullscreen and for a short cooldown after fullscreen changes.

---

### Instagram feed support

The first working version only ran properly on `/reels/`.

**Fix:** Loopbreaker now detects playable videos and works on the feed too.

---

### Refresh reset

Refreshing used to wipe the counter.

That was bad because refresh became a cheat code.

**Fix:** Active session state is stored in `localStorage`.

Loopbreaker restores:

- reel count
- session time
- seen reels
- triggered milestones
- pending lock state
- continue count

Refresh does not reset the loop.

---

### Passive reminders

Normal reminders are easy to ignore.

**Fix:** Loopbreaker uses pause-locks instead of weak popups.

When the loop gets strong enough, the app blocks interaction briefly and forces a real pause.

---

## Example messages

Loopbreaker uses playful but uncomfortable copy.

```text
The algorithm is getting comfortable.
The loop is tightening.
This is where quick breaks become scroll holes.
The feed has no finish line.
Your thumb is on autopilot.
Tiny videos. Huge time leak.
You can stop here and win.
This is the moment the loop usually wins.
Still choosing, or just scrolling?
The next reel is not the exit.
```

---

## Privacy

Loopbreaker does not send data anywhere.

All tracking stays locally in your browser.

Loopbreaker does **not** collect:

- usernames
- passwords
- messages
- likes
- comments
- account data
- browsing history outside Instagram

Stored locally:

- active session state
- counted reel keys
- triggered milestones
- continue count
- pending lock state

---

## Installation

Loopbreaker currently runs as an unpacked browser extension.

### 1. Clone the repository

```bash
git clone https://github.com/harshvardhanb11/reels-counter.git
```

### 2. Open your browser extensions page

For Brave:

```text
brave://extensions/
```

For Chrome:

```text
chrome://extensions/
```

### 3. Enable Developer Mode

Turn on **Developer Mode**.

### 4. Load the extension

Click:

```text
Load unpacked
```

Then select the project folder.

### 5. Open Instagram

```text
https://www.instagram.com/
```

or:

```text
https://www.instagram.com/reels/
```

---

## File structure

```text
reels-counter/
├── manifest.json
├── content.js
├── overlay.css
├── README.md
└── loopbreaker-banner.jpg
```

| File | Purpose |
|---|---|
| `manifest.json` | Defines the extension and injects scripts into Instagram |
| `content.js` | Reel detection, counting, persistence, locks, night mode |
| `overlay.css` | Floating overlay, modal UI, countdown ring |
| `loopbreaker-banner.jpg` | README hero banner |

---

## Reset session for testing

Paste this in Instagram DevTools console:

```js
localStorage.removeItem("loopbreaker:v3:active-session");
location.reload();
```

---

## Current status

### Loopbreaker V3 — Stability + Intervention

Current version includes:

- unique Reel counting
- feed + Reels support
- session persistence
- hard pause-locks
- loop pressure meter
- night mode
- local-only tracking

---

## Roadmap

### V3.5 — Watched vs skimmed detection

Track:

- watched reels
- skimmed reels
- skipped reels

This will make the counter more meaningful.

---

### V4 — Daily dashboard

Add:

- total reels today
- total time today
- number of sessions
- longest loop of the day
- total night reels

---

### V5 — Shareable recap

Generate recap cards like:

```text
I broke the loop after 37 reels.
Can you beat that?
```

---

### V6 — Loop Duel

Friend accountability mode.

Possible scoring:

- fewer reels watched
- earlier exit wins
- fewer night reels
- longer no-scroll streak

The goal is not shame.  
The goal is social accountability.

---

### V7 — Android app

A native Android version could use Accessibility APIs to track Reels inside the actual Instagram app.

Possible features:

- real app-level Reel tracking
- overlay bubble
- app blocking after limits
- friend duels
- daily stats
- lock-screen reminders

---

## Product philosophy

The feed has no finish line.

Loopbreaker gives you one.

<p align="center">
  <b>The next reel is not the exit.</b>
</p>