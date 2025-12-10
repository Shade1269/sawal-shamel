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
import { LogOut } from 'lucide-react';

interface LeaveConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LeaveConfirmDialog: React.FC<LeaveConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="text-right" dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 justify-end">
            <span>مغادرة القاعة</span>
            <div className="p-2 bg-destructive/20 rounded-full">
              <LogOut className="w-5 h-5 text-destructive" />
            </div>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-right">
            هل أنت متأكد من مغادرة القاعة؟ سيتم قطع اتصالك بالبث المباشر.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row-reverse gap-2">
          <AlertDialogAction 
            onClick={onConfirm} 
            className="bg-destructive hover:bg-destructive/90 gap-2"
          >
            <LogOut className="w-4 h-4" />
            مغادرة
          </AlertDialogAction>
          <AlertDialogCancel onClick={onCancel}>
            البقاء
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
