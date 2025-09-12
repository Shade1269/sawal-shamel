import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Receipt, 
  Plus, 
  Search, 
  Download, 
  Printer, 
  Eye, 
  Edit,
  Send,
  CheckCircle,
  Clock,
  FileText,
  Calculator,
  Building,
  User,
  Calendar,
  DollarSign,
  Percent
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  subtotal_sar: number;
  vat_sar: number;
  total_sar: number;
  vat_rate: number;
  status: string;
  payment_status: string;
  issue_date: string;
  due_date: string;
  notes: string;
  shop_id: string;
  order_id: string;
}

interface InvoiceItem {
  id: string;
  item_name: string;
  quantity: number;
  unit_price_sar: number;
  total_sar: number;
  vat_sar: number;
}

const InvoiceManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  // بيانات إنشاء فاتورة جديدة
  const [newInvoice, setNewInvoice] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_address: '',
    customer_city: '',
    notes: '',
    due_date: '',
    items: [
      { item_name: '', quantity: 1, unit_price_sar: 0, vat_rate: 15 }
    ]
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          shops(display_name),
          orders(order_number)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "تعذر جلب الفواتير",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async () => {
    try {
      // حساب المجاميع
      let subtotal = 0;
      let vatTotal = 0;
      
      const calculatedItems = newInvoice.items.map(item => {
        const itemSubtotal = item.quantity * item.unit_price_sar;
        const itemVat = itemSubtotal * (item.vat_rate / 100);
        subtotal += itemSubtotal;
        vatTotal += itemVat;
        
        return {
          ...item,
          subtotal_sar: itemSubtotal,
          vat_sar: itemVat,
          total_sar: itemSubtotal + itemVat
        };
      });

      const total = subtotal + vatTotal;

      // إنشاء الفاتورة
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: '', // سيتم توليده تلقائياً
          customer_name: newInvoice.customer_name,
          customer_phone: newInvoice.customer_phone,
          customer_email: newInvoice.customer_email,
          customer_address: {
            address: newInvoice.customer_address,
            city: newInvoice.customer_city
          },
          subtotal_sar: subtotal,
          vat_sar: vatTotal,
          total_sar: total,
          due_date: newInvoice.due_date,
          notes: newInvoice.notes,
          status: 'SENT',
          payment_status: 'PENDING'
        })
        .select()
        .maybeSingle();

      if (invoiceError) throw invoiceError;

      // إضافة عناصر الفاتورة
      const invoiceItems = calculatedItems.map(item => ({
        invoice_id: invoice.id,
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price_sar: item.unit_price_sar,
        subtotal_sar: item.subtotal_sar,
        vat_rate: item.vat_rate,
        vat_sar: item.vat_sar,
        total_sar: item.total_sar
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems);

      if (itemsError) throw itemsError;

      toast({
        title: "تم إنشاء الفاتورة",
        description: `فاتورة رقم ${invoice.invoice_number} تم إنشاؤها بنجاح`,
      });

      setShowCreateInvoice(false);
      setNewInvoice({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        customer_address: '',
        customer_city: '',
        notes: '',
        due_date: '',
        items: [{ item_name: '', quantity: 1, unit_price_sar: 0, vat_rate: 15 }]
      });
      
      fetchInvoices();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "خطأ في إنشاء الفاتورة",
        description: "تعذر إنشاء الفاتورة",
        variant: "destructive",
      });
    }
  };

  const addInvoiceItem = () => {
    setNewInvoice(prev => ({
      ...prev,
      items: [...prev.items, { item_name: '', quantity: 1, unit_price_sar: 0, vat_rate: 15 }]
    }));
  };

  const removeInvoiceItem = (index: number) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateInvoiceItem = (index: number, field: string, value: any) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'PAID':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const calculateInvoiceTotal = () => {
    return newInvoice.items.reduce((total, item) => {
      const subtotal = item.quantity * item.unit_price_sar;
      const vat = subtotal * (item.vat_rate / 100);
      return total + subtotal + vat;
    }, 0);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || invoice.payment_status === paymentStatusFilter;
    
    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل الفواتير...</p>
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
            إدارة الفواتير الضريبية
          </h1>
          <p className="text-muted-foreground mt-2">
            إنشاء وإدارة الفواتير مع حساب الضريبة المضافة 15%
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/payment-dashboard')}>
            العودة للمدفوعات
          </Button>
          <Dialog open={showCreateInvoice} onOpenChange={setShowCreateInvoice}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                فاتورة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إنشاء فاتورة جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* معلومات العميل */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>اسم العميل *</Label>
                    <Input
                      value={newInvoice.customer_name}
                      onChange={(e) => setNewInvoice(prev => ({...prev, customer_name: e.target.value}))}
                      placeholder="اسم العميل"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رقم الهاتف *</Label>
                    <Input
                      value={newInvoice.customer_phone}
                      onChange={(e) => setNewInvoice(prev => ({...prev, customer_phone: e.target.value}))}
                      placeholder="05xxxxxxxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>البريد الإلكتروني</Label>
                    <Input
                      type="email"
                      value={newInvoice.customer_email}
                      onChange={(e) => setNewInvoice(prev => ({...prev, customer_email: e.target.value}))}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>تاريخ الاستحقاق</Label>
                    <Input
                      type="date"
                      value={newInvoice.due_date}
                      onChange={(e) => setNewInvoice(prev => ({...prev, due_date: e.target.value}))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>العنوان</Label>
                    <Input
                      value={newInvoice.customer_address}
                      onChange={(e) => setNewInvoice(prev => ({...prev, customer_address: e.target.value}))}
                      placeholder="العنوان التفصيلي"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>المدينة</Label>
                    <Input
                      value={newInvoice.customer_city}
                      onChange={(e) => setNewInvoice(prev => ({...prev, customer_city: e.target.value}))}
                      placeholder="المدينة"
                    />
                  </div>
                </div>

                {/* عناصر الفاتورة */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">عناصر الفاتورة</h3>
                    <Button size="sm" onClick={addInvoiceItem}>
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة عنصر
                    </Button>
                  </div>
                  
                  {newInvoice.items.map((item, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="grid md:grid-cols-5 gap-4 items-end">
                          <div className="space-y-2">
                            <Label>اسم المنتج/الخدمة</Label>
                            <Input
                              value={item.item_name}
                              onChange={(e) => updateInvoiceItem(index, 'item_name', e.target.value)}
                              placeholder="اسم المنتج أو الخدمة"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>الكمية</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>السعر (ر.س)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unit_price_sar}
                              onChange={(e) => updateInvoiceItem(index, 'unit_price_sar', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>معدل الضريبة (%)</Label>
                            <Select 
                              value={item.vat_rate.toString()} 
                              onValueChange={(value) => updateInvoiceItem(index, 'vat_rate', parseFloat(value))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">0% - معفى</SelectItem>
                                <SelectItem value="5">5%</SelectItem>
                                <SelectItem value="15">15% - قياسي</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">
                              المجموع: {((item.quantity * item.unit_price_sar) * (1 + item.vat_rate / 100)).toFixed(2)} ر.س
                            </div>
                            {newInvoice.items.length > 1 && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => removeInvoiceItem(index)}
                              >
                                حذف
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* ملاحظات */}
                <div className="space-y-2">
                  <Label>ملاحظات</Label>
                  <Textarea
                    value={newInvoice.notes}
                    onChange={(e) => setNewInvoice(prev => ({...prev, notes: e.target.value}))}
                    placeholder="ملاحظات إضافية للفاتورة"
                    rows={3}
                  />
                </div>

                {/* إجمالي الفاتورة */}
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>المبلغ قبل الضريبة:</span>
                        <span>{newInvoice.items.reduce((sum, item) => sum + (item.quantity * item.unit_price_sar), 0).toFixed(2)} ر.س</span>
                      </div>
                      <div className="flex justify-between">
                        <span>الضريبة المضافة:</span>
                        <span>{newInvoice.items.reduce((sum, item) => sum + ((item.quantity * item.unit_price_sar) * (item.vat_rate / 100)), 0).toFixed(2)} ر.س</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>المجموع الكلي:</span>
                        <span className="text-primary">{calculateInvoiceTotal().toFixed(2)} ر.س</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button onClick={createInvoice} className="flex-1">
                    <Receipt className="h-4 w-4 ml-2" />
                    إنشاء الفاتورة
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateInvoice(false)}>
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* فلاتر البحث */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="البحث برقم الفاتورة أو اسم العميل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="حالة الفاتورة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="DRAFT">مسودة</SelectItem>
                <SelectItem value="SENT">مرسلة</SelectItem>
                <SelectItem value="PAID">مدفوعة</SelectItem>
                <SelectItem value="OVERDUE">متأخرة</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="حالة الدفع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع حالات الدفع</SelectItem>
                <SelectItem value="PENDING">معلقة</SelectItem>
                <SelectItem value="PAID">مدفوعة</SelectItem>
                <SelectItem value="OVERDUE">متأخرة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* جدول الفواتير */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الفواتير</CardTitle>
          <CardDescription>
            جميع الفواتير المُنشأة مع تفاصيل الضريبة المضافة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-medium">رقم الفاتورة</th>
                  <th className="text-right p-3 font-medium">العميل</th>
                  <th className="text-right p-3 font-medium">المبلغ الإجمالي</th>
                  <th className="text-right p-3 font-medium">الضريبة</th>
                  <th className="text-right p-3 font-medium">حالة الفاتورة</th>
                  <th className="text-right p-3 font-medium">حالة الدفع</th>
                  <th className="text-right p-3 font-medium">تاريخ الإصدار</th>
                  <th className="text-right p-3 font-medium">تاريخ الاستحقاق</th>
                  <th className="text-right p-3 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="font-mono font-medium text-primary">{invoice.invoice_number}</div>
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{invoice.customer_name}</div>
                        <div className="text-sm text-muted-foreground">{invoice.customer_phone}</div>
                        {invoice.customer_email && (
                          <div className="text-sm text-muted-foreground">{invoice.customer_email}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-green-600">
                        {invoice.total_sar.toLocaleString()} ر.س
                      </div>
                      <div className="text-sm text-muted-foreground">
                        صافي: {invoice.subtotal_sar.toLocaleString()} ر.س
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">
                        {invoice.vat_sar.toLocaleString()} ر.س
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ({invoice.vat_rate}%)
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status === 'DRAFT' ? 'مسودة' :
                         invoice.status === 'SENT' ? 'مرسلة' :
                         invoice.status === 'PAID' ? 'مدفوعة' :
                         invoice.status === 'OVERDUE' ? 'متأخرة' : invoice.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={getPaymentStatusColor(invoice.payment_status)}>
                        {invoice.payment_status === 'PENDING' ? 'معلقة' :
                         invoice.payment_status === 'PAID' ? 'مدفوعة' :
                         invoice.payment_status === 'OVERDUE' ? 'متأخرة' : invoice.payment_status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        {new Date(invoice.issue_date).toLocaleDateString('ar-SA')}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('ar-SA') : '-'}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredInvoices.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد فواتير مطابقة للبحث</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceManagement;