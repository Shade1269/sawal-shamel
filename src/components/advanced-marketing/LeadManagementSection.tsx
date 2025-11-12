import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Edit, 
  Phone, 
  Mail, 
  Building, 
  Tag,
  TrendingUp,
  Activity,
  Star
} from 'lucide-react';
import { useLeadManagement, Lead } from '@/hooks/useAdvancedMarketing';

export const LeadManagementSection: React.FC = () => {
  const { leads, createLead, updateLead, addLeadActivity, isCreating, isUpdating } = useLeadManagement();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newLeadData, setNewLeadData] = useState({
    email: '',
    phone: '',
    full_name: '',
    company: '',
    lead_source: 'website' as Lead['lead_source'],
    lead_status: 'new' as Lead['lead_status'],
    interest_level: 'low' as Lead['interest_level'],
    notes: '',
    tags: [] as string[],
    custom_fields: {},
  });

  const handleCreateLead = async () => {
    try {
      await createLead.mutateAsync(newLeadData);
      setIsDialogOpen(false);
      setNewLeadData({
        email: '',
        phone: '',
        full_name: '',
        company: '',
        lead_source: 'website',
        lead_status: 'new',
        interest_level: 'low',
        notes: '',
        tags: [],
        custom_fields: {},
      });
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, newStatus: Lead['lead_status']) => {
    try {
      await updateLead.mutateAsync({ id: leadId, lead_status: newStatus });
      await addLeadActivity.mutateAsync({
        lead_id: leadId,
        activity_type: 'status_changed',
        activity_description: `تم تغيير حالة العميل إلى: ${getStatusLabel(newStatus)}`,
        activity_data: { old_status: selectedLead?.lead_status, new_status: newStatus }
      });
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const getStatusLabel = (status: Lead['lead_status']) => {
    const labels = {
      new: 'جديد',
      contacted: 'تم التواصل',
      qualified: 'مؤهل',
      converted: 'محول',
      lost: 'فقد'
    };
    return labels[status];
  };

  const getStatusColor = (status: Lead['lead_status']) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      converted: 'bg-purple-100 text-purple-800',
      lost: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const getSourceLabel = (source: Lead['lead_source']) => {
    const labels = {
      website: 'الموقع الإلكتروني',
      social_media: 'وسائل التواصل',
      referral: 'إحالة',
      advertising: 'إعلانات',
      manual: 'يدوي',
      api: 'API'
    };
    return labels[source];
  };

  const getInterestLabel = (level: Lead['interest_level']) => {
    const labels = {
      low: 'منخفض',
      medium: 'متوسط',
      high: 'عالي'
    };
    return labels[level];
  };

  const getInterestColor = (level: Lead['interest_level']) => {
    const colors = {
      low: 'text-muted-foreground',
      medium: 'text-info',
      high: 'text-destructive'
    };
    return colors[level];
  };

  // إحصائيات العملاء المحتملين
  const leadStats = {
    total: leads.length,
    new: leads.filter(l => l.lead_status === 'new').length,
    qualified: leads.filter(l => l.lead_status === 'qualified').length,
    converted: leads.filter(l => l.lead_status === 'converted').length,
    avgScore: leads.length > 0 ? Math.round(leads.reduce((acc, l) => acc + l.lead_score, 0) / leads.length) : 0
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">إدارة العملاء المحتملين</h2>
          <p className="text-muted-foreground">تتبع وإدارة العملاء المحتملين بفعالية</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إضافة عميل محتمل
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إضافة عميل محتمل جديد</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newLeadData.email}
                  onChange={(e) => setNewLeadData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="example@domain.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  value={newLeadData.phone}
                  onChange={(e) => setNewLeadData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+966xxxxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">الاسم الكامل</Label>
                <Input
                  id="full_name"
                  value={newLeadData.full_name}
                  onChange={(e) => setNewLeadData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="الاسم الكامل"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">الشركة</Label>
                <Input
                  id="company"
                  value={newLeadData.company}
                  onChange={(e) => setNewLeadData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="اسم الشركة"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead_source">مصدر العميل</Label>
                <Select 
                  value={newLeadData.lead_source} 
                  onValueChange={(value: Lead['lead_source']) => 
                    setNewLeadData(prev => ({ ...prev, lead_source: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المصدر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">الموقع الإلكتروني</SelectItem>
                    <SelectItem value="social_media">وسائل التواصل</SelectItem>
                    <SelectItem value="referral">إحالة</SelectItem>
                    <SelectItem value="advertising">إعلانات</SelectItem>
                    <SelectItem value="manual">يدوي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interest_level">مستوى الاهتمام</Label>
                <Select 
                  value={newLeadData.interest_level} 
                  onValueChange={(value: Lead['interest_level']) => 
                    setNewLeadData(prev => ({ ...prev, interest_level: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المستوى" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفض</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="high">عالي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={newLeadData.notes}
                  onChange={(e) => setNewLeadData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="ملاحظات حول العميل المحتمل..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleCreateLead} disabled={isCreating || !newLeadData.email}>
                {isCreating ? 'جاري الإضافة...' : 'إضافة العميل'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{leadStats.total}</p>
            <p className="text-sm text-muted-foreground">إجمالي العملاء</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{leadStats.new}</p>
            <p className="text-sm text-muted-foreground">عملاء جدد</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{leadStats.qualified}</p>
            <p className="text-sm text-muted-foreground">عملاء مؤهلون</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{leadStats.converted}</p>
            <p className="text-sm text-muted-foreground">تحويلات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-warning">{leadStats.avgScore}</p>
            <p className="text-sm text-muted-foreground">متوسط النقاط</p>
          </CardContent>
        </Card>
      </div>

      {/* Leads List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            قائمة العملاء المحتملين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leads.map((lead) => (
              <div key={lead.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {lead.full_name || lead.email}
                      </h3>
                      <Badge className={getStatusColor(lead.lead_status)}>
                        {getStatusLabel(lead.lead_status)}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className={`h-4 w-4 ${getInterestColor(lead.interest_level)}`} />
                        <span className={`text-sm ${getInterestColor(lead.interest_level)}`}>
                          {getInterestLabel(lead.interest_level)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {lead.email}
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {lead.phone}
                        </div>
                      )}
                      {lead.company && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {lead.company}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>المصدر: {getSourceLabel(lead.lead_source)}</span>
                      <span>النقاط: {lead.lead_score}</span>
                      <span>آخر نشاط: {new Date(lead.last_activity_at).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select 
                      value={lead.lead_status} 
                      onValueChange={(value: Lead['lead_status']) => 
                        handleUpdateLeadStatus(lead.id, value)
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">جديد</SelectItem>
                        <SelectItem value="contacted">تم التواصل</SelectItem>
                        <SelectItem value="qualified">مؤهل</SelectItem>
                        <SelectItem value="converted">محول</SelectItem>
                        <SelectItem value="lost">فقد</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button variant="outline" size="sm" onClick={() => setSelectedLead(lead)}>
                      <Activity className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {lead.notes && (
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <p className="text-sm">{lead.notes}</p>
                  </div>
                )}
              </div>
            ))}
            
            {leads.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا يوجد عملاء محتملون</h3>
                <p className="text-muted-foreground mb-4">ابدأ بإضافة عملائك المحتملين لتتبع تقدمهم</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة عميل محتمل
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};