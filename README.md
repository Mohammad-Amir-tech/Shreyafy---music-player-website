# Shreyafy - music-player-website

Welcome to Shreyafy - Your Personalized Music Experience!

## Overview

Shreyafy is a music player website designed to provide a personalized and immersive music experience. Tailored to the preferences of users, Shreyafy aims to create a harmonious blend of curated playlists and personalized features.

## Features

- **Personalized Playlists:** Enjoy curated playlists based on your musical preferences.
- **Shreya's Picks:** Discover handpicked tracks by Shreya for a unique listening experience.
- **Intuitive User Interface:** A user-friendly design for seamless navigation and an enjoyable music journey.
  
## Technologies Used

- **HTML**
- **CSS**
- **JavaScript**

## Demo

See demo here - [Shreyafy](https://shreyafy-music-player-website.vercel.app/)


## Contributing

We welcome contributions! If you'd like to contribute to Shreyafy.

## Feedback

We appreciate your feedback! If you have any suggestions, feature requests, or encounter issues.

Happy listening with Shreyafy!

## ⚠️ Deploying to Vercel — Important Fix Applied

This project originally listed songs by asking the server to show a live
folder listing (e.g. fetching `/songs/hindi/` and reading the HTML it
returned). That only works on servers with directory listing turned on
(some free hosts enable this). **Vercel does not do this for static
sites**, so the player broke completely when deployed there.

### Fix: a generated `manifest.json`

The site now reads a single file, `songs/manifest.json`, that lists every
album folder and every song inside it. You generate this file once
(and again whenever you add/remove songs):

```bash
node generate-manifest.js
```

This scans the `songs/` folder on your computer (where your real `.mp3`
files live) and writes `songs/manifest.json` automatically. Optionally
add an `info.json` inside any song folder to set a custom title/description:

```json
{ "title": "Hindi Hits", "description": "Top hindi tracks" }
```

**Steps to deploy correctly:**
1. Put your real `.mp3` files back into their folders under `songs/`.
2. Run `node generate-manifest.js` locally.
3. Commit and push `songs/manifest.json` (and your mp3 files) to GitHub.
4. Redeploy on Vercel.

> Note: GitHub blocks files over 100MB, and free Vercel plans have
> reasonable-but-not-unlimited storage — if your mp3 collection is large,
> keep individual files well under 100MB, or consider hosting audio on a
> CDN and pointing the manifest at those URLs instead.

## 📱 Mobile Responsiveness

The layout already adapts at 1200px and 500px breakpoints (collapsible
sidebar via hamburger menu, stacked player controls, touch-friendly seekbar
tap support). A few small fixes were added: song titles no longer overflow
the sidebar on narrow screens, and player buttons have larger tap targets
on mobile.
