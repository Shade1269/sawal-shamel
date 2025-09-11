import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, Settings, CheckCircle2, AlertCircle, Download, Save, RefreshCw, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ZohoCredentials {
  access_token: string;
  organization_id: string;
}

interface ZohoStatus {
  isConfigured: boolean;
  isConnected: boolean;
  lastSync?: string;
  itemsCount?: number;
}

export const ZohoSetup: React.FC = () => {
  const [credentials, setCredentials] = useState<ZohoCredentials>({
    access_token: '',
    organization_id: ''
  });
  const [status, setStatus] = useState<ZohoStatus>({
    isConfigured: false,
    isConnected: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const { user } = useSupabaseAuth();

  useEffect(() => {
    if (user?.id) {
      loadConfiguration();
    }
  }, [user?.id]);

  const loadConfiguration = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      // الحصول على بروفايل المستخدم
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!profile) return;

      // الحصول على متجر المستخدم
      let { data: shop } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', profile.id)
        .maybeSingle();

      if (!shop) {
        // إنشاء متجر جديد إذا لم يوجد
        const { data: newShopId } = await supabase
          .rpc('create_user_shop', { 
            p_user_id: profile.id, 
            p_shop_name: 'متجري' 
          });
        
        const { data: createdShop } = await supabase
          .from('shops')
          .select('id')
          .eq('id', newShopId)
          .single();
        shop = createdShop;
      }

      // التحقق من وجود تكامل Zoho
      const { data: integration } = await supabase
        .from('zoho_integration')
        .select('*')
        .eq('shop_id', shop.id)
        .maybeSingle();

      if (integration) {
        setCredentials({
          access_token: integration.access_token || '',
          organization_id: integration.organization_id || ''
        });
        setStatus({
          isConfigured: true,
          isConnected: integration.is_enabled,
          lastSync: integration.last_sync_at
        });
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async () => {
    if (!user?.id || !credentials.access_token || !credentials.organization_id) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال جميع البيانات المطلوبة",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      let { data: shop } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', profile.id)
        .maybeSingle();

      if (!shop) {
        const { data: newShopId } = await supabase
          .rpc('create_user_shop', { 
            p_user_id: profile.id, 
            p_shop_name: 'متجري' 
          });
        
        const { data: createdShop } = await supabase
          .from('shops')
          .select('id')
          .eq('id', newShopId)
          .single();
        shop = createdShop;
      }

      const { error } = await supabase
        .from('zoho_integration')
        .upsert({
          shop_id: shop.id,
          access_token: credentials.access_token,
          organization_id: credentials.organization_id,
          is_enabled: false, // سيتم تفعيله بعد اختبار الاتصال
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setStatus(prev => ({ ...prev, isConfigured: true }));
      
      toast({
        title: "تم الحفظ ✅",
        description: "تم حفظ إعدادات Zoho بنجاح. يرجى اختبار الاتصال الآن."
      });
    } catch (error: any) {
      toast({
        title: "خطأ في الحفظ",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    if (!credentials.access_token || !credentials.organization_id) {
      toast({
        title: "خطأ",
        description: "يرجى حفظ الإعدادات أولاً",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('test-zoho-connection', {
        body: {
          access_token: credentials.access_token,
          organization_id: credentials.organization_id
        }
      });

      if (error) throw error;

      if (data.success) {
        // تحديث حالة التكامل في قاعدة البيانات
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();

        if (profile) {
          const { data: shop } = await supabase
            .from('shops')
            .select('id')
            .eq('owner_id', profile.id)
            .single();

          if (shop) {
            await supabase
              .from('zoho_integration')
              .update({ is_enabled: true })
              .eq('shop_id', shop.id);
          }
        }

        setStatus(prev => ({
          ...prev,
          isConnected: true,
          itemsCount: data.items_count
        }));
        
        toast({
          title: "نجح الاتصال! 🎉",
          description: `تم الاتصال بـ Zoho بنجاح. تم العثور على ${data.items_count || 0} منتج`
        });
      } else {
        throw new Error(data.error || 'فشل الاتصال');
      }
    } catch (error: any) {
      setStatus(prev => ({ ...prev, isConnected: false }));
      toast({
        title: "فشل الاتصال ❌",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const generateNewToken = async () => {
    setIsTesting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-zoho-token');

      if (error) throw error;

      if (data.success) {
        // تحديث التوكن الجديد في النموذج
        setCredentials(prev => ({
          ...prev,
          access_token: data.access_token
        }));

        toast({
          title: "تم توليد توكن جديد! 🎉",
          description: `تم توليد وتفعيل توكن جديد بنجاح. صالح لمدة ${Math.floor((data.expires_in || 3600) / 3600)} ساعة`
        });

        // حفظ التوكن الجديد تلقائياً إذا كان المستخدم والمتجر موجودين
        if (user?.id) {
          await saveConfiguration();
        }
      } else {
        throw new Error(data.error || 'فشل في توليد التوكن');
      }
    } catch (error) {
      console.error('Generate token error:', error);
      toast({
        title: "خطأ في توليد التوكن",
        description: error.message || 'تعذر توليد توكن جديد. تأكد من صحة refresh token',
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const syncProducts = async () => {
    if (!status.isConnected) {
      toast({
        title: "خطأ",
        description: "يرجى اختبار الاتصال أولاً",
        variant: "destructive"
      });
      return;
    }

    setIsSyncing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('simple-zoho-sync', {
        body: {
          access_token: credentials.access_token,
          organization_id: credentials.organization_id,
          user_id: user?.id
        }
      });

      if (error) throw error;

      if (data.success) {
        setStatus(prev => ({ 
          ...prev, 
          lastSync: new Date().toISOString() 
        }));
        
        toast({
          title: "نجح التزامن! 🚀",
          description: `تم استيراد ${data.synced_count || 0} منتج من Zoho بنجاح`
        });
      } else {
        throw new Error(data.error || 'فشل التزامن');
      }
    } catch (error: any) {
      toast({
        title: "فشل التزامن",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusBadge = () => {
    if (status.isConnected) {
      return <Badge className="bg-green-100 text-green-800 border-green-300">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        متصل ونشط
      </Badge>;
    } else if (status.isConfigured) {
      return <Badge variant="outline" className="text-yellow-700 border-yellow-300">
        <AlertCircle className="w-3 h-3 mr-1" />
        محفوظ - يحتاج اختبار
      </Badge>;
    }
    return <Badge variant="outline">
      <Settings className="w-3 h-3 mr-1" />
      غير مكتمل
    </Badge>;
  };

  if (isLoading && !status.isConfigured) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          جاري التحميل...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* بطاقة الحالة */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                تكامل Zoho Inventory
              </CardTitle>
              <CardDescription>
                ربط متجرك مع Zoho لإدارة المخزون تلقائياً
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          {status.isConnected && status.itemsCount && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                متصل بنجاح! تم العثور على {status.itemsCount} منتج في Zoho
                {status.lastSync && (
                  <span className="block text-sm text-muted-foreground mt-1">
                    آخر مزامنة: {new Date(status.lastSync).toLocaleString('ar-SA')}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* بطاقة الإعدادات */}
      <Card>
        <CardHeader>
          <CardTitle>إعدادات الاتصال</CardTitle>
          <CardDescription>
            أدخل بيانات Zoho API للاتصال بحسابك
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              💡 تحتاج إلى Access Token و Organization ID من Zoho API Console
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Label htmlFor="access_token">Access Token</Label>
            <Input
              id="access_token"
              type="password"
              placeholder="أدخل الـ Access Token من Zoho"
              value={credentials.access_token}
              onChange={(e) => setCredentials(prev => ({ 
                ...prev, 
                access_token: e.target.value 
              }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization_id">Organization ID</Label>
            <Input
              id="organization_id"
              type="text"
              placeholder="أدخل الـ Organization ID"
              value={credentials.organization_id}
              onChange={(e) => setCredentials(prev => ({ 
                ...prev, 
                organization_id: e.target.value 
              }))}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={saveConfiguration}
              disabled={isLoading || !credentials.access_token || !credentials.organization_id}
              className="flex-1 sm:flex-none"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              حفظ الإعدادات
            </Button>
            
            <Button 
              onClick={testConnection}
              disabled={isTesting || !status.isConfigured}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              {isTesting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              اختبار الاتصال
            </Button>
            
            <Button 
              onClick={generateNewToken}
              disabled={isTesting}
              variant="secondary"
              className="flex-1 sm:flex-none"
            >
              {isTesting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              توليد توكن جديد
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* بطاقة المزامنة */}
      {status.isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              مزامنة المنتجات
            </CardTitle>
            <CardDescription>
              استيراد المنتجات من Zoho إلى متجرك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={syncProducts}
              disabled={isSyncing}
              className="w-full"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  جاري المزامنة...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  بدء مزامنة المنتجات
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ZohoSetup;