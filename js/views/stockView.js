import { Spinner } from '../components/spinner.js';
import { productService } from '../services/productService.js';
import { stockService } from '../services/stockService.js';
import { authStore } from '../stores/authStore.js';

const stockView = {
  container: null,
  products: [],
  filteredProducts: [],
  searchTerm: '',
  sortBy: 'name',
  sortOrder: 'asc',
  showLowStock: false,

  init() {
    this.container = document.querySelector('#stock-view');
    if (!this.container) return;

    this.render();
    this.loadStockData();
    this.setupEventListeners();
  },

  setupEventListeners() {
    // ฟัง event เมื่อมีการอัปเดตสต็อก
    document.addEventListener('stockUpdated', () => {
      console.log('📊 Stock updated, reloading stock view...');
      this.loadStockData();
    });
    // ฟัง event เมื่อมีการอัปเดตสินค้า
    document.addEventListener('productsUpdated', () => {
      console.log('📦 Products updated, reloading stock view...');
      this.loadStockData();
    });
  },

  render() {
    this.container.innerHTML = `
      <div class="stock-header">
        <h1 class="stock-title">จัดการสต็อกสินค้า</h1>
        <div class="stock-controls">
          <div class="search-container">
            <input type="text" class="search-input" id="stock-search" placeholder="ค้นหาสินค้า...">
            </div>
          <select class="sort-select" id="stock-sort">
            <option value="name">เรียงตามชื่อ</option>
            <option value="stock">เรียงตามสต็อก</option>
            <option value="category">เรียงตามหมวดหมู่</option>
          </select>
           <button class="filter-btn" id="low-stock-filter">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 3H7l-4 4v14a2 2 0 0 0 2 2h15a2 2 0 0 0 2-2V3z"></path>
              <path d="M7 3v4H3"></path>
            </svg>
            สต็อกต่ำ
          </button>
          <button class="refresh-btn" id="refresh-stock-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="m20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
            </svg>
            รีเฟรช
          </button>
        </div>
      </div>

      <div class="stock-summary" id="stock-summary">
        </div>

      <div class="stock-grid" id="stock-grid">
        </div>
    `;
    this.attachEventListeners();
  },

  attachEventListeners() {
    const searchInput = document.getElementById('stock-search');
    const sortSelect = document.getElementById('stock-sort');
    const lowStockFilter = document.getElementById('low-stock-filter');
    const refreshBtn = document.getElementById('refresh-stock-btn');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value.toLowerCase();
        this.filterAndRenderProducts();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.filterAndRenderProducts();
      });
    }

    if (lowStockFilter) {
      lowStockFilter.addEventListener('click', () => {
        this.showLowStock = !this.showLowStock;
        lowStockFilter.classList.toggle('active', this.showLowStock);
        this.filterAndRenderProducts();
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.loadStockData();
      });
    }
  },

  async loadStockData() {
    const refreshBtn = document.getElementById('refresh-stock-btn');
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
      const result = await productService.fetchAllProducts();
      if (result.success) {
        this.products = result.data;
        this.renderSummary();
        this.filterAndRenderProducts();
      } else {
        this.showError('ไม่สามารถโหลดข้อมูลสต็อกได้: ' + result.error.message);
      }

    } catch (error) {
      this.showError('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
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

  renderSummary() {
    const summaryContainer = document.getElementById('stock-summary');
    if (!summaryContainer) return;
    const totalProducts = this.products.length;
    const lowStockProducts = this.products.filter(p => this.getStockQuantity(p) <= 10).length;
    const outOfStockProducts = this.products.filter(p => this.getStockQuantity(p) === 0).length;
    const totalStockValue = this.products.reduce((sum, p) => sum + (this.getStockQuantity(p) * p.base_price), 0);
    summaryContainer.innerHTML = `
      <div class="summary-card">
        <div class="summary-icon">📦</div>
        <div class="summary-content">
          <div class="summary-label">สินค้าทั้งหมด</div>
          <div class="summary-value">${totalProducts} รายการ</div>
        </div>
      </div>
      <div class="summary-card warning">
        <div class="summary-icon">⚠️</div>
        <div class="summary-content">
          <div class="summary-label">สต็อกต่ำ (≤10)</div>
          <div class="summary-value">${lowStockProducts} รายการ</div>
        </div>
      </div>
      <div class="summary-card danger">
        <div class="summary-icon">🚫</div>
        <div class="summary-content">
          <div class="summary-label">สินค้าหมด</div>
          <div class="summary-value">${outOfStockProducts} รายการ</div>
        </div>
      </div>
      <div class="summary-card success">
        <div class="summary-icon">💰</div>
        <div class="summary-content">
          <div class="summary-label">มูลค่าสต็อก</div>
          <div class="summary-value">${totalStockValue.toLocaleString()} ฿</div>
        </div>
      </div>
    `;
  },

  filterAndRenderProducts() {
    let filtered = [...this.products];
    // Filter by search term
    if (this.searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(this.searchTerm) ||
        (product.categories?.name || '').toLowerCase().includes(this.searchTerm)
      );
    }

    // Filter by low stock
    if (this.showLowStock) {
      filtered = filtered.filter(product => this.getStockQuantity(product) <= 10);
    }

    // Sort products
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (this.sortBy) {
        case 'stock':
          aValue = this.getStockQuantity(a);
          bValue = this.getStockQuantity(b);
          break;
        case 'category':
          aValue = a.categories?.name || '';
          bValue = b.categories?.name || '';
          break;
        default: // name
          aValue = a.name;
          bValue = b.name;
      }

      if (this.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    this.filteredProducts = filtered;
    this.renderStockGrid();
  },

  renderStockGrid() {
    const stockGrid = document.getElementById('stock-grid');
    if (!stockGrid) return;
    if (this.filteredProducts.length === 0) {
      stockGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📦</div>
          <div class="empty-state-text">ไม่พบสินค้า</div>
          <div class="empty-state-subtext">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</div>
        </div>
      `;
      return;
    }

    stockGrid.innerHTML = this.filteredProducts.map(product => {
      const stockQuantity = this.getStockQuantity(product);
      const stockStatus = this.getStockStatus(stockQuantity);
      
      return `
        <div class="stock-item ${stockStatus.class}">
          <div class="stock-item-image">
            <img src="${product.image_url || 'https://jkenfjjxwdckmvqjkdkp.supabase.co/storage/v1/object/public/product-images/placeholder.png'}" 
                 alt="${product.name}">
          </div>
          <div class="stock-item-info">
            <div class="stock-item-name">${product.name}</div>
            <div class="stock-item-category">${product.categories?.name || 'ไม่ระบุ'}</div>
            <div class="stock-item-price">${product.base_price} ฿</div>
          </div>
          <div class="stock-item-quantity">
            <div class="stock-badge ${stockStatus.class}">
              ${stockStatus.icon} ${stockQuantity}
            </div>
          </div>
          <div class="stock-item-actions">
            <button class="btn-stock-action" onclick="stockView.showAddStockModal('${product.id}', '${product.name}', ${stockQuantity})">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              เพิ่ม
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  getStockQuantity(product) {
    return product.product_stocks?.[0]?.stock_quantity || 0;
  },

  getStockStatus(quantity) {
    if (quantity === 0) {
      return { class: 'out-of-stock', icon: '🚫' };
    } else if (quantity <= 10) {
      return { class: 'low-stock', icon: '⚠️' };
    } else {
      return { class: 'in-stock', icon: '✅' };
    }
  },

  async showAddStockModal(productId, productName, currentStock) {
    const { Modal } = await import('../components/modal.js');
    const modal = Modal.create({
      title: `เพิ่มสต็อก: ${productName}`,
      body: `
        <div class="add-stock-form">
          <div class="current-stock-info">
            <span class="label">สต็อกปัจจุบัน:</span>
            <span class="value">${currentStock} ชิ้น</span>
          </div>
          <div class="form-group">
            <label class="form-label">จำนวนที่ต้องการเพิ่ม</label>
            <input type="number" class="form-input" id="add-stock-quantity" min="1" value="1" autofocus>
          </div>
          <div class="form-group">
            <label class="form-label">หมายเหตุ (ไม่บังคับ)</label>
            <input type="text" class="form-input" id="add-stock-note" placeholder="เช่น เติมสต็อกจากคลัง">
          </div>
        </div>
      `,
      footer: 
      `
        <button class="btn btn-cancel" id="cancel-add-stock">ยกเลิก</button>
        <button class="btn btn-confirm" id="confirm-add-stock">เพิ่มสต็อก</button>
      `
    });
    // Attach events
    setTimeout(() => {
      const confirmBtn = document.getElementById('confirm-add-stock');
      const cancelBtn = document.getElementById('cancel-add-stock');
      const quantityInput = document.getElementById('add-stock-quantity');

      if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
          const quantity = parseInt(quantityInput.value);
          const note = document.getElementById('add-stock-note').value;

          if (!quantity || quantity < 1) {
            alert('กรุณาใส่จำนวนที่ถูกต้อง');
            return;
          }

          confirmBtn.disabled = true;
          confirmBtn.textContent = 'กำลังเพิ่มสต็อก...';

          try {
            const result = await stockService.addStock(productId, quantity, note);
            
            if (result.success) {
              alert(`เพิ่มสต็อกสำเร็จ! สต็อกใหม่: ${currentStock + quantity} ชิ้น`);
              modal.close();
              this.loadStockData();
              
              // Notify other views
              document.dispatchEvent(new CustomEvent('stockUpdated'));
            } else {
              alert('ไม่สามารถเพิ่มสต็อกได้: ' + result.error.message);
              confirmBtn.disabled = false;
              confirmBtn.textContent = 'เพิ่มสต็อก';
            }
          } catch (error) {
            alert('เกิดข้อผิดพลาด: ' + error.message);
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'เพิ่มสต็อก';
          }
        });
      }

      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => modal.close());
      }

      // Focus on quantity input
      if (quantityInput) {
        quantityInput.focus();
        quantityInput.select();
      }
    }, 100);
  },

  showError(message) {
    const stockGrid = document.getElementById('stock-grid');
    if (stockGrid) {
      stockGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-text">เกิดข้อผิดพลาด</div>
          <div class="empty-state-subtext">${message}</div>
        </div>
      `;
    }
  }
};

// Make showAddStockModal available globally
window.stockView = stockView;

export { stockView };
