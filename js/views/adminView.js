// js/views/adminView.js

import { Spinner } from '../components/spinner.js';
import { Modal } from '../components/modal.js';
import { productService } from '../services/productService.js';
import { salesService } from '../services/salesService.js';
import { authStore } from '../stores/authStore.js';
import { NotificationSystem } from '../components/notification.js';

const adminView = {
  container: null,
  categories: [],
  products: [],
  isMultiPrice: false,
  priceOptions: [{ label: '', price: 0 }],

  init() {
    this.container = document.querySelector('#admin-view');
    if (!this.container) return;

    if (authStore.state.user?.role !== 'admin') {
      this.showAccessDenied();
      return;
    }

    this.render();
    this.loadInitialData();
  },

  showAccessDenied() {
    this.container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔒</div>
        <div class="empty-state-text">ไม่มีสิทธิ์เข้าถึง</div>
        <div class="empty-state-subtext">เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถเข้าถึงหน้านี้ได้</div>
      </div>
    `;
  },

  render() {
    this.container.innerHTML = `
      <div class="admin-header">
        <h1 class="admin-title">จัดการระบบ</h1>
        <p class="admin-subtitle">เพิ่มสินค้าใหม่ จัดการข้อมูลสินค้า และดูรายงานการขาย</p>
      </div>

      <div class="admin-dashboard">
        <div class="admin-card add-product" id="add-product-card">
          <span class="admin-card-icon">➕</span>
          <h3 class="admin-card-title">เพิ่มสินค้าใหม่</h3>
          <p class="admin-card-description">เพิ่มสินค้าใหม่เข้าสู่ระบบ</p>
        </div>
        
        <div class="admin-card manage-products" id="manage-products-card">
          <span class="admin-card-icon">⚙️</span>
          <h3 class="admin-card-title">จัดการสินค้า</h3>
          <p class="admin-card-description">แก้ไขหรือลบสินค้าที่มีอยู่</p>
        </div>

        <div class="admin-card sales-report" id="sales-report-card">
          <span class="admin-card-icon">📊</span>
          <h3 class="admin-card-title">สรุปยอดขาย</h3>
          <p class="admin-card-description">ดูรายงานและดาวน์โหลดข้อมูล</p>
        </div>
      </div>
    `;
    this.attachEventListeners();
  },

  attachEventListeners() {
    const addProductCard = document.getElementById('add-product-card');
    const manageProductsCard = document.getElementById('manage-products-card');
    const salesReportCard = document.getElementById('sales-report-card');
    addProductCard.addEventListener('click', () => this.showAddProductModal());
    manageProductsCard.addEventListener('click', () => this.showCategorySelectionModal());
    salesReportCard.addEventListener('click', () => this.showSalesReportModal());
  },

  async loadInitialData() {
    try {
      const [categoriesResult, productsResult] = await Promise.all([
        productService.fetchCategories(),
        productService.fetchAllProducts()
      ]);
      if (categoriesResult.success) {
        this.categories = categoriesResult.data;
      }

      if (productsResult.success) {
        this.products = productsResult.data;
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
      NotificationSystem.error(
        'เกิดข้อผิดพลาด',
        'ไม่สามารถโหลดข้อมูลเริ่มต้นได้'
      );
    }
  },

  // 📊 Sales Report Modal
  showSalesReportModal() {
    const today = new Date().toISOString().split('T')[0];
    const modal = Modal.create({
      title: '📊 สรุปยอดขาย',
      body: this.renderSalesReportForm(today, today),
      footer: `
        <button class="btn btn-cancel" id="close-report-modal">❌ ปิด</button>
      `
    });
    setTimeout(() => this.attachSalesReportEvents(modal, today, today), 100);
  },

  renderSalesReportForm(startDate, endDate) {
    return `
      <div class="sales-report-form">
        <div class="quick-date-buttons">
          <button class="quick-date-btn" data-period="today">📅 วันนี้</button>
          <button class="quick-date-btn" data-period="yesterday">📅 เมื่อวาน</button>
          <button class="quick-date-btn" data-period="week">📅 สัปดาห์นี้</button>
          <button class="quick-date-btn" data-period="month">📅 เดือนนี้</button>
        </div>

        <div class="date-range-container">
          <div class="form-group">
            <label class="form-label">📅 วันที่เริ่มต้น</label>
            <input type="date" class="form-input" id="report-start-date" value="${startDate}">
          </div>
          <div class="form-group">
            <label class="form-label">📅 วันที่สิ้นสุด</label>
            <input type="date" class="form-input" id="report-end-date" value="${endDate}">
          </div>
        </div>

        <div class="report-summary" id="report-summary">
          <div class="report-summary-title">📈 สรุปยอดขาย</div>
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <div>กำลังโหลดข้อมูล...</div>
          </div>
        </div>

        <div class="export-buttons">
          <button class="btn-export csv" id="export-csv-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>
            ดาวน์โหลด CSV
          </button>
          <button class="btn-export pdf" id="export-pdf-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            ดาวน์โหลด PDF
          </button>
        </div>
      </div>
    `;
  },

  attachSalesReportEvents(modal, initialStartDate, initialEndDate) {
    const startDateInput = document.getElementById('report-start-date');
    const endDateInput = document.getElementById('report-end-date');
    const quickDateBtns = document.querySelectorAll('.quick-date-btn');
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    
    this.loadSalesReportData(initialStartDate, initialEndDate);

    quickDateBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        quickDateBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const period = btn.dataset.period;
        const dates = this.getDateRange(period);
        
        startDateInput.value = dates.start;
        endDateInput.value = dates.end;
        
        this.loadSalesReportData(dates.start, dates.end);
      });
    });

    startDateInput.addEventListener('change', () => {
      quickDateBtns.forEach(b => b.classList.remove('active'));
      this.loadSalesReportData(startDateInput.value, endDateInput.value);
    });

    endDateInput.addEventListener('change', () => {
      quickDateBtns.forEach(b => b.classList.remove('active'));
      this.loadSalesReportData(startDateInput.value, endDateInput.value);
    });

    exportCsvBtn.addEventListener('click', () => {
      this.exportSalesData('csv', startDateInput.value, endDateInput.value);
    });

    exportPdfBtn.addEventListener('click', () => {
      this.exportSalesData('pdf', startDateInput.value, endDateInput.value);
    });

    const closeBtn = document.getElementById('close-report-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => modal.close());
    }
  },

  getDateRange(period) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    switch (period) {
      case 'today':
        return {
          start: today.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      case 'yesterday':
        return {
          start: yesterday.toISOString().split('T')[0],
          end: yesterday.toISOString().split('T')[0]
        };
      case 'week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return {
          start: startOfWeek.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      case 'month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          start: startOfMonth.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      default:
        return {
          start: today.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
    }
  },

  async loadSalesReportData(startDate, endDate) {
    const summaryContainer = document.getElementById('report-summary');
    if (!summaryContainer) return;

    summaryContainer.innerHTML = `
      <div class="report-summary-title">📈 สรุปยอดขาย</div>
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <div>กำลังโหลดข้อมูล...</div>
      </div>
    `;

    try {
      if (startDate === endDate) {
        const result = await salesService.getSalesHistory(startDate);
        if (result.success) {
          this.renderReportSummary(result.summary, startDate, endDate);
        } else {
          this.showReportError(result.error.message);
        }
      } else {
        const summary = await this.getSalesDataForRange(startDate, endDate);
        this.renderReportSummary(summary, startDate, endDate);
      }
    } catch (error) {
      this.showReportError(error.message);
    }
  },

  async getSalesDataForRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const promises = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      promises.push(salesService.getSalesHistory(dateStr));
    }

    const results = await Promise.all(promises);

    const aggregated = {
      totalSales: 0,
      totalAmount: 0,
      cashAmount: 0,
      transferAmount: 0
    };

    results.forEach(result => {
      if (result.success) {
        aggregated.totalSales += result.summary.totalSales;
        aggregated.totalAmount += result.summary.totalAmount;
        aggregated.cashAmount += result.summary.cashAmount;
        aggregated.transferAmount += result.summary.transferAmount;
      }
    });
    return aggregated;
  },

  renderReportSummary(summary, startDate, endDate) {
    const summaryContainer = document.getElementById('report-summary');
    if (!summaryContainer) return;

    const dateRange = startDate === endDate 
      ? `วันที่ ${this.formatThaiDate(startDate)}`
      : `${this.formatThaiDate(startDate)} - ${this.formatThaiDate(endDate)}`;

    summaryContainer.innerHTML = `
      <div class="report-summary-title">📈 สรุปยอดขาย (${dateRange})</div>
      <div class="report-summary-grid">
        <div class="report-summary-item">
          <div class="report-summary-label">💰 ยอดรวม</div>
          <div class="report-summary-value total">${summary.totalAmount.toFixed(2)} ฿</div>
        </div>
        <div class="report-summary-item">
          <div class="report-summary-label">💵 เงินสด</div>
          <div class="report-summary-value cash">${summary.cashAmount.toFixed(2)} ฿</div>
        </div>
        <div class="report-summary-item">
          <div class="report-summary-label">💳 โอนเงิน</div>
          <div class="report-summary-value transfer">${summary.transferAmount.toFixed(2)} ฿</div>
        </div>
        <div class="report-summary-item">
          <div class="report-summary-label">📊 รายการ</div>
          <div class="report-summary-value">${summary.totalSales} รายการ</div>
        </div>
      </div>
    `;
  },

  showReportError(message) {
    const summaryContainer = document.getElementById('report-summary');
    if (!summaryContainer) return;
    summaryContainer.innerHTML = `
      <div class="report-summary-title">⚠️ เกิดข้อผิดพลาด</div>
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-text">ไม่สามารถโหลดข้อมูลได้</div>
        <div class="empty-state-subtext">${message}</div>
      </div>
    `;
  },

  formatThaiDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },

  async exportSalesData(format, startDate, endDate) {
    const btn = document.getElementById(`export-${format}-btn`);
    const originalText = btn.innerHTML;
    try {
      btn.disabled = true;
      btn.innerHTML = `⏳ กำลังสร้างไฟล์...`;
      
      let summary;
      if (startDate === endDate) {
        const result = await salesService.getSalesHistory(startDate);
        summary = result.success ? result.summary : null;
      } else {
        summary = await this.getSalesDataForRange(startDate, endDate);
      }

      if (!summary) {
        NotificationSystem.error(
          'ไม่สามารถดึงข้อมูลได้',
          'กรุณาลองใหม่อีกครั้ง'
        );
        return;
      }

      const dateRange = startDate === endDate 
        ? this.formatThaiDate(startDate)
        : `${this.formatThaiDate(startDate)} - ${this.formatThaiDate(endDate)}`;
        
      if (format === 'csv') {
        this.downloadCSV(summary, dateRange);
      } else if (format === 'pdf') {
        this.downloadPDF(summary, dateRange);
      }

      NotificationSystem.success(
        `📄 ดาวน์โหลด ${format.toUpperCase()} สำเร็จ!`,
        'ไฟล์ถูกบันทึกลงในเครื่องของคุณแล้ว'
      );
    } catch (error) {
      NotificationSystem.error(
        'เกิดข้อผิดพลาด',
        'ไม่สามารถสร้างไฟล์ได้: ' + error.message
      );
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  },

  downloadCSV(summary, dateRange) {
    const csvContent = [
      ['รายงานสรุปยอดขาย', dateRange],
      [''],
      ['รายการ', 'จำนวนเงิน (บาท)'],
      ['ยอดขายรวม', summary.totalAmount.toFixed(2)],
      ['เงินสด', summary.cashAmount.toFixed(2)],
      ['โอนเงิน', summary.transferAmount.toFixed(2)],
      ['จำนวนรายการ', summary.totalSales],
      [''],
      ['สร้างรายงานเมื่อ', new Date().toLocaleString('th-TH')]
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sales-report-${dateRange.replace(/\//g, '-')}.csv`;
    link.click();
  },

  downloadPDF(summary, dateRange) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>รายงานสรุปยอดขาย</title>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Sarabun', sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .date-range { font-size: 16px; color: #666; }
          .summary-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .summary-table th, .summary-table td { 
            border: 1px solid #ddd; padding: 12px; text-align: left; 
          }
          .summary-table th { background-color: #f5f5f5; font-weight: bold; }
          .total-row { background-color: #fff3cd; font-weight: bold; }
          .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">รายงานสรุปยอดขาย</div>
          <div class="date-range">${dateRange}</div>
        </div>
        
        <table class="summary-table">
          <thead>
            <tr>
              <th>รายการ</th>
              <th>จำนวนเงิน (บาท)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>เงินสด</td>
              <td>${summary.cashAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td>โอนเงิน</td>
              <td>${summary.transferAmount.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td>ยอดขายรวม</td>
              <td>${summary.totalAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td>จำนวนรายการ</td>
              <td>${summary.totalSales} รายการ</td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          สร้างรายงานเมื่อ: ${new Date().toLocaleString('th-TH')}
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  },

  showAddProductModal() {
    const modal = Modal.create({
      title: '➕ เพิ่มสินค้าใหม่',
      body: this.renderAddProductForm(),
      footer: `
        <button class="btn btn-secondary" id="reset-form-btn">🔄 ล้างฟอร์ม</button>
        <button class="btn btn-primary" id="submit-product-btn">✅ เพิ่มสินค้า</button>
      `
    });
    setTimeout(() => this.attachAddProductEvents(modal), 100);
  },

  renderAddProductForm() {
    return `
      <form class="product-form" id="add-product-form">
        <div class="form-group">
          <label class="form-label">📝 ชื่อสินค้า *</label>
          <input type="text" class="form-input" id="product-name" placeholder="กรอกชื่อสินค้า" required>
        </div>

        <div class="form-group">
          <label class="form-label">📂 หมวดหมู่ *</label>
          <select class="form-select" id="product-category" required>
            <option value="">เลือกหมวดหมู่</option>
            ${this.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">💰 ราคาหลัก (บาท) *</label>
            <input type="number" class="form-input" id="product-price" step="0.01" min="0" placeholder="0.00" required>
          </div>
          <div class="form-group">
            <label class="form-label">📦 สต็อกเริ่มต้น</label>
            <input type="number" class="form-input" id="product-stock" min="0" value="0" placeholder="0">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">🖼️ รูปภาพสินค้า</label>
          <div class="image-upload-container">
            <div class="image-preview" id="image-preview">
              <div class="image-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21,15 16,10 5,21"></polyline>
                </svg>
                <div>แตะเพื่อเลือกรูป</div>
              </div>
            </div>
            <button type="button" class="image-upload-btn" id="upload-image-btn">📷 เลือกรูปภาพ</button>
            <input type="file" class="file-input" id="image-file-input" accept="image/*">
          </div>
        </div>

        <div class="form-group">
          <div class="multi-price-container">
            <div class="multi-price-header">
              <label class="form-label">🏷️ ระบบหลายราคา</label>
              <div class="multi-price-toggle" id="multi-price-toggle">
                <div class="toggle-switch" id="toggle-switch">
                  <div class="toggle-slider"></div>
                </div>
                <span>เปิดใช้งาน</span>
              </div>
            </div>
            
            <div class="price-options" id="price-options"></div>
            <button type="button" class="add-price-btn" id="add-price-btn" style="display: none;">
              ➕ เพิ่มราคา
            </button>
          </div>
        </div>
      </form>
    `;
  },

  attachAddProductEvents(modal) {
    const uploadBtn = document.getElementById('upload-image-btn');
    const fileInput = document.getElementById('image-file-input');
    const imagePreview = document.getElementById('image-preview');
    
    uploadBtn.addEventListener('click', () => fileInput.click());
    imagePreview.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => this.handleImageUpload(e));

    const multiPriceToggle = document.getElementById('multi-price-toggle');
    multiPriceToggle.addEventListener('click', () => this.toggleMultiPrice());

    const addPriceBtn = document.getElementById('add-price-btn');
    addPriceBtn.addEventListener('click', () => this.addPriceOption());

    const submitBtn = document.getElementById('submit-product-btn');
    submitBtn.addEventListener('click', (e) => this.handleFormSubmit(e, modal));

    const resetBtn = document.getElementById('reset-form-btn');
    resetBtn.addEventListener('click', () => this.resetAddProductForm());
  },

  async handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      NotificationSystem.warning(
        'ไฟล์ไม่ถูกต้อง',
        'กรุณาเลือกไฟล์รูปภาพเท่านั้น'
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      NotificationSystem.warning(
        'ไฟล์ใหญ่เกินไป',
        'ขนาดไฟล์ต้องไม่เกิน 5MB'
      );
      return;
    }

    const imagePreview = document.getElementById('image-preview');
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
  },

  toggleMultiPrice() {
    this.isMultiPrice = !this.isMultiPrice;
    const toggleSwitch = document.getElementById('toggle-switch');
    const priceOptionsContainer = document.getElementById('price-options');
    const addPriceBtn = document.getElementById('add-price-btn');

    toggleSwitch.classList.toggle('active', this.isMultiPrice);
    priceOptionsContainer.classList.toggle('active', this.isMultiPrice);
    addPriceBtn.style.display = this.isMultiPrice ? 'block' : 'none';

    if (this.isMultiPrice && this.priceOptions.length === 0) {
      this.priceOptions = [{ label: '', price: 0 }];
    }
    
    if (this.isMultiPrice) {
      this.renderPriceOptions();
    }
  },

  renderPriceOptions() {
    const priceOptionsContainer = document.getElementById('price-options');
    priceOptionsContainer.innerHTML = this.priceOptions.map((option, index) => `
      <div class="price-option" data-index="${index}">
        <input type="text" class="form-input price-label-input" placeholder="ป้ายกำกับ (เช่น ขวดเล็ก)" value="${option.label}">
        <input type="number" class="form-input price-value-input" placeholder="ราคา" step="0.01" min="0" value="${option.price || ''}">
        <button type="button" class="remove-price-btn" ${this.priceOptions.length <= 1 ? 'style="display:none"' : ''}>×</button>
      </div>
    `).join('');

    priceOptionsContainer.querySelectorAll('.price-option').forEach(optionEl => {
      const index = parseInt(optionEl.dataset.index);

      optionEl.querySelector('.price-label-input').addEventListener('change', (e) => {
        
        this.updatePriceOption(index, 'label', e.target.value);
      });

      optionEl.querySelector('.price-value-input').addEventListener('change', (e) => {
        this.updatePriceOption(index, 'price', e.target.value);
      });

      optionEl.querySelector('.remove-price-btn').addEventListener('click', () => {
        this.removePriceOption(index);
      });
    });
  },

  updatePriceOption(index, field, value) {
    this.priceOptions[index][field] = field === 'price' ?
      parseFloat(value) || 0 : value;
  },

  addPriceOption() {
    this.priceOptions.push({ label: '', price: 0 });
    this.renderPriceOptions();
  },

  removePriceOption(index) {
    if (this.priceOptions.length > 1) {
      this.priceOptions.splice(index, 1);
      this.renderPriceOptions();
    }
  },

  async handleFormSubmit(event, modal) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submit-product-btn');
    const originalText = submitBtn.innerHTML;

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '⏳ กำลังเพิ่มสินค้า...';
      
      const formData = {
        name: document.getElementById('product-name').value.trim(),
        category_id: document.getElementById('product-category').value,
        base_price: parseFloat(document.getElementById('product-price').value),
        initial_stock: parseInt(document.getElementById('product-stock').value) || 0
      };

      if (!formData.name || !formData.category_id || isNaN(formData.base_price)) {
        NotificationSystem.warning(
          'ข้อมูลไม่ครบถ้วน',
          'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วนและถูกต้อง'
        );
        return;
      }

      const fileInput = document.getElementById('image-file-input');
      if (fileInput.files[0]) {
        const uploadResult = await productService.uploadProductImage(fileInput.files[0]);
        if (uploadResult.success) {
          formData.image_url = uploadResult.url;
        } else {
          NotificationSystem.error(
            'อัปโหลดรูปภาพไม่สำเร็จ',
            uploadResult.error.message
          );
          return;
        }
      }

      if (this.isMultiPrice) {
        const validPrices = this.priceOptions.filter(option => 
          option.label.trim() && !isNaN(option.price) && option.price > 0
        );
        if (validPrices.length > 0) {
          formData.multi_prices = validPrices;
        }
      }

      const result = await productService.createProduct(formData);

      if (result.success) {
        modal.close();
        NotificationSystem.success(
          '✅ เพิ่มสินค้าสำเร็จ!',
          `เพิ่ม "${formData.name}" เข้าสู่ระบบแล้ว`
        );
        this.loadInitialData();
        document.dispatchEvent(new CustomEvent('productsUpdated'));
      } else {
        NotificationSystem.error(
          'ไม่สามารถเพิ่มสินค้าได้',
          result.error.message
        );
      }

    } catch (error) {
      NotificationSystem.error(
        'เกิดข้อผิดพลาด',
        error.message
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  },

  resetAddProductForm() {
    document.getElementById('add-product-form').reset();
    document.getElementById('image-preview').innerHTML = `
      <div class="image-placeholder">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21,15 16,10 5,21"></polyline>
        </svg>
        <div>แตะเพื่อเลือกรูป</div>
      </div>
    `;
    this.isMultiPrice = false;
    this.priceOptions = [{ label: '', price: 0 }];
    document.getElementById('toggle-switch').classList.remove('active');
    document.getElementById('price-options').classList.remove('active');
    document.getElementById('add-price-btn').style.display = 'none';
  },

  showCategorySelectionModal() {
    const categoriesWithCounts = this.categories.map(category => {
      const productCount = this.products.filter(p => p.category_id === category.id).length;
      return { ...category, productCount };
    });
    
    const modal = Modal.create({
      title: '📂 เลือกหมวดหมู่สินค้า',
      body: `
        <div class="category-selection">
          ${categoriesWithCounts.map(category => `
            <div class="category-option" data-category-id="${category.id}">
              <span class="category-option-icon">${this.getCategoryIcon(category.name)}</span>
              <div class="category-option-info">
                <div class="category-option-name">${category.name}</div>
                <div class="category-option-count">${category.productCount} สินค้า</div>
              </div>
              <span class="product-option-arrow">›</span>
            </div>
          `).join('')}
        </div>
      `,
      footer: `<button class="btn btn-cancel" id="cancel-category-selection">❌ ยกเลิก</button>`
    });
    
    setTimeout(() => {
        modal.modalElement.querySelectorAll('.category-option').forEach(option => {
            option.addEventListener('click', () => {
                const categoryId = option.dataset.categoryId;
                modal.close();
                this.showProductSelectionModal(categoryId);
            });
        });

        const cancelBtn = document.getElementById('cancel-category-selection');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => modal.close());
        }
    }, 100);
  },

  getCategoryIcon(categoryName) {
    const name = categoryName.toLowerCase();
    if (name.includes('น้ำ') || name.includes('ผสม')) return '🥤';
    if (name.includes('บุหรี่')) return '🚬';
    if (name.includes('ยา')) return '💊';
    return '📦';
  },

  showProductSelectionModal(categoryId) {
    const categoryProducts = this.products.filter(p => p.category_id === categoryId);
    const category = this.categories.find(c => c.id === categoryId);

    const modal = Modal.create({
      title: `🛍️ เลือกสินค้าใน ${category?.name || 'หมวดหมู่'}`,
      body: `
        <div class="product-selection">
          ${categoryProducts.map(product => `
            <div class="product-option" data-product-id="${product.id}">
              <img src="${product.image_url || this.getPlaceholderImage(product.name)}" 
                   alt="${product.name}" class="product-option-image">
              <div class="product-option-info">
                <div class="product-option-name">${product.name}</div>
                <div class="product-option-details">
                  ราคา ${product.base_price} บาท • สต็อก ${this.getStockQuantity(product)}
                  ${product.multi_prices && product.multi_prices.length > 0 ? ' • มีหลายราคา' : ''}
                </div>
              </div>
              <span class="product-option-arrow">›</span>
            </div>
          `).join('')}
        </div>
      `,
      footer: `
        <button class="btn btn-secondary" id="back-to-categories">⬅️ กลับ</button>
        <button class="btn btn-cancel" id="cancel-product-selection">❌ ยกเลิก</button>
      `
    });

    setTimeout(() => {
        modal.modalElement.querySelectorAll('.product-option').forEach(option => {
            option.addEventListener('click', () => {
                const productId = option.dataset.productId;
                modal.close();
                this.showEditProductModal(productId);
            });
        });
        
        const backBtn = document.getElementById('back-to-categories');
        if(backBtn) {
            backBtn.addEventListener('click', () => {
                modal.close();
                this.showCategorySelectionModal();
            });
        }
        
        const cancelBtn = document.getElementById('cancel-product-selection');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => modal.close());
        }
    }, 100);
  },

  getPlaceholderImage(productName) {
    const name = productName.toLowerCase();
    const utf8_to_b64 = (str) => {
      return window.btoa(unescape(encodeURIComponent(str)));
    };

    if (name.includes('น้ำ') || name.includes('ผสม')) {
      return 'data:image/svg+xml;base64,' + utf8_to_b64(`<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="#1e3a8a" rx="8"/><circle cx="30" cy="30" r="15" fill="#3b82f6" opacity="0.8"/><text x="30" y="45" text-anchor="middle" fill="white" font-size="8" font-family="Arial">🥤</text></svg>`);
    } else if (name.includes('บุหรี่')) {
      return 'data:image/svg+xml;base64,' + utf8_to_b64(`<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="#7c2d12" rx="8"/><rect x="15" y="25" width="30" height="8" fill="#ea580c" opacity="0.8" rx="4"/><text x="30" y="45" text-anchor="middle" fill="white" font-size="8" font-family="Arial">🚬</text></svg>`);
    } else if (name.includes('ยา')) {
      return 'data:image/svg+xml;base64,' + utf8_to_b64(`<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="#166534" rx="8"/><path d="M22 15 h16 v30 h-16 z M15 22 h30 v16 h-30 z" fill="#22c55e" opacity="0.8"/><text x="30" y="45" text-anchor="middle" fill="white" font-size="8" font-family="Arial">💊</text></svg>`);
    } else {
      return 'data:image/svg+xml;base64,' + utf8_to_b64(`<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="#374151" rx="8"/><rect x="15" y="15" width="30" height="30" fill="#6b7280" opacity="0.8" rx="6"/><text x="30" y="45" text-anchor="middle" fill="white" font-size="8" font-family="Arial">📦</text></svg>`);
    }
  },

  getStockQuantity(product) {
    return product.product_stocks?.[0]?.stock_quantity ?? 0;
  },

  showEditProductModal(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;
    
    const modal = Modal.create({
      title: `✏️ แก้ไข: ${product.name}`,
      body: this.renderEditProductForm(product),
      footer: `
        <button class="btn btn-danger" id="delete-product-btn">🗑️ ลบสินค้า</button>
        <button class="btn btn-secondary" id="update-image-btn">📷 เปลี่ยนรูป</button>
        <button class="btn btn-primary" id="save-changes-btn">💾 บันทึก</button>
      `
    });
    setTimeout(() => this.attachEditProductEvents(modal, product), 100);
  },

  renderEditProductForm(product) {
    const category = this.categories.find(c => c.id === product.category_id);
    const stock = this.getStockQuantity(product);
    return `
      <div class="edit-product-form">
        <div class="edit-form-section">
          <h4 class="edit-section-title">📝 ข้อมูลพื้นฐาน</h4>
          <div class="form-group">
            <label class="form-label">ชื่อสินค้า</label>
            <input type="text" class="form-input" id="edit-product-name" value="${product.name}">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">ราคาหลัก (บาท)</label>
              <input type="number" class="form-input" id="edit-product-price" step="0.01" min="0" value="${product.base_price}">
            </div>
            <div class="form-group">
              <label class="form-label">หมวดหมู่</label>
              <select class="form-select" id="edit-product-category">
                ${this.categories.map(cat => 
                  `<option value="${cat.id}" ${cat.id === product.category_id ? 'selected' : ''}>${cat.name}</option>`
                ).join('')}
              </select>
            </div>
          </div>
        </div>

        <div class="edit-form-section">
          <h4 class="edit-section-title">📊 ข้อมูลเพิ่มเติม</h4>
          <div class="form-group">
            <label class="form-label">สต็อกปัจจุบัน: <strong style="color: var(--color-accent-secondary);">${stock} ชิ้น</strong></label>
            <p style="font-size: 0.8rem; color: var(--color-text-secondary); margin: 4px 0 0 0;">
              💡 ใช้หน้าจัดการสต็อกเพื่อเพิ่มสต็อก
            </p>
          </div>
          ${product.multi_prices && product.multi_prices.length > 0 ? `
            <div class="form-group">
              <label class="form-label">ระบบหลายราคา</label>
              <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                ${product.multi_prices.map(price => `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>${price.label || 'ไม่มีป้ายกำกับ'}</span>
                    <strong>${price.price} บาท</strong>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <div class="edit-form-section">
          <h4 class="edit-section-title">🖼️ รูปภาพสินค้า</h4>
          <div class="image-upload-container">
            <div class="image-preview" id="edit-image-preview">
              ${product.image_url ? 
                `<img src="${product.image_url}" alt="${product.name}">` : 
                `<div class="image-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21,15 16,10 5,21"></polyline>
                  </svg>
                  <div>ไม่มีรูปภาพ</div>
                </div>`
              }
            </div>
          </div>
        </div>
      </div>
      <input type="file" id="edit-image-file-input" accept="image/*" style="display: none;">
    `;
  },

  attachEditProductEvents(modal, product) {
    const deleteBtn = document.getElementById('delete-product-btn');
    const updateImageBtn = document.getElementById('update-image-btn');
    const saveBtn = document.getElementById('save-changes-btn');
    const fileInput = document.getElementById('edit-image-file-input');
    const imagePreview = document.getElementById('edit-image-preview');

    deleteBtn.addEventListener('click', () => this.confirmDeleteProduct(product, modal));
    updateImageBtn.addEventListener('click', () => fileInput.click());
    imagePreview.addEventListener('click', () => fileInput.click());
    saveBtn.addEventListener('click', () => this.saveProductChanges(product, modal));
    fileInput.addEventListener('change', (e) => this.handleEditImageUpload(e, product, modal));
  },

  async handleEditImageUpload(event, product, modal) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      NotificationSystem.warning(
        'ไฟล์ไม่ถูกต้อง',
        'กรุณาเลือกไฟล์รูปภาพเท่านั้น'
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      NotificationSystem.warning(
        'ไฟล์ใหญ่เกินไป',
        'ขนาดไฟล์ต้องไม่เกิน 5MB'
      );
      return;
    }

    const updateImageBtn = document.getElementById('update-image-btn');
    const originalText = updateImageBtn.innerHTML;

    try {
      updateImageBtn.disabled = true;
      updateImageBtn.innerHTML = '⏳ กำลังอัปโหลด...';

      const uploadResult = await productService.uploadProductImage(file);
      if (!uploadResult.success) {
        NotificationSystem.error(
          'อัปโหลดรูปภาพไม่สำเร็จ',
          uploadResult.error.message
        );
        return;
      }

      const updateResult = await productService.updateProductImage(product.id, uploadResult.url);
      if (updateResult.success) {
        const imagePreview = modal.modalElement.querySelector('.image-preview');
        imagePreview.innerHTML = `<img src="${uploadResult.url}" alt="${product.name}">`;
        
        NotificationSystem.success(
          '✅ อัปเดตรูปภาพสำเร็จ!',
          'รูปภาพสินค้าถูกเปลี่ยนแล้ว'
        );
        this.loadInitialData();
        document.dispatchEvent(new CustomEvent('productsUpdated'));
      } else {
        NotificationSystem.error(
          'อัปเดตรูปภาพไม่สำเร็จ',
          updateResult.error.message
        );
      }

    } catch (error) {
      NotificationSystem.error(
        'เกิดข้อผิดพลาด',
        error.message
      );
    } finally {
      updateImageBtn.disabled = false;
      updateImageBtn.innerHTML = originalText;
    }
  },

  async saveProductChanges(product, modal) {
    const saveBtn = document.getElementById('save-changes-btn');
    const originalText = saveBtn.innerHTML;
    try {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '⏳ กำลังบันทึก...';

      const updateData = {
        name: document.getElementById('edit-product-name').value.trim(),
        base_price: parseFloat(document.getElementById('edit-product-price').value),
        category_id: document.getElementById('edit-product-category').value
      };

      if (!updateData.name || isNaN(updateData.base_price) || !updateData.category_id) {
        NotificationSystem.warning(
          'ข้อมูลไม่ครบถ้วน',
          'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง'
        );
        return;
      }

      const result = await productService.updateProduct(product.id, updateData);

      if (result.success) {
        modal.close();
        NotificationSystem.success(
          '✅ บันทึกข้อมูลสำเร็จ!',
          `อัปเดตข้อมูล "${updateData.name}" เรียบร้อยแล้ว`
        );
        this.loadInitialData();
        document.dispatchEvent(new CustomEvent('productsUpdated'));
      } else {
        NotificationSystem.error(
          'ไม่สามารถบันทึกข้อมูลได้',
          result.error.message
        );
      }

    } catch (error) {
      NotificationSystem.error(
        'เกิดข้อผิดพลาด',
        error.message
      );
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalText;
    }
  },

  async confirmDeleteProduct(product, modal) {
    const confirmed = await NotificationSystem.confirm({
      title: '⚠️ ยืนยันการลบสินค้า',
      message: `คุณกำลังจะลบสินค้า "${product.name}" การลบจะไม่สามารถกู้คืนได้`,
      confirmText: 'ลบสินค้า',
      cancelText: 'ยกเลิก',
      type: 'error'
    });

    if (confirmed) {
      await this.deleteProduct(product, modal);
    }
  },

  async deleteProduct(product, editModal) {
    try {
      const result = await productService.deleteProduct(product.id);
      if (result.success) {
        editModal.close();
        NotificationSystem.success(
          '✅ ลบสินค้าสำเร็จ!',
          `ลบ "${product.name}" ออกจากระบบแล้ว`
        );
        this.loadInitialData();
        document.dispatchEvent(new CustomEvent('productsUpdated'));
      } else {
        NotificationSystem.error(
          'ไม่สามารถลบสินค้าได้',
          result.error.message
        );
      }

    } catch (error) {
      NotificationSystem.error(
        'เกิดข้อผิดพลาด',
        error.message
      );
    }
  }
};

export { adminView };
