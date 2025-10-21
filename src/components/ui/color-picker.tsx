import React, { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Label } from './label';
import { Slider } from './slider';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

// Helper functions for color conversion
const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const parseHslString = (hslString: string): HSL => {
  const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (match) {
    return {
      h: parseInt(match[1]),
      s: parseInt(match[2]),
      l: parseInt(match[3])
    };
  }
  
  // Fallback for hex colors
  const hexMatch = hslString.match(/#([0-9A-F]{6})/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    const sum = max + min;
    
    const l = sum / 2;
    let s = 0;
    let h = 0;
    
    if (diff !== 0) {
      s = l > 0.5 ? diff / (2 - sum) : diff / sum;
      
      switch (max) {
        case r:
          h = ((g - b) / diff) + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / diff + 2;
          break;
        case b:
          h = (r - g) / diff + 4;
          break;
      }
      h /= 6;
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }
  
  // Default fallback
  return { h: 0, s: 0, l: 50 };
};

const formatHsl = (hsl: HSL): string => {
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
};

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hsl, setHsl] = useState<HSL>(() => parseHslString(value));
  const [inputValue, setInputValue] = useState(value);
  
  useEffect(() => {
    const newHsl = parseHslString(value);
    setHsl(newHsl);
    setInputValue(value);
  }, [value]);

  const updateColor = (newHsl: HSL) => {
    setHsl(newHsl);
    const hslString = formatHsl(newHsl);
    setInputValue(hslString);
    onChange(hslString);
  };

  const handleInputChange = (inputVal: string) => {
    setInputValue(inputVal);
    try {
      const newHsl = parseHslString(inputVal);
      setHsl(newHsl);
      onChange(inputVal);
    } catch (error) {
      // Invalid input, don't update
    }
  };

  const presetColors = [
    'hsl(0, 84%, 60%)',     // Red
    'hsl(25, 95%, 53%)',    // Orange  
    'hsl(48, 96%, 53%)',    // Yellow
    'hsl(142, 76%, 36%)',   // Green
    'hsl(221, 83%, 53%)',   // Blue
    'hsl(262, 83%, 58%)',   // Purple
    'hsl(280, 100%, 70%)',  // Pink
    'hsl(200, 98%, 39%)',   // Cyan
    'hsl(0, 0%, 15%)',      // Dark
    'hsl(0, 0%, 85%)',      // Light
    'hsl(0, 0%, 100%)',     // White
    'hsl(0, 0%, 0%)',       // Black
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-12 h-10 p-0 border-2 ${className}`}
          style={{ backgroundColor: value }}
          aria-label="اختيار اللون"
        >
          <span className="sr-only">اختيار اللون</span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          {/* Color Preview */}
          <div className="flex items-center gap-3">
            <div 
              className="w-16 h-10 rounded border-2 flex-shrink-0"
              style={{ backgroundColor: formatHsl(hsl) }}
            />
            <Input
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="hsl(0, 0%, 0%)"
              className="flex-1"
            />
          </div>

          {/* HSL Sliders */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm">درجة اللون (H): {hsl.h}°</Label>
              <div className="mt-2">
                <Slider
                  value={[hsl.h]}
                  onValueChange={([h]) => updateColor({ ...hsl, h })}
                  max={360}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm">التشبع (S): {hsl.s}%</Label>
              <div className="mt-2">
                <Slider
                  value={[hsl.s]}
                  onValueChange={([s]) => updateColor({ ...hsl, s })}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm">الإضاءة (L): {hsl.l}%</Label>
              <div className="mt-2">
                <Slider
                  value={[hsl.l]}
                  onValueChange={([l]) => updateColor({ ...hsl, l })}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Preset Colors */}
          <div>
            <Label className="text-sm mb-2 block">ألوان جاهزة</Label>
            <div className="grid grid-cols-6 gap-2">
              {presetColors.map((color, index) => (
                <button
                  key={index}
                  className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    const newHsl = parseHslString(color);
                    updateColor(newHsl);
                  }}
                  aria-label={`اختيار اللون ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setHsl(parseHslString(value));
                setInputValue(value);
              }}
              className="flex-1"
            >
              إعادة تعيين
            </Button>
            <Button
              size="sm"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              تطبيق
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};