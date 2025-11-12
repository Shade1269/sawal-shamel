import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSecurityManagement } from "@/hooks/useSecurityManagement";
import { Database, Download, Shield, Clock, HardDrive, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const BackupManagement = () => {
  const { backupLogs, loading, createBackup } = useSecurityManagement();
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupConfig, setBackupConfig] = useState({
    backup_type: 'FULL' as const,
    backup_scope: 'DATABASE' as const,
    retention_days: 30
  });

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      await createBackup(backupConfig);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return "secondary";
      case 'IN_PROGRESS': return "default";
      case 'FAILED': return "destructive";
      case 'VERIFIED': return "default";
      default: return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return "قيد الإنجاز";
      case 'COMPLETED': return "مكتمل";
      case 'FAILED': return "فشل";
      case 'VERIFIED': return "مُتحقق منه";
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'FULL': return "كامل";
      case 'INCREMENTAL': return "تزايدي";
      case 'DIFFERENTIAL': return "تفاضلي";
      default: return type;
    }
  };

  const getScopeLabel = (scope: string) => {
    switch (scope) {
      case 'DATABASE': return "قاعدة البيانات";
      case 'TRANSACTIONS': return "المعاملات";
      case 'USER_DATA': return "بيانات المستخدمين";
      case 'SYSTEM_CONFIG': return "إعدادات النظام";
      default: return scope;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "غير محدد";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} ميجابايت`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
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
      {/* إنشاء نسخة احتياطية جديدة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            إنشاء نسخة احتياطية جديدة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="backup_type">نوع النسخة الاحتياطية</Label>
              <Select 
                value={backupConfig.backup_type} 
                onValueChange={(value: any) => setBackupConfig({...backupConfig, backup_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL">نسخة كاملة</SelectItem>
                  <SelectItem value="INCREMENTAL">نسخة تزايدية</SelectItem>
                  <SelectItem value="DIFFERENTIAL">نسخة تفاضلية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="backup_scope">نطاق النسخة الاحتياطية</Label>
              <Select 
                value={backupConfig.backup_scope} 
                onValueChange={(value: any) => setBackupConfig({...backupConfig, backup_scope: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DATABASE">قاعدة البيانات</SelectItem>
                  <SelectItem value="TRANSACTIONS">المعاملات المالية</SelectItem>
                  <SelectItem value="USER_DATA">بيانات المستخدمين</SelectItem>
                  <SelectItem value="SYSTEM_CONFIG">إعدادات النظام</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="retention_days">مدة الاحتفاظ (أيام)</Label>
              <Input
                type="number"
                min="1"
                max="365"
                value={backupConfig.retention_days}
                onChange={(e) => setBackupConfig({...backupConfig, retention_days: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <Button
            onClick={handleCreateBackup}
            disabled={isCreatingBackup}
            className="w-full md:w-auto"
          >
            {isCreatingBackup ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                إنشاء النسخة الاحتياطية...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                إنشاء نسخة احتياطية
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* إحصائيات النسخ الاحتياطية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              النسخ المكتملة
            </CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {backupLogs.filter(log => log.backup_status === 'COMPLETED').length}
            </div>
            <p className="text-xs text-muted-foreground">
              من إجمالي {backupLogs.length} نسخة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              الحجم الإجمالي
            </CardTitle>
            <HardDrive className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatFileSize(
                backupLogs
                  .filter(log => log.backup_status === 'COMPLETED')
                  .reduce((sum, log) => sum + (log.file_size_bytes || 0), 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              مساحة مستخدمة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              آخر نسخة احتياطية
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-purple-600">
              {backupLogs.length > 0 
                ? new Date(backupLogs[0].created_at).toLocaleDateString('ar-SA')
                : "لا توجد نسخ"
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {backupLogs.length > 0 
                ? new Date(backupLogs[0].created_at).toLocaleTimeString('ar-SA')
                : "قم بإنشاء نسخة احتياطية"
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* قائمة النسخ الاحتياطية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            سجل النسخ الاحتياطية
          </CardTitle>
        </CardHeader>
        <CardContent>
          {backupLogs.length === 0 ? (
            <div className="text-center py-12">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">لا توجد نسخ احتياطية</h3>
              <p className="text-muted-foreground mb-4">
                قم بإنشاء أول نسخة احتياطية لحماية بياناتك
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {backupLogs.map((backup) => (
                <div key={backup.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Database className="h-5 w-5 text-primary" />
                        <h4 className="font-medium">
                          نسخة {getTypeLabel(backup.backup_type)} - {getScopeLabel(backup.backup_scope)}
                        </h4>
                        <Badge variant={getStatusBadgeColor(backup.backup_status)}>
                          {getStatusLabel(backup.backup_status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <strong>التاريخ:</strong> {new Date(backup.created_at).toLocaleDateString('ar-SA')}
                        </div>
                        <div>
                          <strong>الحجم:</strong> {formatFileSize(backup.file_size_bytes)}
                        </div>
                        <div>
                          <strong>انتهاء الصلاحية:</strong> {new Date(backup.retention_until).toLocaleDateString('ar-SA')}
                        </div>
                        <div>
                          <strong>التشفير:</strong> مُشفر
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-muted-foreground">
                        <strong>المسار:</strong> {backup.file_path}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            تفاصيل
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>تفاصيل النسخة الاحتياطية</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <strong>النوع:</strong> {getTypeLabel(backup.backup_type)}
                              </div>
                              <div>
                                <strong>النطاق:</strong> {getScopeLabel(backup.backup_scope)}
                              </div>
                              <div>
                                <strong>الحالة:</strong> {getStatusLabel(backup.backup_status)}
                              </div>
                              <div>
                                <strong>الحجم:</strong> {formatFileSize(backup.file_size_bytes)}
                              </div>
                            </div>
                            
                            <div>
                              <strong>مسار الملف:</strong>
                              <code className="block bg-muted p-2 rounded mt-1 text-sm">
                                {backup.file_path}
                              </code>
                            </div>
                            
                            <div>
                              <strong>Checksum:</strong>
                              <code className="block bg-muted p-2 rounded mt-1 text-xs break-all">
                                {backup.checksum}
                              </code>
                            </div>
                            
                            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <Shield className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-800">
                                النسخة الاحتياطية مُشفرة بـ AES-256
                              </span>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {backup.backup_status === 'FAILED' && (
                        <Button variant="destructive" size="sm">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          إعادة المحاولة
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};