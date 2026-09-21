'use client';

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit2, Trash2, ChevronRight, ChevronDown, Folder, FolderOpen, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

// 类型定义
interface Category3 {
  id: string;
  name: string;
  code: string;
  description: string;
  createTime: string;
}

interface Category2 {
  id: string;
  name: string;
  code: string;
  children: Category3[];
}

interface Category1 {
  id: string;
  name: string;
  code: string;
  children: Category2[];
}

// 预置数据 - 三级分类
const initialCategories: Category1[] = [
  {
    id: "C001",
    name: "风险预警类",
    code: "C001",
    children: [
      {
        id: "C001-001",
        name: "流量预警",
        code: "C001-001",
        children: [
          { id: "C001-001-001", name: "流量达量预警", code: "C001-001-001", description: "当月已用流量/套餐总量≥80%或100%", createTime: "2024-01-15 10:30" },
        ]
      },
      {
        id: "C001-002",
        name: "携转挽留",
        code: "C001-002",
        children: []
      },
      {
        id: "C001-003",
        name: "产品到期",
        code: "C001-003",
        children: []
      },
      {
        id: "C001-004",
        name: "家宽竞品到期",
        code: "C001-004",
        children: []
      },
      {
        id: "C001-005",
        name: "宽带到期",
        code: "C001-005",
        children: []
      },
    ]
  },
  {
    id: "C002",
    name: "咨询投诉类",
    code: "C002",
    children: [
      { id: "C002-001", name: "宽带咨询", code: "C002-001", children: [] },
      { id: "C002-002", name: "业务产品咨询", code: "C002-002", children: [] },
      { id: "C002-003", name: "权益咨询", code: "C002-003", children: [] },
      { id: "C002-004", name: "投诉处理", code: "C002-004", children: [] },
    ]
  },
  {
    id: "C003",
    name: "预约受理类",
    code: "C003",
    children: [
      { id: "C003-001", name: "终端预约", code: "C003-001", children: [] },
      { id: "C003-002", name: "号卡预约", code: "C003-002", children: [] },
      { id: "C003-003", name: "宽带预约", code: "C003-003", children: [] },
      { id: "C003-004", name: "智家预约", code: "C003-004", children: [] },
      { id: "C003-005", name: "商铺产品预约", code: "C003-005", children: [] },
    ]
  },
  {
    id: "C004",
    name: "价值提升类",
    code: "C004",
    children: [
      {
        id: "C004-001",
        name: "流量经营",
        code: "C004-001",
        children: [
          { id: "C004-001-001", name: "特定内容高频访问", code: "C004-001-001", description: "视频/游戏/社交类APP流量占比≥50%", createTime: "2024-01-15 11:20" },
          { id: "C004-001-002", name: "地板价套餐查询高流量套餐", code: "C004-001-002", description: "当前套餐月租≤19元且近7天浏览高流量套餐≥3次", createTime: "2024-01-15 11:25" },
        ]
      },
      { id: "C004-002", name: "权益经营", code: "C004-002", children: [] },
      { id: "C004-003", name: "融合经营", code: "C004-003", children: [] },
      { id: "C004-004", name: "终端经营", code: "C004-004", children: [] },
    ]
  },
  {
    id: "C005",
    name: "生命周期类",
    code: "C005",
    children: [
      { id: "C005-001", name: "新用户激活", code: "C005-001", children: [] },
      {
        id: "C005-002",
        name: "沉默流失预警",
        code: "C005-002",
        children: [
          { id: "C005-002-001", name: "零流量使用预警", code: "C005-002-001", description: "连续30天无任何流量消耗", createTime: "2024-01-15 14:00" },
        ]
      },
      { id: "C005-003", name: "流失挽回", code: "C005-003", children: [] },
      { id: "C005-004", name: "老用户回馈", code: "C005-004", children: [] },
    ]
  },
];

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState<Category1[]>(initialCategories);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["C001", "C002", "C003", "C004", "C005"]));
  const [selectedId, setSelectedId] = useState<string | null>(null); // null表示全部商机分类
  const [searchTerm, setSearchTerm] = useState("");
  const [rightSearchTerm, setRightSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category3 | null>(null);
  const [isAddingLevel1, setIsAddingLevel1] = useState(false);
  const [isAddingLevel2, setIsAddingLevel2] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    parentLevel1: "",
    parentLevel2: "",
    editingLevel1Id: "",
    editingLevel2Id: "",
  });

  // 获取当前选中的分类路径
  const getSelectedPath = () => {
    if (!selectedId) return "全部商机分类";
    for (const c1 of categories) {
      if (c1.id === selectedId) return c1.name;
      for (const c2 of c1.children) {
        if (c2.id === selectedId) return `${c1.name} / ${c2.name}`;
      }
    }
    return "全部商机分类";
  };

  // 获取三级分类所属的完整分类路径
  const getCategoryPath = (item: Category3) => {
    for (const c1 of categories) {
      for (const c2 of c1.children) {
        if (c2.children.some(c => c.id === item.id)) {
          return `${c1.name}/${c2.name}`;
        }
      }
    }
    return "";
  };

  // 获取当前右侧列表数据
  const getCurrentList = (): Category3[] => {
    if (!selectedId) {
      // 显示所有三级分类
      const all: Category3[] = [];
      categories.forEach(c1 => {
        c1.children.forEach(c2 => {
          all.push(...c2.children);
        });
      });
      return all;
    }
    
    for (const c1 of categories) {
      if (c1.id === selectedId) {
        // 返回一级分类下所有三级分类
        const all: Category3[] = [];
        c1.children.forEach(c2 => all.push(...c2.children));
        return all;
      }
      for (const c2 of c1.children) {
        if (c2.id === selectedId) {
          return c2.children;
        }
      }
    }
    return [];
  };

  // 过滤后的列表
  const filteredList = useMemo(() => {
    const list = getCurrentList();
    if (!rightSearchTerm) return list;
    return list.filter(item =>
      item.name.includes(rightSearchTerm) || item.code.includes(rightSearchTerm)
    );
  }, [selectedId, rightSearchTerm, categories]);

  // 统计每个二级分类下的三级分类数量
  const getChildCount = (c2: Category2) => c2.children.length;

  // 统计每个一级分类下的三级分类总数
  const getTotalChildCount = (c1: Category1) => {
    return c1.children.reduce((sum, c2) => sum + c2.children.length, 0);
  };

  // 统计全部商机分类总数
  const getAllCount = () => {
    return categories.reduce((sum, c1) => sum + getTotalChildCount(c1), 0);
  };

  // 切换展开状态
  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedIds(newSet);
  };

  // 打开新增弹窗
  const openDialog = (type: "level1" | "level2" | "level3", parentId?: string, parentLevel2Id?: string) => {
    setIsAddingLevel1(type === "level1");
    setIsAddingLevel2(type === "level2");
    setEditingItem(null);
    setFormData({
      name: "",
      code: "",
      description: "",
      parentLevel1: parentId || "",
      parentLevel2: parentLevel2Id || "",
      editingLevel1Id: "",
      editingLevel2Id: "",
    });
    setIsDialogOpen(true);
  };

  // 打开编辑弹窗
  const openEditDialog = (item: Category3) => {
    setEditingItem(item);
    setIsAddingLevel1(false);
    setIsAddingLevel2(false);
    
    // 查找父级分类
    let parentLevel1 = "";
    let parentLevel2 = "";
    for (const c1 of categories) {
      for (const c2 of c1.children) {
        if (c2.children.some(c => c.id === item.id)) {
          parentLevel1 = c1.id;
          parentLevel2 = c2.id;
        }
      }
    }
    
    setFormData({
      name: item.name,
      code: item.code,
      description: item.description,
      parentLevel1,
      parentLevel2,
      editingLevel1Id: "",
      editingLevel2Id: "",
    });
    setIsDialogOpen(true);
  };

  // 打开编辑一级分类弹窗
  const openEditLevel1Dialog = (item: Category1) => {
    setIsAddingLevel1(false);
    setIsAddingLevel2(false);
    setEditingItem(null);
    setFormData({
      name: item.name,
      code: item.code,
      description: "",
      parentLevel1: "",
      parentLevel2: "",
      editingLevel1Id: item.id,
      editingLevel2Id: "",
    });
    setIsDialogOpen(true);
  };

  // 打开编辑二级分类弹窗
  const openEditLevel2Dialog = (item: Category2, parentId: string) => {
    setIsAddingLevel1(false);
    setIsAddingLevel2(false);
    setEditingItem(null);
    setFormData({
      name: item.name,
      code: item.code,
      description: "",
      parentLevel1: parentId,
      parentLevel2: "",
      editingLevel1Id: "",
      editingLevel2Id: item.id,
    });
    setIsDialogOpen(true);
  };

  // 关闭弹窗
  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setIsAddingLevel1(false);
    setIsAddingLevel2(false);
    setFormData({
      name: "",
      code: "",
      description: "",
      parentLevel1: "",
      parentLevel2: "",
      editingLevel1Id: "",
      editingLevel2Id: "",
    });
  };

  // 保存
  const handleSave = () => {
    if (!formData.name || !formData.code) return;

    const now = new Date();
    const createTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (formData.editingLevel1Id) {
      // 编辑一级分类
      setCategories(prev => prev.map(c1 =>
        c1.id === formData.editingLevel1Id
          ? { ...c1, name: formData.name, code: formData.code }
          : c1
      ));
    } else if (formData.editingLevel2Id) {
      // 编辑二级分类
      setCategories(prev => prev.map(c1 => ({
        ...c1,
        children: c1.children.map(c2 =>
          c2.id === formData.editingLevel2Id
            ? { ...c2, name: formData.name, code: formData.code }
            : c2
        )
      })));
    } else if (editingItem) {
      // 编辑三级分类
      setCategories(prev => prev.map(c1 => ({
        ...c1,
        children: c1.children.map(c2 => ({
          ...c2,
          children: c2.children.map(c => 
            c.id === editingItem.id 
              ? { ...c, name: formData.name, code: formData.code, description: formData.description } 
              : c
          )
        }))
      })));
    } else if (isAddingLevel1) {
      // 新增一级分类
      setCategories(prev => [...prev, {
        id: formData.code,
        name: formData.name,
        code: formData.code,
        children: []
      }]);
    } else if (isAddingLevel2 && formData.parentLevel1) {
      // 新增二级分类
      setCategories(prev => prev.map(c1 => 
        c1.id === formData.parentLevel1
          ? { ...c1, children: [...c1.children, { id: formData.code, name: formData.name, code: formData.code, children: [] }] }
          : c1
      ));
    } else {
      // 新增三级分类
      setCategories(prev => prev.map(c1 => 
        c1.id === formData.parentLevel1
          ? {
              ...c1,
              children: c1.children.map(c2 =>
                c2.id === formData.parentLevel2
                  ? { ...c2, children: [...c2.children, { id: Date.now().toString(), name: formData.name, code: formData.code, description: formData.description, createTime }] }
                  : c2
              )
            }
          : c1
      ));
    }
    closeDialog();
  };

  // 删除
  const handleDelete = (id: string, level: number) => {
    if (level === 1) {
      setCategories(prev => prev.filter(c => c.id !== id));
      if (selectedId === id) setSelectedId(null);
    } else if (level === 2) {
      setCategories(prev => prev.map(c1 => ({
        ...c1,
        children: c1.children.filter(c2 => c2.id !== id)
      })));
      if (selectedId === id) setSelectedId(null);
    } else {
      setCategories(prev => prev.map(c1 => ({
        ...c1,
        children: c1.children.map(c2 => ({
          ...c2,
          children: c2.children.filter(c => c.id !== id)
        }))
      })));
    }
  };

  // 高亮搜索文本
  const highlightText = (text: string, keyword: string) => {
    if (!keyword) return text;
    const parts = text.split(new RegExp(`(${keyword})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === keyword.toLowerCase() ? (
        <span key={i} className="bg-yellow-300">{part}</span>
      ) : part
    );
  };

  // 过滤树
  const filterTree = (items: Category1[], keyword: string): Category1[] => {
    if (!keyword) return items;
    return items.map(item => {
      const matchesName = item.name.toLowerCase().includes(keyword.toLowerCase());
      const filteredChildren = item.children.map(c2 => {
        const matchesC2Name = c2.name.toLowerCase().includes(keyword.toLowerCase());
        const filteredC3 = c2.children.filter(c3 => 
          c3.name.toLowerCase().includes(keyword.toLowerCase()) || 
          c3.code.toLowerCase().includes(keyword.toLowerCase())
        );
        if (matchesC2Name || filteredC3.length > 0) {
          return { ...c2, children: filteredC3.length > 0 ? filteredC3 : c2.children };
        }
        return null;
      }).filter(Boolean) as Category2[];
      
      if (matchesName || filteredChildren.length > 0) {
        return { ...item, children: filteredChildren.length > 0 ? filteredChildren : item.children };
      }
      return null;
    }).filter(Boolean) as Category1[];
  };

  const filteredTree = filterTree(categories, searchTerm);

  // 弹窗标题
  const getDialogTitle = () => {
    if (formData.editingLevel1Id) return "编辑一级分类";
    if (formData.editingLevel2Id) return "编辑二级分类";
    if (editingItem) return "编辑三级分类";
    if (isAddingLevel1) return "新增一级分类";
    if (isAddingLevel2) return "新增二级分类";
    return "新增三级分类";
  };

  // 判断是否可以在当前选中项下新增
  const canAddChild = () => {
    if (!selectedId) return false; // 全部商机分类下不能直接新增
    for (const c1 of categories) {
      if (c1.id === selectedId) return "level2"; // 一级分类下可新增二级
      for (const c2 of c1.children) {
        if (c2.id === selectedId) return "level3"; // 二级分类下可新增三级
      }
    }
    return false;
  };

  return (
    <div className="p-6 h-[calc(100vh-120px)]">
      <div className="flex gap-4 h-full">
        {/* 左侧树形区域 */}
        <Card className="w-[280px] flex-shrink-0 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h1 className="text-lg font-bold text-gray-800 mb-3">商机分类管理</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索分类名称或编码"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-20"
              />
              <Button 
                size="sm" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 bg-[#0085D0] hover:bg-[#0070B8]"
                onClick={() => openDialog("level1")}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-2">
            {/* 全部商机分类 */}
            <div
              className={cn(
                "flex items-center py-2 px-2 cursor-pointer rounded-md transition-colors mb-1",
                selectedId === null ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
              )}
              onClick={() => setSelectedId(null)}
            >
              <FolderOpen className="w-4 h-4 mr-2 text-amber-500" />
              <span className="flex-1 truncate font-medium">全部商机分类</span>
              <Badge variant="secondary" className="text-xs">{getAllCount()}</Badge>
            </div>

            {/* 一级分类列表 */}
            {filteredTree.map(c1 => {
              const isExpanded = expandedIds.has(c1.id);
              const isSelected = selectedId === c1.id;
              const total = getTotalChildCount(c1);
              
              return (
                <div key={c1.id} className="mb-1">
                  <div
                    className={cn(
                      "flex items-center py-2 px-2 cursor-pointer rounded-md transition-colors group",
                      isSelected ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
                    )}
                    onClick={() => setSelectedId(c1.id)}
                  >
                    <button 
                      className="mr-1 p-0.5 hover:bg-gray-200 rounded"
                      onClick={(e) => { e.stopPropagation(); toggleExpand(c1.id); }}
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    {isExpanded ? (
                      <FolderOpen className="w-4 h-4 mr-2 text-amber-500" />
                    ) : (
                      <Folder className="w-4 h-4 mr-2 text-amber-500" />
                    )}
                    <span className="flex-1 truncate">{highlightText(c1.name, searchTerm)}</span>
                    <Badge variant="secondary" className="text-xs">{total}</Badge>
                    
                    {/* 悬浮操作按钮 */}
                    <div className="hidden group-hover:flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => { e.stopPropagation(); openDialog("level2", c1.id); }}
                      >
                        +
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1 text-blue-600"
                        onClick={(e) => { e.stopPropagation(); openEditLevel1Dialog(c1); }}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1 text-red-600"
                        onClick={(e) => { e.stopPropagation(); handleDelete(c1.id, 1); }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* 二级分类 */}
                  {isExpanded && (
                    <div className="ml-4 border-l border-gray-200 pl-1">
                      {c1.children.map(c2 => {
                        const isExpanded2 = expandedIds.has(c2.id);
                        const isSelected2 = selectedId === c2.id;
                        const count = getChildCount(c2);
                        
                        return (
                          <div key={c2.id}>
                            <div
                              className={cn(
                                "flex items-center py-1.5 px-2 cursor-pointer rounded transition-colors group",
                                isSelected2 ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
                              )}
                              onClick={() => setSelectedId(c2.id)}
                            >
                              <span className="w-4 mr-1" />
                              <FileText className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="flex-1 truncate text-sm">{highlightText(c2.name, searchTerm)}</span>
                              <Badge variant="outline" className="text-xs">{count}</Badge>
                              
                              {/* 悬浮操作按钮 */}
                              <div className="hidden group-hover:flex items-center gap-1 ml-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 px-1 text-xs"
                                  onClick={(e) => { e.stopPropagation(); openDialog("level3", c1.id, c2.id); }}
                                >
                                  +
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 px-1 text-blue-600"
                                  onClick={(e) => { e.stopPropagation(); openEditLevel2Dialog(c2, c1.id); }}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 px-1 text-red-600"
                                  onClick={(e) => { e.stopPropagation(); handleDelete(c2.id, 2); }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* 右侧列表区域 */}
        <Card className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">当前分类:</span>
              <span className="font-semibold text-gray-800">{getSelectedPath()}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="搜索分类名称或编码"
                  value={rightSearchTerm}
                  onChange={(e) => setRightSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {canAddChild() === "level2" && (
                <Button 
                  className="bg-[#0085D0] hover:bg-[#0070B8]"
                  onClick={() => openDialog("level2", selectedId || undefined)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  新增分类
                </Button>
              )}
              {canAddChild() === "level3" && (
                <Button 
                  className="bg-[#0085D0] hover:bg-[#0070B8]"
                  onClick={() => {
                    const c1 = categories.find(c => c.children.some(c2 => c2.id === selectedId));
                    if (c1) openDialog("level3", c1.id, selectedId || undefined);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  新增分类
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">分类名称</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">所属分类</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">分类编码</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">分类说明</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">创建时间</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{item.name}</td>
                    <td className="py-3 px-4 text-gray-500">{getCategoryPath(item)}</td>
                    <td className="py-3 px-4 text-gray-500">{item.code}</td>
                    <td className="py-3 px-4 text-gray-500">{item.description || "-"}</td>
                    <td className="py-3 px-4 text-gray-500">{item.createTime}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700" onClick={() => openEditDialog(item)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(item.id, 3)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredList.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Folder className="w-12 h-12 mb-2" />
                <p>暂无分类数据</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 新增/编辑弹窗 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* 一级分类 */}
            {(isAddingLevel1 || formData.editingLevel1Id) && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">分类名称</Label>
                  <Input 
                    className="col-span-3" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="请输入分类名称"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">分类编码</Label>
                  <Input 
                    className="col-span-3" 
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="请输入分类编码"
                  />
                </div>
              </>
            )}

            {/* 二级分类 */}
            {(isAddingLevel2 || formData.editingLevel2Id) && !isAddingLevel1 && !formData.editingLevel1Id && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">父级分类</Label>
                  <div className="col-span-3">
                    <Select value={formData.parentLevel1} onValueChange={(v) => setFormData({ ...formData, parentLevel1: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择一级分类" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">分类名称</Label>
                  <Input 
                    className="col-span-3" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="请输入分类名称"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">分类编码</Label>
                  <Input 
                    className="col-span-3" 
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="请输入分类编码"
                  />
                </div>
              </>
            )}

            {/* 三级分类 */}
            {!isAddingLevel1 && !isAddingLevel2 && !formData.editingLevel1Id && !formData.editingLevel2Id && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">父级分类</Label>
                  <div className="col-span-3 flex gap-2">
                    <Select value={formData.parentLevel1} onValueChange={(v) => setFormData({ ...formData, parentLevel1: v, parentLevel2: "" })}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="选择一级分类" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={formData.parentLevel2} onValueChange={(v) => setFormData({ ...formData, parentLevel2: v })} disabled={!formData.parentLevel1}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="选择二级分类" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.find(c => c.id === formData.parentLevel1)?.children.map(c2 => (
                          <SelectItem key={c2.id} value={c2.id}>{c2.name}</SelectItem>
                        )) || []}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">分类名称</Label>
                  <Input 
                    className="col-span-3" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="请输入分类名称"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">分类编码</Label>
                  <Input 
                    className="col-span-3" 
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="请输入分类编码"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">分类说明</Label>
                  <Input 
                    className="col-span-3" 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="请输入分类说明"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>取消</Button>
            <Button className="bg-[#0085D0] hover:bg-[#0070B8]" onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
