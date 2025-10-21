import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  fallbackRoute?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
}

export const BackButton = ({ 
  fallbackRoute = "/", 
  className = "", 
  variant = "ghost" 
}: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    const currentPath = window.location.pathname;

    // إذا كان في صفحة متجر، ارجع للصفحة الرئيسية
    if (currentPath.startsWith('/store/')) {
      navigate('/');
      return;
    }

    // استخدم مؤشر history الخاص بـ React Router v6 إن وُجد
    const state = (window.history.state || {}) as { idx?: number };

    // إن وُجد سجل تنقل داخل التطبيق ارجع خطوة، وإلا استخدم مسار الـ fallback
    if (typeof state.idx === 'number' && state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackRoute);
    }
  };

  return (
    <Button 
      variant={variant}
      onClick={handleBack}
      className={`gap-2 ${className}`}
    >
      <ArrowRight className="h-4 w-4" />
      رجوع
    </Button>
  );
};