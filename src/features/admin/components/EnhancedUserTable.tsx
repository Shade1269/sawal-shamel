import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { UnifiedButton as Button } from '@/components/design-system';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Ban,
  Shield,
  Crown,
  Star,
  ShoppingCart,
  Users,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'admin' | 'affiliate' | 'customer' | 'moderator' | 'merchant';
  level: 'bronze' | 'silver' | 'gold' | 'legendary';
  points: number;
  total_earnings: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_activity_at?: string;
  avatar_url?: string;
}

interface EnhancedUserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
  onViewDetails: (user: User) => void;
  onSendNotification: (user: User) => void;
  onManagePermissions: (user: User) => void;
}

export const EnhancedUserTable: React.FC<EnhancedUserTableProps> = ({
  users,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewDetails,
  onSendNotification,
  onManagePermissions
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (userId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedRows(newExpanded);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive border-destructive/20';
      case 'affiliate':
      case 'merchant':
        return 'bg-success/10 text-success dark:bg-success/20 dark:text-success border-success/20';
      case 'moderator': return 'bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent border-accent/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'bg-bronze/10 text-bronze border-bronze/20';
      case 'silver': return 'bg-muted text-muted-foreground border-border';
      case 'gold': return 'bg-premium/10 text-premium border-premium/20';
      case 'legendary': return 'bg-gradient-premium text-primary-foreground border-premium/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير';
      case 'affiliate':
      case 'merchant':
        return 'مسوق';
      case 'customer': return 'عميل';
      case 'moderator': return 'مشرف';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-3 w-3" />;
      case 'affiliate':
      case 'merchant':
        return <Star className="h-3 w-3" />;
      case 'customer': return <ShoppingCart className="h-3 w-3" />;
      case 'moderator': return <Shield className="h-3 w-3" />;
      default: return <Users className="h-3 w-3" />;
    }
  };

  const getLastActivityStatus = (lastActivity?: string) => {
    if (!lastActivity) {
      return { color: 'text-destructive', text: 'لم يسجل دخول مطلقاً', icon: XCircle };
    }
    
    const now = new Date();
    const activityDate = new Date(lastActivity);
    const hoursDiff = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));
    
    if (hoursDiff <= 1) {
      return { color: 'text-success', text: 'نشط الآن', icon: CheckCircle };
    } else if (hoursDiff <= 24) {
      return { color: 'text-warning', text: `نشط منذ ${hoursDiff} ساعة`, icon: Clock };
    } else {
      const daysDiff = Math.floor(hoursDiff / 24);
      return { color: 'text-destructive', text: `نشط منذ ${daysDiff} يوم`, icon: XCircle };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-SA').format(num);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-right">المستخدم</TableHead>
              <TableHead className="text-right">الدور & المستوى</TableHead>
              <TableHead className="text-right">النشاط</TableHead>
              <TableHead className="text-right">الإحصائيات</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-center">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const activityStatus = getLastActivityStatus(user.last_activity_at);
              const ActivityIcon = activityStatus.icon;
              
              return (
                <React.Fragment key={user.id}>
                  <TableRow className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback className="gradient-icon-wrapper">
                            {user.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">
                            {user.full_name || 'غير محدد'}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-2">
                        <Badge variant="outline" className={`${getRoleColor(user.role)} text-xs`}>
                          {getRoleIcon(user.role)}
                          <span className="mr-1">{getRoleName(user.role)}</span>
                        </Badge>
                        <Badge variant="outline" className={`${getLevelColor(user.level)} text-xs`}>
                          {user.level}
                        </Badge>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-2">
                        <div className={`flex items-center gap-1 text-xs ${activityStatus.color}`}>
                          <ActivityIcon className="h-3 w-3" />
                          <span>{activityStatus.text}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>انضم في {formatDate(user.created_at)}</span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-premium" />
                          <span>{formatNumber(user.points || 0)} نقطة</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-success">
                            {formatNumber(user.total_earnings || 0)} ر.س
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge 
                        variant={user.is_active ? "default" : "error"}
                        className="text-xs"
                      >
                        {user.is_active ? 'نشط' : 'معطل'}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails(user)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => onEdit(user)}>
                              <Edit className="h-4 w-4 ml-2" />
                              تعديل البيانات
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onManagePermissions(user)}>
                              <Shield className="h-4 w-4 ml-2" />
                              إدارة الصلاحيات
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSendNotification(user)}>
                              <Mail className="h-4 w-4 ml-2" />
                              إرسال إشعار
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => onToggleStatus(user.id, user.is_active)}
                              className={user.is_active ? "text-destructive" : "text-success"}
                            >
                              <Ban className="h-4 w-4 ml-2" />
                              {user.is_active ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 ml-2" />
                                  حذف المستخدم
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد من حذف المستخدم "{user.full_name}"؟ 
                                    هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع البيانات المرتبطة بالمستخدم.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => onDelete(user.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    حذف
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
        
        {users.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>لا توجد مستخدمين للعرض</p>
          </div>
        )}
      </div>
    </div>
  );
};