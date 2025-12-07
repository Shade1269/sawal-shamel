import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  FileText, 
  Globe, 
  Zap, 
  Download,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { PageSpeedMonitor, PerformanceRecommendations } from './PageSpeed';
import { SitemapGenerator, autoUpdateSitemap } from '@/utils/sitemap';
import { useSEO } from '@/hooks/useSEO';

export const SEODashboard: React.FC = () => {
  const [sitemapStatus, setSitemapStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [, setSitemapUrl] = useState<string | null>(null);

  // Use SEO hook for this page
  useSEO({
    title: 'لوحة تحكم SEO | منصة التسويق الذكية',
    description: 'أدوات تحسين محركات البحث وقياس الأداء لتحسين ظهور متجرك في نتائج البحث',
    keywords: 'SEO, تحسين محركات البحث, سرعة الموقع, الأداء'
  });

  const handleGenerateSitemap = async () => {
    setSitemapStatus('generating');
    try {
      const xml = await autoUpdateSitemap();
      
      // Create blob URL for download
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      setSitemapUrl(url);
      setSitemapStatus('success');
    } catch (error) {
      console.error('Failed to generate sitemap:', error);
      setSitemapStatus('error');
    }
  };

  const handleDownloadSitemap = () => {
    const sitemap = new SitemapGenerator();
    sitemap.addStaticRoutes();
    sitemap.downloadSitemap();
  };

  const handleDownloadRobots = () => {
    const sitemap = new SitemapGenerator();
    sitemap.downloadRobotsTxt();
  };

  const seoChecklist = [
    {
      name: 'Meta Tags',
      status: 'success' as const,
      description: 'العنوان والوصف محسنان',
      icon: FileText
    },
    {
      name: 'Structured Data',
      status: 'success' as const,
      description: 'البيانات المهيكلة مُفعلة',
      icon: Globe
    },
    {
      name: 'Sitemap',
      status: sitemapStatus === 'success' ? 'success' as const : 'warning' as const,
      description: sitemapStatus === 'success' ? 'خريطة الموقع محدثة' : 'يحتاج تحديث خريطة الموقع',
      icon: Search
    },
    {
      name: 'Page Speed',
      status: 'warning' as const,
      description: 'سرعة الصفحة تحتاج تحسين',
      icon: Zap
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم SEO</h1>
          <p className="text-muted-foreground">
            أدوات تحسين محركات البحث وقياس الأداء
          </p>
        </div>
      </div>

      {/* SEO Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {seoChecklist.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.name}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    item.status === 'success' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-warning/10 text-warning'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{item.name}</h3>
                      {item.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-warning" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">الأداء</TabsTrigger>
          <TabsTrigger value="sitemap">خريطة الموقع</TabsTrigger>
          <TabsTrigger value="metadata">البيانات الوصفية</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PageSpeedMonitor />
            <PerformanceRecommendations />
          </div>
        </TabsContent>

        {/* Sitemap Tab */}
        <TabsContent value="sitemap" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  خريطة الموقع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  خريطة الموقع تساعد محركات البحث في فهم بنية موقعك وفهرسة صفحاتك بشكل أفضل.
                </p>

                <div className="space-y-2">
                  <Button
                    onClick={handleGenerateSitemap}
                    disabled={sitemapStatus === 'generating'}
                    className="w-full"
                  >
                    {sitemapStatus === 'generating' ? (
                      'جاري إنشاء خريطة الموقع...'
                    ) : (
                      'إنشاء خريطة موقع محدثة'
                    )}
                  </Button>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleDownloadSitemap}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      تحميل Sitemap
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleDownloadRobots}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      تحميل Robots.txt
                    </Button>
                  </div>
                </div>

                {sitemapStatus === 'success' && (
                  <div className="p-3 bg-success/10 dark:bg-success/20 rounded-lg">
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">تم إنشاء خريطة الموقع بنجاح</span>
                    </div>
                  </div>
                )}

                {sitemapStatus === 'error' && (
                  <div className="p-3 bg-destructive/10 dark:bg-destructive/20 rounded-lg">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">فشل في إنشاء خريطة الموقع</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إرشادات خريطة الموقع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-medium mb-1">ما يتم تضمينه:</h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• الصفحات الرئيسية</li>
                      <li>• متاجر المسوقين</li>
                      <li>• صفحات المنتجات</li>
                      <li>• الصفحات العامة</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-1">نصائح للتحسين:</h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• حدث خريطة الموقع شهرياً</li>
                      <li>• أضف تواريخ التحديث</li>
                      <li>• حدد أولوية الصفحات</li>
                      <li>• راجع Google Search Console</li>
                    </ul>
                  </div>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <a 
                    href="https://search.google.com/search-console" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Google Search Console
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Metadata Tab */}
        <TabsContent value="metadata" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>البيانات الوصفية الحالية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div>
                    <label className="font-medium">العنوان:</label>
                    <p className="text-muted-foreground mt-1">{document.title}</p>
                  </div>
                  
                  <div>
                    <label className="font-medium">الوصف:</label>
                    <p className="text-muted-foreground mt-1">
                      {(document.querySelector('meta[name="description"]') as HTMLMetaElement)?.content || 'غير محدد'}
                    </p>
                  </div>

                  <div>
                    <label className="font-medium">الكلمات المفتاحية:</label>
                    <p className="text-muted-foreground mt-1">
                      {(document.querySelector('meta[name="keywords"]') as HTMLMetaElement)?.content || 'غير محدد'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>نصائح تحسين البيانات الوصفية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="border-l-4 border-info pl-3">
                    <h4 className="font-medium">العنوان (Title)</h4>
                    <p className="text-muted-foreground">50-60 حرف، يتضمن الكلمة المفتاحية الرئيسية</p>
                  </div>

                  <div className="border-l-4 border-success pl-3">
                    <h4 className="font-medium">الوصف (Description)</h4>
                    <p className="text-muted-foreground">150-160 حرف، وصف جذاب يشجع على النقر</p>
                  </div>

                  <div className="border-l-4 border-accent pl-3">
                    <h4 className="font-medium">الكلمات المفتاحية</h4>
                    <p className="text-muted-foreground">5-7 كلمات مفتاحية متعلقة بالمحتوى</p>
                  </div>

                  <div className="border-l-4 border-warning pl-3">
                    <h4 className="font-medium">Open Graph</h4>
                    <p className="text-muted-foreground">صورة 1200x630 بكسل للمشاركة على وسائل التواصل</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};