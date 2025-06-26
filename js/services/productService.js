import { supabaseClient } from '../config.js';

const productService = {
  async fetchAllProductsGroupedByCategory() {
    try {
      // ดึงหมวดหมู่
      const { data: categories, error: categoriesError } = await supabaseClient
        .from('categories')
        .select('id, name')
        .order('created_at', { ascending: true });

      if (categoriesError) throw categoriesError;

      // ดึงสินค้า พร้อมข้อมูล stock
      const { data: products, error: productsError } = await supabaseClient
        .from('products')
        .select(`
          id,
          name,
          base_price,
          category_id,
          image_url,
          product_stocks!products_id_fkey ( stock_quantity )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (productsError) throw productsError;

      // map ค่ามาใช้งานให้เรียบง่าย
      const productsWithStock = products.map(p => ({
        ...p,
        stock_quantity: Array.isArray(p.product_stocks) ? p.product_stocks[0]?.stock_quantity ?? 0 : 0
      }));

      // จับกลุ่มตามหมวดหมู่
      const grouped = categories.map(category => ({
        ...category,
        products: productsWithStock.filter(product => product.category_id === category.id)
      }));

      return grouped.filter(category => category.products.length > 0);
    } catch (error) {
      console.error('An error occurred in fetchAllProductsGroupedByCategory:', error.message);
      return null;
    }
  }
};

export { productService };
