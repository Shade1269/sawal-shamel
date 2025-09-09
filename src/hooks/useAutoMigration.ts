import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getFirebaseFirestore } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const useAutoMigration = () => {
  const { user } = useFirebaseAuth();
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
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists() && userDoc.data()?.source !== 'supabase-migration') {
        setMigrationStatus('completed');
        return;
      }

      // Check if user exists in Supabase and needs migration
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`auth_user_id.eq.${user.uid},phone.eq.${user.phoneNumber}`)
        .single();

      if (error || !profile) {
        setMigrationStatus('completed');
        return;
      }

      // Perform migration
      setMigrationStatus('migrating');
      
      const uid = user.uid;
      const userDocData = {
        uid,
        email: profile.email || null,
        phone: profile.phone || user.phoneNumber || null,
        displayName: profile.full_name || user.displayName || profile.email || profile.phone || 'User',
        photoURL: profile.avatar_url || user.photoURL || null,
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