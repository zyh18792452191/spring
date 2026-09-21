'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export interface Tab {
  id: string;
  title: string;
  path: string;
}

interface TabsContextType {
  tabs: Tab[];
  activeTab: string | null;
  addTab: (tab: Tab) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  closeOtherTabs: (currentTabId: string) => void;
  closeAllTabs: () => void;
  fixedTabIds: string[];
}

// 固定标签（不可删除）
const FIXED_TABS: Tab[] = [
  {
    id: '/workspace',
    title: '工作台首页',
    path: '/workspace',
  },
];

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function TabsProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([...FIXED_TABS]);
  const [activeTab, setActiveTab] = useState<string | null>(FIXED_TABS[0].id);

  const addTab = useCallback((tab: Tab) => {
    setTabs((prevTabs) => {
      // 检查是否已存在相同路径的标签
      const existingTab = prevTabs.find((t) => t.path === tab.path);
      if (existingTab) {
        // 如果已存在，激活它
        setActiveTab(existingTab.id);
        return prevTabs;
      }

      // 添加新标签并激活
      setActiveTab(tab.id);
      return [...prevTabs, tab];
    });
  }, []);

  const removeTab = useCallback((tabId: string) => {
    // 不能删除固定标签
    if (FIXED_TABS.some((tab) => tab.id === tabId)) {
      return;
    }

    setTabs((prevTabs) => {
      const newTabs = prevTabs.filter((tab) => tab.id !== tabId);

      // 如果删除的是当前激活的标签，需要切换到其他标签
      if (activeTab === tabId) {
        if (newTabs.length > 0) {
          // 激活最后一个标签
          setActiveTab(newTabs[newTabs.length - 1].id);
        } else {
          setActiveTab(FIXED_TABS[0].id);
        }
      }

      return newTabs;
    });
  }, [activeTab]);

  const closeOtherTabs = useCallback((currentTabId: string) => {
    setTabs((prevTabs) => {
      const currentTab = prevTabs.find((tab) => tab.id === currentTabId);
      if (!currentTab) return prevTabs;

      return [...FIXED_TABS, currentTab];
    });
  }, []);

  const closeAllTabs = useCallback(() => {
    setTabs([...FIXED_TABS]);
    setActiveTab(FIXED_TABS[0].id);
  }, []);

  // 根据当前路径自动激活对应的标签
  useEffect(() => {
    // 在这里可以根据当前 URL 自动切换标签
    // 简化处理：如果当前路径不在标签中，可以考虑添加
  }, []);

  return (
    <TabsContext.Provider
      value={{
        tabs,
        activeTab,
        addTab,
        removeTab,
        setActiveTab,
        closeOtherTabs,
        closeAllTabs,
        fixedTabIds: FIXED_TABS.map((tab) => tab.id),
      }}
    >
      {children}
    </TabsContext.Provider>
  );
}

export function useTabs() {
  const context = useContext(TabsContext);
  if (context === undefined) {
    throw new Error('useTabs must be used within a TabsProvider');
  }
  return context;
}
