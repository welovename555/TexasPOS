import { Spinner } from '../components/spinner.js';
import { salesService } from '../services/salesService.js';

const historyView = {
  container: null,
  currentDate: null,

  init() {
    this.container = document.querySelector('#history-view');
    if (!this.container) return;

    this.currentDate = new Date().toISOString().split('T')[0]; // Today's date
    this.render();
    this.loadSalesHistory();
  },

  render() {
    this.container.innerHTML = `
      <div class="history-header">
        <h1 class="history-title">ประวัติการขาย</h1>
        <div class="history-controls">
          <input type="date" class="date-picker" id="history-date-picker" value="${this.currentDate}">
          <button class="refresh-btn" id="refresh-history-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="m20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
            </svg>
            รีเฟรช
          </button>
        </div>
      </div>

      <div class="sales-summary" id="sales-summary">
        <!-- Summary cards will be inserted here -->
      </div>

      <div class="history-table-container">
        <table class="history-table">
          <thead>
            <tr>
              <th>วันเวลา</th>
              <th>ชื่อสินค้า</th>
              <th>จำนวน</th>
              <th>วิธีชำระเงิน</th>
              <th>ราคา</th>
              <th>พนักงานขาย</th>
            </tr>
          </thead>
          <tbody id="history-table-body">
            <!-- Sales data will be inserted here -->
          </tbody>
        </table>
      </div>
    `;

    this.attachEventListeners();
  },

  attachEventListeners() {
    const datePicker = document.getElementById('history-date-picker');
    const refreshBtn = document.getElementById('refresh-history-btn');

    if (datePicker) {
      datePicker.addEventListener('change', (e) => {
        this.currentDate = e.target.value;
        this.loadSalesHistory();
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.loadSalesHistory();
      });
    }
  },

  async loadSalesHistory() {
    const refreshBtn = document.getElementById('refresh-history-btn');
    const tableBody = document.getElementById('history-table-body');
    const summaryContainer = document.getElementById('sales-summary');

    // Show loading state
    if (refreshBtn) {
      refreshBtn.disabled = true;
      refreshBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
        กำลังโหลด...
      `;
    }

    try {
      const result = await salesService.getSalesHistory(this.currentDate);

      if (result.success) {
        this.renderSummary(result.summary);
        this.renderSalesTable(result.data);
      } else {
        this.showError('ไม่สามารถโหลดข้อมูลได้: ' + result.error.message);
      }

    } catch (error) {
      this.showError('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      // Reset refresh button
      if (refreshBtn) {
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="m20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
          </svg>
          รีเฟรช
        `;
      }
    }
  },

  renderSummary(summary) {
    const summaryContainer = document.getElementById('sales-summary');
    if (!summaryContainer) return;

    summaryContainer.innerHTML = `
      <div class="summary-card">
        <div class="summary-label">ยอดขายรวม</div>
        <div class="summary-value total">${summary.totalAmount.toFixed(2)} ฿</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">เงินสด</div>
        <div class="summary-value cash">${summary.cashAmount.toFixed(2)} ฿</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">โอนเงิน</div>
        <div class="summary-value transfer">${summary.transferAmount.toFixed(2)} ฿</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">จำนวนรายการ</div>
        <div class="summary-value">${summary.totalSales} รายการ</div>
      </div>
    `;
  },

  renderSalesTable(salesData) {
    const tableBody = document.getElementById('history-table-body');
    if (!tableBody) return;

    if (salesData.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <div class="empty-state-icon">📊</div>
              <div class="empty-state-text">ไม่มีข้อมูลการขายในวันที่เลือก</div>
              <div class="empty-state-subtext">ลองเลือกวันที่อื่นหรือเพิ่มการขายใหม่</div>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = salesData.map(sale => {
      const date = new Date(sale.created_at);
      const formattedTime = date.toLocaleString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
        <tr>
          <td>${formattedTime}</td>
          <td>${sale.products?.name || 'ไม่ระบุ'}</td>
          <td>${sale.quantity}</td>
          <td>
            <span class="payment-method ${sale.payment_method}">
              ${sale.payment_method === 'cash' ? 'เงินสด' : 'โอนเงิน'}
            </span>
          </td>
          <td class="price-cell">${sale.total_item_price.toFixed(2)} ฿</td>
          <td class="employee-name">${sale.employees?.name || 'ไม่ระบุ'}</td>
        </tr>
      `;
    }).join('');
  },

  showError(message) {
    const tableBody = document.getElementById('history-table-body');
    const summaryContainer = document.getElementById('sales-summary');

    if (summaryContainer) {
      summaryContainer.innerHTML = `
        <div class="summary-card">
          <div class="summary-label">ข้อผิดพลาด</div>
          <div class="summary-value" style="color: #ff453a;">${message}</div>
        </div>
      `;
    }

    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <div class="empty-state-icon">⚠️</div>
              <div class="empty-state-text">เกิดข้อผิดพลาด</div>
              <div class="empty-state-subtext">${message}</div>
            </div>
          </td>
        </tr>
      `;
    }
  }
};

export { historyView };