import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { 
  Zap, 
  Plus, 
  Settings, 
  Activity, 
  Target,
  Clock,
  Eye,
  MousePointer,
  ShoppingCart,
  UserCheck
} from 'lucide-react';
import { useBehavioralTriggers, BehavioralTrigger } from '@/hooks/useAdvancedMarketing';

export const BehavioralTriggersSection: React.FC = () => {
  const { triggers, createTrigger, updateTrigger, isCreating, isUpdating } = useBehavioralTriggers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<BehavioralTrigger | null>(null);
  const [newTriggerData, setNewTriggerData] = useState({
    trigger_name: '',
    trigger_description: '',
    conditions: {},
    actions: [],
    is_active: false,
  });

  const handleCreateTrigger = async () => {
    try {
      await createTrigger.mutateAsync(newTriggerData);
      setIsDialogOpen(false);
      setNewTriggerData({
        trigger_name: '',
        trigger_description: '',
        conditions: {},
        actions: [],
        is_active: false,
      });
    } catch (error) {
      console.error('Error creating trigger:', error);
    }
  };

  const handleToggleTrigger = async (triggerId: string, isActive: boolean) => {
    try {
      await updateTrigger.mutateAsync({ id: triggerId, is_active: isActive });
    } catch (error) {
      console.error('Error toggling trigger:', error);
    }
  };

  // قوالب المحفزات السلوكية الشائعة
  const triggerTemplates = [
    {
      name: 'السلة المهجورة',
      description: 'إرسال تذكير عند ترك العميل للسلة لأكثر من 30 دقيقة',
      icon: ShoppingCart,
      conditions: {
        event: 'cart_abandoned',
        timeframe: 30,
        unit: 'minutes'
      },
      actions: [
        {
          type: 'send_email',
          template: 'abandoned_cart_reminder',
          delay: 0
        }
      ]
    },
    {
      name: 'صفحة المنتج المتكررة',
      description: 'إرسال عرض خاص عند زيارة نفس صفحة المنتج 3 مرات',
      icon: Eye,
      conditions: {
        event: 'page_view',
        page_type: 'product',
        count: 3,
        timeframe: 24,
        unit: 'hours'
      },
      actions: [
        {
          type: 'show_discount_popup',
          discount_percentage: 10
        }
      ]
    },
    {
      name: 'عميل جديد',
      description: 'ترحيب بالعميل الجديد وإرسال سلسلة ترحيبية',
      icon: UserCheck,
      conditions: {
        event: 'user_registered',
        first_time: true
      },
      actions: [
        {
          type: 'send_welcome_series',
          template: 'welcome_sequence'
        }
      ]
    },
    {
      name: 'عدم النشاط',
      description: 'إعادة تفعيل العملاء غير النشطين لأكثر من 30 يوم',
      icon: Clock,
      conditions: {
        event: 'user_inactive',
        timeframe: 30,
        unit: 'days'
      },
      actions: [
        {
          type: 'send_reengagement_email',
          template: 'comeback_offer'
        }
      ]
    }
  ];

  // إحصائيات المحفزات
  const triggerStats = {
    total: triggers.length,
    active: triggers.filter(t => t.is_active).length,
    totalTriggered: triggers.reduce((acc, t) => acc + t.triggered_count, 0),
    averageTriggered: triggers.length > 0 ? Math.round(triggers.reduce((acc, t) => acc + t.triggered_count, 0) / triggers.length) : 0
  };

  const applyTemplate = (template: typeof triggerTemplates[0]) => {
    setNewTriggerData({
      trigger_name: template.name,
      trigger_description: template.description,
      conditions: template.conditions,
      actions: template.actions,
      is_active: false,
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">المحفزات السلوكية</h2>
          <p className="text-muted-foreground">أتمتة الإجراءات بناءً على سلوك العملاء</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إنشاء محفز جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إنشاء محفز سلوكي جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trigger_name">اسم المحفز *</Label>
                  <Input
                    id="trigger_name"
                    value={newTriggerData.trigger_name}
                    onChange={(e) => setNewTriggerData(prev => ({ ...prev, trigger_name: e.target.value }))}
                    placeholder="اسم المحفز السلوكي"
                  />
                </div>
                <div className="space-y-2 flex items-center justify-between">
                  <Label htmlFor="is_active">تفعيل المحفز</Label>
                  <Switch
                    id="is_active"
                    checked={newTriggerData.is_active}
                    onCheckedChange={(checked) => 
                      setNewTriggerData(prev => ({ ...prev, is_active: checked }))
                    }
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="trigger_description">وصف المحفز</Label>
                <Textarea
                  id="trigger_description"
                  value={newTriggerData.trigger_description}
                  onChange={(e) => setNewTriggerData(prev => ({ ...prev, trigger_description: e.target.value }))}
                  placeholder="وصف المحفز والشروط المطلوبة..."
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <Label>شروط التفعيل (JSON)</Label>
                <Textarea
                  value={JSON.stringify(newTriggerData.conditions, null, 2)}
                  onChange={(e) => {
                    try {
                      const conditions = JSON.parse(e.target.value);
                      setNewTriggerData(prev => ({ ...prev, conditions }));
                    } catch (error) {
                      // Handle invalid JSON silently
                    }
                  }}
                  placeholder='{"event": "page_view", "count": 3}'
                  rows={4}
                  className="font-mono"
                />
              </div>

              <div className="space-y-4">
                <Label>الإجراءات المطلوبة (JSON)</Label>
                <Textarea
                  value={JSON.stringify(newTriggerData.actions, null, 2)}
                  onChange={(e) => {
                    try {
                      const actions = JSON.parse(e.target.value);
                      setNewTriggerData(prev => ({ ...prev, actions }));
                    } catch (error) {
                      // Handle invalid JSON silently
                    }
                  }}
                  placeholder='[{"type": "send_email", "template": "welcome"}]'
                  rows={4}
                  className="font-mono"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleCreateTrigger} disabled={isCreating || !newTriggerData.trigger_name}>
                {isCreating ? 'جاري الإنشاء...' : 'إنشاء المحفز'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Trigger Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{triggerStats.total}</p>
            <p className="text-sm text-muted-foreground">إجمالي المحفزات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{triggerStats.active}</p>
            <p className="text-sm text-muted-foreground">محفزات نشطة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{triggerStats.totalTriggered}</p>
            <p className="text-sm text-muted-foreground">إجمالي التفعيلات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{triggerStats.averageTriggered}</p>
            <p className="text-sm text-muted-foreground">متوسط التفعيلات</p>
          </CardContent>
        </Card>
      </div>

      {/* Template Triggers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            قوالب المحفزات الجاهزة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {triggerTemplates.map((template, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <template.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => applyTemplate(template)}
                    >
                      استخدام القالب
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Triggers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            المحفزات السلوكية النشطة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {triggers.map((trigger) => (
              <div key={trigger.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{trigger.trigger_name}</h3>
                      <Badge variant={trigger.is_active ? "default" : "secondary"}>
                        {trigger.is_active ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </div>
                    
                    {trigger.trigger_description && (
                      <p className="text-muted-foreground mb-3">{trigger.trigger_description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span>تم التفعيل: {trigger.triggered_count} مرة</span>
                      </div>
                      {trigger.last_triggered_at && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>آخر تفعيل: {new Date(trigger.last_triggered_at).toLocaleDateString('ar-SA')}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <span>{trigger.actions.length} إجراء مُعرَّف</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={trigger.is_active}
                      onCheckedChange={(checked) => handleToggleTrigger(trigger.id, checked)}
                      disabled={isUpdating}
                    />
                    
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Trigger Conditions & Actions */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2 text-sm">الشروط:</h4>
                    <pre className="text-xs text-muted-foreground overflow-x-auto">
                      {JSON.stringify(trigger.conditions, null, 2)}
                    </pre>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2 text-sm">الإجراءات:</h4>
                    <pre className="text-xs text-muted-foreground overflow-x-auto">
                      {JSON.stringify(trigger.actions, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
            
            {triggers.length === 0 && (
              <div className="text-center py-8">
                <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد محفزات سلوكية</h3>
                <p className="text-muted-foreground mb-4">ابدأ بإنشاء محفزات سلوكية لأتمتة التفاعل مع العملاء</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  إنشاء محفز جديد
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};