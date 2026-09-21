#!/usr/bin/env node
// 分析指标库管理页面图片

import { open } from 'fs/promises';
import { join } from 'path';

const WORKSPACE = process.env.CYZ_WORKSPACE_PATH || process.env.WORKSPACE_PATH || '/workspace/projects';

const imagePaths = [
  'assets/manual_extract_metrics/word/media/image1.png',
  'assets/manual_extract_metrics/word/media/image2.png',
  'assets/manual_extract_metrics/word/media/image3.png',
  'assets/manual_extract_metrics/word/media/image4.png',
  'assets/manual_extract_metrics/word/media/image5.png',
  'assets/manual_extract_metrics/word/media/image6.png',
  'assets/manual_extract_metrics/word/media/image7.png',
  'assets/manual_extract_metrics/word/media/image8.png',
  'assets/manual_extract_metrics/word/media/image9.png',
  'assets/manual_extract_metrics/word/media/image10.png',
  'assets/manual_extract_metrics/word/media/image11.png',
  'assets/manual_extract_metrics/word/media/image12.png',
  'assets/manual_extract_metrics/word/media/image13.png',
  'assets/manual_extract_metrics/word/media/image14.png',
  'assets/manual_extract_metrics/word/media/image15.png',
  'assets/manual_extract_metrics/word/media/image16.png',
  'assets/manual_extract_metrics/word/media/image17.png',
  'assets/manual_extract_metrics/word/media/image18.png',
  'assets/manual_extract_metrics/word/media/image19.png',
  'assets/manual_extract_metrics/word/media/image20.png',
];

console.log('=== 指标库管理图片信息 ===\n');

for (const imagePath of imagePaths) {
  try {
    const fullPath = join(WORKSPACE, imagePath);
    const fd = await open(fullPath);
    const stat = await fd.stat();
    await fd.close();
    console.log(`✓ ${imagePath}: ${stat.size} bytes`);
  } catch (error) {
    console.log(`✗ ${imagePath}: ${error.message}`);
  }
}

console.log('\n=== 分析完成 ===');
