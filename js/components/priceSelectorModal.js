import { Modal } from './modal.js';
import { cartStore } from '../stores/cartStore.js';

const priceSelectorModal = {
  open(product) {
    console.log('🏷️ Opening price selector for:', product);
    
    if (!product.multi_prices || !Array.isArray(product.multi_prices)) {
      console.log('❌ No multi_prices found, adding with base price');
      cartStore.addItem(product, product.base_price);
      return;
    }

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
            ${p.label} - ${p.price} บาท
          </button>
        `).join('')}
      </div>
    `;

    const modal = Modal.create({
      title: `เลือกราคา: ${product.name}`,
      body: bodyHTML,
      footer: `<button class="btn btn-cancel" id="close-price-selector">ยกเลิก</button>`
    });

    // รอให้ modal แสดงผลก่อนแล้วค่อยเพิ่ม event listeners
    setTimeout(() => {
      const priceButtons = document.querySelectorAll('.price-option-btn');
      console.log('🎯 Found price buttons:', priceButtons.length);
      
      priceButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const selectedPrice = parseFloat(btn.dataset.price);
          console.log('💰 Selected price:', selectedPrice);
          
          // ส่งสินค้าและราคาที่เลือกไปที่ cartStore
          cartStore.addItem(product, selectedPrice);
          
          modal.close();
        });
      });

      const cancelBtn = document.getElementById('close-price-selector');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          console.log('❌ Price selector cancelled');
          modal.close();
        });
      }
    }, 100);
  }
};

export { priceSelectorModal };