'use client';

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

// 三级分类数据
const categoryOptions = [
  { id: '1-1-1', name: '风险预警类/流量预警/流量达量预警' },
  { id: '1-1-2', name: '风险预警类/流量预警/特定内容高频访问' },
  { id: '1-2-1', name: '风险预警类/资费风险/地板价套餐查询高流量套餐' },
  { id: '1-2-2', name: '风险预警类/资费风险/零流量使用预警' },
  { id: '2-1-1', name: '价值提升类/套餐升级/高价值套餐推荐' },
  { id: '2-1-2', name: '价值提升类/套餐升级/流量包智能推荐' },
  { id: '2-2-1', name: '价值提升类/增值业务/视频会员推荐' },
  { id: '2-2-2', name: '价值提升类/增值业务/云存储服务推荐' },
  { id: '3-1-1', name: '生命周期类/新客户/新客户关怀' },
  { id: '3-1-2', name: '生命周期类/新客户/新客户激活' },
  { id: '3-2-1', name: '生命周期类/老客户/合约到期提醒' },
  { id: '3-2-2', name: '生命周期类/老客户/续约优惠推荐' },
];

// 商机源数据
const sourceOptions = [
  { id: '1', name: 'CRM系统' },
  { id: '2', name: '营销活动平台' },
  { id: '3', name: '外呼系统' },
  { id: '4', name: '线上渠道' },
  { id: '5', name: '线下营业厅' },
  { id: '6', name: '代理商系统' },
  { id: '7', name: '微信小程序' },
  { id: '8', name: '企业微信' },
];

// 五大运营场景
const scenarioOptions = [
  { id: '1', name: '流量运营' },
  { id: '2', name: '中高端保有' },
  { id: '3', name: '离网维系' },
  { id: '4', name: '家庭运营' },
  { id: '5', name: '校园运营' },
];

// 客户类别
const CUSTOMER_CATEGORY_OPTIONS = [
  { id: 'global', name: '全球通客户' },
  { id: 'midhigh', name: '中高端客户' },
  { id: 'potential', name: '潜力客户' },
  { id: 'normal', name: '普通客户' },
];

// 商机业务类型数据
interface BusinessType {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  sourceId: string;
  sourceName: string;
  customerCategoryId: string;
  customerCategoryName: string;
  scenarioId: string;
  scenarioName: string;
  status: 'active' | 'inactive';
  createTime: string;
  creator: string;
}

const initialBusinessTypes: BusinessType[] = [
  {
    id: 'BT001',
    name: '流量达量预警-全球通客户-CRM系统',
    categoryId: '1-1-1',
    categoryName: '风险预警类/流量预警/流量达量预警',
    sourceId: '1',
    sourceName: 'CRM系统',
    customerCategoryId: 'global',
    customerCategoryName: '全球通客户',
    scenarioId: '1',
    scenarioName: '流量运营',
    status: 'active',
    createTime: '2024-01-15 10:30',
    creator: '张三'
  },
  {
    id: 'BT002',
    name: '特定内容高频访问-全球通客户-营销活动平台',
    categoryId: '1-1-2',
    categoryName: '风险预警类/流量预警/特定内容高频访问',
    sourceId: '2',
    sourceName: '营销活动平台',
    customerCategoryId: 'global',
    customerCategoryName: '全球通客户',
    scenarioId: '1',
    scenarioName: '流量运营',
    status: 'active',
    createTime: '2024-01-15 09:45',
    creator: '李四'
  },
  {
    id: 'BT003',
    name: '高价值套餐推荐-中高端客户-外呼系统',
    categoryId: '2-1-1',
    categoryName: '价值提升类/套餐升级/高价值套餐推荐',
    sourceId: '3',
    sourceName: '外呼系统',
    customerCategoryId: 'midhigh',
    customerCategoryName: '中高端客户',
    scenarioId: '2',
    scenarioName: '中高端保有',
    status: 'active',
    createTime: '2024-01-15 08:20',
    creator: '王五'
  },
  {
    id: 'BT004',
    name: '流量包智能推荐-中高端客户-线上渠道',
    categoryId: '2-1-2',
    categoryName: '价值提升类/套餐升级/流量包智能推荐',
    sourceId: '4',
    sourceName: '线上渠道',
    customerCategoryId: 'midhigh',
    customerCategoryName: '中高端客户',
    scenarioId: '3',
    scenarioName: '离网维系',
    status: 'inactive',
    createTime: '2024-01-14 18:00',
    creator: '赵六'
  },
  {
    id: 'BT005',
    name: '合约到期提醒-潜力客户-线下营业厅',
    categoryId: '3-2-1',
    categoryName: '生命周期类/老客户/合约到期提醒',
    sourceId: '5',
    sourceName: '线下营业厅',
    customerCategoryId: 'potential',
    customerCategoryName: '潜力客户',
    scenarioId: '4',
    scenarioName: '家庭运营',
    status: 'active',
    createTime: '2024-01-15 10:00',
    creator: '钱七'
  },
  {
    id: 'BT006',
    name: '新客户关怀-普通客户-微信小程序',
    categoryId: '3-1-1',
    categoryName: '生命周期类/新客户/新客户关怀',
    sourceId: '7',
    sourceName: '微信小程序',
    customerCategoryId: 'normal',
    customerCategoryName: '普通客户',
    scenarioId: '5',
    scenarioName: '校园运营',
    status: 'active',
    createTime: '2024-01-13 14:20',
    creator: '孙八'
  },
];

export default function BusinessTypeManagementPage() {
  const [businessTypeList, setBusinessTypeList] = useState<BusinessType[]>(initialBusinessTypes);
  const [searchName, setSearchName] = useState("");
  const [searchCategory, setSearchCategory] = useState<string>("all");
  const [searchSource, setSearchSource] = useState<string>("all");
  const [searchStatus, setSearchStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<BusinessType | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    categoryId: '',
    sourceId: '',
    customerCategoryId: '',
    scenarioId: '',
  });

  // 筛选后的列表
  const filteredList = businessTypeList.filter(item => {
    const matchName = item.name.includes(searchName);
    const matchCategory = searchCategory === "all" || item.categoryId === searchCategory;
    const matchSource = searchSource === "all" || item.sourceId === searchSource;
    const matchStatus = searchStatus === "all" || item.status === searchStatus;
    return matchName && matchCategory && matchSource && matchStatus;
  });

  // 重置表单
  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      categoryId: '',
      sourceId: '',
      customerCategoryId: '',
      scenarioId: '',
    });
    setEditingType(null);
  };

  // 打开新增弹窗
  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // 打开编辑弹窗
  const openEditDialog = (item: BusinessType) => {
    setEditingType(item);
    setFormData({
      id: item.id,
      name: item.name,
      categoryId: item.categoryId,
      sourceId: item.sourceId,
      customerCategoryId: item.customerCategoryId,
      scenarioId: item.scenarioId,
    });
    setIsDialogOpen(true);
  };

  // 自动生成业务类型名称：商机分类(三级叶节点)-客户类别-商机源
  const generateName = (categoryId: string, customerCategoryId: string, sourceId: string) => {
    const category = categoryOptions.find(c => c.id === categoryId);
    const customerCategory = CUSTOMER_CATEGORY_OPTIONS.find(c => c.id === customerCategoryId);
    const source = sourceOptions.find(s => s.id === sourceId);
    const parts = [category?.name.split('/').pop(), customerCategory?.name, source?.name].filter(Boolean);
    return parts.length === 3 ? parts.join('-') : '';
  };

  // 处理分类变化，自动匹配运营场景
  const handleCategoryChange = (categoryId: string) => {
    let scenarioId = '';
    if (categoryId.startsWith('1-')) {
      scenarioId = '1'; // 风险预警场景
    } else if (categoryId.startsWith('2-')) {
      scenarioId = '2'; // 价值提升场景
    } else if (categoryId.startsWith('3-')) {
      scenarioId = '3'; // 生命周期管理
    }

    setFormData(prev => ({
      ...prev,
      categoryId,
      scenarioId,
      name: generateName(categoryId, prev.customerCategoryId, prev.sourceId),
    }));
  };

  // 处理商机源变化
  const handleSourceChange = (sourceId: string) => {
    setFormData(prev => ({
      ...prev,
      sourceId,
      name: generateName(prev.categoryId, prev.customerCategoryId, sourceId),
    }));
  };

  // 处理客户类别变化
  const handleCustomerCategoryChange = (customerCategoryId: string) => {
    setFormData(prev => ({
      ...prev,
      customerCategoryId,
      name: generateName(prev.categoryId, customerCategoryId, prev.sourceId),
    }));
  };

  // 保存
  const handleSave = () => {
    if (!formData.customerCategoryId) {
      toast.error('请选择客户类别');
      return;
    }
    const category = categoryOptions.find(c => c.id === formData.categoryId);
    const source = sourceOptions.find(c => c.id === formData.sourceId);
    const customerCategory = CUSTOMER_CATEGORY_OPTIONS.find(c => c.id === formData.customerCategoryId);
    const scenario = scenarioOptions.find(s => s.id === formData.scenarioId);

    if (editingType) {
      // 编辑
      setBusinessTypeList(prev => prev.map(item =>
        item.id === editingType.id
          ? {
              ...item,
              name: formData.name,
              categoryId: formData.categoryId,
              categoryName: category?.name || '',
              sourceId: formData.sourceId,
              sourceName: source?.name || '',
              customerCategoryId: formData.customerCategoryId,
              customerCategoryName: customerCategory?.name || '',
              scenarioId: formData.scenarioId,
              scenarioName: scenario?.name || '',
            }
          : item
      ));
    } else {
      // 新增
      const newItem: BusinessType = {
        id: `BT${String(businessTypeList.length + 1).padStart(3, '0')}`,
        name: formData.name,
        categoryId: formData.categoryId,
        categoryName: category?.name || '',
        sourceId: formData.sourceId,
        sourceName: source?.name || '',
        customerCategoryId: formData.customerCategoryId,
        customerCategoryName: customerCategory?.name || '',
        scenarioId: formData.scenarioId,
        scenarioName: scenario?.name || '',
        status: 'active',
        createTime: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(/\//g, '-'),
        creator: '当前用户',
      };
      setBusinessTypeList(prev => [...prev, newItem]);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  // 切换状态
  const handleToggleStatus = (id: string) => {
    setBusinessTypeList(prev => prev.map(item =>
      item.id === id 
        ? { ...item, status: item.status === 'active' ? 'inactive' : 'active' } 
        : item
    ));
  };

  // 删除
  const handleDelete = (id: string) => {
    setBusinessTypeList(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">商机业务类型管理</h1>
        <Button onClick={openAddDialog} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          新增业务类型
        </Button>
      </div>

      {/* 搜索筛选 */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="搜索业务类型名称"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={searchCategory} onValueChange={setSearchCategory}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="选择商机分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              {categoryOptions.map(option => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={searchSource} onValueChange={setSearchSource}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="选择商机源" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部来源</SelectItem>
              {sourceOptions.map(option => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={searchStatus} onValueChange={setSearchStatus}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="active">启用</SelectItem>
              <SelectItem value="inactive">停用</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* 数据表格 */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">业务类型ID</TableHead>
              <TableHead className="w-[200px]">业务类型名称</TableHead>
              <TableHead className="w-[280px]">商机分类</TableHead>
              <TableHead className="w-[120px]">商机源</TableHead>
              <TableHead className="w-[110px]">客户类别</TableHead>
              <TableHead className="w-[140px]">运营场景</TableHead>
              <TableHead className="w-[80px]">状态</TableHead>
              <TableHead className="w-[150px]">创建时间</TableHead>
              <TableHead className="w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredList.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/50">
                <TableCell className="font-medium text-primary">{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <span className="text-sm">{item.categoryName}</span>
                </TableCell>
                <TableCell>{item.sourceName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{item.customerCategoryName}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.scenarioName}</Badge>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={item.status === 'active'}
                    onCheckedChange={() => handleToggleStatus(item.id)}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground">{item.createTime}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => openEditDialog(item)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredList.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            暂无数据
          </div>
        )}
      </Card>

      {/* 新增/编辑弹窗 */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingType ? '编辑业务类型' : '新增业务类型'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>商机分类 <span className="text-destructive">*</span></Label>
              <Select 
                value={formData.categoryId} 
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择商机分类" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>商机源 <span className="text-destructive">*</span></Label>
              <Select
                value={formData.sourceId}
                onValueChange={handleSourceChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择商机源" />
                </SelectTrigger>
                <SelectContent>
                  {sourceOptions.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>客户类别 <span className="text-destructive">*</span></Label>
              <Select
                value={formData.customerCategoryId}
                onValueChange={handleCustomerCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择客户类别" />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMER_CATEGORY_OPTIONS.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>业务类型名称 <span className="text-destructive">*</span></Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="请输入业务类型名称（自动生成可修改）"
              />
              <p className="text-xs text-muted-foreground">根据商机分类、客户类别、商机源自动生成（格式：商机分类-客户类别-商机源），可手动修改</p>
            </div>
            
            <div className="space-y-2">
              <Label>运营场景 <span className="text-destructive">*</span></Label>
              <Select 
                value={formData.scenarioId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, scenarioId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择运营场景" />
                </SelectTrigger>
                <SelectContent>
                  {scenarioOptions.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">根据商机分类自动匹配，可手动修改</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
              取消
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name || !formData.categoryId || !formData.sourceId || !formData.customerCategoryId || !formData.scenarioId}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
