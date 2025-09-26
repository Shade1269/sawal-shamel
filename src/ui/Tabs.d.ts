import type * as React from 'react';

export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsActivationMode = 'automatic' | 'manual';

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: TabsOrientation;
  activationMode?: TabsActivationMode;
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  'aria-label'?: string;
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  disabled?: boolean;
}

export interface TabsPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export declare const Tabs: React.ForwardRefExoticComponent<
  TabsProps & React.RefAttributes<HTMLDivElement>
>;
export declare const TabsList: React.ForwardRefExoticComponent<
  TabsListProps & React.RefAttributes<HTMLDivElement>
>;
export declare const TabsTrigger: React.ForwardRefExoticComponent<
  TabsTriggerProps & React.RefAttributes<HTMLButtonElement>
>;
export declare const TabsPanel: React.ForwardRefExoticComponent<
  TabsPanelProps & React.RefAttributes<HTMLDivElement>
>;
