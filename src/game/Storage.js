// Persistent LocalStorage state manager with fallbacks

const STORAGE_KEY = 'sidekick_sweep_save_v1';

const DEFAULT_STATE = {
  unlockedIssue: 1, // 1 to 5
  funds: 50.00, // Starting minimum wage emergency fund
  highScores: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    endless: 0
  },
  issueGrades: {
    1: null,
    2: null,
    3: null,
    4: null,
    5: null
  },
  upgrades: {
    ductTape: 1, // 1: Standard, 2: Heavy-Duty, 3: Gorilla Instant
    juiceJug: 1, // 1: Small Carton, 2: Big Jug, 3: Turbo-Soaker
    broom: 1,    // 1: Straw Broom, 2: Push Broom, 3: Dyson Tornado
    skates: 1,   // 1: Worn Sneakers, 2: Roller Skates, 3: Rocket Kicks
    prPass: 0    // 0: None, 1: Press Doughnuts, 2: VIP Megaphone
  },
  careerStats: {
    totalRepairs: 0,
    firesPutOut: 0,
    windowsTaped: 0,
    debrisSwept: 0,
    spotlightDodges: 0,
    totalWageEarned: 0
  },
  audio: {
    sound: true,
    music: true
  }
};

class StorageManager {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
      const parsed = JSON.parse(raw);
      // Merge with default state in case new fields were added
      return {
        ...DEFAULT_STATE,
        ...parsed,
        upgrades: { ...DEFAULT_STATE.upgrades, ...(parsed.upgrades || {}) },
        highScores: { ...DEFAULT_STATE.highScores, ...(parsed.highScores || {}) },
        issueGrades: { ...DEFAULT_STATE.issueGrades, ...(parsed.issueGrades || {}) },
        careerStats: { ...DEFAULT_STATE.careerStats, ...(parsed.careerStats || {}) },
        audio: { ...DEFAULT_STATE.audio, ...(parsed.audio || {}) }
      };
    } catch (e) {
      console.warn('LocalStorage load error, using defaults:', e);
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  getUnlockedIssue() {
    return this.data.unlockedIssue || 1;
  }

  unlockNextIssue(issueNum) {
    if (issueNum > this.data.unlockedIssue && issueNum <= 5) {
      this.data.unlockedIssue = issueNum;
      this.save();
    }
  }

  getFunds() {
    return parseFloat(this.data.funds.toFixed(2));
  }

  addFunds(amount) {
    this.data.funds = Math.max(0, this.data.funds + amount);
    this.data.careerStats.totalWageEarned += Math.max(0, amount);
    this.save();
    return this.getFunds();
  }

  spendFunds(amount) {
    if (this.data.funds >= amount) {
      this.data.funds -= amount;
      this.save();
      return true;
    }
    return false;
  }

  getUpgradeLevel(upgradeKey) {
    return this.data.upgrades[upgradeKey] || 0;
  }

  buyUpgrade(upgradeKey, cost) {
    if (this.spendFunds(cost)) {
      this.data.upgrades[upgradeKey] = (this.data.upgrades[upgradeKey] || 0) + 1;
      this.save();
      return true;
    }
    return false;
  }

  recordIssueScore(issueId, score, grade) {
    const prevHigh = this.data.highScores[issueId] || 0;
    if (score > prevHigh) {
      this.data.highScores[issueId] = score;
    }
    this.data.issueGrades[issueId] = grade;
    this.save();
  }

  getHighScore(issueId) {
    return this.data.highScores[issueId] || 0;
  }

  recordStats(statsDelta) {
    for (const [key, val] of Object.entries(statsDelta)) {
      if (this.data.careerStats[key] !== undefined) {
        this.data.careerStats[key] += val;
      }
    }
    this.save();
  }

  getCareerStats() {
    return this.data.careerStats;
  }

  getAudioSettings() {
    return this.data.audio;
  }

  setAudioSetting(key, val) {
    this.data.audio[key] = val;
    this.save();
  }

  resetAllProgress() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.save();
  }
}

export const storage = new StorageManager();
