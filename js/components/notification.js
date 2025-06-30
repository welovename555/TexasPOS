// === Beautiful Notification System ===
const NotificationSystem = {
  container: null,
  notifications: new Map(),
  
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'notification-container';
      document.body.appendChild(this.container);
    }
  },

  show(options) {
    this.init();
    
    const {
      type = 'info',
      title = '',
      message = '',
      duration = 4000,
      closable = true,
      onClick = null
    } = options;

    const id = Date.now() + Math.random();
    const notification = this.createNotification(id, type, title, message, closable, onClick);
    
    this.container.appendChild(notification);
    this.notifications.set(id, notification);

    // Trigger show animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    // Auto remove
    if (duration > 0) {
      setTimeout(() => {
        this.hide(id);
      }, duration);
    }

    return id;
  },

  createNotification(id, type, title, message, closable, onClick) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.dataset.id = id;

    const icon = this.getIcon(type);
    
    notification.innerHTML = `
      <div class="notification-icon">${icon}</div>
      <div class="notification-content">
        ${title ? `<h4 class="notification-title">${title}</h4>` : ''}
        ${message ? `<p class="notification-message">${message}</p>` : ''}
      </div>
      ${closable ? '<button class="notification-close">&times;</button>' : ''}
      <div class="notification-progress"></div>
    `;

    // Click handlers
    if (onClick) {
      notification.addEventListener('click', (e) => {
        if (!e.target.classList.contains('notification-close')) {
          onClick();
        }
      });
    }

    if (closable) {
      const closeBtn = notification.querySelector('.notification-close');
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hide(id);
      });
    }

    return notification;
  },

  getIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      confirm: '❓'
    };
    return icons[type] || icons.info;
  },

  hide(id) {
    const notification = this.notifications.get(id);
    if (!notification) return;

    notification.classList.remove('show');
    notification.classList.add('hide');

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      this.notifications.delete(id);
    }, 400);
  },

  // Convenience methods
  success(title, message, duration = 4000) {
    return this.show({ type: 'success', title, message, duration });
  },

  error(title, message, duration = 6000) {
    return this.show({ type: 'error', title, message, duration });
  },

  warning(title, message, duration = 5000) {
    return this.show({ type: 'warning', title, message, duration });
  },

  info(title, message, duration = 4000) {
    return this.show({ type: 'info', title, message, duration });
  },

  // Confirmation Modal
  confirm(options) {
    return new Promise((resolve) => {
      const {
        title = 'ยืนยันการดำเนินการ',
        message = 'คุณแน่ใจหรือไม่?',
        confirmText = 'ยืนยัน',
        cancelText = 'ยกเลิก',
        type = 'warning'
      } = options;

      const overlay = document.createElement('div');
      overlay.className = 'confirm-modal-overlay';
      
      const icon = this.getIcon(type);
      
      overlay.innerHTML = `
        <div class="confirm-modal">
          <div class="confirm-modal-icon">${icon}</div>
          <h3 class="confirm-modal-title">${title}</h3>
          <p class="confirm-modal-message">${message}</p>
          <div class="confirm-modal-buttons">
            <button class="confirm-btn secondary" data-action="cancel">${cancelText}</button>
            <button class="confirm-btn primary" data-action="confirm">${confirmText}</button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      // Show animation
      setTimeout(() => {
        overlay.classList.add('active');
      }, 10);

      // Handle clicks
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeConfirm(overlay, resolve, false);
        }
      });

      const buttons = overlay.querySelectorAll('.confirm-btn');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const action = btn.dataset.action;
          const confirmed = action === 'confirm';
          
          if (confirmed) {
            btn.classList.add('loading');
            btn.innerHTML = '';
          }
          
          setTimeout(() => {
            this.closeConfirm(overlay, resolve, confirmed);
          }, confirmed ? 500 : 0);
        });
      });
    });
  },

  closeConfirm(overlay, resolve, result) {
    overlay.classList.remove('active');
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      resolve(result);
    }, 300);
  }
};

// Export for use in other modules
export { NotificationSystem };