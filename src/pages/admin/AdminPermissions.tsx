import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          إدارة الصلاحيات
        </h1>
        <p className="text-muted-foreground mt-2">
          تحكم في صلاحيات المستخدمين حسب أدوارهم
        </p>
      </div>

      {/* Permissions Matrix */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            مصفوفة الصلاحيات
          </CardTitle>
          <CardDescription>
            تحديد الصلاحيات لكل دور في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                        <td key={permKey} className="text-center p-4">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(permissions).map(([roleKey, role]) => {
          const Icon = role.icon;
          const activePermissions = Object.values(role.permissions).filter(Boolean).length;
          
          return (
            <Card key={roleKey} className="shadow-elegant hover:shadow-luxury transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-background to-muted flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${role.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">الصلاحيات النشطة</span>
                    <Badge variant="secondary">
                      {activePermissions} من {Object.keys(permissionLabels).length}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      عرض
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      تعديل
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
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
          <CardDescription>
            عمليات سريعة لإدارة الصلاحيات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button className="bg-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              إضافة دور جديد
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              إعدادات متقدمة
            </Button>
            <Button variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              نسخ احتياطي للصلاحيات
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Changes */}
      <div className="flex justify-end">
        <Button className="px-8 bg-gradient-luxury">
          حفظ التغييرات
        </Button>
      </div>
    </div>
  );
};

export default AdminPermissions;