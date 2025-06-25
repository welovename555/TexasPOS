import { Spinner } from '../components/spinner.js';
import { productService } from '../services/productService.js';
import { cartStore } from '../stores/cartStore.js';

const sellView = {
  allCategories: [],
  activeCategoryId: 'all',

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

    const allBtn = this.createFilterButton({ id: 'all', name: 'สินค้าทั้งหมด' });
    filterContainer.appendChild(allBtn);

    this.allCategories.forEach(cat => {
      const btn = this.createFilterButton(cat);
      filterContainer.appendChild(btn);
    });
    
    this.container.appendChild(filterContainer);
  },

  createFilterButton(category) {
    const btn = document.createElement('button');
    btn.className = 'category-filter-btn';
    btn.textContent = category.name;
    btn.dataset.categoryId = category.id;
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
