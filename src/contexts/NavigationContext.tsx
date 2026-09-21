'use client';

import React, { createContext, useContext, ReactNode, useState } from 'react';

export interface NavigationItem {
  name: string;
  href?: string;
}

interface NavigationContextType {
  breadcrumbs: NavigationItem[];
  setBreadcrumbs: (items: NavigationItem[]) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [breadcrumbs, setBreadcrumbsState] = useState<NavigationItem[]>([]);

  const setBreadcrumbs = (items: NavigationItem[]) => {
    setBreadcrumbsState(items);
  };

  return (
    <NavigationContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
