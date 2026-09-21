import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// GET - 查询页面的关联报告
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ pageId: string }> }
) {
  try {
    const params = await context.params
    const { pageId } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const client = getSupabaseClient()

    // 1. 查询与页面匹配的报告关联配置
    const { data: associations, error: assocError } = await client
      .from('report_associations')
      .select('*')
      .or(`page_id.eq.${pageId},target_id.eq.${pageId}`)

    if (assocError) {
      console.error('Error fetching associations:', assocError)
      return NextResponse.json(
        { success: false, error: '查询页面关联报告失败' },
        { status: 500 }
      )
    }

    if (!associations || associations.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          limit,
          offset,
          hasMore: false,
        },
      })
    }

    // 2. 获取匹配的报告ID
    const reportIds = associations
      .map((assoc: any) => assoc.report_id)
      .filter((id: number | undefined) => id !== undefined)

    if (reportIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          limit,
          offset,
          hasMore: false,
        },
      })
    }

    // 3. 获取报告详情
    const { data: reports, error: reportsError } = await client
      .from('reports')
      .select('*')
      .in('id', reportIds)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (reportsError) {
      console.error('Error fetching reports:', reportsError)
      return NextResponse.json(
        { success: false, error: '获取报告详情失败' },
        { status: 500 }
      )
    }

    // 4. 添加匹配类型信息
    const reportsWithMatchType = (reports || []).map((report: any) => {
      const reportAssociations = associations.filter((a: any) => a.report_id === report.id)

      // 找到最匹配的关联配置
      const association = reportAssociations.find((a: any) => a.page_id === pageId)
        || reportAssociations[0]

      return {
        id: report.id,
        name: report.report_name,
        status: report.status,
        reportPeriod: report.report_period,
        reportType: report.report_type,
        createdAt: report.created_at,
        matchType: getMatchTypeLabel(association?.association_type || 'page'),
        matchScore: association?.display_priority || 100,
      }
    })

    // 5. 按优先级排序
    reportsWithMatchType.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))

    // 6. 分页
    const paginatedReports = reportsWithMatchType.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: paginatedReports,
      pagination: {
        total: reportsWithMatchType.length,
        limit,
        offset,
        hasMore: offset + limit < reportsWithMatchType.length,
      },
    })
  } catch (error) {
    console.error('查询页面关联报告失败:', error)
    return NextResponse.json(
      { success: false, error: '查询页面关联报告失败' },
      { status: 500 }
    )
  }
}

// 辅助函数：获取匹配类型标签
function getMatchTypeLabel(type: string): string {
  switch (type) {
    case 'page':
      return 'precise'
    case 'scenario':
      return 'scenario'
    case 'module':
      return 'module'
    case 'tag':
      return 'tag'
    default:
      return 'default'
  }
}
