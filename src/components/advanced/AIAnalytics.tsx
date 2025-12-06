import { useState } from 'react';
import { Brain, TrendingUp, Zap, Target, Sparkles, BarChart3 } from 'lucide-react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useDesignSystem } from '@/hooks/useDesignSystem';

// AI Analytics Engine v3.3
// محرك التحليلات الذكية - النسخة الثالثة المحسّنة

interface AIInsight {
  id: string;
  type: 'prediction' | 'anomaly' | 'recommendation' | 'trend';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  timestamp: string;
  actionable: boolean;
}

interface PerformanceMetric {
  name: string;
  current: number;
  predicted: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

const mockData = [
  { month: 'Jan', users: 4000, revenue: 2400, predictions: 4200 },
  { month: 'Feb', users: 3000, revenue: 1398, predictions: 3100 },
  { month: 'Mar', users: 2000, revenue: 9800, predictions: 2200 },
  { month: 'Apr', users: 2780, revenue: 3908, predictions: 2900 },
  { month: 'May', users: 1890, revenue: 4800, predictions: 2000 },
  { month: 'Jun', users: 2390, revenue: 3800, predictions: 2500 },
];

export const AIAnalytics: React.FC = () => {
  const { patterns, colors: _colors } = useDesignSystem();
  
  const [insights, _setInsights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'prediction',
      title: 'Revenue Growth Expected',
      description: 'AI predicts 23% revenue increase in next quarter based on current trends',
      confidence: 87,
      impact: 'high',
      timestamp: '2024-12-17 15:30',
      actionable: true
    },
    {
      id: '2',
      type: 'anomaly',
      title: 'Unusual User Behavior Detected',
      description: 'Significant spike in evening usage patterns detected',
      confidence: 92,
      impact: 'medium',
      timestamp: '2024-12-17 14:45',
      actionable: true
    },
    {
      id: '3',
      type: 'recommendation',
      title: 'Optimize Marketing Spend',
      description: 'Redirect 15% of budget from Channel A to Channel B for better ROI',
      confidence: 78,
      impact: 'high',
      timestamp: '2024-12-17 13:20',
      actionable: true
    },
    {
      id: '4',
      type: 'trend',
      title: 'Mobile Usage Increasing',
      description: 'Mobile traffic has grown 34% over the past month',
      confidence: 95,
      impact: 'medium',
      timestamp: '2024-12-17 12:15',
      actionable: false
    }
  ]);

  const [metrics] = useState<PerformanceMetric[]>([
    { name: 'User Engagement', current: 78, predicted: 85, trend: 'up', change: 7 },
    { name: 'Conversion Rate', current: 3.2, predicted: 3.8, trend: 'up', change: 0.6 },
    { name: 'Churn Rate', current: 12.5, predicted: 9.2, trend: 'down', change: -3.3 },
    { name: 'Customer LTV', current: 450, predicted: 520, trend: 'up', change: 70 }
  ]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction':
        return <TrendingUp className="h-5 w-5" />;
      case 'anomaly':
        return <Zap className="h-5 w-5" />;
      case 'recommendation':
        return <Target className="h-5 w-5" />;
      case 'trend':
        return <BarChart3 className="h-5 w-5" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-destructive/20 text-destructive';
      case 'medium':
        return 'bg-warning/20 text-warning';
      case 'low':
        return 'bg-success/20 text-success';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      case 'stable':
        return '→';
      default:
        return '→';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Overview */}
      <EnhancedCard variant="gradient" className={`${patterns.card} border-primary/20`}>
        <EnhancedCardHeader>
          <EnhancedCardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI Analytics Dashboard
            <Badge variant="outline" className="ml-auto">
              <Sparkles className="h-3 w-3 mr-1" />
              v3.3
            </Badge>
          </EnhancedCardTitle>
        </EnhancedCardHeader>
        <EnhancedCardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-primary/10">
              <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{insights.length}</div>
              <div className="text-sm text-muted-foreground">AI Insights</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-success/10">
              <Target className="h-8 w-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-success">
                {insights.filter(i => i.actionable).length}
              </div>
              <div className="text-sm text-muted-foreground">Actionable</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-warning/10">
              <TrendingUp className="h-8 w-8 text-warning mx-auto mb-2" />
              <div className="text-2xl font-bold text-warning">
                {Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length)}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Confidence</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-premium/10">
              <Zap className="h-8 w-8 text-premium mx-auto mb-2" />
              <div className="text-2xl font-bold text-premium">
                {insights.filter(i => i.impact === 'high').length}
              </div>
              <div className="text-sm text-muted-foreground">High Impact</div>
            </div>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <EnhancedCard>
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Latest AI Insights
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="space-y-4">
              {insights.map((insight) => (
                <div key={insight.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <Badge variant="outline" className="text-xs">
                        {insight.type.toUpperCase()}
                      </Badge>
                    </div>
                    <Badge className={getImpactColor(insight.impact)}>
                      {insight.impact.toUpperCase()}
                    </Badge>
                  </div>
                  <h4 className="font-semibold mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted-foreground">Confidence:</div>
                      <Progress value={insight.confidence} className="w-20 h-2" />
                      <div className="text-xs font-medium">{insight.confidence}%</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{insight.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Performance Predictions */}
        <EnhancedCard>
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Predictions
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="space-y-4">
              {metrics.map((metric, index) => (
                <div key={index} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{metric.name}</h4>
                    <span className="text-2xl">{getTrendIcon(metric.trend)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Current</div>
                      <div className="text-xl font-bold">{metric.current}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Predicted</div>
                      <div className="text-xl font-bold text-primary">{metric.predicted}</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Expected Change:</span>
                      <span className={`font-medium ${metric.change > 0 ? 'text-success' : 'text-destructive'}`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      </div>

      {/* Predictive Charts */}
      <EnhancedCard>
        <EnhancedCardHeader>
          <EnhancedCardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Predictive Analytics
          </EnhancedCardTitle>
        </EnhancedCardHeader>
        <EnhancedCardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-4">User Growth Prediction</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="var(--primary)"
                    strokeWidth={2}
                    name="Actual Users"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predictions" 
                    stroke="var(--primary)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Predicted Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="font-medium mb-4">Revenue Forecast</h4>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="var(--primary)"
                    fill="var(--primary)"
                    fillOpacity={0.3}
                    name="Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  );
};