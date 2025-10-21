import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Lock, Eye, Activity } from 'lucide-react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useDesignSystem } from '@/hooks/useDesignSystem';

// Enhanced Security Center v3.3
// مركز الأمان المتطور - النسخة الثالثة المحسّنة

interface SecurityMetric {
  id: string;
  name: string;
  status: 'secure' | 'warning' | 'critical';
  score: number;
  description: string;
  lastChecked: string;
}

interface SecurityThreat {
  id: string;
  type: 'intrusion' | 'malware' | 'phishing' | 'ddos';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  resolved: boolean;
}

export const SecurityCenter: React.FC = () => {
  const { patterns, colors } = useDesignSystem();
  
  const [securityMetrics] = useState<SecurityMetric[]>([
    {
      id: '1',
      name: 'Authentication Security',
      status: 'secure',
      score: 95,
      description: 'Multi-factor authentication enabled',
      lastChecked: '2024-12-17 14:30'
    },
    {
      id: '2',
      name: 'Data Encryption',
      status: 'secure',
      score: 98,
      description: 'End-to-end encryption active',
      lastChecked: '2024-12-17 14:25'
    },
    {
      id: '3',
      name: 'Network Security',
      status: 'warning',
      score: 78,
      description: 'Unusual traffic patterns detected',
      lastChecked: '2024-12-17 14:20'
    },
    {
      id: '4',
      name: 'Access Control',
      status: 'secure',
      score: 92,
      description: 'Role-based permissions configured',
      lastChecked: '2024-12-17 14:15'
    }
  ]);

  const [threats] = useState<SecurityThreat[]>([
    {
      id: '1',
      type: 'intrusion',
      severity: 'high',
      description: 'Multiple failed login attempts from unknown IP',
      timestamp: '2024-12-17 13:45',
      resolved: false
    },
    {
      id: '2',
      type: 'ddos',
      severity: 'medium',
      description: 'Elevated traffic from suspicious sources',
      timestamp: '2024-12-17 12:30',
      resolved: true
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'secure':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-success/20 text-success';
      case 'medium':
        return 'bg-warning/20 text-warning';
      case 'high':
        return 'bg-destructive/20 text-destructive';
      case 'critical':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const overallSecurityScore = Math.round(
    securityMetrics.reduce((acc, metric) => acc + metric.score, 0) / securityMetrics.length
  );

  return (
    <div className="space-y-6">
      {/* Overall Security Status */}
      <EnhancedCard variant="gradient" className={`${patterns.card} border-primary/20`}>
        <EnhancedCardHeader>
          <div className="flex items-center justify-between">
            <EnhancedCardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Security Overview
            </EnhancedCardTitle>
            <Badge variant="outline" className="text-lg px-4 py-2">
              Score: {overallSecurityScore}/100
            </Badge>
          </div>
        </EnhancedCardHeader>
        <EnhancedCardContent>
          <div className="space-y-4">
            <Progress value={overallSecurityScore} className="h-3" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-success/10">
                <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                <div className="text-2xl font-bold text-success">
                  {securityMetrics.filter(m => m.status === 'secure').length}
                </div>
                <div className="text-sm text-muted-foreground">Secure</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-warning/10">
                <AlertTriangle className="h-8 w-8 text-warning mx-auto mb-2" />
                <div className="text-2xl font-bold text-warning">
                  {securityMetrics.filter(m => m.status === 'warning').length}
                </div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <div className="text-2xl font-bold text-destructive">
                  {securityMetrics.filter(m => m.status === 'critical').length}
                </div>
                <div className="text-sm text-muted-foreground">Critical</div>
              </div>
            </div>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Metrics */}
        <EnhancedCard>
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Security Metrics
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="space-y-4">
              {securityMetrics.map((metric) => (
                <div key={metric.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(metric.status)}
                    <div>
                      <div className="font-medium">{metric.name}</div>
                      <div className="text-sm text-muted-foreground">{metric.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{metric.score}%</div>
                    <div className="text-xs text-muted-foreground">{metric.lastChecked}</div>
                  </div>
                </div>
              ))}
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Security Threats */}
        <EnhancedCard>
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Security Threats
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="space-y-3">
              {threats.map((threat) => (
                <div key={threat.id} className={`p-3 rounded-lg border ${threat.resolved ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={getSeverityColor(threat.severity)}>
                      {threat.severity.toUpperCase()}
                    </Badge>
                    <div className="text-xs text-muted-foreground">{threat.timestamp}</div>
                  </div>
                  <div className="text-sm mb-2">{threat.description}</div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {threat.type.toUpperCase()}
                    </Badge>
                    {threat.resolved ? (
                      <Badge variant="outline" className="text-success">
                        Resolved
                      </Badge>
                    ) : (
                      <EnhancedButton size="sm" variant="outline">
                        Investigate
                      </EnhancedButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      </div>

      {/* Quick Actions */}
      <EnhancedCard>
        <EnhancedCardHeader>
          <EnhancedCardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security Actions
          </EnhancedCardTitle>
        </EnhancedCardHeader>
        <EnhancedCardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <EnhancedButton variant="outline" className="h-auto p-4 flex-col">
              <Shield className="h-6 w-6 mb-2" />
              <span>Security Scan</span>
            </EnhancedButton>
            <EnhancedButton variant="outline" className="h-auto p-4 flex-col">
              <Lock className="h-6 w-6 mb-2" />
              <span>Update Policies</span>
            </EnhancedButton>
            <EnhancedButton variant="outline" className="h-auto p-4 flex-col">
              <Eye className="h-6 w-6 mb-2" />
              <span>View Logs</span>
            </EnhancedButton>
            <EnhancedButton variant="outline" className="h-auto p-4 flex-col">
              <Activity className="h-6 w-6 mb-2" />
              <span>Generate Report</span>
            </EnhancedButton>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  );
};