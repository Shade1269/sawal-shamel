/**
 * رأس المتجر - Store Header Component
 * عرض معلومات المتجر الأساسية مع أزرار المعاينة والتعديل
 */

import { Store, Eye, Edit } from 'lucide-react';
import { UnifiedCard as Card, UnifiedCardContent as CardContent } from '@/components/design-system';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { useDarkMode } from '@/shared/components/DarkModeProvider';
import type { Store as StoreType } from './types';

interface StoreHeaderProps {
  store: StoreType;
  storeUrl: string;
  isEditing: boolean;
  onEditToggle: () => void;
}

export function StoreHeader({ store, storeUrl, isEditing, onEditToggle }: StoreHeaderProps) {
  const { isDarkMode } = useDarkMode();

  return (
    <Card className="border-0 gradient-bg-accent rounded-none md:rounded-xl">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-3 md:gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              {store.logo_url ? (
                <img src={store.logo_url} alt="Logo" className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover" />
              ) : (
                <Store className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              )}
            </div>
            <div className="space-y-1 md:space-y-2 flex-1 min-w-0">
              <h1 className={`text-lg md:text-2xl font-bold truncate transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-slate-800'
              }`}>{store.store_name}</h1>
              <p className={`text-sm md:text-base line-clamp-2 transition-colors duration-500 ${
                isDarkMode ? 'text-muted-foreground' : 'text-slate-600'
              }`}>{store.bio}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`text-xs transition-colors duration-500 ${
                  isDarkMode
                    ? 'border-slate-600 text-slate-200'
                    : 'border-slate-300 text-slate-700 bg-slate-50'
                }`}>{store.theme}</Badge>
                <Badge variant="secondary" className={`text-xs transition-colors duration-500 ${
                  isDarkMode
                    ? 'bg-slate-700 text-slate-200'
                    : 'bg-slate-200 text-slate-800'
                }`}>
                  {store.total_orders} طلب
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-stretch md:self-auto">
            <Button
              variant="outline"
              onClick={() => window.open(storeUrl, '_blank')}
              className="flex-1 md:flex-none"
              size="sm"
            >
              <Eye className="h-4 w-4 md:ml-2" />
              <span className="hidden md:inline">معاينة</span>
            </Button>
            <Button
              variant={isEditing ? "primary" : "outline"}
              onClick={onEditToggle}
              className="flex-1 md:flex-none"
              size="sm"
            >
              <Edit className="h-4 w-4 md:ml-2" />
              <span className="hidden md:inline">{isEditing ? "إلغاء" : "تعديل"}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
