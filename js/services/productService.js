const productService = {
  async fetchAllProductsGroupedByCategory() {
    try {
      const { data: categories, error: categoriesError } = await supabaseClient
        .from('categories')
        .select('id, name')
        .order('created_at', { ascending: true });

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError.message);
        throw categoriesError;
      }

      const { data: products, error: productsError } = await supabaseClient
        .from('products')
        .select('id, name, base_price, category_id, image_url')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (productsError) {
        console.error('Error fetching products:', productsError.message);
        throw productsError;
      }

      const grouped = categories.map(category => {
        return {
          ...category,
          products: products.filter(product => product.category_id === category.id)
        };
      });

      const categoriesWithProducts = grouped.filter(category => category.products.length > 0);

      return categoriesWithProducts;

    } catch (error) {
      console.error('An error occurred in fetchAllProductsGroupedByCategory:', error.message);
      return null;
    }
  }
};
