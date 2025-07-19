import { Modal } from './modal.js';
import { cartStore } from '../stores/cartStore.js';
import { salesService } from '../services/salesService.js';
import { ProgressBar } from './progressBar.js';
import { NotificationSystem } from './notification.js';

const checkoutModal = (() => {
  let modalInstance = null;

  const renderCartItems = () => {
    const items = cartStore.getItems();
    console.log('🛒 Rendering cart items:', items);
    
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
    console.log('🔗 Attaching checkout modal events');
    
    const toggleButtons = document.querySelectorAll('.btn-toggle');
    console.log('🎛️ Found toggle buttons:', toggleButtons.length);
    
    toggleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        console.log('💳 Payment method selected:', btn.dataset.method);
        toggleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const method = btn.dataset.method;
        const cashInput = document.querySelector('.cash-input');
        if (cashInput) {
          cashInput.classList.toggle('hidden', method !== 'cash');
        }
 
      });
    });

    const cashInput = document.getElementById('cash-input');
    if (cashInput) {
      cashInput.addEventListener('input', () => {
        const value = parseFloat(cashInput.value);
        const total = cartStore.getTotal();
        const change = !isNaN(value) && value >= total ? (value - total) : 0;
        const changeOutput = document.getElementById('change-output');
        if (changeOutput) {
          changeOutput.textContent = `เงินทอน: ${change.toFixed(2)} ฿`;
        }
   
       });
    }

    const confirmBtn = document.getElementById('confirm-checkout');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        console.log('✅ Confirm checkout clicked');
        
        const selectedMethodEl = document.querySelector('.btn-toggle.active');
        if (!selectedMethodEl) {
          NotificationSystem.warning(
            'กรุณาเลือกวิธีการชำระเงิน',
            'เลือกเงินสดหรือโอนเงินก่อนดำเนินการต่อ'
          );
    
          return;
        }
        
        const paymentMethod = selectedMethodEl.dataset.method;
        console.log('💰 Processing payment with method:', paymentMethod);
        
        // ===============================================
        //  ✅  ส่วนของการตรวจสอบจำนวนเงินถูกลบออกไปแล้ว  ✅ 
        // ===============================================
        
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'กำลังประมวลผล...';

        try {
          const [_, result] = await Promise.all([
            ProgressBar.show('กำลังบันทึกการขาย...'),
            salesService.createSale(cartStore.getItems(), paymentMethod)
          ]);
          console.log('📊 Sale result:', result);
          
          if (result.success) {
            console.log('✅ Sale successful, clearing cart');
            cartStore.clearCart();
            modalInstance?.close();
            
            // Show beautiful success notification
            NotificationSystem.success(
              '🎉 บันทึกการขายสำเร็จ!',
              `ขายสินค้า ${result.data.length} รายการ เรียบร้อยแล้ว`
            );
          } else {
            console.error('❌ Sale failed:', result.error);
            NotificationSystem.error(
              'เกิดข้อผิดพลาด',
              result.error.message || 'ไม่สามารถบันทึกการขายได้'
            );
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'ยืนยันการชำระเงิน';
          }
        } catch (error) {
          console.error('💥 Sale error:', error);
          NotificationSystem.error(
            'เกิดข้อผิดพลาด',
            error.message || 'ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง'
          );
          confirmBtn.disabled = false;
          confirmBtn.textContent = 'ยืนยันการชำระเงิน';
        }
      });
    }

    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', async () => {
        console.log('🗑️ Clear cart clicked');
        
        const confirmed = await NotificationSystem.confirm({
          title: '🗑️ ล้างตะกร้าสินค้า',
          message: 'คุณต้องการลบสินค้าทั้งหมดในตะกร้าหรือไม่?',
          confirmText: 'ล้างตะกร้า',
          cancelText: 'ยกเลิก',
    
          type: 'warning'
        });
        
        if (confirmed) {
          cartStore.clearCart();
          modalInstance?.close();
          NotificationSystem.info(
            '🧹 ล้างตะกร้าแล้ว',
            'สินค้าทั้งหมดถูกลบออกจากตะกร้าเรียบร้อย'
          );
  
        }
      });
    }

    const cancelBtn = document.getElementById('cancel-checkout');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        console.log('❌ Checkout cancelled');
        modalInstance?.close();
      });
    }
  };

  const open = () => {
    console.log('🛒 Opening checkout modal');
    
    const items = cartStore.getItems();
    if (items.length === 0) {
      NotificationSystem.warning(
        'ตะกร้าสินค้าว่าง',
        'กรุณาเลือกสินค้าก่อนทำการชำระเงิน'
      );
      return;
    }

    modalInstance = Modal.create({
      title: 'สรุปรายการชำระเงิน',
      body: renderCartItems(),
      footer: `
        <button class="btn btn-clear" id="clear-cart-btn">ล้างตะกร้า</button>
        <button class="btn btn-confirm" id="confirm-checkout">ยืนยันการชำระเงิน</button>
        <button class="btn btn-cancel" id="cancel-checkout">ยกเลิก</button>
      `
    });
    // รอให้ modal แสดงผลก่อนแล้วค่อยเพิ่ม event listeners
    setTimeout(() => attachEvents(), 100);
  };

  return { open };
})();
export { checkoutModal };
