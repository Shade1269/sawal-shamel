import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2, RefreshCw, Settings, CheckCircle2, AlertCircle, Zap, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ZohoIntegration {
  id: string;
  access_token: string | null;
  organization_id: string | null;
  last_sync_at: string | null;
  is_enabled: boolean;
}

export const ZohoIntegration: React.FC = () => {
  const [integration, setIntegration] = useState<ZohoIntegration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const { toast } = useToast();
  const { user } = useFirebaseAuth();

  useEffect(() => {
    loadZohoIntegration();
  }, []);

  const loadZohoIntegration = async () => {
    if (!user?.uid) return;
    
    try {
      const db = await getFirebaseFirestore();
      const integrationDoc = doc(db, 'users', user.uid, 'integrations', 'zoho');
      const docSnap = await getDoc(integrationDoc);
      
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as ZohoIntegration;
        setIntegration(data);
        setAccessToken(data.access_token || '');
        setOrganizationId(data.organization_id || '');
      }
    } catch (error) {
      console.error('Error loading Zoho integration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveIntegrationSettings = async () => {
    if (!accessToken.trim() || !organizationId.trim() || !user?.uid) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال جميع البيانات المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const integrationData = {
        access_token: accessToken.trim(),
        organization_id: organizationId.trim(),
        is_enabled: true,
        updated_at: new Date().toISOString(),
        last_sync_at: null,
      };

      const db = await getFirebaseFirestore();
      const integrationDoc = doc(db, 'users', user.uid, 'integrations', 'zoho');
      
      if (integration) {
        await updateDoc(integrationDoc, integrationData);
      } else {
        await setDoc(integrationDoc, {
          ...integrationData,
          created_at: new Date().toISOString(),
        });
      }

      const updatedIntegration = { 
        id: 'zoho', 
        ...integrationData, 
        last_sync_at: null 
      } as ZohoIntegration;
      setIntegration(updatedIntegration);
      
      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات التكامل مع Zoho بنجاح",
      });
    } catch (error) {
      console.error('Error saving integration:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ الإعدادات",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const syncProducts = async () => {
    if (!integration?.access_token || !integration?.organization_id || !user) {
      toast({
        title: "خطأ",
        description: "يرجى إعداد بيانات التكامل أولاً",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    try {
      const accessToken = integration.access_token;
      const organizationId = integration.organization_id;

      // 1) اجلب العناصر من Zoho مباشرة بدون Supabase
      const perPage = 200;
      let page = 1;
      let allItems: any[] = [];

      while (true) {
        const url = `https://www.zohoapis.com/inventory/v1/items?organization_id=${organizationId}&page=${page}&per_page=${perPage}`;
        const resp = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Zoho-oauthtoken ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!resp.ok) {
          const errText = await resp.text();
          console.error('Zoho API error:', resp.status, errText);
          toast({
            title: 'رفض من Zoho',
            description: `Zoho API error: ${resp.status}`,
            variant: 'destructive',
          });
          return;
        }

        const data = await resp.json();
        const items = data.items || [];
        allItems = allItems.concat(items);

        const count = items.length;
        if (count < perPage) break; // لا مزيد من الصفحات
        page += 1;
        // حد أمان لمنع الدورات الطويلة جداً
        if (page > 30) break;
      }

      if (allItems.length === 0) {
        toast({ title: 'لا توجد بيانات', description: 'لم يتم العثور على منتجات في Zoho.' });
        return;
      }

      // 2) تجميع العناصر بحسب الموديل الأساسي
      function extractProductInfo(item: any) {
        let baseModel: string | null = null;
        let color: string | null = null;
        let size: string | null = null;

        if (item.attribute_name1 && item.attribute_option_name1 && item.attribute_name1.toUpperCase() === 'COLOR') {
          color = item.attribute_option_name1;
        }
        if (item.attribute_name2 && item.attribute_option_name2 && item.attribute_name2.toUpperCase() === 'SIZE') {
          size = item.attribute_option_name2;
        }

        if (item.sku && item.sku.includes('-')) {
          const parts = item.sku.split('-');
          if (parts.length >= 2) {
            baseModel = parts[0];
            if (parts[1].includes('/')) {
              const cs = parts[1].split('/');
              if (cs.length === 2) {
                if (!color) color = cs[0];
                if (!size) size = cs[1];
              }
            }
          }
        }

        if (!baseModel) {
          baseModel = item.name?.split('-')[0] || item.name || `Item_${item.item_id}`;
        }

        return { baseModel, color, size };
      }

      const grouped: Record<string, any[]> = {};
      for (const item of allItems) {
        const { baseModel } = extractProductInfo(item);
        if (!grouped[baseModel]) grouped[baseModel] = [];
        grouped[baseModel].push(item);
      }

      // 3) بناء المنتجات بصيغة موحدة
      const productsToSave: any[] = [];
      for (const [baseModel, items] of Object.entries(grouped)) {
        const mainItem: any = items[0];
        const variants = items.map((it: any) => {
          const { color, size } = extractProductInfo(it);
          return {
            variant_type: size && color ? 'size_color' : size ? 'size' : color ? 'color' : 'single',
            variant_value: size && color ? `${size} - ${color}` : (size || color || 'default'),
            sku: it.sku || null,
            stock: typeof it.available_stock === 'number' ? it.available_stock : (it.stock_on_hand ?? 0),
            price_modifier: 0,
            zoho_item_id: it.item_id
          };
        });

        const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
        const avgPrice = items.reduce((s, it: any) => s + (Number(it.rate) || 0), 0) / items.length;

        productsToSave.push({
          id: `zoho_${baseModel}`,
          title: baseModel,
          description: mainItem.description || baseModel,
          price_sar: Number(avgPrice.toFixed(2)) || 0,
          stock: totalStock,
          category: mainItem.category_name || 'General',
          image_urls: [], // يمكن لاحقاً رفع صور إلى Firebase Storage إذا رغبت
          is_active: mainItem.status === 'active',
          external_id: baseModel,
          variants,
          attributes_schema: {
            COLOR: Array.from(new Set(items.map((it: any) => extractProductInfo(it).color).filter(Boolean))),
            SIZE: Array.from(new Set(items.map((it: any) => extractProductInfo(it).size).filter(Boolean)))
          },
          source: 'zoho_sync_client'
        });
      }

      // 4) حفظ في Firestore
      const db = await getFirebaseFirestore();
      let saved = 0;
      for (const product of productsToSave) {
        try {
          const productRef = doc(db, 'users', user.uid, 'products', product.id);
          await setDoc(productRef, {
            ...product,
            createdAt: new Date(),
            updatedAt: new Date(),
            viewCount: 0,
            orderCount: 0,
            isActive: product.is_active !== false
          });
          saved++;
        } catch (e) {
          console.error('Failed to save product:', product.title, e);
        }
      }

      // 5) تحديث وقت آخر مزامنة في Firebase
      const integrationDoc = doc(db, 'users', user.uid, 'integrations', 'zoho');
      await updateDoc(integrationDoc, { last_sync_at: new Date().toISOString() });
      await loadZohoIntegration();

      toast({ title: 'تمت المزامنة', description: `تم حفظ ${saved} منتج في النظام من Zoho` });
    } catch (error) {
      console.error('Error syncing products (client):', error);
      toast({ title: 'خطأ في المزامنة', description: 'فشل في مزامنة المنتجات من Zoho', variant: 'destructive' });
    } finally {
      setIsSyncing(false);
    }
  };


  const cleanupLinguisticProducts = async () => {
    setIsCleaningUp(true);
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-linguistic-products', {
        body: {}
      });

      if (error) {
        throw error;
      }

      toast({
        title: "تم الحذف",
        description: data.message || `تم حذف ${data.deletedCount} منتج ذو أسماء لغوية`,
      });

      console.log('Cleanup result:', data);
    } catch (error) {
      console.error('Error cleaning up products:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف المنتجات ذات الأسماء اللغوية",
        variant: "destructive",
      });
    } finally {
      setIsCleaningUp(false);
    }
  };

  const toggleIntegration = async (enabled: boolean) => {
    if (!integration || !user?.uid) return;

    try {
      const db = await getFirebaseFirestore();
      const integrationDoc = doc(db, 'users', user.uid, 'integrations', 'zoho');
      await updateDoc(integrationDoc, { 
        is_enabled: enabled,
        updated_at: new Date().toISOString()
      });

      setIntegration({ ...integration, is_enabled: enabled });
      
      toast({
        title: enabled ? "تم التفعيل" : "تم الإيقاف",
        description: enabled 
          ? "تم تفعيل التكامل مع Zoho" 
          : "تم إيقاف التكامل مع Zoho",
      });
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة التكامل",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-primary" />
              <div>
                <CardTitle>تكامل Zoho Inventory</CardTitle>
                <CardDescription>
                  ربط المنصة مع نظام Zoho لإدارة المخزون تلقائياً
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {integration?.is_enabled && (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  نشط
                </Badge>
              )}
              {integration && (
                <Switch
                  checked={integration.is_enabled}
                  onCheckedChange={toggleIntegration}
                />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accessToken">Access Token</Label>
              <Input
                id="accessToken"
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="أدخل Access Token من Zoho"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizationId">Organization ID</Label>
              <Input
                id="organizationId"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                placeholder="أدخل Organization ID"
              />
            </div>
          </div>
          
          <Button 
            onClick={saveIntegrationSettings}
            disabled={isUpdating}
            className="w-full md:w-auto"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              'حفظ الإعدادات'
            )}
          </Button>
        </CardContent>
      </Card>

      {integration?.access_token && integration?.organization_id && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">مزامنة المنتجات</CardTitle>
                  <CardDescription>
                    استيراد المنتجات من Zoho إلى المخزون
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  {integration.last_sync_at && (
                    <p className="text-sm text-muted-foreground">
                      آخر مزامنة: {new Date(integration.last_sync_at).toLocaleString('ar')}
                    </p>
                  )}
                </div>
                <Button 
                  onClick={syncProducts}
                  disabled={isSyncing || !integration.is_enabled}
                  size="lg"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      جاري المزامنة...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      مزامنة المنتجات
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>


          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">المزامنة التلقائية</CardTitle>
                  <CardDescription>
                    عند وصول طلب جديد، سيتم تحديث المخزون في Zoho تلقائياً
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                {integration.is_enabled ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm">
                      المزامنة التلقائية مفعلة - سيتم خصم الكميات من Zoho عند كل طلب
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <span className="text-sm">
                      المزامنة التلقائية متوقفة - قم بتفعيل التكامل لبدء المزامنة
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-destructive" />
                <div>
                  <CardTitle className="text-lg">حذف المنتجات اللغوية</CardTitle>
                  <CardDescription>
                    حذف المنتجات ذات الأسماء اللغوية التي تم إضافتها بالمنطق القديم
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  سيتم حذف المنتجات التي لا تتبع نمط الترميز (مثل AS25-GR/XL) والتي تحمل أسماء لغوية طويلة
                </p>
                <Button 
                  onClick={cleanupLinguisticProducts}
                  disabled={isCleaningUp}
                  variant="destructive"
                  size="lg"
                >
                  {isCleaningUp ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      جاري الحذف...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      حذف المنتجات اللغوية
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ZohoIntegration;