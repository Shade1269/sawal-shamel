import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Crown, 
  Verified, 
  Award, 
  TrendingUp,
  Star,
  Users,
  Package,
  Instagram,
  Facebook,
  Twitter,
  Phone,
  Mail
} from 'lucide-react';
import { SimpleCart } from '@/features/commerce';

interface StoreHeaderProps {
  store: {
    id: string;
    store_name: string;
    store_slug: string;
    bio: string;
    logo_url?: string;
    theme: string;
    total_sales: number;
    total_orders: number;
    is_active: boolean;
    profiles?: {
      full_name: string;
      avatar_url?: string;
      level: string;
      points: number;
    };
  } | null;
  productsCount: number;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({ store, productsCount }) => {
  const navigate = useNavigate();
  
  if (!store) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-muted rounded-lg"></div>
      </div>
    );
  }

  const getLevelIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'gold':
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'platinum':
        return <Award className="h-5 w-5 text-purple-500" />;
      case 'diamond':
        return <Verified className="h-5 w-5 text-blue-500" />;
      default:
        return <Star className="h-5 w-5 text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'gold':
        return 'from-yellow-400 to-yellow-600';
      case 'platinum':
        return 'from-purple-400 to-purple-600';
      case 'diamond':
        return 'from-blue-400 to-blue-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* خلفية متدرجة */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getLevelColor(store.profiles?.level || 'bronze')} opacity-10`} />
      
      <Card className="border-0 bg-card/80 backdrop-blur-sm relative">
        <CardContent className="p-4 sm:p-8">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 items-start">
            {/* معلومات المتجر */}
            <div className="flex-1 w-full">
              <div className="flex items-start gap-3 sm:gap-6">
                {/* صورة المتجر */}
                <div className="relative">
                  <Avatar className="h-16 w-16 sm:h-24 sm:w-24 border-2 sm:border-4 border-white shadow-lg">
                    <AvatarImage 
                      src={store.logo_url || store.profiles?.avatar_url} 
                      alt={store.store_name} 
                    />
                    <AvatarFallback className="text-lg sm:text-2xl font-bold bg-primary text-primary-foreground">
                      {store.store_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* مؤشر المستوى */}
                  <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2">
                    <Badge 
                      variant="secondary" 
                      className={`bg-gradient-to-r ${getLevelColor(store.profiles?.level || 'bronze')} text-white border-0 text-xs`}
                    >
                      {getLevelIcon(store.profiles?.level || 'bronze')}
                    </Badge>
                  </div>
                </div>

                {/* تفاصيل المتجر */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                    <h1 className="text-xl sm:text-3xl font-bold truncate">{store.store_name}</h1>
                    <Verified className="h-4 w-4 sm:h-6 sm:w-6 text-blue-500 flex-shrink-0" />
                  </div>
                  
                  <div className="flex items-center gap-2 sm:gap-4 mb-3 flex-wrap">
                    <Badge variant="secondary" className="gap-1 text-xs">
                      {getLevelIcon(store.profiles?.level || 'bronze')}
                      {store.profiles?.level || 'برونزي'}
                    </Badge>
                    <Badge variant="outline" className="gap-1 text-xs">
                      <TrendingUp className="h-3 w-3" />
                      {store.profiles?.points || 0} نقطة
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
                    {store.bio || `متجر ${store.profiles?.full_name || store.store_name} - نقدم أفضل المنتجات بأسعار منافسة`}
                  </p>

                  {/* إحصائيات المتجر */}
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-6 mb-4">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Package className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                      <span className="text-xs sm:text-sm font-medium">{productsCount} منتج</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                      <span className="text-xs sm:text-sm font-medium">{store.total_orders} طلب</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 col-span-2 sm:col-span-1">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                      <span className="text-xs sm:text-sm font-medium">{store.total_sales.toLocaleString()} ريال مبيعات</span>
                    </div>
                    <div className="flex items-center gap-1 col-span-2 sm:col-span-1">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs sm:text-sm font-medium">4.8</span>
                      <span className="text-xs text-muted-foreground">(128 تقييم)</span>
                    </div>
                  </div>

                  {/* روابط التواصل */}
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                      اتصل
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                      <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                      راسل
                    </Button>
                    <Button variant="outline" size="sm" className="px-2 sm:px-3">
                      <Instagram className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="px-2 sm:px-3">
                      <Facebook className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* السلة والإجراءات */}
            <div className="flex flex-col gap-3 sm:gap-4 items-start sm:items-end w-full sm:w-auto">
              <SimpleCart 
                shopSlug={store.store_slug} 
                onCheckout={() => navigate(`/${store.store_slug}/checkout`)}
              />
              
              <div className="text-right">
                <div className="text-sm text-muted-foreground">انضم</div>
                <div className="text-xs text-muted-foreground">قبل 6 أشهر</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};