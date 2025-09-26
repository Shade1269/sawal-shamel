import { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, ChevronRight } from "lucide-react";

interface BreadcrumbConfig {
  [key: string]: {
    title: string;
    parent?: string;
  };
}

const breadcrumbConfig: BreadcrumbConfig = {
  "/": { title: "الرئيسية" },
  "/affiliate": { title: "مركز المسوق", parent: "/" },
  "/affiliate/storefront": { title: "واجهة المتجر", parent: "/affiliate" },
  "/affiliate/orders": { title: "الطلبات", parent: "/affiliate" },
  "/affiliate/analytics": { title: "التحليلات", parent: "/affiliate" },
  "/admin": { title: "لوحة الإدارة", parent: "/" },
  "/admin/dashboard": { title: "نظرة عامة", parent: "/admin" },
  "/admin/orders": { title: "الطلبات", parent: "/admin" },
  "/admin/inventory": { title: "المخزون", parent: "/admin" },
  "/admin/analytics": { title: "التحليلات", parent: "/admin" },
  "/checkout": { title: "إتمام الطلب", parent: "/" },
  "/order/confirmation": { title: "تأكيد الطلب", parent: "/" },
  "/auth": { title: "تسجيل الدخول", parent: "/" },
  "/auth/reset": { title: "استعادة كلمة المرور", parent: "/auth" },
};

export function AppBreadcrumb() {
  const location = useLocation();
  const currentPath = location.pathname;

  const breadcrumbItems = useMemo(() => {
    const items: Array<{ title: string; path: string; isLast: boolean }> = [];
    
    const buildBreadcrumb = (path: string) => {
      const config = breadcrumbConfig[path];
      if (!config) return;
      
      if (config.parent) {
        buildBreadcrumb(config.parent);
      }
      
      items.push({
        title: config.title,
        path,
        isLast: path === currentPath
      });
    };

    // Handle dynamic routes
    let pathToCheck = currentPath;
    
    // Check for exact match first
    if (!breadcrumbConfig[pathToCheck]) {
      // Try to match dynamic routes like /s/:store_slug or /admin/users/:id
      const pathSegments = pathToCheck.split('/').filter(Boolean);
      
      // For routes like /s/store-name, use /s/:store_slug config if exists
      if (pathSegments.length >= 2) {
        const basePath = `/${pathSegments[0]}`;
        if (breadcrumbConfig[basePath]) {
          pathToCheck = basePath;
        }
      }
      
      // For nested routes, try parent paths
      if (!breadcrumbConfig[pathToCheck]) {
        for (let i = pathSegments.length - 1; i > 0; i--) {
          const testPath = '/' + pathSegments.slice(0, i).join('/');
          if (breadcrumbConfig[testPath]) {
            pathToCheck = testPath;
            break;
          }
        }
      }
    }

    buildBreadcrumb(pathToCheck);
    
    // If no breadcrumb found, at least show current page name
    if (items.length === 0) {
      const segments = currentPath.split('/').filter(Boolean);
      const currentPageName = segments[segments.length - 1]?.replace(/-/g, ' ') || 'الصفحة الحالية';
      items.push({
        title: currentPageName,
        path: currentPath,
        isLast: true
      });
    }

    return items;
  }, [currentPath]);

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-muted/30 border-b">
      <Breadcrumb>
        <BreadcrumbList className="flex-wrap">
          {breadcrumbItems.map((item, index) => (
            <div key={item.path} className="flex items-center">
              <BreadcrumbItem>
                {item.isLast ? (
                  <BreadcrumbPage className="font-medium text-foreground text-xs sm:text-sm">
                    {item.title}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link 
                      to={item.path}
                      className="text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm"
                    >
                      {index === 0 && item.path === "/" ? (
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <Home className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">{item.title}</span>
                        </div>
                      ) : (
                        <span className="truncate max-w-[100px] sm:max-w-none">{item.title}</span>
                      )}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!item.isLast && index < breadcrumbItems.length - 1 && (
                <BreadcrumbSeparator>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </BreadcrumbSeparator>
              )}
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}