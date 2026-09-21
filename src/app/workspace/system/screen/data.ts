// ==================== 投屏管理 - 模拟数据 ====================

export interface ScreenItem {
  id: number;
  name: string;
  // 大屏访问地址（当前为模拟接入地址，对接大屏系统后替换为真实大屏URL）
  url: string;
}

export const SCREEN_LIST: ScreenItem[] = [
  { id: 1, name: '运营总览', url: '/screen/overview' },
  { id: 2, name: '运营指标', url: '/screen/metrics' },
  { id: 3, name: '宽带拆机', url: '/screen/broadband' },
  { id: 4, name: '中高端保拓', url: '/screen/midhigh' },
  { id: 5, name: '全球通保有', url: '/screen/global' },
  { id: 6, name: '降档控损', url: '/screen/downshift' },
  { id: 7, name: '离网专区', url: '/screen/churn' },
  { id: 8, name: '心级服务旗舰店', url: '/screen/service' },
];
