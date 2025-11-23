import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ChatChannel, MemberCount } from './types';

/**
 * Custom hook لتحميل عدد الأعضاء في القنوات
 * Loads member counts for channels
 */
export function useChannelMembers(channels: ChatChannel[]) {
  const [memberCounts, setMemberCounts] = useState<MemberCount>({});

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { data, error } = await supabase
          .from('channel_members')
          .select('channel_id');
        if (!error && data) {
          const map: MemberCount = {};
          data.forEach((row: any) => {
            if (row.channel_id) map[row.channel_id] = (map[row.channel_id] || 0) + 1;
          });
          setMemberCounts(map);
        }
      } catch (e) {
        // ignore
      }
    };
    if (channels.length) fetchCounts();
  }, [channels]);

  return memberCounts;
}
