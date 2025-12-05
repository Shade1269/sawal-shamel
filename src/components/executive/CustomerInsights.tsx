import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerAnalytics } from "@/hooks/useExecutiveAnalytics";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Users, TrendingUp, Crown, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CustomerInsightsProps {
  customer: CustomerAnalytics | null;
  loading: boolean;
}

export const CustomerInsights = ({ customer, loading }: CustomerInsightsProps) => {
  if (loading) {
    return (
      <div className="space-y-6">
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

  if (!customer) return null;

  const getSegmentIcon = (segment: string) => {
    if (segment.includes('VIP')) return <Crown className="h-4 w-4 text-warning" />;
    if (segment.includes('متميزون')) return <Star className="h-4 w-4 text-premium" />;
    if (segment.includes('عاديون')) return <Users className="h-4 w-4 text-info" />;
    return <TrendingUp className="h-4 w-4 text-success" />;
  };

  return (
    <div className="space-y-6">
      {/* New Customers Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            اتجاه العملاء الجدد
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={customer.newCustomers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: any) => [`${value} عميل`, 'عملاء جدد']}
                labelFormatter={(label) => `الشهر: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="var(--primary)"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Segments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">شرائح العملاء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customer.customerSegments.map((segment, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {getSegmentIcon(segment.segment)}
                    <div>
                      <p className="font-medium text-sm">{segment.segment}</p>
                      <p className="text-xs text-muted-foreground">
                        {segment.count} عميل
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {segment.value.toLocaleString('ar-SA')} ريال
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {segment.count > 0 ? (segment.value / segment.count).toFixed(0) : 0} ريال/عميل
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">أفضل العملاء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {customer.topCustomers.slice(0, 8).map((customer, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {customer.orders} طلب
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {customer.total.toLocaleString('ar-SA')} ريال
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(customer.total / customer.orders).toFixed(0)} ريال/طلب
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Lifetime Value */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">القيمة الدائمة للعميل حسب المجموعة</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={customer.customerLifetime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="cohort" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: any) => [`${value} ريال`, 'القيمة الدائمة']}
                labelFormatter={(label) => `المجموعة: ${label}`}
              />
              <Bar 
                dataKey="value" 
                fill="var(--primary)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};