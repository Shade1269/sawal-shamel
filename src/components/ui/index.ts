// Enhanced Layout & Navigation Components
export { EnhancedContainer, containerVariants, type EnhancedContainerProps } from './layout/EnhancedContainer'
export { EnhancedSection, sectionVariants, type EnhancedSectionProps } from './layout/EnhancedSection'
export { EnhancedGrid, gridVariants, type EnhancedGridProps } from './layout/EnhancedGrid'
export { EnhancedBreadcrumb, breadcrumbVariants, type EnhancedBreadcrumbProps, type BreadcrumbItem } from './navigation/EnhancedBreadcrumb'
export { EnhancedStatusIndicator, statusVariants, type EnhancedStatusIndicatorProps } from './feedback/EnhancedStatusIndicator'
export { EnhancedSidebar, sidebarVariants, type NavigationItem, type NavigationGroup } from './navigation/EnhancedSidebar'
import { EnhancedTabs, tabsVariants, tabVariants, type TabItem } from '@/components/navigation/EnhancedTabs';

// Enhanced Navigation Components  
export { QuickCommandPalette } from '../navigation/QuickCommandPalette'
export { SmartSearch } from '../navigation/SmartSearch'  
export { EnhancedTabs, tabsVariants, tabVariants, type TabItem } from '../navigation/EnhancedTabs'
export { Kbd, kbdVariants } from './kbd'

// Enhanced Navigation System v2.3
export { ResponsiveLayout, ResponsiveGrid, ResponsiveColumn, ShowOnMobile, ShowOnTablet, ShowOnDesktop, HideOnMobile } from '../layout/ResponsiveLayout'
export { MegaMenu, MegaMenuTrigger, megaMenuVariants } from '../navigation/MegaMenu'
export { MobileNavigation, BottomNavigation, mobileNavVariants } from '../navigation/MobileNavigation'
export { EnhancedPagination, PaginationSummary, paginationVariants } from '../navigation/EnhancedPagination'
export { VirtualizedList } from '../layout/VirtualizedList'
export { FloatingActionButton, ScrollToTopFAB } from '../navigation/FloatingActionButton'
export { useResponsiveLayout, useResponsiveColumns, useResponsiveSpacing } from '../../hooks/useResponsiveLayout'
export { useVirtualization, useInfiniteVirtualization } from '../../hooks/useVirtualization'

// Enhanced UI Components - نظام المكونات المطور
export { Button, buttonVariants, type ButtonProps } from './button'
export { EnhancedButton, enhancedButtonVariants, type EnhancedButtonProps } from './enhanced-button'
export { 
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
  EnhancedCardFooter,
  enhancedCardVariants,
  type EnhancedCardProps
} from './enhanced-card'

// Enhanced Form Components  
export {
  useEnhancedFormField,
  EnhancedForm,
  EnhancedFormItem,
  EnhancedFormLabel,
  EnhancedFormControl,
  EnhancedFormDescription,
  EnhancedFormMessage,
  EnhancedFormField,
  EnhancedInputField,
  formItemVariants,
} from './enhanced-form'

// Enhanced Interactions
export { 
  EnhancedTooltip, 
  QuickTooltip, 
  InfoTooltip,
  tooltipVariants 
} from './enhanced-tooltip'

export {
  EnhancedDialog,
  EnhancedDialogPortal,
  EnhancedDialogOverlay,
  EnhancedDialogClose,
  EnhancedDialogTrigger,
  EnhancedDialogContent,
  EnhancedDialogHeader,
  EnhancedDialogFooter,
  EnhancedDialogTitle,
  EnhancedDialogDescription,
  ConfirmationDialog,
  dialogContentVariants
} from './enhanced-dialog'

// Loading Components
export {
  LoadingSpinner,
  LoadingOverlay,
  Skeleton,
  LoadingCard,
  LoadingState,
  Spinner,
  Overlay,
  Card as LoadingCardComponent,
  State
} from './loading-states'

// Enhanced Base Components with new variants
export { Input, inputVariants, type InputProps } from './input'
export { Badge, badgeVariants, type BadgeProps } from './badge'
export { Alert, AlertTitle, AlertDescription } from './alert'

// Original shadcn/ui components
export { 
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent
} from './card'
export { Label } from './label'
export { Switch } from './switch'
export { Separator } from './separator'
export { 
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose
} from './dialog'
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './dropdown-menu'
export { Avatar, AvatarImage, AvatarFallback } from './avatar'
export { 
  Popover, 
  PopoverTrigger, 
  PopoverContent 
} from './popover'
export { 
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from './toast'
export { Toaster } from './toaster'
export { useToast, toast } from './use-toast'
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs'
export { 
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './table'
export { Progress } from './progress'
export { Checkbox } from './checkbox'
export { Textarea } from './textarea'
export { 
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './select'
export { 
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from './form'
export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './alert-dialog'