import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Layout, 
  Layers, 
  Palette, 
  Settings, 
  Eye,
  Save,
  Download,
  Share2,
  Plus,
  Grid
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PageBuilderCanvas } from './PageBuilderCanvas';
import { ComponentLibraryPanel } from './ComponentLibraryPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { LayersPanel } from './LayersPanel';
import { VisualThemeEditor } from './VisualThemeEditor';

export const VisualPageBuilderDashboard: React.FC = () => {
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
                  <Layout className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold gradient-text-accent">
                    منشئ الصفحات المرئي
                  </h1>
                  <p className="text-muted-foreground">صمم صفحات تفاعلية بسهولة</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-2">
                <Grid className="w-4 h-4" />
                الإصدار المتقدم
              </Badge>
              
              <Button
                variant={previewMode ? "default" : "outline"}
                onClick={() => setPreviewMode(!previewMode)}
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                {previewMode ? 'تحرير' : 'معاينة'}
              </Button>
              
              <Button variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" />
                مشاركة
              </Button>
              
              <Button className="gap-2 gradient-btn-accent">
                <Save className="w-4 h-4" />
                حفظ ونشر
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar */}
        {!previewMode && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-80 border-r bg-background/50 backdrop-blur-sm"
          >
            <Tabs defaultValue="components" className="h-full">
              <TabsList className="grid w-full grid-cols-4 p-1 m-4">
                <TabsTrigger value="components" className="text-xs">
                  <Layout className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="layers" className="text-xs">
                  <Layers className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="theme" className="text-xs">
                  <Palette className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="properties" className="text-xs">
                  <Settings className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>

              <div className="px-4 pb-4 h-[calc(100%-80px)] overflow-y-auto">
                <TabsContent value="components" className="mt-0">
                  <ComponentLibraryPanel />
                </TabsContent>
                
                <TabsContent value="layers" className="mt-0">
                  <LayersPanel />
                </TabsContent>
                
                <TabsContent value="theme" className="mt-0">
                  <VisualThemeEditor />
                </TabsContent>
                
                <TabsContent value="properties" className="mt-0">
                  <PropertiesPanel selectedElement={selectedElement} />
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        )}

        {/* Main Canvas */}
        <div className="flex-1 flex flex-col">
          <PageBuilderCanvas
            previewMode={previewMode}
            onElementSelect={setSelectedElement}
          />
        </div>
      </div>
    </div>
  );
};