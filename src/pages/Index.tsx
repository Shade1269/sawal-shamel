import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Users, Hash, Package, LogOut, User, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useUserDataContext } from '@/contexts/UserDataContext';

const Index = () => {
  const navigate = useNavigate();
  const { user: supabaseUser, signOut: supabaseSignOut } = useSupabaseAuth();
  const { user: firebaseUser, signOut: firebaseSignOut } = useFirebaseAuth();
  const { user, userProfile } = useUserDataContext();

  // Firebase user takes priority
  const currentUser = user || firebaseUser || supabaseUser;
  
  const handleChatClick = () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    navigate('/chat');
  };

  const handleInventoryClick = () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    navigate('/inventory');
  };

  const handleStoreManagementClick = () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    navigate('/store-management');
  };

  const handleSignOut = async () => {
    if (firebaseUser) {
      await firebaseSignOut();
    }
    if (supabaseUser) {
      await supabaseSignOut();
    }
    navigate('/auth');
  };

  const getUserDisplayName = () => {
    // استخدام البيانات الموحدة أولاً
    if (userProfile) {
      return userProfile.full_name || userProfile.username || userProfile.phone || userProfile.email || 'المستخدم';
    }
    // الرجوع للبيانات الأصلية
    if (firebaseUser) {
      return firebaseUser.displayName || firebaseUser.phoneNumber || 'مستخدم Firebase';
    }
    if (supabaseUser) {
      return supabaseUser.user_metadata?.username || supabaseUser.user_metadata?.full_name || supabaseUser.email || 'مستخدم';
    }
    return 'ضيف';
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating Damascus decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-damascus opacity-12 rounded-full blur-2xl animate-damascus-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-luxury opacity-18 rounded-full blur-xl animate-damascus-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-primary opacity-10 rounded-full blur-3xl animate-damascus-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-gradient-premium opacity-15 rounded-full blur-2xl animate-damascus-float" style={{ animationDelay: '3s' }}></div>
        
        {/* Heritage arabesque patterns */}
        <div className="absolute top-0 left-0 w-full h-32 opacity-8 bg-gradient-to-r from-transparent via-damascus to-transparent animate-heritage-wave"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 opacity-8 bg-gradient-to-r from-transparent via-primary to-transparent animate-heritage-wave" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Header with logout button */}
      {currentUser && (
        <div className="border-b bg-card/60 backdrop-blur-md border-border/30 shadow-heritage">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 bg-gradient-to-r from-primary/15 to-damascus/15 p-3 rounded-xl border border-primary/25">
                <User className="h-5 w-5 text-damascus animate-damascus-float" />
                <span className="text-sm font-medium text-foreground">
                  مرحباً، {getUserDisplayName()}
                </span>
              </div>
              <Button
                variant="glass"
                size="sm"
                onClick={handleSignOut}
                className="gap-2 hover:shadow-heritage"
              >
                <LogOut className="h-4 w-4" />
                تسجيل خروج
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-damascus bg-clip-text text-transparent mb-4">
            منصة أتلانتس للتجارة الإلكترونية
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            استكشف عالم التسوق الفاخر مع تجربة تجارة إلكترونية لا مثيل لها
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="group hover:shadow-luxury transition-all duration-500 cursor-pointer border border-border/30 hover:border-primary/50 bg-gradient-to-br from-card/50 to-card backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-glow group-hover:scale-110 transition-all duration-500 shadow-soft">
                  <MessageCircle className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">دردشة العملاء</CardTitle>
                <CardDescription className="text-lg">
                  تواصل مع فريق الدعم والعملاء الآخرين
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  variant="atlantis"
                  size="lg" 
                  className="w-full h-12 text-lg font-bold rounded-xl"
                  onClick={handleChatClick}
                >
                  بدء المحادثة
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-luxury transition-all duration-500 cursor-pointer border border-border/30 hover:border-luxury/50 bg-gradient-to-br from-card/50 to-card backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-luxury rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-glow group-hover:scale-110 transition-all duration-500 shadow-soft">
                  <Package className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold bg-gradient-luxury bg-clip-text text-transparent">كتالوج المنتجات</CardTitle>
                <CardDescription className="text-lg">
                  استكشف مجموعة منتجاتنا الفاخرة والحصرية
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  variant="commerce"
                  size="lg" 
                  className="w-full h-12 text-lg font-bold rounded-xl"
                  onClick={handleInventoryClick}
                >
                  تصفح المنتجات
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-luxury transition-all duration-500 border border-border/30 hover:border-premium/50 bg-gradient-to-br from-card/50 to-card backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-premium rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-glow group-hover:scale-110 transition-all duration-500 shadow-soft">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold bg-gradient-premium bg-clip-text text-transparent">مجتمع أتلانتس</CardTitle>
                <CardDescription className="text-lg">
                  انضم إلى مجتمع المتسوقين المميزين والحصريين
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex items-center justify-center gap-3 text-muted-foreground bg-gradient-to-r from-muted/20 to-muted/10 p-3 rounded-xl border border-border/20">
                  <Hash className="h-5 w-5" />
                  <span className="font-medium">تجربة تسوق حصرية 24/7</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Store Management Section */}
          {currentUser && (
            <div className="mb-12">
              <Card className="group hover:shadow-damascus transition-all duration-500 cursor-pointer border border-border/30 hover:border-damascus/50 bg-gradient-to-br from-card/60 to-card backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="mx-auto w-24 h-24 bg-gradient-damascus rounded-3xl flex items-center justify-center mb-6 group-hover:shadow-damascus group-hover:scale-110 transition-all duration-500 shadow-elegant">
                    <Store className="h-12 w-12 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-black bg-gradient-atlantis bg-clip-text text-transparent">لوحة التحكم التجارية</CardTitle>
                  <CardDescription className="text-lg mt-3">
                    إدارة شاملة لمتجرك الإلكتروني ومنتجاتك وطلباتك
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <Button 
                    variant="atlantis"
                    size="lg" 
                    className="w-full h-14 text-xl font-black rounded-2xl"
                    onClick={handleStoreManagementClick}
                  >
                    دخول لوحة التحكم
                  </Button>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-gradient-to-r from-primary/15 to-primary/8 p-3 rounded-xl border border-primary/25">
                      <p className="text-sm font-medium text-primary">إدارة المنتجات</p>
                    </div>
                    <div className="bg-gradient-to-r from-luxury/15 to-luxury/8 p-3 rounded-xl border border-luxury/25">
                      <p className="text-sm font-medium text-luxury">تتبع المبيعات</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
            </div>
          )}


          {!currentUser && (
            <div className="text-center">
              <Card className="max-w-lg mx-auto border border-border/30 bg-gradient-to-br from-card/60 to-card backdrop-blur-sm shadow-elegant">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-damascus rounded-2xl flex items-center justify-center mb-4 shadow-glow">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold bg-gradient-atlantis bg-clip-text text-transparent">انضم إلى أتلانتس</CardTitle>
                  <CardDescription className="text-lg mt-2">
                    سجل حساب جديد واستمتع بتجربة تسوق لا تُنسى
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="atlantis"
                    size="lg"
                    className="w-full h-12 text-lg font-bold rounded-xl"
                    onClick={() => navigate('/auth')}
                  >
                    بدء رحلة التسوق
                  </Button>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-center p-2 bg-primary/8 rounded-lg border border-primary/15">
                      <p className="font-medium text-primary">تسوق آمن</p>
                    </div>
                    <div className="text-center p-2 bg-luxury/8 rounded-lg border border-luxury/15">
                      <p className="font-medium text-luxury">شحن مجاني</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
