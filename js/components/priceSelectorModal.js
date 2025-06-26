import { Modal } from './modal.js';
import { cartStore } from '../stores/cartStore.js';

const priceSelectorModal = {
  open(product) {
    if (!product.multi_prices || !Array.isArray(product.multi_prices)) return;

    // ลำดับราคาที่ต้องการสำหรับ "น้ำผสมฝาเงินขวดใหญ่"
    const desiredOrder = [80, 50, 60, 90];
    
    // จัดเรียงราคาตามลำดับที่กำหนด ถ้าเป็นสินค้าอื่นให้เรียงตามปกติ
    const sortedPrices = [...product.multi_prices].sort((a, b) => {
        if (product.name === 'น้ำผสมฝาเงินขวดใหญ่') {
            return desiredOrder.indexOf(a.price) - desiredOrder.indexOf(b.price);
        }
        return a.price - b.price; // สำหรับสินค้าอื่น เรียงจากน้อยไปมาก
    });

    const bodyHTML = `
      <div class="price-options">
        ${sortedPrices.map(p => `
          <button class="price-option-btn" data-price="${p.price}">
            ${p.label}
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
          const selectedPrice = parseFloat(btn.dataset.price);
          
          // ส่งสินค้าและราคาที่เลือกไปที่ cartStore โดยไม่แก้ไขชื่อ
          cartStore.addItem(product, selectedPrice);
          
          modal.close();
        });
      });

      document.getElementById('close-price-selector')?.addEventListener('click', () => modal.close());
    }, 50);
  }
};

export { priceSelectorModal };
