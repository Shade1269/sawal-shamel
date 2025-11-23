import React from 'react';

/**
 * مكون قائمة الإشارات (@mentions)
 * Mentions autocomplete list component
 */

interface MentionsListProps {
  show: boolean;
  query: string;
  members: any[];
  onSelect: (name: string) => void;
}

export function MentionsList({ show, query, members, onSelect }: MentionsListProps) {
  if (!show || !query || members.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-24 right-6 z-[140] w-64 bg-popover border border-border rounded-lg shadow-soft">
      <div className="max-h-60 overflow-auto py-1">
        {members.map((m) => (
          <button
            key={m.user?.id}
            onClick={() => onSelect(m.user?.full_name || '')}
            className="w-full text-right px-3 py-2 hover:bg-muted arabic-text"
          >
            {m.user?.full_name}
          </button>
        ))}
      </div>
    </div>
  );
}
