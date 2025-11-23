import React, { useState } from 'react';
import { UnifiedButton as Button } from '@/components/design-system';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  MoreVertical, 
  Reply, 
  Copy, 
  Edit3, 
  Trash2, 
  Pin,
  PinOff,
  MessageSquare,
  Check,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/hooks/useRealTimeChat';

interface EnhancedMessageActionsProps {
  message: Message;
  currentProfile: any;
  onReply: (messageId: string, originalContent: string) => void;
  onEdit: (messageId: string, newContent: string) => void;
  onDelete: (messageId: string) => void;
  onPin?: (messageId: string) => void;
  onUnpin?: (messageId: string) => void;
  onCreateThread?: (messageId: string) => void;
  isOwnMessage: boolean;
}

const EnhancedMessageActions: React.FC<EnhancedMessageActionsProps> = ({
  message,
  currentProfile,
  onReply,
  onEdit,
  onDelete,
  onPin,
  onUnpin,
  onCreateThread,
  isOwnMessage
}) => {
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const { toast } = useToast();

  const canEdit = isOwnMessage;
  const canDelete = isOwnMessage || currentProfile?.role === 'admin' || currentProfile?.role === 'moderator';
  const canPin = currentProfile?.role === 'admin' || currentProfile?.role === 'moderator';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast({
        title: "تم النسخ",
        description: "تم نسخ الرسالة إلى الحافظة"
      });
    } catch (error) {
      toast({
        title: "خطأ في النسخ",
        description: "فشل في نسخ الرسالة",
        variant: "destructive"
      });
    }
  };

  const handleEditSave = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(message.id, editContent.trim());
    }
    setEditMode(false);
  };

  const handleEditCancel = () => {
    setEditContent(message.content);
    setEditMode(false);
  };

  const handlePin = () => {
    if (message.is_pinned && onUnpin) {
      onUnpin(message.id);
    } else if (!message.is_pinned && onPin) {
      onPin(message.id);
    }
  };

  if (editMode) {
    return (
      <div className="space-y-2 mt-2">
        <Textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="arabic-text text-sm"
          rows={2}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleEditSave} disabled={!editContent.trim()}>
            <Check className="h-3 w-3 ml-1" />
            حفظ
          </Button>
          <Button size="sm" variant="outline" onClick={handleEditCancel}>
            <X className="h-3 w-3 ml-1" />
            إلغاء
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onReply(message.id, message.content)}>
          <Reply className="h-4 w-4 ml-2" />
          رد على الرسالة
        </DropdownMenuItem>
        
        {onCreateThread && (
          <DropdownMenuItem onClick={() => onCreateThread(message.id)}>
            <MessageSquare className="h-4 w-4 ml-2" />
            إنشاء خيط محادثة
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="h-4 w-4 ml-2" />
          نسخ الرسالة
        </DropdownMenuItem>

        {canPin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handlePin}>
              {message.is_pinned ? (
                <>
                  <PinOff className="h-4 w-4 ml-2" />
                  إلغاء التثبيت
                </>
              ) : (
                <>
                  <Pin className="h-4 w-4 ml-2" />
                  تثبيت الرسالة
                </>
              )}
            </DropdownMenuItem>
          </>
        )}

        {(canEdit || canDelete) && <DropdownMenuSeparator />}
        
        {canEdit && (
          <DropdownMenuItem onClick={() => setEditMode(true)}>
            <Edit3 className="h-4 w-4 ml-2" />
            تعديل الرسالة
          </DropdownMenuItem>
        )}
        
        {canDelete && (
          <DropdownMenuItem 
            onClick={() => onDelete(message.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 ml-2" />
            حذف الرسالة
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EnhancedMessageActions;