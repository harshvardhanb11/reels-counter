
<p align="center">
  <img src="loopbreaker-banner.jpg" alt="Loopbreaker banner: Break the pattern today or the loop will repeat tomorrow" width="700">
</p>

# Loopbreaker

**See the loop. Break the loop.**

Loopbreaker is a lightweight browser extension that counts Instagram Reels as you scroll and gives you playful, uncomfortable reality checks before a quick break turns into a doom-scroll session.

It is not just a counter. It is a tiny mirror for your scrolling habits.

---

## Why Loopbreaker exists

Instagram Reels are designed to be frictionless: vertical video, instant reward, endless feed, no natural stopping point.

Loopbreaker adds the missing stopping points.

It shows you:

- how many reels you have watched
- how long the session has lasted
- how fast you are scrolling
- when you are entering “the loop”
- when it might be time to stop

The goal is simple:

> Make unconscious scrolling conscious.

---

## Current Version

**Loopbreaker V2**

This version is the first stable working MVP.

It includes:

- live Reels counter
- session timer
- reels-per-hour pace
- loop severity meter
- playful warning messages
- night-scroll detection
- interruption modal
- exit summary
- polished floating UI

---

## Features

### Live Reel Counter

Loopbreaker counts each new Reel as you scroll.

Instead of relying only on Instagram’s changing DOM, it detects the most visible video on the screen and tracks changes using multiple signals like:

- visible video position
- current page URL
- video source
- poster data
- nearby article text

This makes the counter more reliable even when Instagram reuses video elements.

---

### Session Timer

The timer starts when the extension loads on Instagram and shows how long your current scrolling session has been running.

This matters because people often lose track of time while watching short-form video.

---

### Reels Per Hour Pace

Loopbreaker calculates your current scroll pace:


⚡ 312 reels/hour pace