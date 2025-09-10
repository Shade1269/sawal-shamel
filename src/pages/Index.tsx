import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Users, Hash, Package, LogOut, User, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user: supabaseUser, signOut: supabaseSignOut } = useSupabaseAuth();
  const { user: firebaseUser, userProfile, signOut: firebaseSignOut } = useFirebaseAuth();

  // Firebase user takes priority
  const user = firebaseUser || supabaseUser;
  
  const handleChatClick = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate('/chat');
  };

  const handleInventoryClick = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate('/inventory');
  };

  const handleStoreManagementClick = () => {
    if (!user) {
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
    if (firebaseUser) {
      return userProfile?.phone || firebaseUser.phoneNumber || 'مستخدم Firebase';
    }
    if (supabaseUser) {
      return supabaseUser.user_metadata?.full_name || supabaseUser.email || 'مستخدم';
    }
    return 'ضيف';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Header with logout button */}
      {user && (
        <div className="border-b bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  مرحباً، {getUserDisplayName()}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
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
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            مرحباً بك في منصة الدردشة
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            انضم إلى مجتمعنا وتواصل مع الآخرين في بيئة آمنة ومريحة
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">الدردشة الجماعية</CardTitle>
                <CardDescription>
                  تواصل مع المجتمع في غرف الدردشة المختلفة
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={handleChatClick}
                >
                  دخول غرف الدردشة
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-secondary/50">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                  <Package className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle className="text-2xl">المخزون</CardTitle>
                <CardDescription>
                  تصفح كتالوج المنتجات والأسعار المتوفرة
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  size="lg" 
                  className="w-full"
                  variant="secondary"
                  onClick={handleInventoryClick}
                >
                  عرض المنتجات
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <Users className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-2xl">المجتمع النشط</CardTitle>
                <CardDescription>
                  انضم إلى مجتمع من المستخدمين الودودين والنشطين
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span>متوفر 24/7</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Store Management Section */}
          {user && (
            <div className="mb-12">
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-accent/50">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <Store className="h-8 w-8 text-accent" />
                  </div>
                  <CardTitle className="text-2xl">إدارة المتجر</CardTitle>
                  <CardDescription>
                    إعدادات متجرك الإلكتروني وإدارة المنتجات
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    size="lg" 
                    className="w-full"
                    variant="outline"
                    onClick={handleStoreManagementClick}
                  >
                    دخول إدارة المتجر
                  </Button>
                </CardContent>
              </Card>
              
            </div>
          )}


          {!user && (
            <div className="text-center">
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle>هل تريد الانضمام؟</CardTitle>
                  <CardDescription>
                    سجل حساب جديد أو سجل دخول للبدء
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/auth')}
                  >
                    تسجيل دخول / إنشاء حساب
                  </Button>
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
