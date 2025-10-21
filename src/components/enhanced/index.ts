// Enhanced UI Components v4.0
// Comprehensive set of adaptive, accessible, and responsive components

// Core Enhanced Components
export { EnhancedButton, enhancedButtonVariants } from '@/components/ui/enhanced-button';
export { 
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardFooter,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
  enhancedCardVariants
} from '@/components/ui/enhanced-card';

// Enhanced Form Components
export {
  EnhancedForm,
  EnhancedFormField,
  EnhancedFormItem,
  EnhancedFormLabel,
  EnhancedFormControl,
  EnhancedFormDescription,
  EnhancedFormMessage,
  EnhancedInputField,
  useEnhancedFormField,
  formItemVariants
} from '@/components/ui/enhanced-form';

// Enhanced Table Component
export { 
  EnhancedTable,
  tableVariants,
  type TableColumn,
  type EnhancedTableProps
} from '@/components/ui/enhanced-table';

// Design System Hook
export { useDesignSystem } from '@/hooks/useDesignSystem';

// Re-export adaptive layout components for convenience
export {
  AdaptiveLayout,
  AdaptiveContainer,
  AdaptiveGrid,
  AdaptiveGridItem,
  AdaptiveModal,
  AdaptiveButton,
  AdaptiveForm,
  AdaptiveInput
} from '@/components/layout';