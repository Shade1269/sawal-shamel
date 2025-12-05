import { useState, useEffect } from 'react';
import { 
  EnhancedCard, 
  EnhancedCardContent, 
  EnhancedCardDescription, 
  EnhancedCardHeader, 
  EnhancedCardTitle,
  ResponsiveLayout,
  ResponsiveGrid,
  VirtualizedList,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  RefreshCw, 
  Plus, 
  Search, 
  Download, 
  Eye, 
  Check,
  X,
  Clock,
  AlertTriangle,
  DollarSign,
  Receipt,
  Package,
  CreditCard,
  FileText,
  User,
  Calendar,
  ArrowLeft,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Refund {
  id: string;
  refund_number: string;
  refund_type: string;
  reason: string;
  description: string;
  original_amount_sar: number;
  refund_amount_sar: number;
  refund_fee_sar: number;
  net_refund_sar: number;
  status: string;
  refund_method: string;
  requested_at: string;
  processed_at: string;
  completed_at: string;
  admin_notes: string;
  customer_notes: string;
  order_id: string;
  approved_by: string;
  orders?: {
    customer_name: string;
    customer_phone: string;
    order_number: string;
  };
}

interface RefundItem {
  id: string;
  quantity_returned: number;
  unit_price_sar: number;
  total_refund_sar: number;
  condition_on_return: string;
  return_reason: string;
  order_items?: {
    title_snapshot: string;
  };
}

const RefundManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateRefund, setShowCreateRefund] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [refundItems, setRefundItems] = useState<RefundItem[]>([]);
  
  // بيانات إنشاء مرتجع جديد
  const [newRefund, setNewRefund] = useState({
    order_id: '',
    refund_type: 'FULL',
    reason: '',
    description: '',
    refund_amount_sar: 0,
    refund_method: 'ORIGINAL_PAYMENT',
    customer_notes: ''
  });

  // أسباب المرتجعات المُعرفة مسبقاً
  const refundReasons = [
    'منتج معيب',
    'منتج لا يطابق الوصف',
    'وصل منتج خاطئ',
    'تأخر في التوصيل',
    'طلب العميل',
    'مشكلة في الجودة',
    'تغيير رأي العميل',
    'أخرى'
  ];

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      const { data, error } = await supabase
        .from('refunds')
        .select(`
          *,
          orders(customer_name, customer_phone, order_number)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setRefunds(data || []);
    } catch (error) {
      console.error('Error fetching refunds:', error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "تعذر جلب المرتجعات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRefundItems = async (refundId: string) => {
    try {
      const { data, error } = await supabase
        .from('refund_items')
        .select(`
          *,
          order_items(title_snapshot)
        `)
        .eq('refund_id', refundId);

      if (error) throw error;
      
      setRefundItems(data || []);
    } catch (error) {
      console.error('Error fetching refund items:', error);
    }
  };

  const createRefund = async () => {
    try {
      const { data: refund, error: refundError } = await supabase
        .from('refunds')
        .insert({
          refund_number: '', // سيتم توليده تلقائياً
          order_id: newRefund.order_id,
          refund_type: newRefund.refund_type,
          reason: newRefund.reason,
          description: newRefund.description,
          original_amount_sar: 1000, // سيتم حسابها من الطلب
          refund_amount_sar: newRefund.refund_amount_sar,
          refund_fee_sar: 0,
          net_refund_sar: newRefund.refund_amount_sar,
          refund_method: newRefund.refund_method,
          customer_notes: newRefund.customer_notes,
          status: 'REQUESTED'
        })
        .select()
        .maybeSingle();

      if (refundError) throw refundError;

      toast({
        title: "تم إنشاء المرتجع",
        description: `مرتجع رقم ${refund.refund_number} تم إنشاؤه بنجاح`,
      });

      setShowCreateRefund(false);
      setNewRefund({
        order_id: '',
        refund_type: 'FULL',
        reason: '',
        description: '',
        refund_amount_sar: 0,
        refund_method: 'ORIGINAL_PAYMENT',
        customer_notes: ''
      });
      
      fetchRefunds();
    } catch (error) {
      console.error('Error creating refund:', error);
      toast({
        title: "خطأ في إنشاء المرتجع",
        description: "تعذر إنشاء المرتجع",
        variant: "destructive",
      });
    }
  };

  const approveRefund = async (refundId: string) => {
    try {
      const { error } = await supabase
        .from('refunds')
        .update({
          status: 'APPROVED',
          approved_at: new Date().toISOString(),
          admin_notes: 'تم الموافقة على المرتجع'
        })
        .eq('id', refundId);

      if (error) throw error;

      toast({
        title: "تم الموافقة على المرتجع",
        description: "تم الموافقة على طلب المرتجع وسيتم معالجته",
      });

      fetchRefunds();
    } catch (error) {
      console.error('Error approving refund:', error);
      toast({
        title: "خطأ في الموافقة",
        description: "تعذر الموافقة على المرتجع",
        variant: "destructive",
      });
    }
  };

  const rejectRefund = async (refundId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('refunds')
        .update({
          status: 'REJECTED',
          admin_notes: reason
        })
        .eq('id', refundId);

      if (error) throw error;

      toast({
        title: "تم رفض المرتجع",
        description: "تم رفض طلب المرتجع",
      });

      fetchRefunds();
    } catch (error) {
      console.error('Error rejecting refund:', error);
      toast({
        title: "خطأ في الرفض",
        description: "تعذر رفض المرتجع",
        variant: "destructive",
      });
    }
  };

  const processRefund = async (refundId: string) => {
    try {
      const { error } = await supabase
        .from('refunds')
        .update({
          status: 'PROCESSING',
          processed_at: new Date().toISOString()
        })
        .eq('id', refundId);

      if (error) throw error;

      toast({
        title: "جاري معالجة المرتجع",
        description: "تم بدء معالجة المرتجع",
      });

      fetchRefunds();
    } catch (error) {
      console.error('Error processing refund:', error);
      toast({
        title: "خطأ في المعالجة",
        description: "تعذر معالجة المرتجع",
        variant: "destructive",
      });
    }
  };

  const completeRefund = async (refundId: string) => {
    try {
      const { error } = await supabase
        .from('refunds')
        .update({
          status: 'COMPLETED',
          completed_at: new Date().toISOString()
        })
        .eq('id', refundId);

      if (error) throw error;

      toast({
        title: "تم إكمال المرتجع",
        description: "تم إكمال عملية المرتجع بنجاح",
      });

      fetchRefunds();
    } catch (error) {
      console.error('Error completing refund:', error);
      toast({
        title: "خطأ في الإكمال",
        description: "تعذر إكمال المرتجع",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return 'bg-warning/10 text-warning';
      case 'APPROVED':
        return 'bg-info/10 text-info';
      case 'PROCESSING':
        return 'bg-premium/10 text-premium';
      case 'COMPLETED':
        return 'bg-success/10 text-success';
      case 'REJECTED':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return <Clock className="h-4 w-4" />;
      case 'APPROVED':
        return <Check className="h-4 w-4" />;
      case 'PROCESSING':
        return <RefreshCw className="h-4 w-4" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'REQUESTED': return 'مطلوب';
      case 'APPROVED': return 'موافق عليه';
      case 'PROCESSING': return 'قيد المعالجة';
      case 'COMPLETED': return 'مكتمل';
      case 'REJECTED': return 'مرفوض';
      default: return status;
    }
  };

  const filteredRefunds = refunds.filter(refund => {
    const matchesSearch = refund.refund_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         refund.orders?.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         refund.orders?.order_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || refund.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل المرتجعات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            إدارة المرتجعات والاستردادات
          </h1>
          <p className="text-muted-foreground mt-2">
            معالجة طلبات المرتجعات وإدارة عمليات الاسترداد
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/payment-dashboard')}>
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة للمدفوعات
          </Button>
          <Dialog open={showCreateRefund} onOpenChange={setShowCreateRefund}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                مرتجع ويد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>إنشاء مرتجع جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>رقم الطلب *</Label>
                    <Input
                      value={newRefund.order_id}
                      onChange={(e) => setNewRefund(prev => ({...prev, order_id: e.target.value}))}
                      placeholder="رقم الطلب المراد إرجاعه"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>نوع المرتجع</Label>
                    <Select value={newRefund.refund_type} onValueChange={(value) => setNewRefund(prev => ({...prev, refund_type: value}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FULL">إرجاع كامل</SelectItem>
                        <SelectItem value="PARTIAL">إرجاع جزئي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>سبب المرتجع *</Label>
                    <Select value={newRefund.reason} onValueChange={(value) => setNewRefund(prev => ({...prev, reason: value}))}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر السبب" />
                      </SelectTrigger>
                      <SelectContent>
                        {refundReasons.map((reason) => (
                          <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>مبلغ الاسترداد (ر.س)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newRefund.refund_amount_sar}
                      onChange={(e) => setNewRefund(prev => ({...prev, refund_amount_sar: parseFloat(e.target.value) || 0}))}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>طريقة الاسترداد</Label>
                    <Select value={newRefund.refund_method} onValueChange={(value) => setNewRefund(prev => ({...prev, refund_method: value}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ORIGINAL_PAYMENT">نفس طريقة الدفع الأصلية</SelectItem>
                        <SelectItem value="BANK_TRANSFER">تحويل بنكي</SelectItem>
                        <SelectItem value="CASH">نقداً</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>وصف المشكلة</Label>
                  <Textarea
                    value={newRefund.description}
                    onChange={(e) => setNewRefund(prev => ({...prev, description: e.target.value}))}
                    placeholder="وصف تفصيلي للمشكلة أو سبب المرتجع"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>ملاحظات العميل</Label>
                  <Textarea
                    value={newRefund.customer_notes}
                    onChange={(e) => setNewRefund(prev => ({...prev, customer_notes: e.target.value}))}
                    placeholder="ملاحظات إضافية من العميل"
                    rows={2}
                  />
                </div>

                <div className="flex gap-3">
                  <Button onClick={createRefund} className="flex-1">
                    <RefreshCw className="h-4 w-4 ml-2" />
                    إنشاء المرتجع
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateRefund(false)}>
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">طلبات جديدة</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {refunds.filter(r => r.status === 'REQUESTED').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">موافق عليها</p>
                <p className="text-2xl font-bold text-info">
                  {refunds.filter(r => r.status === 'APPROVED').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                <Check className="h-5 w-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">قيد المعالجة</p>
                <p className="text-2xl font-bold text-accent">
                  {refunds.filter(r => r.status === 'PROCESSING').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">مكتملة</p>
                <p className="text-2xl font-bold text-success">
                  {refunds.filter(r => r.status === 'COMPLETED').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي المبلغ</p>
                <p className="text-xl font-bold text-destructive">
                  {refunds.reduce((sum, r) => sum + (r.refund_amount_sar || 0), 0).toLocaleString()} ر.س
                </p>
              </div>
              <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* فلاتر البحث */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="البحث برقم المرتجع أو اسم العميل أو رقم الطلب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="حالة المرتجع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="REQUESTED">مطلوب</SelectItem>
                <SelectItem value="APPROVED">موافق عليه</SelectItem>
                <SelectItem value="PROCESSING">قيد المعالجة</SelectItem>
                <SelectItem value="COMPLETED">مكتمل</SelectItem>
                <SelectItem value="REJECTED">مرفوض</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 ml-2" />
              تصدير
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* جدول المرتجعات */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المرتجعات</CardTitle>
          <CardDescription>جميع طلبات المرتجعات والاستردادات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-medium">رقم المرتجع</th>
                  <th className="text-right p-3 font-medium">رقم الطلب</th>
                  <th className="text-right p-3 font-medium">العميل</th>
                  <th className="text-right p-3 font-medium">السبب</th>
                  <th className="text-right p-3 font-medium">المبلغ</th>
                  <th className="text-right p-3 font-medium">الحالة</th>
                  <th className="text-right p-3 font-medium">تاريخ الطلب</th>
                  <th className="text-right p-3 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredRefunds.map((refund) => (
                  <tr key={refund.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="font-mono font-medium text-primary">{refund.refund_number}</div>
                      <div className="text-xs text-muted-foreground">
                        {refund.refund_type === 'FULL' ? 'إرجاع كامل' : 'إرجاع جزئي'}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{refund.orders?.order_number || 'غير محدد'}</div>
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{refund.orders?.customer_name || 'غير محدد'}</div>
                        <div className="text-sm text-muted-foreground">{refund.orders?.customer_phone}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{refund.reason}</div>
                      {refund.description && (
                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                          {refund.description}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-destructive">
                        -{refund.refund_amount_sar.toLocaleString()} ر.س
                      </div>
                      {refund.refund_fee_sar > 0 && (
                        <div className="text-sm text-muted-foreground">
                          رسوم: {refund.refund_fee_sar} ر.س
                        </div>
                      )}
                      <div className="text-sm font-medium">
                        صافي: {refund.net_refund_sar.toLocaleString()} ر.س
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getStatusColor(refund.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(refund.status)}
                          <span>{getStatusText(refund.status)}</span>
                        </div>
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        {new Date(refund.requested_at).toLocaleDateString('ar-SA')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(refund.requested_at).toLocaleTimeString('ar-SA')}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {refund.status === 'REQUESTED' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => approveRefund(refund.id)}
                              className="text-success hover:text-success/80 hover:bg-success/10"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => rejectRefund(refund.id, 'رفض من قبل الإدارة')}
                              className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        {refund.status === 'APPROVED' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => processRefund(refund.id)}
                            className="text-info hover:text-info/80 hover:bg-info/10"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {refund.status === 'PROCESSING' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => completeRefund(refund.id)}
                            className="text-success hover:text-success/80 hover:bg-success/10"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredRefunds.length === 0 && (
              <div className="text-center py-12">
                <RefreshCw className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد مرتجعات</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'لا توجد مرتجعات مطابقة للبحث' 
                    : 'لم يتم إنشاء أي مرتجعات بعد'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RefundManagement;