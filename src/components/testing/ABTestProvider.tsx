import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface ABTest {
  id: string;
  name: string;
  description?: string;
  variants: ABVariant[];
  status: 'draft' | 'active' | 'paused' | 'completed';
  trafficSplit: number; // Percentage of users to include in test
  startDate: Date;
  endDate?: Date;
  targetMetric: string;
  createdAt: Date;
}

interface ABVariant {
  id: string;
  name: string;
  description?: string;
  weight: number; // Percentage allocation (should sum to 100 across variants)
  config?: Record<string, any>;
}

interface ABTestAssignment {
  testId: string;
  variantId: string;
  assignedAt: Date;
}

interface ABTestResult {
  testId: string;
  variantId: string;
  metric: string;
  value: number;
  timestamp: Date;
}

interface ABTestContextValue {
  getVariant: (testId: string) => string | null;
  trackConversion: (testId: string, metricName: string, value?: number) => void;
  isInTest: (testId: string) => boolean;
  getAllAssignments: () => ABTestAssignment[];
}

const ABTestContext = createContext<ABTestContextValue | null>(null);

interface ABTestProviderProps {
  children: ReactNode;
  userId?: string;
  tests?: ABTest[];
}

export const ABTestProvider: React.FC<ABTestProviderProps> = ({
  children,
  userId,
  tests = []
}) => {
  const [assignments, setAssignments] = useState<ABTestAssignment[]>([]);
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    // Load existing assignments from localStorage
    const stored = localStorage.getItem('ab_test_assignments');
    if (stored) {
      try {
        setAssignments(JSON.parse(stored));
      } catch (error) {
        console.warn('Failed to load AB test assignments:', error);
      }
    }

    // Assign user to active tests
    assignToActiveTests();
  }, [userId, tests]);

  const assignToActiveTests = () => {
    const activeTests = tests.filter(test => 
      test.status === 'active' && 
      (!test.endDate || test.endDate > new Date())
    );

    const newAssignments: ABTestAssignment[] = [...assignments];

    activeTests.forEach(test => {
      // Check if user is already assigned to this test
      const existingAssignment = assignments.find(a => a.testId === test.id);
      if (existingAssignment) return;

      // Check if user should be included in test (traffic split)
      const shouldInclude = Math.random() * 100 < test.trafficSplit;
      if (!shouldInclude) return;

      // Assign to variant based on weights
      const variant = selectVariant(test.variants);
      if (!variant) return;

      const assignment: ABTestAssignment = {
        testId: test.id,
        variantId: variant.id,
        assignedAt: new Date()
      };

      newAssignments.push(assignment);

      // Track assignment
      trackEvent('ab_test', 'assignment', test.name, undefined, {
        testId: test.id,
        variantId: variant.id,
        variantName: variant.name
      });
    });

    if (newAssignments.length !== assignments.length) {
      setAssignments(newAssignments);
      localStorage.setItem('ab_test_assignments', JSON.stringify(newAssignments));
    }
  };

  const selectVariant = (variants: ABVariant[]): ABVariant | null => {
    const totalWeight = variants.reduce((sum, variant) => sum + variant.weight, 0);
    if (totalWeight === 0) return null;

    let random = Math.random() * totalWeight;
    
    for (const variant of variants) {
      random -= variant.weight;
      if (random <= 0) {
        return variant;
      }
    }
    
    return variants[0]; // Fallback
  };

  const getVariant = (testId: string): string | null => {
    const assignment = assignments.find(a => a.testId === testId);
    return assignment?.variantId || null;
  };

  const trackConversion = (testId: string, metricName: string, value: number = 1) => {
    const assignment = assignments.find(a => a.testId === testId);
    if (!assignment) return;

    const test = tests.find(t => t.id === testId);
    if (!test) return;

    // Track conversion
    trackEvent('ab_test', 'conversion', test.name, value, {
      testId,
      variantId: assignment.variantId,
      metric: metricName
    });

    // Store result locally
    const result: ABTestResult = {
      testId,
      variantId: assignment.variantId,
      metric: metricName,
      value,
      timestamp: new Date()
    };

    const storedResults = JSON.parse(localStorage.getItem('ab_test_results') || '[]');
    storedResults.push(result);
    localStorage.setItem('ab_test_results', JSON.stringify(storedResults));
  };

  const isInTest = (testId: string): boolean => {
    return assignments.some(a => a.testId === testId);
  };

  const getAllAssignments = (): ABTestAssignment[] => {
    return assignments;
  };

  const contextValue: ABTestContextValue = {
    getVariant,
    trackConversion,
    isInTest,
    getAllAssignments
  };

  return (
    <ABTestContext.Provider value={contextValue}>
      {children}
    </ABTestContext.Provider>
  );
};

export const useABTest = () => {
  const context = useContext(ABTestContext);
  if (!context) {
    throw new Error('useABTest must be used within ABTestProvider');
  }
  return context;
};

// Hook for individual test
export const useABTestVariant = (testId: string) => {
  const { getVariant, trackConversion, isInTest } = useABTest();
  
  const variant = getVariant(testId);
  const inTest = isInTest(testId);
  
  const trackTestConversion = (metricName: string, value?: number) => {
    trackConversion(testId, metricName, value);
  };

  return {
    variant,
    inTest,
    trackConversion: trackTestConversion
  };
};

// Predefined tests configuration
export const DefaultABTests: ABTest[] = [
  {
    id: 'hero_button_color',
    name: 'Hero Button Color Test',
    description: 'Test different button colors on homepage',
    variants: [
      { id: 'control', name: 'Blue Button', weight: 50 },
      { id: 'variant_a', name: 'Green Button', weight: 50 }
    ],
    status: 'active',
    trafficSplit: 50,
    startDate: new Date(),
    targetMetric: 'click_through_rate',
    createdAt: new Date()
  },
  {
    id: 'checkout_flow',
    name: 'Checkout Flow Optimization', 
    description: 'Single page vs multi-step checkout',
    variants: [
      { id: 'single_page', name: 'Single Page Checkout', weight: 50 },
      { id: 'multi_step', name: 'Multi-Step Checkout', weight: 50 }
    ],
    status: 'active',
    trafficSplit: 30,
    startDate: new Date(),
    targetMetric: 'conversion_rate',
    createdAt: new Date()
  },
  {
    id: 'product_card_layout',
    name: 'Product Card Layout',
    description: 'Test different product card designs',
    variants: [
      { id: 'compact', name: 'Compact Layout', weight: 33 },
      { id: 'detailed', name: 'Detailed Layout', weight: 33 },
      { id: 'minimal', name: 'Minimal Layout', weight: 34 }
    ],
    status: 'active',
    trafficSplit: 25,
    startDate: new Date(),
    targetMetric: 'add_to_cart_rate',
    createdAt: new Date()
  }
];

// AB Test utilities
export const ABTestUtils = {
  // Get test results
  getResults: (testId?: string): ABTestResult[] => {
    const stored = JSON.parse(localStorage.getItem('ab_test_results') || '[]');
    return testId ? stored.filter((r: ABTestResult) => r.testId === testId) : stored;
  },

  // Calculate conversion rates
  calculateConversionRate: (testId: string, metric: string) => {
    const results = ABTestUtils.getResults(testId);
    const assignments = JSON.parse(localStorage.getItem('ab_test_assignments') || '[]');
    
    const testAssignments = assignments.filter((a: ABTestAssignment) => a.testId === testId);
    const conversions = results.filter(r => r.metric === metric);

    const byVariant: Record<string, { assignments: number; conversions: number; rate: number }> = {};

    testAssignments.forEach((assignment: ABTestAssignment) => {
      if (!byVariant[assignment.variantId]) {
        byVariant[assignment.variantId] = { assignments: 0, conversions: 0, rate: 0 };
      }
      byVariant[assignment.variantId].assignments++;
    });

    conversions.forEach((conversion: ABTestResult) => {
      if (byVariant[conversion.variantId]) {
        byVariant[conversion.variantId].conversions++;
      }
    });

    Object.keys(byVariant).forEach(variantId => {
      const variant = byVariant[variantId];
      variant.rate = variant.assignments > 0 ? (variant.conversions / variant.assignments) * 100 : 0;
    });

    return byVariant;
  },

  // Clear test data
  clearTestData: () => {
    localStorage.removeItem('ab_test_assignments');
    localStorage.removeItem('ab_test_results');
  }
};