import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  className?: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  className = ""
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const requestMicrophonePermission = async () => {
    try {
      toast({
        title: "طلب صلاحية الميكروفون",
        description: "يرجى السماح بالوصول للميكروفون لتسجيل الرسائل الصوتية"
      });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // توقيف المجرى المؤقت
      setPermissionGranted(true);
      
      toast({
        title: "تم منح الصلاحية",
        description: "يمكنك الآن تسجيل الرسائل الصوتية"
      });
      
      // ابدأ التسجيل مباشرة
      setTimeout(() => startRecording(), 500);
      
    } catch (error) {
      console.error('Permission denied:', error);
      setPermissionGranted(false);
      
      toast({
        title: "تم رفض الصلاحية", 
        description: "لا يمكن تسجيل الرسائل الصوتية بدون صلاحية الميكروفون. يرجى السماح بالوصول في إعدادات المتصفح.",
        variant: "destructive"
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { 
          type: 'audio/webm;codecs=opus' 
        });
        onRecordingComplete(audioBlob);
        cleanup();
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "بدأ التسجيل",
        description: "يتم تسجيل الصوت الآن..."
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "خطأ في التسجيل",
        description: "لا يمكن الوصول للميكروفون",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    mediaRecorderRef.current = null;
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isRecording && (
        <div className="text-sm text-muted-foreground arabic-text">
          {formatTime(recordingTime)}
        </div>
      )}
      
      <Button
        type="button"
        variant={isRecording ? "destructive" : "ghost"}
        size="icon"
        onClick={() => {
          if (isRecording) {
            stopRecording();
          } else if (permissionGranted === false) {
            requestMicrophonePermission();
          } else if (permissionGranted === null) {
            requestMicrophonePermission();
          } else {
            startRecording();
          }
        }}
        className="h-9 w-9"
        title={
          permissionGranted === false 
            ? "انقر لطلب صلاحية الميكروفون" 
            : isRecording 
              ? "انقر لإيقاف التسجيل" 
              : "انقر لبدء تسجيل رسالة صوتية"
        }
      >
        {isRecording ? (
          <Square className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default VoiceRecorder;