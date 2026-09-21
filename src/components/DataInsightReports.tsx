'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, ChevronRight, ExternalLink, Calendar } from 'lucide-react'
import { Matcher } from '@/lib/report-association/utils'

interface Report {
  id: number
  name: string
  status: string
  reportPeriod?: string
  reportType?: string
  createdAt?: string
  matchType?: string
  matchScore?: number
}

interface DataInsightReportsProps {
  pageId: string
  maxDisplay?: number
  showViewAll?: boolean
}

export default function DataInsightReports({
  pageId,
  maxDisplay = 3,
  showViewAll = true,
}: DataInsightReportsProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReports()
  }, [pageId])

  const loadReports = async () => {
    setLoading(true)
    setError(null)

    try {
      const reports = await Matcher.getMatchedReportsForPage(pageId)
      setReports(reports)
    } catch (err) {
      console.error('加载报告失败:', err)
      setError('加载报告失败')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case '生成成功':
        return 'bg-green-100 text-green-700'
      case '生成中':
        return 'bg-blue-100 text-blue-700'
      case '生成失败':
        return 'bg-red-100 text-red-700'
      case '草稿':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getMatchTypeLabel = (type?: string) => {
    switch (type) {
      case 'precise':
        return '精确'
      case 'scenario':
        return '场景'
      case 'module':
        return '模块'
      case 'tag':
        return '标签'
      default:
        return ''
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4" />
            数据洞察报告
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">加载中...</div>
        </CardContent>
      </Card>
    )
  }

  if (error || reports.length === 0) {
    return null // 如果没有报告或加载失败，不显示入口
  }

  const displayReports = reports.slice(0, maxDisplay)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">数据洞察报告</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {reports.length}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {displayReports.map((report) => (
          <div
            key={report.id}
            className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
            onClick={() => {
              // 跳转到报告详情页
              console.log('查看报告:', report.id)
            }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">{report.name}</span>
                {report.matchType && (
                  <Badge variant="outline" className="text-xs">
                    {getMatchTypeLabel(report.matchType)}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                {report.reportPeriod && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {report.reportPeriod}
                  </span>
                )}
                {report.reportType && <Badge variant="secondary">{report.reportType}</Badge>}
                <Badge className={getStatusBadgeColor(report.status)}>{report.status}</Badge>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </div>
        ))}

        {showViewAll && reports.length > maxDisplay && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-[#1D77FF]"
            onClick={() => {
              console.log('查看全部报告')
            }}
          >
            查看全部 ({reports.length}) <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
