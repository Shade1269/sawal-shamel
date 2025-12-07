import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Phone,
  Clock,
  Shield,
  Truck,
  CreditCard,
  RotateCcw
} from "lucide-react";

const StoreFooter = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();

  // جلب بيانات المتجر
  const { data: store } = useQuery({
    queryKey: ["store-info", storeSlug], // إعادة استخدام نفس الاستعلام
    queryFn: async () => {
      if (!storeSlug) return null;
      
      const { data, error } = await supabase
        .from("affiliate_stores")
        .select("*")
        .eq("store_slug", storeSlug)
        .eq("is_active", true)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!storeSlug,
  });

  if (!store) return null;

  return (
    <footer className="bg-secondary/30 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        {/* المعلومات الأساسية */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* معلومات المتجر */}
          <div>
            <h3 className="text-lg font-bold text-primary mb-4">{store.store_name}</h3>
            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
              {store.bio || "متجر إلكتروني موثوق يقدم أفضل المنتجات بأسعار تنافسية"}
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-accent" />
                <span>للاستفسارات: 920000000</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-accent" />
                <span>ساعات العمل: 9 صباحاً - 9 مساءً</span>
              </div>
            </div>
          </div>

          {/* خدمات المتجر */}
          <div>
            <h4 className="font-semibold text-primary mb-4">خدماتنا</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="h-4 w-4 text-primary" />
                <span>توصيل مجاني للطلبات أكثر من 200 ريال</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <RotateCcw className="h-4 w-4 text-primary" />
                <span>إرجاع مجاني خلال 14 يوم</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4 text-primary" />
                <span>الدفع عند الاستلام متاح</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                <span>ضمان الجودة 100%</span>
              </li>
            </ul>
          </div>

          {/* معلومات التوصيل */}
          <div>
            <h4 className="font-semibold text-primary mb-4">التوصيل والشحن</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• التوصيل داخل الرياض: 1-2 يوم عمل</li>
              <li>• التوصيل خارج الرياض: 2-4 أيام عمل</li>
              <li>• التوصيل السريع متاح في نفس اليوم</li>
              <li>• تتبع الطلب عبر رسائل SMS</li>
            </ul>
          </div>
        </div>

        {/* الخط السفلي */}
        <div className="border-t border-border pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {store.store_name}. جميع الحقوق محفوظة.
            </p>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-primary transition-colors">
                سياسة الخصوصية
              </Link>
              <Link to="/terms" className="hover:text-primary transition-colors">
                شروط الاستخدام
              </Link>
              <Link to="/return-policy" className="hover:text-primary transition-colors">
                سياسة الاسترجاع
              </Link>
              <Link to="/shipping-policy" className="hover:text-primary transition-colors">
                سياسة الشحن
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default StoreFooter;