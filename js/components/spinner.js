const Spinner = {
  show() {
    let spinnerOverlay = document.getElementById('spinner-overlay-dynamic');
    if (!spinnerOverlay) {
      spinnerOverlay = document.createElement('div');
      spinnerOverlay.id = 'spinner-overlay-dynamic';
      spinnerOverlay.className = 'spinner-overlay';

      const spinnerElement = document.createElement('div');
      spinnerElement.className = 'spinner';
      spinnerOverlay.appendChild(spinnerElement);

      document.body.appendChild(spinnerOverlay);
    }

    setTimeout(() => {
        spinnerOverlay.classList.add('active');
    }, 10);
  },

  hide() {
    const spinnerOverlay = document.getElementById('spinner-overlay-dynamic');
    if (spinnerOverlay) {
      spinnerOverlay.classList.remove('active');
      setTimeout(() => {
        if (document.body.contains(spinnerOverlay)) {
          document.body.removeChild(spinnerOverlay);
        }
      }, 200);
    }
  }
};
