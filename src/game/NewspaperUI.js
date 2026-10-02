// Newspaper Victory and Defeat Overlays ("THE DAILY CHRONICLE")

export class NewspaperUI {
  constructor(containerEl, engine, callbacks) {
    this.container = containerEl;
    this.engine = engine;
    this.callbacks = callbacks || {};
  }

  showVictory(stats) {
    this.container.classList.remove('hidden');
    const isEndless = this.engine.isEndless;
    const nextIssueId = this.engine.currentIssueId + 1;
    const hasNext = !isEndless && nextIssueId <= 5;

    this.container.innerHTML = `
      <div class="newspaper-overlay-backdrop">
        <div class="newspaper-page victory-paper rotate-paper">
          <div class="newspaper-masthead">
            <div class="masthead-left">VOL. XCIV No. 102</div>
            <div class="masthead-title">THE DAILY CHRONICLE</div>
            <div class="masthead-right">25¢ • METRO CITY EDITION</div>
          </div>
          <div class="newspaper-divider"></div>

          <div class="newspaper-headline">
            CAPTAIN CALAMITY SAVES THE DAY!
          </div>
          <div class="newspaper-subhead">
            Public Approval Soars! (Exhausted Sidekick Spotted in Background with Mop and Tape)
          </div>

          <div class="newspaper-body-grid">
            <div class="newspaper-photo-box">
              <div class="mock-photo victory-photo">
                <div class="photo-caption">Captain Calamity strikes a triumphant pose. In tiny print: "Minor collateral damage completely vanished."</div>
              </div>
            </div>

            <div class="newspaper-article-text">
              <div class="performance-stamp-badge stamp-${stats.grade.toLowerCase()}">
                GRADE ${stats.grade}
              </div>
              <p><strong>METRO CITY —</strong> Despite causing dozens of structural fractures, the hero's approval rating remained at a staggering <strong>${Math.round(stats.approval)}%</strong>.</p>
              
              <div class="shift-receipt-box">
                <div class="receipt-row"><span>HAZARDS REPAIRED:</span> <strong>${stats.repairs}</strong></div>
                <div class="receipt-row"><span>PUBLIC APPROVAL:</span> <strong>${Math.round(stats.approval)}%</strong></div>
                <div class="receipt-row"><span>WAGE & TIPS EARNED:</span> <strong>$${stats.earnings.toFixed(2)}</strong></div>
                <div class="receipt-row total"><span>TOTAL SCORE:</span> <strong>${stats.score.toLocaleString()} PTS</strong></div>
              </div>
            </div>
          </div>

          <div class="newspaper-actions-bar">
            ${hasNext ? `
              <button class="comic-btn primary-btn pulse-glow" id="btn-next-issue">PROCEED TO ISSUE #${nextIssueId} >></button>
            ` : isEndless ? `
              <button class="comic-btn primary-btn" id="btn-retry-issue">PLAY OVERTIME AGAIN</button>
            ` : `
              <button class="comic-btn primary-btn pulse-glow" id="btn-replay-all">HERO OF THE YEAR! RETURN TO ISSUES</button>
            `}
            <button class="comic-btn secondary-btn" id="btn-open-shop-win">UPGRADE AT SHOP 🛠️</button>
            <button class="comic-btn secondary-btn" id="btn-retry-win">RETRY FOR GRADE S</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-next-issue')?.addEventListener('click', () => {
      this.hide();
      if (this.callbacks.onNextIssue) this.callbacks.onNextIssue(nextIssueId);
    });

    document.getElementById('btn-replay-all')?.addEventListener('click', () => {
      this.hide();
      if (this.callbacks.onTitle) this.callbacks.onTitle();
    });

    document.getElementById('btn-retry-issue')?.addEventListener('click', () => {
      this.hide();
      if (this.callbacks.onRetry) this.callbacks.onRetry();
    });

    document.getElementById('btn-retry-win')?.addEventListener('click', () => {
      this.hide();
      if (this.callbacks.onRetry) this.callbacks.onRetry();
    });

    document.getElementById('btn-open-shop-win')?.addEventListener('click', () => {
      this.hide();
      if (this.callbacks.onShop) this.callbacks.onShop();
    });
  }

  showGameOver(stats) {
    this.container.classList.remove('hidden');

    this.container.innerHTML = `
      <div class="newspaper-overlay-backdrop">
        <div class="newspaper-page defeat-paper rotate-paper-rev">
          <div class="newspaper-masthead defeat-masthead">
            <div class="masthead-left">SPECIAL DISASTER EXTRA</div>
            <div class="masthead-title">THE DAILY CHRONICLE</div>
            <div class="masthead-right">FINAL BROADCAST</div>
          </div>
          <div class="newspaper-divider"></div>

          <div class="newspaper-headline defeat-headline">
            DISGRACE! HERO SUED FOR BILLIONS!
          </div>
          <div class="newspaper-subhead">
            Action 9 Chopper Exposes Unchecked Collateral Carnage — Underpaid Sidekick Promptly Fired!
          </div>

          <div class="newspaper-body-grid">
            <div class="newspaper-photo-box">
              <div class="mock-photo defeat-photo">
                <div class="photo-caption">Chad Chiseled: "The public will not stand for this! Clean-up crew was completely overwhelmed!"</div>
              </div>
            </div>

            <div class="newspaper-article-text">
              <div class="performance-stamp-badge stamp-f">
                FIRED!
              </div>
              <p><strong>LIVE AT NOON —</strong> Public approval plummeted to <strong>0%</strong> after live camera footage captured unfixed fires, shattered shopfronts, and chaotic debris across the avenue.</p>
              <p>City Hall has officially canceled Captain Calamity's hero permit, and sidekick Barnaby Higgins has been terminated without severance pay.</p>
              
              <div class="shift-receipt-box defeat-receipt">
                <div class="receipt-row"><span>HAZARDS FIXED:</span> <strong>${stats.repairs}</strong></div>
                <div class="receipt-row"><span>FINAL SCORE:</span> <strong>${stats.score.toLocaleString()} PTS</strong></div>
                <div class="receipt-row"><span>UNPAID DEDUCTIONS:</span> <strong>-$1,000,000</strong></div>
              </div>
            </div>
          </div>

          <div class="newspaper-actions-bar">
            <button class="comic-btn primary-btn pulse-glow" id="btn-retry-shift">TRY SHIFT AGAIN 🔄</button>
            <button class="comic-btn secondary-btn" id="btn-open-shop-lose">BUY BETTER TOOLS 🛠️</button>
            <button class="comic-btn secondary-btn" id="btn-return-title-lose">RETURN TO TITLE</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-retry-shift')?.addEventListener('click', () => {
      this.hide();
      if (this.callbacks.onRetry) this.callbacks.onRetry();
    });

    document.getElementById('btn-open-shop-lose')?.addEventListener('click', () => {
      this.hide();
      if (this.callbacks.onShop) this.callbacks.onShop();
    });

    document.getElementById('btn-return-title-lose')?.addEventListener('click', () => {
      this.hide();
      if (this.callbacks.onTitle) this.callbacks.onTitle();
    });
  }

  hide() {
    this.container.classList.add('hidden');
  }
}
