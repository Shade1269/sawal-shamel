import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  Sparkles, 
  Wand2, 
  ArrowRight,
  Save,
  RefreshCw,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { useSmartForm } from '@/hooks/useAIComponents';
import { useToast } from '@/hooks/use-toast';

interface SmartFormsProps {
  className?: string;
  onSubmit?: (data: any) => void;
  mode?: 'create' | 'edit';
  initialData?: any;
}

export const SmartForms: React.FC<SmartFormsProps> = ({
  className,
  onSubmit,
  mode = 'create',
  initialData
}) => {
  const { toast } = useToast();
  
  const {
    fieldSuggestions,
    validationResults,
    autoCompletedFields,
    getFieldSuggestions,
    validateField,
    autoCompleteField,
    isEnabled
  } = useSmartForm({
    enabled: true,
    autoComplete: true,
    validation: true,
    suggestions: true
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    description: '',
    category: '',
    ...initialData
  });

  const [aiAssistance, setAiAssistance] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // تحديث قيمة الحقل
  const updateField = async (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    if (aiAssistance && value.length >= 2) {
      // الحصول على اقتراحات ذكية
      await getFieldSuggestions(fieldName, value);
      
      // التحقق من صحة البيانات
      await validateField(fieldName, value);
    }
  };

  // إكمال تلقائي للحقل
  const handleAutoComplete = async (fieldName: string) => {
    const currentValue = formData[fieldName];
    if (currentValue.length >= 3) {
      const completed = await autoCompleteField(fieldName, currentValue);
      if (completed && completed !== currentValue) {
        setFormData(prev => ({ ...prev, [fieldName]: completed }));
        toast({
          title: "تم الإكمال التلقائي",
          description: "تم إكمال الحقل بناءً على الذكاء الاصطناعي",
        });
      }
    }
  };

  // تطبيق اقتراح
  const applySuggestion = (fieldName: string, suggestion: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: suggestion }));
    toast({
      title: "تم تطبيق الاقتراح",
      description: `تم تحديث ${fieldName} بالاقتراح المحدد`,
    });
  };

  // التحقق من صحة النموذج
  const isFormValid = () => {
    const requiredFields = ['name', 'email'];
    return requiredFields.every(field => {
      const result = validationResults[field];
      return result ? result.isValid : formData[field].length > 0;
    });
  };

  // إرسال النموذج
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى التأكد من صحة جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // محاكاة إرسال البيانات
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onSubmit?.(formData);
      
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ البيانات باستخدام النظام الذكي",
      });
      
      // إعادة تعيين النموذج إذا كان في وضع الإنشاء
      if (mode === 'create') {
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          description: '',
          category: ''
        });
      }
      
    } catch (error) {
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // رندر حقل ذكي
  const renderSmartField = (
    fieldName: string,
    label: string,
    type: 'text' | 'email' | 'tel' | 'textarea' = 'text',
    required = false
  ) => {
    const value = formData[fieldName];
    const suggestions = fieldSuggestions[fieldName] || [];
    const validation = validationResults[fieldName];
    const isValid = validation ? validation.isValid : true;
    const isFocused = focusedField === fieldName;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={fieldName} className={required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}>
            {label}
          </Label>
          {aiAssistance && value.length >= 3 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleAutoComplete(fieldName)}
              className="text-primary hover:bg-primary/10"
            >
              <Wand2 className="w-3 h-3 mr-1" />
              إكمال تلقائي
            </Button>
          )}
        </div>

        <div className="relative">
          {type === 'textarea' ? (
            <Textarea
              id={fieldName}
              value={value}
              onChange={(e) => updateField(fieldName, e.target.value)}
              onFocus={() => setFocusedField(fieldName)}
              onBlur={() => setFocusedField(null)}
              className={!isValid ? 'border-destructive' : ''}
              placeholder={`أدخل ${label}...`}
              rows={4}
            />
          ) : (
            <Input
              id={fieldName}
              type={type}
              value={value}
              onChange={(e) => updateField(fieldName, e.target.value)}
              onFocus={() => setFocusedField(fieldName)}
              onBlur={() => setFocusedField(null)}
              className={!isValid ? 'border-destructive' : ''}
              placeholder={`أدخل ${label}...`}
            />
          )}

          {/* مؤشر الحالة */}
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {validation && (
              validation.isValid ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-destructive" />
              )
            )}
          </div>
        </div>

        {/* رسالة التحقق */}
        {validation && !validation.isValid && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {validation.message}
          </p>
        )}

        {/* الاقتراحات الذكية */}
        {showSuggestions && isFocused && suggestions.length > 0 && (
          <div className="bg-background border rounded-lg shadow-lg p-2 space-y-1 z-10">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Brain className="w-3 h-3" />
              اقتراحات ذكية
            </div>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => applySuggestion(fieldName, suggestion)}
                className="w-full text-right p-2 hover:bg-muted rounded text-sm transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">النماذج الذكية</h2>
          <p className="text-muted-foreground">نماذج مدعومة بالذكاء الاصطناعي مع التحقق التلقائي</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="ai-assistance"
              checked={aiAssistance}
              onCheckedChange={setAiAssistance}
            />
            <Label htmlFor="ai-assistance" className="text-sm">مساعد ذكي</Label>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              id="show-suggestions"
              checked={showSuggestions}
              onCheckedChange={setShowSuggestions}
            />
            <Label htmlFor="show-suggestions" className="text-sm">اقتراحات</Label>
          </div>
        </div>
      </div>

      {/* AI Status Indicator */}
      {aiAssistance && (
        <EnhancedCard variant="gradient" className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div>
                <p className="font-semibold text-primary">المساعد الذكي مفعل</p>
                <p className="text-sm text-muted-foreground">
                  سيتم تقديم اقتراحات ذكية والتحقق التلقائي من البيانات
                </p>
              </div>
            </div>
          </CardContent>
        </EnhancedCard>
      )}

      {/* Smart Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <EnhancedCard variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                المعلومات الأساسية
              </CardTitle>
              <CardDescription>
                المعلومات الشخصية والتواصل
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderSmartField('name', 'الاسم الكامل', 'text', true)}
              {renderSmartField('email', 'البريد الإلكتروني', 'email', true)}
              {renderSmartField('phone', 'رقم الهاتف', 'tel')}
            </CardContent>
          </EnhancedCard>

          {/* Additional Information */}
          <EnhancedCard variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                معلومات إضافية
              </CardTitle>
              <CardDescription>
                تفاصيل الشركة والوصف
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderSmartField('company', 'الشركة')}
              
              <div className="space-y-2">
                <Label htmlFor="category">الفئة</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => updateField('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">أعمال</SelectItem>
                    <SelectItem value="technology">تكنولوجيا</SelectItem>
                    <SelectItem value="education">تعليم</SelectItem>
                    <SelectItem value="healthcare">رعاية صحية</SelectItem>
                    <SelectItem value="retail">تجارة تجزئة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </EnhancedCard>
        </div>

        {/* Description */}
        <EnhancedCard variant="glass">
          <CardHeader>
            <CardTitle>الوصف التفصيلي</CardTitle>
            <CardDescription>
              وصف شامل للمشروع أو المتطلبات
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderSmartField('description', 'الوصف', 'textarea')}
          </CardContent>
        </EnhancedCard>

        {/* Form Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isFormValid() ? (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                النموذج صحيح
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertTriangle className="w-3 h-3 mr-1" />
                يحتاج مراجعة
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  company: '',
                  description: '',
                  category: ''
                });
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              إعادة تعيين
            </Button>
            
            <Button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className="gradient-btn-accent"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {mode === 'create' ? 'إنشاء جديد' : 'حفظ التعديلات'}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SmartForms;