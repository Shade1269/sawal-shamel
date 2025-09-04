import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  MessageCircle, 
  Send, 
  Users, 
  Settings, 
  Image, 
  Video, 
  Smile,
  MoreVertical,
  UserPlus,
  Lock,
  Globe
} from "lucide-react";

interface Message {
  id: string;
  user: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'video';
  isOwn: boolean;
}

interface User {
  id: string;
  name: string;
  status: 'online' | 'offline';
  avatar?: string;
}

const ChatInterface = () => {
  const [message, setMessage] = useState("");
  const [activeRoom, setActiveRoom] = useState("عام");
  
  // Mock data
  const messages: Message[] = [
    {
      id: "1",
      user: "أحمد محمد",
      content: "مرحباً بالجميع! كيف الحال؟",
      timestamp: "10:30",
      type: 'text',
      isOwn: false
    },
    {
      id: "2", 
      user: "فاطمة",
      content: "أهلاً أحمد، الحمد لله بخير",
      timestamp: "10:32",
      type: 'text',
      isOwn: false
    },
    {
      id: "3",
      user: "أنت",
      content: "أهلاً وسهلاً بكم جميعاً",
      timestamp: "10:35",
      type: 'text',
      isOwn: true
    }
  ];

  const users: User[] = [
    { id: "1", name: "أحمد محمد", status: "online" },
    { id: "2", name: "فاطمة", status: "online" },
    { id: "3", name: "خالد", status: "offline" },
    { id: "4", name: "ليلى", status: "online" },
    { id: "5", name: "محمود", status: "offline" }
  ];

  const rooms = [
    { id: "general", name: "عام", type: "public", members: 156 },
    { id: "tech", name: "التقنية", type: "public", members: 89 },
    { id: "sports", name: "الرياضة", type: "public", members: 234 },
    { id: "private1", name: "أصدقاء الجامعة", type: "private", members: 12 }
  ];

  const sendMessage = () => {
    if (message.trim()) {
      // Here would be the real-time message sending logic
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  return (
    <div className="h-screen bg-chat-bg rtl flex" dir="rtl">
      {/* Sidebar - Rooms */}
      <div className="w-80 bg-card border-l border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <h2 className="font-bold text-lg arabic-text">دردشة عربية</h2>
            </div>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
              أ
            </div>
            <span className="font-medium arabic-text">أنت</span>
            <div className="w-2 h-2 bg-status-online rounded-full mr-auto"></div>
          </div>
        </div>

        {/* Rooms List */}
        <div className="flex-1 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-muted-foreground arabic-text">الغرف</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <UserPlus className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="px-2">
            <div className="space-y-1">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setActiveRoom(room.name)}
                  className={`w-full text-right p-3 rounded-lg transition-colors arabic-text ${
                    activeRoom === room.name 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {room.type === 'private' ? 
                      <Lock className="h-4 w-4 text-muted-foreground" /> :
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    }
                    <div className="flex-1">
                      <div className="font-medium">{room.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {room.members} عضو
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold arabic-text">{activeRoom}</h2>
                <p className="text-sm text-muted-foreground arabic-text">
                  {users.filter(u => u.status === 'online').length} متصل الآن
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="arabic-text">
                <Users className="h-3 w-3 ml-1" />
                {users.length}
              </Badge>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4 chat-scrollbar">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 message-appear ${msg.isOwn ? 'flex-row-reverse' : ''}`}
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {msg.user[0]}
                </div>
                <div className={`max-w-xs lg:max-w-md ${msg.isOwn ? 'text-left' : 'text-right'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium arabic-text">{msg.user}</span>
                    <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                  </div>
                  <div className={`p-3 rounded-2xl shadow-soft ${
                    msg.isOwn 
                      ? 'bg-chat-sent text-white rounded-br-sm' 
                      : 'bg-chat-received rounded-bl-sm'
                  }`}>
                    <p className="arabic-text leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="bg-card border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Image className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className="flex-1 arabic-text"
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button 
                onClick={sendMessage}
                variant="hero"
                size="icon"
                className="shadow-soft"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold arabic-text">الأعضاء المتصلون</h3>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate arabic-text">{user.name}</div>
                  <div className={`w-2 h-2 rounded-full ${
                    user.status === 'online' ? 'bg-status-online' : 'bg-status-offline'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ChatInterface;