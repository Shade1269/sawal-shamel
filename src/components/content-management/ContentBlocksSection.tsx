import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Blocks, 
  Search,
  Copy,
  Star,
  Download,
  Image,
  Type,
  BarChart3,
  Users,
  ShoppingBag,
  Zap
} from 'lucide-react';
import { useContentBlocksLibrary } from '@/hooks/useContentManagement';

const CATEGORY_ICONS = {
  general: Blocks,
  marketing: Zap,
  social_proof: Users,
  media: Image,
  ecommerce: ShoppingBag,
  analytics: BarChart3,
  text: Type
};

export function ContentBlocksSection() {
  const { blocks, isLoading } = useContentBlocksLibrary();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'الكل', count: blocks.length },
    { id: 'marketing', name: 'التسويق', count: blocks.filter(b => b.block_category === 'marketing').length },
    { id: 'social_proof', name: 'الثقة والمصداقية', count: blocks.filter(b => b.block_category === 'social_proof').length },
    { id: 'media', name: 'الوسائط', count: blocks.filter(b => b.block_category === 'media').length },
    { id: 'ecommerce', name: 'التجارة الإلكترونية', count: blocks.filter(b => b.block_category === 'ecommerce').length },
    { id: 'text', name: 'النصوص', count: blocks.filter(b => b.block_category === 'text').length }
  ];

  const filteredBlocks = blocks.filter(block => {
    const matchesSearch = block.block_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (block.block_description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || block.block_category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    return CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || Blocks;
  };

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">مكتبة عناصر المحتوى</h2>
          <p className="text-muted-foreground">استخدم عناصر محتوى جاهزة لتسريع بناء صفحاتك</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="البحث في العناصر..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Categories Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:w-auto lg:flex">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.id === 'all' ? 'general' : category.id);
            return (
              <TabsTrigger key={category.id} value={category.id} className="gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {/* Content Blocks Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-300 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredBlocks.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Blocks className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  {searchTerm ? 'لا توجد نتائج' : 'لا توجد عناصر في هذه الفئة'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? 'جرب كلمات بحث مختلفة' : 'سيتم إضافة المزيد من العناصر قريباً'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBlocks.map((block) => {
                const Icon = getCategoryIcon(block.block_category);
                return (
                  <Card key={block.id} className="group hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base line-clamp-1">{block.block_name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {block.block_category === 'marketing' && 'تسويق'}
                              {block.block_category === 'social_proof' && 'مصداقية'}
                              {block.block_category === 'media' && 'وسائط'}
                              {block.block_category === 'ecommerce' && 'تجارة'}
                              {block.block_category === 'text' && 'نص'}
                              {block.block_category === 'general' && 'عام'}
                            </Badge>
                            {block.is_premium && (
                              <Badge className="bg-gradient-warning text-primary-foreground text-xs">
                                مميز
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {block.block_description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {block.block_description}
                        </p>
                      )}

                      {/* Preview Image */}
                      {block.preview_image_url ? (
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <img 
                            src={block.preview_image_url} 
                            alt={block.block_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video gradient-card-secondary rounded-lg flex items-center justify-center">
                          <Icon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {block.usage_count} استخدام
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          4.9
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1 gap-1">
                          <Copy className="h-3 w-3" />
                          نسخ
                        </Button>
                        <Button size="sm" className="flex-1 gap-1">
                          <Download className="h-3 w-3" />
                          استخدام
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}