<p align="center">
  <img src="loopbreaker-banner.jpg" alt="Loopbreaker banner" width="760">
</p>

<h1 align="center">Loopbreaker</h1>

<p align="center">
  <b>See the loop. Break the loop.</b>
</p>

<p align="center">
  <i>A browser extension that counts short-form videos like Instagram Reels and YouTube Shorts in real time, then interrupts compulsive scrolling before it becomes a doom-scroll loop.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-active-44ff99?style=for-the-badge" alt="status badge">
  <img src="https://img.shields.io/badge/version-V3-black?style=for-the-badge" alt="version badge">
  <img src="https://img.shields.io/badge/privacy-local%20only-blue?style=for-the-badge" alt="privacy badge">
  <img src="https://img.shields.io/badge/platform-Brave%20%7C%20Chrome-orange?style=for-the-badge" alt="platform badge">
  <img src="https://img.shields.io/badge/supports-Instagram%20%7C%20YouTube-red?style=for-the-badge" alt="supported platforms badge">
</p>

---


## The idea

Short-form video feeds are addiction loops disguised as entertainment.

There is a reason this feels hard to stop.

Some of the smartest product, design, and machine-learning teams in the world are paid to remove every point of friction between you and the next video.

The feed does not end.  
It does not pause.  
It does not ask if you meant to keep going.  
It does not care whether this was supposed to be a five-minute break.

It just serves the next reel.

They just serve the next reel.

You open Instagram or YouTube for a quick break.  
You scroll once.  
Then again.  
Then again.

At some point, you are no longer choosing.

You are just inside the loop.

Before you notice it, the “quick break” has become:

```text
30 reels watched in 46s.
This is not a break anymore.

Loopbreaker exists for that moment.

Most screen-time apps are post-mortems.
They tell you at night that you wasted three hours.

Loopbreaker is different.

It interrupts the addiction loop while it is happening.

It counts the reels.
It shows the time.
It measures loop pressure.
Then it forces friction before the next video can pull you deeper.

Research on short-video addiction points to the real risk signals: prolonged watch time, excessive video consumption, late-night usage, reduced content diversity, loss of time awareness, and repeated difficulty stopping. Loopbreaker turns those signals into real-time intervention.

It is built on one belief:

You do not beat infinite scroll with willpower alone.
You beat it by adding a stopping point where the platform removed one.

Loopbreaker is not just a counter.

It is an addiction-killer for Reels-style feeds.

The feed has no finish line.

Loopbreaker gives you one.
---

## What Loopbreaker does

Loopbreaker runs on Instagram Web and shows a floating overlay while you scroll.

It tracks:

| Signal | Meaning |
|---|---|
| Reels watched | How many unique reels/videos you consumed |
| Active watch time | How long you were actually watching, not just leaving the tab open |
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

The overlay constantly shows the number of reels watched and active session time.

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

At key reel-count and active-watch-time milestones, Loopbreaker pauses videos and blocks scrolling for a short countdown.

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

### Endgame mode

After the final checkpoint, Loopbreaker keeps applying pressure instead of going silent.

| Mode | Endgame behavior |
|---|---|
| Normal | After 100 reels, every +25 reels triggers another 60 second pause-lock |
| Night | After 90 reels, every +15 reels triggers another 60 second pause-lock |

Example night messages:

```text
Sleep debt mode activated.
You are trading tomorrow’s energy for tonight’s scroll.
Night scroll detected. The loop is stronger now.
```
### Time-based interventions

Loopbreaker does not only count reels. It also watches for long active sessions.

A user scrolling slowly for 30 minutes is still inside the loop, even if the reel count is not exploding.

Loopbreaker therefore triggers interventions based on **active watch time** too.

Active watch time only counts when:

- the supported tab is visible
- the browser window is focused
- the user is on a supported Reels/Shorts page
- a video is actually playing
- the user is not inside a pause-lock modal

This prevents unfair lockouts when Instagram or YouTube is simply open in the background.

#### Normal mode

| Active watch time | Intervention |
|---:|---|
| 5 min | Soft interrupt |
| 10 min | 10 second pause-lock |
| 20 min | 30 second pause-lock |
| 30 min | 60 second pause-lock |
| Every +10 min after | 60 second pause-lock |

#### Night mode

| Active watch time | Intervention |
|---:|---|
| 3 min | Soft interrupt |
| 8 min | 10 second pause-lock |
| 15 min | 25 second pause-lock |
| 25 min | 45 second pause-lock |
| Every +5 min after | 60 second pause-lock |
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

### Soft warnings were too easy to miss

Early soft warnings only appeared as small text inside the floating overlay.

That was too weak. Users could easily ignore the first warning and keep scrolling.

**Fix:** Soft warnings now use a visible interrupt modal.

The first warning does not lock the user, but it pauses the video and forces a moment of awareness before the user continues.

This creates a lighter intervention before the stronger pause-locks begin.

### Story videos false counts

Instagram Stories can also contain videos, and earlier detection treated them like Reels.

**Fix:** Loopbreaker now ignores Story contexts so watching a Story video does not unfairly increase the Reel counter.

---

### Same content, different identity

Instagram can show the same Reel through different surfaces.

For example:

```text
Feed preview  → counted by video source/poster
Clicked Reel  → counted by /reel/<id>
Back navigation → may expose a different DOM/video key
```
Earlier versions could accidentally count the same content twice when a user watched a video in the feed, clicked into it, or returned to it later.

Fix: Loopbreaker now uses both:

canonical Reel keys
media fingerprints

This means the same video is recognized even if Instagram changes how it appears in the DOM.

---
### Background tab unfairness

A user should not be punished just because Instagram or YouTube was left open in another tab.

Earlier versions used wall-clock session time, which meant the timer could keep growing even if the user was not actively watching.

**Fix:** Loopbreaker now tracks active watch time instead of raw time.

Active watch time only increases when the page is visible, the browser window is focused, the user is on a supported Reels/Shorts context, and a video is actually playing.

This makes the timer fairer:

```text
Good: 10 minutes actively watching Reels
Bad: 10 minutes with Instagram open in the background
```
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

### Loopbreaker V3 — Multi-platform stability + intervention

CCurrent version includes:

- Instagram Reels support
- Instagram feed video support
- YouTube Shorts support
- unique video counting
- media fingerprinting
- per-platform sessions
- session persistence
- hard pause-locks
- visible soft interrupt modals
- loop pressure meter
- active watch-time tracking
- time-based interventions
- time endgame mode
- focused-tab detection
- background-tab protection
- night mode
- local-only tracking


---
## Known limitations

Loopbreaker is still experimental.

- Works only on Instagram Web/Youtube web for now
- Native Instagram/Youtube mobile app tracking is not supported yet
- Active watch-time detection depends on browser focus and visible playback state
- Feed detection is heuristic and may still need tuning as Instagram changes its UI
- No settings page yet
- No daily dashboard yet
- No Chrome Web Store release yet

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