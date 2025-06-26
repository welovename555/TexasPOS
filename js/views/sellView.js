import { Spinner } from '../components/spinner.js';
import { productService } from '../services/productService.js';
import { cartStore } from '../stores/cartStore.js';
import { priceSelectorModal } from '../components/priceSelectorModal.js';

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
    this.container = document.querySelector('#sell-view');
    Spinner.show();
    this.allCategories = await productService.fetchAllProductsGroupedByCategory();
    Spinner.hide();

    if (this.allCategories) {
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
      this.container.innerHTML = `<p class="error-message">ไม่สามารถโหลดข้อมูลสินค้าได้</p>`;
    }
  },

  render() {
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

  createProductItemElement(product) {
    const item = document.createElement('div');
    item.className = 'product-item';

    const stockText = product.stock_quantity > 0 ? `เหลือ: ${product.stock_quantity}` : 'หมด';

    item.innerHTML = `
      <div class="product-item-image-container">
        <img class="product-item-image" src="${product.image_url || 'https://jkenfjjxwdckmvqjkdkp.supabase.co/storage/v1/object/public/product-images/placeholder.png'}" alt="${product.name}">
      </div>
      <div class="product-item-name">${product.name}</div>
      <div class="product-item-footer">
        <span class="product-item-price">${product.base_price} บาท</span>
        <span class="product-item-stock">${stockText}</span>
      </div>
    `;

    if (product.stock_quantity > 0) {
      item.addEventListener('click', () => {
  if (product.multi_prices && Array.isArray(product.multi_prices)) {
    const event = new CustomEvent('openPriceSelector', { detail: { product } });
    window.dispatchEvent(event);
  } else {
    cartStore.addItem(product);
  }
});
    } else {
      item.classList.add('out-of-stock');
    }

    return item;
  }
};

export { sellView };

document.addEventListener('DOMContentLoaded', () => {
  const checkoutBtnId = 'checkout-btn-floating';

  const createCheckoutButton = () => {
    let btn = document.getElementById(checkoutBtnId);
    if (!btn) {
      btn = document.createElement('button');
      btn.id = checkoutBtnId;
      btn.className = 'checkout-btn';
      btn.textContent = 'ชำระเงิน';
      btn.addEventListener('click', () => {
        const event = new CustomEvent('openCheckoutModal');
        window.dispatchEvent(event);
      });
      document.body.appendChild(btn);
    }
  };

  const toggleCheckoutButton = (visible) => {
    const btn = document.getElementById(checkoutBtnId);
    if (btn) btn.style.display = visible ? 'block' : 'none';
  };

  createCheckoutButton();
  toggleCheckoutButton(false);

  document.addEventListener('cartUpdated', (e) => {
    const items = e.detail.items || [];
    toggleCheckoutButton(items.length > 0);
  });
});

document.addEventListener('stockUpdated', async () => {
  try {
    Spinner.show();
    const updatedData = await productService.fetchAllProductsGroupedByCategory();

    if (updatedData) {
      sellView.allCategories = updatedData.map(cat => {
        const rawName = (cat.name || '').toLowerCase();

        if (rawName.includes('ยา')) return { ...cat, name: 'ยา' };
        if (rawName.includes('บุหรี่')) return { ...cat, name: 'บุหรี่' };
        if (rawName.includes('น้ำ')) return { ...cat, name: 'น้ำ/ผสม' };
        return { ...cat, name: 'อื่นๆ' };
      });

      const order = ['น้ำ/ผสม', 'บุหรี่', 'ยา', 'อื่นๆ'];
      sellView.allCategories.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));

      sellView.render();
    }
  } catch (error) {
    console.error('Error refreshing product stock:', error.message);
  } finally {
    Spinner.hide();
  }
});
