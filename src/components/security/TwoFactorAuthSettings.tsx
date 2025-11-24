import { useState, useEffect } from 'react';
import { Shield, Key, Copy, Check, AlertTriangle, Smartphone } from 'lucide-react';
import { UnifiedCard, UnifiedButton as Button, UnifiedBadge } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTwoFactorAuth, TwoFactorStatus } from '@/hooks/useTwoFactorAuth';
import { toast } from 'sonner';
import QRCode from 'qrcode';

export function TwoFactorAuthSettings() {
  const {
    isLoading,
    setupData,
    checkTwoFactorStatus,
    setup2FA,
    verify2FA,
    disable2FA,
  } = useTwoFactorAuth();

  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Load 2FA status
  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    const currentStatus = await checkTwoFactorStatus();
    setStatus(currentStatus);
  };

  // Generate QR code when setup data is available
  useEffect(() => {
    if (setupData?.qrCodeUrl) {
      QRCode.toDataURL(setupData.qrCodeUrl, {
        width: 256,
        margin: 2,
      }).then(setQrCodeDataUrl);
    }
  }, [setupData]);

  const handleEnableClick = async () => {
    await setup2FA();
    setShowSetupDialog(true);
  };

  const handleVerifyAndEnable = async () => {
    if (!verificationCode.trim()) {
      toast.error('الرجاء إدخال رمز التحقق');
      return;
    }

    const success = await verify2FA(verificationCode, true);
    if (success) {
      setShowSetupDialog(false);
      setVerificationCode('');
      await loadStatus();
    }
  };

  const handleDisable = async () => {
    const success = await disable2FA();
    if (success) {
      setShowDisableDialog(false);
      await loadStatus();
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('تم النسخ');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyBackupCode = (code: string, index: number) => {
    copyToClipboard(code, index);
  };

  return (
    <>
      <UnifiedCard className="bg-card">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">المصادقة الثنائية (2FA)</h3>
                <p className="text-sm text-muted-foreground">
                  حماية إضافية لحسابك
                </p>
              </div>
            </div>
            {status?.enabled && (
              <UnifiedBadge variant="success">
                مفعّلة
              </UnifiedBadge>
            )}
          </div>

          {status?.enabled ? (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>المصادقة الثنائية مفعلة وتحمي حسابك.</p>
                    <div className="text-sm text-muted-foreground">
                      <div>الطريقة: {status.method === 'totp' ? 'تطبيق المصادقة' : 'SMS'}</div>
                      {status.last_used_at && (
                        <div>آخر استخدام: {new Date(status.last_used_at).toLocaleDateString('ar-SA')}</div>
                      )}
                      {status.backup_codes_remaining !== undefined && (
                        <div>الأكواد الاحتياطية المتبقية: {status.backup_codes_remaining}</div>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              <UnifiedButton
                variant="outline"
                onClick={() => setShowDisableDialog(true)}
                className="w-full"
              >
                إيقاف المصادقة الثنائية
              </UnifiedButton>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  المصادقة الثنائية غير مفعلة. نوصي بتفعيلها لحماية أفضل لحسابك.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">كيف تعمل المصادقة الثنائية؟</h4>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  <li>تحتاج تطبيق مصادقة مثل Google Authenticator أو Microsoft Authenticator</li>
                  <li>عند تسجيل الدخول، ستحتاج رمزاً من التطبيق بالإضافة لكلمة المرور</li>
                  <li>ستحصل على 10 أكواد احتياطية للطوارئ</li>
                </ul>
              </div>

              <UnifiedButton
                onClick={handleEnableClick}
                disabled={isLoading}
                className="w-full"
              >
                <Smartphone className="ml-2 h-4 w-4" />
                {isLoading ? 'جاري الإعداد...' : 'تفعيل المصادقة الثنائية'}
              </UnifiedButton>
            </div>
          )}
        </div>
      </UnifiedCard>

      {/* Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إعداد المصادقة الثنائية</DialogTitle>
            <DialogDescription>
              اتبع الخطوات التالية لتفعيل المصادقة الثنائية
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Step 1: QR Code */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                  1
                </span>
                امسح رمز QR
              </h4>
              <div className="flex justify-center p-4 bg-muted rounded-lg">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                افتح تطبيق المصادقة وامسح الرمز
              </p>
            </div>

            {/* Step 2: Manual Entry */}
            {setupData?.secret && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  أو أدخل المفتاح يدوياً
                </h4>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-xs font-mono">
                    {setupData.secret}
                  </code>
                  <UnifiedButton
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(setupData.secret, -1)}
                  >
                    {copiedIndex === -1 ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </UnifiedButton>
                </div>
              </div>
            )}

            {/* Step 3: Verification */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                  2
                </span>
                أدخل رمز التحقق
              </h4>
              <div className="space-y-2">
                <Label htmlFor="verification-code">رمز التحقق من التطبيق</Label>
                <Input
                  id="verification-code"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                />
              </div>
              <UnifiedButton
                onClick={handleVerifyAndEnable}
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full"
              >
                {isLoading ? 'جاري التحقق...' : 'تحقق وفعّل'}
              </UnifiedButton>
            </div>

            {/* Backup Codes */}
            {setupData?.backupCodes && (
              <div className="space-y-3">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">احفظ هذه الأكواد الاحتياطية!</p>
                      <p className="text-xs">
                        استخدمها إذا فقدت الوصول لتطبيق المصادقة. كل كود يعمل مرة واحدة فقط.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-2">
                  {setupData.backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-muted rounded"
                    >
                      <code className="flex-1 text-xs font-mono">{code}</code>
                      <button
                        onClick={() => copyBackupCode(code, index)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {copiedIndex === index ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إيقاف المصادقة الثنائية؟</DialogTitle>
            <DialogDescription>
              سيصبح حسابك أقل أماناً بدون المصادقة الثنائية
            </DialogDescription>
          </DialogHeader>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              سيمكن لأي شخص لديه بريدك الإلكتروني وكلمة المرور الوصول لحسابك.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <UnifiedButton
              variant="outline"
              onClick={() => setShowDisableDialog(false)}
              className="flex-1"
            >
              إلغاء
            </UnifiedButton>
            <Button
              variant="danger"
              onClick={handleDisable}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'جاري الإيقاف...' : 'إيقاف 2FA'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
