import React, { useState, useEffect, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
  Wifi,
  WifiOff,
  Clock,
  Zap
} from 'lucide-react';

const loaderVariants = cva(
  "w-full transition-all duration-500",
  {
    variants: {
      variant: {
        default: "bg-background border border-border rounded-lg p-4",
        glass: "glass-effect backdrop-blur-sm border border-border/30 rounded-lg p-4",
        luxury: "luxury-effect text-white rounded-lg p-4 shadow-luxury",
        persian: "persian-effect text-white rounded-lg p-4 shadow-persian",
        minimal: "bg-transparent p-2"
      },
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg"
      }
    },
    defaultVariants: {
      variant: "glass",
      size: "md"
    }
  }
);

export interface LoadingStep {
  id: string;
  label: string;
  description?: string;
  status: 'pending' | 'loading' | 'success' | 'error' | 'warning';
  progress?: number;
  duration?: number;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface ProgressiveLoaderProps 
  extends VariantProps<typeof loaderVariants> {
  steps: LoadingStep[];
  currentStep?: number;
  overall?: {
    progress: number;
    label?: string;
    eta?: string;
  };
  showDetails?: boolean;
  showProgress?: boolean;
  showETA?: boolean;
  onRetry?: (stepId: string) => void;
  onCancel?: () => void;
  className?: string;
}

const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  steps,
  currentStep = 0,
  overall,
  variant,
  size,
  showDetails = true,
  showProgress = true,
  showETA = true,
  onRetry,
  onCancel,
  className
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const progressRef = useRef(0);

  // Animate progress changes
  useEffect(() => {
    if (overall?.progress !== undefined) {
      const targetProgress = overall.progress;
      const startProgress = progressRef.current;
      const duration = 500;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        
        const currentValue = startProgress + (targetProgress - startProgress) * easedProgress;
        setAnimatedProgress(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          progressRef.current = targetProgress;
        }
      };

      requestAnimationFrame(animate);
    }
  }, [overall?.progress]);

  const getStepIcon = (step: LoadingStep) => {
    if (step.icon) return step.icon;

    switch (step.status) {
      case 'loading': return Loader2;
      case 'success': return CheckCircle;
      case 'error': return XCircle;
      case 'warning': return AlertCircle;
      default: return Clock;
    }
  };

  const getStepColor = (step: LoadingStep) => {
    switch (step.status) {
      case 'loading': return 'text-primary';
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStepBadge = (step: LoadingStep, index: number) => {
    if (step.status === 'success') return 'تم';
    if (step.status === 'error') return 'خطأ';
    if (step.status === 'warning') return 'تحذير';
    if (step.status === 'loading') return 'جاري...';
    if (index < currentStep) return 'مكتمل';
    if (index === currentStep) return 'نشط';
    return 'معلق';
  };

  const isCompleted = steps.every(step => step.status === 'success');
  const hasErrors = steps.some(step => step.status === 'error');

  return (
    <div className={cn(loaderVariants({ variant, size }), className)}>
      {/* Overall Progress */}
      {overall && showProgress && (
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : hasErrors ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              )}
              <span className="font-medium">
                {overall.label || 'جاري المعالجة...'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {showETA && overall.eta && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {overall.eta}
                </Badge>
              )}
              <span className="text-sm font-medium">
                {Math.round(animatedProgress)}%
              </span>
            </div>
          </div>

          <Progress 
            value={animatedProgress} 
            className="h-2"
          />
        </div>
      )}

      {/* Steps Details */}
      {showDetails && (
        <div className="space-y-3">
          {steps.map((step, index) => {
            const StepIcon = getStepIcon(step);
            const isActive = index === currentStep;
            const isCompleted = index < currentStep || step.status === 'success';

            return (
              <div 
                key={step.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-all duration-300",
                  isActive && "bg-accent/20 border border-accent/30",
                  isCompleted && "opacity-75",
                  step.status === 'error' && "bg-red-500/10 border border-red-500/20"
                )}
              >
                <div className="flex-shrink-0">
                  <StepIcon 
                    className={cn(
                      "h-5 w-5",
                      getStepColor(step),
                      step.status === 'loading' && "animate-spin"
                    )}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-medium truncate",
                      isActive && "text-accent-foreground"
                    )}>
                      {step.label}
                    </span>
                    <Badge 
                      variant={
                        step.status === 'success' ? 'default' :
                        step.status === 'error' ? 'destructive' :
                        step.status === 'warning' ? 'secondary' :
                        'outline'
                      }
                      className="text-xs"
                    >
                      {getStepBadge(step, index)}
                    </Badge>
                  </div>

                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {step.description}
                    </p>
                  )}

                  {/* Step Progress */}
                  {step.progress !== undefined && step.status === 'loading' && (
                    <div className="mt-2">
                      <Progress value={step.progress} className="h-1" />
                    </div>
                  )}
                </div>

                {/* Step Actions */}
                <div className="flex items-center gap-1">
                  {step.status === 'error' && onRetry && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRetry(step.id)}
                      className="h-6 w-6 p-0"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  )}

                  {step.duration && (
                    <span className="text-xs text-muted-foreground">
                      {step.duration}ms
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      {onCancel && !isCompleted && (
        <div className="flex justify-end mt-4 pt-4 border-t border-border/30">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="text-xs"
          >
            إلغاء
          </Button>
        </div>
      )}

      {/* Completion Message */}
      {isCompleted && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-700">
              تم إكمال جميع الخطوات بنجاح
            </span>
          </div>
        </div>
      )}

      {/* Error Summary */}
      {hasErrors && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-red-700">
              {steps.filter(s => s.status === 'error').length} خطوة فشلت
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Specialized Loaders
const FileUploadLoader: React.FC<{
  files: Array<{
    name: string;
    size: number;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
  }>;
  onRetry?: (fileName: string) => void;
}> = ({ files, onRetry }) => {
  const steps: LoadingStep[] = files.map(file => ({
    id: file.name,
    label: file.name,
    description: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    status: file.status === 'uploading' ? 'loading' : file.status,
    progress: file.progress,
    icon: Upload
  }));

  const overallProgress = files.length > 0 
    ? files.reduce((sum, file) => sum + file.progress, 0) / files.length 
    : 0;

  return (
    <ProgressiveLoader
      steps={steps}
      overall={{
        progress: overallProgress,
        label: 'رفع الملفات'
      }}
      variant="glass"
      onRetry={onRetry}
    />
  );
};

const NetworkStatusLoader: React.FC<{
  status: 'connected' | 'connecting' | 'disconnected' | 'slow';
  speed?: string;
  ping?: number;
}> = ({ status, speed, ping }) => {
  const steps: LoadingStep[] = [
    {
      id: 'connection',
      label: 'حالة الاتصال',
      status: status === 'connected' ? 'success' : 
             status === 'connecting' ? 'loading' : 'error',
      icon: status === 'disconnected' ? WifiOff : Wifi,
      description: status === 'connected' ? 'متصل' : 
                  status === 'connecting' ? 'جاري الاتصال...' : 'غير متصل'
    },
    {
      id: 'speed',
      label: 'سرعة الاتصال',
      status: speed ? 'success' : 'pending',
      icon: Zap,
      description: speed || 'غير محدد'
    },
    {
      id: 'ping',
      label: 'زمن الاستجابة',
      status: ping ? 'success' : 'pending',
      icon: Clock,
      description: ping ? `${ping}ms` : 'غير محدد'
    }
  ];

  return (
    <ProgressiveLoader
      steps={steps}
      variant="minimal"
      showProgress={false}
    />
  );
};

export { 
  ProgressiveLoader, 
  FileUploadLoader, 
  NetworkStatusLoader,
  loaderVariants 
};