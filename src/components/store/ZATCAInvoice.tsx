import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Printer } from 'lucide-react';

interface InvoiceItem {
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
  vat_amount?: number;
}

interface ZATCAInvoiceProps {
  invoiceNumber: string;
  invoiceDate: string;
  orderNumber: string;
  seller: {
    name: string;
    vatNumber: string;
    address: string;
    phone?: string;
  };
  buyer: {
    name: string;
    phone: string;
    address?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  vatAmount: number;
  shippingCost: number;
  discount: number;
  total: number;
  paymentMethod: string;
  qrCode?: string;
}

export const ZATCAInvoice = ({
  invoiceNumber,
  invoiceDate,
  orderNumber,
  seller,
  buyer,
  items,
  subtotal,
  vatAmount,
  shippingCost,
  discount,
  total,
  paymentMethod,
  qrCode,
}: ZATCAInvoiceProps) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = invoiceRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة ضريبية - ${invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
            direction: rtl;
            background: white;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #333;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
            margin-bottom: 15px;
          }
          .header h1 {
            font-size: 24px;
            margin-bottom: 5px;
          }
          .header h2 {
            font-size: 18px;
            color: #666;
          }
          .zatca-badge {
            background: #1a472a;
            color: white;
            padding: 5px 15px;
            display: inline-block;
            margin-top: 10px;
            font-size: 14px;
          }
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            gap: 20px;
          }
          .info-box {
            flex: 1;
            border: 1px solid #ddd;
            padding: 10px;
          }
          .info-box h3 {
            font-size: 14px;
            color: #333;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
            margin-bottom: 8px;
          }
          .info-box p {
            font-size: 13px;
            margin: 4px 0;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .items-table th, .items-table td {
            border: 1px solid #333;
            padding: 10px;
            text-align: center;
          }
          .items-table th {
            background: #f5f5f5;
            font-weight: bold;
          }
          .totals-section {
            display: flex;
            justify-content: space-between;
            gap: 20px;
          }
          .qr-section {
            text-align: center;
            flex: 1;
          }
          .qr-section img {
            max-width: 120px;
          }
          .totals-box {
            flex: 1;
          }
          .totals-table {
            width: 100%;
            border-collapse: collapse;
          }
          .totals-table td {
            border: 1px solid #333;
            padding: 8px;
          }
          .totals-table .label {
            background: #f5f5f5;
            font-weight: bold;
          }
          .total-row {
            background: #1a472a !important;
            color: white;
            font-size: 16px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
          }
          @media print {
            body { padding: 0; }
            .invoice-container { border: none; }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2) + ' ر.س';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* Print Button */}
      <div className="flex gap-2 justify-end print:hidden">
        <Button onClick={handlePrint} variant="default" size="sm">
          <Printer className="h-4 w-4 ml-2" />
          طباعة الفاتورة
        </Button>
      </div>

      {/* Invoice Content */}
      <Card className="p-0 overflow-hidden">
        <div ref={invoiceRef} className="bg-white text-black p-6" dir="rtl">
          {/* Header */}
          <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
            <h1 className="text-2xl font-bold mb-1">فاتورة ضريبية</h1>
            <h2 className="text-lg text-gray-600">Tax Invoice</h2>
            <div className="inline-block bg-green-900 text-white px-4 py-1 mt-2 text-sm">
              متوافقة مع هيئة الزكاة والضريبة والجمارك ZATCA
            </div>
          </div>

          {/* Invoice & Order Info */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="border border-gray-300 p-3">
              <p><strong>رقم الفاتورة:</strong> {invoiceNumber}</p>
              <p><strong>تاريخ الفاتورة:</strong> {formatDate(invoiceDate)}</p>
              <p><strong>رقم الطلب:</strong> {orderNumber}</p>
            </div>
            <div className="border border-gray-300 p-3">
              <p><strong>طريقة الدفع:</strong> {paymentMethod === 'CASH_ON_DELIVERY' ? 'الدفع عند الاستلام' : paymentMethod === 'CREDIT_CARD' ? 'بطاقة ائتمان' : paymentMethod}</p>
            </div>
          </div>

          {/* Seller & Buyer Info */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="border border-gray-300 p-3">
              <h3 className="font-bold border-b border-gray-300 pb-2 mb-2">معلومات البائع</h3>
              <p className="text-sm"><strong>الاسم:</strong> {seller.name}</p>
              <p className="text-sm"><strong>الرقم الضريبي:</strong> {seller.vatNumber}</p>
              <p className="text-sm"><strong>العنوان:</strong> {seller.address}</p>
              {seller.phone && <p className="text-sm"><strong>الهاتف:</strong> {seller.phone}</p>}
            </div>
            <div className="border border-gray-300 p-3">
              <h3 className="font-bold border-b border-gray-300 pb-2 mb-2">معلومات المشتري</h3>
              <p className="text-sm"><strong>الاسم:</strong> {buyer.name}</p>
              <p className="text-sm"><strong>الهاتف:</strong> {buyer.phone}</p>
              {buyer.address && <p className="text-sm"><strong>العنوان:</strong> {buyer.address}</p>}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full border-collapse mb-4 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-800 p-2">#</th>
                <th className="border border-gray-800 p-2">الصنف</th>
                <th className="border border-gray-800 p-2">الكمية</th>
                <th className="border border-gray-800 p-2">سعر الوحدة</th>
                <th className="border border-gray-800 p-2">الضريبة</th>
                <th className="border border-gray-800 p-2">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-800 p-2 text-center">{index + 1}</td>
                  <td className="border border-gray-800 p-2">{item.name}</td>
                  <td className="border border-gray-800 p-2 text-center">{item.quantity}</td>
                  <td className="border border-gray-800 p-2 text-center">{formatCurrency(item.unit_price)}</td>
                  <td className="border border-gray-800 p-2 text-center">{formatCurrency(item.vat_amount || (item.total * 0.15))}</td>
                  <td className="border border-gray-800 p-2 text-center">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals & QR Code */}
          <div className="grid grid-cols-2 gap-4">
            {/* QR Code */}
            <div className="flex items-center justify-center border border-gray-300 p-4">
              {qrCode ? (
                <img src={qrCode} alt="ZATCA QR Code" className="max-w-[120px]" />
              ) : (
                <div className="w-[120px] h-[120px] bg-gray-200 flex items-center justify-center text-gray-500 text-xs text-center">
                  رمز QR<br/>ZATCA
                </div>
              )}
            </div>

            {/* Totals */}
            <div>
              <table className="w-full border-collapse text-sm">
                <tbody>
                  <tr>
                    <td className="border border-gray-800 p-2 bg-gray-100 font-bold">المجموع الفرعي</td>
                    <td className="border border-gray-800 p-2 text-center">{formatCurrency(subtotal)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-800 p-2 bg-gray-100 font-bold">ضريبة القيمة المضافة (15%)</td>
                    <td className="border border-gray-800 p-2 text-center">{formatCurrency(vatAmount)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-800 p-2 bg-gray-100 font-bold">الشحن</td>
                    <td className="border border-gray-800 p-2 text-center">{formatCurrency(shippingCost)}</td>
                  </tr>
                  {discount > 0 && (
                    <tr>
                      <td className="border border-gray-800 p-2 bg-gray-100 font-bold">الخصم</td>
                      <td className="border border-gray-800 p-2 text-center text-red-600">-{formatCurrency(discount)}</td>
                    </tr>
                  )}
                  <tr className="bg-green-900 text-white">
                    <td className="border border-gray-800 p-2 font-bold text-lg">الإجمالي شامل الضريبة</td>
                    <td className="border border-gray-800 p-2 text-center font-bold text-lg">{formatCurrency(total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 pt-4 border-t border-gray-300 text-xs text-gray-600">
            <p>هذه الفاتورة الإلكترونية صادرة وفقاً لأنظمة هيئة الزكاة والضريبة والجمارك</p>
            <p>This electronic invoice is issued in accordance with ZATCA regulations</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
