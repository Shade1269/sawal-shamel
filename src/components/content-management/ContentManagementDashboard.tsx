import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Layout, 
  Blocks, 
  Search, 
  BarChart3,
  History,
  Settings,
  Plus
} from 'lucide-react';
import { PagesManagementSection } from './PagesManagementSection';
import { TemplatesLibrarySection } from './TemplatesLibrarySection';
import { WidgetsManagementSection } from './WidgetsManagementSection';
import { SEOAnalyticsSection } from './SEOAnalyticsSection';
import { ContentBlocksSection } from './ContentBlocksSection';

export function ContentManagementDashboard() {
  return (
    <div className="min-h-screen gradient-header p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text-primary">
                نظام إدارة المحتوى
              </h1>
              <p className="text-muted-foreground mt-1">
                إدارة الصفحات والمحتوى والقوالب بشكل احترافي
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              صفحة جديدة
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <FileText className="h-5 w-5 text-primary" />
                  <Badge variant="secondary">+12</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-sm text-muted-foreground">إجمالي الصفحات</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Layout className="h-5 w-5 text-green-500" />
                  <Badge variant="secondary">8</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">16</div>
                <p className="text-sm text-muted-foreground">الصفحات المنشورة</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Blocks className="h-5 w-5 text-orange-500" />
                  <Badge variant="secondary">5</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">31</div>
                <p className="text-sm text-muted-foreground">عناصر المحتوى</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    85%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.4k</div>
                <p className="text-sm text-muted-foreground">زيارات الصفحات</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="pages" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-none lg:flex">
            <TabsTrigger value="pages" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">الصفحات</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <Layout className="h-4 w-4" />
              <span className="hidden sm:inline">القوالب</span>
            </TabsTrigger>
            <TabsTrigger value="widgets" className="gap-2">
              <Blocks className="h-4 w-4" />
              <span className="hidden sm:inline">العناصر</span>
            </TabsTrigger>
            <TabsTrigger value="blocks" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">المكتبة</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">التحسين</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="space-y-6">
            <PagesManagementSection />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <TemplatesLibrarySection />
          </TabsContent>

          <TabsContent value="widgets" className="space-y-6">
            <WidgetsManagementSection />
          </TabsContent>

          <TabsContent value="blocks" className="space-y-6">
            <ContentBlocksSection />
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <SEOAnalyticsSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}