import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, X, Target } from 'lucide-react';

interface SegmentRule {
  field: string;
  operator: string;
  value: string;
}

export const CustomerSegmentBuilder: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: [] as SegmentRule[],
  });

  const [newRule, setNewRule] = useState<SegmentRule>({
    field: 'total_orders',
    operator: 'greater_than',
    value: '',
  });

  const fieldOptions = [
    { value: 'total_orders', label: 'إجمالي الطلبات' },
    { value: 'total_spent', label: 'إجمالي المبلغ المدفوع' },
    { value: 'last_order_date', label: 'تاريخ آخر طلب' },
    { value: 'customer_level', label: 'مستوى العضوية' },
    { value: 'registration_date', label: 'تاريخ التسجيل' },
    { value: 'city', label: 'المدينة' },
  ];

  const operatorOptions = [
    { value: 'greater_than', label: 'أكبر من' },
    { value: 'less_than', label: 'أقل من' },
    { value: 'equals', label: 'يساوي' },
    { value: 'contains', label: 'يحتوي على' },
    { value: 'not_equals', label: 'لا يساوي' },
    { value: 'between', label: 'بين' },
  ];

  const addRule = () => {
    if (newRule.field && newRule.operator && newRule.value) {
      setFormData(prev => ({
        ...prev,
        rules: [...prev.rules, newRule]
      }));
      setNewRule({
        field: 'total_orders',
        operator: 'greater_than',
        value: '',
      });
    }
  };

  const removeRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.rules.length === 0) {
      alert('يجب إضافة قاعدة واحدة على الأقل لإنشاء الشريحة');
      return;
    }
    
    console.log('Creating customer segment:', formData);
    // Here you would typically call an API to create the segment
  };

  const getFieldLabel = (field: string) => {
    return fieldOptions.find(opt => opt.value === field)?.label || field;
  };

  const getOperatorLabel = (operator: string) => {
    return operatorOptions.find(opt => opt.value === operator)?.label || operator;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center gap-2 justify-center">
          <Users className="h-5 w-5 text-primary" />
          بناء شرائح العملاء
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="segment_name">اسم الشريحة</Label>
            <Input
              id="segment_name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="العملاء الذهبيون"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="segment_description">وصف الشريحة</Label>
            <Textarea
              id="segment_description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="وصف خصائص هذه الشريحة من العملاء..."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              قواعد الاستهداف
            </Label>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Select
                value={newRule.field}
                onValueChange={(value) => setNewRule(prev => ({ ...prev, field: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fieldOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={newRule.operator}
                onValueChange={(value) => setNewRule(prev => ({ ...prev, operator: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {operatorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                value={newRule.value}
                onChange={(e) => setNewRule(prev => ({ ...prev, value: e.target.value }))}
                placeholder="القيمة"
              />

              <Button type="button" onClick={addRule} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.rules.length > 0 && (
              <div className="space-y-2">
                <Label>القواعد المضافة:</Label>
                <div className="space-y-2">
                  {formData.rules.map((rule, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">{getFieldLabel(rule.field)}</Badge>
                        <span className="text-muted-foreground">{getOperatorLabel(rule.operator)}</span>
                        <Badge variant="secondary">{rule.value}</Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRule(index)}
                        className="h-6 w-6 p-0 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={formData.rules.length === 0}
              className="flex-1"
            >
              إنشاء شريحة العملاء
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setFormData({
                  name: '',
                  description: '',
                  rules: [],
                });
                setNewRule({
                  field: 'total_orders',
                  operator: 'greater_than',
                  value: '',
                });
              }}
            >
              إعادة تعيين
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};