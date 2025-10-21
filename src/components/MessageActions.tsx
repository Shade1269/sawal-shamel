import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Reply, Edit, Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageActionsProps {
  message: any;
  currentProfile: any;
  onReply: (messageId: string, originalText: string) => void;
  onEdit: (messageId: string, newContent: string) => void;
  onDelete: (messageId: string) => void;
  isOwnMessage: boolean;
}

const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  currentProfile,
  onReply,
  onEdit,
  onDelete,
  isOwnMessage
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const { toast } = useToast();

  const canEdit = isOwnMessage && message.message_type === 'text';
  const canDelete = isOwnMessage || currentProfile?.role === 'admin' || currentProfile?.role === 'moderator';

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

  const handleEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(message.id, editContent.trim());
      setIsEditing(false);
    } else {
      setIsEditing(false);
    }
  };

  const handleReply = () => {
    const cleanContent = message.content.startsWith('[') ? 
      message.content.split('] ')[1] || message.content : 
      message.content;
    onReply(message.id, cleanContent);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="rtl">
          <DropdownMenuItem onClick={handleReply} className="arabic-text cursor-pointer">
            <Reply className="h-4 w-4 ml-2" />
            رد على الرسالة
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleCopy} className="arabic-text cursor-pointer">
            <Copy className="h-4 w-4 ml-2" />
            نسخ النص
          </DropdownMenuItem>

          {canEdit && (
            <DropdownMenuItem 
              onClick={() => setIsEditing(true)} 
              className="arabic-text cursor-pointer"
            >
              <Edit className="h-4 w-4 ml-2" />
              تعديل الرسالة
            </DropdownMenuItem>
          )}

          {canDelete && (
            <DropdownMenuItem 
              onClick={() => onDelete(message.id)} 
              className="arabic-text cursor-pointer text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 ml-2" />
              حذف الرسالة
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md rtl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="arabic-text">تعديل الرسالة</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="arabic-text"
              placeholder="عدّل رسالتك..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleEdit();
                }
              }}
            />
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                إلغاء
              </Button>
              <Button onClick={handleEdit}>
                حفظ التعديل
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MessageActions;