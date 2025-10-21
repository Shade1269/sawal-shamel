import React, { useState, useEffect } from 'react';
import { 
  EnhancedCard, 
  EnhancedCardContent, 
  EnhancedCardHeader, 
  EnhancedCardTitle,
  ResponsiveLayout,
  ResponsiveGrid,
  VirtualizedList,
  EnhancedButton,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button
} from '@/components/ui/index';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Ban, 
  Bell, 
  Key, 
  AlertCircle,
  Send,
  Plus,
  Download,
  Upload
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  current_level: string;
  points: number;
  phone?: string;
  is_banned?: boolean;
  ban_reason?: string;
  created_at: string;
  last_login?: string;
  total_earnings?: number;
  is_active?: boolean;
  updated_at?: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل المستخدمين",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ));

      toast({
        title: "تم بنجاح",
        description: "تم تحديث بيانات المستخدم",
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث بيانات المستخدم",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.filter(user => user.id !== userId));
      toast({
        title: "تم بنجاح",
        description: "تم حذف المستخدم",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف المستخدم",
        variant: "destructive",
      });
    }
  };

  const banUser = async (userId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ban_reason: reason } as any)
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_banned: true, ban_reason: reason } : user
      ));

      toast({
        title: "تم بنجاح",
        description: "تم حظر المستخدم",
      });
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: "خطأ",
        description: "فشل في حظر المستخدم",
        variant: "destructive",
      });
    }
  };

  const sendNotificationToUser = async (userId: string, title: string, message: string) => {
    try {
      // Here you would implement the notification sending logic
      toast({
        title: "تم بنجاح",
        description: "تم إرسال الإشعار",
      });
      setIsNotificationDialogOpen(false);
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "خطأ",
        description: "فشل في إرسال الإشعار",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
          <p className="text-muted-foreground">
            إدارة المستخدمين والصلاحيات والإعدادات
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          إضافة مستخدم جديد
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المسوقون</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'affiliate').length}</p>
              </div>
              <Badge variant="secondary" className="text-xs">مسوق</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">العملاء</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'customer').length}</p>
              </div>
              <Badge variant="outline" className="text-xs">عميل</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المحظورين</p>
                <p className="text-2xl font-bold">{users.filter(u => u.is_banned).length}</p>
              </div>
              <Ban className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">المستخدمين</TabsTrigger>
          <TabsTrigger value="permissions">الصلاحيات</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                قائمة المستخدمين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="البحث في المستخدمين..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="تصفية حسب الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأدوار</SelectItem>
                    <SelectItem value="admin">مدير</SelectItem>
                    <SelectItem value="customer">عميل</SelectItem>
                    <SelectItem value="affiliate">مسوق</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              {/* Users Table */}
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{user.full_name || 'غير محدد'}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                            {user.is_banned && (
                              <Badge variant="destructive">محظور</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>تحرير المستخدم</DialogTitle>
                              <DialogDescription>
                                تحديث بيانات المستخدم {user.full_name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>الاسم الكامل</Label>
                                <Input defaultValue={user.full_name} />
                              </div>
                              <div>
                                <Label>الدور</Label>
                                <Select defaultValue={user.role}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="customer">عميل</SelectItem>
                                    <SelectItem value="affiliate">مسوق</SelectItem>
                                    <SelectItem value="admin">مدير</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex gap-2">
                                <Button className="flex-1">حفظ</Button>
                                <Button variant="outline" className="flex-1">إلغاء</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <Bell className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>إرسال إشعار</DialogTitle>
                              <DialogDescription>
                                إرسال إشعار للمستخدم {user.full_name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>عنوان الإشعار</Label>
                                <Input placeholder="عنوان الإشعار" />
                              </div>
                              <div>
                                <Label>الرسالة</Label>
                                <Textarea placeholder="نص الإشعار" />
                              </div>
                              <div className="flex gap-2">
                                <Button className="flex-1">
                                  <Send className="h-4 w-4 ml-2" />
                                  إرسال
                                </Button>
                                <Button variant="outline" className="flex-1">إلغاء</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {user.role !== 'admin' && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
                              const reason = prompt('سبب الحظر:');
                              if (reason) {
                                banUser(user.id, reason);
                              }
                            }}
                          >
                            <Ban className="h-4 w-4 text-orange-500" />
                          </Button>
                        )}
                        
                        {user.role !== 'admin' && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription>
              إدارة الصلاحيات - اختر مستخدم لعرض وتعديل صلاحياته
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardContent className="p-8 text-center">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">اختر مستخدماً</h3>
              <p className="text-muted-foreground">
                اختر مستخدماً من قائمة المستخدمين لعرض وإدارة صلاحياته
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              إعدادات إدارة المستخدمين - تأكد من مراجعة جميع التغييرات قبل الحفظ
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>إعدادات عامة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>السماح بالتسجيل الجديد</Label>
                  <p className="text-sm text-muted-foreground">تمكين المستخدمين الجدد من إنشاء حسابات</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>التحقق من البريد الإلكتروني</Label>
                  <p className="text-sm text-muted-foreground">طلب تأكيد البريد الإلكتروني للحسابات الجديدة</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>الموافقة اليدوية للتجار</Label>
                  <p className="text-sm text-muted-foreground">مراجعة طلبات التاجر قبل الموافقة</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUsers;