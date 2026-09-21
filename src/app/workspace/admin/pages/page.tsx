'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight, ChevronDown, FolderOpen, FileText, Plus, Save, RefreshCw, Database, Download, Database as DatabaseIcon } from 'lucide-react';
import { DatabaseInitDialog } from '@/components/ui/database-init-dialog';

interface Module {
  module_code: string;
  module_name: string;
  icon?: string;
  sort_order: number;
  status: string;
}

interface Scenario {
  id: string;
  scenario_code: string;
  scenario_name: string;
  module_code: string;
  module_name: string;
  level: number;
  sort_order: number;
  status: string;
}

interface Page {
  id: string;
  page_code: string;
  page_name: string;
  page_type: string;
  page_path: string;
  scenario_id: string;
  scenario_code: string;
  scenario_name: string;
  module_code: string;
  module_name: string;
  is_tree_page: boolean;
  sort_order: number;
  status: string;
}

interface ModuleStats {
  module: string;
  code: string;
  pageCount: number;
  pages: Page[];
}

export default function PageManagementPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [moduleStats, setModuleStats] = useState<ModuleStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ moduleCount: 0, scenarioCount: 0, pageCount: 0 });
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [initDialogOpen, setInitDialogOpen] = useState(false);
  const [newPage, setNewPage] = useState({
    page_code: '',
    page_name: '',
    page_type: 'OVERVIEW',
    page_path: '',
    scenario_code: '',
    module_code: '',
    is_tree_page: false,
    sort_order: 1,
  });

  useEffect(() => {
    fetchData();
  }, []);

  // 当数据加载完成且没有数据时，自动显示初始化对话框
  useEffect(() => {
    if (!loading && stats.moduleCount === 0 && !initDialogOpen) {
      // 延迟显示对话框，让用户先看到页面
      const timer = setTimeout(() => {
        if (confirm('检测到数据库未初始化，是否现在初始化？\n\n点击"确定"打开初始化向导。')) {
          setInitDialogOpen(true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, stats, initDialogOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pages/tree');
      const data = await response.json();

      if (data.success) {
        setModules(data.modules || []);
        setScenarios(data.scenarios || []);
        setModuleStats(data.moduleStats || []);
        setStats(data.stats || { moduleCount: 0, scenarioCount: 0, pageCount: 0 });
      }
    } catch (error) {
      console.error('获取页面数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const initDatabase = () => {
    setInitDialogOpen(true);
  };

  const handleInitSuccess = () => {
    fetchData();
  };

  const initPagesData = async () => {
    if (!confirm('确定要初始化页面数据吗？这将添加所有预设的页面数据。')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/init-pages-data', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        alert(`初始化完成：成功 ${data.successCount} 条，失败 ${data.errorCount} 条`);
        fetchData();
      } else {
        alert(`初始化失败: ${data.message}`);
        if (data.errors && data.errors.length > 0) {
          console.error('错误详情:', data.errors);
        }
      }
    } catch (error) {
      console.error('初始化页面数据失败:', error);
      alert('初始化失败，请查看控制台日志');
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleCode: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleCode)) {
      newExpanded.delete(moduleCode);
    } else {
      newExpanded.add(moduleCode);
    }
    setExpandedModules(newExpanded);
  };

  const handleAddPage = async () => {
    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPage),
      });
      const data = await response.json();

      if (data.success) {
        alert('添加页面成功');
        setNewPage({
          page_code: '',
          page_name: '',
          page_type: 'OVERVIEW',
          page_path: '',
          scenario_code: '',
          module_code: '',
          is_tree_page: false,
          sort_order: 1,
        });
        fetchData();
      } else {
        alert(`添加失败: ${data.message}`);
      }
    } catch (error) {
      console.error('添加页面失败:', error);
      alert('添加失败，请查看控制台日志');
    }
  };

  const getPageTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      OVERVIEW: { label: '概览', variant: 'default' },
      TREE: { label: '指标树', variant: 'secondary' },
      LIST: { label: '列表', variant: 'outline' },
      FORM: { label: '表单', variant: 'outline' },
      DASHBOARD: { label: '仪表板', variant: 'default' },
      PORTAL: { label: '门户', variant: 'default' },
    };
    const info = typeMap[type] || { label: type, variant: 'outline' };
    return <Badge variant={info.variant}>{info.label}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">页面管理</h1>
          <p className="text-muted-foreground">管理系统页面、业务场景和模块</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button variant="outline" onClick={initDatabase} disabled={loading}>
            <DatabaseIcon className="h-4 w-4 mr-2" />
            初始化数据库
          </Button>
          <Button onClick={initPagesData} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            初始化页面数据
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">模块数量</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.moduleCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">业务场景数量</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scenarioCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">页面数量</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pageCount}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tree" className="w-full">
        <TabsList>
          <TabsTrigger value="tree">树形视图</TabsTrigger>
          <TabsTrigger value="add">添加页面</TabsTrigger>
        </TabsList>

        <TabsContent value="tree" className="space-y-4">
          {moduleStats.map((module) => (
            <Collapsible
              key={module.code}
              open={expandedModules.has(module.code)}
              onOpenChange={() => toggleModule(module.code)}
            >
              <Card>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="flex flex-row items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      {expandedModules.has(module.code) ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                      <FolderOpen className="h-5 w-5 text-blue-500" />
                      <div className="text-left">
                        <CardTitle className="text-base">{module.module}</CardTitle>
                        <CardDescription className="text-xs">
                          {module.pageCount} 个页面
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>页面名称</TableHead>
                          <TableHead>页面类型</TableHead>
                          <TableHead>业务场景</TableHead>
                          <TableHead>页面路径</TableHead>
                          <TableHead>指标树</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {module.pages.map((page) => (
                          <TableRow key={page.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-400" />
                                {page.page_name}
                              </div>
                              <div className="text-xs text-muted-foreground">{page.page_code}</div>
                            </TableCell>
                            <TableCell>{getPageTypeBadge(page.page_type)}</TableCell>
                            <TableCell>{page.scenario_name}</TableCell>
                            <TableCell className="font-mono text-xs">{page.page_path}</TableCell>
                            <TableCell>
                              {page.is_tree_page ? (
                                <Badge variant="secondary">是</Badge>
                              ) : (
                                <Badge variant="outline">否</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>添加新页面</CardTitle>
              <CardDescription>手动添加一个新的页面到系统</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>页面代码 *</Label>
                  <Input
                    placeholder="PAGE_CHURN_RETENTION"
                    value={newPage.page_code}
                    onChange={(e) => setNewPage({ ...newPage, page_code: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>页面名称 *</Label>
                  <Input
                    placeholder="离网维系"
                    value={newPage.page_name}
                    onChange={(e) => setNewPage({ ...newPage, page_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>页面类型 *</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={newPage.page_type}
                    onChange={(e) => setNewPage({ ...newPage, page_type: e.target.value })}
                  >
                    <option value="OVERVIEW">概览</option>
                    <option value="TREE">指标树</option>
                    <option value="LIST">列表</option>
                    <option value="FORM">表单</option>
                    <option value="DASHBOARD">仪表板</option>
                    <option value="PORTAL">门户</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>页面路径 *</Label>
                  <Input
                    placeholder="/portal/churn-retention"
                    value={newPage.page_path}
                    onChange={(e) => setNewPage({ ...newPage, page_path: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>所属模块 *</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={newPage.module_code}
                    onChange={(e) => setNewPage({ ...newPage, module_code: e.target.value })}
                  >
                    <option value="">请选择模块</option>
                    {modules.map((module) => (
                      <option key={module.module_code} value={module.module_code}>
                        {module.module_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>业务场景 *</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={newPage.scenario_code}
                    onChange={(e) => setNewPage({ ...newPage, scenario_code: e.target.value })}
                  >
                    <option value="">请选择场景</option>
                    {scenarios
                      .filter((s) => !newPage.module_code || s.module_code === newPage.module_code)
                      .map((scenario) => (
                        <option key={scenario.scenario_code} value={scenario.scenario_code}>
                          {scenario.scenario_name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is-tree-page"
                  checked={newPage.is_tree_page}
                  onChange={(e) => setNewPage({ ...newPage, is_tree_page: e.target.checked })}
                />
                <Label htmlFor="is-tree-page">这是指标树页面</Label>
              </div>

              <div className="space-y-2">
                <Label>排序顺序</Label>
                <Input
                  type="number"
                  value={newPage.sort_order}
                  onChange={(e) => setNewPage({ ...newPage, sort_order: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNewPage({
                  page_code: '',
                  page_name: '',
                  page_type: 'OVERVIEW',
                  page_path: '',
                  scenario_code: '',
                  module_code: '',
                  is_tree_page: false,
                  sort_order: 1,
                })}>
                  重置
                </Button>
                <Button onClick={handleAddPage}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加页面
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <DatabaseInitDialog
        open={initDialogOpen}
        onClose={() => setInitDialogOpen(false)}
        onInitSuccess={handleInitSuccess}
      />
    </div>
  );
}
