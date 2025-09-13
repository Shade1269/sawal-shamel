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
    // تحقق من الصفحة الحالية لتجنب التنقل الخاطئ
    const currentPath = window.location.pathname;
    
    // إذا كان في صفحة متجر، ارجع للصفحة الرئيسية
    if (currentPath.startsWith('/store/')) {
      navigate('/');
      return;
    }
    
    // إذا كان التاريخ متوفر، ارجع خطوة
    if (window.history.length > 1) {
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