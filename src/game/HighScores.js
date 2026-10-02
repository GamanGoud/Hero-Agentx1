// High Scores and Career Record Display

import { ISSUES } from './Levels.js';

export class HighScoresUI {
  constructor(containerEl, engine, onExit) {
    this.container = containerEl;
    this.engine = engine;
    this.onExit = onExit;
  }

  show() {
    this.container.classList.remove('hidden');
    this.render();
  }

  hide() {
    this.container.classList.add('hidden');
    if (this.onExit) this.onExit();
  }

  render() {
    const stats = this.engine.storage.getCareerStats();
    const highScores = this.engine.storage.data.highScores;
    const grades = this.engine.storage.data.issueGrades;

    let issuesHtml = '';
    ISSUES.forEach(issue => {
      const score = highScores[issue.id] || 0;
      const grade = grades[issue.id] || '—';
      issuesHtml += `
        <div class="score-row">
          <div class="score-issue-name">${issue.title}</div>
          <div class="score-badge-grade grade-${grade.toLowerCase()}">${grade}</div>
          <div class="score-points">${score.toLocaleString()} PTS</div>
        </div>
      `;
    });

    const endlessScore = highScores['endless'] || 0;

    this.container.innerHTML = `
      <div class="comic-modal-overlay">
        <div class="comic-modal-window">
          <div class="modal-header">
            <h2 class="modal-title">SIDEKICK HALL OF FAME & CAREER STATS</h2>
          </div>

          <div class="stats-overview-box">
            <div class="stat-pill">
              <span class="stat-num">${stats.totalRepairs}</span>
              <span class="stat-label">TOTAL REPAIRS</span>
            </div>
            <div class="stat-pill">
              <span class="stat-num">${stats.windowsTaped}</span>
              <span class="stat-label">WINDOWS TAPED</span>
            </div>
            <div class="stat-pill">
              <span class="stat-num">${stats.firesPutOut}</span>
              <span class="stat-label">FIRES QUENCHED</span>
            </div>
            <div class="stat-pill">
              <span class="stat-num">$${(stats.totalWageEarned || 0).toFixed(2)}</span>
              <span class="stat-label">CAREER EARNINGS</span>
            </div>
          </div>

          <h3 class="section-subtitle">ISSUE HIGH SCORES</h3>
          <div class="scores-list">
            ${issuesHtml}
            <div class="score-row endless-row">
              <div class="score-issue-name">⭐ Endless Overtime Frenzy</div>
              <div class="score-badge-grade grade-s">RECORD</div>
              <div class="score-points">${endlessScore.toLocaleString()} PTS</div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="comic-btn secondary-btn" id="btn-close-scores">CLOSE RECORD</button>
            <button class="comic-btn danger-btn" id="btn-reset-data">RESET PROGRESS</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-close-scores')?.addEventListener('click', () => {
      this.engine.soundEngine.playClick();
      this.hide();
    });

    document.getElementById('btn-reset-data')?.addEventListener('click', () => {
      if (confirm("Are you sure you want to reset all sidekick career progress, scores, and upgrades?")) {
        this.engine.storage.resetAllProgress();
        this.render();
      }
    });
  }
}
