import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Target,
  Loader2,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Users,
  Sparkles,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Recommendation {
  productId: string;
  reason: string;
  score: number;
  product: {
    id: string;
    title: string;
    price_sar: number;
    image_url?: string;
    category?: string;
  };
}

interface Props {
  storeId: string;
  currentProductId?: string;
  cartItems?: string[];
  customerId?: string;
}

const SUPABASE_URL = 'https://uewuiiopkctdtaexmtxu.supabase.co';

export function AIProductRecommendations({
  storeId,
  currentProductId,
  cartItems = [],
  customerId
}: Props) {
  const [type, setType] = useState<string>('personalized');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [strategy, setStrategy] = useState<string>('');

  const fetchRecommendations = async () => {
    if (!storeId) {
      toast.error('معرف المتجر مطلوب');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          currentProductId,
          cartItems,
          customerId,
          type,
          limit: 6
        })
      });

      if (!response.ok) {
        throw new Error('فشل في جلب التوصيات');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
      setStrategy(data.strategy || '');
    } catch (error) {
      console.error('Recommendations error:', error);
      toast.error('حدث خطأ أثناء جلب التوصيات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) {
      fetchRecommendations();
    }
  }, [storeId, type]);

  const typeOptions = [
    { value: 'personalized', label: 'مخصصة لك', icon: Target },
    { value: 'similar', label: 'منتجات مشابهة', icon: Star },
    { value: 'complementary', label: 'منتجات مكملة', icon: ShoppingCart },
    { value: 'trending', label: 'الأكثر رواجاً', icon: TrendingUp },
    { value: 'upsell', label: 'ترقية', icon: Sparkles },
    { value: 'cross-sell', label: 'منتجات إضافية', icon: Users }
  ];

  return (
    <Card className="bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              توصيات ذكية
            </CardTitle>
            <CardDescription>
              منتجات مقترحة بناءً على الذكاء الاصطناعي
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchRecommendations}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* نوع التوصيات */}
        <div className="space-y-2">
          <Label>نوع التوصيات</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{opt.label}</span>
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* الاستراتيجية */}
        {strategy && (
          <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
            <span className="font-medium">الاستراتيجية:</span> {strategy}
          </div>
        )}

        {/* التوصيات */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.productId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-muted/30 overflow-hidden hover:shadow-md transition-shadow">
                  {rec.product.image_url && (
                    <div className="aspect-square bg-muted">
                      <img
                        src={rec.product.image_url}
                        alt={rec.product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-3 space-y-2">
                    <h4 className="font-medium text-sm line-clamp-2">
                      {rec.product.title}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">
                        {rec.product.price_sar} ر.س
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(rec.score * 100)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {rec.reason}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            لا توجد توصيات متاحة حالياً
          </div>
        )}
      </CardContent>
    </Card>
  );
}
