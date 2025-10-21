import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  Download, 
  Filter, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Commission {
  id: string;
  amount_sar: number;
  commission_rate: number;
  status: string;
  created_at: string;
  confirmed_at?: string;
  paid_at?: string;
  order_id: string;
}

interface AffiliateCommissionsProps {
  commissions: Commission[];
  stats: {
    totalCommissions: number;
    thisMonthCommissions: number;
    pendingCommissions: number;
    paidCommissions: number;
  };
  onExport?: () => void;
}

export const AffiliateCommissions = ({ 
  commissions = [], 
  stats,
  onExport 
}: AffiliateCommissionsProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'مؤكد';
      case 'pending': return 'في الانتظار';
      case 'paid': return 'مدفوع';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const filteredCommissions = commissions
    .filter(commission => {
      const matchesSearch = commission.order_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || commission.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amount_sar - a.amount_sar;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const summaryStats = [
    {
      title: "إجمالي العمولات",
      value: `${stats.totalCommissions.toFixed(2)} ريال`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "عمولات هذا الشهر",
      value: `${stats.thisMonthCommissions.toFixed(2)} ريال`,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "في الانتظار",
      value: `${stats.pendingCommissions.toFixed(2)} ريال`,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20"
    },
    {
      title: "تم الدفع",
      value: `${stats.paidCommissions.toFixed(2)} ريال`,
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((stat, index) => (
          <Card key={index} className="border-0 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Commissions Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                إدارة العمولات
              </CardTitle>
              <CardDescription>
                تتبع وإدارة جميع عمولاتك والأرباح
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onExport}>
              <Download className="h-4 w-4 ml-2" />
              تصدير
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="البحث برقم الطلب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="حالة العمولة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">في الانتظار</SelectItem>
                <SelectItem value="confirmed">مؤكد</SelectItem>
                <SelectItem value="paid">مدفوع</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="ترتيب حسب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">التاريخ</SelectItem>
                <SelectItem value="amount">المبلغ</SelectItem>
                <SelectItem value="status">الحالة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Commissions Table */}
          {filteredCommissions.length > 0 ? (
            <div className="space-y-3">
              {filteredCommissions.map((commission) => (
                <Card key={commission.id} className="border-l-4 border-l-primary/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="secondary" 
                            className={getStatusColor(commission.status)}
                          >
                            <div className="flex items-center gap-1">
                              {getStatusIcon(commission.status)}
                              {getStatusLabel(commission.status)}
                            </div>
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            طلب #{commission.order_id}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>معدل العمولة: {commission.commission_rate}%</span>
                          <span>
                            التاريخ: {format(new Date(commission.created_at), 'dd/MM/yyyy', { locale: ar })}
                          </span>
                          {commission.paid_at && (
                            <span>
                              تاريخ الدفع: {format(new Date(commission.paid_at), 'dd/MM/yyyy', { locale: ar })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {commission.amount_sar.toFixed(2)} ريال
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">لا توجد عمولات بعد</h3>
              <p className="text-muted-foreground">
                ابدأ بالتسويق للمنتجات لكسب العمولات الأولى
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            معلومات الدفع
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">دورة الدفع</h4>
              <p className="text-sm text-muted-foreground">
                يتم صرف العمولات كل يوم 15 من كل شهر للعمولات المؤكدة
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">الحد الأدنى للسحب</h4>
              <p className="text-sm text-muted-foreground">
                الحد الأدنى لطلب السحب هو 100 ريال سعودي
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};