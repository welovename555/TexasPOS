import { Modal } from './modal.js';
import { cartStore } from '../stores/cartStore.js';
import { salesService } from '../services/salesService.js';
import { Spinner } from './spinner.js';

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
            <span>${item.product.base_price * item.quantity} ฿</span>
          </div>
        `).join('')}
      </div>
      <div class="total-row">
        <span>ยอดรวม</span>
        <strong id="total-amount">${cartStore.getTotal()} ฿</strong>
      </div>
      <div class="payment-method-toggle">
        <button class="btn-toggle" data-method="cash">เงินสด</button>
        <button class="btn-toggle" data-method="transfer">โอนเงิน</button>
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
        const total = cartStore.getTotal();
        const change = !isNaN(value) && value >= total ? (value - total) : 0;
        document.getElementById('change-output').textContent = `เงินทอน: ${change.toFixed(2)} ฿`;
      });
    }

    const confirmBtn = document.getElementById('confirm-checkout');
    confirmBtn.addEventListener('click', async () => {
      const selectedMethodEl = document.querySelector('.btn-toggle.active');
      if (!selectedMethodEl) {
        alert('กรุณาเลือกวิธีการชำระเงิน');
        return;
      }
      
      confirmBtn.disabled = true;
      Spinner.show();

      const paymentMethod = selectedMethodEl.dataset.method;
      const cartItems = cartStore.getItems();

      const result = await salesService.createSale(cartItems, paymentMethod);

      Spinner.hide();

      if (result.success) {
        alert('บันทึกการขายสำเร็จ!');
        cartStore.clearCart();
        modalInstance?.close();
      } else {
        alert('เกิดข้อผิดพลาด: ' + result.error.message);
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
    setTimeout(() => attachEvents(), 50);
  };

  return { open };
})();

window.addEventListener('openCheckoutModal', () => {
  checkoutModal.open();
});

export { checkoutModal };
