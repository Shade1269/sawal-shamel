import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, 
  Search,
  Image,
  Video,
  FileText,
  Download,
  Trash2,
  Edit,
  Grid,
  List,
  Filter,
  X
} from 'lucide-react';
import { useMediaLibrary } from '@/hooks/useStoreCMS';
// Utility function for formatting file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface MediaLibraryProps {
  storeId: string;
  selectionMode?: boolean;
  onSelectMedia?: (media: any) => void;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({ 
  storeId, 
  selectionMode = false, 
  onSelectMedia 
}) => {
  const { data: mediaFiles, isLoading } = useMediaLibrary(storeId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<string>('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingFile, setEditingFile] = useState<any>(null);

  const fileTypes = {
    all: { label: 'جميع الملفات', icon: FileText },
    image: { label: 'الصور', icon: Image },
    video: { label: 'الفيديوهات', icon: Video },
    document: { label: 'المستندات', icon: FileText }
  };

  const filteredMedia = mediaFiles?.filter(file => {
    const matchesSearch = file.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (file.alt_text && file.alt_text.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || 
                       (filterType === 'image' && file.file_type.startsWith('image/')) ||
                       (filterType === 'video' && file.file_type.startsWith('video/')) ||
                       (filterType === 'document' && !file.file_type.startsWith('image/') && !file.file_type.startsWith('video/'));
    
    return matchesSearch && matchesType;
  });

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.startsWith('video/')) return Video;
    return FileText;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      // Here we would handle file upload to Supabase storage
      console.log('Files selected for upload:', files);
      setShowUploadDialog(true);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الملف؟')) {
      // Handle file deletion
      console.log('Delete file:', fileId);
    }
  };

  const handleEditFile = (file: any) => {
    setEditingFile(file);
    setShowEditDialog(true);
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">مكتبة الوسائط</h2>
          <p className="text-muted-foreground">إدارة صور وملفات المتجر</p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-4 h-4 mr-2" />
          رفع ملفات
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="البحث في الملفات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>

              <div className="flex items-center gap-2">
                {Object.entries(fileTypes).map(([type, config]) => {
                  const IconComponent = config.icon;
                  return (
                    <Button
                      key={type}
                      variant={filterType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterType(type)}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {config.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="flex items-center justify-between mt-4 p-3 bg-primary/10 rounded-md">
              <span className="text-sm">تم تحديد {selectedFiles.length} ملف</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  تحميل
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  حذف
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedFiles([])}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Grid/List */}
      <Card>
        <CardHeader>
          <CardTitle>الملفات ({filteredMedia?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredMedia?.map((file) => {
                const IconComponent = getFileIcon(file.file_type);
                const isSelected = selectedFiles.includes(file.id);
                
                return (
                  <div
                    key={file.id}
                    className={`relative group border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      isSelected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => selectionMode ? onSelectMedia?.(file) : toggleFileSelection(file.id)}
                  >
                    {file.file_type.startsWith('image/') ? (
                      <img
                        src={file.file_url}
                        alt={file.alt_text || file.file_name}
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                    ) : (
                      <div className="w-full h-24 flex items-center justify-center bg-muted rounded mb-2">
                        <IconComponent className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}

                    <div className="text-xs space-y-1">
                      <p className="font-medium truncate" title={file.file_name}>
                        {file.file_name}
                      </p>
                      <p className="text-muted-foreground">
                        {file.file_size && formatFileSize(file.file_size)}
                      </p>
                    </div>

                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditFile(file);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {isSelected && !selectionMode && (
                      <div className="absolute top-2 right-2">
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMedia?.map((file) => {
                const IconComponent = getFileIcon(file.file_type);
                const isSelected = selectedFiles.includes(file.id);
                
                return (
                  <div
                    key={file.id}
                    className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer ${
                      isSelected ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => selectionMode ? onSelectMedia?.(file) : toggleFileSelection(file.id)}
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-muted rounded">
                      {file.file_type.startsWith('image/') ? (
                        <img
                          src={file.file_url}
                          alt={file.alt_text || file.file_name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <IconComponent className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.file_name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{file.file_size && formatFileSize(file.file_size)}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(file.created_at), { addSuffix: true, locale: ar })}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditFile(file);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(file.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!filteredMedia?.length && (
            <div className="text-center py-12">
              <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">لا توجد ملفات</h3>
              <p className="text-muted-foreground mb-4">ابدأ برفع الصور والملفات إلى مكتبة الوسائط</p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                رفع أول ملف
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit File Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تحرير الملف</DialogTitle>
            <DialogDescription>
              قم بتحرير معلومات الملف
            </DialogDescription>
          </DialogHeader>

          {editingFile && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-name">اسم الملف</Label>
                <Input
                  id="file-name"
                  value={editingFile.file_name}
                  onChange={(e) => setEditingFile(prev => ({ ...prev, file_name: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="alt-text">النص البديل</Label>
                <Input
                  id="alt-text"
                  value={editingFile.alt_text || ''}
                  onChange={(e) => setEditingFile(prev => ({ ...prev, alt_text: e.target.value }))}
                  placeholder="وصف الملف للوصولية"
                />
              </div>

              <div>
                <Label htmlFor="tags">العلامات</Label>
                <Textarea
                  id="tags"
                  value={editingFile.tags?.join(', ') || ''}
                  onChange={(e) => setEditingFile(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  }))}
                  placeholder="علامة1, علامة2, علامة3"
                  rows={2}
                />
              </div>

              {editingFile.file_type.startsWith('image/') && (
                <div className="border rounded-lg p-4">
                  <img
                    src={editingFile.file_url}
                    alt={editingFile.alt_text || editingFile.file_name}
                    className="w-full h-48 object-cover rounded"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={() => setShowEditDialog(false)}>
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};