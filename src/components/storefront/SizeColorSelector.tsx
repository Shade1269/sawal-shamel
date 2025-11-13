import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SizeOption {
  value: string;
  label: string;
  available: boolean;
}

interface ColorOption {
  value: string;
  label: string;
  hex: string;
  available: boolean;
}

interface SizeColorSelectorProps {
  sizes?: SizeOption[];
  colors?: ColorOption[];
  onSizeChange?: (size: string) => void;
  onColorChange?: (color: string) => void;
}

const defaultSizes: SizeOption[] = [
  { value: 'S', label: 'S', available: true },
  { value: 'M', label: 'M', available: true },
  { value: 'L', label: 'L', available: true },
  { value: 'XL', label: 'XL', available: false },
];

const defaultColors: ColorOption[] = [
  { value: 'beige', label: 'بيج', hex: '#F5E6D3', available: true },
  { value: 'gray', label: 'رمادي', hex: '#8B8680', available: true },
  { value: 'brown', label: 'بني', hex: '#B08968', available: true },
  { value: 'pink', label: 'وردي', hex: '#DDB892', available: false },
];

export const SizeColorSelector = ({
  sizes = defaultSizes,
  colors = defaultColors,
  onSizeChange,
  onColorChange,
}: SizeColorSelectorProps) => {
  const [selectedSize, setSelectedSize] = useState<string>(sizes.find(s => s.available)?.value || '');
  const [selectedColor, setSelectedColor] = useState<string>(colors.find(c => c.available)?.value || '');

  const handleSizeSelect = (size: string, available: boolean) => {
    if (!available) return;
    setSelectedSize(size);
    onSizeChange?.(size);
  };

  const handleColorSelect = (color: string, available: boolean) => {
    if (!available) return;
    setSelectedColor(color);
    onColorChange?.(color);
  };

  return (
    <div className="space-y-6">
      {/* Size Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground">المقاس</h4>
          {selectedSize && (
            <span className="text-xs text-muted-foreground">
              المقاس المحدد: {selectedSize}
            </span>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {sizes.map((size) => (
            <motion.button
              key={size.value}
              whileHover={{ scale: size.available ? 1.05 : 1 }}
              whileTap={{ scale: size.available ? 0.95 : 1 }}
              onClick={() => handleSizeSelect(size.value, size.available)}
              disabled={!size.available}
              className={cn(
                "relative min-w-[48px] h-12 px-4 rounded-lg border-2 font-medium text-sm transition-all",
                selectedSize === size.value
                  ? "border-primary bg-primary/10 text-primary"
                  : size.available
                  ? "border-border bg-background hover:border-primary/50 text-foreground"
                  : "border-border bg-muted text-muted-foreground opacity-50 cursor-not-allowed line-through"
              )}
            >
              {size.label}
              {selectedSize === size.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Color Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground">اللون</h4>
          {selectedColor && (
            <span className="text-xs text-muted-foreground">
              اللون المحدد: {colors.find(c => c.value === selectedColor)?.label}
            </span>
          )}
        </div>
        <div className="flex gap-3 flex-wrap">
          {colors.map((color) => (
            <motion.button
              key={color.value}
              whileHover={{ scale: color.available ? 1.1 : 1 }}
              whileTap={{ scale: color.available ? 0.9 : 1 }}
              onClick={() => handleColorSelect(color.value, color.available)}
              disabled={!color.available}
              className={cn(
                "relative w-12 h-12 rounded-full border-2 transition-all",
                selectedColor === color.value
                  ? "border-primary ring-2 ring-primary/30"
                  : color.available
                  ? "border-border hover:border-primary/50"
                  : "border-border opacity-50 cursor-not-allowed",
                !color.available && "after:absolute after:inset-0 after:border-2 after:border-destructive after:rounded-full after:rotate-45 after:origin-center after:scale-150"
              )}
              style={{ backgroundColor: color.hex }}
              title={color.label}
            >
              {selectedColor === color.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};
