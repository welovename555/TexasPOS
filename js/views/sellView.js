import { Spinner } from '../components/spinner.js';
import { productService } from '../services/productService.js';
import { cartStore } from '../stores/cartStore.js';

const sellView = {
  async init() {
    this.container = document.querySelector('#sell-view');
    Spinner.show();
    const categories = await productService.fetchAllProductsGroupedByCategory();
    Spinner.hide();
    if (categories) this.render(categories);
    else this.container.innerHTML = `<p class="error-message">ไม่สามารถโหลดข้อมูลสินค้าได้</p>`;
  },
  render(categories) {
    this.container.innerHTML = '';
    categories.forEach(category => {
      const section = document.createElement('div');
      section.className = 'category-section';
      section.innerHTML = `<h2 class="category-header">${category.name}</h2>`;
      const grid = document.createElement('div');
      grid.className = 'product-grid';
      category.products.forEach(product => {
        const item = this.createProductItemElement(product);
        grid.appendChild(item);
      });
      section.appendChild(grid);
      this.container.appendChild(section);
    });
  },
  createProductItemElement(product) {
    const item = document.createElement('div');
    item.className = 'product-item';
    item.innerHTML = `
      <div class="product-item-image-container">
        <img class="product-item-image" src="${product.image_url || 'https://jkenfjjxwdckmvqjkdkp.supabase.co/storage/v1/object/public/product-images/placeholder.png'}" alt="${product.name}">
      </div>
      <div class="product-item-name">${product.name}</div>
      <div class="product-item-price">${product.base_price} บาท</div>
    `;
    item.addEventListener('click', () => cartStore.addItem(product));
    return item;
  }
};
export { sellView };
