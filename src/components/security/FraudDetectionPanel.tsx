import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSecurityManagement } from "@/hooks/useSecurityManagement";
import { AlertTriangle, Shield, Eye, CheckCircle, X, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const FraudDetectionPanel = () => {
  const { fraudAlerts, loading, updateFraudAlertStatus } = useSecurityManagement();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  const filteredAlerts = fraudAlerts.filter(alert => {
    const matchesSearch = !searchTerm || 
      alert.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.alert_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || alert.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getRiskBadgeColor = (score: number) => {
    if (score >= 80) return "destructive";
    if (score >= 60) return "default";
    if (score >= 30) return "secondary";
    return "outline";
  };

  const getRiskLabel = (score: number) => {
    if (score >= 80) return "حرج";
    if (score >= 60) return "عالي";
    if (score >= 30) return "متوسط";
    return "منخفض";
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING': return "default";
      case 'REVIEWING': return "secondary";
      case 'CONFIRMED': return "destructive";
      case 'FALSE_POSITIVE': return "outline";
      case 'RESOLVED': return "secondary";
      default: return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return "في الانتظار";
      case 'REVIEWING': return "قيد المراجعة";
      case 'CONFIRMED': return "مؤكد";
      case 'FALSE_POSITIVE': return "إنذار خاطئ";
      case 'RESOLVED': return "محلول";
      default: return status;
    }
  };

  const handleStatusUpdate = async (alertId: string, newStatus: string) => {
    try {
      await updateFraudAlertStatus(alertId, newStatus, resolutionNotes);
      setSelectedAlert(null);
      setResolutionNotes("");
    } catch (error) {
      console.error('Error updating alert status:', error);
    }
  };

  const getAlertIcon = (riskScore: number) => {
    if (riskScore >= 80) return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (riskScore >= 60) return <AlertTriangle className="h-5 w-5 text-orange-600" />;
    return <Shield className="h-5 w-5 text-yellow-600" />;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-6 bg-muted rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* أدوات البحث والتصفية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            إدارة تنبيهات الاحتيال
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في التنبيهات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="تصفية حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="PENDING">في الانتظار</SelectItem>
                <SelectItem value="REVIEWING">قيد المراجعة</SelectItem>
                <SelectItem value="CONFIRMED">مؤكد</SelectItem>
                <SelectItem value="FALSE_POSITIVE">إنذار خاطئ</SelectItem>
                <SelectItem value="RESOLVED">محلول</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* قائمة التنبيهات */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">لا توجد تنبيهات</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "لا توجد تنبيهات تطابق معايير البحث"
                  : "لا توجد تنبيهات احتيال حالياً"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getAlertIcon(alert.risk_score)}
                      <h4 className="font-medium text-foreground">
                        {alert.alert_type}
                      </h4>
                      <Badge variant={getRiskBadgeColor(alert.risk_score)}>
                        مخاطر {getRiskLabel(alert.risk_score)} ({alert.risk_score}%)
                      </Badge>
                      <Badge variant={getStatusBadgeColor(alert.status)}>
                        {getStatusLabel(alert.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                      {alert.order_id && (
                        <div>
                          <strong>رقم الطلب:</strong> {alert.order_id}
                        </div>
                      )}
                      <div>
                        <strong>التاريخ:</strong> {new Date(alert.created_at).toLocaleDateString('ar-SA')}
                      </div>
                      <div>
                        <strong>الوقت:</strong> {new Date(alert.created_at).toLocaleTimeString('ar-SA')}
                      </div>
                      {alert.metadata?.transaction_data?.amount && (
                        <div>
                          <strong>المبلغ:</strong> {alert.metadata.transaction_data.amount} ريال
                        </div>
                      )}
                    </div>

                    {alert.metadata?.triggered_rules && alert.metadata.triggered_rules.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium mb-1">القوانين المطبقة:</p>
                        <div className="flex flex-wrap gap-1">
                          {alert.metadata.triggered_rules.map((rule: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {rule}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedAlert(alert)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          عرض
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                        <DialogHeader>
                          <DialogTitle>تفاصيل تنبيه الاحتيال</DialogTitle>
                        </DialogHeader>
                        {selectedAlert && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <strong>نوع التنبيه:</strong> {selectedAlert.alert_type}
                              </div>
                              <div>
                                <strong>نقاط المخاطر:</strong> {selectedAlert.risk_score}%
                              </div>
                              <div>
                                <strong>الحالة:</strong> {getStatusLabel(selectedAlert.status)}
                              </div>
                              <div>
                                <strong>التاريخ:</strong> {new Date(selectedAlert.created_at).toLocaleString('ar-SA')}
                              </div>
                            </div>

                            {selectedAlert.metadata && (
                              <div>
                                <h4 className="font-medium mb-2">البيانات التفصيلية:</h4>
                                <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                                  {JSON.stringify(selectedAlert.metadata, null, 2)}
                                </pre>
                              </div>
                            )}

                            {selectedAlert.status === 'PENDING' && (
                              <div className="space-y-4 border-t pt-4">
                                <h4 className="font-medium">اتخاذ إجراء:</h4>
                                <Textarea
                                  placeholder="ملاحظات المراجعة (اختيارية)"
                                  value={resolutionNotes}
                                  onChange={(e) => setResolutionNotes(e.target.value)}
                                />
                                <div className="flex gap-2 flex-wrap">
                                  <Button
                                    onClick={() => handleStatusUpdate(selectedAlert.id, 'CONFIRMED')}
                                    variant="destructive"
                                    size="sm"
                                  >
                                    تأكيد الاحتيال
                                  </Button>
                                  <Button
                                    onClick={() => handleStatusUpdate(selectedAlert.id, 'FALSE_POSITIVE')}
                                    variant="outline"
                                    size="sm"
                                  >
                                    إنذار خاطئ
                                  </Button>
                                  <Button
                                    onClick={() => handleStatusUpdate(selectedAlert.id, 'REVIEWING')}
                                    variant="secondary"
                                    size="sm"
                                  >
                                    قيد المراجعة
                                  </Button>
                                  <Button
                                    onClick={() => handleStatusUpdate(selectedAlert.id, 'RESOLVED')}
                                    variant="default"
                                    size="sm"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    حل المشكلة
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {alert.status === 'PENDING' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleStatusUpdate(alert.id, 'REVIEWING')}
                      >
                        مراجعة
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};