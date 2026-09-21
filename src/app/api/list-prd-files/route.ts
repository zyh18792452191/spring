import { NextRequest, NextResponse } from "next/server";
import { S3Storage } from "coze-coding-dev-sdk";

export async function GET() {
  try {
    const storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      bucketName: process.env.COZE_BUCKET_NAME,
      region: "cn-beijing",
    });

    // 列出所有PRD相关文件
    const allFiles = await storage.listFiles({
      prefix: '',
      maxKeys: 100,
    });

    const filesList = allFiles.keys || [];
    const prdFiles = filesList.filter((key: string) =>
      key.toLowerCase().includes('prd') ||
      key.toLowerCase().includes('市场运营')
    );

    return NextResponse.json({
      success: true,
      files: prdFiles.map((key: string) => ({
        key,
      })),
    });
  } catch (error) {
    console.error('List PRD files error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list PRD files' },
      { status: 500 }
    );
  }
}
