import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star } from 'lucide-react';
import { ReviewCard } from './ReviewCard';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface ReviewsSectionProps {
  productId: string;
  currentUserId?: string;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ productId, currentUserId }) => {
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState<'helpful' | 'recent' | 'rating_high' | 'rating_low'>('helpful');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  const { data: stats } = useQuery({
    queryKey: ['product-rating-stats', productId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_product_rating_stats', {
        p_product_id: productId
      });
      if (error) throw error;
      return data[0];
    }
  });

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['product-reviews', productId, sortBy, filterRating, currentUserId],
    queryFn: async () => {
      let query = supabase
        .from('product_reviews')
        .select(`
          *,
          profiles!customer_profile_id (
            full_name
          ),
          review_votes!left (
            is_helpful,
            voter_profile_id
          )
        `)
        .eq('product_id', productId)
        .eq('is_verified', true)
        .eq('is_hidden', false);

      if (filterRating !== 'all') {
        query = query.eq('rating', filterRating);
      }

      if (sortBy === 'helpful') {
        query = query.order('helpful_count', { ascending: false });
      } else if (sortBy === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'rating_high') {
        query = query.order('rating', { ascending: false });
      } else if (sortBy === 'rating_low') {
        query = query.order('rating', { ascending: true });
      }

      const { data, error } = await query;
      if (error) throw error;

      if (currentUserId) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_user_id', currentUserId)
          .single();

        if (profileData) {
          return data.map(review => ({
            ...review,
            user_vote: review.review_votes?.find((v: any) => v.voter_profile_id === profileData.id)
          }));
        }
      }

      return data;
    }
  });

  const voteMutation = useMutation({
    mutationFn: async ({ reviewId, isHelpful }: { reviewId: string; isHelpful: boolean }) => {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', currentUserId!)
        .single();

      if (!profileData) throw new Error('Profile not found');

      const { data: existingVote } = await supabase
        .from('review_votes')
        .select('*')
        .eq('review_id', reviewId)
        .eq('voter_profile_id', profileData.id)
        .single();

      if (existingVote) {
        const { error } = await supabase
          .from('review_votes')
          .update({ is_helpful: isHelpful })
          .eq('id', existingVote.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('review_votes')
          .insert({
            review_id: reviewId,
            voter_profile_id: profileData.id,
            is_helpful: isHelpful
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
      toast.success('تم تسجيل تقييمك للمراجعة');
    },
    onError: () => {
      toast.error('حدث خطأ في تسجيل التقييم');
    }
  });

  const handleVote = (reviewId: string, isHelpful: boolean) => {
    if (!currentUserId) {
      toast.error('يجب تسجيل الدخول للتصويت');
      return;
    }
    voteMutation.mutate({ reviewId, isHelpful });
  };

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      {stats && (
        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">
                {stats.average_rating || 0}
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${
                      star <= Math.round(stats.average_rating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground">
                بناءً على {stats.total_reviews} تقييم
              </p>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.rating_distribution?.[rating] || 0;
                const percentage = stats.total_reviews > 0 
                  ? (count / stats.total_reviews) * 100 
                  : 0;

                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm w-8">{rating} نجوم</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="ترتيب حسب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="helpful">الأكثر فائدة</SelectItem>
            <SelectItem value="recent">الأحدث</SelectItem>
            <SelectItem value="rating_high">الأعلى تقييماً</SelectItem>
            <SelectItem value="rating_low">الأقل تقييماً</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterRating.toString()} onValueChange={(value) => setFilterRating(value === 'all' ? 'all' : parseInt(value))}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="فلترة حسب النجوم" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع التقييمات</SelectItem>
            <SelectItem value="5">5 نجوم</SelectItem>
            <SelectItem value="4">4 نجوم</SelectItem>
            <SelectItem value="3">3 نجوم</SelectItem>
            <SelectItem value="2">2 نجوم</SelectItem>
            <SelectItem value="1">نجمة واحدة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AnimatePresence mode="popLayout">
        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review: any) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ReviewCard
                  review={review}
                  onVote={handleVote}
                  currentUserId={currentUserId}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            لا توجد مراجعات لهذا المنتج حتى الآن
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
