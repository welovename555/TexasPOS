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

      // ดึง products ทั้งหมด
      const { data: products, error: productsError } = await supabaseClient
        .from('products')
        .select(`
          id, 
          name, 
          base_price, 
          category_id, 
          image_url
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
        const stock = stocks.find(s => s.product_id === product.id);
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
  }
};

export { productService };
