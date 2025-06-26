// Path: js/components/priceSelectorModal.js

import { Modal } from './modal.js';
import { cartStore } from '../stores/cartStore.js';

const priceSelectorModal = {
  open(product) {
    if (!product.multi_prices || !Array.isArray(product.multi_prices)) return;

    const bodyHTML = `
      <div class="price-options">
        ${product.multi_prices.map((p, i) => `
          <button class="price-option-btn" data-index="${i}">
            ${p.label} - ${p.price} ฿
          </button>
        `).join('')}
      </div>
    `;

    const modal = Modal.create({
      title: `เลือกราคา: ${product.name}`,
      body: bodyHTML,
      footer: `<button class="btn btn-cancel" id="close-price-selector">ยกเลิก</button>`
    });

    setTimeout(() => {
      document.querySelectorAll('.price-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.dataset.index);
          const selected = product.multi_prices[index];
          const productForCart = {
            ...product,
            name: `${product.name} (${selected.label})`,
            base_price: selected.price
          };
          cartStore.addItem(productForCart);
          modal.close();
        });
      });

      document.getElementById('close-price-selector')?.addEventListener('click', () => modal.close());
    }, 20);
  }
};

export { priceSelectorModal };
