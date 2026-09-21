'use client';

import { useState, useEffect, useRef } from 'react';
import { Building2, Users, UserCheck, UserX, ChevronDown, ChevronRight, Calendar, RefreshCw, Building, Layers, Tag, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RegionStats {
  region: string;
  total: number;
  active: number;
  inactive: number;
  departmentCount: number;
  topScenarios?: { name: string; count: number }[];
  topTags?: { name: string; count: number }[];
}

interface ChangeLog {
  id: string;
  employee_no: string;
  region: string;
  operation_type: string;
  operation_content: string;
  operator: string;
  operation_time: string;
}

interface OrganizationTreeProps {
  selectedScenario?: string;
  selectedTag?: string;
}

const ALL_PROVINCES = [
  '乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉', '博州',
  '巴州', '阿克苏', '克州', '喀什', '和田', '伊犁',
  '塔城', '阿勒泰', '奎屯', '石河子',
];

// 将公司名称映射到地市
function getProvinceFromCompanyName(companyName: string): string {
  const mapping: Record<string, string> = {
    '中国移动新疆公司乌鲁木齐分公司': '乌鲁木齐',
    '中国移动新疆公司克拉玛依分公司': '克拉玛依',
    '中国移动新疆公司吐鲁番分公司': '吐鲁番',
    '中国移动新疆公司哈密分公司': '哈密',
    '中国移动新疆公司昌吉分公司': '昌吉',
    '中国移动新疆公司博州分公司': '博州',
    '中国移动新疆公司巴州分公司': '巴州',
    '中国移动新疆公司阿克苏分公司': '阿克苏',
    '中国移动新疆公司克州分公司': '克州',
    '中国移动新疆公司喀什分公司': '喀什',
    '中国移动新疆公司和田分公司': '和田',
    '中国移动新疆公司伊犁分公司': '伊犁',
    '中国移动新疆公司塔城分公司': '塔城',
    '中国移动新疆公司阿勒泰分公司': '阿勒泰',
    '中国移动新疆公司奎屯分公司': '奎屯',
    '中国移动新疆公司石河子分公司': '石河子',
  };

  return mapping[companyName] || companyName;
}

// 将省份简称映射到公司全称
function getCompanyNameFromProvince(province: string): string {
  const mapping: Record<string, string> = {
    '乌鲁木齐': '中国移动新疆公司乌鲁木齐分公司',
    '克拉玛依': '中国移动新疆公司克拉玛依分公司',
    '吐鲁番': '中国移动新疆公司吐鲁番分公司',
    '哈密': '中国移动新疆公司哈密分公司',
    '昌吉': '中国移动新疆公司昌吉分公司',
    '博州': '中国移动新疆公司博州分公司',
    '巴州': '中国移动新疆公司巴州分公司',
    '阿克苏': '中国移动新疆公司阿克苏分公司',
    '克州': '中国移动新疆公司克州分公司',
    '喀什': '中国移动新疆公司喀什分公司',
    '和田': '中国移动新疆公司和田分公司',
    '伊犁': '中国移动新疆公司伊犁分公司',
    '塔城': '中国移动新疆公司塔城分公司',
    '阿勒泰': '中国移动新疆公司阿勒泰分公司',
    '奎屯': '中国移动新疆公司奎屯分公司',
    '石河子': '中国移动新疆公司石河子分公司',
  };

  return mapping[province] || province;
}

// 静态变更日志数据（用于前端展示，只保留与标签和默认接收人相关的操作）
const STATIC_CHANGE_LOGS: ChangeLog[] = [
  {
    id: '1',
    employee_no: 'EMP1001',
    region: '中国移动新疆公司乌鲁木齐分公司',
    operation_type: 'import',
    operation_content: '批量导入人员数据，成功导入 200 条',
    operator: '张伟',
    operation_time: '2026-03-08T10:30:00.000+08:00',
  },
  {
    id: '2',
    employee_no: 'EMP1002',
    region: '中国移动新疆公司克拉玛依分公司',
    operation_type: 'update',
    operation_content: '员工 张三标签变更：添加了"离网维系"和"存量运营 / 中高端客户运营"标签',
    operator: '李娜',
    operation_time: '2026-03-07T15:45:00.000+08:00',
  },
  {
    id: '3',
    employee_no: 'EMP1003',
    region: '中国移动新疆公司昌吉分公司',
    operation_type: 'update',
    operation_content: '员工 李四标签调整：从"存量运营"调整为"存量运营 / 离网维系"',
    operator: '王芳',
    operation_time: '2026-03-07T14:20:00.000+08:00',
  },
  {
    id: '4',
    employee_no: 'EMP1004',
    region: '中国移动新疆公司克拉玛依分公司',
    operation_type: 'import',
    operation_content: '批量导入人员数据，成功导入 100 条',
    operator: '刘洋',
    operation_time: '2026-03-06T16:30:00.000+08:00',
  },
  {
    id: '5',
    employee_no: 'EMP1005',
    region: '中国移动新疆公司乌鲁木齐分公司',
    operation_type: 'update',
    operation_content: '员工 王五标签变更：移除了"国际业务运营"标签，添加了"存量运营 / 融合运营"标签',
    operator: '陈静',
    operation_time: '2026-03-06T09:15:00.000+08:00',
  },
  {
    id: '6',
    employee_no: 'EMP1008',
    region: '中国移动新疆公司克州分公司',
    operation_type: 'import',
    operation_content: '批量导入人员数据，成功导入 150 条',
    operator: '周明',
    operation_time: '2026-03-04T15:50:00.000+08:00',
  },
  {
    id: '7',
    employee_no: 'EMP1011',
    region: '中国移动新疆公司伊犁分公司',
    operation_type: 'import',
    operation_content: '批量导入人员数据，成功导入 80 条',
    operator: '系统导入',
    operation_time: '2026-03-02T16:20:00.000+08:00',
  },
  {
    id: '8',
    employee_no: 'EMP1015',
    region: '中国移动新疆公司乌鲁木齐分公司',
    operation_type: 'import',
    operation_content: '批量导入人员数据，成功导入 120 条',
    operator: '系统导入',
    operation_time: '2026-02-28T14:55:00.000+08:00',
  },
  {
    id: '9',
    employee_no: 'EMP2001',
    region: '中国移动新疆公司博州分公司',
    operation_type: 'update',
    operation_content: '员工 赵六设置默认工单接收人',
    operator: '孙丽',
    operation_time: '2026-03-01T16:00:00.000+08:00',
  },
  {
    id: '10',
    employee_no: 'EMP2002',
    region: '中国移动新疆公司巴州分公司',
    operation_type: 'update',
    operation_content: '员工 吴十一取消默认工单接收人',
    operator: '吴芳',
    operation_time: '2026-03-02T11:30:00.000+08:00',
  },
  {
    id: '11',
    employee_no: 'EMP2003',
    region: '中国移动新疆公司石河子分公司',
    operation_type: 'update',
    operation_content: '员工 杨九标签变更：清空所有标签',
    operator: '管理员',
    operation_time: '2026-03-03T10:00:00.000+08:00',
  },
];

// 标签分布树型组件
interface TagDistributionNode {
  name: string;
  count: number;
  children?: TagDistributionNode[];
}

function TagDistributionTree({ tagStats }: { tagStats: { name: string; count: number }[] }) {
  // 将平铺的标签列表转换为树形结构
  const tree = convertTagStatsToTree(tagStats);

  return (
    <div>
      {tree.map((node, index) => (
        <TagDistributionTreeNode key={`${node.name}-${index}`} node={node} level={0} />
      ))}
    </div>
  );
}

function convertTagStatsToTree(tagStats: { name: string; count: number }[]): TagDistributionNode[] {
  const tree: { [key: string]: TagDistributionNode } = {};
  const result: TagDistributionNode[] = [];

  // 一级标签定义
  const firstLevelTags = ['存量运营', '国际业务运营', '家庭运营'];

  tagStats.forEach(item => {
    const parts = item.name.split(' / ');
    if (parts.length === 1) {
      // 只有一级标签（去重后的人数，如"存量运营" = 358）
      // 如果已经存在（之前通过子标签创建的），只更新count，不要覆盖children
      if (!tree[item.name]) {
        tree[item.name] = {
          name: item.name,
          count: item.count,
          children: [],
        };
      } else {
        tree[item.name].count = item.count;
      }
    } else {
      // 有二级标签
      const parentName = parts[0];
      const childName = parts[1]; // 只取第二部分作为二级标签名称

      if (!tree[parentName]) {
        tree[parentName] = {
          name: parentName,
          count: 0,
          children: [],
        };
      }
      tree[parentName].children!.push({
        name: childName,
        count: item.count,
      });

      // 如果一级标签的count已经是去重后的人数（如358），就不要再累加子标签
      // 只有当count为0时才累加子标签
      if (tree[parentName].count === 0) {
        tree[parentName].count += item.count;
      }
    }
  });

  // 按照预定义的顺序返回一级标签
  firstLevelTags.forEach(tag => {
    if (tree[tag]) {
      result.push(tree[tag]);
    }
  });

  // 添加其他不在预定义列表中的标签
  Object.keys(tree).forEach(tag => {
    if (!firstLevelTags.includes(tag)) {
      result.push(tree[tag]);
    }
  });

  return result;
}

function TagDistributionTreeNode({ node, level }: { node: TagDistributionNode; level: number }) {
  const [expanded, setExpanded] = useState(level === 0);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center justify-between text-sm p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors cursor-pointer"
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 flex-1">
          {hasChildren && (
            <span className="text-gray-500">
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </span>
          )}
          {!hasChildren && <span className="w-4" />}
          <Tag className="h-4 w-4 text-purple-500" />
          <span className="text-gray-700 font-medium">{node.name}</span>
        </div>
        <span className="font-semibold text-purple-600">{node.count}人</span>
      </div>

      {hasChildren && expanded && (
        <div className="mt-1">
          {node.children!.map((child, index) => (
            <TagDistributionTreeNode key={`${child.name}-${index}`} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function OrganizationTree({ selectedScenario = 'all', selectedTag = 'all' }: OrganizationTreeProps) {
  const [stats, setStats] = useState<any>(null);
  const [regionStats, setRegionStats] = useState<RegionStats[]>([]);
  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  // 弹窗状态
  const [showDistributionDialog, setShowDistributionDialog] = useState(false);
  const [distributionData, setDistributionData] = useState<{
    type: 'national' | 'region';
    title: string;
    scenarioStats: { name: string; count: number }[];
    tagStats: { name: string; count: number }[];
  } | null>(null);

  // 变更日志分页
  const [logCurrentPage, setLogCurrentPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(0);
  const logPageSize = 5;

  // 当筛选条件变化时重新加载数据
  useEffect(() => {
    loadData();
  }, [selectedScenario, selectedTag, logCurrentPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedScenario && selectedScenario !== 'all' && selectedScenario !== '全部') params.append('scenario', selectedScenario);
      if (selectedTag && selectedTag !== 'all' && selectedTag !== '全部') params.append('tag', selectedTag);

      console.log('OrganizationTree loadData - 请求参数:', { selectedScenario, selectedTag, params: params.toString() });

      // 加载统计数据
      const statsRes = await fetch(`/api/staff-management/stats?${params}`);
      const statsResult = await statsRes.json();

      console.log('OrganizationTree loadData - API响应:', statsResult);

      if (statsResult.success) {
        console.log('API返回数据:', statsResult.data);
        console.log('API返回的regionStats:', statsResult.data.regionStats);
        setStats(statsResult.data);
        // 确保所有16地市分公司都显示，即使数量为0
        const completeRegions = ALL_PROVINCES.map(province => {
          const found = (statsResult.data.regionStats || []).find((r: RegionStats) => {
            const regionProvince = getProvinceFromCompanyName(r.region);
            return regionProvince === province;
          });
          // 如果找到数据，使用公司全称；否则使用省份简称，并添加空的topTags
          if (found) {
            return {
              ...found,
              // 保持公司全称
              region: found.region,
            };
          } else {
            return {
              region: province, // 使用省份简称
              total: 0,
              active: 0,
              inactive: 0,
              departmentCount: 0,
              topTags: [],
            };
          }
        });
        console.log('生成的completeRegions:', completeRegions);
        setRegionStats(completeRegions);
      }

      // 直接使用静态变更日志数据
      const start = (logCurrentPage - 1) * logPageSize;
      const end = start + logPageSize;
      const paginatedLogs = STATIC_CHANGE_LOGS.slice(start, end);
      setChangeLogs(paginatedLogs);
      setLogTotalPages(Math.ceil(STATIC_CHANGE_LOGS.length / logPageSize));

    } catch (error) {
      console.error('加载数据失败:', error);
      // 加载失败时也使用静态数据
      const start = (logCurrentPage - 1) * logPageSize;
      const end = start + logPageSize;
      const paginatedLogs = STATIC_CHANGE_LOGS.slice(start, end);
      setChangeLogs(paginatedLogs);
      setLogTotalPages(Math.ceil(STATIC_CHANGE_LOGS.length / logPageSize));
    } finally {
      setLoading(false);
    }
  };

  const getOperationTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      create: { label: '新增', variant: 'default' },
      update: { label: '修改', variant: 'secondary' },
      delete: { label: '删除', variant: 'outline' },
      import: { label: '导入', variant: 'default' },
    };
    const { label, variant } = typeMap[type] || { label: type, variant: 'outline' };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const formatTime = (time: string) => {
    const date = new Date(time);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  // 打开分布弹窗
  const handleShowDistribution = (type: 'national' | 'region' | 'company', region?: string) => {
    if (type === 'national') {
      setDistributionData({
        type: 'national',
        title: '全国标签分布',
        scenarioStats: [],
        tagStats: stats?.tagStats || [],
      });
    } else {
      // 对于省公司和专业公司，直接从stats.regionStats中查找
      // region参数可能是省份简称（如"乌鲁木齐"）或公司全称（如"在线公司"、"国际公司"）
      let targetRegion = region || '';

      // 如果是省份简称，转换为公司全称
      if (region && !region.includes('公司')) {
        targetRegion = getCompanyNameFromProvince(region);
      }

      const companyRegion = (stats?.regionStats || []).find((r: any) => {
        return r.region === targetRegion;
      });
      console.log('卡片点击 - type:', type, ', region:', region);
      console.log('目标组织:', targetRegion);
      console.log('找到的companyRegion:', companyRegion);
      console.log('companyRegion?.topTags:', companyRegion?.topTags);
      setDistributionData({
        type: 'region',
        title: `${region}标签分布`,
        scenarioStats: [],
        tagStats: companyRegion?.topTags || [],
      });
    }
    setShowDistributionDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stats && (
        <>
          {/* 树形视图 */}
          <div className="relative">
            {/* 根节点 */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <Card className="w-64 bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold text-gray-900">全国运营人员</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {stats.total}人
                        </Badge>
                        {/* 查看分布图标按钮 */}
                        <button
                          className="p-1 hover:bg-blue-100 rounded transition-colors"
                          onClick={() => handleShowDistribution('national')}
                          title="查看人员分布"
                        >
                          <Layers className="h-4 w-4 text-blue-600" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* 展开/收起按钮 */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-6 w-6 p-0 bg-white border"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* 连接线 */}
              {expanded && (
                <div className="w-px h-6 bg-blue-300"></div>
              )}

              {/* 省份节点 */}
              {expanded && (
                <div className="mt-6 relative">
                  {/* 横向连接线 */}
                  <div className="absolute top-0 left-4 right-4 h-px bg-blue-300"></div>

                  {/* 省份卡片网格 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 mt-2">
                    {/* 16地市分公司卡片 */}
                    {regionStats.map((region, index) => (
                      <div key={region.region} className="relative">
                        {/* 竖向连接线 */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-px h-6 bg-blue-300"></div>

                        {/* 圆点 */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-300 rounded-full border-2 border-white"></div>

                        {/* 卡片 */}
                        <Card
                          className="cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200 bg-gradient-to-br from-white to-blue-50 border-blue-100"
                          onClick={() => handleShowDistribution('region', region.region)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Building className="h-4 w-4 text-blue-500" />
                              <span className="font-medium text-sm text-gray-900">{region.region}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <UserCheck className="h-3.5 w-3.5 text-green-500" />
                              <span className="text-xs text-gray-600">{region.active}人</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}

                    {/* 在线公司卡片 */}
                    <div className="relative">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-px h-6 bg-blue-300"></div>
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-300 rounded-full border-2 border-white"></div>

                      <Card
                        className="cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200 bg-gradient-to-br from-purple-50 to-white border-purple-100"
                        onClick={() => handleShowDistribution('company', '在线公司')}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Building className="h-4 w-4 text-purple-500" />
                            <span className="font-medium text-sm text-gray-900">在线公司</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <UserCheck className="h-3.5 w-3.5 text-green-500" />
                            <span className="text-xs text-gray-600">0人</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* 国际公司卡片 */}
                    <div className="relative">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-px h-6 bg-blue-300"></div>
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-300 rounded-full border-2 border-white"></div>

                      <Card
                        className="cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200 bg-gradient-to-br from-green-50 to-white border-green-100"
                        onClick={() => handleShowDistribution('company', '国际公司')}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Building className="h-4 w-4 text-green-500" />
                            <span className="font-medium text-sm text-gray-900">国际公司</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <UserCheck className="h-3.5 w-3.5 text-green-500" />
                            <span className="text-xs text-gray-600">0人</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 变更日志 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  变更日志
                </h3>
                <Button size="sm" variant="outline" onClick={loadData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  刷新
                </Button>
              </div>
              <div className="space-y-3">
                {changeLogs.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">暂无变更记录</div>
                ) : (
                  changeLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getOperationTypeBadge(log.operation_type)}
                          <span className="text-sm font-medium text-gray-900">{log.region}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{formatTime(log.operation_time)}</span>
                        </div>
                        <div className="text-sm text-gray-700">{log.operation_content}</div>
                      </div>
                      <div className="text-xs text-gray-500">{log.operator}</div>
                    </div>
                  ))
                )}
              </div>

              {/* 分页 */}
              {logTotalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    第 {logCurrentPage} / {logTotalPages} 页
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setLogCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={logCurrentPage === 1}
                    >
                      上一页
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setLogCurrentPage(prev => Math.min(logTotalPages, prev + 1))}
                      disabled={logCurrentPage === logTotalPages}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* 标签分布弹窗 */}
      <Dialog open={showDistributionDialog} onOpenChange={setShowDistributionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{distributionData?.title}</DialogTitle>
          </DialogHeader>
          <div>
            {/* 标签统计 - 树型结构展示 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  标签分布
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {distributionData && distributionData.tagStats && distributionData.tagStats.length > 0 ? (
                    <TagDistributionTree tagStats={distributionData.tagStats} />
                  ) : (
                    <div className="text-center text-gray-500 py-4">暂无数据</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
