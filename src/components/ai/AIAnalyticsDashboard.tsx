import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Brain, 
  TrendingUp, 
  Package, 
  Users, 
  Rocket, 
  LineChart,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface AIAnalyticsDashboardProps {
  storeId?: string;
}

const analysisTypes = [
  { id: 'sales_analysis', label: 'تحليل المبيعات', icon: TrendingUp },
  { id: 'product_performance', label: 'أداء المنتجات', icon: Package },
  { id: 'customer_insights', label: 'رؤى العملاء', icon: Users },
  { id: 'growth_recommendations', label: 'توصيات النمو', icon: Rocket },
  { id: 'forecast', label: 'التوقعات', icon: LineChart },
];

export function AIAnalyticsDashboard({ storeId }: AIAnalyticsDashboardProps) {
  const [selectedType, setSelectedType] = useState('sales_analysis');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [dataPoints, setDataPoints] = useState<{ orders: number; products: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-analytics', {
        body: { type: selectedType, storeId }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      setDataPoints(data.dataPoints);
      toast.success('تم إنشاء التحليل بنجاح');
    } catch (error: any) {
      console.error('Error running analysis:', error);
      toast.error(error.message || 'فشل في إنشاء التحليل');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-primary" />
          التحليلات الذكية
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={selectedType} onValueChange={setSelectedType}>
          <TabsList className="grid grid-cols-5 gap-1">
            {analysisTypes.map((type) => (
              <TabsTrigger key={type.id} value={type.id} className="text-xs px-2">
                <type.icon className="h-3 w-3 ml-1" />
                <span className="hidden sm:inline">{type.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {analysisTypes.map((type) => (
            <TabsContent key={type.id} value={type.id} className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <type.icon className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">{type.label}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {type.id === 'sales_analysis' && 'تحليل شامل لأداء المبيعات والإيرادات'}
                  {type.id === 'product_performance' && 'تحليل أداء المنتجات والفئات'}
                  {type.id === 'customer_insights' && 'رؤى حول سلوك العملاء والتفضيلات'}
                  {type.id === 'growth_recommendations' && 'توصيات مخصصة لنمو أعمالك'}
                  {type.id === 'forecast' && 'توقعات المبيعات المستقبلية'}
                </p>
              </div>

              <Button 
                onClick={handleAnalyze} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري التحليل...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 ml-2" />
                    بدء التحليل
                  </>
                )}
              </Button>
            </TabsContent>
          ))}
        </Tabs>

        {dataPoints && (
          <div className="flex gap-4 text-sm">
            <div className="bg-muted px-3 py-1 rounded-full">
              📦 {dataPoints.orders} طلب
            </div>
            <div className="bg-muted px-3 py-1 rounded-full">
              🛍️ {dataPoints.products} منتج
            </div>
          </div>
        )}

        {analysis && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">نتائج التحليل:</span>
              <Button variant="ghost" size="sm" onClick={handleAnalyze}>
                <RefreshCw className="h-4 w-4 ml-1" />
                تحديث
              </Button>
            </div>
            <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap max-h-[400px] overflow-y-auto">
              {analysis}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
