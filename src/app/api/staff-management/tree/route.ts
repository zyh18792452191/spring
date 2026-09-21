import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET - 获取组织结构树数据
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 获取所有人员数据
    const { data: staffData, error } = await client
      .from('staff_management')
      .select('region, department, status')
      .order('region', { ascending: true });

    if (error) throw error;

    // 构建组织结构树
    const treeData: any = {
      id: 'national',
      name: '全国',
      region: 'national',
      type: 'root',
      total: staffData?.length || 0,
      active: staffData?.filter((s: any) => s.status === 'active').length || 0,
      inactive: staffData?.filter((s: any) => s.status === 'inactive').length || 0,
      departmentCount: new Set(staffData?.map((s: any) => s.department)).size,
      children: [],
    };

    // 按省份分组
    const regionGroups: Record<string, any> = {};
    staffData?.forEach((staff: any) => {
      const region = staff.region;
      if (!regionGroups[region]) {
        regionGroups[region] = {
          id: `region-${region}`,
          name: region,
          region: region,
          type: 'region',
          total: 0,
          active: 0,
          inactive: 0,
          departments: new Set<string>(),
        };
      }
      regionGroups[region].total++;
      if (staff.status === 'active') {
        regionGroups[region].active++;
      } else {
        regionGroups[region].inactive++;
      }
      if (staff.department) {
        regionGroups[region].departments.add(staff.department);
      }
    });

    // 转换为树结构
    Object.values(regionGroups).forEach((regionData: any) => {
      treeData.children.push({
        ...regionData,
        departmentCount: regionData.departments.size,
        departments: Array.from(regionData.departments),
      });
    });

    return NextResponse.json({
      success: true,
      data: treeData,
    });
  } catch (error: any) {
    console.error('获取组织结构树失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取组织结构树失败' },
      { status: 500 }
    );
  }
}
