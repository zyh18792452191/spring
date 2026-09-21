import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 测试数据
    const testStaffData = [
      // 乌鲁木齐
      { employeeNo: 'BJ001', name: '张三', region: '乌鲁木齐', department: '运营部', position: '运营总监', phone: '13800138001', email: 'zhangsan@example.com', status: 'active', account4a: 'zhangsan', accountOa: 'zhangsan_oa', accountProvincial: 'zhangsan_pro' },
      { employeeNo: 'BJ002', name: '李四', region: '乌鲁木齐', department: '运营部', position: '运营经理', phone: '13800138002', email: 'lisi@example.com', status: 'active', account4a: 'lisi', accountOa: 'lisi_oa', accountProvincial: 'lisi_pro' },
      { employeeNo: 'BJ003', name: '王五', region: '乌鲁木齐', department: '运营二部', position: '运营主管', phone: '13800138003', email: 'wangwu@example.com', status: 'active', account4a: 'wangwu', accountOa: 'wangwu_oa', accountProvincial: 'wangwu_pro' },
      { employeeNo: 'BJ004', name: '赵六', region: '乌鲁木齐', department: '运营三部', position: '运营专员', phone: '13800138004', email: 'zhaoliu@example.com', status: 'active', account4a: null, accountOa: 'zhaoliu_oa', accountProvincial: 'zhaoliu_pro' },
      { employeeNo: 'BJ005', name: '钱七', region: '乌鲁木齐', department: '运营部', position: '运营专员', phone: '13800138005', email: 'qianqi@example.com', status: 'inactive', account4a: 'qianqi', accountOa: 'qianqi_oa', accountProvincial: 'qianqi_pro' },

      // 克拉玛依
      { employeeNo: 'SH001', name: '孙八', region: '克拉玛依', department: '运营部', position: '运营总监', phone: '13900139001', email: 'sunba@example.com', status: 'active', account4a: 'sunba', accountOa: 'sunba_oa', accountProvincial: 'sunba_pro' },
      { employeeNo: 'SH002', name: '周九', region: '克拉玛依', department: '运营二部', position: '运营经理', phone: '13900139002', email: 'zhoujiu@example.com', status: 'active', account4a: 'zhoujiu', accountOa: 'zhoujiu_oa', accountProvincial: 'zhoujiu_pro' },
      { employeeNo: 'SH003', name: '吴十', region: '克拉玛依', department: '运营三部', position: '运营主管', phone: '13900139003', email: 'wushi@example.com', status: 'active', account4a: 'wushi', accountOa: 'wushi_oa', accountProvincial: 'wushi_pro' },
      { employeeNo: 'SH004', name: '郑十一', region: '克拉玛依', department: '运营部', position: '运营专员', phone: '13900139004', email: 'zhengshiyi@example.com', status: 'active', account4a: null, accountOa: 'zhengshiyi_oa', accountProvincial: 'zhengshiyi_pro' },
      { employeeNo: 'SH005', name: '陈十二', region: '克拉玛依', department: '运营二部', position: '运营专员', phone: '13900139005', email: 'chenshier@example.com', status: 'active', account4a: 'chenshier', accountOa: 'chenshier_oa', accountProvincial: 'chenshier_pro' },

      // 吐鲁番
      { employeeNo: 'GD001', name: '林一', region: '吐鲁番', department: '运营部', position: '运营总监', phone: '13700137001', email: 'linyi@example.com', status: 'active', account4a: 'linyi', accountOa: 'linyi_oa', accountProvincial: 'linyi_pro' },
      { employeeNo: 'GD002', name: '黄二', region: '吐鲁番', department: '运营二部', position: '运营经理', phone: '13700137002', email: 'huanger@example.com', status: 'active', account4a: 'huanger', accountOa: 'huanger_oa', accountProvincial: 'huanger_pro' },
      { employeeNo: 'GD003', name: '杨三', region: '吐鲁番', department: '运营三部', position: '运营主管', phone: '13700137003', email: 'yangsan@example.com', status: 'active', account4a: 'yangsan', accountOa: 'yangsan_oa', accountProvincial: 'yangsan_pro' },
      { employeeNo: 'GD004', name: '朱四', region: '吐鲁番', department: '运营部', position: '运营专员', phone: '13700137004', email: 'zhusi@example.com', status: 'active', account4a: null, accountOa: 'zhusi_oa', accountProvincial: 'zhusi_pro' },
      { employeeNo: 'GD005', name: '马五', region: '吐鲁番', department: '运营二部', position: '运营专员', phone: '13700137005', email: 'mawu@example.com', status: 'inactive', account4a: 'mawu', accountOa: 'mawu_oa', accountProvincial: 'mawu_pro' },

      // 哈密
      { employeeNo: 'JS001', name: '胡六', region: '哈密', department: '运营部', position: '运营总监', phone: '13600136001', email: 'huliu@example.com', status: 'active', account4a: 'huliu', accountOa: 'huliu_oa', accountProvincial: 'huliu_pro' },
      { employeeNo: 'JS002', name: '郭七', region: '哈密', department: '运营二部', position: '运营经理', phone: '13600136002', email: 'guoqi@example.com', status: 'active', account4a: 'guoqi', accountOa: 'guoqi_oa', accountProvincial: 'guoqi_pro' },
      { employeeNo: 'JS003', name: '何八', region: '哈密', department: '运营三部', position: '运营主管', phone: '13600136003', email: 'heba@example.com', status: 'active', account4a: 'heba', accountOa: 'heba_oa', accountProvincial: 'heba_pro' },
      { employeeNo: 'JS004', name: '高九', region: '哈密', department: '运营部', position: '运营专员', phone: '13600136004', email: 'gaojiu@example.com', status: 'active', account4a: null, accountOa: 'gaojiu_oa', accountProvincial: 'gaojiu_pro' },
      { employeeNo: 'JS005', name: '罗十', region: '哈密', department: '运营二部', position: '运营专员', phone: '13600136005', email: 'luoshi@example.com', status: 'active', account4a: 'luoshi', accountOa: 'luoshi_oa', accountProvincial: 'luoshi_pro' },

      // 昌吉
      { employeeNo: 'ZJ001', name: '梁十一', region: '昌吉', department: '运营部', position: '运营总监', phone: '13500135001', email: 'liangshiyi@example.com', status: 'active', account4a: 'liangshiyi', accountOa: 'liangshiyi_oa', accountProvincial: 'liangshiyi_pro' },
      { employeeNo: 'ZJ002', name: '宋十二', region: '昌吉', department: '运营二部', position: '运营经理', phone: '13500135002', email: 'songshier@example.com', status: 'active', account4a: 'songshier', accountOa: 'songshier_oa', accountProvincial: 'songshier_pro' },
      { employeeNo: 'ZJ003', name: '郑一', region: '昌吉', department: '运营三部', position: '运营主管', phone: '13500135003', email: 'zhengyi@example.com', status: 'active', account4a: 'zhengyi', accountOa: 'zhengyi_oa', accountProvincial: 'zhengyi_pro' },
      { employeeNo: 'ZJ004', name: '谢二', region: '昌吉', department: '运营部', position: '运营专员', phone: '13500135004', email: 'xieer@example.com', status: 'active', account4a: null, accountOa: 'xieer_oa', accountProvincial: 'xieer_pro' },
      { employeeNo: 'ZJ005', name: '韩三', region: '昌吉', department: '运营二部', position: '运营专员', phone: '13500135005', email: 'hansan@example.com', status: 'active', account4a: 'hansan', accountOa: 'hansan_oa', accountProvincial: 'hansan_pro' },
    ];

    // 插入测试数据
    const insertedData = [];
    for (const staff of testStaffData) {
      const { data, error } = await client
        .from('staff_management')
        .upsert({
          employee_no: staff.employeeNo,
          name: staff.name,
          region: staff.region,
          department: staff.department,
          position: staff.position,
          phone: staff.phone,
          email: staff.email,
          status: staff.status,
          account_4a: staff.account4a,
          account_oa: staff.accountOa,
          account_provincial: staff.accountProvincial,
          created_by: 'system',
          updated_by: 'system',
        }, {
          onConflict: 'employee_no',
        })
        .select()
        .single();

      if (error) {
        console.error(`插入 ${staff.name} 失败:`, error);
      } else {
        insertedData.push(data);
      }
    }

    return NextResponse.json({
      success: true,
      message: `成功初始化 ${insertedData.length} 条测试数据`,
      data: insertedData,
    });
  } catch (error: any) {
    console.error('初始化测试数据失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '初始化测试数据失败' },
      { status: 500 }
    );
  }
}
