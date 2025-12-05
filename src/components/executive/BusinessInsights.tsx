import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BusinessInsights as BusinessInsightsData } from "@/hooks/useExecutiveAnalytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Package, Store, TrendingUp, MapPin, Award, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface BusinessInsightsProps {
  business: BusinessInsightsData | null;
  loading: boolean;
}

export const BusinessInsights = ({ business, loading }: BusinessInsightsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
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

  if (!business) return null;

  const maxRevenue = Math.max(...business.performingStores.map(store => store.revenue));
  const maxSales = Math.max(...business.topProducts.map(product => product.sales));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              أفضل المنتجات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {business.topProducts.slice(0, 6).map((product, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {index < 3 ? (
                      <Award className="h-4 w-4 text-warning" />
                    ) : (
                      <span className="text-sm font-medium text-primary">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress 
                        value={(product.sales / maxSales) * 100} 
                        className="flex-1 h-2"
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {product.sales} مبيعة
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {product.revenue.toLocaleString('ar-SA')} ريال
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performing Stores */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              أفضل المتاجر أداءً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {business.performingStores.slice(0, 6).map((store, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {index < 3 ? (
                      <Award className="h-4 w-4 text-warning" />
                    ) : (
                      <span className="text-sm font-medium text-primary">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{store.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress 
                        value={(store.revenue / maxRevenue) * 100} 
                        className="flex-1 h-2"
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {store.orders} طلب
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {store.revenue.toLocaleString('ar-SA')} ريال
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              قنوات المبيعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {business.salesChannels.map((channel, index) => (
                <div key={index} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{channel.channel}</h4>
                    <Badge 
                      variant={channel.growth >= 20 ? "default" : channel.growth >= 10 ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{channel.growth}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Progress value={75} className="flex-1 mr-3 h-2" />
                    <span className="font-semibold text-sm">
                      {channel.revenue.toLocaleString('ar-SA')} ريال
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Regional Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              الأداء الإقليمي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={business.regionalPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="region" 
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(value: any) => [`${Number(value).toLocaleString('ar-SA')} ريال`, 'الإيراد']}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="var(--secondary)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {business.regionalPerformance.map((region, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    {region.region}
                  </span>
                  <div className="text-right">
                    <span className="font-medium">
                      {region.customers} عميل
                    </span>
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