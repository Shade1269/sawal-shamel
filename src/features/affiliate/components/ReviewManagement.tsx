import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ReviewManagementProps {
  storeId: string;
}

export const ReviewManagement: React.FC<ReviewManagementProps> = ({ storeId }) => {
  const queryClient = useQueryClient();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'verified' | 'hidden'>('all');

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['store-reviews', storeId, selectedFilter],
    queryFn: async () => {
      const { data: storeProducts } = await supabase
        .from('affiliate_products')
        .select('product_id')
        .eq('affiliate_store_id', storeId);

      if (!storeProducts || storeProducts.length === 0) return [];

      const productIds = storeProducts.map(sp => sp.product_id);

      let query = supabase
        .from('product_reviews')
        .select(`
          *,
          products (
            title
          ),
          profiles!customer_profile_id (
            full_name
          )
        `)
        .in('product_id', productIds)
        .order('created_at', { ascending: false });

      if (selectedFilter === 'verified') {
        query = query.eq('is_verified', true);
      } else if (selectedFilter === 'hidden') {
        query = query.eq('is_hidden', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const toggleHiddenMutation = useMutation({
    mutationFn: async ({ reviewId, isHidden }: { reviewId: string; isHidden: boolean }) => {
      const { error } = await supabase
        .from('product_reviews')
        .update({ is_hidden: !isHidden })
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-reviews', storeId] });
      toast.success('تم تحديث حالة المراجعة');
    },
    onError: () => {
      toast.error('حدث خطأ في تحديث المراجعة');
    }
  });

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle>إدارة المراجعات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('all')}
            >
              الكل
            </Button>
            <Button
              variant={selectedFilter === 'verified' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('verified')}
            >
              موثّقة
            </Button>
            <Button
              variant={selectedFilter === 'hidden' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('hidden')}
            >
              مخفية
            </Button>
          </div>

          {reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-0 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold">{review.profiles.full_name}</span>
                            {review.is_verified && (
                              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                                <CheckCircle className="h-3 w-3 ml-1" />
                                موثّق
                              </Badge>
                            )}
                            {review.is_hidden && (
                              <Badge variant="destructive">
                                مخفي
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {review.products.title}
                          </p>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(review.created_at), 'dd MMMM yyyy', { locale: ar })}
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleHiddenMutation.mutate({
                            reviewId: review.id,
                            isHidden: review.is_hidden
                          })}
                        >
                          {review.is_hidden ? (
                            <>
                              <Eye className="h-4 w-4 ml-1" />
                              إظهار
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4 ml-1" />
                              إخفاء
                            </>
                          )}
                        </Button>
                      </div>

                      {review.comment && (
                        <p className="text-foreground leading-relaxed mb-4">{review.comment}</p>
                      )}

                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto">
                          {review.images.map((imageUrl: string, index: number) => (
                            <div
                              key={index}
                              className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
                            >
                              <img
                                src={imageUrl}
                                alt={`صورة المراجعة ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                        <span>المفيدة: {review.helpful_count}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              لا توجد مراجعات
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
