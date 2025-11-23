/**
 * تبويب المشاركة - Sharing Tab
 * مشاركة المتجر ورمز QR
 */

import { Share2, Copy, ExternalLink, QrCode, Monitor, Smartphone } from 'lucide-react';
import {
  UnifiedCard as Card,
  UnifiedCardContent as CardContent,
  UnifiedCardDescription as CardDescription,
  UnifiedCardHeader as CardHeader,
  UnifiedCardTitle as CardTitle
} from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SharingTabProps {
  storeUrl: string;
  qrCodeDataUrl: string | null;
  isGeneratingQR: boolean;
  onCopyLink: () => void;
  onShareStore: () => void;
  onGenerateQR: () => void;
  onDownloadQR: (dataUrl: string, filename: string) => void;
  storeSlug: string;
}

export function SharingTab({
  storeUrl,
  qrCodeDataUrl,
  isGeneratingQR,
  onCopyLink,
  onShareStore,
  onGenerateQR,
  onDownloadQR,
  storeSlug
}: SharingTabProps) {
  return (
    <Card className="rounded-none md:rounded-xl border-x-0 md:border-x">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Share2 className="h-4 w-4 md:h-5 md:w-5" />
          مشاركة المتجر
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          شارك متجرك مع العملاء والمتابعين
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
        {/* Store Link */}
        <div className="space-y-2">
          <Label className="text-sm">رابط المتجر</Label>
          <div className="flex flex-col md:flex-row gap-2">
            <Input value={storeUrl} disabled className="flex-1 text-sm" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCopyLink} className="flex-1 md:flex-none" size="sm">
                <Copy className="h-4 w-4" />
                <span className="md:hidden ml-2">نسخ</span>
              </Button>
              <Button variant="outline" onClick={() => window.open(storeUrl, '_blank')} className="flex-1 md:flex-none" size="sm">
                <ExternalLink className="h-4 w-4" />
                <span className="md:hidden ml-2">فتح</span>
              </Button>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="space-y-2">
          <Label className="text-sm">رمز QR للمتجر</Label>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
              {qrCodeDataUrl ? (
                <img src={qrCodeDataUrl} alt="QR Code" className="w-28 h-28 rounded" />
              ) : (
                <QrCode className="h-16 w-16 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-2 w-full md:w-auto">
              <p className="text-xs md:text-sm text-muted-foreground text-center md:text-right">
                يمكن للعملاء مسح هذا الرمز للوصول إلى متجرك مباشرة
              </p>
              <div className="flex flex-col md:flex-row gap-2">
                <Button variant="outline" onClick={onGenerateQR} disabled={isGeneratingQR} className="w-full md:w-auto" size="sm">
                  {isGeneratingQR ? 'جاري الإنتاج...' : 'توليد رمز QR'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => qrCodeDataUrl && onDownloadQR(qrCodeDataUrl, `qr-${storeSlug}.png`)}
                  disabled={!qrCodeDataUrl}
                  className="w-full md:w-auto"
                  size="sm"
                >
                  تحميل الصورة
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Social Sharing */}
        <div className="space-y-2">
          <Label className="text-sm">المشاركة على وسائل التواصل</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={onShareStore} size="sm" className="w-full">
              <Share2 className="h-4 w-4 md:ml-2" />
              <span className="hidden md:inline">مشاركة</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`تسوق من متجري: ${storeUrl}`)}`)}
              size="sm"
              className="w-full"
            >
              <span className="text-xs md:text-sm">واتساب</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`تسوق من متجري: ${storeUrl}`)}`)}
              size="sm"
              className="w-full"
            >
              <span className="text-xs md:text-sm">تويتر</span>
            </Button>
          </div>
        </div>

        {/* Device Preview */}
        <div className="space-y-2">
          <Label className="text-sm">معاينة على الأجهزة</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Button variant="outline" onClick={() => window.open(storeUrl, '_blank')} size="sm">
              <Monitor className="h-4 w-4 md:ml-2" />
              <span className="text-xs md:text-sm">كمبيوتر</span>
            </Button>
            <Button variant="outline" onClick={() => window.open(storeUrl, '_blank')}>
              <Smartphone className="h-4 w-4 ml-2" />
              جوال
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
