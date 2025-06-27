const ProgressBar = {
  show(label = 'Processing...') {
    return new Promise(resolve => {
      // 1. Create Elements
      const overlay = document.createElement('div');
      overlay.className = 'progress-overlay';
      overlay.innerHTML = `
        <div class="progress-container">
          <div class="progress-label">${label}</div>
          <div class="progress-bar-wrapper">
            <div class="progress-bar-fill"></div>
          </div>
          <div class="progress-percentage">0%</div>
        </div>
      `;
      document.body.appendChild(overlay);

      const fill = overlay.querySelector('.progress-bar-fill');
      const percentageText = overlay.querySelector('.progress-percentage');
      
      // 2. Animate On
      setTimeout(() => overlay.classList.add('active'), 10);

      // 3. Animate Bar and Text
      setTimeout(() => {
        fill.style.width = '100%';
        let currentPercent = 0;
        const interval = setInterval(() => {
          currentPercent += 4; // Increase by more for faster visual effect
          if (currentPercent > 100) currentPercent = 100;
          percentageText.textContent = `${currentPercent}%`;
          if (currentPercent >= 100) {
            clearInterval(interval);
          }
        }, 20); // Update text very frequently
      }, 50);

      // 4. Hide and Remove after 0.75 seconds
      setTimeout(() => {
        overlay.classList.remove('active');
        // Wait for fade-out animation to finish before removing
        setTimeout(() => {
          if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
          }
          resolve(); // Let the calling function know we are done
        }, 300);
      }, 750);
    });
  }
};

export { ProgressBar };
