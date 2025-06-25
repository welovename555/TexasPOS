import { Spinner } from '../components/spinner.js';
import { productService } from '../services/productService.js';
import { cartStore } from '../stores/cartStore.js';

const sellView = {
  allCategories: [],
  activeCategoryId: 'all',

  // ไอคอนสำหรับแต่ละหมวดหมู่ (SVG)
  categoryIcons: {
    'น้ำ/ผสม': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.2 3.8a2 2 0 0 1 2.8 2.8l-4.4 4.4-4-4Z"/><path d="m14 14-4.4 4.4a2 2 0 0 1-2.8-2.8l4.4-4.4Z"/><path d="M8 8  l.9.9"/><path d="M13 2v2"/><path d="M19 8h2"/><path d="M3 11H1"/><path d="M12 21v2"/></svg>`,
    'บุหรี่': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1m-6-1v4"/><path d="M18 18H5a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h13v5a2 2 0 0 1-2 2Z"/></svg>`,
    'ยา': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 7-7"/><path d="m17.5 13.5 7-7"/><path d="M5 15.5l-1-1L14.5 4l1 1L5 15.5Z"/><path d="M12.5 18.5 9 22l-1-1 3.5-3.5"/><path d="M8.5 11.5 5 15l-1-1 3.5-3.5"/><path d="m22 2-1.5 1.5"/><path d="M13.5 9.5 12 11l-4-4 1.5-1.5L13.5 9.5Z"/></svg>`,
    'อื่นๆ': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`,
  },

  async init() {
    this.container = document.querySelector('#sell-view');
    Spinner.show();
    this.allCategories = await productService.fetchAllProductsGroupedByCategory();
    Spinner.hide();
    
    if (this.allCategories) {
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

    // เรียงลำดับหมวดหมู่ตามที่คุณต้องการ
    const sortedCategories = [
      { id: 'all', name: 'ทั้งหมด', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>` },
      ...this.allCategories.sort((a, b) => {
        const order = ['น้ำ/ผสม', 'บุหรี่', 'ยา', 'อื่นๆ'];
        return order.indexOf(a.name) - order.indexOf(b.name);
      })
    ];

    sortedCategories.forEach(cat => {
      const icon = cat.icon || this.categoryIcons[cat.name] || this.categoryIcons['อื่นๆ'];
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
    if(this.activeCategoryId === category.id) {
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
    
    const categoriesToDisplay = this.activeCategoryId === 'all'
      ? this.allCategories
      : this.allCategories.filter(c => c.id === this.activeCategoryId);

    if(categoriesToDisplay.length === 0) {
        productGrid.innerHTML = `<p class="empty-message">ไม่พบสินค้าในหมวดหมู่นี้</p>`
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

    if(product.stock_quantity > 0){
        item.addEventListener('click', () => cartStore.addItem(product));
    } else {
        item.classList.add('out-of-stock');
    }

    return item;
  }
};

export { sellView };
