'use client';

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit3, Trash2, RotateCcw } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// ==================== 类型定义 ====================

// 评级项类型
type RatingType = 'accuracy' | 'timeliness' | 'opportunity_value' | 'customer_value';

// 评级规则
interface RatingRule {
  id: string;
  ratingType: RatingType; // 评级项
  ratingField: string; // 评级字段
  fieldValue: string; // 字段值
  score: number; // 赋分 1-5
  creator: string; // 创建人
  createdAt: string; // 创建时间
}

// ==================== 常量配置 ====================

// 评级项选项
const ratingTypeOptions: { value: RatingType; label: string; field: string }[] = [
  { value: 'accuracy', label: '商机准确性', field: '商机分类' },
  { value: 'opportunity_value', label: '商机价值', field: '推荐产品' },
  { value: 'customer_value', label: '客户价值', field: '客户星级' },
];

// 商机分类选项（字段值）- 来源于商机分类管理的三级分类
const categoryOptions = [
  '流量达量预警',
  '特定内容高频访问',
  '地板价套餐查询高流量套餐',
  '零流量使用预警',
];

// 商机来源选项 - 来源于商机源管理
const sourceOptions = [
  'CRM系统',
  '营销活动平台',
  '外呼系统',
  '线上渠道',
  '线下营业厅',
  '代理商系统',
  '微信小程序',
  '企业微信',
];

// 推荐产品选项
const productOptions = [
  '5G畅享套餐199元',
  '流量加油包10GB',
  '宽带升级优惠',
  '家庭融合套餐',
  '爱家光网',
  '万能副卡',
  '家庭宽带',
  '云宽带',
  '爱家宽带电视随心用',
  '第二条爱家融合版',
  '移动看家福袋',
];

// 客户星级选项
const starLevelOptions = [
  '卓越钻石卡',
  '钻石卡',
  '白金卡',
  '金卡',
  '银卡',
  '普卡',
  '三星',
  '二星',
  '一星',
  '准星',
  '未评级',
];

// 客户价值一级分类选项
const customerLevel1Options = ['全球通', '中高端', '潜力'];

// 全球通星级多选选项（仅全球通有二级）
const globalStarOptions = [
  '卓越钻石卡',
  '钻石卡',
  '白金卡',
  '金卡',
  '银卡',
  '普卡',
  '三星',
  '二星',
  '一星',
];

// 根据评级项获取对应的字段值选项
const getFieldValueOptions = (ratingType: RatingType): string[] => {
  switch (ratingType) {
    case 'accuracy':
      return categoryOptions;
    case 'timeliness':
      return sourceOptions;
    case 'opportunity_value':
      return productOptions;
    case 'customer_value':
      return starLevelOptions;
    default:
      return [];
  }
};

// 根据评级项获取评级字段名称
const getRatingField = (ratingType: RatingType): string => {
  const option = ratingTypeOptions.find(o => o.value === ratingType);
  return option?.field || '';
};

// 格式化字段值用于列表展示：客户价值-全球通显示为"全球通（卓越钻石卡/钻石卡）"，其他原样
const formatDisplayFieldValue = (rule: RatingRule): string => {
  if (rule.ratingType === 'customer_value' && rule.fieldValue.includes('-')) {
    const [level1, level2Str] = rule.fieldValue.split('-');
    const level2List = level2Str.split(',').filter(Boolean);
    return level2List.length ? `${level1}（${level2List.join('/')}）` : level1;
  }
  return rule.fieldValue;
};

// ==================== 模拟数据 ====================

const mockRatingRules: RatingRule[] = [
  { id: '1', ratingType: 'opportunity_value', ratingField: '推荐产品', fieldValue: '移动看家福袋', score: 2, creator: 'admin01', createdAt: '2025-12-31 19:03:48' },
  { id: '2', ratingType: 'opportunity_value', ratingField: '推荐产品', fieldValue: '爱家光网', score: 2, creator: 'admin01', createdAt: '2025-12-31 19:03:30' },
  { id: '3', ratingType: 'opportunity_value', ratingField: '推荐产品', fieldValue: '第二条爱家融合版', score: 3, creator: 'admin01', createdAt: '2025-12-31 19:02:56' },
  { id: '4', ratingType: 'opportunity_value', ratingField: '推荐产品', fieldValue: '爱家宽带电视随心用', score: 4, creator: 'admin01', createdAt: '2025-12-31 19:01:27' },
  { id: '5', ratingType: 'opportunity_value', ratingField: '推荐产品', fieldValue: '云宽带', score: 3, creator: 'admin01', createdAt: '2025-12-31 19:01:04' },
  { id: '6', ratingType: 'opportunity_value', ratingField: '推荐产品', fieldValue: '万能副卡', score: 3, creator: 'admin01', createdAt: '2025-12-31 19:00:42' },
  { id: '7', ratingType: 'opportunity_value', ratingField: '推荐产品', fieldValue: '家庭宽带', score: 3, creator: 'admin01', createdAt: '2025-12-30 14:22:03' },
  { id: '8', ratingType: 'timeliness', ratingField: '商机来源', fieldValue: 'CRM系统', score: 5, creator: 'admin01', createdAt: '2025-12-30 14:02:29' },
  { id: '9', ratingType: 'accuracy', ratingField: '商机分类', fieldValue: '流量达量预警', score: 5, creator: 'admin01', createdAt: '2025-12-30 10:00:00' },
  { id: '10', ratingType: 'accuracy', ratingField: '商机分类', fieldValue: '特定内容高频访问', score: 4, creator: 'admin01', createdAt: '2025-12-30 10:05:00' },
  { id: '11', ratingType: 'customer_value', ratingField: '客户星级', fieldValue: '全球通-卓越钻石卡,钻石卡,白金卡', score: 5, creator: 'admin01', createdAt: '2025-12-30 11:00:00' },
  { id: '12', ratingType: 'customer_value', ratingField: '客户星级', fieldValue: '中高端', score: 4, creator: 'admin01', createdAt: '2025-12-30 11:05:00' },
  { id: '13', ratingType: 'customer_value', ratingField: '客户星级', fieldValue: '潜力', score: 3, creator: 'admin01', createdAt: '2025-12-30 11:10:00' },
  { id: '14', ratingType: 'timeliness', ratingField: '商机来源', fieldValue: 'CRM系统', score: 4, creator: 'admin01', createdAt: '2025-12-30 09:00:00' },
  { id: '15', ratingType: 'timeliness', ratingField: '商机来源', fieldValue: 'APP触点', score: 4, creator: 'admin01', createdAt: '2025-12-30 09:05:00' },
];

// ==================== 主组件 ====================

export default function RatingRulesPage() {
  // 筛选状态
  const [filterRatingType, setFilterRatingType] = useState<string>('');
  const [filterFieldValue, setFilterFieldValue] = useState('');
  const [filterCreator, setFilterCreator] = useState('');
  
  // 数据状态
  const [rules, setRules] = useState<RatingRule[]>(mockRatingRules);
  
  // 弹窗状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RatingRule | null>(null);
  
  // 表单状态
  const [formRatingType, setFormRatingType] = useState<RatingType>('accuracy');
  const [formFieldValue, setFormFieldValue] = useState('');
  const [formScore, setFormScore] = useState<number>(3);
  // 客户价值级联选择状态
  const [formCustLevel1, setFormCustLevel1] = useState<string>('');
  const [formCustLevel2, setFormCustLevel2] = useState<string[]>([]);
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 筛选后的数据
  const filteredRules = rules.filter(rule => {
    if (filterRatingType && rule.ratingType !== filterRatingType) return false;
    if (filterFieldValue && !rule.fieldValue.includes(filterFieldValue)) return false;
    if (filterCreator && !rule.creator.includes(filterCreator)) return false;
    return true;
  });

  // 分页后的数据
  const totalPage = Math.ceil(filteredRules.length / pageSize);
  const paginatedRules = filteredRules.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // 重置筛选
  const handleReset = () => {
    setFilterRatingType('');
    setFilterFieldValue('');
    setFilterCreator('');
    setCurrentPage(1);
  };

  // 打开新建弹窗
  const handleAdd = () => {
    setEditingRule(null);
    setFormRatingType('accuracy');
    setFormFieldValue('');
    setFormScore(3);
    setFormCustLevel1('');
    setFormCustLevel2([]);
    setDialogOpen(true);
  };

  // 打开编辑弹窗
  const handleEdit = (rule: RatingRule) => {
    setEditingRule(rule);
    setFormRatingType(rule.ratingType);
    setFormFieldValue(rule.fieldValue);
    setFormScore(rule.score);
    // 客户价值级联回填
    if (rule.ratingType === 'customer_value') {
      if (rule.fieldValue.includes('-')) {
        const [level1, level2Str] = rule.fieldValue.split('-');
        setFormCustLevel1(level1);
        setFormCustLevel2(level2Str ? level2Str.split(',').filter(Boolean) : []);
      } else {
        setFormCustLevel1(rule.fieldValue);
        setFormCustLevel2([]);
      }
    } else {
      setFormCustLevel1('');
      setFormCustLevel2([]);
    }
    setDialogOpen(true);
  };

  // 删除规则
  const handleDelete = (id: string) => {
    if (confirm('确定要删除该评级规则吗？')) {
      setRules(rules.filter(r => r.id !== id));
    }
  };

  // 保存规则
  const handleSave = () => {
    // 组装字段值
    let fieldValue = '';
    if (formRatingType === 'customer_value') {
      if (!formCustLevel1) {
        toast.error('请选择客户价值一级分类');
        return;
      }
      if (formCustLevel1 === '全球通' && formCustLevel2.length === 0) {
        toast.error('请选择全球通星级');
        return;
      }
      fieldValue = formCustLevel1 === '全球通'
        ? `全球通-${formCustLevel2.join(',')}`
        : formCustLevel1;
    } else {
      if (!formFieldValue) {
        alert('请选择字段值');
        return;
      }
      fieldValue = formFieldValue;
    }

    const ratingField = getRatingField(formRatingType);

    if (editingRule) {
      // 编辑
      setRules(rules.map(r =>
        r.id === editingRule.id
          ? { ...r, ratingType: formRatingType, ratingField, fieldValue, score: formScore }
          : r
      ));
    } else {
      // 新增
      const newRule: RatingRule = {
        id: Date.now().toString(),
        ratingType: formRatingType,
        ratingField,
        fieldValue,
        score: formScore,
        creator: 'admin01',
        createdAt: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).replace(/\//g, '-')
      };
      setRules([newRule, ...rules]);
    }

    setDialogOpen(false);
  };

  // 获取评级项显示名称
  const getRatingTypeLabel = (type: RatingType): string => {
    if (type === 'timeliness') return '商机及时性';
    const option = ratingTypeOptions.find(o => o.value === type);
    return option?.label || type;
  };

  // 获取评分颜色
  const getScoreColor = (score: number): string => {
    if (score >= 5) return 'text-red-600 font-bold';
    if (score >= 4) return 'text-orange-600 font-medium';
    if (score >= 3) return 'text-blue-600';
    if (score >= 2) return 'text-gray-600';
    return 'text-gray-400';
  };

  return (
    <div className="p-6">
      {/* 查询区域 */}
      <Card className="p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">评级项:</span>
            <Select value={filterRatingType} onValueChange={setFilterRatingType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="请选择评级项" />
              </SelectTrigger>
              <SelectContent>
                {ratingTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">字段值:</span>
            <Input
              className="w-40"
              placeholder="请输入字段值"
              value={filterFieldValue}
              onChange={e => setFilterFieldValue(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">创建人:</span>
            <Input
              className="w-32"
              placeholder="请输入创建人"
              value={filterCreator}
              onChange={e => setFilterCreator(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <Button onClick={() => setCurrentPage(1)}>
              <Search className="w-4 h-4 mr-1" />
              查询
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-1" />
              重置
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-1" />
              新建
            </Button>
          </div>
        </div>
      </Card>

      {/* 数据表格 */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-16 text-center">序号</TableHead>
              <TableHead>评级项</TableHead>
              <TableHead>评级字段</TableHead>
              <TableHead>字段值</TableHead>
              <TableHead className="w-20 text-center">赋分</TableHead>
              <TableHead>创建人</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="w-28 text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRules.length > 0 ? (
              paginatedRules.map((rule, index) => (
                <TableRow key={rule.id} className="hover:bg-gray-50">
                  <TableCell className="text-center text-gray-500">
                    {(currentPage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell>{getRatingTypeLabel(rule.ratingType)}</TableCell>
                  <TableCell>{rule.ratingField}</TableCell>
                  <TableCell>{formatDisplayFieldValue(rule)}</TableCell>
                  <TableCell className="text-center">
                    <span className={getScoreColor(rule.score)}>{rule.score}</span>
                  </TableCell>
                  <TableCell>{rule.creator}</TableCell>
                  <TableCell className="text-gray-500">{rule.createdAt}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 text-blue-600 hover:text-blue-700"
                        onClick={() => handleEdit(rule)}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(rule.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* 分页 */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-gray-500">
            共 {filteredRules.length} 条
          </div>
          <div className="flex items-center gap-2">
            <Select value={pageSize.toString()} onValueChange={v => { setPageSize(Number(v)); setCurrentPage(1); }}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10条/页</SelectItem>
                <SelectItem value="20">20条/页</SelectItem>
                <SelectItem value="50">50条/页</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                &lt;
              </Button>
              {Array.from({ length: Math.min(5, totalPage) }, (_, i) => {
                let pageNum: number;
                if (totalPage <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPage - 2) {
                  pageNum = totalPage - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="w-8"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === totalPage || totalPage === 0}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                &gt;
              </Button>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-gray-500">
              前往
              <Input
                className="w-14 h-8 text-center"
                type="number"
                min={1}
                max={totalPage}
                value={currentPage}
                onChange={e => {
                  const page = Number(e.target.value);
                  if (page >= 1 && page <= totalPage) {
                    setCurrentPage(page);
                  }
                }}
              />
              页
            </div>
          </div>
        </div>
      </Card>

      {/* 新建/编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRule ? '编辑评级规则' : '新建评级规则'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>评级项 <span className="text-red-500">*</span></Label>
              <Select value={formRatingType} onValueChange={(v: RatingType) => { setFormRatingType(v); setFormFieldValue(''); setFormCustLevel1(''); setFormCustLevel2([]); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ratingTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>评级字段</Label>
              <Input value={getRatingField(formRatingType)} disabled className="bg-gray-50" />
            </div>

            <div className="space-y-2">
              <Label>字段值 <span className="text-red-500">*</span></Label>
              {formRatingType === 'customer_value' ? (
                <div className="space-y-3">
                  <Select
                    value={formCustLevel1}
                    onValueChange={(v) => { setFormCustLevel1(v); setFormCustLevel2([]); }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择客户价值一级分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {customerLevel1Options.map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formCustLevel1 === '全球通' && (
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500">全球通星级（可多选）</Label>
                      <div className="flex flex-wrap gap-2">
                        {globalStarOptions.map(option => {
                          const selected = formCustLevel2.includes(option);
                          return (
                            <Badge
                              key={option}
                              variant={selected ? "default" : "outline"}
                              className="cursor-pointer select-none"
                              onClick={() => {
                                setFormCustLevel2(prev =>
                                  selected
                                    ? prev.filter(item => item !== option)
                                    : [...prev, option]
                                );
                              }}
                            >
                              {option}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Select value={formFieldValue} onValueChange={setFormFieldValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择字段值" />
                  </SelectTrigger>
                  <SelectContent>
                    {getFieldValueOptions(formRatingType).map(option => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>赋分 <span className="text-red-500">*</span></Label>
              <Select value={formScore.toString()} onValueChange={v => setFormScore(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(score => (
                    <SelectItem key={score} value={score.toString()}>
                      {score} 分
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400">分值范围：1-5分，分数越高表示评级越高</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
