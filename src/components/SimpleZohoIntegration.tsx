import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Settings, CheckCircle2, AlertCircle, Download, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ZohoSettings {
  access_token: string;
  organization_id: string;
  is_enabled: boolean;
  last_sync_at: string | null;
}

export const SimpleZohoIntegration: React.FC = () => {
  const [settings, setSettings] = useState<ZohoSettings>({
    access_token: '',
    organization_id: '',
    is_enabled: false,
    last_sync_at: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useSupabaseAuth();

  useEffect(() => {
    if (user?.id) {
      loadSettings();
    }
  }, [user?.id]);

  const loadSettings = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!profile) return;

      // احصل على متجر المستخدم (أو أنشئ واحداً إذا لم يوجد)
      let { data: shop } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', profile.id)
        .maybeSingle();

      if (!shop) {
        const { data: newShopId, error: createShopError } = await supabase
          .rpc('create_user_shop', { p_user_id: profile.id, p_shop_name: 'متجري' });
        if (createShopError) throw createShopError;
        // استعلم عن المتجر الذي تم إنشاؤه للتو
        const { data: createdShop } = await supabase
          .from('shops')
          .select('id')
          .eq('id', newShopId)
          .single();
        shop = createdShop;
      }

      const { data } = await supabase
        .from('zoho_integration')
        .select('*')
        .eq('shop_id', shop.id)
        .maybeSingle();

      if (data) {
        setSettings({
          access_token: data.access_token || '',
          organization_id: data.organization_id || '',
          is_enabled: data.is_enabled,
          last_sync_at: data.last_sync_at
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const saveSettings = async () => {
    if (!user?.id || !settings.access_token || !settings.organization_id) {
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

      // احصل على متجر المستخدم (أو أنشئ واحداً إذا لم يوجد)
      let { data: shop } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', profile.id)
        .maybeSingle();

      if (!shop) {
        const { data: newShopId, error: createShopError } = await supabase
          .rpc('create_user_shop', { p_user_id: profile.id, p_shop_name: 'متجري' });
        if (createShopError) throw createShopError;
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
          access_token: settings.access_token,
          organization_id: settings.organization_id,
          is_enabled: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'shop_id'
        });

      if (error) throw error;

      setSettings(prev => ({ ...prev, is_enabled: true }));
      
      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات Zoho بنجاح"
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
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
    if (!settings.access_token || !settings.organization_id) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال التوكن والـ Organization ID أولاً",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('test-zoho-connection', {
        body: {
          access_token: settings.access_token,
          organization_id: settings.organization_id
        }
      });

      if (error) throw error;

      if (data.success) {
        setTestResult('success');
        toast({
          title: "نجح الاتصال! ✅",
          description: `تم العثور على ${data.items_count || 0} عنصر في Zoho`
        });
      } else {
        setTestResult('error');
        toast({
          title: "فشل الاتصال ❌",
          description: data.error || 'خطأ غير معروف',
          variant: "destructive"
        });
      }
    } catch (error: any) {
      setTestResult('error');
      toast({
        title: "خطأ في الاتصال",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const syncProducts = async () => {
    if (!settings.is_enabled || testResult !== 'success') {
      toast({
        title: "خطأ",
        description: "يرجى حفظ الإعدادات واختبار الاتصال أولاً",
        variant: "destructive"
      });
      return;
    }

    setIsSyncing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('simple-zoho-sync', {
        body: {
          access_token: settings.access_token,
          organization_id: settings.organization_id,
          user_id: user?.id
        }
      });

      if (error) throw error;

      if (data.success) {
        setSettings(prev => ({ ...prev, last_sync_at: new Date().toISOString() }));
        toast({
          title: "نجح التزامن! 🎉",
          description: `تم استيراد ${data.synced_count || 0} منتج من Zoho`
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
    if (settings.is_enabled && testResult === 'success') {
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />متصل ونشط</Badge>;
    } else if (testResult === 'error') {
      return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />خطأ في الاتصال</Badge>;
    } else if (settings.is_enabled) {
      return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />محفوظ - يحتاج اختبار</Badge>;
    }
    return <Badge variant="outline"><Settings className="w-3 h-3 mr-1" />غير مكتمل</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                تكامل Zoho - إدخال يدوي
              </CardTitle>
              <CardDescription>
                أدخل بيانات Zoho الخاصة بك يدوياً
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 احصل على Access Token من Zoho Console، وOrganization ID من إعدادات حسابك
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="access_token">Access Token</Label>
            <Input
              id="access_token"
              type="password"
              placeholder="أدخل الـ Access Token من Zoho"
              value={settings.access_token}
              onChange={(e) => setSettings(prev => ({ ...prev, access_token: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization_id">Organization ID</Label>
            <Input
              id="organization_id"
              type="text"
              placeholder="أدخل الـ Organization ID"
              value={settings.organization_id}
              onChange={(e) => setSettings(prev => ({ ...prev, organization_id: e.target.value }))}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={saveSettings}
              disabled={isLoading || !settings.access_token || !settings.organization_id}
              className="flex-1 sm:flex-none"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              حفظ الإعدادات
            </Button>
            
            <Button 
              onClick={testConnection}
              disabled={isTesting || !settings.access_token || !settings.organization_id}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              {isTesting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              اختبار الاتصال
            </Button>
          </div>

          {settings.last_sync_at && (
            <p className="text-sm text-muted-foreground">
              آخر مزامنة: {new Date(settings.last_sync_at).toLocaleString('ar-SA')}
            </p>
          )}
        </CardContent>
      </Card>

      {settings.is_enabled && testResult === 'success' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
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
              {isSyncing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              بدء مزامنة المنتجات
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SimpleZohoIntegration;