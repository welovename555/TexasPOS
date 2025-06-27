import { Modal } from './modal.js';
import { cartStore } from '../stores/cartStore.js';
import { salesService } from '../services/salesService.js';
import { ProgressBar } from './progressBar.js';

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
            <span>${(item.selectedPrice * item.quantity).toFixed(2)} ฿</span>
          </div>
        `).join('')}
      </div>
      <div class="total-row">
        <span>ยอดรวม</span>
        <strong id="total-amount">${cartStore.getTotal().toFixed(2)} ฿</strong>
      </div>
      <div class="payment-method-toggle">
        <button class="btn-toggle" data-method="cash">เงินสด</button>
        <button class="btn-toggle" data-method="transfer">โอนเงิน</button>
      </div>
      <div class="cash-input hidden">
        <label>ลูกค้าจ่ายมา</label>
        <input type="number" id="cash-input" placeholder="จำนวนเงิน">
        <p class="change-output" id="change-output">เงินทอน: 0.00 ฿</p>
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

      const [_, result] = await Promise.all([
        ProgressBar.show('กำลังบันทึกการขาย...'),
        salesService.createSale(cartStore.getItems(), selectedMethodEl.dataset.method)
      ]);
      
      if (result.success) {
        cartStore.clearCart();
        modalInstance?.close();
      } else {
        alert('เกิดข้อผิดพลาด: ' + result.error.message);
        confirmBtn.disabled = false;
      }
    });

    // === START EDIT ===
    document.getElementById('clear-cart-btn').addEventListener('click', () => {
      cartStore.clearCart();
      modalInstance?.close();
    });

    document.getElementById('cancel-checkout').addEventListener('click', () => {
      modalInstance?.close();
    });
    // === END EDIT ===
  };

  const open = () => {
    modalInstance = Modal.create({
      title: 'สรุปรายการชำระเงิน',
      body: renderCartItems(),
      // === START EDIT ===
      footer: `
        <button class="btn btn-clear" id="clear-cart-btn">ล้างตะกร้า</button>
        <button class="btn btn-confirm" id="confirm-checkout">ยืนยันการชำระเงิน</button>
        <button class="btn btn-cancel" id="cancel-checkout">ออก</button>
      `
      // === END EDIT ===
    });

    setTimeout(() => attachEvents(), 50);
  };

  return { open };
})();

window.addEventListener('openCheckoutModal', () => {
  checkoutModal.open();
});

export { checkoutModal };
