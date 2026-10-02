# 🦸 SIDEKICK SWEEP: DAMAGE CONTROL!
> *Minimum Wage. Maximum Chaos.*  
> A slapstick 2D physics runner and repair micro-action game built for the TGC Hackathon 2026.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Platform](https://img.shields.io/badge/platform-HTML5%20%7C%20itch.io-blue.svg)]()
[![License](https://img.shields.io/badge/license-MIT-yellow.svg)](./LICENSE)

---

## 🕹️ itch.io Playable Build
- **Play Online**: [https://gaman.itch.io/sidekick-sweep-damage-control](https://gaman.itch.io/sidekick-sweep-damage-control) *(Upload the `dist/` bundle or run locally)*
- **Game Engine**: HTML5 2D Canvas + Procedural Web Audio API Engine
- **Target Playtime**: 10 – 15 Minutes complete campaign loop + Endless mode

---

## 📖 The Pitch & Story
You play as **Barnaby "Budge" Higgins**, the underpaid, chronically exhausted sidekick to Metro City's loudest superhero: **Captain Calamity**.

Captain Calamity is locked in an eternal duel with **Doctor Disaster**. The problem? Captain Calamity causes far more destruction than the villain! He throws cars through bakery windows, kicks fire hydrants into power lines, and leaves smoking ruins across every neighborhood.

Your mission: Sprint behind Captain Calamity with your trusty utility belt, patch windows with duct tape, put out fires with juice boxes, sweep rubble into trash cans, and keep the **Hero's Approval Rating** high before the **Action 9 Eyewitness News Chopper** catches the collateral carnage on live television!

If your approval rating drops to 0%, the city council cancels the hero franchise and **YOU GET FIRED!**

---

## 🎮 How To Play & Controls

### Desktop Controls:
- **Move / Sprint**: `A` / `D` or `Left Arrow` / `Right Arrow` (or Click anywhere on the sidewalk to run there)
- **Jump**: `Space` or `W` or `Up Arrow`
- **Select Tools**:
  - `[1]`: 🩹 **Duct Tape** — Click/tap cracked glass and windows to seal them
  - `[2]`: 🧃 **Juice Cannon** — Click & hold to extinguish burning hydrants and trash fires
  - `[3]`: 🧹 **Power Broom** — Click/swipe near debris to sweep bricks into street trash cans
  - `[4]`: 🔧 **Monkey Wrench** — Click to bolt sparking electrical boxes and straighten tilted hero billboards
  - `[5]`: 📢 **PR Megaphone** — Distract the News Chopper with donuts and rally crowd cheers!
- **Pause**: `Escape` or `P`

### Mobile / Touch Controls:
- **Direct Tap / Drag**: Tap tools in the bottom Utility Belt dock, then tap directly on damaged objects or swipe to sweep debris!

---

## 💥 Features
1. **Bright 90s Superhero Comic Aesthetics**:
   - Bold ink outlines, CMYK halftone dot overlays, vibrant slanted action banners.
   - Dynamic comic text bursts: *"KAPOW!"*, *"DUCT-TASTIC!"*, *"SPLOOSH!"*, *"SWEEEEP!"*, *"CAUGHT ON CAM!"*.
2. **Action 9 News Chopper & Dynamic PR Mechanics**:
   - Anchorman Chad Chiseled sweeps a high-powered camera spotlight across the street.
   - If unfixed hazards are caught in the spotlight: Approval plummets (-15%) and breaking news alerts trigger!
   - If hazards are repaired on live camera: Earn big PR approval bonuses and instant cash tips!
3. **5 Full Comic Book Issues (Campaign Mode)**:
   - **Issue #1: The Rookie Shift** (Downtown Highrises)
   - **Issue #2: Suburban Splashdown** (Maple Grove Estates - Barbecues & Garden Gnomes)
   - **Issue #3: Boardwalk Bedlam** (Sunburst Pier & Carnival)
   - **Issue #4: Industrial Incompetence** (Chemical Docks & High Voltage)
   - **Issue #5: Rooftop Showdown** (Skyline Finale Boss Clash!)
4. **Endless Overtime Mode**:
   - Infinite survival shift with escalating collateral chaos and global high scores.
5. **Sidekick Surplus & Hardware Emporium (Shop)**:
   - Upgrade to Heavy-Duty Gorilla Tape, Turbo Hydro-Spritzer, Titanium Tornado Broom, and Rocket Kicks!
6. **Procedural Web Audio Synthesizer**:
   - 100% synthesized comic sound effects (snaps, splatters, pops, ratchets) and dynamic cartoon funk background music with adaptive panic tempo.
7. **The Daily Chronicle Newspaper Post-Game Screens**:
   - Dynamic newspaper headlines, photo captures, grade stamps (S, A, B, C, F), and shift receipts.

---

## 🛠️ Setup & Running Locally

### Prerequisites:
- Node.js (v18+ recommended)
- npm

### Installation:
```bash
# Clone the repository
git clone https://github.com/your-team/sidekick-sweep.git
cd sidekick-sweep

# Install dependencies
npm install

# Start local development server
npm run dev
```
Open your browser to `http://localhost:5173/`.

### Production Build (For itch.io / WebGL / HTML5):
```bash
npm run build
```
The output will be bundled in the `dist/` directory, ready to be zipped and uploaded directly to itch.io as an HTML5 playable game.

---

## 👥 Team & Attribution
- **Developer / Designer / Sound Synthesis**: TGC Hackathon 2026 Team
- **Assets & Licenses**: Full breakdown available in [CREDITS.md](CREDITS.md) (All fonts SIL OFL, all audio procedural Web Audio CC0).
