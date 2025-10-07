import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface ProductVariant {
  id: string;
  size?: string | null;
  color?: string | null;
  available_stock: number;
  selling_price?: number;
}

interface VariantSelectorProps {
  variants: ProductVariant[];
  onVariantChange: (selectedVariant: ProductVariant | null) => void;
  className?: string;
}

export const ProductVariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  onVariantChange,
  className = ''
}) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const { sizes, colors } = useMemo(() => {
    const sizeSet = new Set<string>();
    const colorSet = new Set<string>();
    
    variants.forEach(v => {
      if (v.size) sizeSet.add(v.size);
      if (v.color) colorSet.add(v.color);
    });
    
    return {
      sizes: Array.from(sizeSet),
      colors: Array.from(colorSet)
    };
  }, [variants]);

  const matchedVariant = useMemo(() => {
    return variants.find(v => 
      (!selectedSize || v.size === selectedSize) &&
      (!selectedColor || v.color === selectedColor)
    ) || null;
  }, [variants, selectedSize, selectedColor]);

  const handleSizeSelect = (size: string) => {
    const newSize = selectedSize === size ? null : size;
    setSelectedSize(newSize);
    
    const variant = variants.find(v => 
      (!newSize || v.size === newSize) &&
      (!selectedColor || v.color === selectedColor)
    ) || null;
    onVariantChange(variant);
  };

  const handleColorSelect = (color: string) => {
    const newColor = selectedColor === color ? null : color;
    setSelectedColor(newColor);
    
    const variant = variants.find(v => 
      (!selectedSize || v.size === selectedSize) &&
      (!newColor || v.color === newColor)
    ) || null;
    onVariantChange(variant);
  };

  const isOutOfStock = (value: string, type: 'size' | 'color') => {
    const relevantVariants = variants.filter(v => 
      type === 'size' ? v.size === value : v.color === value
    );
    return relevantVariants.every(v => v.available_stock === 0);
  };

  if (sizes.length === 0 && colors.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`} dir="rtl">
      {sizes.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-[color:var(--fg)]">
            المقاس
          </label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isSelected = selectedSize === size;
              const outOfStock = isOutOfStock(size, 'size');
              
              return (
                <Button
                  key={size}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  disabled={outOfStock}
                  onClick={() => handleSizeSelect(size)}
                  className={`
                    relative min-w-[60px]
                    ${outOfStock ? 'opacity-50 cursor-not-allowed line-through' : ''}
                    ${isSelected ? 'ring-2 ring-primary' : ''}
                  `}
                >
                  {size}
                  {isSelected && (
                    <Check className="w-4 h-4 mr-1" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-[color:var(--fg)]">
            اللون
          </label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const isSelected = selectedColor === color;
              const outOfStock = isOutOfStock(color, 'color');
              
              return (
                <Button
                  key={color}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  disabled={outOfStock}
                  onClick={() => handleColorSelect(color)}
                  className={`
                    relative min-w-[60px]
                    ${outOfStock ? 'opacity-50 cursor-not-allowed line-through' : ''}
                    ${isSelected ? 'ring-2 ring-primary' : ''}
                  `}
                >
                  {color}
                  {isSelected && (
                    <Check className="w-4 h-4 mr-1" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      )}
      
      {matchedVariant && (
        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">الاختيار الحالي:</p>
          <div className="flex flex-wrap gap-1.5">
            {selectedSize && (
              <Badge variant="secondary" className="text-xs">
                المقاس: {selectedSize}
              </Badge>
            )}
            {selectedColor && (
              <Badge variant="secondary" className="text-xs">
                اللون: {selectedColor}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              متوفر: {matchedVariant.available_stock}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};
