import { sellView } from './views/sellView.js';
import { cartView } from './views/cartView.js';
import { checkoutModal } from './components/checkoutModal.js';

document.addEventListener('DOMContentLoaded', () => {
  sellView.init();
  cartView.init('#cart-view-container');
});
