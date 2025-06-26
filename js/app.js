import { sellView } from './views/sellView.js';
import { cartView } from './views/cartView.js';
import { checkoutModal } from './components/checkoutModal.js';
import { priceSelectorModal } from './components/priceSelectorModal.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the main views
  sellView.init();
  // The cartView is not used in the final design, but keeping the line commented
  // in case you want to reuse it later.
  // cartView.init('#cart-view-container');

  // Global event listener to open the price selector modal
  window.addEventListener('openPriceSelector', (e) => {
    const { product } = e.detail;
    if (product) {
      priceSelectorModal.open(product);
    }
  });
});
