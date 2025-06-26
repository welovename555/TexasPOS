import { productService } from '../services/productService.js';
import { cartStore } from '../stores/cartStore.js';
import { priceSelectorModal } from '../components/priceSelectorModal.js';
import { authStore } from '../stores/authStore.js';
import { shiftStore } from '../stores/shiftStore.js';

const sellView = (() => {
  let productCategories = [];
  let activeCategory = null;

  const init = async () => {
    productCategories = await productService.fetchAllProductsGroupedByCategory();
    if (productCategories && productCategories.length > 0) {
      activeCategory = productCategories.find(cat => cat.products.length > 0)?.id || productCategories.length > 0 ? productCategories [0].id : null;
      renderCategories();
      renderProducts(activeCategory);
    } else {
      renderNoProductsMessage();
    }
    attachEventListeners();

    // Initialize shift if not already active and user is logged in
    if (!shiftStore.state.isActive && authStore.state.isAuthenticated) {
      shiftStore.init();
    }
  };

  const renderNoProductsMessage = () => {
    const productContainer = document.getElementById('product-list-container');
    if (productContainer) {
      productContainer.innerHTML = '<p>ไม่มีสินค้า</p>';
    }
  };

  const renderCategories = () => {
    const categoryListContainer = document.getElementById('category-list');
    if (!categoryListContainer) return;

    categoryListContainer.innerHTML = productCategories
      .map(
        (category) => `
          <button 
            class="category-button ${activeCategory === category.id ? 'active' : ''}"
            data-category-id="${category.id}"
          >
            ${category.name}
          </button>
        `
      )
      .join('');
  };

  const renderProducts = (categoryId) => {
    const productContainer = document.getElementById('product-list-container');
    if (!productContainer) return;

    const category = productCategories.find((cat) => cat.id === categoryId);
    if (!category || !category.products) {
      productContainer.innerHTML = '<p>ไม่มีสินค้าในหมวดนี้</p>';
      return;
    }

    productContainer.innerHTML = category.products
      .map(
        (product) => `
          <div class="product-item" data-product-id="${product.id}">
            <img src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.multi_prices ? 'มีหลายราคา' : `${product.base_price} ฿`}</p>
            <span class="stock-label">คงเหลือ: ${product.stock_quantity}</span>
          </div>
        `
      )
      .join('');
  };

  const attachEventListeners = () => {
    const categoryListContainer = document.getElementById('category-list');
    if (categoryListContainer) {
      categoryListContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('category-button')) {
          const categoryId = event.target.dataset.categoryId;
          activeCategory = categoryId;
          renderCategories();
          renderProducts(activeCategory);
        }
      });
    }

    const productContainer = document.getElementById('product-list-container');
    if (productContainer) {
      productContainer.addEventListener('click', (event) => {
        const productItem = event.target.closest('.product-item');
        if (productItem) {
          const productId = productItem.dataset.productId;
          const selectedProduct = productCategories
            .find((cat) => cat.id === activeCategory)
            ?.products.find((prod) => prod.id === productId);

          if (selectedProduct) {
            if (selectedProduct.multi_prices && selectedProduct.multi_prices.length > 0) {
              // Open the price selector modal
              window.dispatchEvent(new CustomEvent('openPriceSelector', { detail: { product: selectedProduct } }));
            } else {
              cartStore.addItem(selectedProduct);
              document.dispatchEvent(new CustomEvent('cartUpdated'));
            }
          }
        }
      });
    }
  };

  return { init, renderProducts };
})();

export { sellView };

