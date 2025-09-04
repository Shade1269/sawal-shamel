import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_EMAIL = "Shade199633@icloud.com";

const Admin = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();

  const isAllowed = useMemo(() => user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(), [user]);

  const [channelName, setChannelName] = useState("");
  const [channelDesc, setChannelDesc] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [targetEmail, setTargetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [shadeEnsured, setShadeEnsured] = useState(false);

  const callAdminApi = async (action: string, body: any = {}) => {
    if (!session?.access_token) {
      toast({ title: "غير مصرح", description: "سجل دخولك أولاً", variant: "destructive" });
      return { error: "unauthorized" };
    }
    try {
      console.log('Calling admin API:', action, body);
      const { data, error } = await supabase.functions.invoke('admin-actions', {
        body: { action, ...body },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || "خطأ في الخادم");
      }
      
      console.log('Admin API response:', data);
      return { data };
    } catch (e: any) {
      console.error('API call failed:', e);
      toast({ title: "فشل التنفيذ", description: e.message, variant: "destructive" });
      return { error: e.message };
    }
  };

  const loadLists = async () => {
    setLoading(true);
    const [uc, ch] = await Promise.all([
      callAdminApi("list_users", { query: search }),
      callAdminApi("list_channels"),
    ]);
    if (!uc.error) setUsers(uc.data.data || []);
    if (!ch.error) setChannels(ch.data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAllowed) {
      loadLists();
      if (!shadeEnsured) {
        setShadeEnsured(true);
        // إنشاء/ربط حساب shade010 وتعيين كلمة المرور
        callAdminApi("create_user", { email: "shade010@hotmail.com", password: "123456", role: "moderator", full_name: "Shade" });
        callAdminApi("set_password_by_email", { email: "shade010@hotmail.com", password: "123456", role: "moderator", full_name: "Shade" });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAllowed, shadeEnsured]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">الرجاء تسجيل الدخول للوصول إلى لوحة الإدارة</p>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-destructive">غير مصرح بالوصول إلى هذه الصفحة</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">لوحة إدارة التطبيق</h1>
        <p className="text-muted-foreground">تحكم بالمشرفين والغرف</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>إنشاء غرفة جديدة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="اسم الغرفة" value={channelName} onChange={(e) => setChannelName(e.target.value)} />
            <Input placeholder="الوصف (اختياري)" value={channelDesc} onChange={(e) => setChannelDesc(e.target.value)} />
            <Button
              onClick={async () => {
                if (!channelName.trim()) {
                  toast({ title: "الاسم مطلوب", variant: "destructive" });
                  return;
                }
                const res = await callAdminApi("create_channel", { name: channelName.trim(), description: channelDesc.trim() || null });
                if (!res.error) {
                  toast({ title: "تم الإنشاء", description: "تم إنشاء الغرفة بنجاح" });
                  setChannelName("");
                  setChannelDesc("");
                  loadLists();
                }
              }}
            >
              إنشاء
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إدارة المشرفين</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">المشرفين الحاليين</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {users.filter(u => u.role === 'moderator').map((moderator) => (
                  <div key={moderator.id} className="flex items-center justify-between bg-accent/20 p-2 rounded">
                    <div className="text-sm">
                      <div className="font-medium">{moderator.full_name || moderator.email}</div>
                      <div className="text-xs text-muted-foreground">{moderator.email}</div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={async () => {
                        const res = await callAdminApi("revoke_moderator", { email: moderator.email.toLowerCase() });
                        if (!res.error) {
                          toast({ title: "تم السحب", description: `تم سحب الإشراف من ${moderator.email}` });
                          loadLists();
                        }
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      سحب الإشراف
                    </Button>
                  </div>
                ))}
                {users.filter(u => u.role === 'moderator').length === 0 && (
                  <p className="text-sm text-muted-foreground">لا يوجد مشرفين حالياً</p>
                )}
              </div>
            </div>
            
            <div className="pt-2 border-t space-y-3">
              <h4 className="font-medium text-sm">تعيين مشرف جديد</h4>
              <Input placeholder="بريد المستخدم" value={targetEmail} onChange={(e) => setTargetEmail(e.target.value)} />
              <Button 
                onClick={async () => {
                  if (!targetEmail.trim()) return;
                  const res = await callAdminApi("assign_moderator", { email: targetEmail.trim().toLowerCase() });
                  if (!res.error) {
                    toast({ title: "تم التعيين", description: `${targetEmail} الآن مشرف` });
                    loadLists();
                    setTargetEmail("");
                  }
                }}
                className="w-full"
              >
                تعيين مشرف
              </Button>
            </div>

            <div className="pt-2 border-t space-y-3">
              <h4 className="font-medium text-sm">إنشاء مستخدم مشرف جديد</h4>
              <div className="grid grid-cols-1 gap-2">
                <Input placeholder="البريد الإلكتروني" value={targetEmail} onChange={(e) => setTargetEmail(e.target.value)} />
                <Input placeholder="كلمة المرور" type="password" id="new-moderator-pass" />
                <Button 
                  onClick={async () => {
                    const pass = (document.getElementById("new-moderator-pass") as HTMLInputElement)?.value || "";
                    if (!targetEmail.trim() || !pass) {
                      toast({ title: "مطلوب البريد وكلمة المرور", variant: "destructive" });
                      return;
                    }
                    const res = await callAdminApi("create_user", { email: targetEmail.trim().toLowerCase(), password: pass, role: "moderator" });
                    if (!res.error) {
                      toast({ title: "تم الإنشاء", description: `أُنشئ ${targetEmail} كمشرف` });
                      (document.getElementById("new-moderator-pass") as HTMLInputElement).value = "";
                      setTargetEmail("");
                      loadLists();
                    }
                  }}
                  className="w-full"
                >
                  إنشاء مشرف
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>تعيين / سحب الإشراف</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="بريد المستخدم" value={targetEmail} onChange={(e) => setTargetEmail(e.target.value)} />
            <div className="flex gap-2">
              <Button onClick={async () => {
                if (!targetEmail.trim()) return;
                const res = await callAdminApi("assign_moderator", { email: targetEmail.trim().toLowerCase() });
                if (!res.error) {
                  toast({ title: "تم التعيين", description: `${targetEmail} الآن مشرف` });
                  loadLists();
                }
              }}>تعيين مشرف</Button>
              <Button variant="outline" onClick={async () => {
                if (!targetEmail.trim()) return;
                const res = await callAdminApi("revoke_moderator", { email: targetEmail.trim().toLowerCase() });
                if (!res.error) {
                  toast({ title: "تم السحب", description: `تم سحب الإشراف من ${targetEmail}` });
                  loadLists();
                }
              }}>سحب الإشراف</Button>
            </div>
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">إنشاء مستخدم (مشرف)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input placeholder="shade010@hotmail.com" value={targetEmail} onChange={(e) => setTargetEmail(e.target.value)} />
                  <Input placeholder="123456" type="password" id="new-pass" />
                  <Button onClick={async () => {
                    const pass = (document.getElementById("new-pass") as HTMLInputElement)?.value || "";
                    if (!targetEmail.trim() || !pass) return;
                    const res = await callAdminApi("create_user", { email: targetEmail.trim().toLowerCase(), password: pass, role: "moderator" });
                    if (!res.error) {
                      toast({ title: "تم الإنشاء", description: `أُنشئ ${targetEmail} كمشرف` });
                      (document.getElementById("new-pass") as HTMLInputElement).value = "";
                      loadLists();
                    }
                  }}>إنشاء</Button>
                </div>
              </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>المستخدمون</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-3">
              <Input placeholder="بحث بالاسم أو البريد" value={search} onChange={(e) => setSearch(e.target.value)} />
              <Button onClick={loadLists} disabled={loading}>بحث</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>البريد</TableHead>
                  <TableHead>الدور</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.full_name || "—"}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === 'admin' ? 'default' : u.role === 'moderator' ? 'secondary' : 'outline'}>
                        {u.role === 'admin' ? 'مدير' : u.role === 'moderator' ? 'مشرف' : 'مستخدم'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الغرف</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channels.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.description || "—"}</TableCell>
                    <TableCell>{c.is_active ? "نشط" : "غير نشط"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Admin;