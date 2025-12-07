import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  BarChart3, 
  Calendar,
  Target,
  Palette
} from 'lucide-react';
import { motion } from 'framer-motion';
import { usePromotionalBanners } from '@/hooks/usePromotionalBanners';
import { BannerEditor } from './BannerEditor';
import { BannerAnalytics } from './BannerAnalytics';

interface BannerManagerProps {
  storeId?: string;
  affiliateStoreId?: string;
}

export const BannerManager: React.FC<BannerManagerProps> = ({
  storeId,
  affiliateStoreId
}) => {
  const {
    banners,
    isLoading,
    updateBanner,
    deleteBanner,
    fetchBannerAnalytics
  } = usePromotionalBanners(storeId, affiliateStoreId);

  const [selectedBanner, setSelectedBanner] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);

  const handleEditBanner = (banner: any) => {
    setEditingBanner(banner);
    setShowEditor(true);
  };

  const handleNewBanner = () => {
    setEditingBanner(null);
    setShowEditor(true);
  };

  const handleToggleActive = async (bannerId: string, isActive: boolean) => {
    await updateBanner(bannerId, { is_active: !isActive });
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا البانر؟')) {
      await deleteBanner(bannerId);
    }
  };

  const handleViewAnalytics = (bannerId: string) => {
    setSelectedBanner(bannerId);
    setShowAnalytics(true);
    fetchBannerAnalytics(bannerId);
  };

  const getBannerTypeLabel = (type: string) => {
    const labels = {
      hero: 'البانر الرئيسي',
      sidebar: 'الشريط الجانبي',
      popup: 'نافذة منبثقة',
      strip: 'شريط إعلاني'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getBannerStatusColor = (banner: any) => {
    if (!banner.is_active) return 'secondary';
    
    const now = new Date();
    const startDate = banner.start_date ? new Date(banner.start_date) : null;
    const endDate = banner.end_date ? new Date(banner.end_date) : null;
    
    if (startDate && now < startDate) return 'outline';
    if (endDate && now > endDate) return 'destructive';
    
    return 'default';
  };

  if (showEditor) {
    return (
      <BannerEditor
        banner={editingBanner}
        storeId={storeId}
        affiliateStoreId={affiliateStoreId}
        onClose={() => setShowEditor(false)}
        onSave={() => {
          setShowEditor(false);
          setEditingBanner(null);
        }}
      />
    );
  }

  if (showAnalytics && selectedBanner) {
    return (
      <BannerAnalytics
        bannerId={selectedBanner}
        onClose={() => {
          setShowAnalytics(false);
          setSelectedBanner(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">إدارة البانرات الترويجية</h2>
          <p className="text-muted-foreground">
            إنشاء وإدارة البانرات الترويجية لمتجرك
          </p>
        </div>
        <Button onClick={handleNewBanner} className="gap-2">
          <Plus className="w-4 h-4" />
          بانر جديد
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي البانرات</p>
                <p className="text-2xl font-bold">{banners.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-success/10 rounded-lg">
                <Eye className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">البانرات النشطة</p>
                <p className="text-2xl font-bold">
                  {banners.filter(b => b.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-info/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المشاهدات</p>
                <p className="text-2xl font-bold">
                  {banners.reduce((sum, b) => sum + b.current_impressions, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-premium/10 rounded-lg">
                <Calendar className="w-5 h-5 text-premium" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">النقرات</p>
                <p className="text-2xl font-bold">
                  {banners.reduce((sum, b) => sum + b.current_clicks, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Banners List */}
      <Card>
        <CardHeader>
          <CardTitle>البانرات الحالية</CardTitle>
          <CardDescription>
            إدارة جميع البانرات الترويجية الخاصة بك
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد بانرات</h3>
              <p className="text-muted-foreground mb-4">
                ابدأ بإنشاء أول بانر ترويجي لمتجرك
              </p>
              <Button onClick={handleNewBanner}>
                <Plus className="w-4 h-4 mr-2" />
                إنشاء بانر جديد
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {banners.map((banner, index) => (
                <motion.div
                  key={banner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: banner.background_color }}
                        >
                          <Palette 
                            className="w-6 h-6" 
                            style={{ color: banner.text_color }}
                          />
                        </div>
                        
                        <div>
                          <h3 className="font-semibold">
                            {banner.title_ar || banner.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {getBannerTypeLabel(banner.banner_type)} • {banner.position}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant={getBannerStatusColor(banner)}>
                              {banner.is_active ? 'نشط' : 'غير نشط'}
                            </Badge>
                            <Badge variant="outline">
                              أولوية {banner.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Analytics */}
                        <div className="text-right text-sm text-muted-foreground mr-4">
                          <div>مشاهدات: {banner.current_impressions}</div>
                          <div>نقرات: {banner.current_clicks}</div>
                        </div>

                        {/* Actions */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewAnalytics(banner.id)}
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(banner.id, banner.is_active)}
                        >
                          {banner.is_active ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditBanner(banner)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteBanner(banner.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};