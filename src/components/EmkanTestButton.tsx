import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function EmkanTestButton() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testEmkanAPI = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      console.log("🧪 Starting Emkan API test...");
      
      toast({
        title: "🧪 بدء اختبار إمكان",
        description: "جاري الاتصال بـ API إمكان...",
      });
      
      const { data, error } = await supabase.functions.invoke('test-emkan-payment', {
        body: {}
      });

      console.log("🔍 Test result:", { data, error });
      
      if (error) {
        console.error("❌ Function invoke error:", error);
        throw error;
      }
      
      setResult(data);
      
      if (data?.success) {
        toast({
          title: "✅ اختبار إمكان نجح!",
          description: `الحالة: ${data.status} - تم الاتصال بـ API إمكان بنجاح`,
        });
      } else {
        toast({
          title: "❌ اختبار إمكان فشل",
          description: `خطأ: ${data?.error || `HTTP ${data?.status}`}`,
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error("💥 Test error:", error);
      setResult({ error: error.message });
      toast({
        title: "❌ خطأ في الاختبار",
        description: `خطأ في الشبكة: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">اختبار API إمكان</h3>
      
      <Button 
        onClick={testEmkanAPI}
        disabled={testing}
        className="w-full"
      >
        {testing ? "جاري الاختبار..." : "اختبار اتصال إمكان"}
      </Button>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-semibold mb-2">نتيجة الاختبار:</h4>
          <pre className="text-sm overflow-auto" dir="ltr">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}