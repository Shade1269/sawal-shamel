import React, { useState } from 'react';
import { 
  EnhancedCard, 
  EnhancedCardContent, 
  EnhancedCardDescription, 
  EnhancedCardHeader, 
  EnhancedCardTitle,
  ResponsiveLayout,
  ResponsiveGrid,
  InteractiveWidget,
  EnhancedButton,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button
} from '@/components/ui/index';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, 
  Users, 
  Crown, 
  Store, 
  Star, 
  ShoppingCart,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';

const AdminPermissions = () => {
  const [permissions, setPermissions] = useState({
    admin: {
      name: 'مدير النظام',
      icon: Crown,
      color: 'text-red-600',
      permissions: {
        users_manage: true,
        products_manage: true,
        orders_manage: true,
        reports_view: true,
        settings_manage: true,
        system_admin: true
      }
    },
    merchant: {
      name: 'تاجر',
      icon: Store,
      color: 'text-blue-600',
      permissions: {
        users_manage: false,
        products_manage: true,
        orders_manage: true,
        reports_view: true,
        settings_manage: false,
        system_admin: false
      }
    },
    affiliate: {
      name: 'مسوق بالعمولة',
      icon: Star,
      color: 'text-green-600',
      permissions: {
        users_manage: false,
        products_manage: false,
        orders_manage: false,
        reports_view: true,
        settings_manage: false,
        system_admin: false
      }
    },
    customer: {
      name: 'عميل',
      icon: ShoppingCart,
      color: 'text-gray-600',
      permissions: {
        users_manage: false,
        products_manage: false,
        orders_manage: false,
        reports_view: false,
        settings_manage: false,
        system_admin: false
      }
    }
  });

  const permissionLabels = {
    users_manage: 'إدارة المستخدمين',
    products_manage: 'إدارة المنتجات',
    orders_manage: 'إدارة الطلبات',
    reports_view: 'عرض التقارير',
    settings_manage: 'إدارة الإعدادات',
    system_admin: 'إدارة النظام'
  };

  const togglePermission = (role: string, permission: string) => {
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        permissions: {
          ...prev[role].permissions,
          [permission]: !prev[role].permissions[permission]
        }
      }
    }));
  };

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      {/* Header */}
      <div>
        <h1 className="text-lg md:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          إدارة الصلاحيات
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
          تحكم في صلاحيات المستخدمين حسب أدوارهم
        </p>
      </div>

      {/* Permissions Matrix */}
      <Card className="shadow-elegant">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Shield className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            مصفوفة الصلاحيات
          </CardTitle>
          <CardDescription className="text-sm">
            تحديد الصلاحيات لكل دور في النظام
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-4 font-semibold">الدور</th>
                  {Object.entries(permissionLabels).map(([key, label]) => (
                    <th key={key} className="text-center p-4 font-semibold text-sm">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(permissions).map(([roleKey, role]) => {
                  const Icon = role.icon;
                  return (
                    <tr key={roleKey} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Icon className={`h-5 w-5 ${role.color}`} />
                          <span className="font-medium">{role.name}</span>
                        </div>
                      </td>
                      {Object.entries(permissionLabels).map(([permKey]) => (
                       <td key={permKey} className="text-center p-2 md:p-4">
                          <Switch
                            checked={role.permissions[permKey]}
                            onCheckedChange={() => togglePermission(roleKey, permKey)}
                            disabled={roleKey === 'admin' && permKey === 'system_admin'}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Role Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {Object.entries(permissions).map(([roleKey, role]) => {
          const Icon = role.icon;
          const activePermissions = Object.values(role.permissions).filter(Boolean).length;
          
          return (
            <Card key={roleKey} className="shadow-elegant hover:shadow-luxury transition-all duration-300">
              <CardHeader className="p-4 md:pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg gradient-bg-muted flex items-center justify-center`}>
                      <Icon className={`h-4 w-4 md:h-5 md:w-5 ${role.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base md:text-lg">{role.name}</CardTitle>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm text-muted-foreground">الصلاحيات النشطة</span>
                    <Badge variant="secondary" className="text-xs">
                      {activePermissions} من {Object.keys(permissionLabels).length}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                      <span className="hidden md:inline">عرض</span>
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                      <span className="hidden md:inline">تعديل</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="shadow-elegant">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">إجراءات سريعة</CardTitle>
          <CardDescription className="text-sm">
            عمليات سريعة لإدارة الصلاحيات
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-2 md:gap-3">
            <Button size="sm" className="bg-gradient-primary w-full md:w-auto">
              <Plus className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
              <span className="hidden md:inline">إضافة دور جديد</span>
              <span className="md:hidden">إضافة</span>
            </Button>
            <Button size="sm" variant="outline" className="w-full md:w-auto">
              <Settings className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
              <span className="hidden md:inline">إعدادات متقدمة</span>
              <span className="md:hidden">إعدادات</span>
            </Button>
            <Button size="sm" variant="outline" className="w-full md:w-auto">
              <Shield className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
              <span className="hidden md:inline">نسخ احتياطي للصلاحيات</span>
              <span className="md:hidden">نسخ احتياطي</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Changes */}
      <div className="flex justify-end">
        <Button size="sm" className="px-4 md:px-8 bg-gradient-luxury w-full md:w-auto">
          حفظ التغييرات
        </Button>
      </div>
    </div>
  );
};

export default AdminPermissions;