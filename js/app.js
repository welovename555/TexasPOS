const app = {
  init() {
    document.addEventListener('DOMContentLoaded', () => {
      sellView.init();
      cartView.init('#cart-view-container');
    });
  }
};

app.init();
