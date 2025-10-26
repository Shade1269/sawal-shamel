import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getFirebaseFirestore } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const useAutoMigration = () => {
  const { user } = useSupabaseAuth();
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'checking' | 'migrating' | 'completed' | 'error'>('idle');

  useEffect(() => {
    if (user) {
      checkAndMigrate();
    }
  }, [user]);

  const checkAndMigrate = async () => {
    if (!user) return;

    try {
      setMigrationStatus('checking');
      
      // Check if user already exists in Firestore
      const db = await getFirebaseFirestore();
      const userDocRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists() && userDoc.data()?.source !== 'supabase-migration') {
        setMigrationStatus('completed');
        return;
      }

      // Check if user exists in Supabase and needs migration
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`auth_user_id.eq.${user.id},phone.eq.${user.phone || 'null'}`)
        .maybeSingle();

      if (error || !profile) {
        setMigrationStatus('completed');
        return;
      }

      // Perform migration
      setMigrationStatus('migrating');
      
      const uid = user.id;
      const userDocData = {
        uid,
        email: profile.email || null,
        phone: profile.phone || user.phone || null,
        displayName: profile.full_name || user.user_metadata?.full_name || profile.email || profile.phone || 'User',
        photoURL: profile.avatar_url || null,
        role: profile.role || 'affiliate',
        isActive: profile.is_active,
        points: profile.points || 0,
        createdShopsCount: profile.created_shops_count || 0,
        createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
        updatedAt: profile.updated_at ? new Date(profile.updated_at) : new Date(),
        lastActivityAt: profile.last_activity_at ? new Date(profile.last_activity_at) : new Date(),
        whatsapp: profile.whatsapp || null,
        source: 'supabase-migration'
      };

      await setDoc(userDocRef, userDocData, { merge: true });
      
      setMigrationStatus('completed');
      
    } catch (error) {
      console.error('Auto migration error:', error);
      setMigrationStatus('error');
    }
  };

  return { migrationStatus };
};