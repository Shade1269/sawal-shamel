import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TestItem {
  id: string;
  category: string;
  name: string;
  description: string;
  link: string;
  status: 'pending' | 'passed' | 'failed';
  priority: 'high' | 'medium' | 'low';
}

const TestingDashboard: React.FC = () => {
  const [testItems, setTestItems] = useState<TestItem[]>([]);
  const [stats, setStats] = useState({
    stores: 0,
    products: 0,
    affiliateProducts: 0,
    users: 0
  });

  useEffect(() => {
    loadTestData();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // إحصائيات المتاجر
      const { count: storesCount } = await supabase
        .from('affiliate_stores')
        .select('*', { count: 'exact', head: true });

      // إحصائيات المنتجات  
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // إحصائيات ربط المنتجات بالمتاجر
      const { count: affiliateProductsCount } = await supabase
        .from('affiliate_products')
        .select('*', { count: 'exact', head: true });

      // إحصائيات المسوقين
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'affiliate');

      setStats({
        stores: storesCount || 0,
        products: productsCount || 0,
        affiliateProducts: affiliateProductsCount || 0,
        users: usersCount || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadTestData = () => {
    const tests: TestItem[] = [
      // اختبارات المسوقين
      {
        id: '1',
        category: 'المسوقين',
        name: 'متجر نوليسي للأزياء',
        description: 'اختبار متجر المسوق الأول مع 3 منتجات',
        link: '/affiliate-store/nolici-fashion-store',
        status: 'pending',
        priority: 'high'
      },
      {
        id: '2', 
        category: 'المسوقين',
        name: 'متجر ويباكس للإكسسوارات',
        description: 'متجر بثيم Feminine مع 2 منتج',
        link: '/affiliate-store/wibax-accessories',
        status: 'pending',
        priority: 'high'
      },
      {
        id: '3',
        category: 'المسوقين', 
        name: 'متجر أحمد زاهر',
        description: 'متجر بثيم Damascus مع 2 منتج',
        link: '/affiliate-store/ahmad-zaher-store',
        status: 'pending',
        priority: 'high'
      },
      {
        id: '4',
        category: 'المسوقين',
        name: 'صفحة تصفح المنتجات',
        description: 'واجهة إضافة المنتجات للمتاجر',
        link: '/products-browser',
        status: 'pending',
        priority: 'high'
      },
      {
        id: '5',
        category: 'المسوقين',
        name: 'لوحة تحكم المسوق',
        description: 'لوحة التحكم الرئيسية للمسوقين',
        link: '/affiliate-dashboard',
        status: 'pending',
        priority: 'high'
      },
      // اختبارات عامة
      {
        id: '6',
        category: 'عام',
        name: 'صفحة المنتجات العامة',
        description: 'تصفح جميع المنتجات المتاحة',
        link: '/products',
        status: 'pending',
        priority: 'medium'
      },
      {
        id: '7',
        category: 'عام',
        name: 'سلة التسوق',
        description: 'إضافة المنتجات وإتمام الطلبات',
        link: '/cart',
        status: 'pending',
        priority: 'medium'
      },
      {
        id: '8',
        category: 'الإدارة',
        name: 'لوحة الأدمن',
        description: 'لوحة تحكم الإدارة العامة',
        link: '/admin/dashboard',
        status: 'pending',
        priority: 'medium'
      },
      {
        id: '9',
        category: 'التجار',
        name: 'لوحة التاجر',
        description: 'لوحة تحكم التجار ومنتجاتهم',
        link: '/merchant-dashboard',
        status: 'pending',
        priority: 'medium'
      },
      {
        id: '10',
        category: 'عام',
        name: 'تسجيل الدخول السريع',
        description: 'واجهة تسجيل الدخول المحدثة',
        link: '/auth',
        status: 'pending',
        priority: 'low'
      }
    ];

    setTestItems(tests);
  };

  const updateTestStatus = (id: string, status: 'passed' | 'failed') => {
    setTestItems(prev => prev.map(item => 
      item.id === id ? { ...item, status } : item
    ));
    
    toast.success(`تم تحديث حالة الاختبار إلى: ${status === 'passed' ? 'نجح ✅' : 'فشل ❌'}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800', 
      low: 'bg-green-100 text-green-800'
    };
    
    const labels = {
      high: 'عالي',
      medium: 'متوسط',
      low: 'منخفض'
    };
    
    return (
      <Badge className={colors[priority as keyof typeof colors]}>
        {labels[priority as keyof typeof labels]}
      </Badge>
    );
  };

  const groupedTests = testItems.reduce((acc, test) => {
    if (!acc[test.category]) {
      acc[test.category] = [];
    }
    acc[test.category].push(test);
    return acc;
  }, {} as Record<string, TestItem[]>);

  const totalTests = testItems.length;
  const passedTests = testItems.filter(t => t.status === 'passed').length;
  const failedTests = testItems.filter(t => t.status === 'failed').length;
  const pendingTests = testItems.filter(t => t.status === 'pending').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">🧪 لوحة الاختبار الشامل</h1>
        <p className="text-muted-foreground">
          اختبار جميع مكونات منصة أتلانتس - تركيز على نظام المسوقين الجديد
        </p>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.stores}</div>
            <div className="text-sm text-muted-foreground">متاجر المسوقين</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.products}</div>
            <div className="text-sm text-muted-foreground">إجمالي المنتجات</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.affiliateProducts}</div>
            <div className="text-sm text-muted-foreground">منتجات مربوطة</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.users}</div>
            <div className="text-sm text-muted-foreground">مسوقين نشطين</div>
          </CardContent>
        </Card>
      </div>

      {/* إحصائيات الاختبار */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>📊 حالة الاختبارات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold">{totalTests}</div>
              <div className="text-sm text-muted-foreground">إجمالي الاختبارات</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{passedTests}</div>
              <div className="text-sm text-muted-foreground">نجح ✅</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-600">{failedTests}</div>
              <div className="text-sm text-muted-foreground">فشل ❌</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-yellow-600">{pendingTests}</div>
              <div className="text-sm text-muted-foreground">قيد الانتظار ⏳</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${totalTests > 0 ? (passedTests / totalTests) * 100 : 0}%` }}
              />
            </div>
            <div className="text-center mt-2 text-sm text-muted-foreground">
              نسبة الإنجاز: {totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* قائمة الاختبارات */}
      {Object.entries(groupedTests).map(([category, tests]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {category === 'المسوقين' && '🎯'}
              {category === 'عام' && '🌐'}
              {category === 'الإدارة' && '⚙️'}
              {category === 'التجار' && '🏪'}
              {category}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tests.map((test) => (
                <div 
                  key={test.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <div className="font-medium">{test.name}</div>
                      <div className="text-sm text-muted-foreground">{test.description}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(test.priority)}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(test.link, '_blank')}
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      اختبر
                    </Button>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateTestStatus(test.id, 'passed')}
                        className="text-green-600 hover:bg-green-50"
                      >
                        ✅
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateTestStatus(test.id, 'failed')}
                        className="text-red-600 hover:bg-red-50"
                      >
                        ❌
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* تعليمات سريعة */}
      <Card>
        <CardHeader>
          <CardTitle>📋 تعليمات الاختبار</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>1.</strong> انقر على "اختبر" لفتح الصفحة في تبويب جديد</p>
            <p><strong>2.</strong> تأكد من عمل جميع الوظائف المطلوبة</p>
            <p><strong>3.</strong> انقر ✅ إذا نجح الاختبار أو ❌ إذا فشل</p>
            <p><strong>4.</strong> ركز على الاختبارات عالية الأولوية أولاً</p>
            <p><strong>5.</strong> سجل أي مشاكل تواجهها في التعليقات</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestingDashboard;