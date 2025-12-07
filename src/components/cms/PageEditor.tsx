import React, { useState, useEffect } from 'react';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  Eye, 
  Globe, 
  Settings, 
  Layout,
  Plus,
  X,
  Image,
  Type,
  Video,
  Square
} from 'lucide-react';
import { useStorePage, useUpdateStorePage, usePageTemplates } from '@/hooks/useStoreCMS';

interface PageEditorProps {
  pageId: string;
  storeId: string;
  onSave?: (page: any) => void;
}

export const PageEditor: React.FC<PageEditorProps> = ({ pageId, storeId: _storeId, onSave }) => {
  const { data: page, isLoading } = useStorePage(pageId);
  const { data: templates } = usePageTemplates();
  const updatePage = useUpdateStorePage();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: {},
    meta_title: '',
    meta_description: '',
    meta_keywords: [] as string[],
    status: 'draft' as 'draft' | 'published' | 'scheduled' | 'archived',
    is_home_page: false,
    template_id: '',
  });

  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    if (page) {
      setFormData({
        title: page.title,
        slug: page.slug,
        content: page.content || {},
        meta_title: page.meta_title || '',
        meta_description: page.meta_description || '',
        meta_keywords: page.meta_keywords || [],
        status: page.status,
        is_home_page: page.is_home_page,
        template_id: page.template_id || '',
      });
    }
  }, [page]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      const updatedPage = await updatePage.mutateAsync({
        id: pageId,
        ...formData
      });
      onSave?.(updatedPage);
    } catch (error) {
      console.error('Error saving page:', error);
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.meta_keywords.includes(newKeyword.trim())) {
      handleInputChange('meta_keywords', [...formData.meta_keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    handleInputChange('meta_keywords', formData.meta_keywords.filter(k => k !== keyword));
  };

  const contentBlocks = [
    { type: 'text', icon: Type, name: 'نص' },
    { type: 'image', icon: Image, name: 'صورة' },
    { type: 'video', icon: Video, name: 'فيديو' },
    { type: 'button', icon: Square, name: 'زر' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">تحرير الصفحة</h1>
          <p className="text-muted-foreground">قم بتحرير محتوى وإعدادات الصفحة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            معاينة
          </Button>
          <Button onClick={handleSave} disabled={updatePage.isPending}>
            <Save className="w-4 h-4 mr-2" />
            حفظ التغييرات
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5" />
                محتوى الصفحة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="content">المحتوى</TabsTrigger>
                  <TabsTrigger value="blocks">الكتل</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">عنوان الصفحة</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="أدخل عنوان الصفحة"
                      />
                    </div>

                    <div>
                      <Label htmlFor="slug">رابط الصفحة (Slug)</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        placeholder="page-url"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <Label>محتوى الصفحة</Label>
                      <div className="min-h-[300px] border rounded-md p-4 bg-muted/20">
                        <p className="text-sm text-muted-foreground">
                          محرر المحتوى الغني سيتم تنفيذه هنا
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="blocks" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {contentBlocks.map((block) => {
                      const IconComponent = block.icon;
                      return (
                        <Button
                          key={block.type}
                          variant="outline"
                          className="h-20 flex-col gap-2"
                          onClick={() => {}}
                        >
                          <IconComponent className="w-6 h-6" />
                          <span className="text-xs">{block.name}</span>
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">كتل المحتوى المضافة</h4>
                    <div className="text-sm text-muted-foreground">
                      لا توجد كتل محتوى مضافة بعد
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Page Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                إعدادات الصفحة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">حالة النشر</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">مسودة</SelectItem>
                    <SelectItem value="published">منشورة</SelectItem>
                    <SelectItem value="scheduled">مجدولة</SelectItem>
                    <SelectItem value="archived">مؤرشفة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="template">القالب</Label>
                <Select
                  value={formData.template_id}
                  onValueChange={(value) => handleInputChange('template_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر قالب" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates?.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="home_page"
                  checked={formData.is_home_page}
                  onCheckedChange={(checked) => handleInputChange('is_home_page', checked)}
                />
                <Label htmlFor="home_page" className="mr-2">الصفحة الرئيسية</Label>
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                إعدادات SEO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta_title">عنوان meta</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => handleInputChange('meta_title', e.target.value)}
                  placeholder="عنوان الصفحة في محركات البحث"
                />
              </div>

              <div>
                <Label htmlFor="meta_description">وصف meta</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => handleInputChange('meta_description', e.target.value)}
                  placeholder="وصف الصفحة في محركات البحث"
                  rows={3}
                />
              </div>

              <div>
                <Label>الكلمات المفتاحية</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="أضف كلمة مفتاحية"
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                  />
                  <Button onClick={addKeyword} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.meta_keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                      {keyword}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeKeyword(keyword)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};