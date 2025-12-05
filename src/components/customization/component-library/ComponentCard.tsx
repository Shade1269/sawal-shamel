import React from 'react';
import { Star, Download, Bookmark, BookmarkCheck, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ComponentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  preview: string;
  code: string;
  props: Record<string, any>;
  rating: number;
  downloads: number;
  created_at: string;
  updated_at: string;
  featured: boolean;
  premium: boolean;
}

interface ComponentCardProps {
  component: ComponentTemplate;
  viewMode: 'grid' | 'list';
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onPreview: () => void;
  userRole: string;
}

/**
 * بطاقة عرض قالب المكون
 * تعرض معلومات المكون، إحصائياته، وأزرار الإجراءات
 *
 * تم استخراجه من ComponentLibrary.tsx في 2025-11-22
 */
export const ComponentCard: React.FC<ComponentCardProps> = ({
  component,
  viewMode,
  isFavorite,
  onSelect,
  onToggleFavorite,
  onPreview,
  userRole
}) => {
  const isLocked = component.premium && userRole === 'basic';

  return (
    <Card className={`group cursor-pointer transition-all hover:shadow-lg ${
      viewMode === 'list' ? 'flex' : ''
    } ${isLocked ? 'opacity-75' : ''}`}>
      <div className={viewMode === 'list' ? 'flex-shrink-0 w-32' : ''}>
        <div className="relative aspect-video bg-muted overflow-hidden rounded-t-lg">
          <img
            src={component.preview}
            alt={component.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />

          {component.premium && (
            <Badge className="absolute top-2 right-2 bg-warning text-warning-foreground">
              Premium
            </Badge>
          )}

          {component.featured && (
            <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
              مميز
            </Badge>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button size="icon" variant="secondary" onClick={onPreview}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="secondary" onClick={onSelect}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CardContent className={`${viewMode === 'list' ? 'flex-1' : ''} p-4`}>
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold truncate">{component.name}</h3>
          <Button
            size="icon"
            variant="ghost"
            onClick={onToggleFavorite}
            className="flex-shrink-0"
          >
            {isFavorite ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {component.description}
        </p>

        <div className="flex items-center gap-2 mb-3">
          {component.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-warning" />
              <span>{component.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-4 w-4 text-muted-foreground" />
              <span>{component.downloads}</span>
            </div>
          </div>

          <span className="text-muted-foreground">
            {component.author.name}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
