import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';

// Types
export interface UserLevel {
  id: string;
  user_id: string;
  current_level: 'bronze' | 'silver' | 'gold' | 'legendary';
  total_points: number;
  level_points: number;
  next_level_threshold: number;
  level_achieved_at: string;
}

export interface Alliance {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  leader_id: string;
  status: 'active' | 'inactive' | 'disbanded';
  member_count: number;
  max_members: number;
  total_points: number;
  total_sales: number;
  theme: string;
  castle_controlled_at?: string;
  castle_control_duration: number;
  created_at: string;
  updated_at: string;
  last_name_change?: string;
  last_logo_change?: string;
}

export interface AllianceMember {
  id: string;
  alliance_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  contribution_points: number;
  last_activity_at: string;
  is_active: boolean;
}

export interface WeeklyChallenge {
  id: string;
  name: string;
  description: string;
  challenge_type: 'sales' | 'customers' | 'points' | 'mixed';
  target_value: number;
  difficulty_level: string;
  bonus_points: number;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  winner_alliance_id?: string;
  metadata: any;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  week_number: number;
  year_number: number;
  points: number;
  sales_amount: number;
  orders_count: number;
  customers_count: number;
  rank?: number;
  rank_change: number;
  theme_earned?: string;
  bonus_earned: number;
  user_profile?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface AllianceLeaderboardEntry {
  id: string;
  alliance_id: string;
  week_number: number;
  year_number: number;
  total_points: number;
  total_sales: number;
  total_orders: number;
  active_members: number;
  rank?: number;
  rank_change: number;
  castle_controlled: boolean;
  rewards_earned: any;
  alliance?: Alliance;
}

export const useAtlantisSystem = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  
  // States
  const [loading, setLoading] = useState(false);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [userAlliance, setUserAlliance] = useState<Alliance | null>(null);
  const [userMembership, setUserMembership] = useState<AllianceMember | null>(null);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [allianceLeaderboard, setAllianceLeaderboard] = useState<AllianceLeaderboardEntry[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<WeeklyChallenge | null>(null);
  const [castleController, setCastleController] = useState<Alliance | null>(null);

  // Get current user profile
  const getCurrentUserProfile = async () => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();
    
    if (error || !data) return null;
    return data.id;
  };

  // Initialize or get user level
  const initializeUserLevel = async () => {
    const profileId = await getCurrentUserProfile();
    if (!profileId) return;

    // Check if user level exists
    const { data: existingLevel, error } = await supabase
      .from('user_levels')
      .select('*')
      .eq('user_id', profileId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking user level:', error);
      return;
    }

    if (!existingLevel) {
      // Create initial user level
      const { data: newLevel, error: insertError } = await supabase
        .from('user_levels')
        .insert({
          user_id: profileId,
          current_level: 'bronze',
          total_points: 0,
          level_points: 0,
          next_level_threshold: 500
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user level:', insertError);
        return;
      }

      setUserLevel(newLevel);
    } else {
      setUserLevel(existingLevel);
    }
  };

  // Fetch user alliance
  const fetchUserAlliance = async () => {
    const profileId = await getCurrentUserProfile();
    if (!profileId) return;

    const { data: membership, error } = await supabase
      .from('alliance_members')
      .select(`
        *,
        alliances (*)
      `)
      .eq('user_id', profileId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user alliance:', error);
      return;
    }

    if (membership) {
      setUserMembership(membership);
      setUserAlliance(membership.alliances as Alliance);
    }
  };

  // Fetch weekly leaderboard
  const fetchWeeklyLeaderboard = async () => {
    const currentWeek = new Date().getWeek();
    const currentYear = new Date().getFullYear();

    const { data, error } = await supabase
      .from('weekly_leaderboard')
      .select(`
        *,
        profiles!user_id (
          full_name,
          avatar_url
        )
      `)
      .eq('week_number', currentWeek)
      .eq('year_number', currentYear)
      .order('rank', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error fetching weekly leaderboard:', error);
      return;
    }

    const formattedData = data?.map(entry => ({
      ...entry,
      user_profile: entry.profiles
    })) || [];

    setWeeklyLeaderboard(formattedData);
  };

  // Fetch alliance leaderboard
  const fetchAllianceLeaderboard = async () => {
    const currentWeek = new Date().getWeek();
    const currentYear = new Date().getFullYear();

    const { data, error } = await supabase
      .from('alliance_weekly_leaderboard')
      .select(`
        *,
        alliances (*)
      `)
      .eq('week_number', currentWeek)
      .eq('year_number', currentYear)
      .order('rank', { ascending: true })
      .limit(20);

    if (error) {
      console.error('Error fetching alliance leaderboard:', error);
      return;
    }

    const formattedData = data?.map(entry => ({
      id: entry.id,
      alliance_id: entry.alliance_id,
      week_number: entry.week_number,
      year_number: entry.year_number,
      total_points: entry.total_points,
      total_sales: entry.total_sales,
      total_orders: entry.total_orders,
      active_members: entry.active_members,
      rank: entry.rank,
      rank_change: entry.rank_change,
      castle_controlled: entry.castle_controlled,
      rewards_earned: entry.rewards_earned,
      alliance: entry.alliances as Alliance
    })) || [];

    setAllianceLeaderboard(formattedData);
  };

  // Fetch current challenge
  const fetchCurrentChallenge = async () => {
    const { data, error } = await supabase
      .from('weekly_challenges')
      .select('*')
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching current challenge:', error);
      return;
    }

    setCurrentChallenge(data);
  };

  // Fetch castle controller
  const fetchCastleController = async () => {
    const { data, error } = await supabase
      .from('castle_control')
      .select(`
        *,
        alliances (*)
      `)
      .eq('is_current', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching castle controller:', error);
      return;
    }

    if (data) {
      setCastleController(data.alliances as Alliance);
    }
  };

  // Create alliance
  const createAlliance = async (allianceData: {
    name: string;
    slug: string;
    description?: string;
    logo_url?: string;
  }) => {
    const profileId = await getCurrentUserProfile();
    if (!profileId) {
      toast({
        title: "خطأ",
        description: "لم يتم العثور على ملف المستخدم",
        variant: "destructive"
      });
      return null;
    }

    // Check if user can create alliance
    if (!userLevel || !['silver', 'gold', 'legendary'].includes(userLevel.current_level)) {
      toast({
        title: "غير مسموح",
        description: "يجب أن تكون في المستوى الفضي أو أعلى لإنشاء تحالف",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('alliances')
        .insert({
          ...allianceData,
          leader_id: profileId,
          member_count: 1
        })
        .select()
        .single();

      if (error) throw error;

      // Add leader as member
      const { error: memberError } = await supabase
        .from('alliance_members')
        .insert({
          alliance_id: data.id,
          user_id: profileId,
          role: 'leader'
        });

      if (memberError) throw memberError;

      toast({
        title: "تم إنشاء التحالف",
        description: `تم إنشاء تحالف "${allianceData.name}" بنجاح`,
      });

      // Refresh data
      await fetchUserAlliance();
      
      return data;
    } catch (error: any) {
      console.error('Error creating alliance:', error);
      toast({
        title: "خطأ في إنشاء التحالف",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Join alliance
  const joinAlliance = async (allianceId: string) => {
    const profileId = await getCurrentUserProfile();
    if (!profileId) return false;

    if (userAlliance) {
      toast({
        title: "غير مسموح",
        description: "أنت عضو في تحالف بالفعل",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('alliance_members')
        .insert({
          alliance_id: allianceId,
          user_id: profileId,
          role: 'member'
        });

      if (error) throw error;

      toast({
        title: "تم الانضمام للتحالف",
        description: "تم انضمامك للتحالف بنجاح",
      });

      // Refresh data
      await fetchUserAlliance();
      
      return true;
    } catch (error: any) {
      console.error('Error joining alliance:', error);
      toast({
        title: "خطأ في الانضمام",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Leave alliance
  const leaveAlliance = async () => {
    const profileId = await getCurrentUserProfile();
    if (!profileId || !userMembership) return false;

    if (userMembership.role === 'leader') {
      toast({
        title: "غير مسموح",
        description: "لا يمكن لقائد التحالف المغادرة، يجب نقل القيادة أولاً",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('alliance_members')
        .delete()
        .eq('id', userMembership.id);

      if (error) throw error;

      toast({
        title: "تم ترك التحالف",
        description: "تم ترك التحالف بنجاح",
      });

      // Clear alliance data
      setUserAlliance(null);
      setUserMembership(null);
      
      return true;
    } catch (error: any) {
      console.error('Error leaving alliance:', error);
      toast({
        title: "خطأ في ترك التحالف",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update user points (for admin or system use)
  const updateUserPoints = async (pointsToAdd: number, reason?: string) => {
    const profileId = await getCurrentUserProfile();
    if (!profileId || !userLevel) return false;

    try {
      const newTotalPoints = userLevel.total_points + pointsToAdd;
      
      const { error } = await supabase
        .from('user_levels')
        .update({
          total_points: newTotalPoints,
          level_points: userLevel.level_points + pointsToAdd
        })
        .eq('id', userLevel.id);

      if (error) throw error;

      // Refresh user level
      await initializeUserLevel();
      
      if (reason) {
        toast({
          title: "تم إضافة النقاط",
          description: `تم إضافة ${pointsToAdd} نقطة - ${reason}`,
        });
      }
      
      return true;
    } catch (error: any) {
      console.error('Error updating user points:', error);
      return false;
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    if (user) {
      const initializeData = async () => {
        setLoading(true);
        await Promise.all([
          initializeUserLevel(),
          fetchUserAlliance(),
          fetchWeeklyLeaderboard(),
          fetchAllianceLeaderboard(),
          fetchCurrentChallenge(),
          fetchCastleController()
        ]);
        setLoading(false);
      };

      initializeData();
    }
  }, [user]);

  return {
    // States
    loading,
    userLevel,
    userAlliance,
    userMembership,
    weeklyLeaderboard,
    allianceLeaderboard,
    currentChallenge,
    castleController,
    
    // Actions
    createAlliance,
    joinAlliance,
    leaveAlliance,
    updateUserPoints,
    
    // Refresh functions
    fetchWeeklyLeaderboard,
    fetchAllianceLeaderboard,
    fetchCurrentChallenge,
    fetchCastleController,
    initializeUserLevel,
    fetchUserAlliance
  };
};

// Helper to get current week number
declare global {
  interface Date {
    getWeek(): number;
  }
}

Date.prototype.getWeek = function() {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};