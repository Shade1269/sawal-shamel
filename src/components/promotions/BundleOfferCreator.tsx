import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, X, Calculator } from 'lucide-react';
import { useBundleOffers } from '@/hooks/usePromotionCampaigns';

export const BundleOfferCreator: React.FC = () => {
  const { createBundle, isCreating } = useBundleOffers();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    bundle_products: [] as string[],
    bundle_price: 0,
    original_price: 0,
  });
  const [newProduct, setNewProduct] = useState('');

  const discountPercentage = formData.original_price > 0 
    ? Math.round(((formData.original_price - formData.bundle_price) / formData.original_price) * 100)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.bundle_products.length < 2) {
      alert('يجب إضافة منتجين على الأقل لإنشاء العرض المجمع');
      return;
    }
    
    createBundle({
      ...formData,
      discount_percentage: discountPercentage,
      is_active: true,
    });
  };

  const addProduct = () => {
    if (newProduct.trim() && !formData.bundle_products.includes(newProduct.trim())) {
      setFormData(prev => ({
        ...prev,
        bundle_products: [...prev.bundle_products, newProduct.trim()]
      }));
      setNewProduct('');
    }
  };

  const removeProduct = (productToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      bundle_products: prev.bundle_products.filter(p => p !== productToRemove)
    }));
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center gap-2 justify-center">
          <Package className="h-5 w-5 text-primary" />
          إنشاء عرض مجمع (Bundle Offer)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bundle_name">اسم العرض المجمع</Label>
            <Input
              id="bundle_name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="عرض المجموعة المميزة"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bundle_description">وصف العرض</Label>
            <Textarea
              id="bundle_description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="وصف العرض المجمع والفوائد..."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <Label>المنتجات في العرض</Label>
            <div className="flex gap-2">
              <Input
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
                placeholder="اسم المنتج أو معرف المنتج"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addProduct())}
              />
              <Button type="button" onClick={addProduct} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {formData.bundle_products.length > 0 && (
              <div className="flex flex-wrap gap-2 p-4 bg-muted rounded-lg">
                {formData.bundle_products.map((product, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-2 px-3 py-1"
                  >
                    {product}
                    <button
                      type="button"
                      onClick={() => removeProduct(product)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="original_price">السعر الأصلي (ر.س)</Label>
              <Input
                id="original_price"
                type="number"
                value={formData.original_price}
                onChange={(e) => handleInputChange('original_price', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bundle_price">سعر العرض (ر.س)</Label>
              <Input
                id="bundle_price"
                type="number"
                value={formData.bundle_price}
                onChange={(e) => handleInputChange('bundle_price', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {formData.original_price > 0 && formData.bundle_price > 0 && (
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-primary">
                  <Calculator className="h-4 w-4" />
                  <span className="font-semibold">معلومات التوفير</span>
                </div>
                <div className="mt-2 space-y-1 text-sm">
                  <div>المبلغ الموفر: <span className="font-bold">{(formData.original_price - formData.bundle_price).toFixed(2)} ر.س</span></div>
                  <div>نسبة التوفير: <span className="font-bold text-destructive">{discountPercentage}%</span></div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isCreating || formData.bundle_products.length < 2}
              className="flex-1"
            >
              {isCreating ? 'جاري الإنشاء...' : 'إنشاء العرض المجمع'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setFormData({
                  name: '',
                  description: '',
                  bundle_products: [],
                  bundle_price: 0,
                  original_price: 0,
                });
                setNewProduct('');
              }}
            >
              إعادة تعيين
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};