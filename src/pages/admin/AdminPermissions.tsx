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
  EnhancedButton
} from '@/components/ui/index';
import { UnifiedButton, UnifiedCard, UnifiedCardContent, UnifiedCardDescription, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { UnifiedBadge } from '@/components/design-system';
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
      color: 'text-destructive',
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
      color: 'text-info',
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
      color: 'text-success',
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
      color: 'text-muted-foreground',
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
      <UnifiedCard variant="glass-strong" hover="lift">
        <UnifiedCardHeader className="p-4 md:p-6">
          <UnifiedCardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Shield className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            مصفوفة الصلاحيات
          </UnifiedCardTitle>
          <UnifiedCardDescription className="text-sm">
            تحديد الصلاحيات لكل دور في النظام
          </UnifiedCardDescription>
        </UnifiedCardHeader>
        <UnifiedCardContent className="p-4 md:p-6">
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
        </UnifiedCardContent>
      </UnifiedCard>

      {/* Role Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {Object.entries(permissions).map(([roleKey, role]) => {
          const Icon = role.icon;
          const activePermissions = Object.values(role.permissions).filter(Boolean).length;
          
          return (
            <UnifiedCard key={roleKey} variant="flat" hover="lift" className="transition-all duration-300">
              <UnifiedCardHeader className="p-4 md:pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg gradient-card-muted flex items-center justify-center`}>
                      <Icon className={`h-4 w-4 md:h-5 md:w-5 ${role.color}`} />
                    </div>
                    <div>
                      <UnifiedCardTitle className="text-base md:text-lg">{role.name}</UnifiedCardTitle>
                    </div>
                  </div>
                </div>
              </UnifiedCardHeader>
              <UnifiedCardContent className="p-4">
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm text-muted-foreground">الصلاحيات النشطة</span>
                    <UnifiedBadge variant="info" className="text-xs">
                      {activePermissions} من {Object.keys(permissionLabels).length}
                    </UnifiedBadge>
                  </div>
                  <div className="flex gap-2">
                    <UnifiedButton size="sm" variant="outline" fullWidth>
                      <Eye className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                      <span className="hidden md:inline">عرض</span>
                    </UnifiedButton>
                    <UnifiedButton size="sm" variant="outline" fullWidth>
                      <Edit className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                      <span className="hidden md:inline">تعديل</span>
                    </UnifiedButton>
                  </div>
                </div>
              </UnifiedCardContent>
            </UnifiedCard>
          );
        })}
      </div>

      {/* Quick Actions */}
      <UnifiedCard variant="flat" hover="lift">
        <UnifiedCardHeader className="p-4 md:p-6">
          <UnifiedCardTitle className="text-base md:text-lg">إجراءات سريعة</UnifiedCardTitle>
          <UnifiedCardDescription className="text-sm">
            عمليات سريعة لإدارة الصلاحيات
          </UnifiedCardDescription>
        </UnifiedCardHeader>
        <UnifiedCardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-2 md:gap-3">
            <UnifiedButton size="sm" variant="primary" fullWidth>
              <Plus className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
              <span className="hidden md:inline">إضافة دور جديد</span>
              <span className="md:hidden">إضافة</span>
            </UnifiedButton>
            <UnifiedButton size="sm" variant="outline" fullWidth>
              <Settings className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
              <span className="hidden md:inline">إعدادات متقدمة</span>
              <span className="md:hidden">إعدادات</span>
            </UnifiedButton>
            <UnifiedButton size="sm" variant="outline" fullWidth>
              <Shield className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
              <span className="hidden md:inline">نسخ احتياطي للصلاحيات</span>
              <span className="md:hidden">نسخ احتياطي</span>
            </UnifiedButton>
          </div>
        </UnifiedCardContent>
      </UnifiedCard>

      {/* Save Changes */}
      <div className="flex justify-end">
        <UnifiedButton size="sm" variant="luxury" className="px-4 md:px-8 w-full md:w-auto">
          حفظ التغييرات
        </UnifiedButton>
      </div>
    </div>
  );
};

export default AdminPermissions;