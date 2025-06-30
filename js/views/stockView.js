import { productService } from '../services/productService.js';
import { stockService } from '../services/stockService.js';
import { Modal } from '../components/modal.js';

const stockView = {
    container: null,
    products: [],
    categories: [],
    filteredProducts: [],
    searchTerm: '',
    sortBy: 'name',
    selectedCategoryId: 'all', // เพิ่ม: state สำหรับหมวดหมู่ที่เลือก

    init() {
        this.container = document.querySelector('#stock-view');
        if (!this.container) return;

        this.renderLayout();
        this.loadData();
        this.setupEventListeners();
    },

    setupEventListeners() {
        document.addEventListener('stockUpdated', () => this.loadData());
        document.addEventListener('productsUpdated', () => this.loadData());
    },

    renderLayout() {
        this.container.innerHTML = `
      <div class="stock-header">
        <h1 class="stock-title">จัดการสต็อกสินค้า</h1>
        <div class="stock-controls">
          <input type="text" class="search-input" id="stock-search" placeholder="ค้นหาสินค้า...">
          <select class="sort-select" id="stock-sort">
            <option value="name">เรียงตามชื่อ</option>
            <option value="stock">เรียงตามสต็อก</option>
            <option value="category">เรียงตามหมวดหมู่</option>
          </select>
          <button class="refresh-btn" id="refresh-stock-btn">
            <svg width="16" height="16" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="m20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
            รีเฟรช
          </button>
        </div>
      </div>
      <div id="stock-category-filter-bar" class="category-filter-bar"></div>
      <div class="stock-table-container" id="stock-table-container">
        </div>
    `;
        this.attachControlListeners();
    },

    attachControlListeners() {
        document.getElementById('stock-search').addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.filterAndRender();
        });

        document.getElementById('stock-sort').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.filterAndRender();
        });

        document.getElementById('refresh-stock-btn').addEventListener('click', () => this.loadData());
    },

    async loadData() {
        const refreshBtn = document.getElementById('refresh-stock-btn');
        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" class="spin"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> กำลังโหลด...`;
        }

        try {
            const [productsResult, categoriesResult] = await Promise.all([
                productService.fetchAllProducts(),
                productService.fetchCategories()
            ]);

            if (productsResult.success) {
                this.products = productsResult.data;
            } else {
                this.showError('ไม่สามารถโหลดข้อมูลสินค้าได้');
                this.products = [];
            }

            if (categoriesResult.success) {
                this.categories = categoriesResult.data;
                this.renderCategoryFilters();
            } else {
                this.categories = [];
            }
            
            this.filterAndRender();

        } catch (error) {
            this.showError('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message);
        } finally {
            if (refreshBtn) {
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="m20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg> รีเฟรช`;
            }
        }
    },
    
    renderCategoryFilters() {
        const filterBar = document.getElementById('stock-category-filter-bar');
        if (!filterBar) return;

        const allBtnHTML = `<button class="category-filter-btn ${this.selectedCategoryId === 'all' ? 'active' : ''}" data-id="all">ทั้งหมด</button>`;
        
        const categoryBtnsHTML = this.categories.map(cat => `
            <button class="category-filter-btn ${this.selectedCategoryId === cat.id ? 'active' : ''}" data-id="${cat.id}">${cat.name}</button>
        `).join('');

        filterBar.innerHTML = allBtnHTML + categoryBtnsHTML;

        filterBar.querySelectorAll('.category-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectedCategoryId = btn.dataset.id;
                this.filterAndRender();
            });
        });
    },

    filterAndRender() {
        let filtered = [...this.products];

        if (this.searchTerm) {
            filtered = filtered.filter(p => p.name.toLowerCase().includes(this.searchTerm));
        }
        
        if (this.selectedCategoryId !== 'all') {
            filtered = filtered.filter(p => p.category_id === this.selectedCategoryId);
        }

        filtered.sort((a, b) => {
            switch (this.sortBy) {
                case 'stock': return this.getStockQuantity(a) - this.getStockQuantity(b);
                case 'category': return (a.categories?.name || '').localeCompare(b.categories?.name || '');
                default: return a.name.localeCompare(b.name);
            }
        });

        this.filteredProducts = filtered;
        this.renderStockTable();
        this.renderCategoryFilters(); // Re-render to update active state
    },

    renderStockTable() {
        const container = document.getElementById('stock-table-container');
        if (!container) return;

        if (this.filteredProducts.length === 0) {
            container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📦</div><div class="empty-state-text">ไม่พบสินค้า</div></div>`;
            return;
        }

        const tableHTML = `
            <table class="stock-table">
                <thead>
                    <tr>
                        <th>รูปภาพ</th>
                        <th>ชื่อสินค้า</th>
                        <th>หมวดหมู่</th>
                        <th>ราคา</th>
                        <th>สต็อก</th>
                        <th>จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.filteredProducts.map(p => this.renderTableRow(p)).join('')}
                </tbody>
            </table>
        `;
        container.innerHTML = tableHTML;
        
        // Attach event listeners for action buttons
        container.querySelectorAll('.btn-stock-action').forEach(btn => {
            btn.addEventListener('click', () => {
                const { productId, productName, currentStock } = btn.dataset;
                this.showAddStockModal(productId, productName, parseInt(currentStock));
            });
        });
    },

    renderTableRow(product) {
        const stock = this.getStockQuantity(product);
        const stockStatus = this.getStockStatus(stock);
        const imageUrl = product.image_url || 'https://jkenfjjxwdckmvqjkdkp.supabase.co/storage/v1/object/public/product-images/placeholder.png';

        return `
            <tr>
                <td>
                    <div class="stock-table-image-container">
                        <img src="${imageUrl}" alt="${product.name}" class="stock-table-image">
                    </div>
                </td>
                <td class="stock-item-name-cell">${product.name}</td>
                <td>${product.categories?.name || 'ไม่ระบุ'}</td>
                <td>${product.base_price.toFixed(2)} ฿</td>
                <td>
                    <div class="stock-badge ${stockStatus.class}">
                        ${stockStatus.icon} ${stock}
                    </div>
                </td>
                <td>
                    <button class="btn-stock-action" 
                            data-product-id="${product.id}" 
                            data-product-name="${product.name}" 
                            data-current-stock="${stock}">
                        <svg width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                        เพิ่ม
                    </button>
                </td>
            </tr>
        `;
    },

    getStockQuantity(product) {
        return product.product_stocks?.[0]?.stock_quantity ?? 0;
    },

    getStockStatus(quantity) {
        if (quantity === 0) return { class: 'out-of-stock', icon: '🚫' };
        if (quantity <= 10) return { class: 'low-stock', icon: '⚠️' };
        return { class: 'in-stock', icon: '✅' };
    },

    showAddStockModal(productId, productName, currentStock) {
        const modal = Modal.create({
            title: `เพิ่มสต็อก: ${productName}`,
            body: `
                <div class="add-stock-form">
                    <div class="form-group"><label class="form-label">สต็อกปัจจุบัน: ${currentStock}</label></div>
                    <div class="form-group">
                        <label class="form-label">จำนวนที่ต้องการเพิ่ม</label>
                        <input type="number" class="form-input" id="add-stock-quantity" min="1" value="1" autofocus>
                    </div>
                </div>
            `,
            footer: `<button class="btn btn-cancel">ยกเลิก</button><button class="btn btn-confirm" id="confirm-add-stock">เพิ่มสต็อก</button>`
        });

        const confirmBtn = document.getElementById('confirm-add-stock');
        confirmBtn.addEventListener('click', async () => {
            const quantityInput = document.getElementById('add-stock-quantity');
            const quantity = parseInt(quantityInput.value);
            if (!quantity || quantity < 1) {
                alert('กรุณาใส่จำนวนที่ถูกต้อง');
                return;
            }
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'กำลังเพิ่ม...';
            const result = await stockService.addStock(productId, quantity, "เพิ่มสต็อก");
            if (result.success) {
                modal.close();
                this.loadData();
            } else {
                alert('ไม่สามารถเพิ่มสต็อกได้: ' + result.error.message);
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'เพิ่มสต็อก';
            }
        });
    },

    showError(message) {
        const container = document.getElementById('stock-table-container');
        if (container) {
            container.innerHTML = `<div class="empty-state">⚠️ ${message}</div>`;
        }
    }
};

export { stockView };

