import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET - 获取人员列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeNo = searchParams.get('employeeNo');
    const name = searchParams.get('name');
    const phone = searchParams.get('phone');
    const region = searchParams.get('region');
    const department = searchParams.get('department'); // 部门筛选
    const status = searchParams.get('status');
    const tag = searchParams.get('tag');
    const tags = searchParams.getAll('tags'); // 支持多个标签
    const hasTags = searchParams.get('hasTags'); // 获取是否有标签的参数
    const excludeTag = searchParams.get('excludeTag'); // 排除打这个标签的人员
    const onlyForTag = searchParams.get('onlyForTag'); // 只显示打了某个标签的人员
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const client = getSupabaseClient();

    let query = client
      .from('staff_management')
      .select('*', { count: 'exact' });

    // 筛选条件
    if (employeeNo) {
      query = query.ilike('employee_no', `%${employeeNo}%`);
    }
    // 支持同时搜索姓名和手机号
    if (name) {
      query = query.or(`name.ilike.%${name}%,phone.ilike.%${name}%`);
    }
    if (phone) {
      query = query.ilike('phone', `%${phone}%`);
    }
    if (region && region !== 'all') {
      query = query.eq('region', region);
    }
    if (department && department !== 'all') {
      query = query.eq('department', department);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (tag && tag !== 'all') {
      query = query.contains('tags', [tag]);
    }
    // 支持多个标签筛选（任意一个匹配即可）
    if (tags && tags.length > 0) {
      const tagConditions = tags.map(t => `tags.cs.{${JSON.stringify(t)}}`).join(',');
      query = query.or(tagConditions);
    }
    // 如果有 hasTags 参数，只返回有标签的人员
    if (hasTags === 'true') {
      // 重新构建query，只包含必要的筛选条件
      let hasTagsQuery = client
        .from('staff_management')
        .select('*', { count: 'exact' })
        .not('tags', 'is', null); // 排除tags为null的记录

      // 应用status筛选（注意：需要处理'all'的情况）
      if (status && status !== 'all') {
        hasTagsQuery = hasTagsQuery.eq('status', status);
      }

      // 排序（确保获取最新数据）
      hasTagsQuery = hasTagsQuery.order('created_at', { ascending: false });

      // 分批获取所有数据，避免分页限制
      let allData: any[] = [];
      let fetchPage = 0;
      const fetchPageSize = 1000;

      while (true) {
        const from = fetchPage * fetchPageSize;
        const to = from + fetchPageSize - 1;

        const { data, error } = await hasTagsQuery.range(from, to);

        if (error) {
          console.error(`获取数据失败 (page ${fetchPage}):`, error);
          break;
        }

        if (!data || data.length === 0) {
          break;
        }

        allData = allData.concat(data);
        fetchPage++;

        if (data.length < fetchPageSize) {
          break;
        }
      }

      // 前端再次过滤：确保tags数组不为空
      const filteredData = allData.filter(staff => staff.tags && staff.tags.length > 0);

      // 分页（使用请求的 page 和 pageSize）
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      return NextResponse.json({
        success: true,
        data: paginatedData,
        total: filteredData.length,
        page,
        pageSize,
        totalPages: Math.ceil(filteredData.length / pageSize),
      });
    }
    // 如果有 excludeTag 参数，排除打这个标签的人员（用于添加人员弹窗）
    if (excludeTag) {
      query = query.not('tags', 'cs', `{${excludeTag}}`);
    }
    // 如果有 onlyForTag 参数，只显示打了某个标签的人员（用于标签树显示人数）
    if (onlyForTag && onlyForTag !== 'all') {
      query = query.contains('tags', [onlyForTag]);
    }

    // 排序：未打标签的排在前面，然后按创建时间倒序
    query = query.order('tags', { ascending: true, nullsFirst: true });
    query = query.order('created_at', { ascending: false });

    // 分页
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    });
  } catch (error: any) {
    console.error('获取人员列表失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取人员列表失败' },
      { status: 500 }
    );
  }
}

// POST - 新增人员
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      employeeNo,
      name,
      organizationId, // 合并后的组织ID
      position,
      phone,
      email,
      status,
      account4a,
      accountOa,
      accountProvincial,
      tags,
      operator,
    } = body;

    // 验证必填字段
    if (!employeeNo || !name || !organizationId || !accountOa) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 检查工号是否已存在
    const { data: existing } = await client
      .from('staff_management')
      .select('id')
      .eq('employee_no', employeeNo)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: '该工号已存在' },
        { status: 400 }
      );
    }

    // 从organizationId解析省公司和部门
    // organizationId格式: province-departmentId (如: beijing-kucun)
    const [region, departmentCode] = organizationId.split('-');

    // 插入人员数据
    const { data, error } = await client
      .from('staff_management')
      .insert({
        employee_no: employeeNo,
        name,
        region, // 省公司
        department: departmentCode || null, // 部门编码
        position: position || null,
        phone: phone || null,
        email: email || null,
        status: status || 'active',
        account_4a: account4a || null,
        account_oa: accountOa,
        account_provincial: accountProvincial,
        business_scenarios: null, // 已移除业务场景
        tags: tags || null,
        is_default_receiver: body.isDefaultReceiver || false,
        created_by: operator || 'admin',
        updated_by: operator || 'admin',
      })
      .select()
      .single();

    if (error) throw error;

    // 记录变更日志
    await client.from('staff_change_logs').insert({
      staff_id: data.id,
      employee_no: data.employee_no,
      region: data.region,
      operation_type: 'create',
      operation_content: `新增人员：${data.name}（工号：${data.employee_no}，部门：${data.department || '无'}，岗位：${data.position || '无'}）`,
      operator: operator || 'admin',
    });

    return NextResponse.json({
      success: true,
      data,
      message: '新增人员成功',
    });
  } catch (error: any) {
    console.error('新增人员失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '新增人员失败' },
      { status: 500 }
    );
  }
}
