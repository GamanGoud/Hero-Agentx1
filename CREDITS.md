# CREDITS & ASSET ATTRIBUTION
**Sidekick Sweep: Damage Control!**
*TGC Hackathon 2026 Edition*

---

## 1. Compliance Statement
This project strictly complies with the hackathon asset guidelines:
- **Zero Paid Assets Used**: No Unity Asset Store, Unreal Marketplace, or paid marketplaces were utilized.
- **100% Procedural & Open Source**: All game code, procedural audio synthesis, vector canvas art, and comic visual shaders were built specifically for this event.

---

## 2. Fonts
- **Bangers**
  - Author: Vernon Adams
  - License: SIL Open Font License, 1.1 (Free for commercial and non-commercial use)
  - Source: [Google Fonts - Bangers](https://fonts.google.com/specimen/Bangers)
- **Outfit**
  - Author: Onsen Hoofer
  - License: SIL Open Font License, 1.1
  - Source: [Google Fonts - Outfit](https://fonts.google.com/specimen/Outfit)

---

## 3. Audio & Sound FX
- **Procedural Sound Engine (`src/audio/SoundSynthesizer.js`)**
  - Architecture: 100% procedurally synthesized in real-time via the browser's native Web Audio API (`AudioContext`, `OscillatorNode`, `BiquadFilterNode`, `AudioBufferSourceNode`).
  - No external WAV, MP3, or OGG audio files are bundled or requested over network.
  - License: CC0 / Public Domain / MIT.

---

## 4. Visual Art, Textures & Comic Shaders
- **HTML5 Canvas Vector Renderer**: Hand-coded procedural vector drawing for Captain Calamity, Doctor Disaster, Barnaby Higgins, Action 9 Chopper, storefront facades, and comic starbursts.
- **Halftone Dot Texture Pattern**: Dynamically generated at runtime via procedural canvas pattern cache (`GameEngine.createHalftonePattern()`).
- **Newspaper & Comic Panel Borders**: Pure Vanilla CSS3 with standard web layout modules.

---

## 5. Development Tools & Libraries
- **Vite 6**
  - License: MIT License
  - Source: [Vitejs.dev](https://vitejs.dev/)
- **Node.js**
  - License: MIT / Node.js Foundation
