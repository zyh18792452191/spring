"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Activity } from "lucide-react";
// import { HealthRadarOverview } from "@/components/evaluation/health-radar-overview";
import { WorkOrderImprovementOverview } from "@/components/evaluation/work-order-improvement-overview";
import { StrategyEvaluationSummary } from "@/components/evaluation/StrategyEvaluationSummary";
import RegionalEvaluation from "@/components/evaluation/RegionalEvaluation";
import XinjiangRegionSelector from "@/components/XinjiangRegionSelector";

export default function EvaluationCenterOverview() {
    const [showHelpDialog, setShowHelpDialog] = useState(false);
    const [selectedCityCode, setSelectedCityCode] = useState<string>('');
    const [selectedCityName, setSelectedCityName] = useState<string>('全疆');
    const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>('');
    const [selectedDistrictName, setSelectedDistrictName] = useState<string>('');
    const [selectedGridCode, setSelectedGridCode] = useState<string>('');
    const [selectedGridName, setSelectedGridName] = useState<string>('');
    const [isProvince, setIsProvince] = useState<boolean>(true);

    return (
        <div className="min-h-screen bg-gray-50/50 relative">
            {/* 面包屑导航 */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <div className="container px-4 py-4">
                    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">能力中心</a>
                        <span className="text-gray-400">/</span>
                        <a href="/portal/capability/evaluation-center" className="hover:text-gray-900 dark:hover:text-white transition-colors">评估中心</a>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-900 dark:text-white">评估概览</span>
                    </nav>
                </div>
            </div>

            {/* 主内容区 */}
            <div className="container px-4 py-6 max-w-[1280px] mx-auto">
                <div className="flex flex-col gap-6">
                    {/* 页面级区域筛选 */}
                    <div className="flex items-center gap-3 px-1">
                        <span className="text-sm text-muted-foreground">区域筛选：</span>
                        <XinjiangRegionSelector
                            value={{ cityCode: selectedCityCode || '', districtCode: selectedDistrictCode || '', gridCode: selectedGridCode || '' }}
                            onChange={(_cityCode: string, cityName: string, _districtCode: string, _districtName: string, _gridCode: string, gridName: string, _isProvince?: boolean) => {
                                setSelectedCityCode(_cityCode);
                                setSelectedCityName(cityName);
                                setSelectedDistrictCode(_districtCode);
                                setSelectedDistrictName(_districtName);
                                setSelectedGridCode(_gridCode);
                                setSelectedGridName(gridName);
                                setIsProvince(!!_isProvince);
                            }}
                            className="w-[200px]"
                        />
                        {selectedCityName && (
                            <span className="text-sm text-primary font-medium">当前：{selectedCityName}</span>
                        )}
                    </div>

                    {/* 工单改善情况 */}
                    {/* <HealthRadarOverview /> */}
                    <WorkOrderImprovementOverview
                        selectedCityCode={selectedCityCode}
                        selectedCityName={selectedCityName}
                    />

                    {/* 调度区域评估 */}
                    <RegionalEvaluation
                        selectedCityCode={selectedCityCode}
                        selectedCityName={selectedCityName}
                        selectedDistrictCode={selectedDistrictCode}
                        selectedDistrictName={selectedDistrictName}
                        selectedGridCode={selectedGridCode}
                        selectedGridName={selectedGridName}
                    />

                    {/* 策略评估摘要 */}
                    <StrategyEvaluationSummary
                        selectedCityCode={selectedCityCode}
                        selectedCityName={selectedCityName}
                    />
                </div>
            </div>

            {/* 帮助按钮 */}
            <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
                <DialogTrigger asChild>
                    <Button
                        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-blue-600 hover:bg-blue-700"
                        size="icon">
                        <HelpCircle className="h-6 w-6" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-600" />评估中心概览页说明</DialogTitle>
                    </DialogHeader>
                    <div>
                        <div>
                            <p>1、运营健康度  展示各个运营专区的 综合运营得分、各地州运营评分分布、量质构效四个维度的评估指标及趋势（量质构效各维度评估的指标在后台进行配置）</p>
                            <p>2、重点工单：指在工单创建阶段被标记为公司领导调度/公司部门调度的工单。</p>
                            <p>3、工单执行结果归因的思考维度：工单是否存在后续流转记录、工单对应的指标变化情况（集团&amp;区域）、关联指标的变动情况（通过指标关联关系查找）、调度客群的变动情况、比对下发客群/策略与执行客群或者策略、如存在活动则关注活动的触达率和转化率</p>
                            <p>4、指标达成率 = （现值-原值）/（目标值-原值）×100%；工单达成率 = 工单各个指标的达成率相加/工单中的指标数</p>
                            <p>4.1、区域执行效果评估口径说明：改善幅度 = 正向指标当前-基期（负向指标基期-当前），正值=改善；改善率 = 改善幅度÷基期值×100%（仅可加总类指标适用）</p>
                            <p>5、运营健康度和达标度颜色显示规则：≥80：绿色；60-79：黄色；&lt;60是红色。</p>
                            <p>6、策略评估摘要：展示当月策略执行的核心KPI（派发量/完成率/触达率/成功率/AI采纳率）、月度趋势、效果分布、区域排名及需关注策略。详细数据请进入策略评估页面查看。</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
