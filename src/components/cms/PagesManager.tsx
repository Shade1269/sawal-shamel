import React, { useState } from 'react';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Search,
  Home,
  FileText,
  Calendar,
  Archive,
  Copy
} from 'lucide-react';
import { useStorePages, useCreateStorePage, useDeleteStorePage, usePageTemplates } from '@/hooks/useStoreCMS';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface PagesManagerProps {
  storeId: string;
  onEditPage?: (pageId: string) => void;
}

export const PagesManager: React.FC<PagesManagerProps> = ({ storeId, onEditPage }) => {
  const { data: pages, isLoading } = useStorePages(storeId);
  const { data: templates } = usePageTemplates();
  const createPage = useCreateStorePage();
  const deletePage = useDeleteStorePage();

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [newPageData, setNewPageData] = useState({
    title: '',
    slug: '',
    template_id: '',
    status: 'draft' as const
  });

  const filteredPages = pages?.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'مسودة', variant: 'secondary' as const },
      published: { label: 'منشورة', variant: 'default' as const },
      scheduled: { label: 'مجدولة', variant: 'outline' as const },
      archived: { label: 'مؤرشفة', variant: 'error' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      draft: FileText,
      published: Eye,
      scheduled: Calendar,
      archived: Archive
    };
    const IconComponent = icons[status as keyof typeof icons] || FileText;
    return <IconComponent className="w-4 h-4" />;
  };

  const handleCreatePage = async () => {
    if (!newPageData.title || !newPageData.slug) return;

    try {
      await createPage.mutateAsync({
        store_id: storeId,
        title: newPageData.title,
        slug: newPageData.slug,
        template_id: newPageData.template_id || undefined,
        status: newPageData.status,
        content: {},
        sort_order: (pages?.length || 0) + 1
      });

      setShowCreateDialog(false);
      setNewPageData({ title: '', slug: '', template_id: '', status: 'draft' });
    } catch (error) {
      console.error('Error creating page:', error);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الصفحة؟')) {
      try {
        await deletePage.mutateAsync(pageId);
      } catch (error) {
        console.error('Error deleting page:', error);
      }
    }
  };

  const generateSlug = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[\u0600-\u06FF]/g, '') // Remove Arabic characters
      .replace(/[^a-z0-9\s-]/g, '') // Keep only alphanumeric, spaces, and hyphens
      .trim()
      .replace(/\s+/g, '-'); // Replace spaces with hyphens
    
    setNewPageData(prev => ({ ...prev, slug }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة الصفحات</h2>
          <p className="text-muted-foreground">قم بإنشاء وإدارة صفحات متجرك</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          إضافة صفحة جديدة
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="البحث في الصفحات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pages Table */}
      <Card>
        <CardHeader>
          <CardTitle>الصفحات ({filteredPages?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العنوان</TableHead>
                <TableHead>الرابط</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>آخر تحديث</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages?.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {page.is_home_page && <Home className="w-4 h-4 text-primary" />}
                      {getStatusIcon(page.status)}
                      <span className="font-medium">{page.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">/{page.slug}</code>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(page.status)}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(page.updated_at), { 
                      addSuffix: true, 
                      locale: ar 
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditPage?.(page.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePage(page.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!filteredPages?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>لا توجد صفحات بعد</p>
                      <p className="text-sm">ابدأ بإنشاء صفحة جديدة</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Page Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إنشاء صفحة جديدة</DialogTitle>
            <DialogDescription>
              قم بإنشاء صفحة جديدة في متجرك
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="page-title">عنوان الصفحة</Label>
              <Input
                id="page-title"
                value={newPageData.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setNewPageData(prev => ({ ...prev, title }));
                  if (!newPageData.slug) {
                    generateSlug(title);
                  }
                }}
                placeholder="أدخل عنوان الصفحة"
              />
            </div>

            <div>
              <Label htmlFor="page-slug">رابط الصفحة</Label>
              <Input
                id="page-slug"
                value={newPageData.slug}
                onChange={(e) => setNewPageData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="page-url"
                dir="ltr"
              />
            </div>

            <div>
              <Label htmlFor="page-template">القالب</Label>
              <Select
                value={newPageData.template_id}
                onValueChange={(value) => setNewPageData(prev => ({ ...prev, template_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر قالب (اختياري)" />
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

            <div>
              <Label htmlFor="page-status">حالة النشر</Label>
              <Select
                value={newPageData.status}
                onValueChange={(value: any) => setNewPageData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="published">منشورة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={handleCreatePage} 
              disabled={!newPageData.title || !newPageData.slug || createPage.isPending}
            >
              إنشاء الصفحة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};