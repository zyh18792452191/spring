import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 初始化表单模板数据
 * POST /api/init-form-templates
 */
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 检查是否已存在默认表单模板
    const { data: existing } = await client
      .from('form_templates')
      .select('*')
      .eq('template_code', 'COMPLEX_FORM')
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: '表单模板已存在，无需重复初始化',
      });
    }

    // 创建默认表单模板配置
    const formConfig = {
      fields: [
        {
          id: 'single_line_input',
          type: 'text',
          label: '单行输入框',
          placeholder: '请输入单行输入框',
          required: false,
          maxLength: 100,
        },
        {
          id: 'multi_line_input',
          type: 'textarea',
          label: '多行输入框',
          placeholder: '请输入多行输入框',
          required: false,
          maxLength: 500,
          rows: 4,
        },
        {
          id: 'dropdown_select',
          type: 'select',
          label: '下拉选择',
          placeholder: '请选择',
          required: false,
          options: ['选项一', '选项二', '选项三'],
        },
        {
          id: 'cascading_select',
          type: 'select',
          label: '级联选择',
          placeholder: '请选择',
          required: false,
          options: ['一级选项1', '一级选项2'],
        },
        {
          id: 'province_city',
          type: 'select',
          label: '省市区',
          placeholder: '请选择',
          required: false,
          options: ['乌鲁木齐', '克拉玛依', '吐鲁番', '昌吉'],
        },
        {
          id: 'radio_group',
          type: 'radio',
          label: '单选框',
          required: false,
          options: ['选项一', '选项二'],
        },
        {
          id: 'checkbox_group',
          type: 'checkbox',
          label: '多选框',
          required: false,
          options: ['选项一', '选项二'],
        },
        {
          id: 'time_select',
          type: 'datetime',
          label: '时间选择',
          required: false,
        },
        {
          id: 'date_select',
          type: 'date',
          label: '日期选择',
          required: false,
        },
        {
          id: 'datetime_select',
          type: 'datetime',
          label: '日期时间选择',
          required: false,
        },
        {
          id: 'date_range',
          type: 'text',
          label: '日期范围',
          placeholder: '开始日期 ~ 结束日期',
          required: false,
        },
        {
          id: 'attachment',
          type: 'text',
          label: '附件',
          placeholder: '上传文件（单文件大小不超过10MB，仅支持上传1个文件）',
          required: false,
        },
        {
          id: 'image_upload',
          type: 'text',
          label: '图片',
          placeholder: '上传图片（单文件大小不超过5MB，仅支持上传1个文件）',
          required: false,
        },
        {
          id: 'rating',
          type: 'number',
          label: '星级',
          required: false,
          min: 0,
          max: 5,
        },
        {
          id: 'id_card',
          type: 'text',
          label: '身份证号',
          placeholder: '请输入身份证号',
          required: false,
        },
        {
          id: 'email',
          type: 'email',
          label: '邮箱',
          placeholder: '请输入邮箱',
          required: false,
        },
        {
          id: 'phone',
          type: 'phone',
          label: '手机号',
          placeholder: '请输入手机号',
          required: false,
        },
        {
          id: 'number_input',
          type: 'number',
          label: '数字输入框',
          placeholder: '请输入',
          required: false,
          min: 0,
        },
        {
          id: 'form_description',
          type: 'textarea',
          label: '表单描述',
          placeholder: '请输入',
          required: false,
          maxLength: 500,
          rows: 3,
        },
      ],
    };

    // 插入表单模板
    const { data, error } = await client
      .from('form_templates')
      .insert({
        template_code: 'COMPLEX_FORM',
        template_name: '超级复杂表单',
        description: '包含多种表单组件类型的综合表单',
        form_config: JSON.stringify(formConfig),
        created_by: '系统',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: '表单模板初始化成功',
      data,
    });
  } catch (error: any) {
    console.error('初始化表单模板失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: `初始化失败: ${error instanceof Error ? error.message : '未知错误'}`,
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
