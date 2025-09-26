import React from 'react';
import { 
  EnhancedButton,
  Button
} from '@/components/ui/index';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Home, 
  ArrowRight, 
  Search, 
  AlertTriangle,
  Navigation
} from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-persian-bg flex items-center justify-center px-4">
      <div className="container mx-auto max-w-2xl text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="text-8xl md:text-9xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            404
          </div>
          <div className="relative">
            <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto animate-bounce" />
          </div>
        </div>

        {/* Error Message */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm mb-8">
          <CardContent className="p-8">
            <h1 className="text-3xl font-bold mb-4">
              عذراً، الصفحة غير موجودة
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              لم نتمكن من العثور على الصفحة التي تبحث عنها. 
              ربما تم نقلها أو حذفها أو أن الرابط غير صحيح.
            </p>
            
            {/* Quick Actions */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/">
                  <Button size="lg" className="bg-gradient-primary w-full sm:w-auto">
                    <Home className="w-5 h-5 mr-2" />
                    العودة إلى الصفحة الرئيسية
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>

                <Link to="/checkout">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <Search className="w-5 h-5 mr-2" />
                    الانتقال إلى الدفع
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Link
            to="/affiliate"
            className="p-3 bg-card/30 rounded-lg hover:bg-card/50 transition-colors border border-border/20"
          >
            <div className="flex items-center gap-2 text-primary">
              <Navigation className="h-4 w-4" />
              <span>مركز المسوق</span>
            </div>
          </Link>

          <Link
            to="/admin/dashboard"
            className="p-3 bg-card/30 rounded-lg hover:bg-card/50 transition-colors border border-border/20"
          >
            <div className="flex items-center gap-2 text-luxury">
              <Search className="h-4 w-4" />
              <span>لوحة الإدارة</span>
            </div>
          </Link>

          <Link
            to="/auth"
            className="p-3 bg-card/30 rounded-lg hover:bg-card/50 transition-colors border border-border/20"
          >
            <div className="flex items-center gap-2 text-premium">
              <Home className="h-4 w-4" />
              <span>تسجيل دخول</span>
            </div>
          </Link>

          <Link
            to="/order/confirmation"
            className="p-3 bg-card/30 rounded-lg hover:bg-card/50 transition-colors border border-border/20"
          >
            <div className="flex items-center gap-2 text-heritage">
              <AlertTriangle className="h-4 w-4" />
              <span>تأكيد الطلب</span>
            </div>
          </Link>
        </div>

        {/* Search Suggestions */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            هل تبحث عن شيء محدد؟ جرب هذه الروابط المفيدة أعلاه
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;