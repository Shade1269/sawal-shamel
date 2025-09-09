import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getFirebaseFirestore } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

const MigrateToFirestore: React.FC = () => {
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ total: number; success: number; failed: number }>({ total: 0, success: 0, failed: 0 });
  const [logs, setLogs] = useState<string[]>([]);

  const log = (msg: string) => setLogs(prev => [msg, ...prev].slice(0, 200));

  const startMigration = async () => {
    try {
      setRunning(true);
      setProgress({ total: 0, success: 0, failed: 0 });
      setLogs([]);

      log('Fetching profiles from Supabase...');
      const { data: profiles, error } = await supabase.from('profiles').select('*');
      if (error) throw error;

      const total = profiles?.length || 0;
      setProgress(p => ({ ...p, total }));
      log(`Found ${total} profiles`);

      const db = await getFirebaseFirestore();

      let success = 0;
      let failed = 0;

      for (const p of profiles || []) {
        try {
          const uid = p.auth_user_id || p.id;
          const userDoc = {
            uid,
            email: p.email || null,
            phone: p.phone || null,
            displayName: p.full_name || p.email || p.phone || 'User',
            photoURL: p.avatar_url || null,
            role: p.role || 'affiliate',
            isActive: p.is_active,
            points: p.points || 0,
            createdShopsCount: p.created_shops_count || 0,
            createdAt: p.created_at ? new Date(p.created_at) : new Date(),
            updatedAt: p.updated_at ? new Date(p.updated_at) : new Date(),
            lastActivityAt: p.last_activity_at ? new Date(p.last_activity_at) : new Date(),
            whatsapp: p.whatsapp || null,
            source: 'supabase-migration'
          };

          await setDoc(doc(db, 'users', uid), userDoc, { merge: true });
          success++;
          setProgress(p => ({ ...p, success }));
        } catch (e: any) {
          failed++;
          setProgress(p => ({ ...p, failed }));
          log(`Failed to migrate profile: ${p.id} - ${e.message}`);
        }
      }

      toast({ title: 'تمت الترحيل', description: `نجاح: ${success}, فشل: ${failed}` });
      log('Migration completed');
    } catch (e: any) {
      console.error(e);
      toast({ title: 'خطأ في الترحيل', description: e.message, variant: 'destructive' });
      log(`Migration error: ${e.message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>ترحيل البيانات من Supabase إلى Firestore</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">سينقل هذا السكربت بيانات المستخدمين (profiles) إلى مجموعة users في Firestore.</p>
          <Button disabled={running} onClick={startMigration} className="w-full">
            {running ? 'جاري الترحيل...' : 'ابدأ الترحيل الآن'}
          </Button>
          <div className="text-sm">
            <p>إجمالي: {progress.total} | نجاح: {progress.success} | فشل: {progress.failed}</p>
          </div>
          <div className="h-56 overflow-auto rounded-md bg-muted p-3 text-xs">
            {logs.map((l, i) => (
              <div key={i} className="mb-1">
                {l}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MigrateToFirestore;