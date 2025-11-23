/**
 * تبويب الإعدادات العامة - General Settings Tab
 * إدارة المعلومات الأساسية للمتجر
 */

import { Settings, Save, Copy } from 'lucide-react';
import {
  UnifiedCard as Card,
  UnifiedCardContent as CardContent,
  UnifiedCardDescription as CardDescription,
  UnifiedCardHeader as CardHeader,
  UnifiedCardTitle as CardTitle
} from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useDarkMode } from '@/shared/components/DarkModeProvider';
import type { Store, EditData } from './types';

interface GeneralSettingsTabProps {
  store: Store;
  isEditing: boolean;
  editData: EditData;
  onEditDataChange: (data: EditData) => void;
  onSave: () => void;
  onCopyLink: () => void;
  onCancelEdit: () => void;
}

export function GeneralSettingsTab({
  store,
  isEditing,
  editData,
  onEditDataChange,
  onSave,
  onCopyLink,
  onCancelEdit
}: GeneralSettingsTabProps) {
  const { isDarkMode } = useDarkMode();

  return (
    <Card className={`rounded-none md:rounded-xl border-x-0 md:border-x transition-colors duration-500 ${
      isDarkMode
        ? 'bg-slate-800/50 border-slate-700/50'
        : 'bg-white/95 border-slate-300/60 shadow-lg'
    }`}>
      <CardHeader className="p-4 md:p-6">
        <CardTitle className={`flex items-center gap-2 text-base md:text-lg transition-colors duration-500 ${
          isDarkMode ? 'text-white' : 'text-slate-800'
        }`}>
          <Settings className="h-4 w-4 md:h-5 md:w-5" />
          الإعدادات العامة
        </CardTitle>
        <CardDescription className={`text-xs md:text-sm transition-colors duration-500 ${
          isDarkMode ? 'text-muted-foreground' : 'text-slate-600'
        }`}>
          تحديث معلومات متجرك الأساسية
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4 md:p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="store_name" className={`text-sm font-semibold transition-colors duration-500 ${
              isDarkMode ? 'text-slate-200' : 'text-slate-800'
            }`}>اسم المتجر</Label>
            <Input
              id="store_name"
              value={isEditing ? editData.store_name : store.store_name}
              onChange={(e) => onEditDataChange({ ...editData, store_name: e.target.value })}
              disabled={!isEditing}
              className={`text-sm transition-colors duration-500 ${
                isDarkMode
                  ? 'bg-slate-700/50 border-slate-600/50 text-white'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="store_slug" className={`text-sm font-semibold transition-colors duration-500 ${
              isDarkMode ? 'text-slate-200' : 'text-slate-800'
            }`}>رابط المتجر</Label>
            <div className="flex items-center gap-2">
              <Input
                id="store_slug"
                value={store.store_slug}
                disabled
                className={`flex-1 text-sm transition-colors duration-500 ${
                  isDarkMode
                    ? 'bg-slate-700/50 border-slate-600/50 text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}
              />
              <Button size="sm" variant="outline" onClick={onCopyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className={`text-sm font-semibold transition-colors duration-500 ${
            isDarkMode ? 'text-slate-200' : 'text-slate-800'
          }`}>وصف المتجر</Label>
          <Textarea
            id="bio"
            value={isEditing ? editData.bio : store.bio}
            onChange={(e) => onEditDataChange({ ...editData, bio: e.target.value })}
            disabled={!isEditing}
            className={`min-h-20 text-sm transition-colors duration-500 ${
              isDarkMode
                ? 'bg-slate-700/50 border-slate-600/50 text-white'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          />
        </div>

        {isEditing && (
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
            <Button onClick={onSave} className="w-full md:w-auto" size="sm">
              <Save className="h-4 w-4 ml-2" />
              حفظ التغييرات
            </Button>
            <Button variant="outline" onClick={onCancelEdit} className="w-full md:w-auto" size="sm">
              إلغاء
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
