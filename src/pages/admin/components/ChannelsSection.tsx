import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, MessageCircle, Users, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

/**
 * Props للـ ChannelsSection Component
 */
interface ChannelsSectionProps {
  channels: any[];
  channelMembers: Record<string, number>;
  loading: boolean;
  onCreate: (channelName: string, channelDesc: string) => Promise<void>;
  onClearMessages: (channelId: string, channelName: string) => Promise<void>;
}

/**
 * قسم إدارة الغرف/القنوات
 * يتيح إنشاء غرف جديدة وحذف رسائل الغرف
 */
export function ChannelsSection({
  channels,
  channelMembers,
  loading,
  onCreate,
  onClearMessages
}: ChannelsSectionProps) {
  const { toast } = useToast();

  // حالات محلية للنماذج
  const [channelName, setChannelName] = useState("");
  const [channelDesc, setChannelDesc] = useState("");

  // معالج إنشاء غرفة جديدة
  const handleCreateChannel = async () => {
    if (!channelName.trim()) {
      toast({ title: "الاسم مطلوب", variant: "destructive" });
      return;
    }

    await onCreate(channelName.trim(), channelDesc.trim() || null);
    setChannelName("");
    setChannelDesc("");
  };

  // معالج حذف رسائل الغرفة
  const handleClearMessages = (channelId: string, channelName: string) => {
    if (confirm(`هل أنت متأكد من حذف جميع رسائل غرفة "${channelName}"؟\n\nتحذير: هذا الإجراء لا يمكن التراجع عنه!`)) {
      onClearMessages(channelId, channelName);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-premium flex items-center justify-center shadow-elegant">
          <MessageSquare className="h-5 w-5 text-primary-foreground" />
        </div>
        <h3 className="text-2xl font-black admin-card">إدارة الغرف</h3>
      </div>

      <div className="space-y-3">
        <Input
          placeholder="اسم الغرفة الجديدة"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
        />
        <Input
          placeholder="وصف الغرفة (اختياري)"
          value={channelDesc}
          onChange={(e) => setChannelDesc(e.target.value)}
        />
        <Button
          onClick={handleCreateChannel}
          className="w-full"
          disabled={loading}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          إنشاء غرفة جديدة
        </Button>
      </div>

      <div className="border-t pt-4 space-y-2">
        <h4 className="font-medium text-sm">الغرف الحالية</h4>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {channels.map((channel) => (
            <div key={channel.id} className="flex items-center justify-between bg-muted/20 p-3 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{channel.name}</span>
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {channelMembers[channel.id] || 0}
                  </Badge>
                </div>
                {channel.description && (
                  <p className="text-xs text-muted-foreground mt-1">{channel.description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClearMessages(channel.id, channel.name);
                }}
                className="text-destructive hover:text-destructive"
                disabled={loading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {channels.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد غرف حالياً
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
