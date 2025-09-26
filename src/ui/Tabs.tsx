import type { KeyboardEvent } from "react";
import React, {
  HTMLAttributes,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import clsx from "clsx";

export type TabsOrientation = "horizontal" | "vertical";
export type TabsActivationMode = "automatic" | "manual";

type TabsContextValue = {
  value: string;
  setValue: (nextValue: string) => void;
  orientation: TabsOrientation;
  activationMode: TabsActivationMode;
  baseId: string;
  tabsRef: React.MutableRefObject<Map<string, HTMLButtonElement>>;
  registerTab: (tabValue: string, element: HTMLButtonElement | null) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(`${component} must be used within <Tabs />`);
  }
  return context;
}

function sanitizeValue(value: string): string {
  const safe = value
    .toString()
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return safe.length > 0 ? safe : "item";
}

export type TabsProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: TabsOrientation;
  activationMode?: TabsActivationMode;
} & HTMLAttributes<HTMLDivElement>;

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    value: valueProp,
    defaultValue,
    onValueChange,
    orientation = "horizontal",
    activationMode = "automatic",
    className,
    children,
    ...rest
  },
  ref
) {
  const isControlled = valueProp != null;
  const initialValue = valueProp ?? defaultValue ?? "";
  const [internalValue, setInternalValue] = useState(initialValue);
  const activeValue = isControlled ? (valueProp as string) : internalValue;
  const tabsRef = useRef(new Map<string, HTMLButtonElement>());
  const baseId = useId();

  const setValue = useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange]
  );

  const registerTab = useCallback(
    (tabValue: string, element: HTMLButtonElement | null) => {
      if (element) {
        tabsRef.current.set(tabValue, element);
        if (!isControlled) {
          setInternalValue((current) => (current ? current : tabValue));
        }
      } else {
        tabsRef.current.delete(tabValue);
      }
    },
    [isControlled]
  );

  const contextValue = useMemo<TabsContextValue>(
    () => ({
      value: activeValue,
      setValue,
      orientation,
      activationMode,
      baseId,
      tabsRef,
      registerTab,
    }),
    [activeValue, activationMode, baseId, orientation, registerTab, setValue]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        {...rest}
        ref={ref}
        className={clsx("kit-tabs", className)}
        data-orientation={orientation}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
});

export type TabsListProps = HTMLAttributes<HTMLDivElement> & {
  "aria-label"?: string;
};

function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(node);
      } else {
        (ref as React.MutableRefObject<T>).current = node;
      }
    });
  };
}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { className, onKeyDown, ...rest },
  ref
) {
  const { orientation, activationMode, setValue } = useTabsContext("TabsList");
  const localRef = useRef<HTMLDivElement | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) {
        return;
      }

      const isHorizontal = orientation === "horizontal";
      const isVertical = orientation === "vertical";
      const key = event.key;
      const isNext =
        (isHorizontal && key === "ArrowRight") || (isVertical && key === "ArrowDown");
      const isPrevious =
        (isHorizontal && key === "ArrowLeft") || (isVertical && key === "ArrowUp");
      const isHome = key === "Home";
      const isEnd = key === "End";

      if (!isNext && !isPrevious && !isHome && !isEnd) {
        return;
      }

      const container = localRef.current;
      const tabs = container?.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]:not([data-disabled="true"])'
      );

      if (!tabs || tabs.length === 0) {
        return;
      }

      const currentElement = document.activeElement as HTMLElement | null;
      let index = Array.from(tabs).findIndex((tab) => tab === currentElement);
      if (index === -1) {
        index = Array.from(tabs).findIndex((tab) => tab.getAttribute("data-state") === "active");
      }

      let targetIndex = index;
      if (isNext) {
        targetIndex = (index + 1 + tabs.length) % tabs.length;
      } else if (isPrevious) {
        targetIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (isHome) {
        targetIndex = 0;
      } else if (isEnd) {
        targetIndex = tabs.length - 1;
      }

      const target = tabs[targetIndex];
      if (!target) {
        return;
      }

      event.preventDefault();
      target.focus();
      if (activationMode === "automatic") {
        const nextValue = target.getAttribute("data-value");
        if (nextValue) {
          setValue(nextValue);
        }
      }
    },
    [activationMode, onKeyDown, orientation, setValue]
  );

  return (
    <div
      {...rest}
      ref={composeRefs(ref, localRef)}
      className={clsx("kit-tabs__list", className)}
      role="tablist"
      aria-orientation={orientation}
      onKeyDown={handleKeyDown}
    />
  );
});

export type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
  disabled?: boolean;
};

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(
  { value, disabled = false, className, onClick, onFocus, children, ...rest },
  ref
) {
  const { value: activeValue, setValue, activationMode, baseId, registerTab } =
    useTabsContext("TabsTrigger");
  const safeValue = sanitizeValue(value);
  const triggerId = `${baseId}-tab-${safeValue}`;
  const panelId = `${baseId}-panel-${safeValue}`;
  const isActive = activeValue === value;

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    setValue(value);
    onClick?.(event);
  };

  const handleFocus: React.FocusEventHandler<HTMLButtonElement> = (event) => {
    if (activationMode === "automatic" && !disabled) {
      setValue(value);
    }
    onFocus?.(event);
  };

  const composedRef = useCallback(
    (node: HTMLButtonElement | null) => {
      registerTab(value, node);
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      }
    },
    [ref, registerTab, value]
  );

  return (
    <button
      {...rest}
      ref={composedRef}
      role="tab"
      type="button"
      id={triggerId}
      data-value={value}
      data-state={isActive ? "active" : "inactive"}
      data-disabled={disabled ? "true" : undefined}
      aria-selected={isActive}
      aria-controls={panelId}
      disabled={disabled}
      tabIndex={isActive ? 0 : -1}
      className={clsx("kit-tabs__trigger", className)}
      onClick={handleClick}
      onFocus={handleFocus}
    >
      {children}
    </button>
  );
});

export type TabsPanelProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
};

export const TabsPanel = forwardRef<HTMLDivElement, TabsPanelProps>(function TabsPanel(
  { value, className, children, ...rest },
  ref
) {
  const { value: activeValue, baseId } = useTabsContext("TabsPanel");
  const safeValue = sanitizeValue(value);
  const panelId = `${baseId}-panel-${safeValue}`;
  const triggerId = `${baseId}-tab-${safeValue}`;
  const isActive = activeValue === value;

  return (
    <div
      {...rest}
      ref={ref}
      role="tabpanel"
      id={panelId}
      aria-labelledby={triggerId}
      data-state={isActive ? "active" : "inactive"}
      hidden={!isActive}
      className={clsx("kit-tabs__panel", className)}
    >
      {isActive ? children : null}
    </div>
  );
});
