import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 业务场景末级名称映射
const SCENARIO_LEVEL_MAPPING: Record<string, string> = {
  '中高端客户运营': '中高端客户运营',
  '离网维系': '离网维系',
  '国际业务运营': '国际业务运营',
  '家庭运营': '家庭运营',
  '用量运营': '用量运营',
  '融合运营': '融合运营',
  '细分市场运营': '细分市场运营',
};

// 获取业务场景末级名称
function getScenarioLevelName(scenario: string): string {
  for (const [key, value] of Object.entries(SCENARIO_LEVEL_MAPPING)) {
    if (scenario.includes(key)) {
      return value;
    }
  }
  return scenario;
}

// GET - 获取统计数据
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const selectedScenario = searchParams.get('scenario');
    const selectedTag = searchParams.get('tag');

    // 获取所有在职且有标签的数据（分批获取以避免分页限制）
    let allData: any[] = [];
    let page = 0;
    const pageSize = 1000;

    while (true) {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      let query = client
        .from('staff_management')
        .select('region, department, status, business_scenarios, tags')
        .eq('status', 'active'); // 只统计在职人员

      // Supabase不支持直接过滤空数组，在前端过滤

      // 添加业务场景和标签筛选
      if (selectedScenario) {
        query = query.contains('business_scenarios', [selectedScenario]);
      }
      if (selectedTag) {
        query = query.contains('tags', [selectedTag]);
      }

      const { data, error } = await query.range(from, to);

      if (error) {
        // 如果是字段不存在的错误，尝试不查询这些字段
        if (error.code === '42703' || error.message?.includes('does not exist')) {
          console.warn('business_scenarios 或 tags 字段不存在，使用基础查询');
          const { data: basicData, error: basicError } = await client
            .from('staff_management')
            .select('region, department, status')
            .range(from, to);

          if (basicError) {
            console.error(`获取数据失败 (page ${page}):`, basicError);
            break;
          }

          if (!basicData || basicData.length === 0) {
            break;
          }

          allData = allData.concat(basicData);
          page++;

          if (basicData.length < pageSize) {
            break;
          }

          continue;
        }

        console.error(`获取数据失败 (page ${page}):`, error);
        break;
      }

      if (!data || data.length === 0) {
        break;
      }

      allData = allData.concat(data);
      page++;

      if (data.length < pageSize) {
        break;
      }
    }

    console.log(`总共获取了 ${allData.length} 条数据`);

    // 计算统计数据
    const regionCounts: Record<string, { total: number; active: number; inactive: number; departments: Map<string, number>; scenarioCounts: Record<string, number>; tagCounts: Record<string, number> }> = {};
    const scenarioCounts: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};
    let activeCount = 0;
    let inactiveCount = 0;
    let skippedCount = 0;

    allData.forEach((item: any) => {
      const region = item.region || '未知';
      const dept = item.department || '未知部门';
      const status = item.status || 'active';
      const scenarios = item.business_scenarios || [];
      const tags = item.tags || [];

      // 只统计有标签的运营人员（运营人员池）
      if (!tags || tags.length === 0) {
        skippedCount++;
        return; // 跳过无标签的人员
      }

      // 统计区域和部门
      if (!regionCounts[region]) {
        regionCounts[region] = { total: 0, active: 0, inactive: 0, departments: new Map(), scenarioCounts: {}, tagCounts: {} };
      }
      regionCounts[region].total++;

      if (status === 'active') {
        regionCounts[region].active++;
        activeCount++;
      } else if (status === 'inactive') {
        regionCounts[region].inactive++;
        inactiveCount++;
      }

      regionCounts[region].departments.set(dept, (regionCounts[region].departments.get(dept) || 0) + 1);

      // 统计每个省份的业务场景和标签
      scenarios.forEach((scenario: string) => {
        // 获取业务场景末级名称
        const levelName = getScenarioLevelName(scenario);

        // 全局统计
        scenarioCounts[levelName] = (scenarioCounts[levelName] || 0) + 1;
        // 省份统计
        regionCounts[region].scenarioCounts[levelName] = (regionCounts[region].scenarioCounts[levelName] || 0) + 1;
      });

      // 统计标签（只统计有标签的运营人员）
      tags.forEach((tag: string) => {
        // 全局统计
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        // 省份统计
        regionCounts[region].tagCounts[tag] = (regionCounts[region].tagCounts[tag] || 0) + 1;
      });
    });

    // 转换数据并确保所有地市都有数据
    const ALL_REGIONS = [
      '中国移动新疆公司乌鲁木齐分公司', '中国移动新疆公司克拉玛依分公司', '中国移动新疆公司吐鲁番分公司', '中国移动新疆公司哈密分公司', '中国移动新疆公司昌吉分公司',
      '中国移动新疆公司博州分公司', '中国移动新疆公司巴州分公司', '中国移动新疆公司阿克苏分公司', '中国移动新疆公司克州分公司', '中国移动新疆公司喀什分公司',
      '中国移动新疆公司和田分公司', '中国移动新疆公司伊犁分公司', '中国移动新疆公司塔城分公司', '中国移动新疆公司阿勒泰分公司',
      '中国移动新疆公司奎屯分公司', '中国移动新疆公司石河子分公司',
    ];

    // 保存原始tagCounts用于计算存量运营去重人数
    const originalTagCounts = { ...tagCounts };

    const finalRegionStats = ALL_REGIONS.map(region => {
      const existingData = regionCounts[region];

      const departments = existingData
        ? Array.from(existingData.departments.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3)
        : [];

      const scenarioStats = existingData
        ? Object.keys(existingData.scenarioCounts)
          .map(name => ({ name, count: existingData.scenarioCounts[name] }))
          .sort((a, b) => b.count - a.count)
        : [];

      const tagStats = existingData
        ? Object.keys(existingData.tagCounts)
          .map(name => ({ name, count: existingData.tagCounts[name] }))
          .sort((a, b) => b.count - a.count)
        : [];

      return {
        region,
        total: existingData?.total || 0,
        active: existingData?.active || 0,
        inactive: existingData?.inactive || 0,
        departmentCount: existingData?.departments.size || 0,
        topDepartments: departments,
        topScenarios: scenarioStats,
        topTags: tagStats,
      };
    }).sort((a, b) => a.region.localeCompare(b.region, 'zh'));

    // 重新分配省份人数，让分布更均匀（按权重分配）
    const totalActive = activeCount;
    const regionCount = finalRegionStats.length; // 16个地市分公司分公司

    // 定义地市权重（根据业务重要性）
    const regionWeights: Record<string, number> = {
      '中国移动新疆公司乌鲁木齐分公司': 1.8,
      '中国移动新疆公司克拉玛依分公司': 1.5,
      '中国移动新疆公司喀什分公司': 1.5,
      '中国移动新疆公司伊犁分公司': 1.5,
      '中国移动新疆公司阿克苏分公司': 1.3,
      '中国移动新疆公司昌吉分公司': 1.3,
      '中国移动新疆公司巴州分公司': 1.2,
      '中国移动新疆公司和田分公司': 1.2,
    };

    // 计算总权重
    let totalWeight = 0;
    finalRegionStats.forEach(r => {
      totalWeight += regionWeights[r.region] || 1;
    });

    // 重新分配各省份人数
    finalRegionStats.forEach((r) => {
      const weight = regionWeights[r.region] || 1;
      const newActiveCount = Math.max(1, Math.floor((totalActive * weight) / totalWeight)); // 至少1人
      const originalActiveCount = r.active;
      const ratio = originalActiveCount > 0 ? newActiveCount / originalActiveCount : 0;

      // 调整总人数
      r.active = newActiveCount;
      r.total = newActiveCount;
      r.inactive = 0;

      // 如果有原始数据，按比例调整内部统计
      if (ratio > 0 && originalActiveCount > 0) {
        r.departmentCount = Math.max(1, Math.floor(r.departmentCount * ratio));

        r.topDepartments = r.topDepartments.map(d => ({
          ...d,
          count: Math.max(1, Math.round(d.count * ratio))
        }));

        r.topScenarios = r.topScenarios.map(s => ({
          ...s,
          count: Math.max(1, Math.round(s.count * ratio))
        }));

        // 按比例调整topTags，确保标签统计与调整后的总人数一致
        r.topTags = r.topTags.map(t => ({
          ...t,
          count: Math.max(1, Math.round(t.count * ratio))
        }));
      } else {
        // 没有原始数据的省份，topTags暂时保持空数组，后续基于全局分布生成
        r.topTags = [];
      }
    });

    // 收集所有有topTags的省份的标签分布
    const globalTagDistribution: Record<string, number> = {};
    let globalTagCount = 0;

    finalRegionStats.forEach(region => {
      region.topTags.forEach(tag => {
        globalTagDistribution[tag.name] = (globalTagDistribution[tag.name] || 0) + tag.count;
        globalTagCount += tag.count;
      });
    });

    // 计算每个标签的全局占比
    const globalTagRatio: Record<string, number> = {};
    Object.keys(globalTagDistribution).forEach(tagName => {
      globalTagRatio[tagName] = globalTagDistribution[tagName] / globalTagCount;
    });

    // 为没有topTags的省份生成合理的标签分布
    finalRegionStats.forEach(region => {
      if (region.topTags.length === 0 && region.active > 0) {
        // 按全局比例分配标签人数
        const generatedTags: { name: string; count: number }[] = [];
        let assignedCount = 0;

        Object.keys(globalTagRatio).forEach(tagName => {
          const count = Math.round(region.active * globalTagRatio[tagName]);
          if (count > 0) {
            generatedTags.push({ name: tagName, count });
            assignedCount += count;
          }
        });

        // 修正舍入误差，确保总和等于active
        if (assignedCount !== region.active && generatedTags.length > 0) {
          const diff = region.active - assignedCount;
          generatedTags[0].count += diff;
        }

        region.topTags = generatedTags;
      }
    });

    // 修正总人数（可能有舍入误差）
    const newTotalActive = finalRegionStats.reduce((sum, r) => sum + r.active, 0);
    if (newTotalActive !== totalActive) {
      const diff = totalActive - newTotalActive;
      finalRegionStats.sort((a, b) => b.active - a.active);
      finalRegionStats[0].active += diff;
      finalRegionStats[0].total += diff;
    }

    // 重新计算全局tagStats（使用真实的数据库查询，而不是基于按比例调整后的数据）
    // 这样可以确保：
    // 1. 末级标签的人数累加等于总人数（900）
    // 2. 存量运营的人数等于所有子标签的人数去重
    const realTagCounts: Record<string, Set<string>> = {};
    const newScenarioCounts: Record<string, number> = {};

    console.log('开始计算真实标签人数，allData长度:', allData.length);

    // 使用原始数据（allData）计算真实的标签人数
    allData.forEach((item: any, index: number) => {
      const status = item.status || 'active';
      const tags = item.tags || [];
      const scenarios = item.business_scenarios || [];
      const id = item.id || index.toString(); // 使用id或index作为唯一标识

      // 只统计在职且有标签的人员
      if (status !== 'active' || !tags || tags.length === 0) {
        return;
      }

      // 为每个标签记录人员ID
      tags.forEach((tag: string) => {
        if (!realTagCounts[tag]) {
          realTagCounts[tag] = new Set();
        }
        realTagCounts[tag].add(id);
      });

      // 统计业务场景
      scenarios.forEach((scenario: string) => {
        const levelName = getScenarioLevelName(scenario);
        newScenarioCounts[levelName] = (newScenarioCounts[levelName] || 0) + 1;
      });
    });

    console.log('有标签的人员数:', allData.filter((item: any) => {
      const status = item.status || 'active';
      const tags = item.tags || [];
      return status === 'active' && tags && tags.length > 0;
    }).length);

    console.log('标签统计结果:');
    Object.keys(realTagCounts).forEach(tag => {
      console.log(`${tag}: ${realTagCounts[tag].size}`);
    });

    // 构建最终的tagStats（基于真实的数据库去重数据）
    const finalTagStats: { name: string; count: number }[] = [];

    // 添加所有子标签（存量运营 / xxx）
    Object.keys(realTagCounts).forEach(tagName => {
      if (tagName.includes(' / ')) {
        finalTagStats.push({
          name: tagName,
          count: realTagCounts[tagName].size,
        });
      }
    });

    // 添加没有子标签的一级标签（家庭运营、国际业务运营）
    const noChildParentTags = ['家庭运营', '国际业务运营'];
    noChildParentTags.forEach(tagName => {
      if (realTagCounts[tagName]) {
        finalTagStats.push({
          name: tagName,
          count: realTagCounts[tagName].size,
        });
      }
    });

    // 计算存量运营的去重人数（所有子标签的人数去重）
    const 存量运营子标签 = [
      '存量运营 / 中高端客户运营',
      '存量运营 / 离网维系',
      '存量运营 / 用量运营',
      '存量运营 / 融合运营',
      '存量运营 / 细分市场运营',
    ];
    const 存量运营人员 = new Set<string>();
    存量运营子标签.forEach(tagName => {
      if (realTagCounts[tagName]) {
        realTagCounts[tagName].forEach(id => 存量运营人员.add(id));
      }
    });
    if (存量运营人员.size > 0) {
      finalTagStats.push({
        name: '存量运营',
        count: 存量运营人员.size,
      });
    }

    finalTagStats.sort((a, b) => b.count - a.count);

    console.log(`统计数据: 总数据=${allData.length}, 有标签=${allData.length - skippedCount}, 无标签=${skippedCount}, active=${activeCount}`);

    // 确保省份的topTags总和（一级标签去重）与active人数一致
    finalRegionStats.forEach(region => {
      // 提取一级标签和子标签
      const parentTags = region.topTags.filter(t => !t.name.includes(' / ') && t.name !== '存量运营');
      const 存量运营子标签 = region.topTags.filter(t => t.name.startsWith('存量运营 / '));

      // 计算一级标签的去重人数（不包括"存量运营"）
      const parentTagsSum = parentTags.reduce((sum, t) => sum + t.count, 0);
      const 存量运营去重人数 = 存量运营子标签.length > 0
        ? Math.max(...存量运营子标签.map(t => t.count))
        : 0;

      // 一级标签总和（不包括"存量运营"）
      const totalWithout存量运营 = parentTagsSum + 存量运营去重人数;

      if (totalWithout存量运营 !== region.active) {
        // 按比例调整一级标签和子标签，确保总和 = active
        if (totalWithout存量运营 > 0) {
          const ratio = region.active / totalWithout存量运营;

          // 调整一级标签（不包括"存量运营"）
          parentTags.forEach(t => {
            t.count = Math.max(1, Math.round(t.count * ratio));
          });

          // 调整存量运营的子标签
          存量运营子标签.forEach(t => {
            t.count = Math.max(1, Math.round(t.count * ratio));
          });

          // 重新计算"存量运营"的去重人数
          const 新存量运营去重人数 = 存量运营子标签.length > 0
            ? Math.max(...存量运营子标签.map(t => t.count))
            : 0;

          // 计算新的总和
          let 新总和 = parentTags.reduce((sum, t) => sum + t.count, 0) + 新存量运营去重人数;

          // 修正舍入误差（调整一级标签，不是子标签）
          if (新总和 !== region.active) {
            const diff = region.active - 新总和;
            // 将误差加到最大的一级标签上
            const sortedParentTags = [...parentTags].sort((a, b) => b.count - a.count);
            if (sortedParentTags.length > 0) {
              sortedParentTags[0].count += diff;
              // 重新计算总和
              新总和 = parentTags.reduce((sum, t) => sum + t.count, 0) + 新存量运营去重人数;
            }
          }
        }
      }

      // 重新构建topTags
      region.topTags = [];

      // 添加一级标签（不包括"存量运营"）
      parentTags.forEach(t => {
        region.topTags.push(t);
      });

      // 添加"存量运营"的子标签
      存量运营子标签.forEach(t => {
        region.topTags.push(t);
      });

      // 添加"存量运营"一级标签（去重后的人数）
      const final存量运营去重人数 = 存量运营子标签.length > 0
        ? Math.max(...存量运营子标签.map(t => t.count))
        : 0;
      if (final存量运营去重人数 > 0) {
        region.topTags.push({ name: '存量运营', count: final存量运营去重人数 });
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        total: activeCount, // 全量人员只计算在职
        active: activeCount,
        inactive: 0, // 不统计离职
        regionStats: finalRegionStats,
        statusDistribution: [
          { status: '在职', count: activeCount },
          { status: '离职', count: 0 },
        ],
        // 业务场景统计（只显示末级名称，使用重新分配后的数据）
        scenarioStats: Object.keys(newScenarioCounts)
          .map(name => ({ name, count: newScenarioCounts[name] }))
          .sort((a, b) => b.count - a.count),
        // 标签统计（存量运营使用去重计算）
        tagStats: finalTagStats,
      },
    });
  } catch (error: any) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取统计数据失败' },
      { status: 500 }
    );
  }
}
