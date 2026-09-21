// 组织树节点类型
export interface OrganizationNode {
  id: string;
  name: string;           // 完整名称，如"中国移动新疆公司乌鲁木齐分公司"
  shortName: string;      // 简称，如"乌鲁木齐分公司"
  level: 1 | 2;           // 1=分公司，2=部门
  parentId?: string;
  children?: OrganizationNode[];
}

// 组织树静态数据
// 新疆移动16个地市分公司 + 省公司本部
export const ORGANIZATION_TREE: OrganizationNode[] = [
  {
    id: 'wulumuqi',
    name: '中国移动新疆公司乌鲁木齐分公司',
    shortName: '乌鲁木齐分公司',
    level: 1,
    children: [
      { id: 'wulumuqi-d1', name: '存量运营中心', shortName: '存量运营中心', level: 2, parentId: 'wulumuqi' },
      { id: 'wulumuqi-d2', name: '客户运营中心', shortName: '客户运营中心', level: 2, parentId: 'wulumuqi' },
      { id: 'wulumuqi-d3', name: '融合运营中心', shortName: '融合运营中心', level: 2, parentId: 'wulumuqi' },
      { id: 'wulumuqi-d4', name: '客户（品牌）运营中心', shortName: '客户（品牌）运营中心', level: 2, parentId: 'wulumuqi' },
      { id: 'wulumuqi-d5', name: '公众市场运营中心', shortName: '公众市场运营中心', level: 2, parentId: 'wulumuqi' },
    ],
  },
  {
    id: 'kelamayi',
    name: '中国移动新疆公司克拉玛依分公司',
    shortName: '克拉玛依分公司',
    level: 1,
    children: [
      { id: 'kelamayi-d1', name: '存量运营中心', shortName: '存量运营中心', level: 2, parentId: 'kelamayi' },
      { id: 'kelamayi-d2', name: '客户运营中心', shortName: '客户运营中心', level: 2, parentId: 'kelamayi' },
      { id: 'kelamayi-d3', name: '融合运营中心', shortName: '融合运营中心', level: 2, parentId: 'kelamayi' },
      { id: 'kelamayi-d4', name: '客户（品牌）运营中心', shortName: '客户（品牌）运营中心', level: 2, parentId: 'kelamayi' },
      { id: 'kelamayi-d5', name: '公众市场运营中心', shortName: '公众市场运营中心', level: 2, parentId: 'kelamayi' },
    ],
  },
  {
    id: 'tulufan',
    name: '中国移动新疆公司吐鲁番分公司',
    shortName: '吐鲁番分公司',
    level: 1,
    children: [
      { id: 'tulufan-d1', name: '存量运营中心', shortName: '存量运营中心', level: 2, parentId: 'tulufan' },
      { id: 'tulufan-d2', name: '客户运营中心', shortName: '客户运营中心', level: 2, parentId: 'tulufan' },
      { id: 'tulufan-d3', name: '融合及存量运营中心', shortName: '融合及存量运营中心', level: 2, parentId: 'tulufan' },
    ],
  },
  {
    id: 'hami',
    name: '中国移动新疆公司哈密分公司',
    shortName: '哈密分公司',
    level: 1,
    children: [
      { id: 'hami-d1', name: '存量运营中心', shortName: '存量运营中心', level: 2, parentId: 'hami' },
      { id: 'hami-d2', name: '客户运营中心', shortName: '客户运营中心', level: 2, parentId: 'hami' },
      { id: 'hami-d3', name: '融合及存量运营中心', shortName: '融合及存量运营中心', level: 2, parentId: 'hami' },
    ],
  },
  {
    id: 'changji',
    name: '中国移动新疆公司昌吉分公司',
    shortName: '昌吉分公司',
    level: 1,
    children: [
      { id: 'changji-d1', name: '存量运营中心', shortName: '存量运营中心', level: 2, parentId: 'changji' },
      { id: 'changji-d2', name: '客户运营中心', shortName: '客户运营中心', level: 2, parentId: 'changji' },
      { id: 'changji-d3', name: '融合及存量运营中心', shortName: '融合及存量运营中心', level: 2, parentId: 'changji' },
    ],
  },
  {
    id: 'bozhou',
    name: '中国移动新疆公司博州分公司',
    shortName: '博州分公司',
    level: 1,
    children: [
      { id: 'bozhou-d1', name: '存量运营中心', shortName: '存量运营中心', level: 2, parentId: 'bozhou' },
      { id: 'bozhou-d2', name: '客户运营中心', shortName: '客户运营中心', level: 2, parentId: 'bozhou' },
    ],
  },
  {
    id: 'bazhou',
    name: '中国移动新疆公司巴州分公司',
    shortName: '巴州分公司',
    level: 1,
    children: [
      { id: 'bazhou-d1', name: '存量运营中心', shortName: '存量运营中心', level: 2, parentId: 'bazhou' },
      { id: 'bazhou-d2', name: '客户运营中心', shortName: '客户运营中心', level: 2, parentId: 'bazhou' },
      { id: 'bazhou-d3', name: '融合及存量运营中心', shortName: '融合及存量运营中心', level: 2, parentId: 'bazhou' },
    ],
  },
  {
    id: 'akesu',
    name: '中国移动新疆公司阿克苏分公司',
    shortName: '阿克苏分公司',
    level: 1,
    children: [
      { id: 'akesu-d1', name: '存量运营中心', shortName: '存量运营中心', level: 2, parentId: 'akesu' },
      { id: 'akesu-d2', name: '客户运营中心', shortName: '客户运营中心', level: 2, parentId: 'akesu' },
      { id: 'akesu-d3', name: '融合运营中心', shortName: '融合运营中心', level: 2, parentId: 'akesu' },
      { id: 'akesu-d4', name: '客户（品牌）运营中心', shortName: '客户（品牌）运营中心', level: 2, parentId: 'akesu' },
      { id: 'akesu-d5', name: '公众市场运营中心', shortName: '公众市场运营中心', level: 2, parentId: 'akesu' },
    ],
  },
  {
    id: 'kezhou',
    name: '中国移动新疆公司克州分公司',
    shortName: '克州分公司',
    level: 1,
    children: [
      { id: 'kezhou-d1', name: '存量运营中心', shortName: '存量运营中心', level: 2, parentId: 'kezhou' },
      { id: 'kezhou-d2', name: '客户运营中心', shortName: '客户运营中心', level: 2, parentId: 'kezhou' },
    ],
  },
  {
    id: 'kashi',
    name: '中国移动新疆公司喀什分公司',
    shortName: '喀什分公司',
    level: 1,
    children: [
      { id: 'kashi-d1', name: '存量运营中心', shortName: '存量运营中心', level: 2, parentId: 'kashi' },
      { id: 'kashi-d2', name: '客户运营中心', shortName: '客户运营中心', level: 2, parentId: 'kashi' },
      { id: 'kashi-d3', name: '融合运营中心', shortName: '融合运营中心', level: 2, parentId: 'kashi' },
      { id: 'kashi-d4', name: '客户（品牌）运营中心', shortName: '客户（品牌）运营中心', level: 2, parentId: 'kashi' },
      { id: 'kashi-d5', name: '公众市场运营中心', shortName: '公众市场运营中心', level: 2, parentId: 'kashi' },
    ],
  },
  {
    id: 'hetian',
    name: '中国移动新疆公司和田分公司',
    shortName: '和田分公司',
    level: 1,
    children: [
      { id: 'hetian-d1', name: '存量运营中心', shortName: '存量运营中心', level: 2, parentId: 'hetian' },
      { id: 'hetian-d2', name: '客户运营中心', shortName: '客户运营中心', level: 2, parentId: 'hetian' },
    ],
  },
  {
    id: 'yili',
    name: '中国移动新疆公司伊犁分公司',
    shortName: '伊犁分公司',
    level: 1,
    children: [
      { id: 'yili-d1', name: '存量运营中心', shortName: '存量运营中心', level: 2, parentId: 'yili' },
      { id: 'yili-d2', name: '客户运营中心', shortName: '客户运营中心', level: 2, parentId: 'yili' },
      { id: 'yili-d3', name: '融合运营中心', shortName: '融合运营中心', level: 2, parentId: 'yili' },
      { id: 'yili-d4', name: '客户（品牌）运营中心', shortName: '客户（品牌）运营中心', level: 2, parentId: 'yili' },
      { id: 'yili-d5', name: '公众市场运营中心', shortName: '公众市场运营中心', level: 2, parentId: 'yili' },
    ],
  },
  {
    id: 'tacheng',
    name: '中国移动新疆公司塔城分公司',
    shortName: '塔城分公司',
    level: 1,
    children: [
      { id: 'tacheng-d1', name: '存量运营中心', shortName: '存量运营中心', level: 2, parentId: 'tacheng' },
      { id: 'tacheng-d2', name: '客户运营中心', shortName: '客户运营中心', level: 2, parentId: 'tacheng' },
    ],
  },
  {
    id: 'aletai',
    name: '中国移动新疆公司阿勒泰分公司',
    shortName: '阿勒泰分公司',
    level: 1,
    children: [
      { id: 'aletai-d1', name: '存量运营中心', shortName: '存量运营中心', level: 2, parentId: 'aletai' },
      { id: 'aletai-d2', name: '客户运营中心', shortName: '客户运营中心', level: 2, parentId: 'aletai' },
    ],
  },
  {
    id: 'kuitun',
    name: '中国移动新疆公司奎屯分公司',
    shortName: '奎屯分公司',
    level: 1,
    children: [
      { id: 'kuitun-d1', name: '存量运营中心', shortName: '存量运营中心', level: 2, parentId: 'kuitun' },
      { id: 'kuitun-d2', name: '客户运营中心', shortName: '客户运营中心', level: 2, parentId: 'kuitun' },
      { id: 'kuitun-d3', name: '融合及存量运营中心', shortName: '融合及存量运营中心', level: 2, parentId: 'kuitun' },
    ],
  },
  {
    id: 'shihezi',
    name: '中国移动新疆公司石河子分公司',
    shortName: '石河子分公司',
    level: 1,
    children: [
      { id: 'shihezi-d1', name: '存量运营中心', shortName: '存量运营中心', level: 2, parentId: 'shihezi' },
      { id: 'shihezi-d2', name: '客户运营中心', shortName: '客户运营中心', level: 2, parentId: 'shihezi' },
      { id: 'shihezi-d3', name: '融合及存量运营中心', shortName: '融合及存量运营中心', level: 2, parentId: 'shihezi' },
    ],
  },
];

// 根据ID查找组织节点
export function getOrganizationById(id: string, tree: OrganizationNode[] = ORGANIZATION_TREE): OrganizationNode | null {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children) {
      const found = getOrganizationById(id, node.children);
      if (found) return found;
    }
  }
  return null;
}

// 获取组织节点的完整路径
export function getOrganizationPath(id: string, tree: OrganizationNode[] = ORGANIZATION_TREE): string {
  function findPath(nodes: OrganizationNode[], target: string, path: string[] = []): string[] | null {
    for (const node of nodes) {
      const currentPath = [...path, node.shortName];
      if (node.id === target) return currentPath;
      if (node.children) {
        const found = findPath(node.children, target, currentPath);
        if (found) return found;
      }
    }
    return null;
  }
  const result = findPath(tree, id);
  return result ? result.join(' / ') : '';
}

// 搜索组织节点
export function searchOrganizations(keyword: string, tree: OrganizationNode[] = ORGANIZATION_TREE): OrganizationNode[] {
  const results: OrganizationNode[] = [];
  function search(nodes: OrganizationNode[]) {
    for (const node of nodes) {
      if (node.name.includes(keyword) || node.shortName.includes(keyword)) {
        results.push(node);
      }
      if (node.children) search(node.children);
    }
  }
  search(tree);
  return results;
}
