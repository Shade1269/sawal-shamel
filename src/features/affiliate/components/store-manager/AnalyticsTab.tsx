/**
 * تبويب الإحصائيات - Analytics Tab
 * عرض إحصائيات المتجر والمبيعات
 */

import { Eye, Link as LinkIcon, Globe, Store } from 'lucide-react';
import {
  UnifiedCard as Card,
  UnifiedCardContent as CardContent
} from '@/components/design-system';
import type { Store as StoreType } from './types';

interface AnalyticsData {
  totalViews?: number;
  productClicks?: number;
  uniqueVisitors?: number;
  totalOrders?: number;
  conversionRate?: number;
  averageOrderValue?: number;
  totalSales?: number;
}

interface AnalyticsTabProps {
  analytics: AnalyticsData | null;
  loading: boolean;
  store: StoreType;
}

export function AnalyticsTab({ analytics, loading, store }: AnalyticsTabProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-none md:rounded-xl border-x-0 md:border-x">
          <CardContent className="p-4 text-center">
            <Eye className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">
              {analytics?.totalViews?.toLocaleString('ar-EG') || '0'}
            </div>
            <div className="text-sm text-muted-foreground">إجمالي المشاهدات</div>
          </CardContent>
        </Card>

        <Card className="rounded-none md:rounded-xl border-x-0 md:border-x">
          <CardContent className="p-4 text-center">
            <LinkIcon className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">
              {analytics?.productClicks?.toLocaleString('ar-EG') || '0'}
            </div>
            <div className="text-sm text-muted-foreground">النقرات على المنتجات</div>
          </CardContent>
        </Card>

        <Card className="rounded-none md:rounded-xl border-x-0 md:border-x">
          <CardContent className="p-4 text-center">
            <Globe className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">
              {analytics?.uniqueVisitors?.toLocaleString('ar-EG') || '0'}
            </div>
            <div className="text-sm text-muted-foreground">زوار فريدون</div>
          </CardContent>
        </Card>

        <Card className="rounded-none md:rounded-xl border-x-0 md:border-x">
          <CardContent className="p-4 text-center">
            <Store className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">
              {analytics?.totalOrders?.toLocaleString('ar-EG') || store.total_orders}
            </div>
            <div className="text-sm text-muted-foreground">إجمالي الطلبات</div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-none md:rounded-xl border-x-0 md:border-x">
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-green-600">
              {analytics?.conversionRate || 0}%
            </div>
            <div className="text-sm text-muted-foreground">معدل التحويل</div>
          </CardContent>
        </Card>

        <Card className="rounded-none md:rounded-xl border-x-0 md:border-x">
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-blue-600">
              {analytics?.averageOrderValue?.toLocaleString('ar-EG') || 0} ر.س
            </div>
            <div className="text-sm text-muted-foreground">متوسط قيمة الطلب</div>
          </CardContent>
        </Card>

        <Card className="rounded-none md:rounded-xl border-x-0 md:border-x">
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-purple-600">
              {analytics?.totalSales?.toLocaleString('ar-EG') || store.total_sales} ر.س
            </div>
            <div className="text-sm text-muted-foreground">إجمالي المبيعات</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
