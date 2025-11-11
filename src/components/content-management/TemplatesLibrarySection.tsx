import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Layout, 
  Search,
  Crown,
  Download,
  Eye,
  Star
} from 'lucide-react';
import { usePageTemplates } from '@/hooks/useContentManagement';

export function TemplatesLibrarySection() {
  const { templates, isLoading } = usePageTemplates();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'الكل', count: templates.length },
    { id: 'homepage', name: 'الصفحة الرئيسية', count: templates.filter(t => t.template_category === 'homepage').length },
    { id: 'products', name: 'صفحات المنتجات', count: templates.filter(t => t.template_category === 'products').length },
    { id: 'info', name: 'صفحات المعلومات', count: templates.filter(t => t.template_category === 'info').length },
    { id: 'contact', name: 'اتصل بنا', count: templates.filter(t => t.template_category === 'contact').length }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (template.template_description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.template_category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">مكتبة القوالب</h2>
          <p className="text-muted-foreground">اختر من مجموعة متنوعة من القوالب الاحترافية</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="البحث في القوالب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Categories Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:w-auto lg:flex">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="gap-2">
              {category.name}
              <Badge variant="secondary" className="text-xs">
                {category.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {/* Templates Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse overflow-hidden">
                  <div className="aspect-video bg-gray-300"></div>
                  <CardHeader className="pb-4">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Layout className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  {searchTerm ? 'لا توجد نتائج' : 'لا توجد قوالب في هذه الفئة'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? 'جرب كلمات بحث مختلفة' : 'سيتم إضافة المزيد من القوالب قريباً'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                  {/* Template Preview */}
                  <div className="aspect-video bg-gradient-to-br from-primary/5 to-secondary/5 relative overflow-hidden">
                    {template.preview_image_url ? (
                      <img 
                        src={template.preview_image_url} 
                        alt={template.template_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Layout className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary">
                        <Eye className="h-4 w-4 mr-1" />
                        معاينة
                      </Button>
                      <Button size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        استخدام
                      </Button>
                    </div>

                    {/* Premium Badge */}
                    {template.is_premium && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-gradient-warning text-primary-foreground gap-1">
                          <Crown className="h-3 w-3" />
                          مميز
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-base line-clamp-1">{template.template_name}</CardTitle>
                    {template.template_description && (
                      <CardDescription className="line-clamp-2">
                        {template.template_description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {template.template_category === 'homepage' && 'الرئيسية'}
                          {template.template_category === 'products' && 'منتجات'}
                          {template.template_category === 'info' && 'معلومات'}
                          {template.template_category === 'contact' && 'اتصال'}
                          {template.template_category === 'general' && 'عام'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        4.8
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span>{template.usage_count} استخدام</span>
                      <span>مجاني</span>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        معاينة
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Download className="h-3 w-3 mr-1" />
                        استخدام
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}