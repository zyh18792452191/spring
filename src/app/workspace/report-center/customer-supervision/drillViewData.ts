// ==================== 全量用户看管视图 - 下钻层级数据 ====================
// 1. USER_WATCH_TREE：全量用户归属关系（日）—— 地州 → 区县 → 网格（看管客户数维度）
// 2. GRID_DISPATCH_TREE：物理网格分派情况（日）—— 地州 → 区县（分派网格数维度）
// 哈密区县/伊吾网格、克州区县使用原型真实数据，其余地州按确定性算法生成并保证聚合自洽。

import { CITIES, CITY_WATCH_DATA, CITY_STATS } from './data';
import { DRILL } from './drillData';

export interface WatchNode {
  name: string;
  customerCount: number;
  globalCount: number;
  dispatchedGrids: number;
  undispatchedGrids: number;
  children?: WatchNode[];
}

// 确定性伪随机
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 总和守恒随机拆分（允许0）
function splitAny(total: number, parts: number, rand: () => number): number[] {
  if (parts <= 1) return [total];
  const cuts: number[] = [];
  for (let i = 0; i < parts - 1; i++) cuts.push(Math.floor(rand() * (total + 1)));
  cuts.sort((a, b) => a - b);
  const res: number[] = [];
  let prev = 0;
  for (const c of cuts) {
    res.push(c - prev);
    prev = c;
  }
  res.push(total - prev);
  return res;
}

const rand = mulberry32(20260819);

// ==================== 原型真实数据 ====================

// 哈密区县（客户 6+2+8+3=19=哈密；分派 132+45+380+222=779=哈密）
const HAMI_DISTRICTS: WatchNode[] = [
  { name: '三道岭', customerCount: 6, globalCount: 1, dispatchedGrids: 132, undispatchedGrids: 0 },
  {
    name: '伊吾',
    customerCount: 2,
    globalCount: 0,
    dispatchedGrids: 45,
    undispatchedGrids: 0,
    children: [
      { name: '伊吾县城网格', customerCount: 1, globalCount: 0, dispatchedGrids: 20, undispatchedGrids: 0 },
      { name: '伊吾淖毛湖网格', customerCount: 1, globalCount: 0, dispatchedGrids: 25, undispatchedGrids: 0 },
    ],
  },
  { name: '伊州区', customerCount: 8, globalCount: 1, dispatchedGrids: 380, undispatchedGrids: 0 },
  { name: '巴里坤', customerCount: 3, globalCount: 0, dispatchedGrids: 222, undispatchedGrids: 0 },
];

// 克州区县（客户 8+12+5+2=27=克州；分派 71+352+178+112=713=克州）
const KEZHOU_DISTRICTS: WatchNode[] = [
  { name: '阿合奇县', customerCount: 8, globalCount: 1, dispatchedGrids: 71, undispatchedGrids: 0 },
  { name: '阿图什市', customerCount: 12, globalCount: 0, dispatchedGrids: 352, undispatchedGrids: 0 },
  { name: '乌恰县', customerCount: 5, globalCount: 1, dispatchedGrids: 178, undispatchedGrids: 0 },
  { name: '阿克陶县', customerCount: 2, globalCount: 0, dispatchedGrids: 112, undispatchedGrids: 0 },
];

// 生成区县的网格子级（每个区县2个网格，数值拆分自区县）
function genGridChildren(d: WatchNode): WatchNode[] {
  const gNames = [`${d.name}网格1`, `${d.name}网格2`];
  const counts = splitAny(d.customerCount, 2, rand);
  const globals = splitAny(d.globalCount, 2, rand);
  const dispatched = splitAny(d.dispatchedGrids, 2, rand);
  return gNames.map((name, i) => ({
    name,
    customerCount: counts[i],
    globalCount: globals[i],
    dispatchedGrids: dispatched[i],
    undispatchedGrids: 0,
  }));
}

// ==================== 构建下钻树 ====================

// 全量用户归属关系（日）：地州 → 区县 → 网格
function buildUserWatchTree(): WatchNode[] {
  return CITIES.map((city) => {
    const base = CITY_WATCH_DATA.find((c) => c.city === city)!;
    const dispatch = DRILL.cityRows.find((c) => c.name === city)!;
    let children: WatchNode[] | undefined;
    if (city === '哈密') {
      children = HAMI_DISTRICTS;
    } else {
      children = (DRILL.districts[city] ?? []).map((d) => ({
        ...d,
        children: genGridChildren(d),
      }));
    }
    return {
      name: city,
      customerCount: base.customerCount,
      globalCount: base.globalCount,
      dispatchedGrids: dispatch.dispatchedGrids,
      undispatchedGrids: 0,
      children,
    };
  });
}

// 物理网格分派情况（日）：地州 → 区县（地州分派网格数以区县子级聚合，保证与全疆 15,282 口径自洽）
function buildGridDispatchTree(): WatchNode[] {
  return CITIES.map((city) => {
    const dispatch = CITY_STATS.find((c) => c.city === city)!;
    let children: WatchNode[];
    if (city === '克州') {
      children = KEZHOU_DISTRICTS;
    } else {
      const names = (DRILL.districts[city] ?? []).map((d) => d.name);
      const dispatched = splitAny(dispatch.dispatchedGrids, names.length, rand);
      children = names.map((name, i) => ({
        name,
        customerCount: 0,
        globalCount: 0,
        dispatchedGrids: dispatched[i],
        undispatchedGrids: 0,
      }));
    }
    const dispatchedGrids = children.reduce((sum, d) => sum + d.dispatchedGrids, 0);
    return {
      name: city,
      customerCount: dispatch.customerCount,
      globalCount: dispatch.globalCount,
      dispatchedGrids,
      undispatchedGrids: 0,
      children,
    };
  });
}

export const USER_WATCH_TREE = buildUserWatchTree();
export const GRID_DISPATCH_TREE = buildGridDispatchTree();

// 根据下钻路径定位当前层级节点与图表数据
export function getLevelData(tree: WatchNode[], path: string[]) {
  let node: WatchNode | undefined;
  let data: WatchNode[] = tree;
  for (const p of path) {
    const next = data.find((d) => d.name === p);
    if (!next) break;
    node = next;
    data = next.children ?? [];
  }
  return { node, data };
}
