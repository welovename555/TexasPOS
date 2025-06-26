import { Modal } from './modal.js';
import { cartStore } from '../stores/cartStore.js';
import { salesService } from '../services/salesService.js';

const checkoutModal = (() => {
  let modalInstance = null;

  const renderCartItems = () => {
    const items = cartStore.getItems();
    if (items.length === 0) return '<p>ไม่มีสินค้าในตะกร้า</p>';

    return `
      <div class="cart-items">
        ${items.map(item => `
          <div class="cart-item-row">
            <span>${item.product.name} (x${item.quantity})</span>
            <span>${item.product.price * item.quantity} ฿</span>
          </div>
        `).join('')}
      </div>
      <div class="total-row">
        <span>ยอดรวม</span>
        <strong id="total-amount">${cartStore.getTotalPrice()} ฿</strong>
      </div>
      <div class="payment-method-toggle">
        <button class="btn btn-toggle active" data-method="cash">
          <span class="dot"></span> เงินสด
        </button>
        <button class="btn btn-toggle" data-method="transfer">
          <span class="dot"></span> โอนเงิน
        </button>
      </div>
      <div class="cash-input hidden">
        <label>ลูกค้าจ่ายมา</label>
        <input type="number" id="cash-input" placeholder="จำนวนเงิน">
        <p class="change-output" id="change-output">เงินทอน: 0 ฿</p>
      </div>
    `;
  };

  const attachEvents = () => {
    const toggleButtons = document.querySelectorAll('.btn-toggle');
    toggleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        toggleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const method = btn.dataset.method;
        document.querySelector('.cash-input').classList.toggle('hidden', method !== 'cash');
      });
    });

    const cashInput = document.getElementById('cash-input');
    if (cashInput) {
      cashInput.addEventListener('input', () => {
        const value = parseFloat(cashInput.value);
        const total = cartStore.getTotalPrice(); // ใช้ getTotalPrice()
        const change = !isNaN(value) && value >= total ? (value - total) : 0;
        document.getElementById('change-output').textContent = `เงินทอน: ${change.toFixed(2)} ฿`; // เพิ่ม .toFixed(2) เพื่อทศนิยม 2 ตำแหน่ง
      });
    }

    const confirmBtn = document.getElementById('confirm-checkout');
    confirmBtn.addEventListener('click', async () => {
      confirmBtn.disabled = true;

      const method = document.querySelector('.btn-toggle.active')?.dataset?.method || 'cash';
      if (!method) {
          alert('กรุณาเลือกวิธีการชำระเงิน');
          confirmBtn.disabled = false;
          return;
      }

      const cartItems = cartStore.getItems();
      const totalPrice = cartStore.getTotalPrice(); // ใช้ getTotalPrice()
      const seller = 'admin'; // หรือดึงมาจากระบบ
      const timestamp = new Date().toISOString();

      const items = cartItems.map(item => ({
        product_id: item.product.id, // ยังคงส่ง product_id ไปด้วยหาก backend ต้องการ
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price // ใช้ price ที่มาจากสินค้าที่เลือกในตะกร้า
      }));

      const saleRecord = {
        timestamp,
        items,
        total_price: totalPrice,
        payment_method: method,
        seller
      };

      try {
        const result = await salesService.saveSale(saleRecord);

        if (result.success) {
          alert('บันทึกการขายสำเร็จ');
          cartStore.clear(); // ใช้ clear()
          modalInstance?.close();
        } else {
          alert('เกิดข้อผิดพลาด: ' + result.message);
        }
      } catch (error) {
        console.error('Save sale failed:', error);
        alert('เกิดข้อผิดพลาดในการบันทึกการขาย');
      } finally {
        confirmBtn.disabled = false;
      }
    });

    document.getElementById('cancel-checkout').addEventListener('click', () => {
      modalInstance?.close();
    });
  };

  const open = () => {
    modalInstance = Modal.create({
      title: 'สรุปรายการชำระเงิน',
      body: renderCartItems(),
      footer: `
        <button class="btn btn-confirm" id="confirm-checkout">ยืนยันการชำระเงิน</button>
        <button class="btn btn-cancel" id="cancel-checkout">ยกเลิก</button>
      `
    });
    // ใช้ setTimeout เพื่อให้แน่ใจว่า DOM element พร้อมใช้งานแล้ว
    setTimeout(() => attachEvents(), 50);
  };

  return { open };
})();

window.addEventListener('openCheckoutModal', () => {
  checkoutModal.open();
});

export { checkoutModal };
