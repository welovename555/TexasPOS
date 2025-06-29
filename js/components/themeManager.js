const themeManager = {
  themes: {
    dark: {
      name: 'Dark Mode',
      icon: '🌙',
      colors: {
        '--main-bg': '#111315',
        '--content-bg': '#1A1D1F',
        '--text-primary': '#FFFFFF',
        '--text-secondary': '#9A9A9E',
        '--accent-color': '#0a84ff',
        '--sidebar-width': '80px'
      }
    },
    blue: {
      name: 'Ocean Blue',
      icon: '🌊',
      colors: {
        '--main-bg': '#0f1419',
        '--content-bg': '#1e2a3a',
        '--text-primary': '#e6f3ff',
        '--text-secondary': '#8bb8e8',
        '--accent-color': '#00d4ff',
        '--sidebar-width': '80px'
      }
    },
    purple: {
      name: 'Purple Night',
      icon: '🌌',
      colors: {
        '--main-bg': '#1a0d2e',
        '--content-bg': '#2d1b4e',
        '--text-primary': '#f0e6ff',
        '--text-secondary': '#b794d1',
        '--accent-color': '#8b5cf6',
        '--sidebar-width': '80px'
      }
    },
    green: {
      name: 'Forest Green',
      icon: '🌲',
      colors: {
        '--main-bg': '#0d1b0d',
        '--content-bg': '#1a2e1a',
        '--text-primary': '#e6ffe6',
        '--text-secondary': '#94c794',
        '--accent-color': '#10b981',
        '--sidebar-width': '80px'
      }
    }
  },

  currentTheme: 'dark',

  init() {
    // Load saved theme
    const savedTheme = localStorage.getItem('pos-theme');
    if (savedTheme && this.themes[savedTheme]) {
      this.currentTheme = savedTheme;
    }
    
    this.applyTheme(this.currentTheme);
    this.createThemeSelector();
  },

  applyTheme(themeName) {
    const theme = this.themes[themeName];
    if (!theme) return;

    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    this.currentTheme = themeName;
    localStorage.setItem('pos-theme', themeName);
    
    // Update theme selector if it exists
    this.updateThemeSelector();
  },

  createThemeSelector() {
    // Create theme selector button in sidebar
    const sidebar = document.querySelector('.sidebar-footer');
    if (!sidebar) return;

    const themeBtn = document.createElement('a');
    themeBtn.href = '#';
    themeBtn.className = 'nav-item';
    themeBtn.id = 'theme-selector-btn';
    themeBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
      <span>ธีม</span>
    `;

    // Insert before logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      sidebar.insertBefore(themeBtn, logoutBtn);
    } else {
      sidebar.appendChild(themeBtn);
    }

    themeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.showThemeSelector();
    });
  },

  async showThemeSelector() {
    const { Modal } = await import('./modal.js');
    
    const themeOptions = Object.entries(this.themes).map(([key, theme]) => `
      <button class="theme-option ${key === this.currentTheme ? 'active' : ''}" data-theme="${key}">
        <div class="theme-preview" style="background: ${theme.colors['--content-bg']}; border-color: ${theme.colors['--accent-color']};">
          <div class="theme-icon">${theme.icon}</div>
        </div>
        <div class="theme-name">${theme.name}</div>
      </button>
    `).join('');

    const modal = Modal.create({
      title: 'เลือกธีม',
      body: `
        <div class="theme-selector">
          <p style="margin-bottom: 20px; color: var(--text-secondary); text-align: center;">
            เลือกธีมที่คุณชอบ
          </p>
          <div class="theme-options">
            ${themeOptions}
          </div>
        </div>
      `,
      footer: `<button class="btn btn-cancel" id="close-theme-selector">ปิด</button>`
    });

    // Add theme selector styles
    if (!document.getElementById('theme-selector-styles')) {
      const styles = document.createElement('style');
      styles.id = 'theme-selector-styles';
      styles.textContent = `
        .theme-selector {
          padding: 10px 0;
        }
        
        .theme-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        
        .theme-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          cursor: pointer;
          transition: all 0.3s ease;
          color: var(--text-primary);
        }
        
        .theme-option:hover {
          border-color: var(--accent-color);
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-2px);
        }
        
        .theme-option.active {
          border-color: var(--accent-color);
          background: rgba(10, 132, 255, 0.1);
          box-shadow: 0 0 20px rgba(10, 132, 255, 0.3);
        }
        
        .theme-preview {
          width: 60px;
          height: 40px;
          border-radius: 8px;
          border: 2px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        
        .theme-preview::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
        }
        
        .theme-icon {
          font-size: 1.5rem;
          z-index: 1;
        }
        
        .theme-name {
          font-size: 0.9rem;
          font-weight: 600;
          text-align: center;
        }
        
        @media (max-width: 480px) {
          .theme-options {
            grid-template-columns: 1fr;
          }
        }
      `;
      document.head.appendChild(styles);
    }

    // Attach events
    setTimeout(() => {
      const themeOptions = document.querySelectorAll('.theme-option');
      const closeBtn = document.getElementById('close-theme-selector');

      themeOptions.forEach(option => {
        option.addEventListener('click', () => {
          const themeName = option.dataset.theme;
          this.applyTheme(themeName);
          
          // Update active state
          themeOptions.forEach(opt => opt.classList.remove('active'));
          option.classList.add('active');
          
          // Close modal after a short delay
          setTimeout(() => modal.close(), 300);
        });
      });

      if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.close());
      }
    }, 100);
  },

  updateThemeSelector() {
    // Update any existing theme selector UI
    const activeOptions = document.querySelectorAll('.theme-option.active');
    activeOptions.forEach(option => option.classList.remove('active'));
    
    const currentOption = document.querySelector(`[data-theme="${this.currentTheme}"]`);
    if (currentOption) {
      currentOption.classList.add('active');
    }
  }
};

export { themeManager };