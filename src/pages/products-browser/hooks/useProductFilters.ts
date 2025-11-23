import { useState, useEffect } from 'react';
import type { Product } from './useProductsData';

/**
 * Custom hook لإدارة فلترة المنتجات
 *
 * @param products - قائمة المنتجات الأصلية
 * @returns كائن يحتوي على المنتجات المفلترة ومتغيرات الفلترة
 */
export function useProductFilters(products: Product[]) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory, priceRange]);

  const filterProducts = () => {
    let filtered = products;

    // البحث النصي
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.merchants?.business_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // فلتر الفئة
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // فلتر السعر
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(product => {
        const price = product.price_sar;
        const min = priceRange.min ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    setFilteredProducts(filtered);
  };

  // الحصول على الفئات المتاحة
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  return {
    filteredProducts,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    viewMode,
    setViewMode,
    categories,
  };
}
