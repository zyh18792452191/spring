// ==================== 物理网格分派统计 - 5级下钻数据 ====================
// 层级：地州 → 区县 → 网格 → 微格 → 物理网格
// 塔城演示路径使用原型真实数据（塔城→额敏县→九师兵团网格→165团），其余地州按确定性算法生成并保证聚合自洽。

import { CITIES, CITY_STATS, CITY_DISTRICTS } from './data';

export interface DrillRow {
  name: string;
  customerCount: number;
  globalCount: number;
  dispatchedGrids: number;
  undispatchedGrids: number;
}

// 确定性伪随机（保证每次渲染数据一致）
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

// 总和守恒随机拆分（每份至少1）
function splitPositive(total: number, parts: number, rand: () => number): number[] {
  if (parts <= 1) return [total];
  const n = Math.min(parts, total);
  const arr = new Array(n).fill(1);
  let rest = total - n;
  while (rest > 0) {
    arr[Math.floor(rand() * n)] += 1;
    rest -= 1;
  }
  // 洗牌
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

// ==================== 塔城演示路径（原型真实数据） ====================

const TACHENG_DISTRICTS: DrillRow[] = [
  { name: '额敏县', customerCount: 4, globalCount: 1, dispatchedGrids: 244, undispatchedGrids: 0 },
  { name: '和丰县', customerCount: 4, globalCount: 1, dispatchedGrids: 171, undispatchedGrids: 0 },
  { name: '塔城市', customerCount: 10, globalCount: 0, dispatchedGrids: 306, undispatchedGrids: 0 },
  { name: '托里县', customerCount: 6, globalCount: 0, dispatchedGrids: 137, undispatchedGrids: 0 },
  { name: '裕民县', customerCount: 8, globalCount: 1, dispatchedGrids: 154, undispatchedGrids: 0 },
  { name: '乌苏', customerCount: 4, globalCount: 0, dispatchedGrids: 321, undispatchedGrids: 0 },
  { name: '沙湾县分公司', customerCount: 2, globalCount: 0, dispatchedGrids: 154, undispatchedGrids: 0 },
];

const EMIN_GRIDS: DrillRow[] = [
  { name: '九师兵团网格', customerCount: 1, globalCount: 0, dispatchedGrids: 88, undispatchedGrids: 0 },
  { name: '额敏农村网格', customerCount: 2, globalCount: 0, dispatchedGrids: 73, undispatchedGrids: 0 },
  { name: '额敏城市网格', customerCount: 1, globalCount: 1, dispatchedGrids: 83, undispatchedGrids: 0 },
];

const JIUSHI_MICRO_GRIDS: DrillRow[] = [
  { name: '165团', customerCount: 0, globalCount: 0, dispatchedGrids: 10, undispatchedGrids: 0 },
  { name: '166团', customerCount: 0, globalCount: 0, dispatchedGrids: 9, undispatchedGrids: 0 },
  { name: '167团', customerCount: 0, globalCount: 0, dispatchedGrids: 14, undispatchedGrids: 0 },
  { name: '168团', customerCount: 0, globalCount: 0, dispatchedGrids: 10, undispatchedGrids: 0 },
  { name: '169团', customerCount: 0, globalCount: 0, dispatchedGrids: 4, undispatchedGrids: 0 },
  { name: '九师网格一', customerCount: 1, globalCount: 0, dispatchedGrids: 34, undispatchedGrids: 0 },
  { name: '团结农场', customerCount: 0, globalCount: 0, dispatchedGrids: 5, undispatchedGrids: 0 },
  { name: '八一队网格', customerCount: 0, globalCount: 0, dispatchedGrids: 2, undispatchedGrids: 0 },
];

const SHI165_PHYSICAL_GRIDS: DrillRow[] = [
  '165团3连', '165团4连', '165团部', '165团农2连', '165团6连',
  '165团7连', '165团水电站', '巴依木扎', '165团TD', '165团农2连TD',
].map((name) => ({
  name,
  customerCount: 0,
  globalCount: 0,
  dispatchedGrids: 1,
  undispatchedGrids: 0,
}));

// ==================== 构建层级数据 ====================

const rand = mulberry32(20260818);

// 每地州保证2个区县名
function districtNamesFor(city: string): string[] {
  const base = CITY_DISTRICTS[city] ?? [];
  if (base.length >= 2) return base.slice(0, 2);
  if (base.length === 1) return [base[0], `${city}中心区`];
  return [`${city}中心区`, `${city}东区`];
}

function buildTree() {
  const districts: Record<string, DrillRow[]> = {};
  const grids: Record<string, DrillRow[]> = {};
  const microGrids: Record<string, DrillRow[]> = {};
  const physicalGrids: Record<string, DrillRow[]> = {};

  const pushGeneratedBranch = (city: string, cStat: { customerCount: number; globalCount: number; dispatchedGrids: number }) => {
    const dNames = districtNamesFor(city);
    const dCounts = splitAny(cStat.customerCount, dNames.length, rand);
    const dGlobals = splitAny(cStat.globalCount, dNames.length, rand);
    const dDispatched = splitPositive(cStat.dispatchedGrids, dNames.length, rand);

    for (let i = 0; i < dNames.length; i++) {
      const dName = dNames[i];
      const gNames = range(2).map((n) => `${dName}网格${n + 1}`);
      const gCounts = splitAny(dCounts[i], 2, rand);
      const gGlobals = splitAny(dGlobals[i], 2, rand);
      const gDispatched = splitPositive(dDispatched[i], 2, rand);
      const dRow: DrillRow = { name: dName, customerCount: dCounts[i], globalCount: dGlobals[i], dispatchedGrids: dDispatched[i], undispatchedGrids: 0 };
      districts[city] = [...(districts[city] ?? []), dRow];

      for (let j = 0; j < 2; j++) {
        const gName = gNames[j];
        const mCount = 2 + Math.floor(rand() * 2); // 2-3 微格
        const mNames = range(mCount).map((n) => `${gName}微格${n + 1}`);
        const mCounts = splitAny(gCounts[j], mCount, rand);
        const mGlobals = splitAny(gGlobals[j], mCount, rand);
        const mDispatched = splitPositive(gDispatched[j], mCount, rand);
        const gRow: DrillRow = { name: gName, customerCount: gCounts[j], globalCount: gGlobals[j], dispatchedGrids: gDispatched[j], undispatchedGrids: 0 };
        grids[dName] = [...(grids[dName] ?? []), gRow];

        for (let k = 0; k < mCount; k++) {
          const mName = mNames[k];
          const pCount = mDispatched[k];
          const pNames = range(pCount).map((n) => `${mName}片区${n + 1}`);
          const pCounts = splitAny(mCounts[k], pCount, rand);
          const pGlobals = splitAny(mGlobals[k], pCount, rand);
          physicalGrids[mName] = pNames.map((pName, q) => ({
            name: pName,
            customerCount: pCounts[q],
            globalCount: pGlobals[q],
            dispatchedGrids: 1,
            undispatchedGrids: 0,
          }));
          microGrids[gName] = [...(microGrids[gName] ?? []), {
            name: mName,
            customerCount: mCounts[k],
            globalCount: mGlobals[k],
            dispatchedGrids: mDispatched[k],
            undispatchedGrids: 0,
          }];
        }
      }
    }
  };

  // 塔城：区县用原型真实数据；额敏县网格用原型数据；其余区县走生成逻辑
  districts['塔城'] = TACHENG_DISTRICTS;
  grids['额敏县'] = EMIN_GRIDS;
  microGrids['九师兵团网格'] = JIUSHI_MICRO_GRIDS;
  physicalGrids['165团'] = SHI165_PHYSICAL_GRIDS;

  for (const city of CITIES) {
    if (city === '塔城') {
      // 塔城其余区县（额敏县已覆盖）生成网格/微格
      for (const d of TACHENG_DISTRICTS) {
        if (d.name === '额敏县') continue;
        const gNames = range(2).map((n) => `${d.name}网格${n + 1}`);
        const gCounts = splitAny(d.customerCount, 2, rand);
        const gGlobals = splitAny(d.globalCount, 2, rand);
        const gDispatched = splitPositive(d.dispatchedGrids, 2, rand);
        for (let j = 0; j < 2; j++) {
          const gName = gNames[j];
          const mCount = 2 + Math.floor(rand() * 2);
          const mNames = range(mCount).map((n) => `${gName}微格${n + 1}`);
          const mCounts = splitAny(gCounts[j], mCount, rand);
          const mGlobals = splitAny(gGlobals[j], mCount, rand);
          const mDispatched = splitPositive(gDispatched[j], mCount, rand);
          grids[d.name] = [...(grids[d.name] ?? []), { name: gName, customerCount: gCounts[j], globalCount: gGlobals[j], dispatchedGrids: gDispatched[j], undispatchedGrids: 0 }];
          for (let k = 0; k < mCount; k++) {
            const mName = mNames[k];
            const pCount = mDispatched[k];
            const pNames = range(pCount).map((n) => `${mName}片区${n + 1}`);
            const pCounts = splitAny(mCounts[k], pCount, rand);
            const pGlobals = splitAny(mGlobals[k], pCount, rand);
            physicalGrids[mName] = pNames.map((pName, q) => ({ name: pName, customerCount: pCounts[q], globalCount: pGlobals[q], dispatchedGrids: 1, undispatchedGrids: 0 }));
            microGrids[gName] = [...(microGrids[gName] ?? []), { name: mName, customerCount: mCounts[k], globalCount: mGlobals[k], dispatchedGrids: mDispatched[k], undispatchedGrids: 0 }];
          }
        }
      }
    } else {
      const cStat = CITY_STATS.find((s) => s.city === city)!;
      // 生成地州的已分派物理网格数自洽小值（不引用地州统计表口径）
      const stat = { customerCount: cStat.customerCount, globalCount: cStat.globalCount, dispatchedGrids: 20 + Math.floor(rand() * 40) };
      pushGeneratedBranch(city, stat);
    }
  }

  return { districts, grids, microGrids, physicalGrids };
}

const tree = buildTree();

export const DRILL = {
  // 按地州统计（16地州，含塔城真实数据）
  cityRows: CITIES.map((city) => {
    const s = CITY_STATS.find((r) => r.city === city)!;
    // 塔城已分派物理网格数 = 其区县之和（1487，保持原型口径自洽）；其余地州用生成值
    const dispatchedGrids = city === '塔城'
      ? TACHENG_DISTRICTS.reduce((sum, d) => sum + d.dispatchedGrids, 0)
      : (tree.districts[city] ?? []).reduce((sum, d) => sum + d.dispatchedGrids, 0);
    return {
      name: city,
      customerCount: s.customerCount,
      globalCount: s.globalCount,
      dispatchedGrids,
      undispatchedGrids: 0,
    };
  }),
  districts: tree.districts,
  grids: tree.grids,
  microGrids: tree.microGrids,
  physicalGrids: tree.physicalGrids,
};
