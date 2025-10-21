import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageRemove?: () => void;
  currentImage?: string;
  accept?: string;
  maxSize?: number;
  className?: string;
  children?: React.ReactNode;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  onImageRemove,
  currentImage,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB
  className,
  children
}) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      alert('الرجاء اختيار ملف صورة صالح');
      return;
    }

    // التحقق من حجم الملف
    if (file.size > maxSize) {
      alert(`حجم الملف كبير جداً. الحد الأقصى ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    onImageSelect(file);
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  if (currentImage) {
    return (
      <div className={cn("relative group", className)}>
        <img 
          src={currentImage} 
          alt="Preview" 
          className="w-full h-full object-cover rounded-lg"
        />
        {onImageRemove && (
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onImageRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={openFileDialog}
        >
          <Upload className="h-4 w-4 mr-1" />
          تغيير
        </Button>
        <Input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center transition-colors cursor-pointer hover:border-muted-foreground/50",
        dragActive && "border-primary bg-primary/5",
        className
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={openFileDialog}
    >
      {children || (
        <>
          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-4">
            اسحب وأفلت صورة هنا أو انقر للاختيار
          </p>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            رفع صورة
          </Button>
        </>
      )}
      
      <Input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
};