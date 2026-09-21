import { NextRequest, NextResponse } from 'next/server'

// 模拟数据库存储（实际项目应该使用真实数据库）
const templateAssociations = new Map<number, any[]>()
const reportAssociations = new Map<number, any[]>()

// 初始化一些模拟数据
templateAssociations.set(1, [
  {
    id: 1,
    templateId: 1,
    associationType: 'page',
    pageId: 'insight.churn.overview.main',
    isDefault: true,
    displayPriority: 1,
  }
])

// GET - 获取模板的关联配置
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const templateId = parseInt(id)
    
    if (isNaN(templateId)) {
      return NextResponse.json(
        { error: '无效的模板ID' },
        { status: 400 }
      )
    }

    const associations = templateAssociations.get(templateId) || []
    
    return NextResponse.json({
      success: true,
      data: associations,
    })
  } catch (error) {
    console.error('获取模板关联配置失败:', error)
    return NextResponse.json(
      { error: '获取模板关联配置失败' },
      { status: 500 }
    )
  }
}

// POST - 保存模板的关联配置
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const templateId = parseInt(id)
    const body = await request.json()
    const { associations } = body

    if (isNaN(templateId)) {
      return NextResponse.json(
        { error: '无效的模板ID' },
        { status: 400 }
      )
    }

    if (!Array.isArray(associations)) {
      return NextResponse.json(
        { error: '关联配置必须是数组' },
        { status: 400 }
      )
    }

    // 保存关联配置（添加templateId和创建时间）
    const associationsWithMeta = associations.map((assoc: any, index: number) => ({
      ...assoc,
      id: assoc.id || Date.now() + index,
      templateId,
      isDefault: true,
      createdAt: new Date().toISOString(),
    }))

    templateAssociations.set(templateId, associationsWithMeta)

    return NextResponse.json({
      success: true,
      message: '保存成功',
      data: associationsWithMeta,
    })
  } catch (error) {
    console.error('保存模板关联配置失败:', error)
    return NextResponse.json(
      { error: '保存模板关联配置失败' },
      { status: 500 }
    )
  }
}

// PUT - 更新模板的关联配置
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const templateId = parseInt(id)
    const body = await request.json()
    const { associations } = body

    if (isNaN(templateId)) {
      return NextResponse.json(
        { error: '无效的模板ID' },
        { status: 400 }
      )
    }

    if (!Array.isArray(associations)) {
      return NextResponse.json(
        { error: '关联配置必须是数组' },
        { status: 400 }
      )
    }

    // 更新关联配置
    const associationsWithMeta = associations.map((assoc: any) => ({
      ...assoc,
      templateId,
      isDefault: true,
    }))

    templateAssociations.set(templateId, associationsWithMeta)

    return NextResponse.json({
      success: true,
      message: '更新成功',
      data: associationsWithMeta,
    })
  } catch (error) {
    console.error('更新模板关联配置失败:', error)
    return NextResponse.json(
      { error: '更新模板关联配置失败' },
      { status: 500 }
    )
  }
}

// DELETE - 删除模板的关联配置
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const templateId = parseInt(id)
    const { searchParams } = new URL(request.url)
    const associationId = searchParams.get('associationId')

    if (isNaN(templateId)) {
      return NextResponse.json(
        { error: '无效的模板ID' },
        { status: 400 }
      )
    }

    if (associationId) {
      // 删除单个关联配置
      const associations = templateAssociations.get(templateId) || []
      const filtered = associations.filter((a: any) => a.id !== parseInt(associationId))
      templateAssociations.set(templateId, filtered)
    } else {
      // 删除所有关联配置
      templateAssociations.delete(templateId)
    }

    return NextResponse.json({
      success: true,
      message: '删除成功',
    })
  } catch (error) {
    console.error('删除模板关联配置失败:', error)
    return NextResponse.json(
      { error: '删除模板关联配置失败' },
      { status: 500 }
    )
  }
}
