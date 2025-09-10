import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Store, ArrowRight, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FirebaseSMSAuth from "@/components/FirebaseSMSAuth";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

// Store Auth Component for customer authentication in stores

interface Shop {
  id: string;
  display_name: string;
  bio: string;
  logo_url: string;
  slug: string;
  owner_id: string;
}

const StoreAuth = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || `/store/${slug}/shipping`;
  const { toast } = useToast();
  const { user: firebaseUser } = useFirebaseAuth();

  // إذا كان المستخدم مسجل دخول، إعادة توجيه مباشرة
  useEffect(() => {
    if (firebaseUser) {
      navigate(returnUrl);
    }
  }, [firebaseUser, navigate, returnUrl]);

  // Fetch shop data
  const { data: shop, isLoading: shopLoading } = useQuery({
    queryKey: ["shop", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return data as Shop | null;
    },
  });

  if (shopLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل المتجر...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-4">
          <Store className="h-16 w-16 text-muted-foreground mx-auto" />
          <div>
            <h1 className="text-2xl font-bold mb-2">المتجر غير موجود</h1>
            <p className="text-muted-foreground mb-4">
              لم يتم العثور على متجر بالاسم "{slug}"
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5" dir="rtl">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarImage src={shop.logo_url} alt={shop.display_name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Store className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold text-foreground">{shop.display_name}</h1>
                <p className="text-sm text-muted-foreground">تسجيل الدخول لإتمام الطلب</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              onClick={() => navigate(`/store/${slug}`)}
              className="gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              العودة للمتجر
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-md">
        <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
            <p className="text-muted-foreground mt-2">
              أدخل رقم جوالك لتسجيل الدخول أو إنشاء حساب جديد
            </p>
          </CardHeader>
          
          <CardContent>
            <FirebaseSMSAuth />
            
            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-muted-foreground">
                بالمتابعة، أنت توافق على شروط الاستخدام وسياسة الخصوصية
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StoreAuth;