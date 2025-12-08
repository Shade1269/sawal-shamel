import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataQualityDashboard } from '@/components/testing/DataQualityDashboard';
import { UnifiedSystemTester } from '@/components/testing/UnifiedSystemTester';

export default function Testing() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <Tabs defaultValue="quality" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="quality">جودة البيانات</TabsTrigger>
            <TabsTrigger value="system">اختبار النظام</TabsTrigger>
          </TabsList>
          
          <TabsContent value="quality">
            <DataQualityDashboard />
          </TabsContent>
          
          <TabsContent value="system">
            <UnifiedSystemTester />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
