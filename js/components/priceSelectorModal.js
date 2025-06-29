import { Modal } from './modal.js';
import { cartStore } from '../stores/cartStore.js';

const priceSelectorModal = {
  open(product) {
    console.log('🏷️ Opening price selector for:', product);

    // 1. ตรวจสอบว่ามี Muti-price หรือไม่
    if (!product.multi_prices || !Array.isArray(product.multi_prices) || product.multi_prices.length === 0) {
      console.log('❌ No multi_prices found, adding with base price');
      cartStore.addItem(product, product.base_price);
      return;
    }

    // 2. [แก้ไข] แปลงข้อมูลราคาและสร้าง Label เริ่มต้นหากไม่มี
    const processedPrices = product.multi_prices
      .filter(p => p && typeof p.price === 'number' && !isNaN(p.price))
      .map(p => ({
        price: p.price,
        label: (p.label && String(p.label).trim() !== '') ? p.label : `ราคา ${p.price} บาท`
      }));

    // 3. ใช้ข้อมูลที่แปลงแล้วมาตัดสินใจต่อ
    if (processedPrices.length === 0) {
      console.log('❌ No valid prices found after processing, adding with base price');
      cartStore.addItem(product, product.base_price);
      return;
    }

    if (processedPrices.length === 1) {
      console.log('💰 Only one valid price, adding directly');
      cartStore.addItem(product, processedPrices[0].price);
      return;
    }

    // 4. จัดเรียงราคา
    const desiredOrder = [80, 50, 60, 90];
    const sortedPrices = [...processedPrices].sort((a, b) => {
        if (product.name === 'น้ำผสมฝาเงินขวดใหญ่') {
            return desiredOrder.indexOf(a.price) - desiredOrder.indexOf(b.price);
        }
        return a.price - b.price;
    });
    
    // 5. สร้าง Modal (ใช้ sortedPrices) และใช้ชื่อ Class ใหม่ตามหลัก BEM
    const bodyHTML = `
      <div class="price-selector-modal__options">
        <p style="margin-bottom: 16px; color: #8e8e93; text-align: center;">
          เลือกราคาสำหรับ: <strong style="color: #ffffff;">${product.name}</strong>
        </p>
        ${sortedPrices.map(p => `
          <button class="price-selector-modal__option-btn" data-price="${p.price}">
            <strong>${p.label}</strong> - ${p.price} บาท
          </button>
        `).join('')}
      </div>
    `;

    const modal = Modal.create({
      title: `เลือกราคา`,
      body: bodyHTML,
      footer: `<button class="btn btn-cancel" id="close-price-selector">ยกเลิก</button>`
    });

    // 6. เพิ่ม Event Listeners
    setTimeout(() => {
      const priceButtons = document.querySelectorAll('.price-selector-modal__option-btn');
      console.log('🎯 Found price buttons:', priceButtons.length);
      
      priceButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const selectedPrice = parseFloat(btn.dataset.price);
          console.log('💰 Selected price:', selectedPrice, 'for product:', product.name);
          
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
