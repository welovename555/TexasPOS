import { Spinner } from '../components/spinner.js';
import { productService } from '../services/productService.js';
import { cartStore } from '../stores/cartStore.js';

const sellView = {
  allCategories: [],
  activeCategoryId: null,

  categoryIcons: {
    'น้ำ/ผสม': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2h8"/><path d="M9 2v2.789a4 4 0 0 1-.672 2.219l-.656.984A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.789a4 4 0 0 0-.672-2.219l-.656-.984A4 4 0 0 1 15 4.788V2"/><path d="M7 15a6.472 6.472 0 0 1 5 0 6.47 6.47 0 0 0 5 0"/></svg>`,
    'บุหรี่': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 12H3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h14"/><path d="M18 8c0-2.5-2-2.5-2-5"/><path d="M21 16a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M22 8c0-2.5-2-2.5-2-5"/><path d="M7 12v4"/></svg>`,
    'ยา': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4a1 1 0 0 1 1 1v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4a1 1 0 0 1 1-1h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-4a1 1 0 0 1-1-1V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4a1 1 0 0 1-1 1z"/></svg>`,
    'อื่นๆ': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/><path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/></svg>`,
  },

  async init() {
    console.log('🏪 Initializing sellView');
    this.container = document.querySelector('#sell-view');
    if (!this.container) {
      console.error('❌ Sell view container not found');
      return;
    }

    this.setupFloatingButton();
    this.setupEventListeners();
    
    await this.loadProducts();
  },

  setupEventListeners() {
    console.log('🔗 Setting up sellView event listeners');
    
    document.addEventListener('productsUpdated', () => {
      console.log('📦 Products updated, reloading...');
      this.loadProducts();
    });

    document.addEventListener('stockUpdated', () => {
      console.log('📊 Stock updated, reloading...');
      this.loadProducts();
    });
  },

  async loadProducts() {
    console.log('📦 Loading products...');
    Spinner.show();
    
    try {
      this.allCategories = await productService.fetchAllProductsGroupedByCategory();
      
      if (this.allCategories) {
        console.log('✅ Products loaded:', this.allCategories);
        
        this.allCategories = this.allCategories.map(cat => {
          const rawName = (cat.name || '').toLowerCase();
          if (rawName.includes('ยา')) return { ...cat, name: 'ยา' };
          if (rawName.includes('บุหรี่')) return { ...cat, name: 'บุหรี่' };
          if (rawName.includes('น้ำ')) return { ...cat, name: 'น้ำ/ผสม' };
          return { ...cat, name: 'อื่นๆ' };
        });

        const order = ['น้ำ/ผสม', 'บุหรี่', 'ยา', 'อื่นๆ'];
        this.allCategories.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));

        if (!this.activeCategoryId && this.allCategories.length > 0) {
          this.activeCategoryId = this.allCategories[0].id;
        }

        this.render();
      } else {
        console.error('❌ Failed to load products');
        this.container.innerHTML = `<p class="error-message">ไม่สามารถโหลดข้อมูลสินค้าได้</p>`;
      }
    } catch (error) {
      console.error('💥 Error loading products:', error);
      this.container.innerHTML = `<p class="error-message">เกิดข้อผิดพลาด: ${error.message}</p>`;
    } finally {
      Spinner.hide();
    }
  },

  render() {
    if (!this.container) return;

    console.log('🎨 Rendering sellView');
    this.container.innerHTML = '';
    this.renderCategoryFilter();
    this.renderProductGrid();
  },

  renderCategoryFilter() {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'category-filter-container';

    this.allCategories.forEach(cat => {
      const icon = this.categoryIcons[cat.name] || this.categoryIcons['อื่นๆ'];
      const btn = this.createFilterButton(cat, icon);
      filterContainer.appendChild(btn);
    });

    this.container.appendChild(filterContainer);
  },

  createFilterButton(category, icon) {
    const btn = document.createElement('button');
    btn.className = 'category-filter-btn';
    btn.dataset.categoryId = category.id;
    btn.innerHTML = `${icon}<span>${category.name}</span>`;
    if (this.activeCategoryId === category.id) {
      btn.classList.add('active');
    }
    btn.addEventListener('click', () => {
      console.log('📂 Category selected:', category.name);
      this.activeCategoryId = category.id;
      this.render();
    });
    return btn;
  },

  renderProductGrid() {
    const productGrid = document.createElement('div');
    productGrid.className = 'product-grid';
    const categoriesToDisplay = this.allCategories.filter(c => c.id === this.activeCategoryId);

    if (categoriesToDisplay.length === 0 || categoriesToDisplay[0].products.length === 0) {
      productGrid.innerHTML = `<p class="empty-message">ไม่พบสินค้าในหมวดหมู่นี้</p>`;
    } else {
      categoriesToDisplay.forEach(category => {
        category.products.forEach(product => {
          const item = this.createProductItemElement(product);
          productGrid.appendChild(item);
        });
      });
    }

    this.container.appendChild(productGrid);
  },

  // --- [เริ่ม] ฟังก์ชันที่เพิ่มใหม่ ---
  getCategoryForProduct(product) {
    return this.allCategories.find(cat => cat.products.some(p => p.id === product.id));
  },

  createPlaceholder(product) {
    const category = this.getCategoryForProduct(product);
    const categoryName = category ? category.name : 'อื่นๆ';
    const iconSVG = this.categoryIcons[categoryName] || this.categoryIcons['อื่นๆ'];

    const placeholderSVG = `
        <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="rgba(255, 255, 255, 0.0)"/>
            <g transform="translate(38, 38) scale(2.0)">
                ${iconSVG}
            </g>
        </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(placeholderSVG)))}`;
  },
  // --- [จบ] ฟังก์ชันที่เพิ่มใหม่ ---

  createProductItemElement(product) {
    const item = document.createElement('div');
    item.className = 'product-item';
    const stockText = product.stock_quantity > 0 ? `เหลือ: ${product.stock_quantity}` : 'หมด';
    
    let priceDisplay;
    const hasMultiPrice = product.multi_prices && Array.isArray(product.multi_prices) && product.multi_prices.length > 1;

    if (hasMultiPrice) {
      priceDisplay = `<span class="product-item-price multi-price-text">หลายราคา</span>`;
    } else {
      priceDisplay = `<span class="product-item-price">${product.base_price} บาท</span>`;
    }

    // --- [เริ่ม] ส่วนที่แก้ไข ---
    const finalImageUrl = product.image_url || this.createPlaceholder(product);

    item.innerHTML = `
      <div class="product-item-image-container">
        <img class="product-item-image" src="${finalImageUrl}" alt="${product.name}">
      </div>
      <div class.product-item-name">${product.name}</div>
      <div class="product-item-footer">
        ${priceDisplay}
        <span class="product-item-stock">${stockText}</span>
      </div>
    `;
    // --- [จบ] ส่วนที่แก้ไข ---

    if (product.stock_quantity > 0) {
      item.addEventListener('click', () => {
        console.log('🛍️ Product clicked:', product.name);
        console.log('💰 Multi prices:', product.multi_prices);
        
        if (hasMultiPrice) {
          console.log('🏷️ Opening price selector for multi-price product');
          const event = new CustomEvent('openPriceSelector', { 
            detail: { product },
            bubbles: true 
          });
          window.dispatchEvent(event);
        } else {
          console.log('💰 Adding single-price product to cart');
          cartStore.addItem(product, product.base_price);
        }
      });
    } else {
      item.classList.add('out-of-stock');
    }

    return item;
  },

  setupFloatingButton() {
    console.log('🎈 Setting up floating checkout button');
    const checkoutBtnId = 'checkout-btn-floating';

    const createCheckoutButton = () => {
      const existingBtn = document.getElementById(checkoutBtnId);
      if (existingBtn) {
        existingBtn.remove();
      }
      
      const btn = document.createElement('button');
      btn.id = checkoutBtnId;
      btn.className = 'checkout-btn';
      btn.style.display = 'none';
      document.body.appendChild(btn);

      btn.addEventListener('click', () => {
        console.log('🛒 Floating checkout button clicked');
        const event = new CustomEvent('openCheckoutModal', { bubbles: true });
        window.dispatchEvent(event);
      });

      console.log('✅ Checkout button created and added to DOM');
    };

    const toggleCheckoutButton = (cartState) => {
      const btn = document.getElementById(checkoutBtnId);
      if (!btn) {
        console.log('⚠️ Checkout button not found, creating new one');
        createCheckoutButton();
        return;
      }

      const itemCount = cartState.items.reduce((sum, item) => sum + item.quantity, 0);
      console.log('🛍️ Cart item count:', itemCount, 'Total:', cartState.total);

      if (itemCount > 0) {
        btn.textContent = `ชำระเงิน (${itemCount} รายการ) - ${cartState.total.toFixed(2)} ฿`;
        btn.style.display = 'block';
        btn.classList.add('show');
        console.log('✅ Checkout button shown');
      } else {
        btn.style.display = 'none';
        btn.classList.remove('show');
        console.log('❌ Checkout button hidden');
      }
    };

    createCheckoutButton();

    document.addEventListener('cartUpdated', (e) => {
      console.log('🛍️ Cart updated in sellView:', e.detail);
      toggleCheckoutButton(e.detail);
    });

    const currentCartState = {
      items: cartStore.getItems(),
      total: cartStore.getTotal()
    };
    toggleCheckoutButton(currentCartState);
  }
};

export { sellView };
