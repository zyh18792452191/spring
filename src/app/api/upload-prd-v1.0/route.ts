import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';

export async function POST() {
  try {
    const prdFilePath = '/tmp/市场运营平台首页PRD_v1.0.docx';

    // 检查文件是否存在
    if (!fs.existsSync(prdFilePath)) {
      return NextResponse.json({ error: 'PRD文件不存在' }, { status: 404 });
    }

    // 使用 Python 生成 UUID
    const uuid = execSync(`python3 -c "import uuid; print(uuid.uuid4())"`, {
      encoding: 'utf-8'
    }).trim();

    const objectKey = `prd-docs/market-overview-prd-v1.0-${uuid}.docx`;

    // 使用 coze-coding-dev-sdk 上传文件
    const pythonScript = `
import sys
sys.path.insert(0, '${process.env.COZE_WORKSPACE_PATH}/node_modules/coze-coding-dev-sdk')

from coze_coding_dev_sdk import S3SyncStorage

storage = S3SyncStorage()

# 上传文件
result = storage.upload_file(
    file_path='${prdFilePath}',
    object_key='${objectKey}'
)

print(result)
`;

    const uploadResult = execSync(`python3 -c "${pythonScript.replace(/"/g, '\\"')}"`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
      cwd: process.cwd()
    });

    console.log('Upload result:', uploadResult);

    return NextResponse.json({
      success: true,
      objectKey: objectKey,
      fileName: '市场运营平台首页PRD_v1.0.docx',
      uploadResult: uploadResult
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({
      error: '上传失败',
      message: error.message,
      details: error.stderr || error.stdout
    }, { status: 500 });
  }
}
