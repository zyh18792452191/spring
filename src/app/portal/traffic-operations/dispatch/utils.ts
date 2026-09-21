// 派单页面共享类型和数据传递工具

/** 小区标签（大数据平台布尔标签，从区域攻坚页面已选标签回显） */
export interface CommunityFilterTag {
  category: string;     // 标签名称，如"流量低饱和小区"
  tagType: string;      // 标签类型key，如"lowSaturation"
  color?: string;       // 标签颜色，如"#1890ff"
}

/** 客户筛选标签（新疆移动大数据平台真实标签） */
export interface CustomerFilterTag {
  group: string;         // 分组名，如"零低流量""低饱和""资费/融合/卡槽"
  items: { label: string; value: string }[];  // label=标签名, value=取值(是/否/枚举值)
}

/** 已选小区数据 */
export interface SelectedCommunity {
  id: string;
  aoiName: string;
  aoiCode: string;
  communityCode: string;
  city: string;         // 地州，如"乌鲁木齐"
  district: string;     // 区县，如"天山区"
  grid: string;
  taskCustomerCount: number;
  hasExistingTask: boolean;
  recentDispatchCount: number;
}

// sessionStorage key
const STORAGE_KEY = 'dispatch_page_data';

/** 区域攻坚页面调用，保存回显数据后跳转派单页面 */
export function saveDispatchData(data: {
  communityFilterTags: CommunityFilterTag[];
  customerFilterTags: CustomerFilterTag[];
  customerInfoSummary: string;
  selectedCommunities: SelectedCommunity[];
}) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

/** 派单页面调用，读取区域攻坚页面传递的回显数据 */
export function loadDispatchData(): {
  communityFilterTags: CommunityFilterTag[];
  customerFilterTags: CustomerFilterTag[];
  customerInfoSummary: string;
  selectedCommunities: SelectedCommunity[];
} | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}
