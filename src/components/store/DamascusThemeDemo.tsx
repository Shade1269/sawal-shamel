import React, { useState } from 'react';
import { DamascusProductGrid, DamascusProductGridContainer } from './DamascusProductGrid';

// Demo page to showcase the Damascene theme
export const DamascusThemeDemo: React.FC = () => {
  const [isLoading] = useState(false);

  // Mock products for demonstration
  const mockProducts = [
    {
      id: '1',
      title: 'قميص قطني فاخر',
      price: 299,
      compareAtPrice: 399,
      imageUrl: '/placeholder.svg',
      isNew: true,
      isOnSale: true,
      rating: 5,
      currency: 'SAR',
    },
    {
      id: '2',
      title: 'حقيبة جلدية أنيقة',
      price: 899,
      imageUrl: '/placeholder.svg',
      isNew: true,
      rating: 4,
      currency: 'SAR',
    },
    {
      id: '3',
      title: 'ساعة ذهبية كلاسيكية',
      price: 1499,
      compareAtPrice: 1999,
      imageUrl: '/placeholder.svg',
      isOnSale: true,
      rating: 5,
      currency: 'SAR',
    },
    {
      id: '4',
      title: 'نظارة شمسية عصرية',
      price: 499,
      imageUrl: '/placeholder.svg',
      isOutOfStock: true,
      rating: 4,
      currency: 'SAR',
    },
    {
      id: '5',
      title: 'معطف شتوي دافئ',
      price: 1299,
      imageUrl: '/placeholder.svg',
      rating: 5,
      currency: 'SAR',
    },
    {
      id: '6',
      title: 'حذاء رياضي مريح',
      price: 599,
      compareAtPrice: 799,
      imageUrl: '/placeholder.svg',
      isOnSale: true,
      rating: 4,
      currency: 'SAR',
    },
    {
      id: '7',
      title: 'عطر فاخر للرجال',
      price: 799,
      imageUrl: '/placeholder.svg',
      isNew: true,
      rating: 5,
      currency: 'SAR',
    },
    {
      id: '8',
      title: 'محفظة جلدية أصلية',
      price: 399,
      imageUrl: '/placeholder.svg',
      rating: 4,
      currency: 'SAR',
    },
  ];

  const handleAddToCart = (productId: string) => {
    console.log('Adding to cart:', productId);
    // Implement your cart logic here
  };

  const handleProductSelect = (productId: string) => {
    console.log('Product selected:', productId);
    // Navigate to product details or open modal
  };

  return (
    <DamascusProductGridContainer
      title="مجموعة دمشق الفاخرة"
      description="تسوق من مجموعتنا الحصرية المستوحاة من التراث الدمشقي العريق"
    >
      <DamascusProductGrid
        products={mockProducts}
        isLoading={isLoading}
        onAddToCart={handleAddToCart}
        onProductSelect={handleProductSelect}
      />
    </DamascusProductGridContainer>
  );
};
