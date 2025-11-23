import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedButton as Button } from "@/components/design-system";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from "@/components/design-system";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

interface Brand {
  id: string;
  name: string;
  slug?: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  is_active: boolean;
  created_at: string;
}

export default function BrandManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website_url: "",
    is_active: true
  });

  const queryClient = useQueryClient();

  const { data: brands, isLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_brands")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data as Brand[];
    }
  });

  const createBrandMutation = useMutation({
    mutationFn: async (data: any) => {
      const slug = data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const { error } = await supabase
        .from("product_brands")
        .insert({ ...data, slug });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setIsDialogOpen(false);
      resetForm();
      toast.success("تم إنشاء العلامة التجارية بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ في إنشاء العلامة التجارية: " + error.message);
    }
  });

  const updateBrandMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const slug = data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const { error } = await supabase
        .from("product_brands")
        .update({ ...data, slug })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setIsDialogOpen(false);
      setEditingBrand(null);
      resetForm();
      toast.success("تم تحديث العلامة التجارية بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ في تحديث العلامة التجارية: " + error.message);
    }
  });

  const deleteBrandMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("product_brands")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success("تم حذف العلامة التجارية بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ في حذف العلامة التجارية: " + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      website_url: "",
      is_active: true
    });
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description || "",
      website_url: brand.website_url || "",
      is_active: brand.is_active
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBrand) {
      updateBrandMutation.mutate({ id: editingBrand.id, data: formData });
    } else {
      createBrandMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه العلامة التجارية؟")) {
      deleteBrandMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">جاري تحميل العلامات التجارية...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-persian">إدارة العلامات التجارية</h1>
          <p className="text-muted-foreground mt-2">إدارة وتنظيم العلامات التجارية للمنتجات</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingBrand(null); resetForm(); }}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة علامة تجارية
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingBrand ? "تعديل العلامة التجارية" : "إضافة علامة تجارية جديدة"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">اسم العلامة التجارية</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="website_url">رابط الموقع الإلكتروني</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">علامة تجارية نشطة</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  disabled={createBrandMutation.isPending || updateBrandMutation.isPending}
                >
                  {editingBrand ? "تحديث" : "إنشاء"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {brands?.map((brand) => (
          <Card key={brand.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>{brand.name}</span>
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(brand)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(brand.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {brand.logo_url && (
                <div className="mb-3">
                  <img 
                    src={brand.logo_url} 
                    alt={brand.name}
                    className="w-16 h-16 object-contain"
                  />
                </div>
              )}
              
              {brand.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {brand.description}
                </p>
              )}
              
              {brand.website_url && (
                <a 
                  href={brand.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline mb-2 block"
                >
                  زيارة الموقع
                </a>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  brand.is_active 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  {brand.is_active ? "نشط" : "غير نشط"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {brands?.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-muted-foreground mb-4">لا توجد علامات تجارية محددة بعد</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              إضافة أول علامة تجارية
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}