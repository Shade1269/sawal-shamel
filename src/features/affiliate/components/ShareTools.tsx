import { useEffect, useRef, useState } from 'react';
import { Share2, Copy, Download, ExternalLink } from 'lucide-react';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { AffiliateStoreSummary, AffiliateProductShare } from '../hooks/useAffiliateMetrics';

interface ShareToolsProps {
  store: AffiliateStoreSummary;
  shareUrl: string | null;
  products?: AffiliateProductShare[];
}

const currencyFormatter = new Intl.NumberFormat('ar-SA', {
  style: 'currency',
  currency: 'SAR',
  maximumFractionDigits: 0,
});

export const ShareTools = ({ store, shareUrl, products }: ShareToolsProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { toast } = useToast();
  const [qrReady, setQrReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas || !shareUrl) {
      return;
    }

    const size = 220;
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(shareUrl)}`;

    const drawPlaceholder = () => {
      context.clearRect(0, 0, size, size);
      const gradient = context.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, 'rgba(198, 66, 98, 0.15)');
      gradient.addColorStop(1, 'rgba(31, 122, 140, 0.15)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, size, size);
      context.fillStyle = '#c64262';
      context.font = '16px sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('تعذّر توليد QR', size / 2, size / 2);
    };

    image.onload = () => {
      context.clearRect(0, 0, size, size);
      context.drawImage(image, 0, 0, size, size);
      setQrReady(true);
    };

    image.onerror = () => {
      drawPlaceholder();
      setQrReady(false);
    };

    drawPlaceholder();

    return () => {
      context.clearRect(0, 0, size, size);
    };
  }, [shareUrl]);

  const handleCopy = async () => {
    if (!shareUrl) {
      toast({
        title: 'لا يوجد رابط قابل للنسخ',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (typeof navigator !== 'undefined' && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else if (typeof document !== 'undefined') {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      } else {
        throw new Error('Clipboard API is unavailable');
      }

      toast({
        title: 'تم نسخ الرابط',
        description: 'يمكنك الآن مشاركة المتجر مع جمهورك.',
      });
    } catch (error) {
      toast({
        title: 'تعذر نسخ الرابط',
        description: 'حاول مرة أخرى أو انسخ الرابط يدويًا.',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    if (!shareUrl) {
      return;
    }

    if (typeof navigator !== 'undefined' && navigator?.share) {
      try {
        await navigator.share({
          title: store.store_name,
          url: shareUrl,
          text: store.share_message ?? 'اطلع على متجري في منصة أناقتي',
        });
      } catch (error) {
        // المستخدم ربما أغلق نافذة المشاركة
      }
    } else {
      handleCopy();
    }
  };

  const handleDownload = () => {
    if (!shareUrl || !canvasRef.current || typeof window === 'undefined') {
      return;
    }

    const link = document.createElement('a');
    link.href = canvasRef.current.toDataURL('image/png');
    link.download = `anaqti-store-${store.store_slug}-qr.png`;
    link.click();
  };

  const buildProductShareMessage = (product: AffiliateProductShare) => {
    const formattedPrice = currencyFormatter.format(product.revenue);
    const baseUrl = shareUrl ?? '';
    const reference = product.productId ? `?ref=${encodeURIComponent(product.productId)}` : '';
    return `${product.title} متاح الآن بسعر ${formattedPrice}. تسوق من متجري عبر أناقتي: ${baseUrl}${reference}`;
  };

  const handleProductShare = async (product: AffiliateProductShare) => {
    if (!shareUrl) {
      toast({
        title: 'فعّل المتجر قبل المشاركة',
        description: 'يرجى تفعيل الرابط العام للمتجر لمشاركة المنتجات.',
        variant: 'destructive',
      });
      return;
    }

    const message = buildProductShareMessage(product);

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: message,
          url: shareUrl,
        });
        return;
      } catch (error) {
        // المستخدم ربما أغلق نافذة المشاركة
      }
    }

    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(message);
        toast({
          title: 'تم نسخ عرض المنتج',
          description: `يمكنك الآن لصق عرض ${product.title} في قنواتك.`,
        });
        return;
      } catch (error) {
        // fallthrough للعرض اليدوي
      }
    }

    toast({
      title: 'انسخ الرسالة يدويًا',
      description: message,
    });
  };

  return (
    <Card className="anaqti-card" dir="rtl">
      <CardHeader className="pb-4">
        <CardTitle className="anaqti-section-title text-lg">أدوات المشاركة</CardTitle>
        <p className="text-sm anaqti-muted">انسخ رابط متجرك، شاركه فورًا، أو حمّل رمز QR الأنيق.</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_240px]">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="affiliate-share-link">
                رابط المتجر
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="affiliate-share-link"
                  value={shareUrl ?? ''}
                  readOnly
                  className="flex-1 text-left"
                  dir="ltr"
                  placeholder="سيظهر الرابط هنا عند تفعيل المتجر"
                />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCopy} disabled={!shareUrl} className="rounded-full">
                    <Copy className="ml-2 h-4 w-4" />
                    نسخ
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!shareUrl || typeof window === 'undefined') return;
                      window.open(shareUrl, '_blank');
                    }}
                    disabled={!shareUrl}
                    className="rounded-full"
                  >
                    <ExternalLink className="ml-2 h-4 w-4" />
                    فتح
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleShare}
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!shareUrl}
              >
                <Share2 className="ml-2 h-4 w-4" />
                مشاركة الآن
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={!shareUrl || !qrReady}
                className="rounded-full"
              >
                <Download className="ml-2 h-4 w-4" />
                تحميل QR
              </Button>
            </div>

            {Array.isArray(products) && products.length > 0 ? (
              <div className="space-y-3 rounded-[var(--radius-l)] border border-border bg-card/70 p-[var(--spacing-md)] shadow-md">
                <h3 className="text-sm font-semibold text-foreground">أفضل المنتجات استعدادًا للمشاركة</h3>
                <ul className="space-y-2">
                  {products.slice(0, 3).map((product) => (
                    <li
                      key={product.productId}
                      className="flex items-center justify-between gap-3 rounded-[var(--radius-m)] bg-muted px-[var(--spacing-md)] py-[var(--spacing-sm)] text-sm text-foreground"
                    >
                      <div className="flex flex-col text-right">
                        <span className="font-medium">{product.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {currencyFormatter.format(product.revenue)} · {product.quantity} قطعة مباعة
                        </span>
                      </div>
                      <Button size="sm" className="rounded-full" onClick={() => handleProductShare(product)}>
                        مشاركة
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col items-center gap-3">
            <canvas
              ref={canvasRef}
              width={220}
              height={220}
              className="rounded-3xl border border-border bg-card"
            />
            <p className="text-xs anaqti-muted text-center">
              {qrReady ? 'امسح الرمز للوصول المباشر إلى المتجر' : 'سيتم توليد رمز QR تلقائيًا عند توفر الرابط'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShareTools;
