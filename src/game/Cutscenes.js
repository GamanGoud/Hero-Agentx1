// Comic Book Cutscene Dialog Strips

export class CutsceneViewer {
  constructor(containerEl, onComplete) {
    this.container = containerEl;
    this.onComplete = onComplete;
    this.panels = [];
    this.currentIndex = 0;
  }

  show(issueConfig) {
    this.panels = issueConfig.introPanels || [];
    this.currentIndex = 0;
    this.container.classList.remove('hidden');
    this.renderCurrentPanel();
  }

  hide() {
    this.container.classList.add('hidden');
    if (this.onComplete) this.onComplete();
  }

  next() {
    this.currentIndex++;
    if (this.currentIndex >= this.panels.length) {
      this.hide();
    } else {
      this.renderCurrentPanel();
    }
  }

  renderCurrentPanel() {
    const panel = this.panels[this.currentIndex];
    if (!panel) return;

    this.container.innerHTML = `
      <div class="comic-cutscene-overlay">
        <div class="comic-panel-box">
          <div class="panel-header-tag">PANEL ${this.currentIndex + 1} OF ${this.panels.length}</div>
          
          <div class="cutscene-art-area">
            <div class="character-portrait hero-portrait ${panel.heroSpeaker.includes('Calamity') ? 'active-speaker' : ''}">
              <div class="portrait-avatar hero-avatar"></div>
              <div class="portrait-name">CAPTAIN CALAMITY</div>
            </div>

            <div class="speech-bubble-wrapper">
              <div class="speech-tail"></div>
              <div class="speech-bubble-speaker">${panel.heroSpeaker.toUpperCase()}</div>
              <p class="speech-bubble-text">"${panel.text}"</p>
            </div>

            <div class="character-portrait sidekick-portrait ${panel.heroSpeaker.includes('Budge') ? 'active-speaker' : ''}">
              <div class="portrait-avatar sidekick-avatar reaction-${(panel.sidekickReaction || 'ready').toLowerCase()}"></div>
              <div class="portrait-name">BUDGE (YOU)</div>
            </div>
          </div>

          <div class="panel-controls">
            <button class="comic-btn secondary-btn" id="btn-skip-comic">SKIP TO SHIFT >></button>
            <button class="comic-btn primary-btn pulse-glow" id="btn-next-panel">
              ${this.currentIndex === this.panels.length - 1 ? 'GRAB THE DUCT TAPE! (START)' : 'NEXT PANEL >>'}
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-next-panel')?.addEventListener('click', () => this.next());
    document.getElementById('btn-skip-comic')?.addEventListener('click', () => this.hide());
  }
}
