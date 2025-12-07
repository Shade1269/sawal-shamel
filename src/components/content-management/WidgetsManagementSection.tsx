import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Blocks, 
  Plus, 
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Image,
  Type,
  Video,
  BarChart3,
  ShoppingBag,
  Users
} from 'lucide-react';
import { useContentWidgets } from '@/hooks/useContentManagement';
// DnD functionality will be implemented later

const WIDGET_TYPES = [
  { id: 'text', name: 'نص', icon: Type, description: 'عنصر نصي بتنسيق متقدم' },
  { id: 'image', name: 'صورة', icon: Image, description: 'عرض الصور والمعارض' },
  { id: 'video', name: 'فيديو', icon: Video, description: 'تشغيل مقاطع الفيديو' },
  { id: 'products', name: 'منتجات', icon: ShoppingBag, description: 'عرض المنتجات' },
  { id: 'testimonials', name: 'آراء العملاء', icon: Users, description: 'عرض تقييمات العملاء' },
  { id: 'stats', name: 'إحصائيات', icon: BarChart3, description: 'عرض الأرقام والبيانات' }
];

export function WidgetsManagementSection() {
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const { widgets, isLoading, createWidget, updateWidget, deleteWidget } = useContentWidgets(selectedPageId);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newWidget, setNewWidget] = useState({
    widget_name: '',
    widget_type: '',
    section_id: 'main',
    is_visible: true
  });

  // Mock pages - في الواقع سيتم جلبها من useCustomPages
  const mockPages = [
    { id: '1', page_title: 'الصفحة الرئيسية', page_slug: 'home' },
    { id: '2', page_title: 'من نحن', page_slug: 'about' },
    { id: '3', page_title: 'المنتجات', page_slug: 'products' }
  ];

  const filteredWidgets = widgets.filter(widget => 
    widget.widget_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    widget.widget_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateWidget = async () => {
    if (!selectedPageId || !newWidget.widget_type) return;

    try {
      await createWidget.mutateAsync({
        ...newWidget,
        page_id: selectedPageId,
        widget_config: {},
        widget_data: {},
        sort_order: widgets.length
      });
      setIsCreateDialogOpen(false);
      setNewWidget({
        widget_name: '',
        widget_type: '',
        section_id: 'main',
        is_visible: true
      });
    } catch (error) {
      console.error('Error creating widget:', error);
    }
  };

  // Drag and drop functionality will be implemented later

  const getWidgetIcon = (type: string) => {
    const widgetType = WIDGET_TYPES.find(t => t.id === type);
    return widgetType ? widgetType.icon : Blocks;
  };

  return (
    <div className="space-y-6">
      {/* Header with Page Selection */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold">إدارة عناصر المحتوى</h2>
          <p className="text-muted-foreground">أضف وحرر عناصر المحتوى في صفحاتك</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="w-full sm:w-64">
              <Select value={selectedPageId} onValueChange={setSelectedPageId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الصفحة" />
                </SelectTrigger>
                <SelectContent>
                  {mockPages.map((page) => (
                    <SelectItem key={page.id} value={page.id}>
                      {page.page_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedPageId && (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="البحث في العناصر..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            )}
          </div>

          {selectedPageId && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  إضافة عنصر
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>إضافة عنصر جديد</DialogTitle>
                  <DialogDescription>
                    اختر نوع العنصر والإعدادات المناسبة
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="widget-name">اسم العنصر</Label>
                    <Input
                      id="widget-name"
                      value={newWidget.widget_name}
                      onChange={(e) => setNewWidget(prev => ({ ...prev, widget_name: e.target.value }))}
                      placeholder="اسم العنصر..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>نوع العنصر</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {WIDGET_TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.id}
                            onClick={() => setNewWidget(prev => ({ 
                              ...prev, 
                              widget_type: type.id,
                              widget_name: prev.widget_name || type.name
                            }))}
                            className={`p-3 border rounded-lg text-left transition-colors ${
                              newWidget.widget_type === type.id 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <Icon className="h-5 w-5 mb-1" />
                            <div className="text-sm font-medium">{type.name}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="section">القسم</Label>
                    <Select value={newWidget.section_id} onValueChange={(value) => setNewWidget(prev => ({ ...prev, section_id: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="header">الرأس</SelectItem>
                        <SelectItem value="main">المحتوى الرئيسي</SelectItem>
                        <SelectItem value="sidebar">الشريط الجانبي</SelectItem>
                        <SelectItem value="footer">التذييل</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="visible">مرئي للزوار</Label>
                    <Switch
                      id="visible"
                      checked={newWidget.is_visible}
                      onCheckedChange={(checked) => setNewWidget(prev => ({ ...prev, is_visible: checked }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleCreateWidget}
                    disabled={!newWidget.widget_name || !newWidget.widget_type || createWidget.isPending}
                    className="w-full"
                  >
                    {createWidget.isPending ? 'جاري الإضافة...' : 'إضافة العنصر'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Content */}
      {!selectedPageId ? (
        <Card className="text-center py-12">
          <CardContent>
            <Blocks className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              اختر صفحة للبدء
            </h3>
            <p className="text-sm text-muted-foreground">
              حدد الصفحة التي تريد إضافة أو تحرير العناصر فيها
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-muted-foreground/30 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted-foreground/30 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="h-8 w-16 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredWidgets.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Blocks className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              {searchTerm ? 'لا توجد نتائج' : 'لا توجد عناصر'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 'جرب كلمات بحث مختلفة' : 'ابدأ بإضافة عناصر المحتوى لهذه الصفحة'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredWidgets.map((widget, _index) => {
            const Icon = getWidgetIcon(widget.widget_type);
            return (
              <Card key={widget.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-muted-foreground">
                      <GripVertical className="h-5 w-5" />
                    </div>
                              
                              <div className="flex-shrink-0">
                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                  widget.is_visible ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                }`}>
                                  <Icon className="h-5 w-5" />
                                </div>
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">{widget.widget_name}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {widget.section_id}
                                  </Badge>
                                  {!widget.is_visible && (
                                    <Badge variant="secondary" className="text-xs gap-1">
                                      <EyeOff className="h-3 w-3" />
                                      مخفي
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {WIDGET_TYPES.find(t => t.id === widget.widget_type)?.description}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => updateWidget.mutate({ 
                                    id: widget.id, 
                                    is_visible: !widget.is_visible 
                                  })}
                                >
                                  {widget.is_visible ? (
                                    <Eye className="h-4 w-4" />
                                  ) : (
                                    <EyeOff className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => deleteWidget.mutate(widget.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}