import { useState, useEffect } from 'react';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardDescription as CardDescription, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield,
  Lock,
  Unlock,
  Key,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Save
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
  granted: boolean;
}

const defaultPermissions: PermissionGroup[] = [
  {
    id: 'user_management',
    name: 'إدارة المستخدمين',
    description: 'صلاحيات إدارة حسابات المستخدمين',
    permissions: [
      { id: 'view_users', name: 'عرض المستخدمين', description: 'إمكانية عرض قائمة المستخدمين', granted: false },
      { id: 'create_users', name: 'إضافة مستخدمين', description: 'إنشاء حسابات مستخدمين جديدة', granted: false },
      { id: 'edit_users', name: 'تعديل المستخدمين', description: 'تحرير بيانات المستخدمين', granted: false },
      { id: 'delete_users', name: 'حذف المستخدمين', description: 'حذف حسابات المستخدمين', granted: false },
      { id: 'manage_roles', name: 'إدارة الأدوار', description: 'تعديل أدوار المستخدمين', granted: false },
    ]
  },
  {
    id: 'content_management',
    name: 'إدارة المحتوى',
    description: 'صلاحيات إدارة المنتجات والمحتوى',
    permissions: [
      { id: 'view_products', name: 'عرض المنتجات', description: 'إمكانية عرض جميع المنتجات', granted: false },
      { id: 'create_products', name: 'إضافة منتجات', description: 'إنشاء منتجات جديدة', granted: false },
      { id: 'edit_products', name: 'تعديل المنتجات', description: 'تحرير المنتجات الموجودة', granted: false },
      { id: 'delete_products', name: 'حذف المنتجات', description: 'حذف المنتجات', granted: false },
      { id: 'manage_categories', name: 'إدارة الفئات', description: 'إدارة فئات المنتجات', granted: false },
    ]
  },
  {
    id: 'financial_management',
    name: 'الإدارة المالية',
    description: 'صلاحيات إدارة المعاملات المالية',
    permissions: [
      { id: 'view_orders', name: 'عرض الطلبات', description: 'إمكانية عرض جميع الطلبات', granted: false },
      { id: 'manage_orders', name: 'إدارة الطلبات', description: 'تعديل وإدارة الطلبات', granted: false },
      { id: 'view_earnings', name: 'عرض الأرباح', description: 'إمكانية عرض تقارير الأرباح', granted: false },
      { id: 'manage_commissions', name: 'إدارة العمولات', description: 'تعديل وإدارة العمولات', granted: false },
      { id: 'financial_reports', name: 'التقارير المالية', description: 'الوصول للتقارير المالية المفصلة', granted: false },
    ]
  },
  {
    id: 'system_administration',
    name: 'إدارة النظام',
    description: 'صلاحيات إدارة النظام المتقدمة',
    permissions: [
      { id: 'system_settings', name: 'إعدادات النظام', description: 'تعديل إعدادات النظام العامة', granted: false },
      { id: 'view_logs', name: 'عرض السجلات', description: 'إمكانية عرض سجلات النظام', granted: false },
      { id: 'backup_restore', name: 'النسخ الاحتياطي', description: 'إنشاء واستعادة النسخ الاحتياطية', granted: false },
      { id: 'security_audit', name: 'تدقيق الأمان', description: 'إجراء تدقيق أمني على النظام', granted: false },
      { id: 'api_access', name: 'وصول API', description: 'الوصول لواجهات برمجة التطبيقات', granted: false },
    ]
  }
];

export const UserPermissions = ({ user }: { user: User }) => {
  const [permissions, setPermissions] = useState<PermissionGroup[]>(defaultPermissions);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUserPermissions();
  }, [user.id]);

  const loadUserPermissions = async () => {
    // In a real app, this would load from database
    // For now, we'll simulate based on role
    const roleBasedPermissions = getRoleBasedPermissions(user.role);
    setPermissions(roleBasedPermissions);
  };

  const getRoleBasedPermissions = (role: string): PermissionGroup[] => {
    return defaultPermissions.map(group => ({
      ...group,
      permissions: group.permissions.map(permission => ({
        ...permission,
        granted: getDefaultPermissionForRole(role, permission.id)
      }))
    }));
  };

  const getDefaultPermissionForRole = (role: string, permissionId: string): boolean => {
    switch (role) {
      case 'admin':
        return true; // Admins get all permissions
      case 'moderator':
        return !['delete_users', 'system_settings', 'backup_restore', 'security_audit'].includes(permissionId);
      case 'affiliate':
      case 'merchant':
        return ['view_products', 'view_orders', 'view_earnings'].includes(permissionId);
      default:
        return false;
    }
  };

  const togglePermission = (groupId: string, permissionId: string) => {
    setPermissions(prev => prev.map(group => 
      group.id === groupId 
        ? {
            ...group,
            permissions: group.permissions.map(permission =>
              permission.id === permissionId
                ? { ...permission, granted: !permission.granted }
                : permission
            )
          }
        : group
    ));
    setHasChanges(true);
  };

  const toggleGroupPermissions = (groupId: string, granted: boolean) => {
    setPermissions(prev => prev.map(group =>
      group.id === groupId
        ? {
            ...group,
            permissions: group.permissions.map(permission => ({
              ...permission,
              granted
            }))
          }
        : group
    ));
    setHasChanges(true);
  };

  const savePermissions = async () => {
    setLoading(true);
    try {
      // In a real app, this would save to database
      // For now, we'll simulate a save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "تم حفظ الصلاحيات",
        description: "تم تحديث صلاحيات المستخدم بنجاح",
      });
      
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "تعذر حفظ الصلاحيات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPermissions = () => {
    const roleBasedPermissions = getRoleBasedPermissions(user.role);
    setPermissions(roleBasedPermissions);
    setHasChanges(false);
    
    toast({
      title: "تم إعادة تعيين الصلاحيات",
      description: "تم إرجاع الصلاحيات للإعدادات الافتراضية للدور",
    });
  };

  const getPermissionIcon = (granted: boolean) => {
    return granted ? (
      <CheckCircle className="h-4 w-4 text-success" />
    ) : (
      <XCircle className="h-4 w-4 text-destructive" />
    );
  };

  const getGroupStats = (group: PermissionGroup) => {
    const grantedCount = group.permissions.filter(p => p.granted).length;
    const totalCount = group.permissions.length;
    return { granted: grantedCount, total: totalCount };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              إدارة الصلاحيات
            </CardTitle>
            <CardDescription>
              إدارة صلاحيات المستخدم: {user.full_name}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={user.is_active ? "default" : "secondary"}>
              {user.is_active ? 'نشط' : 'غير نشط'}
            </Badge>
            <Badge variant="outline">{user.role}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Role Warning */}
        {user.role === 'admin' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              تحذير: هذا المستخدم لديه دور مدير، جميع الصلاحيات ممنوحة بشكل تلقائي.
            </AlertDescription>
          </Alert>
        )}

        {/* Permission Groups */}
        <div className="space-y-6">
          {permissions.map((group) => {
            const stats = getGroupStats(group);
            const allGranted = stats.granted === stats.total;
            const someGranted = stats.granted > 0 && stats.granted < stats.total;
            
            return (
              <Card key={group.id} className="border-l-4 border-l-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        allGranted ? 'bg-success/10 text-success' :
                        someGranted ? 'bg-warning/10 text-warning' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        <Key className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{group.name}</h3>
                        <p className="text-sm text-muted-foreground">{group.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-xs">
                        {stats.granted}/{stats.total}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleGroupPermissions(group.id, true)}
                          disabled={allGranted}
                        >
                          <Unlock className="h-3 w-3 ml-1" />
                          منح الكل
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleGroupPermissions(group.id, false)}
                          disabled={stats.granted === 0}
                        >
                          <Lock className="h-3 w-3 ml-1" />
                          منع الكل
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid gap-3">
                    {group.permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                        <div className="flex items-center gap-3">
                          {getPermissionIcon(permission.granted)}
                          <div>
                            <div className="font-medium text-sm">{permission.name}</div>
                            <div className="text-xs text-muted-foreground">{permission.description}</div>
                          </div>
                        </div>
                        <Switch
                          checked={permission.granted}
                          onCheckedChange={() => togglePermission(group.id, permission.id)}
                          disabled={user.role === 'admin'} // Admins always have all permissions
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Action Buttons */}
        <Separator />
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetPermissions}>
              إعادة تعيين
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-warning">
                يوجد تغييرات غير محفوظة
              </Badge>
            )}
            <Button 
              onClick={savePermissions} 
              disabled={!hasChanges || loading}
              className="min-w-[100px]"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="h-4 w-4 ml-2" />
                  حفظ الصلاحيات
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};