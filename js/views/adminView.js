import { Spinner } from '../components/spinner.js';
import { productService } from '../services/productService.js';
import { authStore } from '../stores/authStore.js';

const adminView = {
  container: null,
  categories: [],
  products: [],
  isMultiPrice: false,
  priceOptions: [{ label: '', price: 0 }],

  init() {
    this.container = document.querySelector('#admin-view');
    if (!this.container) return;

    if (authStore.state.user?.role !== 'admin') {
      this.showAccessDenied();
      return;
    }

    this.render();
    this.loadInitialData();
  },

  showAccessDenied() {
    this.container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔒</div>
        <div class="empty-state-text">ไม่มีสิทธิ์เข้าถึง</div>
        <div class="empty-state-subtext">เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถเข้าถึงหน้านี้ได้</div>
      </div>
    `;
  },

  render() {
    this.container.innerHTML = `
      <div class="admin-header">
        <h1 class="admin-title">จัดการระบบ</h1>
        <p class="admin-subtitle">เพิ่มสินค้าใหม่และจัดการข้อมูลสินค้า</p>
      </div>

      <div class="admin-sections">
        <div class="admin-section">
          <h2 class="section-title">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            เพิ่มสินค้าใหม่
          </h2>
          
          <form class="product-form" id="add-product-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">ชื่อสินค้า *</label>
                <input type="text" class="form-input" id="product-name" required>
              </div>
              <div class="form-group">
                <label class="form-label">หมวดหมู่ *</label>
                <select class="form-select" id="product-category" required>
                  <option value="">เลือกหมวดหมู่</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">ราคาหลัก (บาท) *</label>
                <input type="number" class="form-input" id="product-price" step="0.01" min="0" required>
              </div>
              <div class="form-group">
                <label class="form-label">สต็อกเริ่มต้น</label>
                <input type="number" class="form-input" id="product-stock" min="0" value="0">
              </div>
            </div>

            <div class="form-group full-width">
              <label class="form-label">รูปภาพสินค้า</label>
              <div class="image-upload-container">
                <div class="image-preview" id="image-preview">
                  <div class="image-placeholder">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21,15 16,10 5,21"></polyline>
                    </svg>
                    <div>คลิกเพื่อเลือกรูป</div>
                  </div>
                </div>
                <button type="button" class="image-upload-btn" id="upload-image-btn">เลือกรูปภาพ</button>
                <input type="file" class="file-input" id="image-file-input" accept="image/*">
              </div>
            </div>

            <div class="form-group full-width">
              <div class="multi-price-container">
                <div class="multi-price-header">
                  <label class="form-label">ระบบหลายราคา</label>
                  <div class="multi-price-toggle" id="multi-price-toggle">
                    <div class="toggle-switch" id="toggle-switch">
                      <div class="toggle-slider"></div>
                    </div>
                    <span>เปิดใช้งานหลายราคา</span>
                  </div>
                </div>
                <div class="price-options" id="price-options">
                  </div>
                <button type="button" class="add-price-btn" id="add-price-btn" style="display: none;">
                  + เพิ่มราคา
                </button>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" id="reset-form-btn">ล้างฟอร์ม</button>
              <button type="submit" class="btn-primary" id="submit-product-btn">เพิ่มสินค้า</button>
            </div>
          </form>
        </div>

        <div class="admin-section">
          <h2 class="section-title">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
            จัดการสินค้า
          </h2>
          
          <div class="product-list" id="product-list">
            </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  },

  attachEventListeners() {
    // Image upload
    const uploadBtn = document.getElementById('upload-image-btn');
    const fileInput = document.getElementById('image-file-input');
    
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => this.handleImageUpload(e));

    // Multi-price toggle
    const multiPriceToggle = document.getElementById('multi-price-toggle');
    multiPriceToggle.addEventListener('click', () => this.toggleMultiPrice());

    // Add price button
    const addPriceBtn = document.getElementById('add-price-btn');
    addPriceBtn.addEventListener('click', () => this.addPriceOption());

    // Form submission
    const form = document.getElementById('add-product-form');
    form.addEventListener('submit', (e) => this.handleFormSubmit(e));

    // Reset form
    const resetBtn = document.getElementById('reset-form-btn');
    resetBtn.addEventListener('click', () => this.resetForm());
  },

  async loadInitialData() {
    Spinner.show();
    
    try {
      const categoriesResult = await productService.fetchCategories();
      if (categoriesResult.success) {
        this.categories = categoriesResult.data;
        this.populateCategoryDropdown();
      }

      const productsResult = await productService.fetchAllProducts();
      if (productsResult.success) {
        this.products = productsResult.data;
        this.renderProductList();
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      Spinner.hide();
    }
  },

  populateCategoryDropdown() {
    const categorySelect = document.getElementById('product-category');
    categorySelect.innerHTML = '<option value="">เลือกหมวดหมู่</option>';
    
    this.categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  },

  renderProductList() {
    const productList = document.getElementById('product-list');
    
    if (!this.products || this.products.length === 0) {
      productList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📦</div>
          <div class="empty-state-text">ยังไม่มีสินค้า</div>
          <div class="empty-state-subtext">เพิ่มสินค้าใหม่เพื่อเริ่มต้นการขาย</div>
        </div>
      `;
      return;
    }
    
    // Helper function to escape characters for HTML attributes
    const escapeHTML = (str) => {
        if (typeof str !== 'string') return '';
        return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    };

    productList.innerHTML = this.products.map(product => {
      const stock = product.product_stocks?.[0]?.stock_quantity ?? 0;
      const category = product.categories?.name || 'ไม่ระบุ';
      const hasMultiPrice = product.multi_prices && product.multi_prices.length > 0;
      const imageUrl = product.image_url || this.getPlaceholderImage(product.name);

      return `
        <div class="product-item-admin" data-product-id="${product.id}">
          <div class="product-image-container">
            <img src="${imageUrl}" 
                 alt="${escapeHTML(product.name)}" 
                 class="product-image-small ${!product.image_url ? 'placeholder-image' : ''}">
            ${!product.image_url ? '<div class="image-overlay">ไม่มีรูป</div>' : ''}
          </div>
          <div class="product-info">
            <div class="product-name-admin">${product.name}</div>
            <div class="product-details">
              ${category} • ราคา ${product.base_price} บาท • สต็อก ${stock}
              ${hasMultiPrice ? ' • มีหลายราคา' : ''}
            </div>
          </div>
          <div class="product-actions">
            <button class="btn-icon edit" title="แก้ไขรูป">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="btn-icon delete" data-product-name="${escapeHTML(product.name)}" title="ลบสินค้า">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach event listeners after rendering
    productList.querySelectorAll('.product-item-admin').forEach(item => {
        const productId = item.dataset.productId;
        
        const editBtn = item.querySelector('.btn-icon.edit');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.editProductImage(productId));
        }

        const deleteBtn = item.querySelector('.btn-icon.delete');
        if (deleteBtn) {
            const productName = deleteBtn.dataset.productName;
            deleteBtn.addEventListener('click', () => this.deleteProduct(productId, productName));
        }
    });
  },

  getPlaceholderImage(productName) {
    const name = productName.toLowerCase();
    
    if (name.includes('น้ำ') || name.includes('ผสม')) {
      return 'data:image/svg+xml;base64,' + btoa(`<svg width="120" height="120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#1e3a8a"/><circle cx="60" cy="60" r="30" fill="#3b82f6" opacity="0.8"/><text x="60" y="90" text-anchor="middle" fill="white" font-size="12" font-family="Arial">น้ำ</text></svg>`);
    } else if (name.includes('บุหรี่')) {
      return 'data:image/svg+xml;base64,' + btoa(`<svg width="120" height="120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#7c2d12"/><rect x="30" y="50" width="60" height="20" fill="#ea580c" opacity="0.8"/><text x="60" y="90" text-anchor="middle" fill="white" font-size="12" font-family="Arial">บุหรี่</text></svg>`);
    } else if (name.includes('ยา')) {
      return 'data:image/svg+xml;base64,' + btoa(`<svg width="120" height="120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#166534"/><path d="M45 30 h30 v60 h-30 z M30 45 h60 v30 h-60 z" fill="#22c55e" opacity="0.8"/><text x="60" y="90" text-anchor="middle" fill="white" font-size="12" font-family="Arial">ยา</text></svg>`);
    } else {
      return 'data:image/svg+xml;base64,' + btoa(`<svg width="120" height="120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#374151"/><rect x="30" y="30" width="60" height="60" fill="#6b7280" opacity="0.8"/><text x="60" y="90" text-anchor="middle" fill="white" font-size="12" font-family="Arial">สินค้า</text></svg>`);
    }
  },

  async handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('ขนาดไฟล์ต้องไม่เกิน 5MB');
      return;
    }

    const imagePreview = document.getElementById('image-preview');
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
  },

  toggleMultiPrice() {
    this.isMultiPrice = !this.isMultiPrice;
    const toggleSwitch = document.getElementById('toggle-switch');
    const priceOptionsContainer = document.getElementById('price-options');
    const addPriceBtn = document.getElementById('add-price-btn');

    toggleSwitch.classList.toggle('active', this.isMultiPrice);
    priceOptionsContainer.classList.toggle('active', this.isMultiPrice);
    addPriceBtn.style.display = this.isMultiPrice ? 'block' : 'none';

    if (this.isMultiPrice && this.priceOptions.length === 0) {
        this.priceOptions = [{ label: '', price: 0 }];
    }
    
    if (this.isMultiPrice) {
        this.renderPriceOptions();
    }
  },

  renderPriceOptions() {
    const priceOptionsContainer = document.getElementById('price-options');
    priceOptionsContainer.innerHTML = this.priceOptions.map((option, index) => `
      <div class="price-option" data-index="${index}">
        <input type="text" class="form-input price-label-input" placeholder="ป้ายกำกับ (เช่น ขวดเล็ก)" value="${option.label}">
        <input type="number" class="form-input price-value-input" placeholder="ราคา" step="0.01" min="0" value="${option.price || ''}">
        <button type="button" class="remove-price-btn" ${this.priceOptions.length <= 1 ? 'style="display:none"' : ''}>×</button>
      </div>
    `).join('');

    // Attach event listeners for price options
    priceOptionsContainer.querySelectorAll('.price-option').forEach(optionEl => {
        const index = parseInt(optionEl.dataset.index);

        optionEl.querySelector('.price-label-input').addEventListener('change', (e) => {
            this.updatePriceOption(index, 'label', e.target.value);
        });

        optionEl.querySelector('.price-value-input').addEventListener('change', (e) => {
            this.updatePriceOption(index, 'price', e.target.value);
        });

        optionEl.querySelector('.remove-price-btn').addEventListener('click', () => {
            this.removePriceOption(index);
        });
    });
  },

  updatePriceOption(index, field, value) {
    this.priceOptions[index][field] = field === 'price' ? parseFloat(value) || 0 : value;
  },

  addPriceOption() {
    this.priceOptions.push({ label: '', price: 0 });
    this.renderPriceOptions();
  },

  removePriceOption(index) {
    if (this.priceOptions.length > 1) {
      this.priceOptions.splice(index, 1);
      this.renderPriceOptions();
    }
  },

  async handleFormSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submit-product-btn');
    const originalText = submitBtn.textContent;
    
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'กำลังเพิ่มสินค้า...';

      const formData = {
        name: document.getElementById('product-name').value.trim(),
        category_id: document.getElementById('product-category').value,
        base_price: parseFloat(document.getElementById('product-price').value),
        initial_stock: parseInt(document.getElementById('product-stock').value) || 0
      };

      if (!formData.name || !formData.category_id || isNaN(formData.base_price)) {
        alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วนและถูกต้อง');
        return;
      }

      const fileInput = document.getElementById('image-file-input');
      if (fileInput.files[0]) {
        const uploadResult = await productService.uploadProductImage(fileInput.files[0]);
        if (uploadResult.success) {
          formData.image_url = uploadResult.url;
        } else {
          alert('ไม่สามารถอัปโหลดรูปภาพได้: ' + uploadResult.error.message);
          return;
        }
      }

      if (this.isMultiPrice) {
        const validPrices = this.priceOptions.filter(option => 
          option.label.trim() && !isNaN(option.price) && option.price > 0
        );
        if (validPrices.length > 0) {
          formData.multi_prices = validPrices;
        }
      }

      const result = await productService.createProduct(formData);
      
      if (result.success) {
        alert('เพิ่มสินค้าสำเร็จ!');
        this.resetForm();
        this.loadInitialData();
        document.dispatchEvent(new CustomEvent('productsUpdated'));
      } else {
        alert('ไม่สามารถเพิ่มสินค้าได้: ' + result.error.message);
      }

    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  },

  resetForm() {
    document.getElementById('add-product-form').reset();
    document.getElementById('image-preview').innerHTML = `
      <div class="image-placeholder">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21,15 16,10 5,21"></polyline>
        </svg>
        <div>คลิกเพื่อเลือกรูป</div>
      </div>
    `;
    
    this.isMultiPrice = false;
    this.priceOptions = [{ label: '', price: 0 }];
    document.getElementById('toggle-switch').classList.remove('active');
    document.getElementById('price-options').classList.remove('active');
    document.getElementById('add-price-btn').style.display = 'none';
    this.renderPriceOptions(); // Clear the options visually
  },

  async editProductImage(productId) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('ขนาดไฟล์ต้องไม่เกิน 5MB');
        return;
      }

      try {
        Spinner.show();
        const uploadResult = await productService.uploadProductImage(file);
        if (!uploadResult.success) {
          alert('ไม่สามารถอัปโหลดรูปภาพได้: ' + uploadResult.error.message);
          return;
        }

        const updateResult = await productService.updateProductImage(productId, uploadResult.url);
        if (updateResult.success) {
          alert('อัปเดตรูปภาพสำเร็จ!');
          this.loadInitialData();
          document.dispatchEvent(new CustomEvent('productsUpdated'));
        } else {
          alert('ไม่สามารถอัปเดตรูปภาพได้: ' + updateResult.error.message);
        }

      } catch (error) {
        alert('เกิดข้อผิดพลาด: ' + error.message);
      } finally {
        Spinner.hide();
      }
    };

    fileInput.click();
  },

  async deleteProduct(productId, productName) {
    const confirmed = confirm(`คุณต้องการลบสินค้า "${productName}" หรือไม่?\n\nการลบจะไม่สามารถกู้คืนได้`);
    if (!confirmed) return;

    const doubleConfirmed = confirm(`ยืนยันอีกครั้ง: ลบสินค้า "${productName}" ใช่หรือไม่?`);
    if (!doubleConfirmed) return;

    try {
      Spinner.show();
      const result = await productService.deleteProduct(productId);
      
      if (result.success) {
        alert('ลบสินค้าสำเร็จ!');
        this.loadInitialData();
        document.dispatchEvent(new CustomEvent('productsUpdated'));
      } else {
        alert('ไม่สามารถลบสินค้าได้: ' + result.error.message);
      }

    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      Spinner.hide();
    }
  }
};

export { adminView };
