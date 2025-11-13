import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, TrendingUp, Users, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export const HeroPreview = () => {
  return (
    <section className="relative min-h-[600px] overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNkNGFmMzciIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzE0IDAgNiAyLjY4NiA2IDZzLTIuNjg2IDYtNiA2LTYtMi42ODYtNi02IDIuNjg2LTYgNi02ek0yNCA0NGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Right Content (RTL) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 text-right order-2 lg:order-1"
          >
            <Badge className="text-lg px-4 py-2 bg-gradient-luxury animate-pulse">
              ✨ عروض حصرية
            </Badge>
            
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-l from-primary via-luxury to-premium bg-clip-text text-transparent">
                اكتشفي
              </span>
              <br />
              <span className="text-foreground">منتجاتك المفضلة</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-xl">
              مجموعة فريدة من المنتجات المختارة بعناية خصيصاً لك. جودة عالية وأسعار منافسة
            </p>

            <div className="flex gap-4 justify-end flex-wrap">
              <Button size="lg" className="text-lg px-8 group hover-scale">
                <ShoppingBag className="ml-2 group-hover:rotate-12 transition-transform" />
                تسوقي الآن
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                استكشفي المجموعات
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex gap-6 justify-end flex-wrap pt-8">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-4 py-3 rounded-xl border border-border/50"
              >
                <Users className="text-primary w-5 h-5" />
                <div className="text-right">
                  <div className="text-sm font-bold">+5,000</div>
                  <div className="text-xs text-muted-foreground">عميلة سعيدة</div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-4 py-3 rounded-xl border border-border/50"
              >
                <Star className="text-luxury w-5 h-5 fill-luxury" />
                <div className="text-right">
                  <div className="text-sm font-bold">4.9/5</div>
                  <div className="text-xs text-muted-foreground">تقييم العملاء</div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-4 py-3 rounded-xl border border-border/50"
              >
                <TrendingUp className="text-success w-5 h-5" />
                <div className="text-right">
                  <div className="text-sm font-bold">منتجات جديدة</div>
                  <div className="text-xs text-muted-foreground">كل أسبوع</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Left Visual (RTL) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative order-1 lg:order-2"
          >
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Decorative Elements */}
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 3, repeat: Infinity }
                }}
                className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-luxury/20 rounded-full blur-3xl"
              />
              
              {/* Main Image Placeholder */}
              <div className="relative bg-gradient-to-br from-card to-secondary/20 rounded-3xl p-8 shadow-2xl border border-border/50 backdrop-blur-sm">
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-luxury/10 rounded-2xl flex items-center justify-center">
                  <ShoppingBag className="w-32 h-32 text-primary opacity-30" />
                </div>
                
                {/* Floating Badge */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-gradient-luxury text-primary-foreground px-6 py-3 rounded-full shadow-lg font-bold"
                >
                  خصم 30%
                </motion.div>

                {/* Floating Badge 2 */}
                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-4 -left-4 bg-success text-white px-6 py-3 rounded-full shadow-lg font-bold"
                >
                  شحن مجاني
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground"
      >
        <div className="text-sm mb-2 text-center">استكشف المزيد</div>
        <div className="w-6 h-10 border-2 border-current rounded-full mx-auto relative">
          <motion.div
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-current rounded-full absolute top-2 left-1/2 -translate-x-1/2"
          />
        </div>
      </motion.div>
    </section>
  );
};
