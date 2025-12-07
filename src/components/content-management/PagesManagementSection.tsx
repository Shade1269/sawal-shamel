import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  FileText, 
  Plus, 
  Search,
  Edit,
  Eye,
  Globe,
  Clock,
  MoreHorizontal,
  Copy,
  Trash2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCustomPages } from '@/hooks/useContentManagement';

export function PagesManagementSection() {
  const { pages, isLoading, createPage, updatePage: _updatePage, publishPage } = useCustomPages();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPage, setNewPage] = useState({
    page_title: '',
    page_slug: '',
    meta_description: '',
    is_homepage: false
  });

  const filteredPages = pages.filter(page => 
    page.page_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.page_slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePage = async () => {
    try {
      await createPage.mutateAsync({
        ...newPage,
        page_content: { sections: [] },
        page_settings: { seo_enabled: true }
      });
      setIsCreateDialogOpen(false);
      setNewPage({
        page_title: '',
        page_slug: '',
        meta_description: '',
        is_homepage: false
      });
    } catch (error) {
      console.error('Error creating page:', error);
    }
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase()
      .replace(/[^\u0600-\u06FF\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Create Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="البحث في الصفحات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              صفحة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>إنشاء صفحة جديدة</DialogTitle>
              <DialogDescription>
                أنشئ صفحة جديدة واختر الإعدادات المناسبة
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان الصفحة</Label>
                <Input
                  id="title"
                  value={newPage.page_title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setNewPage(prev => ({
                      ...prev,
                      page_title: title,
                      page_slug: generateSlug(title)
                    }));
                  }}
                  placeholder="عنوان الصفحة..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">رابط الصفحة</Label>
                <Input
                  id="slug"
                  value={newPage.page_slug}
                  onChange={(e) => setNewPage(prev => ({ ...prev, page_slug: e.target.value }))}
                  placeholder="page-url"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">وصف الصفحة (SEO)</Label>
                <Textarea
                  id="description"
                  value={newPage.meta_description}
                  onChange={(e) => setNewPage(prev => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="وصف مختصر للصفحة..."
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="homepage">تعيين كصفحة رئيسية</Label>
                <Switch
                  id="homepage"
                  checked={newPage.is_homepage}
                  onCheckedChange={(checked) => setNewPage(prev => ({ ...prev, is_homepage: checked }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleCreatePage}
                disabled={!newPage.page_title || createPage.isPending}
                className="w-full"
              >
                {createPage.isPending ? 'جاري الإنشاء...' : 'إنشاء الصفحة'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pages Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-4">
                <div className="h-4 bg-muted-foreground/30 rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPages.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              {searchTerm ? 'لا توجد نتائج' : 'لا توجد صفحات'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 'جرب كلمات بحث مختلفة' : 'ابدأ بإنشاء صفحتك الأولى'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPages.map((page) => (
            <Card key={page.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{page.page_title}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Globe className="h-3 w-3" />
                      /{page.page_slug}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        تحرير
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        معاينة
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        نسخ
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {page.is_published ? (
                      <Badge variant="default" className="gap-1">
                        <Globe className="h-3 w-3" />
                        منشورة
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        مسودة
                      </Badge>
                    )}
                    {page.is_homepage && (
                      <Badge variant="outline">الرئيسية</Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {page.view_count} مشاهدة
                  </span>
                </div>

                {page.meta_description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {page.meta_description}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    تحرير
                  </Button>
                  {!page.is_published && (
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => publishPage.mutate(page.id)}
                      disabled={publishPage.isPending}
                    >
                      <Globe className="h-3 w-3 mr-1" />
                      نشر
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}