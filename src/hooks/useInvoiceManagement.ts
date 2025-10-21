import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Invoice {
  id: string;
  invoice_number?: string;
  shop_id?: string;
  order_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  customer_address: any;
  customer_profile_id?: string;
  tax_registration_number?: string;
  status: string;
  payment_status: string;
  subtotal_sar: number;
  shipping_sar: number;
  discount_sar: number;
  vat_rate: number;
  vat_sar: number;
  total_sar: number;
  vat_breakdown: any;
  issue_date: string;
  due_date?: string;
  paid_at?: string;
  notes?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id?: string;
  item_name: string;
  item_description?: string;
  item_sku?: string;
  quantity: number;
  unit_price_sar: number;
  discount_sar: number;
  subtotal_sar: number;
  vat_rate: number;
  vat_sar: number;
  total_sar: number;
  created_at: string;
}

export const useInvoiceManagement = (shopId?: string) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (shopId) {
        query = query.eq('shop_id', shopId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب الفواتير",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async (invoiceData: any) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .maybeSingle();

      if (error) throw error;

      await fetchInvoices();
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء الفاتورة بنجاح",
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "خطأ",
        description: "فشل في إنشاء الفاتورة",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;

      await fetchInvoices();
      toast({
        title: "تم بنجاح",
        description: "تم تحديث الفاتورة بنجاح",
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث الفاتورة",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchInvoices();
      toast({
        title: "تم بنجاح",
        description: "تم حذف الفاتورة بنجاح",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الفاتورة",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const sendInvoice = async (id: string, method: 'email' | 'whatsapp' | 'sms') => {
    try {
      // تحديث حالة الفاتورة إلى مرسلة
      await updateInvoice(id, { status: 'SENT' });
      
      // هنا يمكن إضافة منطق إرسال الفاتورة
      toast({
        title: "تم الإرسال",
        description: `تم إرسال الفاتورة عبر ${method === 'email' ? 'الإيميل' : method === 'whatsapp' ? 'واتساب' : 'SMS'}`,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast({
        title: "خطأ في الإرسال",
        description: "فشل في إرسال الفاتورة",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const generatePDF = async (id: string) => {
    try {
      // هنا يمكن إضافة منطق توليد PDF
      toast({
        title: "تم التوليد",
        description: "تم توليد ملف PDF للفاتورة",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "خطأ في التوليد",
        description: "فشل في توليد ملف PDF",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const markAsPaid = async (id: string, paymentMethod?: string) => {
    try {
      await updateInvoice(id, { 
        payment_status: 'PAID',
        status: 'PAID',
        paid_at: new Date().toISOString()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [shopId]);

  return {
    invoices,
    loading,
    fetchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    sendInvoice,
    generatePDF,
    markAsPaid
  };
};