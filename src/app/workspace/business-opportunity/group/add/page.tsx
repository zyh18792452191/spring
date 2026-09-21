'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import TagAssociationDialog from '@/components/TagAssociationDialog';

// 商机分类数据
const categoryOptions = {
  level1: [
    { value: 'C001', label: '风险预警类' },
    { value: 'C004', label: '价值提升类' },
    { value: 'C005', label: '生命周期类' },
  ],
  level2: {
    'C001': [{ value: 'C001-001', label: '流量预警' }],
    'C004': [{ value: 'C004-001', label: '流量经营' }],
    'C005': [{ value: 'C005-002', label: '沉默流失预警' }],
  },
  level3: {
    'C001-001': [{ value: 'C001-001-001', label: '流量达量预警' }],
    'C004-001': [{ value: 'C004-001-001', label: '特定内容高频访问' }, { value: 'C004-001-002', label: '地板价套餐查询高流量套餐' }],
    'C005-002': [{ value: 'C005-002-001', label: '零流量使用预警' }],
  },
};

const sourceOptions = [
  { value: 'AI预测', label: 'AI预测' },
  { value: '人工创建', label: '人工创建' },
  { value: '营销活动平台', label: '营销活动平台' },
  { value: '外呼系统', label: '外呼系统' },
  { value: '线上渠道', label: '线上渠道' },
  { value: '线下营业厅', label: '线下营业厅' },
];

export default function AddGroupOpportunityPage() {
  const router = useRouter();

  const [categoryL1, setCategoryL1] = useState("");
  const [categoryL2, setCategoryL2] = useState("");
  const [categoryL3, setCategoryL3] = useState("");
  const [source, setSource] = useState("");
  const [rating, setRating] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupScale, setGroupScale] = useState("");
  const [strategyName, setStrategyName] = useState("");
  const [strategyContent, setStrategyContent] = useState("");
  const [strategyDeadline, setStrategyDeadline] = useState("");
  const [causeAnalysis, setCauseAnalysis] = useState("");
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const level2Opts = categoryL1 ? categoryOptions.level2[categoryL1 as keyof typeof categoryOptions.level2] || [] : [];
  const level3Opts = categoryL2 ? categoryOptions.level3[categoryL2 as keyof typeof categoryOptions.level3] || [] : [];

  const handleLevel1Change = (value: string) => { setCategoryL1(value); setCategoryL2(""); setCategoryL3(""); };
  const handleLevel2Change = (value: string) => { setCategoryL2(value); setCategoryL3(""); };

  const handleSave = () => {
    router.push('/workspace/business-opportunity/group');
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/workspace/business-opportunity/group')}>
          <ArrowLeft className="w-4 h-4 mr-1" />返回
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">新增客群商机</h1>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* 基本信息 */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">基本信息</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>商机分类（一级）<span className="text-red-500">*</span></Label>
              <Select value={categoryL1} onValueChange={handleLevel1Change}>
                <SelectTrigger><SelectValue placeholder="请选择一级分类" /></SelectTrigger>
                <SelectContent>{categoryOptions.level1.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>商机分类（二级）<span className="text-red-500">*</span></Label>
              <Select value={categoryL2} onValueChange={handleLevel2Change} disabled={!categoryL1}>
                <SelectTrigger><SelectValue placeholder="请选择二级分类" /></SelectTrigger>
                <SelectContent>{level2Opts.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>商机分类（三级）<span className="text-red-500">*</span></Label>
              <Select value={categoryL3} onValueChange={setCategoryL3} disabled={!categoryL2}>
                <SelectTrigger><SelectValue placeholder="请选择三级分类" /></SelectTrigger>
                <SelectContent>{level3Opts.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>商机源<span className="text-red-500">*</span></Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger><SelectValue placeholder="请选择商机源" /></SelectTrigger>
                <SelectContent>{sourceOptions.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>评级<span className="text-red-500">*</span></Label>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger><SelectValue placeholder="请选择评级" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="高">高</SelectItem>
                  <SelectItem value="中">中</SelectItem>
                  <SelectItem value="低">低</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* 目标客群 */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            目标客群
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>客群名称<span className="text-red-500">*</span></Label>
              <Input placeholder="请输入客群名称" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>客群规模（人）<span className="text-red-500">*</span></Label>
              <Input type="number" placeholder="请输入客群规模" value={groupScale} onChange={(e) => setGroupScale(e.target.value)} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>客群标签</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="点击选择标签"
                  value={selectedTags.join('、')}
                  readOnly
                  className="flex-1 cursor-pointer"
                  onClick={() => setTagDialogOpen(true)}
                />
                <Button variant="outline" onClick={() => setTagDialogOpen(true)}>选择标签</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* 推荐策略 */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">推荐策略</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>策略名称</Label>
              <Input placeholder="请输入策略名称" value={strategyName} onChange={(e) => setStrategyName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>处理时效</Label>
              <Select value={strategyDeadline} onValueChange={setStrategyDeadline}>
                <SelectTrigger><SelectValue placeholder="请选择处理时效" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3天</SelectItem>
                  <SelectItem value="5">5天</SelectItem>
                  <SelectItem value="7">7天</SelectItem>
                  <SelectItem value="14">14天</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>策略内容</Label>
              <Textarea placeholder="请输入策略内容" value={strategyContent} onChange={(e) => setStrategyContent(e.target.value)} rows={4} />
            </div>
          </div>
        </Card>

        {/* 原因分析 */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">商机录入原因</h2>
          <Textarea placeholder="请输入商机录入原因" value={causeAnalysis} onChange={(e) => setCauseAnalysis(e.target.value)} rows={3} />
        </Card>

        {/* 操作按钮 */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={() => router.push('/workspace/business-opportunity/group')}>取消</Button>
          <Button className="bg-[#0085D0] hover:bg-[#0070B8]" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />保存
          </Button>
        </div>
      </div>

      <TagAssociationDialog
        open={tagDialogOpen}
        onOpenChange={setTagDialogOpen}
        segmentId={null}
        onSave={(tags: string[]) => { setSelectedTags(tags); }}
      />
    </div>
  );
}
