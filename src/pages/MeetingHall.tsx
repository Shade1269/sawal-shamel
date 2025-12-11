import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useLiveKit, ParticipantRole } from '@/hooks/useLiveKit';
import { useMeetingRooms, MeetingRoom } from '@/hooks/useMeetingRooms';
import { MeetingRoom as MeetingRoomComponent } from '@/components/meeting-hall/MeetingRoom';
import { SessionRecoveryDialog } from '@/components/meeting-hall/SessionRecoveryDialog';
import { LeaveConfirmDialog } from '@/components/meeting-hall/LeaveConfirmDialog';
import { CreateRoomDialog } from '@/components/meeting-hall/CreateRoomDialog';
import { JoinByCodeDialog } from '@/components/meeting-hall/JoinByCodeDialog';
import { MeetingHistory } from '@/components/meeting-hall/MeetingHistory';
import { ActiveRoomsList } from '@/components/meeting-hall/ActiveRoomsList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Video, Users, Crown, Headphones, RefreshCw, Plus, Link2, History, Lock } from 'lucide-react';
import { Navigate, useSearchParams } from 'react-router-dom';

const MeetingHall: React.FC = () => {
  const { user, profile, loading: authLoading } = useUnifiedAuth();
  const liveKitHook = useLiveKit();
  const { isConnected, isConnecting, isReconnecting, connect, disconnect, reconnect, checkSavedSession, clearSession } = liveKitHook;
  const meetingRooms = useMeetingRooms();
  const [searchParams] = useSearchParams();
  
  const [role, setRole] = useState<ParticipantRole>('listener');
  const [showRoom, setShowRoom] = useState(false);
  const [savedSession, setSavedSession] = useState<any>(null);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<MeetingRoom | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [pendingPrivateRoom, setPendingPrivateRoom] = useState<MeetingRoom | null>(null);

  // Check URL for room code
  useEffect(() => {
    const roomCode = searchParams.get('room');
    if (roomCode && user) {
      setShowJoinDialog(true);
    }
  }, [searchParams, user]);

  // Check for saved session on mount
  useEffect(() => {
    if (user && !isConnected && !isConnecting) {
      const session = checkSavedSession();
      if (session) {
        setSavedSession(session);
        setShowRecoveryDialog(true);
      }
    }
  }, [user, isConnected, isConnecting, checkSavedSession]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleJoinRoom = async (room: MeetingRoom, password?: string) => {
    // Check if private room needs password
    if (room.is_private && !password) {
      setPendingPrivateRoom(room);
      return;
    }

    const validRoom = await meetingRooms.joinRoom(room.room_code, password);
    if (!validRoom) return;

    try {
      // Connect to LiveKit first before setting room state
      await connect(
        validRoom.room_code,
        profile?.full_name || user.email || 'مشارك',
        user.id,
        role
      );
      
      // Only set room after successful connection
      setCurrentRoom(validRoom);
      
      // Record participation
      await meetingRooms.recordParticipant(validRoom.id, profile?.full_name || 'مشارك', role);
      setShowRoom(true);
      setPendingPrivateRoom(null);
      setPasswordInput('');
    } catch (error: any) {
      console.error('Failed to join room:', error);
      setCurrentRoom(null);
      toast.error(error?.message || 'فشل الاتصال بالغرفة');
    }
  };

  const handleJoinByCode = async (code: string, password?: string) => {
    const room = await meetingRooms.joinRoom(code, password);
    if (room) {
      await handleJoinRoom(room, password);
      return room;
    }
    return null;
  };

  const handleRoomCreated = async (room: MeetingRoom) => {
    await handleJoinRoom(room);
  };

  const handleLeaveRequest = () => {
    setShowLeaveDialog(true);
  };

  const handleLeaveConfirm = async () => {
    setShowLeaveDialog(false);
    await disconnect();
    setShowRoom(false);
    setCurrentRoom(null);
    await meetingRooms.refreshRooms();
  };

  const handleRecoverSession = async () => {
    setShowRecoveryDialog(false);
    if (savedSession) {
      setRole(savedSession.role);
      await reconnect(savedSession);
      setShowRoom(true);
    }
  };

  const handleDiscardSession = () => {
    setShowRecoveryDialog(false);
    clearSession();
    setSavedSession(null);
  };

  const handleJoinFromHistory = (_roomCode: string) => {
    setShowHistoryDialog(false);
    setShowJoinDialog(true);
  };

  // Show reconnecting state
  if (isReconnecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <RefreshCw className="w-12 h-12 animate-spin text-primary" />
        <p className="text-lg font-medium text-foreground">جاري إعادة الاتصال...</p>
        <p className="text-sm text-muted-foreground">يرجى الانتظار</p>
      </div>
    );
  }

  if (showRoom && isConnected && currentRoom) {
    return (
      <>
        <MeetingRoomComponent 
          roomName={currentRoom.room_name} 
          onLeave={handleLeaveRequest} 
          selectedRole={role} 
          liveKitHook={liveKitHook} 
        />
        <LeaveConfirmDialog
          isOpen={showLeaveDialog}
          onConfirm={handleLeaveConfirm}
          onCancel={() => setShowLeaveDialog(false)}
        />
      </>
    );
  }

  return (
    <>
      <SessionRecoveryDialog
        isOpen={showRecoveryDialog}
        roomName={savedSession?.roomName || ''}
        onRecover={handleRecoverSession}
        onDiscard={handleDiscardSession}
      />
      
      <CreateRoomDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreateRoom={meetingRooms.createRoom}
        onRoomCreated={handleRoomCreated}
      />
      
      <JoinByCodeDialog
        isOpen={showJoinDialog}
        onClose={() => setShowJoinDialog(false)}
        onJoin={handleJoinByCode}
        initialCode={searchParams.get('room') || ''}
      />
      
      <MeetingHistory
        isOpen={showHistoryDialog}
        onClose={() => setShowHistoryDialog(false)}
        getHistory={meetingRooms.getMeetingHistory}
        onRejoin={handleJoinFromHistory}
      />

      {/* Password Dialog for Private Rooms */}
      {pendingPrivateRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-sm mx-4" dir="rtl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-warning" />
                غرفة خاصة
              </CardTitle>
              <CardDescription>
                أدخل كلمة المرور للانضمام إلى "{pendingPrivateRoom.room_name}"
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="password"
                placeholder="كلمة المرور"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => handleJoinRoom(pendingPrivateRoom, passwordInput)}
                  disabled={!passwordInput}
                >
                  انضم
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setPendingPrivateRoom(null);
                    setPasswordInput('');
                  }}
                >
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6">
              <Video className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              قاعة الاجتماعات
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              انضم إلى بث مباشر مع المؤثرين والمسوقين. شارك في المناقشات وتعلم من الخبراء.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Button
              size="lg"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="w-6 h-6" />
              <span>إنشاء غرفة جديدة</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => setShowJoinDialog(true)}
            >
              <Link2 className="w-6 h-6" />
              <span>الانضمام برمز</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => setShowHistoryDialog(true)}
            >
              <History className="w-6 h-6" />
              <span>سجل الاجتماعات</span>
            </Button>
          </div>

          {/* Role Selection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>اختر دورك قبل الانضمام</CardTitle>
              <CardDescription>حدد كيف تريد المشاركة في الاجتماع</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={role}
                onValueChange={(v) => setRole(v as ParticipantRole)}
                className="grid grid-cols-2 gap-4"
              >
                <Label
                  htmlFor="listener"
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    role === 'listener' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="listener" id="listener" className="sr-only" />
                  <Headphones className={`w-8 h-8 ${role === 'listener' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="text-center">
                    <p className="font-medium text-foreground">مستمع</p>
                    <p className="text-xs text-muted-foreground">استمع وشاهد فقط</p>
                  </div>
                </Label>

                <Label
                  htmlFor="speaker"
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    role === 'speaker' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="speaker" id="speaker" className="sr-only" />
                  <Crown className={`w-8 h-8 ${role === 'speaker' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="text-center">
                    <p className="font-medium text-foreground">متحدث</p>
                    <p className="text-xs text-muted-foreground">شارك صوتك وفيديو</p>
                  </div>
                </Label>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Active Rooms */}
          <ActiveRoomsList
            rooms={meetingRooms.rooms}
            loading={meetingRooms.loading}
            onJoinRoom={handleJoinRoom}
          />

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-2">
                <Video className="w-6 h-6 text-success" />
              </div>
              <p className="text-sm font-medium text-foreground">بث مباشر</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-full bg-info/20 flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-info" />
              </div>
              <p className="text-sm font-medium text-foreground">آلاف المشاركين</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-2">
                <Crown className="w-6 h-6 text-warning" />
              </div>
              <p className="text-sm font-medium text-foreground">أدوار مختلفة</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MeetingHall;
