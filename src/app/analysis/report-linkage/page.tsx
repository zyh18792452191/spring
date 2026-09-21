'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, FileText, Send } from 'lucide-react'

export default function AnalysisPage() {
  const [analysis, setAnalysis] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const outputRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [analysis])

  const context = `# 业务场景分析

## 1. 当前系统架构

### 1.1 导航结构
- 顶部导航：市场数智运营 > 客户运营 > 存量运营
- 各运营场景：中高端客户运营、中高端流失预警维系、离网维系等

### 1.2 页面结构
每个运营场景包含：
- 概览页（Overview）：展示核心指标卡
- 指标树页面（Tree）：深度分析和根因定位
  - 指标树是动态配置的，数量不一
  - 中高端客户运营：约10颗指标树
  - 离网维系：约7颗指标树

### 1.3 现有功能模块
1. **模板管理**（/workspace/insight/report/template）
   - 创建和管理报告模板
   - 支持业务场景选择（个人市场、政企市场、家庭市场、新兴市场）
   - 报告类型（日报、周报、月报、季报、年报、自定义周期）
   - 报告层级（全国、地州、地市、区县、网格）
   - 模板状态（草稿、已发布、已下架）

2. **报告管理**（/workspace/insight/report/management）
   - 创建新报告（立即生成/定时生成）
   - 报告列表
   - 报告配置列表

3. **指标树管理**：动态创建指标树
4. **指标组管理**：指标分组管理
5. **指标卡管理**：指标展示卡片

## 2. 核心问题

### 2.1 报告展示位置
- 概览页：数据洞察报告入口
- 各指标树页面：数据洞察报告入口
- 门户首页：数据洞察报告入口

### 2.2 关联复杂性
1. **一对多关系**：
   - 一个报告可能展示在多个页面
   - 例如：报告A可能展示在概览页+指标树1+指标树3

2. **动态页面**：
   - 指标树页面是配置出来的，数量不固定
   - 需要支持动态关联到新创建的指标树

3. **粒度差异**：
   - 有的报告对应整个场景（如离网维系概览）
   - 有的报告对应特定指标树（如当月全量客户离网客户数指标树）
   - 有的报告对应特定指标（如当月拍照中高端客户离网客户数）

### 2.3 关联时机选择
**方案A：在模板管理中关联**
- 优点：一次配置，所有报告自动关联
- 缺点：灵活性低，报告生成后无法调整

**方案B：在报告管理中关联**
- 优点：每个报告独立配置，灵活性高
- 缺点：重复工作量大，容易遗漏

**方案C：混合方案**
- 模板管理：设置默认关联
- 报告管理：允许调整关联
- 优点：兼顾效率和灵活性

## 3. 需要考虑的因素

1. **业务场景**：个人市场、政企市场、家庭市场、新兴市场
2. **页面类型**：概览页、指标树页面
3. **页面层级**：模块 > 场景 > 页面
4. **指标树标识**：需要唯一标识每个指标树
5. **时间维度**：日报、周报、月报等
6. **数据范围**：全国、地州、地市等
7. **用户权限**：不同用户看到不同的报告
8. **版本管理**：模板版本、报告版本
9. **发布控制**：草稿、已发布、已下架

## 4. 期望的用户体验

1. 管理员创建模板时，能够选择报告展示的位置
2. 生成报告时，自动继承模板的关联配置
3. 支持在报告生成后调整关联关系
4. 用户在浏览页面时，能够看到相关联的报告
5. 支持多对多关联（一个报告可在多个位置展示）`

  const startAnalysis = async () => {
    setIsLoading(true)
    setError('')
    setAnalysis('')

    try {
      const response = await fetch('/api/analyze/report-linkage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ context }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No reader available')
      }

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        const text = decoder.decode(value, { stream: true })
        setAnalysis((prev) => prev + text)
      }
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const formatAnalysis = (text: string) => {
    // 简单的格式化处理
    return text
      .replace(/###\s/g, '\n### ')
      .replace(/##\s/g, '\n## ')
      .replace(/#\s/g, '\n# ')
      .replace(/\n\n+/g, '\n\n')
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">报告与业务模块关联分析</h1>
          <p className="text-gray-600">
            使用DeepSeek大模型进行深度分析，提供解决方案建议
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="mb-6">
          <Button
            onClick={startAnalysis}
            disabled={isLoading}
            className="bg-[#1D77FF] hover:bg-[#1565C0]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                分析中...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                开始分析
              </>
            )}
          </Button>
        </div>

        {/* 分析结果 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              分析结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700 font-medium">分析失败</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            )}

            {isLoading && !analysis && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            )}

            <div
              ref={outputRef}
              className="prose prose-sm max-w-none overflow-auto max-h-[800px] bg-gray-50 rounded-lg p-4"
            >
              {analysis ? (
                <pre className="whitespace-pre-wrap font-sans text-gray-800">
                  {formatAnalysis(analysis)}
                </pre>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  点击"开始分析"按钮，DeepSeek大模型将为您提供深度分析和解决方案
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
