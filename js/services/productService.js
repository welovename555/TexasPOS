import { supabaseClient } from '../config.js';

const productService = {
  async fetchAllProductsGroupedByCategory() {
    try {
      // ดึง categories ทั้งหมด
      const { data: categories, error: categoriesError } = await supabaseClient
        .from('categories')
        .select('id, name')
        .order('created_at', { ascending: true });

      if (categoriesError) throw categoriesError;

      // ดึง products ทั้งหมด พร้อมข้อมูล multi_prices
      const { data: products, error: productsError } = await supabaseClient
        .from('products')
        .select(`
          id, 
          name, 
          base_price, 
          category_id, 
          image_url,
          multi_prices
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (productsError) throw productsError;

      // ดึงสต๊อกแบบแยก
      const { data: stocks, error: stocksError } = await supabaseClient
        .from('product_stocks')
        .select('product_id, stock_quantity');

      if (stocksError) throw stocksError;

      // รวมสต๊อกเข้า products
      const productsWithStock = products.map(product => {
        const stock = stocks.find(s => s.product_id.trim() === product.id.trim());
        return {
          ...product,
          stock_quantity: stock ? stock.stock_quantity : 0
        };
      });

      // รวม products เข้า categories
      const grouped = categories.map(category => ({
        ...category,
        products: productsWithStock.filter(product => product.category_id === category.id)
      }));

      // return เฉพาะ category ที่มีสินค้า
      return grouped.filter(category => category.products.length > 0);

    } catch (error) {
      console.error('❌ fetchAllProductsGroupedByCategory error:', error.message);
      return null;
    }
  },

  /**
   * Fetch all categories for admin dropdown
   */
  async fetchCategories() {
    try {
      const { data, error } = await supabaseClient
        .from('categories')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) throw error;
      return { success: true, data };

    } catch (error) {
      console.error('Error fetching categories:', error.message);
      return { success: false, error };
    }
  },

  /**
   * Fetch all products for admin management - แก้ไขปัญหา relationship
   */
  async fetchAllProducts() {
    try {
      // ดึงข้อมูลแยกเป็นส่วนๆ เพื่อหลีกเลี่ยงปัญหา relationship
      const { data: products, error: productsError } = await supabaseClient
        .from('products')
        .select(`
          id,
          name,
          base_price,
          image_url,
          multi_prices,
          category_id
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // ดึง categories แยก
      const { data: categories, error: categoriesError } = await supabaseClient
        .from('categories')
        .select('id, name');

      if (categoriesError) throw categoriesError;

      // ดึง stocks แยก
      const { data: stocks, error: stocksError } = await supabaseClient
        .from('product_stocks')
        .select('product_id, stock_quantity');

      if (stocksError) throw stocksError;

      // รวมข้อมูลเข้าด้วยกัน
      const enrichedProducts = products.map(product => {
        const category = categories.find(cat => cat.id === product.category_id);
        const stock = stocks.find(s => s.product_id === product.id);

        return {
          ...product,
          categories: category ? { name: category.name } : null,
          product_stocks: stock ? [{ stock_quantity: stock.stock_quantity }] : []
        };
      });

      return { success: true, data: enrichedProducts };

    } catch (error) {
      console.error('Error fetching all products:', error.message);
      return { success: false, error };
    }
  },

  /**
   * Upload image to Supabase Storage
   */
  async uploadProductImage(file) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabaseClient.storage
        .from('product-images')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabaseClient.storage
        .from('product-images')
        .getPublicUrl(fileName);

      return { success: true, url: publicUrl };

    } catch (error) {
      console.error('Error uploading image:', error.message);
      return { success: false, error };
    }
  },

  /**
   * Create new product
   */
  async createProduct(productData) {
    try {
      // Insert product
      const { data: product, error: productError } = await supabaseClient
        .from('products')
        .insert({
          name: productData.name,
          category_id: productData.category_id,
          base_price: productData.base_price,
          image_url: productData.image_url,
          multi_prices: productData.multi_prices || null
        })
        .select()
        .single();

      if (productError) throw productError;

      // Insert initial stock
      const { error: stockError } = await supabaseClient
        .from('product_stocks')
        .insert({
          product_id: product.id,
          stock_quantity: productData.initial_stock || 0
        });

      if (stockError) throw stockError;

      return { success: true, data: product };

    } catch (error) {
      console.error('Error creating product:', error.message);
      return { success: false, error };
    }
  },

  /**
   * Update product image
   */
  async updateProductImage(productId, imageUrl) {
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .update({ image_url: imageUrl })
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };

    } catch (error) {
      console.error('Error updating product image:', error.message);
      return { success: false, error };
    }
  }
};

export { productService };