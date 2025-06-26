// Path: components/checkoutModal.js
import { cartStore } from '../stores/cartStore.js';
import { salesService } from '../services/salesService.js';

const checkoutModal = {
  modalEl: null,

  init() {
    this.modalEl = document.createElement('div');
    this.modalEl.className = 'checkout-modal hidden';
    this.modalEl.innerHTML = `
      <div class="checkout-modal-content">
        <h2>ยืนยันการชำระเงิน</h2>
        <p id="checkout-total">ยอดรวม: 0 บาท</p>
        <div class="payment-method">
          <label><input type="radio" name="payment" value="cash" checked> เงินสด</label>
          <label><input type="radio" name="payment" value="transfer"> โอนเงิน</label>
        </div>
        <div class="modal-buttons">
          <button id="confirm-payment">ยืนยัน</button>
          <button id="cancel-payment">ยกเลิก</button>
        </div>
      </div>
    `;
    document.body.appendChild(this.modalEl);

    document.getElementById('cancel-payment').addEventListener('click', () => {
      this.hide();
    });

    document.getElementById('confirm-payment').addEventListener('click', async () => {
      const method = this.modalEl.querySelector('input[name="payment"]:checked').value;
      const cart = cartStore.getCart();
      const result = await salesService.createSale(cart.items, method);
      if (result.success) {
        cartStore.clearCart();
        this.hide();
      } else {
        alert('เกิดข้อผิดพลาดระหว่างบันทึกการขาย');
      }
    });

    window.addEventListener('openCheckoutModal', () => this.show());
  },

  show() {
    const cart = cartStore.getCart();
    const totalEl = this.modalEl.querySelector('#checkout-total');
    totalEl.textContent = `ยอดรวม: ${cart.total} บาท`;
    this.modalEl.classList.remove('hidden');
  },

  hide() {
    this.modalEl.classList.add('hidden');
  }
};

export { checkoutModal };
