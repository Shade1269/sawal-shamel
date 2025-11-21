import { useState, useRef, useEffect } from 'react';
import { useGamingSettings } from '@/contexts/GamingSettingsContext';
import { Camera, X, RotateCw, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ARPreviewProps {
  productImage: string;
  productName: string;
  onClose?: () => void;
}

/**
 * AR Preview Component
 * معاينة المنتج بتقنية الواقع المعزز
 */
export const ARPreview = ({ productImage, productName, onClose }: ARPreviewProps) => {
  const { settings } = useGamingSettings();
  const [isARActive, setIsARActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [productScale, setProductScale] = useState(1);
  const [productRotation, setProductRotation] = useState(0);
  const [productPosition, setProductPosition] = useState({ x: 50, y: 50 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Start AR Camera
  const startAR = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsARActive(true);
      toast.success('تم تشغيل الكاميرا! 📷');
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('فشل الوصول للكاميرا');
    }
  };

  // Stop AR Camera
  const stopAR = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsARActive(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAR();
    };
  }, []);

  // Take Screenshot
  const takeScreenshot = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame
    ctx.drawImage(video, 0, 0);

    // Draw product overlay
    const productImg = new Image();
    productImg.crossOrigin = 'anonymous';
    productImg.src = productImage;
    productImg.onload = () => {
      const productWidth = (canvas.width * 0.4) * productScale;
      const productHeight = productWidth;
      const x = (canvas.width * productPosition.x / 100) - (productWidth / 2);
      const y = (canvas.height * productPosition.y / 100) - (productHeight / 2);

      // Save context
      ctx.save();

      // Apply rotation
      ctx.translate(x + productWidth / 2, y + productHeight / 2);
      ctx.rotate((productRotation * Math.PI) / 180);
      ctx.translate(-(x + productWidth / 2), -(y + productHeight / 2));

      // Draw product with shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;
      ctx.drawImage(productImg, x, y, productWidth, productHeight);

      // Restore context
      ctx.restore();

      // Download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${productName}-AR-Preview.png`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success('تم حفظ الصورة! 📸');
        }
      });
    };
  };

  // Touch gestures for mobile
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch - move product
      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      const y = ((touch.clientY - rect.top) / rect.height) * 100;
      setProductPosition({ x, y });
    } else if (e.touches.length === 2) {
      // Two fingers - pinch to zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      // Scale based on distance (simplified)
      setProductScale(Math.max(0.5, Math.min(3, distance / 200)));
    }
  };

  if (!settings.isGamingMode) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 bg-black">
        {!isARActive ? (
          // AR Start Screen
          <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-br from-purple-900 to-pink-900">
            <Camera className="h-24 w-24 text-white mb-6 animate-pulse" />
            <h2 className="text-3xl font-bold text-white mb-4 text-center">
              معاينة الواقع المعزز
            </h2>
            <p className="text-white/80 text-center mb-8 max-w-md">
              شاهد المنتج في غرفتك قبل الشراء!<br />
              استخدم الكاميرا لوضع المنتج في أي مكان
            </p>

            <div className="space-y-4 w-full max-w-sm">
              <Button
                onClick={startAR}
                size="lg"
                className="w-full bg-white text-black hover:bg-gray-100 font-bold text-lg"
              >
                <Camera className="h-5 w-5 ml-2" />
                ابدأ AR
              </Button>

              <Button
                onClick={onClose}
                variant="outline"
                size="lg"
                className="w-full border-white text-white hover:bg-white/20"
              >
                <X className="h-5 w-5 ml-2" />
                إلغاء
              </Button>
            </div>

            <div className="mt-8 text-sm text-white/60 text-center">
              <p>💡 نصائح:</p>
              <ul className="mt-2 space-y-1">
                <li>✓ وجه الكاميرا نحو سطح مستوٍ</li>
                <li>✓ تأكد من الإضاءة الجيدة</li>
                <li>✓ استخدم إصبعين للتكبير/التصغير</li>
              </ul>
            </div>
          </div>
        ) : (
          // AR Camera View
          <div className="relative w-full h-full">
            {/* Camera Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              onTouchMove={handleTouchMove}
            />

            {/* Hidden Canvas for Screenshots */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Product Overlay */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${productPosition.x}%`,
                top: `${productPosition.y}%`,
                transform: `translate(-50%, -50%) scale(${productScale}) rotate(${productRotation}deg)`,
                transition: 'transform 0.1s ease-out',
              }}
            >
              <img
                src={productImage}
                alt={productName}
                className="w-64 h-64 object-contain drop-shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))',
                }}
              />
            </div>

            {/* Controls Overlay */}
            <div className="absolute top-4 left-0 right-0 flex justify-between items-start px-4 z-10">
              {/* Product Info */}
              <div className="bg-black/70 backdrop-blur-lg px-4 py-2 rounded-full">
                <p className="text-white text-sm font-semibold">{productName}</p>
              </div>

              {/* Close Button */}
              <Button
                onClick={() => {
                  stopAR();
                  onClose?.();
                }}
                size="icon"
                className="bg-black/70 hover:bg-black/90 rounded-full"
              >
                <X className="h-5 w-5 text-white" />
              </Button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center items-end gap-3 px-4 z-10">
              {/* Zoom Out */}
              <Button
                onClick={() => setProductScale(prev => Math.max(0.5, prev - 0.2))}
                size="icon"
                className="bg-black/70 hover:bg-black/90 rounded-full"
              >
                <ZoomOut className="h-5 w-5 text-white" />
              </Button>

              {/* Rotate */}
              <Button
                onClick={() => setProductRotation(prev => (prev + 45) % 360)}
                size="icon"
                className="bg-black/70 hover:bg-black/90 rounded-full"
              >
                <RotateCw className="h-5 w-5 text-white" />
              </Button>

              {/* Take Screenshot */}
              <Button
                onClick={takeScreenshot}
                size="icon"
                className="bg-purple-600 hover:bg-purple-700 rounded-full w-16 h-16"
              >
                <Download className="h-6 w-6 text-white" />
              </Button>

              {/* Zoom In */}
              <Button
                onClick={() => setProductScale(prev => Math.min(3, prev + 0.2))}
                size="icon"
                className="bg-black/70 hover:bg-black/90 rounded-full"
              >
                <ZoomIn className="h-5 w-5 text-white" />
              </Button>
            </div>

            {/* Instructions */}
            <div className="absolute top-20 left-0 right-0 text-center">
              <div className="inline-block bg-black/70 backdrop-blur-lg px-6 py-3 rounded-full">
                <p className="text-white text-sm">
                  اسحب لتحريك • اقرص للتكبير • اضغط 🔄 للدوران
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

/**
 * AR Preview Button
 * زر لفتح معاينة AR
 */
interface ARPreviewButtonProps {
  productImage: string;
  productName: string;
}

export const ARPreviewButton = ({ productImage, productName }: ARPreviewButtonProps) => {
  const { settings } = useGamingSettings();
  const [showAR, setShowAR] = useState(false);

  if (!settings.isGamingMode) return null;

  // Check if device supports camera
  const isCameraSupported = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;

  if (!isCameraSupported) return null;

  return (
    <>
      <Button
        onClick={() => setShowAR(true)}
        variant="outline"
        className="w-full border-purple-500 text-purple-600 hover:bg-purple-50"
      >
        <Camera className="h-4 w-4 ml-2" />
        معاينة AR
      </Button>

      {showAR && (
        <ARPreview
          productImage={productImage}
          productName={productName}
          onClose={() => setShowAR(false)}
        />
      )}
    </>
  );
};
