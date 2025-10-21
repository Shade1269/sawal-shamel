import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PageElement {
  id: string;
  type: string;
  name: string;
  gridColumn?: number;
  gridRow?: number;
  gridSpanX?: number;
  gridSpanY?: number;
  config: Record<string, any>;
  styles: Record<string, any>;
  data?: Record<string, any>;
  sortOrder: number;
  isVisible: boolean;
  isLocked: boolean;
  parentId?: string;
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

  // Load page elements
  const loadPage = useCallback(async (id: string) => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('page_builder_elements')
        .select('*')
        .eq('page_id', id)
        .order('z_index', { ascending: true });

      if (error) throw error;

      const elements: PageElement[] = data?.map(item => ({
        id: item.id,
        type: item.element_type,
        name: item.element_name,
        gridColumn: item.grid_column || 1,
        gridRow: item.grid_row || 1,
        gridSpanX: item.grid_span_x || 1,
        gridSpanY: item.grid_span_y || 1,
        config: (item.element_config as Record<string, any>) || {},
        styles: (item.element_styles as Record<string, any>) || {},
        data: (item.element_data as Record<string, any>) || {},
        sortOrder: item.sort_order || 0,
        isVisible: item.is_visible ?? true,
        isLocked: item.is_locked ?? false,
        parentId: item.parent_id || undefined
      })) || [];

      setState(prev => ({
        ...prev,
        elements,
        isDirty: false
      }));
    } catch (error: any) {
      console.error('Error loading page:', error);
      toast.error('فشل في تحميل الصفحة');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save page elements
  const savePage = useCallback(async (id: string) => {
    if (!id || !state.isDirty) return;

    setIsSaving(true);
    try {
      // Delete existing elements
      await supabase
        .from('page_builder_elements')
        .delete()
        .eq('page_id', id);

      // Insert new elements
      const elementsToInsert = state.elements.map(element => ({
        page_id: id,
        element_type: element.type,
        element_name: element.name,
        element_config: element.config,
        element_styles: element.styles,
        element_data: element.data || {},
        grid_column: element.gridColumn,
        grid_row: element.gridRow,
        grid_span_x: element.gridSpanX || 1,
        grid_span_y: element.gridSpanY || 1,
        sort_order: element.sortOrder,
        is_visible: element.isVisible,
        is_locked: element.isLocked,
        parent_id: element.parentId
      }));

      if (elementsToInsert.length > 0) {
        const { error } = await supabase
          .from('page_builder_elements')
          .insert(elementsToInsert);

        if (error) throw error;
      }

      setState(prev => ({ ...prev, isDirty: false }));
      toast.success('تم حفظ الصفحة بنجاح');
    } catch (error: any) {
      console.error('Error saving page:', error);
      toast.error('فشل في حفظ الصفحة');
    } finally {
      setIsSaving(false);
    }
  }, [state.elements, state.isDirty]);

  // Add element
  const addElement = useCallback((elementType: string, elementName?: string, gridPosition?: { column: number; row: number }) => {
    const newElement: PageElement = {
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: elementType,
      name: elementName || `عنصر ${elementType}`,
      gridColumn: gridPosition?.column || 1,
      gridRow: gridPosition?.row || state.elements.length + 1,
      gridSpanX: 1,
      gridSpanY: 1,
      config: {},
      styles: {},
      data: {},
      sortOrder: state.elements.length,
      isVisible: true,
      isLocked: false
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
      name: `${element.name} (نسخة)`,
      gridColumn: (element.gridColumn || 1) + 1,
      gridRow: element.gridRow || 1,
      sortOrder: state.elements.length
    };

    setState(prev => ({
      ...prev,
      elements: [...prev.elements, newElement],
      selectedElementId: newElement.id,
      isDirty: true
    }));

    return newElement.id;
  }, [state.elements]);

  // Move element (update grid position)
  const moveElement = useCallback((id: string, gridPosition: { column: number; row: number }) => {
    updateElement(id, { 
      gridColumn: gridPosition.column, 
      gridRow: gridPosition.row 
    });
  }, [updateElement]);

  // Resize element (update grid span)
  const resizeElement = useCallback((id: string, span: { x: number; y: number }) => {
    updateElement(id, { 
      gridSpanX: span.x, 
      gridSpanY: span.y 
    });
  }, [updateElement]);

  // Change sort order
  const changeSortOrder = useCallback((id: string, direction: 'up' | 'down') => {
    const element = state.elements.find(el => el.id === id);
    if (!element) return;

    const newSortOrder = direction === 'up' 
      ? Math.min(element.sortOrder + 1, state.elements.length - 1)
      : Math.max(element.sortOrder - 1, 0);

    updateElement(id, { sortOrder: newSortOrder });
  }, [state.elements, updateElement]);

  // Change Z-index (layer order)
  const changeZIndex = useCallback((id: string, direction: 'up' | 'down') => {
    const elements = [...state.elements];
    const elementIndex = elements.findIndex(el => el.id === id);
    if (elementIndex === -1) return;

    const targetIndex = direction === 'up' ? elementIndex + 1 : elementIndex - 1;
    if (targetIndex < 0 || targetIndex >= elements.length) return;

    // Swap elements
    [elements[elementIndex], elements[targetIndex]] = [elements[targetIndex], elements[elementIndex]];
    
    setState(prev => ({
      ...prev,
      elements,
      isDirty: true
    }));
  }, [state.elements]);

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
    clearSelection: () => selectElement(undefined),
    
    // Grid utilities
    moveElementInGrid: (id: string, column: number, row: number) => moveElement(id, { column, row }),
    resizeElementInGrid: (id: string, spanX: number, spanY: number) => resizeElement(id, { x: spanX, y: spanY }),
    changeSortOrder
  };
};