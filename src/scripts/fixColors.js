/**
 * سكريبت لتحويل الألوان المباشرة إلى نظام التصميم
 * يمكن تشغيله يدوياً أو استخدامه كمرجع
 */

const colorMappings = {
  // Background colors
  'bg-white': 'bg-background',
  'bg-black': 'bg-foreground', 
  'bg-gray-50': 'bg-muted/50',
  'bg-gray-100': 'bg-muted',
  'bg-gray-200': 'bg-muted',
  'bg-gray-300': 'bg-muted-foreground/20',
  'bg-gray-400': 'bg-muted-foreground/40', 
  'bg-gray-500': 'bg-muted-foreground',
  'bg-gray-600': 'bg-muted-foreground',
  'bg-gray-700': 'bg-foreground/80',
  'bg-gray-800': 'bg-foreground/90',
  'bg-gray-900': 'bg-foreground',
  
  // Red colors (Persian theme)
  'bg-red-50': 'bg-destructive/10',
  'bg-red-100': 'bg-destructive/20',
  'bg-red-500': 'bg-destructive',
  'bg-red-600': 'bg-destructive/90',
  'bg-red-700': 'bg-destructive/80',
  
  // Blue colors (Accent theme)
  'bg-blue-50': 'bg-accent/10',
  'bg-blue-100': 'bg-accent/20',
  'bg-blue-500': 'bg-accent',
  'bg-blue-600': 'bg-accent/90',
  'bg-blue-700': 'bg-accent/80',
  
  // Green colors (Success)
  'bg-green-50': 'bg-status-online/10',
  'bg-green-100': 'bg-status-online/20',
  'bg-green-500': 'bg-status-online',
  'bg-green-600': 'bg-status-online/90',
  
  // Yellow/Orange colors (Premium)
  'bg-yellow-50': 'bg-premium/10',
  'bg-yellow-100': 'bg-premium/20', 
  'bg-yellow-500': 'bg-premium',
  'bg-orange-500': 'bg-premium',
  
  // Text colors
  'text-white': 'text-primary-foreground',
  'text-black': 'text-foreground',
  'text-gray-400': 'text-muted-foreground/60',
  'text-gray-500': 'text-muted-foreground',
  'text-gray-600': 'text-muted-foreground',
  'text-gray-700': 'text-foreground/80',
  'text-gray-800': 'text-foreground/90',
  'text-gray-900': 'text-foreground',
  
  'text-red-500': 'text-destructive',
  'text-red-600': 'text-destructive',
  'text-red-700': 'text-destructive/80',
  'text-red-800': 'text-destructive/90',
  
  'text-blue-500': 'text-accent',
  'text-blue-600': 'text-accent',
  'text-blue-700': 'text-accent/80', 
  'text-blue-800': 'text-accent/90',
  
  'text-green-500': 'text-status-online',
  'text-green-600': 'text-status-online',
  'text-green-700': 'text-status-online/80',
  'text-green-800': 'text-status-online/90',
  
  'text-yellow-600': 'text-premium',
  'text-yellow-700': 'text-premium/80',
  'text-orange-500': 'text-premium',
  
  // Border colors
  'border-gray-200': 'border-border',
  'border-gray-300': 'border-border',
  'border-red-500': 'border-destructive',
  'border-blue-500': 'border-accent',
  'border-green-500': 'border-status-online',
  
  // Special cases
  'bg-black/50': 'bg-background/80',
  'bg-black/80': 'bg-background/90',
  'text-white/90': 'text-primary-foreground/90',
  'text-black/80': 'text-foreground/80'
};

// دالة مرجعية لتحويل الألوان
function convertColor(colorClass) {
  return colorMappings[colorClass] || colorClass;
}

// مثال على الاستخدام في IDE
// Find: bg-white|text-white|bg-gray-\d+|text-gray-\d+
// Replace manually using the mappings above

console.log('Color conversion mappings ready!');
console.log('Use these mappings to replace direct colors with design system tokens.');

module.exports = { colorMappings, convertColor };