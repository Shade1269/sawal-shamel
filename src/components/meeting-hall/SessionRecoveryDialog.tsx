import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Video, RefreshCw } from 'lucide-react';

interface SessionRecoveryDialogProps {
  isOpen: boolean;
  roomName: string;
  onRecover: () => void;
  onDiscard: () => void;
}

export const SessionRecoveryDialog: React.FC<SessionRecoveryDialogProps> = ({
  isOpen,
  roomName,
  onRecover,
  onDiscard,
}) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="text-right" dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 justify-end">
            <span>استعادة الجلسة السابقة</span>
            <div className="p-2 bg-primary/20 rounded-full">
              <RefreshCw className="w-5 h-5 text-primary" />
            </div>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-right">
            يبدو أنك كنت متصلاً بغرفة <strong className="text-foreground">"{roomName}"</strong> قبل قليل.
            هل تريد العودة إلى الغرفة؟
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row-reverse gap-2">
          <AlertDialogAction onClick={onRecover} className="gap-2">
            <Video className="w-4 h-4" />
            استعادة الجلسة
          </AlertDialogAction>
          <AlertDialogCancel onClick={onDiscard}>
            تجاهل
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
