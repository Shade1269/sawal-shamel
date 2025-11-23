import React, { useState } from 'react';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { 
  Layout, 
  Monitor, 
  Smartphone, 
  Tablet,
  Eye,
  Settings,
  MapPin,
  Clock,
  Target
} from 'lucide-react';

export interface BannerPosition {
  id: string;
  name: string;
  position: 'header' | 'hero' | 'sidebar' | 'footer' | 'popup' | 'floating' | 'sticky';
  priority: number;
  conditions: {
    pages: string[];
    userTypes: string[];
    deviceTypes: string[];
    timeRange?: {
      start: string;
      end: string;
    };
    displayRules: {
      frequency: 'always' | 'once_per_session' | 'once_per_day' | 'custom';
      maxViews?: number;
      cooldownMinutes?: number;
    };
  };
  responsive: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
  animation: {
    entrance: string;
    exit: string;
    duration: number;
  };
  isActive: boolean;
}

const POSITION_TYPES = [
  {
    id: 'header',
    name: 'أعلى الصفحة',
    description: 'يظهر في أعلى الموقع أسفل القائمة مباشرة',
    icon: Layout,
    preview: 'bg-blue-100 border-t-4 border-blue-500'
  },
  {
    id: 'hero',
    name: 'القسم الرئيسي',
    description: 'يظهر في المنطقة الأولى للصفحة الرئيسية',
    icon: Monitor,
    preview: 'bg-green-100 border-l-4 border-green-500'
  },
  {
    id: 'sidebar',
    name: 'الشريط الجانبي',
    description: 'يظهر في الجانب الأيمن أو الأيسر',
    icon: Layout,
    preview: 'bg-purple-100 border-r-4 border-purple-500'
  },
  {
    id: 'footer',
    name: 'أسفل الصفحة',
    description: 'يظهر في نهاية الصفحة قبل الفوتر',
    icon: Layout,
    preview: 'bg-orange-100 border-b-4 border-orange-500'
  },
  {
    id: 'popup',
    name: 'نافذة منبثقة',
    description: 'يظهر كنافذة منبثقة في وسط الشاشة',
    icon: Target,
    preview: 'bg-red-100 border-4 border-red-500 shadow-lg'
  },
  {
    id: 'floating',
    name: 'عائم',
    description: 'يظهر عائماً في زاوية الشاشة',
    icon: MapPin,
    preview: 'bg-yellow-100 border-4 border-yellow-500 rounded-full'
  },
  {
    id: 'sticky',
    name: 'ثابت عند التمرير',
    description: 'يبقى ظاهراً أثناء تمرير الصفحة',
    icon: Eye,
    preview: 'bg-teal-100 border-2 border-teal-500 shadow-md'
  }
];

const PAGE_TYPES = [
  { id: 'home', name: 'الصفحة الرئيسية' },
  { id: 'products', name: 'صفحة المنتجات' },
  { id: 'product_detail', name: 'تفاصيل المنتج' },
  { id: 'cart', name: 'سلة التسوق' },
  { id: 'checkout', name: 'إتمام الطلب' },
  { id: 'about', name: 'من نحن' },
  { id: 'contact', name: 'اتصل بنا' },
  { id: 'all', name: 'جميع الصفحات' }
];

const USER_TYPES = [
  { id: 'all', name: 'جميع الزوار' },
  { id: 'new', name: 'زوار جدد' },
  { id: 'returning', name: 'زوار متكررون' },
  { id: 'customers', name: 'عملاء مسجلون' },
  { id: 'vip', name: 'عملاء مميزون' }
];

const DEVICE_TYPES = [
  { id: 'mobile', name: 'الهاتف المحمول', icon: Smartphone },
  { id: 'tablet', name: 'الجهاز اللوحي', icon: Tablet },
  { id: 'desktop', name: 'سطح المكتب', icon: Monitor }
];

const ANIMATION_TYPES = [
  { id: 'fade', name: 'ظهور تدريجي' },
  { id: 'slide_down', name: 'انزلاق من الأعلى' },
  { id: 'slide_up', name: 'انزلاق من الأسفل' },
  { id: 'slide_left', name: 'انزلاق من اليسار' },
  { id: 'slide_right', name: 'انزلاق من اليمين' },
  { id: 'zoom', name: 'تكبير' },
  { id: 'bounce', name: 'ارتداد' },
  { id: 'shake', name: 'اهتزاز' }
];

interface BannerPositioningProps {
  bannerId: string;
  currentPosition?: BannerPosition;
  onSave: (position: BannerPosition) => void;
  onCancel?: () => void;
}

export const BannerPositioning: React.FC<BannerPositioningProps> = ({
  bannerId,
  currentPosition,
  onSave,
  onCancel
}) => {
  const [position, setPosition] = useState<BannerPosition>(
    currentPosition || {
      id: bannerId,
      name: '',
      position: 'header',
      priority: 1,
      conditions: {
        pages: ['all'],
        userTypes: ['all'],
        deviceTypes: ['mobile', 'tablet', 'desktop'],
        displayRules: {
          frequency: 'always'
        }
      },
      responsive: {
        mobile: true,
        tablet: true,
        desktop: true
      },
      animation: {
        entrance: 'fade',
        exit: 'fade',
        duration: 500
      },
      isActive: true
    }
  );

  const [activeTab, setActiveTab] = useState('position');

  const updatePosition = (path: string, value: any) => {
    setPosition(prev => {
      const newPosition = { ...prev };
      const keys = path.split('.');
      let current = newPosition as any;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      return newPosition;
    });
  };

  const handleSave = () => {
    if (!position.name.trim()) {
      toast.error('يرجى إدخال اسم للموضع');
      return;
    }
    
    onSave(position);
    toast.success('تم حفظ إعدادات الموضع بنجاح!');
  };

  const selectedPositionType = POSITION_TYPES.find(p => p.id === position.position);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">إعدادات موضع البنر</h3>
          <p className="text-sm text-muted-foreground">
            حدد مكان وطريقة عرض البنر في متجرك
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label>البنر نشط</Label>
          <Switch
            checked={position.isActive}
            onCheckedChange={(checked) => updatePosition('isActive', checked)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                الإعدادات الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>اسم الموضع</Label>
                <input
                  type="text"
                  value={position.name}
                  onChange={(e) => updatePosition('name', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="أدخل اسماً للموضع"
                />
              </div>

              <div>
                <Label>نوع الموضع</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {POSITION_TYPES.map(type => {
                    const Icon = type.icon;
                    return (
                      <div
                        key={type.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          position.position === type.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => updatePosition('position', type.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium">{type.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {type.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label>الأولوية: {position.priority}</Label>
                <Slider
                  value={[position.priority]}
                  onValueChange={([value]) => updatePosition('priority', value)}
                  min={1}
                  max={10}
                  step={1}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  الأولوية الأعلى تظهر أولاً
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Display Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                شروط العرض
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>الصفحات</Label>
                <Select 
                  value={position.conditions.pages[0]} 
                  onValueChange={(value) => updatePosition('conditions.pages', [value])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_TYPES.map(page => (
                      <SelectItem key={page.id} value={page.id}>
                        {page.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>نوع الزوار</Label>
                <Select 
                  value={position.conditions.userTypes[0]} 
                  onValueChange={(value) => updatePosition('conditions.userTypes', [value])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_TYPES.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>الأجهزة المدعومة</Label>
                <div className="flex gap-2 mt-2">
                  {DEVICE_TYPES.map(device => {
                    const Icon = device.icon;
                    const isSelected = position.conditions.deviceTypes.includes(device.id);
                    return (
                      <button
                        key={device.id}
                        onClick={() => {
                          const current = position.conditions.deviceTypes;
                          const updated = isSelected
                            ? current.filter(d => d !== device.id)
                            : [...current, device.id];
                          updatePosition('conditions.deviceTypes', updated);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{device.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label>تكرار العرض</Label>
                <Select 
                  value={position.conditions.displayRules.frequency} 
                  onValueChange={(value) => updatePosition('conditions.displayRules.frequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="always">دائماً</SelectItem>
                    <SelectItem value="once_per_session">مرة واحدة في الجلسة</SelectItem>
                    <SelectItem value="once_per_day">مرة واحدة في اليوم</SelectItem>
                    <SelectItem value="custom">مخصص</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Animation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                إعدادات الحركة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>حركة الدخول</Label>
                <Select 
                  value={position.animation.entrance} 
                  onValueChange={(value) => updatePosition('animation.entrance', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ANIMATION_TYPES.map(animation => (
                      <SelectItem key={animation.id} value={animation.id}>
                        {animation.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>حركة الخروج</Label>
                <Select 
                  value={position.animation.exit} 
                  onValueChange={(value) => updatePosition('animation.exit', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ANIMATION_TYPES.map(animation => (
                      <SelectItem key={animation.id} value={animation.id}>
                        {animation.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>مدة الحركة: {position.animation.duration}ms</Label>
                <Slider
                  value={[position.animation.duration]}
                  onValueChange={([value]) => updatePosition('animation.duration', value)}
                  min={100}
                  max={2000}
                  step={100}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                معاينة الموضع
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded-lg min-h-[400px] relative">
                {/* Mock Website Layout */}
                <div className="bg-card rounded shadow-sm">
                  {/* Header */}
                  <div className="h-12 bg-gray-200 rounded-t flex items-center px-4">
                    <div className="text-sm text-gray-600">شريط التنقل</div>
                  </div>
                  
                  {/* Banner Position Preview */}
                  {position.position === 'header' && (
                    <div className={`h-16 m-2 rounded flex items-center justify-center ${selectedPositionType?.preview}`}>
                      <span className="text-sm font-medium">البنر سيظهر هنا</span>
                    </div>
                  )}
                  
                  {/* Content Area */}
                  <div className="p-4 min-h-[200px] relative">
                    {position.position === 'hero' && (
                      <div className={`h-32 mb-4 rounded flex items-center justify-center ${selectedPositionType?.preview}`}>
                        <span className="text-sm font-medium">البنر سيظهر هنا</span>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-8">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                      
                      {position.position === 'sidebar' && (
                        <div className="col-span-4">
                          <div className={`h-24 rounded flex items-center justify-center ${selectedPositionType?.preview}`}>
                            <span className="text-xs font-medium text-center">البنر سيظهر هنا</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Floating/Popup Banners */}
                    {position.position === 'floating' && (
                      <div className={`absolute bottom-4 left-4 w-16 h-16 rounded-full flex items-center justify-center ${selectedPositionType?.preview}`}>
                        <span className="text-xs font-medium">البنر</span>
                      </div>
                    )}
                    
                    {position.position === 'popup' && (
                      <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                        <div className={`w-64 h-32 rounded-lg flex items-center justify-center ${selectedPositionType?.preview}`}>
                          <span className="text-sm font-medium">البنر سيظهر هنا</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Footer */}
                  {position.position === 'footer' && (
                    <div className={`h-16 m-2 rounded flex items-center justify-center ${selectedPositionType?.preview}`}>
                      <span className="text-sm font-medium">البنر سيظهر هنا</span>
                    </div>
                  )}
                  
                  <div className="h-8 bg-gray-200 rounded-b flex items-center px-4">
                    <div className="text-xs text-gray-600">الفوتر</div>
                  </div>
                </div>
                
                {/* Sticky Banner */}
                {position.position === 'sticky' && (
                  <div className={`absolute top-0 left-0 right-0 h-12 rounded flex items-center justify-center ${selectedPositionType?.preview}`}>
                    <span className="text-sm font-medium">البنر الثابت</span>
                  </div>
                )}
              </div>
              
              {/* Position Info */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">نوع الموضع:</span>
                  <Badge variant="secondary">{selectedPositionType?.name}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">الأولوية:</span>
                  <Badge variant="outline">{position.priority}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">الحالة:</span>
                  <Badge variant={position.isActive ? "default" : "secondary"}>
                    {position.isActive ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
        )}
        <Button onClick={handleSave}>
          حفظ إعدادات الموضع
        </Button>
      </div>
    </div>
  );
};