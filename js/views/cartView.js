import { Modal } from '../components/modal.js';
import { cartStore } from '../stores/cartStore.js';

const cartView = {
  init(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;
    this.render(cartStore.getCart());
    document.addEventListener('cartUpdated', e => this.render(e.detail));
  },
  render(state) {
    const { items, total } = state;
    this.container.innerHTML = `<h2 class="cart-header">ตะกร้าสินค้า</h2>`;
    const listContainer = document.createElement('div');
    listContainer.className = 'cart-items-list';
    if (items.length === 0) {
      listContainer.innerHTML = `<p class="cart-empty-message">ไม่มีสินค้าในตะกร้า</p>`;
    } else {
      items.forEach(item => listContainer.appendChild(this.createCartItemElement(item)));
    }
    this.container.appendChild(listContainer);
    this.container.appendChild(this.createCartFooterElement(total, items.length > 0));
  },
  createCartItemElement(item) {
    const element = document.createElement('div');
    element.className = 'cart-item';
    element.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${item.product.name}</div>
        <div class="cart-item-details">${item.quantity} x ${item.product.base_price.toFixed(2)}</div>
      </div>
      <div class="cart-item-total">${(item.product.base_price * item.quantity).toFixed(2)}</div>
    `;
    element.addEventListener('click', () => cartStore.removeItem(item.product.id));
    return element;
  },
  createCartFooterElement(total, hasItems) {
    const footer = document.createElement('div');
    footer.className = 'cart-footer';
    footer.innerHTML = `
      <div class="cart-summary">
        <span class="cart-summary-label">ยอดรวม</span>
        <span class="cart-summary-total">${total.toFixed(2)}</span>
      </div>
      <button class="btn-checkout" ${!hasItems ? 'disabled' : ''}>ชำระเงิน</button>
    `;
    footer.querySelector('.btn-checkout').addEventListener('click', () => { if (hasItems) this.showCheckoutModal(); });
    return footer;
  },
  showCheckoutModal() {
    Modal.create({
      title: 'ยืนยันการชำระเงิน',
      body: `<div>ยอดรวมที่ต้องชำระ: <strong>${cartStore.getCart().total.toFixed(2)} บาท</strong></div><p>กรุณาเลือกวิธีการชำระเงิน:</p>`,
      footer: `<button id="payment-cash" class="btn-payment-method">เงินสด</button><button id="payment-transfer" class="btn-payment-method">เงินโอน</button>`
    });
  }
};
export { cartView };
