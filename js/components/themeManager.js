const themeManager = {
  themes: {
    dark: {
      name: 'Dark Mode',
      icon: '🌙',
      colors: {
        '--color-bg-main': '#111315',
        '--color-bg-content': '#1A1D1F',
        '--color-text-primary': '#FFFFFF',
        '--color-text-secondary': '#9A9A9E',
        '--color-accent-primary': '#0a84ff',
        '--color-accent-secondary': '#34c759',
        '--color-accent-danger': '#ff453a',
        '--color-border': 'rgba(255, 255, 255, 0.1)',
        '--sidebar-width': '80px'
      }
    },
    light: {
      name: 'Light Mode',
      icon: '☀️',
      colors: {
        '--color-bg-main': '#f8fafc',
        '--color-bg-content': '#ffffff',
        '--color-text-primary': '#1e293b',
        '--color-text-secondary': '#64748b',
        '--color-accent-primary': '#3b82f6',
        '--color-accent-secondary': '#10b981',
        '--color-accent-danger': '#ef4444',
        '--color-border': 'rgba(0, 0, 0, 0.1)',
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
        <div class="theme-preview" style="background: ${theme.colors['--color-bg-content']}; border-color: ${theme.colors['--color-accent-primary']};">
          <div class="theme-icon">${theme.icon}</div>
        </div>
        <div class="theme-name">${theme.name}</div>
      </button>
    `).join('');

    const modal = Modal.create({
      title: 'เลือกธีม',
      body: `
        <div class="theme-selector">
          <p style="margin-bottom: 20px; color: var(--color-text-secondary); text-align: center;">
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
          padding: 20px 16px;
          border: 2px solid var(--color-border);
          border-radius: 16px;
          background: var(--color-bg-content);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: var(--color-text-primary);
          position: relative;
          overflow: hidden;
        }
        
        .theme-option::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.6s ease;
        }
        
        .theme-option:hover::before {
          left: 100%;
        }
        
        .theme-option:hover {
          border-color: var(--color-accent-primary);
          background: var(--color-bg-main);
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        .theme-option.active {
          border-color: var(--color-accent-primary);
          background: linear-gradient(135deg, var(--color-accent-primary)15, var(--color-bg-content));
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.25);
          transform: translateY(-2px);
        }
        
        .theme-preview {
          width: 60px;
          height: 40px;
          border-radius: 12px;
          border: 2px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        
        .theme-option:hover .theme-preview {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }
        
        .theme-preview::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%);
          animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .theme-icon {
          font-size: 1.8rem;
          z-index: 1;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }
        
        .theme-name {
          font-size: 1rem;
          font-weight: 600;
          text-align: center;
          letter-spacing: 0.5px;
        }
        
        @media (max-width: 480px) {
          .theme-options {
            grid-template-columns: 1fr;
          }
          
          .theme-option {
            padding: 16px;
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