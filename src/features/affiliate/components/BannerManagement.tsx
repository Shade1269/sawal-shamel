import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Image, ExternalLink, Package, Folder } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BannerEditDialog } from './BannerEditDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface StoreBanner {
  id: string;
  store_id: string;
  title: string;
  subtitle?: string | null;
  image_url: string;
  link_url?: string | null;
  link_type: 'product' | 'category' | 'external' | 'none';
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface BannerManagementProps {
  storeId: string;
}

export const BannerManagement: React.FC<BannerManagementProps> = ({ storeId }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<StoreBanner | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: banners, isLoading } = useQuery({
    queryKey: ['store-banners', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_banners')
        .select('*')
        .eq('store_id', storeId)
        .order('position', { ascending: true });

      if (error) throw error;
      return (data || []) as StoreBanner[];
    },
    enabled: !!storeId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (bannerId: string) => {
      const { error } = await supabase
        .from('store_banners')
        .delete()
        .eq('id', bannerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-banners', storeId] });
      toast.success('تم حذف البانر بنجاح');
      setDeleteDialogOpen(false);
      setBannerToDelete(null);
    },
    onError: (error) => {
      console.error('Error deleting banner:', error);
      toast.error('فشل في حذف البانر');
    },
  });

  const handleAddNew = () => {
    setSelectedBanner(null);
    setEditDialogOpen(true);
  };

  const handleEdit = (banner: StoreBanner) => {
    setSelectedBanner(banner);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (bannerId: string) => {
    setBannerToDelete(bannerId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (bannerToDelete) {
      deleteMutation.mutate(bannerToDelete);
    }
  };

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ['store-banners', storeId] });
  };

  const getLinkTypeIcon = (linkType: string) => {
    switch (linkType) {
      case 'product':
        return <Package className="h-3 w-3" />;
      case 'category':
        return <Folder className="h-3 w-3" />;
      case 'external':
        return <ExternalLink className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getLinkTypeLabel = (linkType: string) => {
    switch (linkType) {
      case 'product':
        return 'منتج';
      case 'category':
        return 'فئة';
      case 'external':
        return 'رابط خارجي';
      case 'none':
        return 'بدون رابط';
      default:
        return linkType;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة البانرات الترويجية</h2>
          <p className="text-muted-foreground">
            قم بإنشاء وإدارة البانرات التي تظهر في واجهة متجرك
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة بانر جديد
        </Button>
      </div>

      {!banners || banners.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Image className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد بانرات بعد</h3>
            <p className="text-muted-foreground text-center mb-4">
              ابدأ بإضافة بانر ترويجي لجذب انتباه عملائك
            </p>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة بانر جديد
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <Card key={banner.id} className="overflow-hidden">
              <div className="relative h-48">
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 flex gap-2">
                  {banner.is_active ? (
                    <Badge className="bg-green-500">نشط</Badge>
                  ) : (
                    <Badge variant="secondary">غير نشط</Badge>
                  )}
                  <Badge variant="outline">#{banner.position}</Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{banner.title}</CardTitle>
                {banner.subtitle && (
                  <p className="text-sm text-muted-foreground">{banner.subtitle}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {banner.link_type !== 'none' && (
                    <div className="flex items-center gap-2 text-sm">
                      {getLinkTypeIcon(banner.link_type)}
                      <span className="text-muted-foreground">
                        {getLinkTypeLabel(banner.link_type)}
                      </span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(banner)}
                    >
                      <Edit className="h-4 w-4 ml-2" />
                      تعديل
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDeleteClick(banner.id)}
                    >
                      <Trash2 className="h-4 w-4 ml-2" />
                      حذف
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <BannerEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        banner={selectedBanner}
        storeId={storeId}
        onSave={handleSave}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف البانر نهائياً. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
