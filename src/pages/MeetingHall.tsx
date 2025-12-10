import React, { useState, useEffect } from 'react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useLiveKit, ParticipantRole } from '@/hooks/useLiveKit';
import { MeetingRoom } from '@/components/meeting-hall/MeetingRoom';
import { SessionRecoveryDialog } from '@/components/meeting-hall/SessionRecoveryDialog';
import { LeaveConfirmDialog } from '@/components/meeting-hall/LeaveConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Video, Users, Crown, Headphones, RefreshCw } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const MeetingHall: React.FC = () => {
  const { user, profile, loading: authLoading } = useUnifiedAuth();
  const liveKitHook = useLiveKit();
  const { isConnected, isConnecting, isReconnecting, connect, disconnect, reconnect, checkSavedSession, clearSession } = liveKitHook;
  
  const [roomName, setRoomName] = useState('');
  const [role, setRole] = useState<ParticipantRole>('listener');
  const [showRoom, setShowRoom] = useState(false);
  const [savedSession, setSavedSession] = useState<any>(null);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

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

  const handleJoin = async () => {
    if (!roomName.trim()) return;

    try {
      await connect(
        roomName,
        profile?.full_name || user.email || 'مشارك',
        user.id,
        role
      );
      setShowRoom(true);
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  const handleLeaveRequest = () => {
    setShowLeaveDialog(true);
  };

  const handleLeaveConfirm = async () => {
    setShowLeaveDialog(false);
    await disconnect();
    setShowRoom(false);
    setRoomName('');
  };

  const handleRecoverSession = async () => {
    setShowRecoveryDialog(false);
    if (savedSession) {
      setRoomName(savedSession.roomName);
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

  if (showRoom && isConnected) {
    return (
      <>
        <MeetingRoom 
          roomName={roomName} 
          onLeave={handleLeaveRequest} 
          selectedRole={role} 
          liveKitHook={liveKitHook} 
        />
        <LeaveConfirmDialog
          isOpen={showLeaveDialog}
          onConfirm={handleLeaveConfirm}
          onCancel={() => setShowLeaveDialog(false)}
        />
        <SessionRecoveryDialog
          isOpen={showRecoveryDialog}
          roomName={savedSession?.roomName || ''}
          onRecover={handleRecoverSession}
          onDiscard={handleDiscardSession}
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

      {/* Join Form */}
      <div className="max-w-xl mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>انضم إلى قاعة</CardTitle>
            <CardDescription>
              أدخل اسم القاعة واختر دورك للانضمام
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="roomName">اسم القاعة</Label>
              <Input
                id="roomName"
                placeholder="مثال: قاعة-التسويق"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                dir="rtl"
              />
            </div>

            <div className="space-y-3">
              <Label>اختر دورك</Label>
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
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleJoin}
              disabled={!roomName.trim() || isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin ml-2" />
                  جاري الاتصال...
                </>
              ) : (
                <>
                  <Users className="w-5 h-5 ml-2" />
                  انضم للقاعة
                </>
              )}
            </Button>
          </CardContent>
        </Card>

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
