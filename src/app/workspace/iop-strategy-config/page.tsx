'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTabs } from '@/contexts/TabsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ConditionItem {
  id: number;
  dimension: string;
  operator: string;
  value: string;
}

export default function IOPStrategyConfigPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addTab } = useTabs();

  const ticketId = searchParams.get('id') || '';
  const activityId = searchParams.get('activityId') || 'ACT20260701001';
  const groupName = searchParams.get('groupName') || '存量携转预警客群';

  // 条件设置
  const [conditions, setConditions] = useState<ConditionItem[]>([
    { id: 1, dimension: '推荐档位', operator: '>', value: '' }
  ]);
  const [nextId, setNextId] = useState(2);

  // 预配置选项
  const [preConfigBasic, setPreConfigBasic] = useState(false);
  const [preConfigChannel, setPreConfigChannel] = useState(false);

  // 客群列表
  const [groupList, setGroupList] = useState<Array<{
    id: number;
    name: string;
    targetCount: number;
    editStatus: string;
  }>>([]);

  // 添加条件
  const handleAddCondition = () => {
    setConditions([...conditions, { id: nextId, dimension: '推荐档位', operator: '>', value: '' }]);
    setNextId(nextId + 1);
  };

  // 删除条件
  const handleRemoveCondition = (id: number) => {
    if (conditions.length <= 1) {
      toast.warning('至少保留一个条件');
      return;
    }
    setConditions(conditions.filter(c => c.id !== id));
  };

  // 更新条件
  const handleUpdateCondition = (id: number, field: keyof ConditionItem, value: string) => {
    setConditions(conditions.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  // 清空条件
  const handleClearConditions = () => {
    setConditions([{ id: 1, dimension: '推荐档位', operator: '>', value: '' }]);
    setNextId(2);
    setGroupList([]);
  };

  // 拆分客群
  const handleSplitGroup = () => {
    const validConditions = conditions.filter(c => c.value.trim() !== '');
    if (validConditions.length === 0) {
      toast.warning('请至少填写一个条件的数值');
      return;
    }
    // 模拟拆分结果
    setGroupList([
      { id: 1, name: `${groupName}_高价值`, targetCount: 1286, editStatus: '未编辑' },
      { id: 2, name: `${groupName}_中价值`, targetCount: 1532, editStatus: '未编辑' },
      { id: 3, name: `${groupName}_低价值`, targetCount: 1182, editStatus: '未编辑' },
    ]);
    toast.success('客群拆分成功');
  };

  // 提交审批
  const handleSubmitApproval = () => {
    if (groupList.length === 0) {
      toast.warning('请先完成客群拆分');
      return;
    }
    const hasUnedited = groupList.some(g => g.editStatus === '未编辑');
    if (hasUnedited) {
      toast.warning('请先完成所有客群的配置编辑');
      return;
    }
    toast.success('策略配置已提交审批');
    // 提交后返回上一页
    router.back();
  };

  // 返回上一页
  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="p-6 space-y-6">
      {/* 顶部导航 */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleGoBack}
          className="text-primary hover:underline flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          返回上一页
        </button>
        <h1 className="text-lg font-semibold">策略配置</h1>
        {ticketId && (
          <span className="text-sm text-muted-foreground">
            工单编号：{ticketId}
          </span>
        )}
      </div>

      {/* 第一模块：配置客群 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">配置客群</h2>

        {/* 客群基础信息 */}
        <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
          <span>客群名称：{groupName}</span>
          <span>客群规模：4</span>
          <span>推荐档位范围：(2,321 - 2,321)</span>
        </div>

        {/* 条件设置区域 */}
        <div className="flex gap-6 mb-6">
          {/* 左侧条件配置 */}
          <div className="flex-1 space-y-3">
            {conditions.map((condition, index) => (
              <div key={condition.id} className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground w-6">{index + 1}</span>
                <span className="text-sm whitespace-nowrap">设置条件：</span>
                <Select
                  value={condition.dimension}
                  onValueChange={v => handleUpdateCondition(condition.id, 'dimension', v)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="推荐档位">推荐档位</SelectItem>
                    <SelectItem value="ARPU值">ARPU值</SelectItem>
                    <SelectItem value="在网时长">在网时长</SelectItem>
                    <SelectItem value="流量使用">流量使用</SelectItem>
                    <SelectItem value="消费金额">消费金额</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={condition.operator}
                  onValueChange={v => handleUpdateCondition(condition.id, 'operator', v)}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=">">&gt;</SelectItem>
                    <SelectItem value=">=">&ge;</SelectItem>
                    <SelectItem value="<">&lt;</SelectItem>
                    <SelectItem value="<=">&le;</SelectItem>
                    <SelectItem value="=">=</SelectItem>
                    <SelectItem value="!=">&ne;</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={condition.value}
                  onChange={e => handleUpdateCondition(condition.id, 'value', e.target.value)}
                  placeholder="输入数值"
                  className="w-[120px]"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddCondition}
                  className="text-primary"
                >
                  添加
                </Button>
                {conditions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCondition(condition.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* 右侧可视化区域 */}
          <div className="flex-1 border border-dashed border-muted rounded-lg flex items-center justify-center min-h-[120px]">
            <Plus className="h-8 w-8 text-muted-foreground/40" />
          </div>
        </div>

        {/* 预配置选项 */}
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id="preBasic"
              checked={preConfigBasic}
              onCheckedChange={(checked) => setPreConfigBasic(checked === true)}
            />
            <label htmlFor="preBasic" className="text-sm cursor-pointer">
              是否预先配置基本信息
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="preChannel"
              checked={preConfigChannel}
              onCheckedChange={(checked) => setPreConfigChannel(checked === true)}
            />
            <label htmlFor="preChannel" className="text-sm cursor-pointer">
              是否预先配置渠道信息
            </label>
          </div>
        </div>

        {/* 操作按钮与提示 */}
        <div className="flex items-center gap-4 mb-2">
          <Button variant="outline" onClick={handleClearConditions}>
            清空条件
          </Button>
          <Button onClick={handleSplitGroup}>
            拆分客群
          </Button>
        </div>
        <div className="flex items-center gap-1 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>注意：(修改上述条件后，需点击拆分客群按钮，添加和移除操作才能生效)</span>
        </div>
      </Card>

      {/* 第二模块：配置相关信息 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">配置相关信息</h2>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">序号</TableHead>
              <TableHead>客群名称</TableHead>
              <TableHead className="w-[160px]">客群目标客户数</TableHead>
              <TableHead className="w-[120px]">编辑状态</TableHead>
              <TableHead className="w-[120px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              groupList.map((group, index) => (
                <TableRow key={group.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{group.name}</TableCell>
                  <TableCell>{group.targetCount.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={group.editStatus === '已编辑' ? 'text-primary' : 'text-muted-foreground'}>
                      {group.editStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary"
                      onClick={() => {
                        setGroupList(groupList.map(g =>
                          g.id === group.id ? { ...g, editStatus: '已编辑' } : g
                        ));
                        toast.success(`${group.name} 配置编辑完成`);
                      }}
                    >
                      编辑
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* 分页 */}
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <span>共{groupList.length}条</span>
          <div className="flex items-center gap-2">
            <span>10条/页</span>
            <span>第 1 页</span>
          </div>
        </div>
      </Card>

      {/* 底部操作区域 */}
      <div className="flex items-center justify-end gap-4 pt-2">
        <Button variant="outline" onClick={handleGoBack}>
          返回
        </Button>
        <Button onClick={handleSubmitApproval}>
          提交审批
        </Button>
      </div>
    </div>
  );
}
