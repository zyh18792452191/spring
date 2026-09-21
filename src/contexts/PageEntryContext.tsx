'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type PageEntry = 'portal' | 'workspace';

interface PageEntryContextType {
  entry: PageEntry;
  setEntry: (entry: PageEntry) => void;
}

const PageEntryContext = createContext<PageEntryContextType | undefined>(undefined);

export function PageEntryProvider({ children }: { children: ReactNode }) {
  const [entry, setEntry] = useState<PageEntry>('portal');

  return (
    <PageEntryContext.Provider value={{ entry, setEntry }}>
      {children}
    </PageEntryContext.Provider>
  );
}

export function usePageEntry() {
  const context = useContext(PageEntryContext);
  if (context === undefined) {
    throw new Error('usePageEntry must be used within a PageEntryProvider');
  }
  return context;
}
