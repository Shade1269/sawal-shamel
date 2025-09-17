import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export interface PageElement {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  properties: Record<string, any>;
  styles: Record<string, any>;
  content?: string;
  zIndex: number;
}

export interface PageBuilderState {
  elements: PageElement[];
  selectedElementId?: string;
  isPreviewMode: boolean;
  isDirty: boolean;
}

export const usePageBuilder = (pageId?: string) => {
  const [state, setState] = useState<PageBuilderState>({
    elements: [],
    selectedElementId: undefined,
    isPreviewMode: false,
    isDirty: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load page elements (Mock implementation - will be updated after database migration)
  const loadPage = useCallback(async (id: string) => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      // Mock data for demonstration
      const mockElements: PageElement[] = [
        {
          id: 'demo-hero-1',
          type: 'hero',
          position: { x: 0, y: 0 },
          size: { width: 800, height: 400 },
          properties: { title: 'مرحباً بك', subtitle: 'اكتشف منتجاتنا المميزة' },
          styles: { backgroundColor: '#f0f4f8' },
          zIndex: 0
        }
      ];

      setState(prev => ({
        ...prev,
        elements: mockElements,
        isDirty: false
      }));
      
      toast.success('تم تحميل الصفحة التجريبية');
    } catch (error: any) {
      console.error('Error loading page:', error);
      toast.error('فشل في تحميل الصفحة');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save page elements (Mock implementation - will be updated after database migration)
  const savePage = useCallback(async (id: string) => {
    if (!id || !state.isDirty) return;

    setIsSaving(true);
    try {
      // Mock save - just store in localStorage for demo
      const pageData = {
        id,
        elements: state.elements,
        lastModified: new Date().toISOString()
      };
      
      localStorage.setItem(`page-builder-${id}`, JSON.stringify(pageData));
      
      setState(prev => ({ ...prev, isDirty: false }));
      toast.success('تم حفظ الصفحة محلياً');
    } catch (error: any) {
      console.error('Error saving page:', error);
      toast.error('فشل في حفظ الصفحة');
    } finally {
      setIsSaving(false);
    }
  }, [state.elements, state.isDirty]);

  // Add element
  const addElement = useCallback((elementType: string, position?: { x: number; y: number }) => {
    const newElement: PageElement = {
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: elementType,
      position: position || { x: 100, y: 100 },
      size: { width: 200, height: 100 },
      properties: {},
      styles: {},
      zIndex: state.elements.length
    };

    setState(prev => ({
      ...prev,
      elements: [...prev.elements, newElement],
      selectedElementId: newElement.id,
      isDirty: true
    }));

    return newElement.id;
  }, [state.elements.length]);

  // Update element
  const updateElement = useCallback((id: string, updates: Partial<PageElement>) => {
    setState(prev => ({
      ...prev,
      elements: prev.elements.map(element =>
        element.id === id ? { ...element, ...updates } : element
      ),
      isDirty: true
    }));
  }, []);

  // Delete element
  const deleteElement = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      elements: prev.elements.filter(element => element.id !== id),
      selectedElementId: prev.selectedElementId === id ? undefined : prev.selectedElementId,
      isDirty: true
    }));
  }, []);

  // Select element
  const selectElement = useCallback((id?: string) => {
    setState(prev => ({
      ...prev,
      selectedElementId: id
    }));
  }, []);

  // Toggle preview mode
  const togglePreviewMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPreviewMode: !prev.isPreviewMode,
      selectedElementId: undefined
    }));
  }, []);

  // Duplicate element
  const duplicateElement = useCallback((id: string) => {
    const element = state.elements.find(el => el.id === id);
    if (!element) return;

    const newElement: PageElement = {
      ...element,
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: {
        x: element.position.x + 20,
        y: element.position.y + 20
      },
      zIndex: state.elements.length
    };

    setState(prev => ({
      ...prev,
      elements: [...prev.elements, newElement],
      selectedElementId: newElement.id,
      isDirty: true
    }));

    return newElement.id;
  }, [state.elements]);

  // Move element
  const moveElement = useCallback((id: string, position: { x: number; y: number }) => {
    updateElement(id, { position });
  }, [updateElement]);

  // Resize element
  const resizeElement = useCallback((id: string, size: { width: number; height: number }) => {
    updateElement(id, { size });
  }, [updateElement]);

  // Change z-index
  const changeZIndex = useCallback((id: string, direction: 'up' | 'down') => {
    const element = state.elements.find(el => el.id === id);
    if (!element) return;

    const newZIndex = direction === 'up' 
      ? Math.min(element.zIndex + 1, state.elements.length - 1)
      : Math.max(element.zIndex - 1, 0);

    updateElement(id, { zIndex: newZIndex });
  }, [state.elements, updateElement]);

  // Initialize with demo data if pageId is provided
  useEffect(() => {
    if (pageId && state.elements.length === 0) {
      loadPage(pageId);
    }
  }, [pageId, state.elements.length, loadPage]);

  // Get selected element
  const selectedElement = state.selectedElementId 
    ? state.elements.find(el => el.id === state.selectedElementId)
    : undefined;

  return {
    // State
    elements: state.elements,
    selectedElement,
    isPreviewMode: state.isPreviewMode,
    isDirty: state.isDirty,
    isLoading,
    isSaving,

    // Actions
    addElement,
    updateElement,
    deleteElement,
    selectElement,
    duplicateElement,
    moveElement,
    resizeElement,
    changeZIndex,
    togglePreviewMode,
    loadPage,
    savePage,

    // Utilities
    getElementsByType: (type: string) => state.elements.filter(el => el.type === type),
    getElementCount: () => state.elements.length,
    clearSelection: () => selectElement(undefined)
  };
};