import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// POST - 导入人员数据（从CSV，只导入手机号）
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const tagsParam = formData.get('tags') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '请选择要导入的文件' },
        { status: 400 }
      );
    }

    // 解析标签
    let tags: string[] = [];
    if (tagsParam) {
      try {
        tags = JSON.parse(tagsParam);
      } catch (error) {
        return NextResponse.json(
          { success: false, error: '标签格式不正确' },
          { status: 400 }
        );
      }
    }

    if (tags.length === 0) {
      return NextResponse.json(
        { success: false, error: '请选择至少一个标签' },
        { status: 400 }
      );
    }

    // 检查文件类型
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, error: '仅支持CSV格式文件' },
        { status: 400 }
      );
    }

    // 读取文件内容
    const text = await file.text();

    // 解析CSV
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return NextResponse.json(
        { success: false, error: 'CSV文件为空或格式不正确' },
        { status: 400 }
      );
    }

    // 解析CSV头部
    const headers = parseCSVLine(lines[0]);
    const phoneIndex = headers.indexOf('手机号码');

    if (phoneIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'CSV缺少"手机号码"列' },
        { status: 400 }
      );
    }

    // 解析数据行，提取手机号
    const phoneNumbers: string[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        const phone = values[phoneIndex]?.trim();

        if (!phone) {
          errors.push(`第${i + 1}行: 缺少手机号码`);
          continue;
        }

        // 验证手机号
        if (!/^1[3-9]\d{9}$/.test(phone)) {
          errors.push(`第${i + 1}行: 手机号格式不正确`);
          continue;
        }

        phoneNumbers.push(phone);
      } catch (error) {
        errors.push(`第${i + 1}行: 解析失败`);
      }
    }

    if (phoneNumbers.length === 0) {
      return NextResponse.json(
        { success: false, error: '没有有效的手机号码', errors },
        { status: 400 }
      );
    }

    // 根据手机号查找员工并更新标签
    let successCount = 0;
    let notFoundCount = 0;

    for (const phone of phoneNumbers) {
      // 查找员工
      const { data: staff, error: findError } = await client
        .from('staff_management')
        .select('id, tags')
        .eq('phone', phone)
        .single();

      if (findError || !staff) {
        notFoundCount++;
        continue;
      }

      // 合并标签（去重）
      const existingTags = staff.tags || [];
      const mergedTags = Array.from(new Set([...existingTags, ...tags]));

      // 更新员工标签
      const { error: updateError } = await client
        .from('staff_management')
        .update({
          tags: mergedTags,
          updated_by: 'import',
        })
        .eq('id', staff.id);

      if (!updateError) {
        successCount++;
      } else {
        errors.push(`手机号 ${phone}: 更新失败`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `导入完成，成功 ${successCount} 条，未找到 ${notFoundCount} 条，失败 ${errors.length} 条`,
      data: {
        total: phoneNumbers.length,
        success: successCount,
        notFound: notFoundCount,
        errors,
      },
    });
  } catch (error: any) {
    console.error('导入失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '导入失败' },
      { status: 500 }
    );
  }
}

// 解析CSV行，处理引号内的逗号
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}
