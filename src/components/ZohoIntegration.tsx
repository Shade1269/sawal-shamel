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
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface ZohoIntegration {
  id: string;
  access_token: string | null;
  organization_id: string | null;
  last_sync_at: string | null;
  is_enabled: boolean;
  client_id: string | null;
  client_secret: string | null;
}

export const ZohoIntegration: React.FC = () => {
  const [integration, setIntegration] = useState<ZohoIntegration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const { toast } = useToast();
  const { user } = useSupabaseAuth();

  useEffect(() => {
    loadZohoIntegration();
  }, []);

  const loadZohoIntegration = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('zoho_integration')
        .select('*')
        .eq('shop_id', user?.id)
        .single();

      if (data) {
        setIntegration(data);
        setAccessToken(data.access_token || '');
        setOrganizationId(data.organization_id || '');
        setClientId(data.client_id || '');
        setClientSecret(data.client_secret || '');
      }
    } catch (err) {
      console.error('Error loading Zoho integration:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateIntegration = async () => {
    if (!user?.id) return;
    
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('zoho_integration')
        .upsert({
          shop_id: user?.id,
          client_id: clientId,
          client_secret: clientSecret,
          organization_id: organizationId,
          access_token: accessToken,
          is_enabled: true
        });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "تم حفظ الإعدادات",
        description: "تم حفظ إعدادات Zoho بنجاح"
      });

      await loadZohoIntegration();
    } catch (err: any) {
      console.error('Error updating integration:', err);
      toast({
        title: "خطأ في الحفظ",
        description: err.message || "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const syncProducts = async () => {
    if (!integration?.access_token || !integration?.organization_id) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى إدخال جميع البيانات المطلوبة",
        variant: "destructive"
      });
      return;
    }
    
    setIsSyncing(true);
    
    try {
      const response = await fetch(`https://uewuiiopkctdtaexmtxu.supabase.co/functions/v1/sync-zoho-to-firestore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVld3VpaW9wa2N0ZHRhZXhtdHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMjE2ODUsImV4cCI6MjA3MTg5NzY4NX0._q03bmVxGQhCczoBaOHM6mIGbA7_B4B7PZ5mhDefuFA`
        },
        body: JSON.stringify({
          userId: user?.id,
          accessToken: integration.access_token,
          organizationId: integration.organization_id,
          maxModels: 100
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Save to Supabase only
        const { error } = await supabase
          .from('zoho_integration')
          .upsert({
            shop_id: user?.id,
            client_id: clientId,
            client_secret: clientSecret,
            organization_id: organizationId,
            access_token: accessToken,
            is_enabled: true
          });

        if (error) {
          throw new Error(error.message);
        }

        toast({
          title: "نجح التزامن",
          description: `تم استيراد ${result.modelsReturned} منتج من Zoho`,
        });
        
        await loadZohoIntegration();
      } else {
        throw new Error(result.error || 'فشل التزامن');
      }
    } catch (err: any) {
      console.error('Sync error:', err);
      toast({
        title: "فشل التزامن",
        description: err.message || "حدث خطأ أثناء التزامن مع Zoho",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const refreshToken = async () => {
    if (!clientId || !clientSecret) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى إدخال Client ID و Client Secret أولاً",
        variant: "destructive"
      });
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const response = await fetch(`https://uewuiiopkctdtaexmtxu.supabase.co/functions/v1/refresh-zoho-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVld3VpaW9wa2N0ZHRhZXhtdHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMjE2ODUsImV4cCI6MjA3MVkOTc2ODV0._q03bmVxGQhCczoBaOHM6mIGbA7_B4B7PZ5mhDefuFA`
        },
        body: JSON.stringify({
          clientId,
          clientSecret,
          refreshToken: integration?.access_token
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const newAccessToken = result.access_token;
        setAccessToken(newAccessToken);

        const { error } = await supabase
          .from('zoho_integration')
          .upsert({
            shop_id: user?.id,
            client_id: clientId,
            client_secret: clientSecret,
            organization_id: organizationId,
            access_token: newAccessToken,
            is_enabled: true
          });

        if (error) {
          throw new Error(error.message);
        }
        
        toast({
          title: "تم تحديث الرمز المميز",
          description: "تم تحديث رمز الوصول بنجاح"
        });
        
        await loadZohoIntegration();
      } else {
        throw new Error(result.error || 'فشل تحديث الرمز المميز');
      }
    } catch (err: any) {
      console.error('Token refresh error:', err);
      toast({
        title: "فشل تحديث الرمز المميز",
        description: err.message || "حدث خطأ أثناء تحديث الرمز المميز",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const cleanupProducts = async () => {
    setIsCleaningUp(true);
    
    try {
      const response = await fetch(`https://uewuiiopkctdtaexmtxu.supabase.co/functions/v1/cleanup-linguistic-products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVld3VpaW9wa2N0ZHRhZXhtdHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMjE2ODUsImV4cCI6MjA3MVkOTc2ODV0._q03bmVxGQhCczoBaOHM6mIGbA7_B4B7PZ5mhDefuFA`
        },
        body: JSON.stringify({
          userId: user?.id
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "تم التنظيف",
          description: `تم حذف ${result.deletedCount} منتج مكرر`
        });
      } else {
        throw new Error(result.error || 'فشل التنظيف');
      }
    } catch (err: any) {
      console.error('Cleanup error:', err);
      toast({
        title: "فشل التنظيف",
        description: err.message || "حدث خطأ أثناء تنظيف المنتجات",
        variant: "destructive"
      });
    } finally {
      setIsCleaningUp(false);
    }
  };

  const getStatusBadge = () => {
    if (integration?.is_enabled && integration?.access_token) {
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />متصل</Badge>;
    }
    return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />غير متصل</Badge>;
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
                تكامل Zoho Inventory
              </CardTitle>
              <CardDescription>
                ربط متجرك مع نظام إدارة المخزون Zoho
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="أدخل Client ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientSecret">Client Secret</Label>
              <Input
                id="clientSecret"
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="أدخل Client Secret"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizationId">Organization ID</Label>
              <Input
                id="organizationId"
                type="text"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                placeholder="أدخل Organization ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accessToken">Access Token</Label>
              <Input
                id="accessToken"
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="أدخل Access Token"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={updateIntegration} 
              disabled={isUpdating}
              className="flex-1 sm:flex-none"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              حفظ الإعدادات
            </Button>
            
            <Button 
              onClick={refreshToken} 
              disabled={isUpdating}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              تحديث الرمز المميز
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            مزامنة المنتجات
          </CardTitle>
          <CardDescription>
            استيراد وتحديث المنتجات من Zoho Inventory
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {integration?.last_sync_at && (
            <p className="text-sm text-muted-foreground">
              آخر مزامنة: {new Date(integration.last_sync_at).toLocaleString('ar-SA')}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={syncProducts} 
              disabled={isSyncing || !integration?.access_token}
              className="flex-1 sm:flex-none"
            >
              {isSyncing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              مزامنة المنتجات
            </Button>
            
            <Button 
              onClick={cleanupProducts} 
              disabled={isCleaningUp}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              {isCleaningUp ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              تنظيف المنتجات المكررة
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ZohoIntegration;