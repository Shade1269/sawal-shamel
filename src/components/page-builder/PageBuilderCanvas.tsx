import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Monitor, 
  Tablet, 
  Smartphone,
  Plus,
  Grid,
  Move
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PageBuilderCanvasProps {
  previewMode?: boolean;
  onElementSelect?: (element: any) => void;
}

export const PageBuilderCanvas: React.FC<PageBuilderCanvasProps> = ({
  previewMode = false,
  onElementSelect
}) => {
  const [deviceView, setDeviceView] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const deviceSizes = {
    desktop: 'w-full max-w-none',
    tablet: 'w-[768px] mx-auto',
    mobile: 'w-[375px] mx-auto'
  };

  return (
    <div className="flex-1 bg-muted/20">
      {/* Canvas Toolbar */}
      {!previewMode && (
        <div className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Button
              variant={deviceView === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDeviceView('desktop')}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant={deviceView === 'tablet' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDeviceView('tablet')}
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              variant={deviceView === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDeviceView('mobile')}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Grid className="w-4 h-4 mr-1" />
              شبكة التوجيه
            </Button>
            <Button variant="outline" size="sm">
              <Move className="w-4 h-4 mr-1" />
              الالتقاط
            </Button>
          </div>
        </div>
      )}

      {/* Canvas Area */}
      <div className="flex-1 p-6 overflow-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`${deviceSizes[deviceView]} transition-all duration-300`}
        >
          <Card className="min-h-[800px] bg-background shadow-xl">
            <div className="p-8 space-y-8">
              {/* Sample Content - This would be dynamic */}
              <div className="text-center space-y-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-6 border-2 border-dashed border-muted-foreground/20 rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => onElementSelect?.({ type: 'hero', id: 'hero-1' })}
                >
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                    مرحباً بك في متجرنا
                  </h1>
                  <p className="text-xl text-muted-foreground mb-6">
                    اكتشف أفضل المنتجات بأسعار لا تُقاوم
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-accent">
                      تسوق الآن
                    </Button>
                    <Button variant="outline" size="lg">
                      اعرف المزيد
                    </Button>
                  </div>
                </motion.div>
              </div>

              {/* Product Grid */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="p-6 border-2 border-dashed border-muted-foreground/20 rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => onElementSelect?.({ type: 'product-grid', id: 'grid-1' })}
              >
                <h2 className="text-2xl font-bold text-center mb-6">المنتجات المميزة</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-4">
                      <div className="aspect-square bg-muted rounded-lg mb-4" />
                      <h3 className="font-semibold mb-2">منتج رقم {i}</h3>
                      <p className="text-muted-foreground mb-2">وصف المنتج</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary">299 ريال</span>
                        <Button size="sm">أضف للسلة</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>

              {/* CTA Section */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="p-8 bg-gradient-to-r from-primary to-accent rounded-lg text-primary-foreground text-center border-2 border-dashed border-transparent hover:border-primary-foreground/30 transition-all cursor-pointer"
                onClick={() => onElementSelect?.({ type: 'cta', id: 'cta-1' })}
              >
                <h2 className="text-3xl font-bold mb-4">عرض خاص محدود!</h2>
                <p className="text-xl mb-6 opacity-90">
                  احصل على خصم 50% على جميع المنتجات
                </p>
                <Button variant="secondary" size="lg" className="bg-card text-primary hover:bg-card/90">
                  احصل على العرض
                </Button>
              </motion.div>

              {/* Add New Element Button */}
              {!previewMode && (
                <div className="flex justify-center pt-8">
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 border-dashed border-2 hover:border-primary/50"
                  >
                    <Plus className="w-5 h-5" />
                    إضافة عنصر جديد
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};