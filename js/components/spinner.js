const Spinner = {
  show() {
    let spinnerOverlay = document.getElementById('spinner-overlay-dynamic');
    if (!spinnerOverlay) {
      spinnerOverlay = document.createElement('div');
      spinnerOverlay.id = 'spinner-overlay-dynamic';
      spinnerOverlay.className = 'spinner-overlay';
      spinnerOverlay.innerHTML = `<div class="spinner"></div>`;
      document.body.appendChild(spinnerOverlay);
    }
    setTimeout(() => spinnerOverlay.classList.add('active'), 10);
  },
  hide() {
    const spinnerOverlay = document.getElementById('spinner-overlay-dynamic');
    if (spinnerOverlay) {
      spinnerOverlay.classList.remove('active');
      setTimeout(() => { if (document.body.contains(spinnerOverlay)) { document.body.removeChild(spinnerOverlay); } }, 200);
    }
  }
};
export { Spinner };
