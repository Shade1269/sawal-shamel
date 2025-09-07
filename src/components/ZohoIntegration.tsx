import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2, RefreshCw, Settings, CheckCircle2, AlertCircle, Zap, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ZohoIntegrationProps {
  shopId: string;
}

interface ZohoIntegration {
  id: string;
  access_token: string | null;
  organization_id: string | null;
  last_sync_at: string | null;
  is_enabled: boolean;
}

export const ZohoIntegration: React.FC<ZohoIntegrationProps> = ({ shopId }) => {
  const [integration, setIntegration] = useState<ZohoIntegration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadZohoIntegration();
  }, [shopId]);

  const loadZohoIntegration = async () => {
    try {
      const { data, error } = await supabase
        .from('zoho_integration')
        .select('*')
        .eq('shop_id', shopId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading Zoho integration:', error);
        return;
      }

      if (data) {
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
    if (!accessToken.trim() || !organizationId.trim()) {
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
        shop_id: shopId,
        access_token: accessToken.trim(),
        organization_id: organizationId.trim(),
        is_enabled: true,
      };

      const { data, error } = integration 
        ? await supabase
            .from('zoho_integration')
            .update(integrationData)
            .eq('id', integration.id)
            .select()
            .single()
        : await supabase
            .from('zoho_integration')
            .insert(integrationData)
            .select()
            .single();

      if (error) {
        throw error;
      }

      setIntegration(data);
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
    if (!integration?.access_token || !integration?.organization_id) {
      toast({
        title: "خطأ",
        description: "يرجى إعداد بيانات التكامل أولاً",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-zoho-products', {
        body: {
          shopId,
          accessToken: integration.access_token,
          organizationId: integration.organization_id,
        },
      });

      if (error) {
        throw error;
      }

      await loadZohoIntegration(); // Refresh data
      
      toast({
        title: "تمت المزامنة",
        description: data.message || "تم تحديث المنتجات من Zoho بنجاح",
      });
    } catch (error) {
      console.error('Error syncing products:', error);
      toast({
        title: "خطأ في المزامنة",
        description: "فشل في مزامنة المنتجات من Zoho",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };


  const cleanupLinguisticProducts = async () => {
    setIsCleaningUp(true);
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-linguistic-products', {
        body: {
          shopId: shopId
        }
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
    if (!integration) return;

    try {
      const { error } = await supabase
        .from('zoho_integration')
        .update({ is_enabled: enabled })
        .eq('id', integration.id);

      if (error) {
        throw error;
      }

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
                  ربط متجرك مع نظام Zoho لإدارة المخزون تلقائياً
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