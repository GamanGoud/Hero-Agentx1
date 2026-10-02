// Sidekick Hardware & Surplus Emporium

export const UPGRADE_ITEMS = [
  {
    key: 'ductTape',
    name: 'Gorilla-Grade Duct Tape',
    icon: '🩹',
    levels: [
      { level: 1, name: 'Standard Dollar-Store Tape', desc: 'Basic adhesion. Takes 3 taps to patch glass.', cost: 0 },
      { level: 2, name: 'Heavy-Duty Reinforced Tape', desc: 'Stronger grip. Patches glass in 2 taps!', cost: 25.00 },
      { level: 3, name: 'Gorilla Instant Sealant', desc: 'One tap seals any window instantly!', cost: 65.00 }
    ]
  },
  {
    key: 'juiceJug',
    name: 'Fire-Quenching Juice Tech',
    icon: '🧃',
    levels: [
      { level: 1, name: 'Single Juice Box', desc: 'Standard apple juice squirt.', cost: 0 },
      { level: 2, name: 'Jumbo Seltzer Blaster', desc: 'Carbonated power! Extinguishes fires 65% faster.', cost: 30.00 },
      { level: 3, name: 'Turbo Hydro-Spritzer', desc: 'High-pressure foam! Quenches infernos almost instantly.', cost: 75.00 }
    ]
  },
  {
    key: 'broom',
    name: 'Debris Power Broom',
    icon: '🧹',
    levels: [
      { level: 1, name: 'Kitchen Straw Broom', desc: 'Basic sweeping reach and power.', cost: 0 },
      { level: 2, name: 'Industrial Street Pusher', desc: 'Wider sweep radius; flings bricks right into dumpsters!', cost: 28.00 },
      { level: 3, name: 'Dyson Tornado Broom', desc: 'Massive sweep radius with vacuum suction!', cost: 70.00 }
    ]
  },
  {
    key: 'skates',
    name: 'Sidekick Sprint Footwear',
    icon: '🛼',
    levels: [
      { level: 1, name: 'Worn Sneakers', desc: 'Standard sidekick running pace.', cost: 0 },
      { level: 2, name: 'Retro Roller-Skates', desc: '+35% sprint speed across the pavement!', cost: 35.00 },
      { level: 3, name: 'Rocket-Powered Kicks', desc: '+70% supersonic sprint speed!', cost: 85.00 }
    ]
  },
  {
    key: 'prPass',
    name: 'PR Megaphone & Donut Bribes',
    icon: '📢',
    levels: [
      { level: 0, name: 'No Media Defenses', desc: 'Chopper spots everything.', cost: 0 },
      { level: 1, name: 'Glazed Donut Box Bribe', desc: 'Press Megaphone tool blinds chopper camera for 6s!', cost: 20.00 },
      { level: 2, name: 'VIP PR Megaphone', desc: 'Rallies crowds and boosts public approval recovery by +50%!', cost: 55.00 }
    ]
  }
];

export class ShopUI {
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
    const funds = this.engine.storage.getFunds();
    const upgrades = this.engine.storage.data.upgrades;

    let itemsHtml = '';
    UPGRADE_ITEMS.forEach(item => {
      const currentLvl = upgrades[item.key] || 1;
      const nextLvlConfig = item.levels.find(l => l.level === currentLvl + 1);
      const isMax = !nextLvlConfig;
      const currentConfig = item.levels.find(l => l.level === currentLvl) || item.levels[0];

      itemsHtml += `
        <div class="shop-card">
          <div class="shop-card-icon">${item.icon}</div>
          <div class="shop-card-info">
            <div class="shop-item-title">${item.name}</div>
            <div class="shop-item-current">Currently: <strong>${currentConfig.name}</strong></div>
            <div class="shop-item-desc">${isMax ? 'MAX LEVEL REACHED! Ultimate sidekick efficiency.' : nextLvlConfig.desc}</div>
          </div>
          <div class="shop-card-action">
            ${isMax ? `
              <span class="badge-maxed">MAXED OUT</span>
            ` : `
              <button class="comic-btn primary-btn btn-buy-upgrade ${funds < nextLvlConfig.cost ? 'disabled' : ''}" 
                      data-key="${item.key}" data-cost="${nextLvlConfig.cost}">
                UPGRADE ($${nextLvlConfig.cost.toFixed(2)})
              </button>
            `}
          </div>
        </div>
      `;
    });

    this.container.innerHTML = `
      <div class="comic-modal-overlay">
        <div class="comic-modal-window">
          <div class="modal-header">
            <h2 class="modal-title">SIDEKICK SURPLUS & HARDWARE EMPORIUM</h2>
            <div class="modal-funds-badge">YOUR EMERGENCY WAGE FUND: <span class="fund-amount">$${funds.toFixed(2)}</span></div>
          </div>
          <p class="modal-subtitle">Spend your hard-earned minimum wage on professional collateral damage repair tools!</p>
          
          <div class="shop-items-grid">
            ${itemsHtml}
          </div>

          <div class="modal-footer">
            <button class="comic-btn secondary-btn" id="btn-close-shop">RETURN TO HEADQUARTERS</button>
          </div>
        </div>
      </div>
    `;

    // Hook listeners
    document.getElementById('btn-close-shop')?.addEventListener('click', () => {
      this.engine.soundEngine.playClick();
      this.hide();
    });

    this.container.querySelectorAll('.btn-buy-upgrade').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const key = e.currentTarget.getAttribute('data-key');
        const cost = parseFloat(e.currentTarget.getAttribute('data-cost'));
        if (this.engine.storage.buyUpgrade(key, cost)) {
          this.engine.soundEngine.playChing();
          this.render();
        } else {
          this.engine.soundEngine.playOops();
          alert("Insufficient sidekick wage funds! Fix more hazards and catch tips first.");
        }
      });
    });
  }
}
