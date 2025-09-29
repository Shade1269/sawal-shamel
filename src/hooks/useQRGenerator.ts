import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useQRGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateQR = async (url: string, size: number = 256) => {
    setIsGenerating(true);
    
    try {
      // استخدام خدمة مجانية لتوليد QR Code
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
      
      // تحميل الصورة
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      
      // إنشاء رابط للتحميل
      const downloadUrl = URL.createObjectURL(blob);
      
      toast({
        title: "تم إنتاج رمز QR",
        description: "تم إنشاء رمز QR بنجاح"
      });

      return {
        success: true,
        blob,
        downloadUrl,
        qrUrl
      };
    } catch (error: any) {
      console.error('Error generating QR code:', error);
      toast({
        title: "خطأ",
        description: "فشل في إنتاج رمز QR",
        variant: "destructive"
      });
      return {
        success: false,
        error: error.message
      };
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = (downloadUrl: string, filename: string = 'qr-code.png') => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  };

  return {
    generateQR,
    downloadQR,
    isGenerating
  };
};