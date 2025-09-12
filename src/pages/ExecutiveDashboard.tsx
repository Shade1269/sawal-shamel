import { useState } from "react";
import { useExecutiveAnalytics } from "@/hooks/useExecutiveAnalytics";
import { KPIDashboard } from "@/components/executive/KPIDashboard";
import { FinancialCharts } from "@/components/executive/FinancialCharts";
import { CustomerInsights } from "@/components/executive/CustomerInsights";
import { BusinessInsights } from "@/components/executive/BusinessInsights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  RefreshCw, 
  Download,
  Calendar,
  Filter
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BackButton } from '@/components/ui/back-button';

export default function ExecutiveDashboard() {
  const { kpis, financial, customer, business, loading, error, refetch } = useExecutiveAnalytics();
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  const handleExport = () => {
    // Mock export functionality
    console.log("Exporting dashboard data...");
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-500 mb-2">⚠️</div>
              <p className="text-muted-foreground">حدث خطأ في تحميل البيانات</p>
              <Button onClick={refetch} variant="outline" className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                إعادة المحاولة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              لوحة التحكم التنفيذية
            </h1>
            <p className="text-muted-foreground">
              تحليلات شاملة ومؤشرات الأداء الرئيسية لأعمالك
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">آخر 7 أيام</SelectItem>
              <SelectItem value="30d">آخر 30 يوم</SelectItem>
              <SelectItem value="90d">آخر 90 يوم</SelectItem>
              <SelectItem value="1y">آخر سنة</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            تصدير
          </Button>
          
          <Button variant="outline" onClick={refetch} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>
      </div>

      {/* Status Badges */}
      {!loading && (
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            النظام متصل
          </Badge>
          <Badge variant="outline">
            آخر تحديث: {new Date().toLocaleString('ar-SA')}
          </Badge>
        </div>
      )}

      {/* KPI Overview */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          المؤشرات الرئيسية
        </h2>
        <KPIDashboard kpis={kpis} loading={loading} />
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            التقارير المالية
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            تحليل العملاء
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            رؤى الأعمال
          </TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              التقارير المالية والأداء
            </h3>
            <FinancialCharts financial={financial} loading={loading} />
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              تحليل سلوك العملاء
            </h3>
            <CustomerInsights customer={customer} loading={loading} />
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              رؤى الأعمال والأداء
            </h3>
            <BusinessInsights business={business} loading={loading} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">عرض التقارير المفصلة</div>
                <div className="text-sm text-muted-foreground">تقارير شاملة لكامل النشاط</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">إدارة المنتجات</div>
                <div className="text-sm text-muted-foreground">إضافة وتعديل المنتجات</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">إدارة الطلبات</div>
                <div className="text-sm text-muted-foreground">متابعة ومعالجة الطلبات</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">إعدادات المتجر</div>
                <div className="text-sm text-muted-foreground">تخصيص المتجر والإعدادات</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}