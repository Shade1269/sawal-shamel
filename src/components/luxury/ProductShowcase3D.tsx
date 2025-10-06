import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProductShowcase3DProps {
  product: {
    id: string;
    title: string;
    description?: string;
    price_sar: number;
    images?: string[];
    image_urls?: string[];
    category?: string;
    rating?: number;
    reviews?: number;
    stock?: number;
  };
  onAddToCart?: () => void;
  onToggleFavorite?: () => void;
  onShare?: () => void;
  className?: string;
}

export function ProductShowcase3D({
  product,
  onAddToCart,
  onToggleFavorite,
  onShare,
  className
}: ProductShowcase3DProps) {
  const images = product.images || product.image_urls || ['/placeholder.svg'];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [rotation, setRotation] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setRotation((prev) => prev + 10);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setRotation((prev) => prev - 10);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <Card
      className={cn(
        "overflow-hidden border-2 border-red-600/20 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-800/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_12px_48px_rgba(196,30,58,0.25),0_0_24px_rgba(196,30,58,0.15)] hover:border-red-600/35 transition-all duration-500",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold text-white mb-2">
              {product.title}
            </CardTitle>
            {product.description && (
              <p className="text-sm text-slate-300 line-clamp-2">
                {product.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-red-600/20 text-red-400 border-red-600/30">
              <Eye className="h-3 w-3 ml-1" />
              {product.stock || 0} متاح
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="relative perspective-1000">
            <motion.div
              className="relative aspect-square rounded-xl overflow-hidden bg-slate-800/50 backdrop-blur-sm"
              style={{
                transformStyle: "preserve-3d",
                perspective: "1000px"
              }}
              animate={{
                rotateY: rotation
              }}
              transition={{
                duration: 0.8,
                ease: "easeInOut"
              }}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIndex}
                  src={images[currentIndex]}
                  alt={`${product.title} - صورة ${currentIndex + 1}`}
                  className={cn(
                    "w-full h-full object-cover transition-transform duration-500",
                    isZoomed && "scale-150 cursor-zoom-out",
                    !isZoomed && "cursor-zoom-in"
                  )}
                  onClick={toggleZoom}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: isZoomed ? 1.5 : 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-slate-900/80 backdrop-blur-sm hover:bg-red-600/80 text-white border border-red-600/30 hover:border-red-600/50 h-10 w-10 rounded-lg shadow-lg"
                    onClick={prevImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900/80 backdrop-blur-sm hover:bg-red-600/80 text-white border border-red-600/30 hover:border-red-600/50 h-10 w-10 rounded-lg shadow-lg"
                    onClick={nextImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-red-600/30">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-red-600/20 hover:text-red-400"
                  onClick={toggleZoom}
                >
                  {isZoomed ? (
                    <ZoomOut className="h-4 w-4" />
                  ) : (
                    <ZoomIn className="h-4 w-4" />
                  )}
                </Button>
                <div className="text-xs text-slate-400">
                  {currentIndex + 1} / {images.length}
                </div>
              </div>
            </motion.div>

            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <motion.button
                    key={idx}
                    className={cn(
                      "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300",
                      idx === currentIndex
                        ? "border-red-600 shadow-[0_0_16px_rgba(196,30,58,0.5)]"
                        : "border-slate-700 hover:border-red-600/50 opacity-60 hover:opacity-100"
                    )}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setRotation(idx * 10);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      src={img}
                      alt={`${product.title} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-red-500">
                  {product.price_sar.toLocaleString('ar')} ريال
                </div>
                {product.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-semibold text-white">
                      {product.rating}
                    </span>
                    {product.reviews && (
                      <span className="text-sm text-slate-400">
                        ({product.reviews} تقييم)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {product.category && (
                <Badge
                  variant="outline"
                  className="bg-slate-800/50 text-slate-300 border-slate-700 w-fit"
                >
                  {product.category}
                </Badge>
              )}

              <div className="pt-2 space-y-2 text-slate-300 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>متوفر في المخزون</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>شحن مجاني للطلبات فوق 200 ريال</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>إمكانية الإرجاع خلال 14 يوم</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-6">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={onAddToCart}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-red-700 via-red-600 to-red-700 hover:from-red-600 hover:to-red-600 text-white shadow-2xl shadow-red-600/40 hover:shadow-[0_0_32px_rgba(196,30,58,0.6),0_0_64px_rgba(196,30,58,0.3)] border border-red-500/30 transition-all duration-500"
                >
                  <ShoppingCart className="h-5 w-5 ml-2" />
                  أضف إلى السلة
                </Button>
              </motion.div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={onToggleFavorite}
                  className="border-2 border-red-600 text-red-600 bg-slate-900/50 backdrop-blur-md hover:bg-red-950/30 hover:shadow-[0_0_24px_rgba(196,30,58,0.4)] transition-all duration-300"
                >
                  <Heart className="h-4 w-4 ml-2" />
                  المفضلة
                </Button>
                <Button
                  variant="outline"
                  onClick={onShare}
                  className="border-2 border-slate-600 text-slate-300 bg-slate-900/50 backdrop-blur-md hover:bg-slate-800/50 transition-all duration-300"
                >
                  <Share2 className="h-4 w-4 ml-2" />
                  مشاركة
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
