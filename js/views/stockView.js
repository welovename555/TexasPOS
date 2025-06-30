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
    selectedCategoryId: 'all',

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
                    <input type="text" class="search-input" id="stock-search" placeholder="🔍 ค้นหาสินค้า...">
                    <select class="sort-select" id="stock-sort">
                        <option value="name">เรียงตามชื่อ</option>
                        <option value="stock">เรียงตามสต็อก</option>
                        <option value="category">เรียงตามหมวดหมู่</option>
                    </select>
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
            <div id="stock-category-filter-bar" class="category-filter-bar"></div>
            <div class="stock-table-container" id="stock-table-container">
                <div class="loading-placeholder" style="text-align: center; padding: 60px; color: var(--color-text-secondary);">
                    <div style="font-size: 2rem; margin-bottom: 16px;">📦</div>
                    <div>กำลังโหลดข้อมูลสต็อก...</div>
                </div>
            </div>
        `;
        this.attachControlListeners();
    },

    attachControlListeners() {
        const searchInput = document.getElementById('stock-search');
        const sortSelect = document.getElementById('stock-sort');
        const refreshBtn = document.getElementById('refresh-stock-btn');

        searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.filterAndRender();
        });

        sortSelect.addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.filterAndRender();
        });

        refreshBtn.addEventListener('click', () => this.loadData());
    },

    async loadData() {
        const refreshBtn = document.getElementById('refresh-stock-btn');
        const tableContainer = document.getElementById('stock-table-container');
        
        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                กำลังโหลด...
            `;
        }

        // Show loading state
        if (tableContainer) {
            tableContainer.innerHTML = `
                <div class="loading-placeholder" style="text-align: center; padding: 60px; color: var(--color-text-secondary);">
                    <div style="font-size: 2rem; margin-bottom: 16px; animation: float 3s ease-in-out infinite;">📦</div>
                    <div style="font-size: 1.2rem; margin-bottom: 8px;">กำลังโหลดข้อมูลสต็อก...</div>
                    <div style="font-size: 0.9rem; opacity: 0.7;">กรุณารอสักครู่</div>
                </div>
            `;
        }

        try {
            const [productsResult, categoriesResult] = await Promise.all([
                productService.fetchAllProducts(),
                productService.fetchCategories()
            ]);

            if (productsResult.success) {
                this.products = productsResult.data;
            } else {
                this.showError('ไม่สามารถโหลดข้อมูลสินค้าได้: ' + productsResult.error.message);
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
    
    renderCategoryFilters() {
        const filterBar = document.getElementById('stock-category-filter-bar');
        if (!filterBar) return;

        const allBtnHTML = `
            <button class="category-filter-btn ${this.selectedCategoryId === 'all' ? 'active' : ''}" data-id="all">
                ✨ ทั้งหมด
            </button>
        `;
        
        const categoryBtnsHTML = this.categories.map(cat => {
            const icon = this.getCategoryIcon(cat.name);
            return `
                <button class="category-filter-btn ${this.selectedCategoryId === cat.id ? 'active' : ''}" data-id="${cat.id}">
                    ${icon} ${cat.name}
                </button>
            `;
        }).join('');

        filterBar.innerHTML = allBtnHTML + categoryBtnsHTML;

        filterBar.querySelectorAll('.category-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectedCategoryId = btn.dataset.id;
                this.filterAndRender();
            });
        });
    },

    getCategoryIcon(categoryName) {
        const name = categoryName.toLowerCase();
        if (name.includes('น้ำ') || name.includes('ผสม')) return '🥤';
        if (name.includes('บุหรี่')) return '🚬';
        if (name.includes('ยา')) return '💊';
        return '📦';
    },

    filterAndRender() {
        let filtered = [...this.products];

        if (this.searchTerm) {
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(this.searchTerm) ||
                (p.categories?.name || '').toLowerCase().includes(this.searchTerm)
            );
        }
        
        if (this.selectedCategoryId !== 'all') {
            filtered = filtered.filter(p => p.category_id === this.selectedCategoryId);
        }

        filtered.sort((a, b) => {
            switch (this.sortBy) {
                case 'stock': 
                    return this.getStockQuantity(b) - this.getStockQuantity(a); // เรียงจากมากไปน้อย
                case 'category': 
                    return (a.categories?.name || '').localeCompare(b.categories?.name || '');
                default: 
                    return a.name.localeCompare(b.name);
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
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <div class="empty-state-text">ไม่พบสินค้าที่ค้นหา</div>
                    <div class="empty-state-subtext">ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น</div>
                </div>
            `;
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
        const imageUrl = product.image_url || this.getPlaceholderImage(product.name);
        const categoryName = product.categories?.name || 'ไม่ระบุ';

        return `
            <tr>
                <td>
                    <div class="stock-table-image-container">
                        <img src="${imageUrl}" alt="${product.name}" class="stock-table-image">
                    </div>
                </td>
                <td class="stock-item-name-cell">${product.name}</td>
                <td class="category-cell">${categoryName}</td>
                <td class="price-cell">${product.base_price.toFixed(2)}</td>
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
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="16"></line>
                            <line x1="8" y1="12" x2="16" y2="12"></line>
                        </svg>
                        เพิ่ม
                    </button>
                </td>
            </tr>
        `;
    },

    getPlaceholderImage(productName) {
        const name = productName.toLowerCase();
        const utf8_to_b64 = (str) => {
            return window.btoa(unescape(encodeURIComponent(str)));
        };

        if (name.includes('น้ำ') || name.includes('ผสม')) {
            return 'data:image/svg+xml;base64,' + utf8_to_b64(`
                <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <rect width="80" height="80" fill="url(#waterGrad)" rx="12"/>
                    <circle cx="40" cy="40" r="20" fill="#60a5fa" opacity="0.8"/>
                    <text x="40" y="65" text-anchor="middle" fill="white" font-size="10" font-family="Arial">🥤</text>
                </svg>
            `);
        } else if (name.includes('บุหรี่')) {
            return 'data:image/svg+xml;base64,' + utf8_to_b64(`
                <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="smokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#7c2d12;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ea580c;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <rect width="80" height="80" fill="url(#smokeGrad)" rx="12"/>
                    <rect x="20" y="35" width="40" height="10" fill="#f97316" opacity="0.8" rx="5"/>
                    <text x="40" y="65" text-anchor="middle" fill="white" font-size="10" font-family="Arial">🚬</text>
                </svg>
            `);
        } else if (name.includes('ยา')) {
            return 'data:image/svg+xml;base64,' + utf8_to_b64(`
                <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="medGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#166534;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#22c55e;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <rect width="80" height="80" fill="url(#medGrad)" rx="12"/>
                    <path d="M30 20 h20 v40 h-20 z M20 30 h40 v20 h-40 z" fill="#4ade80" opacity="0.8"/>
                    <text x="40" y="65" text-anchor="middle" fill="white" font-size="10" font-family="Arial">💊</text>
                </svg>
            `);
        } else {
            return 'data:image/svg+xml;base64,' + utf8_to_b64(`
                <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="defaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#374151;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#6b7280;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <rect width="80" height="80" fill="url(#defaultGrad)" rx="12"/>
                    <rect x="20" y="20" width="40" height="40" fill="#9ca3af" opacity="0.8" rx="8"/>
                    <text x="40" y="65" text-anchor="middle" fill="white" font-size="10" font-family="Arial">📦</text>
                </svg>
            `);
        }
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
                    <div class="form-group">
                        <label class="form-label">📦 สต็อกปัจจุบัน: <strong style="color: var(--color-accent-secondary);">${currentStock} ชิ้น</strong></label>
                    </div>
                    <div class="form-group">
                        <label class="form-label">➕ จำนวนที่ต้องการเพิ่ม</label>
                        <input type="number" class="form-input" id="add-stock-quantity" min="1" value="1" autofocus>
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="color: var(--color-text-secondary); font-size: 0.9rem;">
                            💡 สต็อกใหม่จะเป็น: <span id="new-stock-preview" style="color: var(--color-accent-primary); font-weight: bold;">${currentStock + 1} ชิ้น</span>
                        </label>
                    </div>
                </div>
            `,
            footer: `
                <button class="btn btn-cancel">❌ ยกเลิก</button>
                <button class="btn btn-confirm" id="confirm-add-stock">✅ เพิ่มสต็อก</button>
            `
        });

        // Update preview when quantity changes
        const quantityInput = document.getElementById('add-stock-quantity');
        const preview = document.getElementById('new-stock-preview');
        
        quantityInput.addEventListener('input', () => {
            const quantity = parseInt(quantityInput.value) || 0;
            preview.textContent = `${currentStock + quantity} ชิ้น`;
        });

        const confirmBtn = document.getElementById('confirm-add-stock');
        confirmBtn.addEventListener('click', async () => {
            const quantity = parseInt(quantityInput.value);
            
            if (!quantity || quantity < 1) {
                alert('❌ กรุณาใส่จำนวนที่ถูกต้อง (ต้องมากกว่า 0)');
                quantityInput.focus();
                return;
            }

            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '⏳ กำลังเพิ่ม...';
            
            try {
                const result = await stockService.addStock(productId, quantity, "เพิ่มสต็อกจากหน้าจัดการ");
                
                if (result.success) {
                    modal.close();
                    
                    // Show success message
                    const successMsg = document.createElement('div');
                    successMsg.style.cssText = `
                        position: fixed; top: 20px; right: 20px; z-index: 9999;
                        background: linear-gradient(135deg, #22c55e, #16a34a);
                        color: white; padding: 16px 24px; border-radius: 12px;
                        box-shadow: 0 8px 25px rgba(34, 197, 94, 0.3);
                        font-weight: 600; animation: slideIn 0.3s ease;
                    `;
                    successMsg.innerHTML = `✅ เพิ่มสต็อก ${quantity} ชิ้น สำเร็จ!`;
                    document.body.appendChild(successMsg);
                    
                    setTimeout(() => {
                        successMsg.style.animation = 'slideOut 0.3s ease';
                        setTimeout(() => successMsg.remove(), 300);
                    }, 3000);
                    
                    this.loadData();
                } else {
                    alert('❌ ไม่สามารถเพิ่มสต็อกได้: ' + result.error.message);
                    confirmBtn.disabled = false;
                    confirmBtn.innerHTML = '✅ เพิ่มสต็อก';
                }
            } catch (error) {
                alert('💥 เกิดข้อผิดพลาด: ' + error.message);
                confirmBtn.disabled = false;
                confirmBtn.innerHTML = '✅ เพิ่มสต็อก';
            }
        });

        // Add CSS for animations
        if (!document.getElementById('stock-animations')) {
            const style = document.createElement('style');
            style.id = 'stock-animations';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
            `;
            document.head.appendChild(style);
        }
    },

    showError(message) {
        const container = document.getElementById('stock-table-container');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">⚠️</div>
                    <div class="empty-state-text">เกิดข้อผิดพลาด</div>
                    <div class="empty-state-subtext">${message}</div>
                </div>
            `;
        }
    }
};

export { stockView };