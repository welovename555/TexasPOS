import { Spinner } from '../components/spinner.js';
import { Modal } from '../components/modal.js';
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

      <div class="admin-dashboard">
        <div class="admin-card add-product" id="add-product-card">
          <span class="admin-card-icon">➕</span>
          <h3 class="admin-card-title">เพิ่มสินค้าใหม่</h3>
          <p class="admin-card-description">เพิ่มสินค้าใหม่เข้าสู่ระบบ</p>
        </div>
        
        <div class="admin-card manage-products" id="manage-products-card">
          <span class="admin-card-icon">⚙️</span>
          <h3 class="admin-card-title">จัดการสินค้า</h3>
          <p class="admin-card-description">แก้ไขหรือลบสินค้าที่มีอยู่</p>
        </div>
      </div>
    `;

    this.attachEventListeners();
  },

  attachEventListeners() {
    const addProductCard = document.getElementById('add-product-card');
    const manageProductsCard = document.getElementById('manage-products-card');

    addProductCard.addEventListener('click', () => this.showAddProductModal());
    manageProductsCard.addEventListener('click', () => this.showCategorySelectionModal());
  },

  async loadInitialData() {
    try {
      const [categoriesResult, productsResult] = await Promise.all([
        productService.fetchCategories(),
        productService.fetchAllProducts()
      ]);

      if (categoriesResult.success) {
        this.categories = categoriesResult.data;
      }

      if (productsResult.success) {
        this.products = productsResult.data;
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  },

  showAddProductModal() {
    const modal = Modal.create({
      title: '➕ เพิ่มสินค้าใหม่',
      body: this.renderAddProductForm(),
      footer: `
        <button class="btn btn-secondary" id="reset-form-btn">🔄 ล้างฟอร์ม</button>
        <button class="btn btn-primary" id="submit-product-btn">✅ เพิ่มสินค้า</button>
      `
    });

    // Add custom class for scrollable content
    const modalContainer = modal.modalElement.querySelector('.modal-container');
    modalContainer.style.maxHeight = '90vh';
    modalContainer.style.overflow = 'hidden';
    
    const modalBody = modal.modalElement.querySelector('.modal-body');
    modalBody.className += ' admin-modal-content';

    setTimeout(() => this.attachAddProductEvents(modal), 100);
  },

  renderAddProductForm() {
    return `
      <form class="product-form" id="add-product-form">
        <div class="form-group">
          <label class="form-label">📝 ชื่อสินค้า *</label>
          <input type="text" class="form-input" id="product-name" placeholder="กรอกชื่อสินค้า" required>
        </div>

        <div class="form-group">
          <label class="form-label">📂 หมวดหมู่ *</label>
          <select class="form-select" id="product-category" required>
            <option value="">เลือกหมวดหมู่</option>
            ${this.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">💰 ราคาหลัก (บาท) *</label>
            <input type="number" class="form-input" id="product-price" step="0.01" min="0" placeholder="0.00" required>
          </div>
          <div class="form-group">
            <label class="form-label">📦 สต็อกเริ่มต้น</label>
            <input type="number" class="form-input" id="product-stock" min="0" value="0" placeholder="0">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">🖼️ รูปภาพสินค้า</label>
          <div class="image-upload-container">
            <div class="image-preview" id="image-preview">
              <div class="image-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21,15 16,10 5,21"></polyline>
                </svg>
                <div>แตะเพื่อเลือกรูป</div>
              </div>
            </div>
            <button type="button" class="image-upload-btn" id="upload-image-btn">📷 เลือกรูปภาพ</button>
            <input type="file" class="file-input" id="image-file-input" accept="image/*">
          </div>
        </div>

        <div class="form-group">
          <div class="multi-price-container">
            <div class="multi-price-header">
              <label class="form-label">🏷️ ระบบหลายราคา</label>
              <div class="multi-price-toggle" id="multi-price-toggle">
                <div class="toggle-switch" id="toggle-switch">
                  <div class="toggle-slider"></div>
                </div>
                <span>เปิดใช้งาน</span>
              </div>
            </div>
            <div class="price-options" id="price-options"></div>
            <button type="button" class="add-price-btn" id="add-price-btn" style="display: none;">
              ➕ เพิ่มราคา
            </button>
          </div>
        </div>
      </form>
    `;
  },

  attachAddProductEvents(modal) {
    // Image upload
    const uploadBtn = document.getElementById('upload-image-btn');
    const fileInput = document.getElementById('image-file-input');
    const imagePreview = document.getElementById('image-preview');
    
    uploadBtn.addEventListener('click', () => fileInput.click());
    imagePreview.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => this.handleImageUpload(e));

    // Multi-price toggle
    const multiPriceToggle = document.getElementById('multi-price-toggle');
    multiPriceToggle.addEventListener('click', () => this.toggleMultiPrice());

    // Add price button
    const addPriceBtn = document.getElementById('add-price-btn');
    addPriceBtn.addEventListener('click', () => this.addPriceOption());

    // Form submission
    const submitBtn = document.getElementById('submit-product-btn');
    submitBtn.addEventListener('click', (e) => this.handleFormSubmit(e, modal));

    // Reset form
    const resetBtn = document.getElementById('reset-form-btn');
    resetBtn.addEventListener('click', () => this.resetAddProductForm());
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

  async handleFormSubmit(event, modal) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submit-product-btn');
    const originalText = submitBtn.innerHTML;
    
    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '⏳ กำลังเพิ่มสินค้า...';

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
        modal.close();
        this.showSuccessMessage('✅ เพิ่มสินค้าสำเร็จ!');
        this.loadInitialData();
        document.dispatchEvent(new CustomEvent('productsUpdated'));
      } else {
        alert('ไม่สามารถเพิ่มสินค้าได้: ' + result.error.message);
      }

    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  },

  resetAddProductForm() {
    document.getElementById('add-product-form').reset();
    document.getElementById('image-preview').innerHTML = `
      <div class="image-placeholder">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21,15 16,10 5,21"></polyline>
        </svg>
        <div>แตะเพื่อเลือกรูป</div>
      </div>
    `;
    
    this.isMultiPrice = false;
    this.priceOptions = [{ label: '', price: 0 }];
    document.getElementById('toggle-switch').classList.remove('active');
    document.getElementById('price-options').classList.remove('active');
    document.getElementById('add-price-btn').style.display = 'none';
  },

  showCategorySelectionModal() {
    const categoriesWithCounts = this.categories.map(category => {
      const productCount = this.products.filter(p => p.category_id === category.id).length;
      return { ...category, productCount };
    });

    const modal = Modal.create({
      title: '📂 เลือกหมวดหมู่สินค้า',
      body: `
        <div class="category-selection">
          ${categoriesWithCounts.map(category => `
            <div class="category-option" data-category-id="${category.id}">
              <span class="category-option-icon">${this.getCategoryIcon(category.name)}</span>
              <div class="category-option-info">
                <div class="category-option-name">${category.name}</div>
                <div class="category-option-count">${category.productCount} สินค้า</div>
              </div>
              <span class="product-option-arrow">›</span>
            </div>
          `).join('')}
        </div>
      `,
      footer: `<button class="btn btn-cancel">❌ ยกเลิก</button>`
    });

    setTimeout(() => {
      modal.modalElement.querySelectorAll('.category-option').forEach(option => {
        option.addEventListener('click', () => {
          const categoryId = option.dataset.categoryId;
          modal.close();
          this.showProductSelectionModal(categoryId);
        });
      });
    }, 100);
  },

  getCategoryIcon(categoryName) {
    const name = categoryName.toLowerCase();
    if (name.includes('น้ำ') || name.includes('ผสม')) return '🥤';
    if (name.includes('บุหรี่')) return '🚬';
    if (name.includes('ยา')) return '💊';
    return '📦';
  },

  showProductSelectionModal(categoryId) {
    const categoryProducts = this.products.filter(p => p.category_id === categoryId);
    const category = this.categories.find(c => c.id === categoryId);

    const modal = Modal.create({
      title: `🛍️ เลือกสินค้าใน ${category?.name || 'หมวดหมู่'}`,
      body: `
        <div class="product-selection">
          ${categoryProducts.map(product => `
            <div class="product-option" data-product-id="${product.id}">
              <img src="${product.image_url || this.getPlaceholderImage(product.name)}" 
                   alt="${product.name}" class="product-option-image">
              <div class="product-option-info">
                <div class="product-option-name">${product.name}</div>
                <div class="product-option-details">
                  ราคา ${product.base_price} บาท • สต็อก ${this.getStockQuantity(product)}
                  ${product.multi_prices && product.multi_prices.length > 0 ? ' • มีหลายราคา' : ''}
                </div>
              </div>
              <span class="product-option-arrow">›</span>
            </div>
          `).join('')}
        </div>
      `,
      footer: `
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').querySelector('[data-category-id]') ? this.closest('.modal-overlay').remove() : null">⬅️ กลับ</button>
        <button class="btn btn-cancel">❌ ยกเลิก</button>
      `
    });

    setTimeout(() => {
      modal.modalElement.querySelectorAll('.product-option').forEach(option => {
        option.addEventListener('click', () => {
          const productId = option.dataset.productId;
          modal.close();
          this.showEditProductModal(productId);
        });
      });
    }, 100);
  },

  getPlaceholderImage(productName) {
    const name = productName.toLowerCase();
    const utf8_to_b64 = (str) => {
      return window.btoa(unescape(encodeURIComponent(str)));
    };

    if (name.includes('น้ำ') || name.includes('ผสม')) {
      return 'data:image/svg+xml;base64,' + utf8_to_b64(`<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="#1e3a8a" rx="8"/><circle cx="30" cy="30" r="15" fill="#3b82f6" opacity="0.8"/><text x="30" y="45" text-anchor="middle" fill="white" font-size="8" font-family="Arial">🥤</text></svg>`);
    } else if (name.includes('บุหรี่')) {
      return 'data:image/svg+xml;base64,' + utf8_to_b64(`<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="#7c2d12" rx="8"/><rect x="15" y="25" width="30" height="8" fill="#ea580c" opacity="0.8" rx="4"/><text x="30" y="45" text-anchor="middle" fill="white" font-size="8" font-family="Arial">🚬</text></svg>`);
    } else if (name.includes('ยา')) {
      return 'data:image/svg+xml;base64,' + utf8_to_b64(`<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="#166534" rx="8"/><path d="M22 15 h16 v30 h-16 z M15 22 h30 v16 h-30 z" fill="#22c55e" opacity="0.8"/><text x="30" y="45" text-anchor="middle" fill="white" font-size="8" font-family="Arial">💊</text></svg>`);
    } else {
      return 'data:image/svg+xml;base64,' + utf8_to_b64(`<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="#374151" rx="8"/><rect x="15" y="15" width="30" height="30" fill="#6b7280" opacity="0.8" rx="6"/><text x="30" y="45" text-anchor="middle" fill="white" font-size="8" font-family="Arial">📦</text></svg>`);
    }
  },

  getStockQuantity(product) {
    return product.product_stocks?.[0]?.stock_quantity ?? 0;
  },

  showEditProductModal(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const modal = Modal.create({
      title: `✏️ แก้ไข: ${product.name}`,
      body: this.renderEditProductForm(product),
      footer: `
        <button class="btn btn-danger" id="delete-product-btn">🗑️ ลบสินค้า</button>
        <button class="btn btn-secondary" id="update-image-btn">📷 เปลี่ยนรูป</button>
        <button class="btn btn-primary" id="save-changes-btn">💾 บันทึก</button>
      `
    });

    // Add custom class for scrollable content
    const modalContainer = modal.modalElement.querySelector('.modal-container');
    modalContainer.style.maxHeight = '90vh';
    modalContainer.style.overflow = 'hidden';
    
    const modalBody = modal.modalElement.querySelector('.modal-body');
    modalBody.className += ' admin-modal-content';

    setTimeout(() => this.attachEditProductEvents(modal, product), 100);
  },

  renderEditProductForm(product) {
    const category = this.categories.find(c => c.id === product.category_id);
    const stock = this.getStockQuantity(product);

    return `
      <div class="edit-product-form">
        <div class="edit-form-section">
          <h4 class="edit-section-title">📝 ข้อมูลพื้นฐาน</h4>
          <div class="form-group">
            <label class="form-label">ชื่อสินค้า</label>
            <input type="text" class="form-input" id="edit-product-name" value="${product.name}">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">ราคาหลัก (บาท)</label>
              <input type="number" class="form-input" id="edit-product-price" step="0.01" min="0" value="${product.base_price}">
            </div>
            <div class="form-group">
              <label class="form-label">หมวดหมู่</label>
              <select class="form-select" id="edit-product-category">
                ${this.categories.map(cat => 
                  `<option value="${cat.id}" ${cat.id === product.category_id ? 'selected' : ''}>${cat.name}</option>`
                ).join('')}
              </select>
            </div>
          </div>
        </div>

        <div class="edit-form-section">
          <h4 class="edit-section-title">📊 ข้อมูลเพิ่มเติม</h4>
          <div class="form-group">
            <label class="form-label">สต็อกปัจจุบัน: <strong style="color: var(--color-accent-secondary);">${stock} ชิ้น</strong></label>
            <p style="font-size: 0.8rem; color: var(--color-text-secondary); margin: 4px 0 0 0;">
              💡 ใช้หน้าจัดการสต็อกเพื่อเพิ่มสต็อก
            </p>
          </div>
          ${product.multi_prices && product.multi_prices.length > 0 ? `
            <div class="form-group">
              <label class="form-label">ระบบหลายราคา</label>
              <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                ${product.multi_prices.map(price => `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>${price.label || 'ไม่มีป้ายกำกับ'}</span>
                    <strong>${price.price} บาท</strong>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <div class="edit-form-section">
          <h4 class="edit-section-title">🖼️ รูปภาพสินค้า</h4>
          <div class="image-upload-container">
            <div class="image-preview">
              ${product.image_url ? 
                `<img src="${product.image_url}" alt="${product.name}">` : 
                `<div class="image-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21,15 16,10 5,21"></polyline>
                  </svg>
                  <div>ไม่มีรูปภาพ</div>
                </div>`
              }
            </div>
          </div>
        </div>
      </div>
      <input type="file" id="edit-image-file-input" accept="image/*" style="display: none;">
    `;
  },

  attachEditProductEvents(modal, product) {
    const deleteBtn = document.getElementById('delete-product-btn');
    const updateImageBtn = document.getElementById('update-image-btn');
    const saveBtn = document.getElementById('save-changes-btn');
    const fileInput = document.getElementById('edit-image-file-input');

    deleteBtn.addEventListener('click', () => this.confirmDeleteProduct(product, modal));
    updateImageBtn.addEventListener('click', () => fileInput.click());
    saveBtn.addEventListener('click', () => this.saveProductChanges(product, modal));

    fileInput.addEventListener('change', (e) => this.handleEditImageUpload(e, product, modal));
  },

  async handleEditImageUpload(event, product, modal) {
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

    const updateImageBtn = document.getElementById('update-image-btn');
    const originalText = updateImageBtn.innerHTML;

    try {
      updateImageBtn.disabled = true;
      updateImageBtn.innerHTML = '⏳ กำลังอัปโหลด...';

      const uploadResult = await productService.uploadProductImage(file);
      if (!uploadResult.success) {
        alert('ไม่สามารถอัปโหลดรูปภาพได้: ' + uploadResult.error.message);
        return;
      }

      const updateResult = await productService.updateProductImage(product.id, uploadResult.url);
      if (updateResult.success) {
        // Update preview
        const imagePreview = modal.modalElement.querySelector('.image-preview');
        imagePreview.innerHTML = `<img src="${uploadResult.url}" alt="${product.name}">`;
        
        this.showSuccessMessage('✅ อัปเดตรูปภาพสำเร็จ!');
        this.loadInitialData();
        document.dispatchEvent(new CustomEvent('productsUpdated'));
      } else {
        alert('ไม่สามารถอัปเดตรูปภาพได้: ' + updateResult.error.message);
      }

    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      updateImageBtn.disabled = false;
      updateImageBtn.innerHTML = originalText;
    }
  },

  async saveProductChanges(product, modal) {
    // This would require implementing an update product service
    // For now, just show a message
    alert('ฟีเจอร์แก้ไขข้อมูลสินค้าจะเพิ่มในอนาคต\nปัจจุบันสามารถเปลี่ยนรูปภาพและลบสินค้าได้เท่านั้น');
  },

  confirmDeleteProduct(product, modal) {
    const confirmModal = Modal.create({
      title: '⚠️ ยืนยันการลบสินค้า',
      body: `
        <div style="text-align: center; padding: 20px 0;">
          <div style="font-size: 3rem; margin-bottom: 16px;">🗑️</div>
          <h3 style="color: var(--color-accent-danger); margin-bottom: 12px;">คุณแน่ใจหรือไม่?</h3>
          <p style="margin-bottom: 16px;">คุณกำลังจะลบสินค้า:</p>
          <div style="background: rgba(255,69,58,0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,69,58,0.3);">
            <strong style="color: var(--color-text-primary);">${product.name}</strong>
          </div>
          <p style="margin-top: 16px; color: var(--color-text-secondary); font-size: 0.9rem;">
            การลบจะไม่สามารถกู้คืนได้
          </p>
        </div>
      `,
      footer: `
        <button class="btn btn-secondary">❌ ยกเลิก</button>
        <button class="btn btn-danger" id="confirm-delete-btn">🗑️ ลบสินค้า</button>
      `
    });

    setTimeout(() => {
      const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
      confirmDeleteBtn.addEventListener('click', async () => {
        await this.deleteProduct(product, confirmModal, modal);
      });
    }, 100);
  },

  async deleteProduct(product, confirmModal, editModal) {
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const originalText = confirmDeleteBtn.innerHTML;

    try {
      confirmDeleteBtn.disabled = true;
      confirmDeleteBtn.innerHTML = '⏳ กำลังลบ...';

      const result = await productService.deleteProduct(product.id);
      
      if (result.success) {
        confirmModal.close();
        editModal.close();
        this.showSuccessMessage('✅ ลบสินค้าสำเร็จ!');
        this.loadInitialData();
        document.dispatchEvent(new CustomEvent('productsUpdated'));
      } else {
        alert('ไม่สามารถลบสินค้าได้: ' + result.error.message);
      }

    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      confirmDeleteBtn.disabled = false;
      confirmDeleteBtn.innerHTML = originalText;
    }
  },

  showSuccessMessage(message) {
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.innerHTML = message;
    document.body.appendChild(successMsg);
    
    setTimeout(() => {
      successMsg.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => successMsg.remove(), 300);
    }, 3000);
  }
};

export { adminView };