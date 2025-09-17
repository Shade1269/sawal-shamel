import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Image, 
  Settings, 
  Layout,
  Palette,
  Code,
  FormInput,
  ArrowLeft
} from 'lucide-react';
import { PagesManager } from '@/components/cms/PagesManager';
import { PageEditor } from '@/components/cms/PageEditor';
import { MediaLibrary } from '@/components/cms/MediaLibrary';
import { useAffiliateStore } from '@/hooks/useAffiliateStore';
import { useNavigate } from 'react-router-dom';

export const CMSManagement = () => {
  const navigate = useNavigate();
  const { store } = useAffiliateStore();
  const [activeTab, setActiveTab] = useState('pages');
  const [editingPageId, setEditingPageId] = useState<string | null>(null);

  if (!store) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">لم يتم العثور على متجر</h1>
          <p className="text-muted-foreground">يجب أن يكون لديك متجر تابع لاستخدام نظام إدارة المحتوى</p>
          <Button onClick={() => navigate('/affiliate')} className="mt-4">
            العودة إلى لوحة التحكم
          </Button>
        </div>
      </div>
    );
  }

  const cmsFeatures = [
    {
      icon: FileText,
      title: 'إدارة الصفحات',
      description: 'إنشاء وتحرير صفحات المتجر',
      count: '5 صفحات'
    },
    {
      icon: Image,
      title: 'مكتبة الوسائط',
      description: 'إدارة الصور والملفات',
      count: '24 ملف'
    },
    {
      icon: Layout,
      title: 'القوالب',
      description: 'تخصيص تصميم الصفحات',
      count: '8 قوالب'
    },
    {
      icon: FormInput,
      title: 'النماذج',
      description: 'إنشاء نماذج مخصصة',
      count: '3 نماذج'
    }
  ];

  if (editingPageId) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container mx-auto p-4">
            <Button
              variant="ghost"
              onClick={() => setEditingPageId(null)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة إلى إدارة الصفحات
            </Button>
          </div>
        </div>
        
        <PageEditor
          pageId={editingPageId}
          storeId={store.id}
          onSave={() => setEditingPageId(null)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">نظام إدارة المحتوى</h1>
          <p className="text-muted-foreground mt-2">
            إدارة محتوى وصفحات متجر {store.store_name}
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          متجر نشط
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cmsFeatures.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {feature.title}
                </CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{feature.count}</div>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main CMS Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            إدارة المحتوى
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pages" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                الصفحات
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                الوسائط
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <Layout className="w-4 h-4" />
                القوالب
              </TabsTrigger>
              <TabsTrigger value="forms" className="flex items-center gap-2">
                <FormInput className="w-4 h-4" />
                النماذج
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pages" className="space-y-6">
              <PagesManager 
                storeId={store.id} 
                onEditPage={setEditingPageId}
              />
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              <MediaLibrary storeId={store.id} />
            </TabsContent>

            <TabsContent value="templates" className="space-y-6">
              <div className="text-center py-12">
                <Layout className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">إدارة القوالب</h3>
                <p className="text-muted-foreground mb-4">
                  قريباً... إدارة وتخصيص قوالب الصفحات
                </p>
                <Button variant="outline" disabled>
                  <Palette className="w-4 h-4 mr-2" />
                  استكشاف القوالب
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="forms" className="space-y-6">
              <div className="text-center py-12">
                <FormInput className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">النماذج المخصصة</h3>
                <p className="text-muted-foreground mb-4">
                  قريباً... إنشاء وإدارة النماذج المخصصة
                </p>
                <Button variant="outline" disabled>
                  <Code className="w-4 h-4 mr-2" />
                  إنشاء نموذج
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('pages')}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              إنشاء صفحة جديدة
            </Button>
            <Button 
              variant="outline"
              onClick={() => setActiveTab('media')}
              className="flex items-center gap-2"
            >
              <Image className="w-4 h-4" />
              رفع صور
            </Button>
            <Button 
              variant="outline"
              disabled
              className="flex items-center gap-2"
            >
              <Layout className="w-4 h-4" />
              تخصيص التصميم
            </Button>
            <Button 
              variant="outline"
              disabled
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              إعدادات المتجر
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};