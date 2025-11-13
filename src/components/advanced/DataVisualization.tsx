import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart as PieIcon,
  Activity,
  Users,
  ShoppingCart,
  DollarSign,
  Download,
  RefreshCw,
  Eye,
  Maximize2
} from 'lucide-react';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { AnimatedCounter } from '@/components/interactive/AnimatedCounter';

interface DataVisualizationProps {
  data?: any;
  className?: string;
  showControls?: boolean;
  interactive?: boolean;
}

interface ChartData {
  name: string;
  value: number;
  trend?: number;
  color?: string;
}

const COLORS = ['var(--primary)', 'var(--accent)', 'var(--muted)', 'var(--secondary)'];

export const DataVisualization: React.FC<DataVisualizationProps> = ({
  data,
  className,
  showControls = true,
  interactive = true
}) => {
  const [selectedChart, setSelectedChart] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');

  // Sample data للعرض التوضيحي
  const sampleData = useMemo(() => ({
    salesTrend: [
      { name: 'يناير', sales: 4000, orders: 240, users: 400 },
      { name: 'فبراير', sales: 3000, orders: 139, users: 300 },
      { name: 'مارس', sales: 5000, orders: 280, users: 500 },
      { name: 'أبريل', sales: 2780, orders: 390, users: 278 },
      { name: 'مايو', sales: 1890, orders: 480, users: 189 },
      { name: 'يونيو', sales: 2390, orders: 380, users: 239 },
    ],
    categoryData: [
      { name: 'إلكترونيات', value: 400, color: COLORS[0] },
      { name: 'أزياء', value: 300, color: COLORS[1] },
      { name: 'منزل وحديقة', value: 200, color: COLORS[2] },
      { name: 'رياضة', value: 100, color: COLORS[3] }
    ],
    kpiData: [
      { name: 'المبيعات', value: 45231, trend: 12.5, icon: DollarSign, color: 'text-green-600' },
      { name: 'الطلبات', value: 1234, trend: -2.3, icon: ShoppingCart, color: 'text-blue-600' },
      { name: 'المستخدمين', value: 8965, trend: 8.1, icon: Users, color: 'text-purple-600' },
      { name: 'التحويلات', value: 234, trend: 5.7, icon: Activity, color: 'text-orange-600' }
    ],
    performanceData: [
      { name: 'الأداء', value: 85, fullMark: 100 },
      { name: 'الجودة', value: 92, fullMark: 100 },
      { name: 'السرعة', value: 78, fullMark: 100 },
      { name: 'الموثوقية', value: 88, fullMark: 100 }
    ]
  }), []);

  const exportData = (format: 'csv' | 'json' = 'csv') => {
    const exportData = data || sampleData;
    
    if (format === 'csv') {
      const csvContent = Object.entries(exportData.salesTrend || [])
        .map(([_, row]: [string, any]) => Object.values(row).join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const currentData = data || sampleData;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      {showControls && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">تصور البيانات المتقدم</h2>
            <p className="text-muted-foreground">لوحات بيانات تفاعلية وذكية</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
              <Download className="w-4 h-4 mr-2" />
              CSV تصدير
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportData('json')}>
              <Download className="w-4 h-4 mr-2" />
              JSON تصدير
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              تحديث
            </Button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentData.kpiData.map((kpi, index) => {
          const IconComponent = kpi.icon;
          return (
            <EnhancedCard key={index} variant="gradient" hover="glow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{kpi.name}</p>
                    <div className="text-2xl font-bold">
                      <AnimatedCounter
                        to={kpi.value}
                        duration={1000}
                        variant="luxury"
                      />
                    </div>
                    <div className={`flex items-center text-sm ${kpi.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.trend > 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {Math.abs(kpi.trend)}% هذا الشهر
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full bg-gradient-subtle flex items-center justify-center ${kpi.color}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </EnhancedCard>
          );
        })}
      </div>

      {/* Interactive Charts */}
      <Tabs value={selectedChart} onValueChange={setSelectedChart} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="sales">المبيعات</TabsTrigger>
          <TabsTrigger value="categories">الفئات</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend */}
            <EnhancedCard variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  اتجاه المبيعات
                </CardTitle>
                <CardDescription>المبيعات والطلبات الشهرية</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={currentData.salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(label) => `شهر ${label}`}
                      formatter={(value, name) => [
                        name === 'sales' ? `${value} ريال` : `${value} ${name === 'orders' ? 'طلب' : 'مستخدم'}`,
                        name === 'sales' ? 'المبيعات' : name === 'orders' ? 'الطلبات' : 'المستخدمين'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stackId="1"
                      stroke="var(--primary)"
                      fill="var(--primary)"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="orders"
                      stackId="2"
                      stroke="var(--accent)"
                      fill="var(--accent)"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </EnhancedCard>

            {/* Category Distribution */}
            <EnhancedCard variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieIcon className="w-5 h-5" />
                  توزيع الفئات
                </CardTitle>
                <CardDescription>توزيع المبيعات حسب الفئة</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={currentData.categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={(entry) => `${entry.name}: ${entry.value}`}
                    >
                      {currentData.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </EnhancedCard>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <EnhancedCard variant="glass">
            <CardHeader>
              <CardTitle>تفاصيل المبيعات المتقدمة</CardTitle>
              <CardDescription>تحليل مفصل للمبيعات مع مؤشرات الأداء</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={currentData.salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    dot={{ fill: 'var(--primary)', strokeWidth: 2, r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </EnhancedCard>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EnhancedCard variant="glass">
              <CardHeader>
                <CardTitle>مقارنة الفئات</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={currentData.categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </EnhancedCard>

            <EnhancedCard variant="glass">
              <CardHeader>
                <CardTitle>إحصائيات الفئات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentData.categoryData.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <Badge variant="secondary">
                      {category.value} مبيعة
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </EnhancedCard>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <EnhancedCard variant="glass">
            <CardHeader>
              <CardTitle>مؤشرات الأداء</CardTitle>
              <CardDescription>تقييم شامل للأداء العام</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={currentData.performanceData}>
                  <RadialBar
                    label={{ position: 'insideStart', fill: '#fff' }}
                    background
                    dataKey="value"
                    fill="var(--primary)"
                  />
                  <Legend iconSize={18} wrapperStyle={{ top: 0, left: 350, transform: 'translate(0, -50%)' }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </CardContent>
          </EnhancedCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataVisualization;