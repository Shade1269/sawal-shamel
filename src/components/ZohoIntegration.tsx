import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Settings, CheckCircle2, AlertCircle, Zap, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ZohoIntegration {
  organization_id: string | null;
  last_sync_at: string | null;
  is_enabled: boolean;
  token_status: 'active' | 'expired' | 'error';
}

export const ZohoIntegration: React.FC = () => {
  const [integration, setIntegration] = useState<ZohoIntegration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const { toast } = useToast();
  const { user } = useSupabaseAuth();

  useEffect(() => {
    if (user?.id) {
      loadZohoIntegration();
    }
  }, [user?.id]);

  const loadZohoIntegration = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('check-zoho-status');

      if (error) throw error;

      if (data && data.success) {
        setIntegration({
          organization_id: data.organization_id,
          last_sync_at: data.last_sync_at,
          is_enabled: data.is_enabled,
          token_status: data.token_status
        });
      } else {
        setIntegration({
          organization_id: null,
          last_sync_at: null,
          is_enabled: false,
          token_status: 'error'
        });
      }
    } catch (err) {
      console.error('Error loading Zoho integration status:', err);
      setIntegration({
        organization_id: null,
        last_sync_at: null,
        is_enabled: false,
        token_status: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const syncProducts = async () => {
    if (!integration?.is_enabled) {
      toast({
        title: "تكامل Zoho غير نشط",
        description: "يرجى التأكد من حالة التكامل أولاً",
        variant: "destructive"
      });
      return;
    }
    
    setIsSyncing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('sync-zoho-products', {
        body: { userId: user?.id }
      });

      if (error) throw error;
      
      if (data && data.success) {
        toast({
          title: "نجح التزامن",
          description: `تم استيراد ${data.synced || 0} منتج من Zoho`,
        });
        
        await loadZohoIntegration();
      } else {
        throw new Error(data?.error || 'فشل التزامن');
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

  const refreshAccessToken = async () => {
    setIsRefreshing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('refresh-zoho-token');

      if (error) throw error;
      
      if (data && data.success) {
        toast({
          title: "تم تحديث الرمز المميز",
          description: "تم تحديث رمز الوصول بنجاح من السيكرت"
        });
        
        await loadZohoIntegration();
      } else {
        throw new Error(data?.error || 'فشل تحديث الرمز المميز');
      }
    } catch (err: any) {
      console.error('Token refresh error:', err);
      toast({
        title: "فشل تحديث الرمز المميز",
        description: err.message || "حدث خطأ أثناء تحديث الرمز المميز",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const cleanupProducts = async () => {
    setIsCleaningUp(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-linguistic-products', {
        body: { userId: user?.id }
      });

      if (error) throw error;
      
      if (data && data.success) {
        toast({
          title: "تم التنظيف",
          description: `تم حذف ${data.deletedCount} منتج مكرر`
        });
      } else {
        throw new Error(data?.error || 'فشل التنظيف');
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
    if (integration?.is_enabled && integration?.token_status === 'active') {
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />متصل ونشط</Badge>;
    } else if (integration?.token_status === 'expired') {
      return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />التوكن منتهي الصلاحية</Badge>;
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
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              🔒 جميع بيانات التكامل محفوظة بشكل آمن في السيكرت. يتم تحديث التوكن تلقائياً كل 30 دقيقة.
            </p>
          </div>
          
          {integration?.organization_id && (
            <div className="space-y-2">
              <Label>Organization ID</Label>
              <Input
                type="text"
                value={integration.organization_id}
                readOnly
                className="bg-gray-50"
              />
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={refreshAccessToken} 
              disabled={isRefreshing}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              تحديث التوكن الآن
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
              disabled={isSyncing || !integration?.is_enabled || integration?.token_status !== 'active'}
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