import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, 
  Users, 
  Store, 
  Package, 
  Activity, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  RefreshCw
} from 'lucide-react';
import {
  migrateUsers,
  migrateShops,
  migrateProducts,
  migrateProductLibrary,
  migrateUserActivities,
  migrateAllData,
  checkMigratedData
} from '@/lib/dataMigration';

interface MigrationResult {
  success: boolean;
  count?: number;
  total?: number;
  error?: any;
}

interface MigrationStatus {
  users: MigrationResult | null;
  shops: MigrationResult | null;
  products: MigrationResult | null;
  productLibrary: MigrationResult | null;
  activities: MigrationResult | null;
}

const DataMigrationPanel = () => {
  const [loading, setLoading] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>({
    users: null,
    shops: null,
    products: null,
    productLibrary: null,
    activities: null
  });
  const [overallProgress, setOverallProgress] = useState(0);
  const { toast } = useToast();

  const migrationSteps = [
    {
      key: 'users' as keyof MigrationStatus,
      title: 'المستخدمين',
      description: 'نقل ملفات المستخدمين والأدوار',
      icon: Users,
      action: migrateUsers
    },
    {
      key: 'shops' as keyof MigrationStatus,
      title: 'المتاجر',
      description: 'نقل بيانات المتاجر والإعدادات',
      icon: Store,
      action: migrateShops
    },
    {
      key: 'products' as keyof MigrationStatus,
      title: 'المنتجات',
      description: 'نقل المنتجات والمتغيرات',
      icon: Package,
      action: migrateProducts
    },
    {
      key: 'productLibrary' as keyof MigrationStatus,
      title: 'مكتبة المنتجات',
      description: 'نقل مكتبة المنتجات المشتركة',
      icon: Database,
      action: migrateProductLibrary
    },
    {
      key: 'activities' as keyof MigrationStatus,
      title: 'الأنشطة',
      description: 'نقل سجل أنشطة المستخدمين',
      icon: Activity,
      action: migrateUserActivities
    }
  ];

  const runSingleMigration = async (step: typeof migrationSteps[0]) => {
    try {
      setLoading(true);
      
      toast({
        title: "بدء النقل",
        description: `جاري نقل ${step.title}...`
      });

      const result = await step.action();
      
      setMigrationStatus(prev => ({
        ...prev,
        [step.key]: result
      }));

      if (result.success) {
        toast({
          title: "تم النقل بنجاح",
          description: `تم نقل ${result.count} من ${result.total} عنصر في ${step.title}`
        });
      } else {
        toast({
          title: "فشل النقل",
          description: `فشل في نقل ${step.title}`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error(`خطأ في نقل ${step.title}:`, error);
      toast({
        title: "خطأ",
        description: `حدث خطأ أثناء نقل ${step.title}`,
        variant: "destructive"
      });
      
      setMigrationStatus(prev => ({
        ...prev,
        [step.key]: { success: false, error }
      }));
    } finally {
      setLoading(false);
    }
  };

  const runFullMigration = async () => {
    try {
      setLoading(true);
      setOverallProgress(0);
      
      toast({
        title: "بدء النقل الشامل",
        description: "جاري نقل جميع البيانات من Supabase إلى Firebase..."
      });

      // Reset status
      setMigrationStatus({
        users: null,
        shops: null,
        products: null,
        productLibrary: null,
        activities: null
      });

      const result = await migrateAllData();
      
      if (result.success && result.results) {
        setMigrationStatus({
          users: result.results.users,
          shops: result.results.shops,
          products: result.results.products,
          productLibrary: result.results.productLibrary,
          activities: result.results.activities
        });

        const totalMigrated = Object.values(result.results).reduce((sum, r) => sum + (r.count || 0), 0);
        const totalItems = Object.values(result.results).reduce((sum, r) => sum + (r.total || 0), 0);
        
        setOverallProgress(100);
        
        toast({
          title: "تم النقل بنجاح",
          description: `تم نقل ${totalMigrated} عنصر من أصل ${totalItems} بنجاح`
        });
      } else {
        toast({
          title: "فشل النقل الشامل",
          description: "حدث خطأ أثناء النقل الشامل",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('خطأ في النقل الشامل:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء النقل الشامل",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkData = async () => {
    try {
      setLoading(true);
      
      const result = await checkMigratedData();
      
      if (result.success) {
        toast({
          title: "فحص البيانات",
          description: result.message || `تم العثور على ${result.totalUsers} مستخدم في Firebase`
        });
      } else {
        toast({
          title: "خطأ في الفحص",
          description: "فشل في فحص البيانات",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('خطأ في فحص البيانات:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء فحص البيانات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: MigrationResult | null) => {
    if (!status) return <Badge variant="secondary">في الانتظار</Badge>;
    if (status.success) {
      return <Badge variant="default" className="bg-green-500">تم النقل ({status.count}/{status.total})</Badge>;
    }
    return <Badge variant="destructive">فشل</Badge>;
  };

  const getStatusIcon = (status: MigrationResult | null) => {
    if (!status) return null;
    if (status.success) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            نقل البيانات من Supabase إلى Firebase
          </CardTitle>
          <CardDescription>
            انقل جميع البيانات من قاعدة بيانات Supabase إلى Firebase Firestore
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Progress */}
          {overallProgress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">التقدم الإجمالي</span>
                <span className="text-sm text-muted-foreground">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} />
            </div>
          )}

          {/* Migration Steps */}
          <div className="grid gap-4">
            {migrationSteps.map((step) => {
              const status = migrationStatus[step.key];
              const StepIcon = step.icon;
              
              return (
                <div key={step.key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <StepIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{step.title}</h4>
                        {getStatusIcon(status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(status)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => runSingleMigration(step)}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      نقل
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={runFullMigration}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              نقل جميع البيانات
            </Button>
            <Button
              variant="outline"
              onClick={checkData}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              فحص البيانات
            </Button>
          </div>

          {/* Warning */}
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-medium mb-1">تحذير مهم:</p>
                <ul className="space-y-1">
                  <li>• تأكد من وجود اتصال مستقر بالإنترنت</li>
                  <li>• العملية قد تستغرق وقتاً طويلاً حسب حجم البيانات</li>
                  <li>• لا تغلق المتصفح أثناء عملية النقل</li>
                  <li>• سيتم الاحتفاظ بالبيانات الأصلية في Supabase</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataMigrationPanel;