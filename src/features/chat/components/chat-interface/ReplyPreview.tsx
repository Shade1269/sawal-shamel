import React from 'react';
import { Button } from '@/components/ui/button';
import type { ReplyingTo } from './types';

/**
 * مكون معاينة الرد
 * Reply preview component
 */

interface ReplyPreviewProps {
  replyingTo: ReplyingTo | null;
  onCancel: () => void;
}

export function ReplyPreview({ replyingTo, onCancel }: ReplyPreviewProps) {
  if (!replyingTo) {
    return null;
  }

  return (
    <div className="mb-3 p-2 bg-accent/20 rounded-lg border-r-2 border-primary">
      <div className="flex items-center justify-between">
        <div className="text-sm arabic-text">
          <span className="text-muted-foreground">رد على: </span>
          <span>{replyingTo.content.substring(0, 50)}...</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-6 w-6 p-0">
          ×
        </Button>
      </div>
    </div>
  );
}
