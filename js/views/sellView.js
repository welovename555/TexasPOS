const sellView = {
  init() {
    this.container = document.querySelector('#sell-view');
    this.loadProducts();
  },

  async loadProducts() {
    Spinner.show();
    const categoriesWithProducts = await productService.fetchAllProductsGroupedByCategory();
    Spinner.hide();

    if (categoriesWithProducts) {
      this.render(categoriesWithProducts);
    } else {
      this.container.innerHTML = '<p class="error-message">ไม่สามารถโหลดข้อมูลสินค้าได้</p>';
    }
  },

  render(categories) {
    this.container.innerHTML = '';
    
    categories.forEach(category => {
      const categorySection = document.createElement('div');
      categorySection.className = 'category-section';

      const categoryHeader = document.createElement('h2');
      categoryHeader.className = 'category-header';
      categoryHeader.textContent = category.name;

      const productGrid = document.createElement('div');
      productGrid.className = 'product-grid';

      category.products.forEach(product => {
        const productItem = this.createProductItemElement(product);
        productGrid.appendChild(productItem);
      });

      categorySection.appendChild(categoryHeader);
      categorySection.appendChild(productGrid);
      this.container.appendChild(categorySection);
    });
  },

  createProductItemElement(product) {
    const item = document.createElement('div');
    item.className = 'product-item';
    item.dataset.productId = product.id;

    const imageContainer = document.createElement('div');
    imageContainer.className = 'product-item-image-container';

    const image = document.createElement('img');
    image.className = 'product-item-image';
    image.src = product.image_url || 'https://jkenfjjxwdckmvqjkdkp.supabase.co/storage/v1/object/public/product-images/placeholder.png';
    image.alt = product.name;

    const name = document.createElement('div');
    name.className = 'product-item-name';
    name.textContent = product.name;

    const price = document.createElement('div');
    price.className = 'product-item-price';
    price.textContent = `${product.base_price} บาท`;
    
    imageContainer.appendChild(image);
    item.appendChild(imageContainer);
    item.appendChild(name);
    item.appendChild(price);

    item.addEventListener('click', () => {
      cartStore.addItem(product);
    });

    return item;
  }
};
