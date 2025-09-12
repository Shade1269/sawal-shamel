import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialMetrics } from "@/hooks/useExecutiveAnalytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface FinancialChartsProps {
  financial: FinancialMetrics | null;
  loading: boolean;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

export const FinancialCharts = ({ financial, loading }: FinancialChartsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-muted rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!financial) return null;

  return (
    <div className="space-y-6">
      {/* Monthly Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">الإيرادات الشهرية</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={financial.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: any) => [`${Number(value).toLocaleString('ar-SA')} ريال`, 'الإيراد']}
                labelFormatter={(label) => `الشهر: ${label}`}
              />
              <Bar 
                dataKey="revenue" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">الإيرادات حسب طريقة الدفع</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={financial.revenueByPaymentMethod}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="amount"
                  label={(entry) => `${entry.percentage.toFixed(1)}%`}
                >
                  {financial.revenueByPaymentMethod.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => `${Number(value).toLocaleString('ar-SA')} ريال`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {financial.revenueByPaymentMethod.map((method, index) => (
                <div key={method.method} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="flex-1">{method.method}</span>
                  <span className="font-medium">
                    {method.amount.toLocaleString('ar-SA')} ريال
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Profit Margins */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">هوامش الربح حسب الفئة</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={financial.profitMargins} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis 
                  dataKey="category" 
                  type="category" 
                  tick={{ fontSize: 12 }}
                  width={80}
                />
                <Tooltip 
                  formatter={(value: any) => [`${Number(value).toLocaleString('ar-SA')} ريال`, 'الربح']}
                />
                <Bar 
                  dataKey="profit" 
                  fill="hsl(var(--secondary))" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {financial.profitMargins.map((item) => (
                <div key={item.category} className="flex justify-between items-center text-sm">
                  <span>{item.category}</span>
                  <div className="text-right">
                    <div className="font-medium">
                      {item.profit.toLocaleString('ar-SA')} ريال
                    </div>
                    <div className="text-muted-foreground">
                      هامش {item.margin}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};