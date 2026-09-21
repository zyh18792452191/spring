#!/usr/bin/env node

/**
 * 数据库初始化脚本
 * 使用方式: node scripts/init-database.mjs
 */

import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
let envLoaded = false;
async function loadEnv() {
  if (envLoaded) return;

  try {
    // 从 coze_workload_identity 获取环境变量
    const { execSync } = await import('child_process');

    const pythonCode = `
import os
import sys
try:
    from coze_workload_identity import Client
    client = Client()
    env_vars = client.get_project_env_vars()
    client.close()
    for env_var in env_vars:
        print(f"{env_var.key}={env_var.value}")
except Exception as e:
    print(f"# Error: {e}", file=sys.stderr)
`;

    const output = execSync(`python3 -c '${pythonCode.replace(/'/g, "'\"'\"'")}'`, {
      encoding: 'utf-8',
      timeout: 10000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const lines = output.trim().split('\n');
    for (const line of lines) {
      if (line.startsWith('#')) continue;
      const eqIndex = line.indexOf('=');
      if (eqIndex > 0) {
        const key = line.substring(0, eqIndex);
        let value = line.substring(eqIndex + 1);
        if ((value.startsWith("'") && value.endsWith("'")) ||
            (value.startsWith('"') && value.endsWith('"'))) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    }

    envLoaded = true;
  } catch (error) {
    console.error('加载环境变量失败:', error);
  }
}

// 获取数据库连接URL
async function getDatabaseUrl() {
  await loadEnv();

  const supabaseUrl = process.env.COZE_SUPABASE_URL;
  const supabaseAnonKey = process.env.COZE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('COZE_SUPABASE_URL 或 COZE_SUPABASE_ANON_KEY 未设置');
  }

  // 从Supabase URL中提取数据库连接信息
  // Supabase URL 格式: https://[project-ref].supabase.co
  // 数据库URL格式: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

  // 尝试使用环境变量中的数据库URL（如果存在）
  if (process.env.COZE_SUPABASE_DB_URL) {
    return process.env.COZE_SUPABASE_DB_URL;
  }

  // 否则，尝试从COZE_SUPABASE_URL和COZE_SUPABASE_ANON_KEY构建
  // 注意：这可能不是最佳方法，因为anon key不等于数据库密码
  // 我们可能需要从其他地方获取数据库密码

  console.error('错误: 无法获取数据库连接URL');
  console.error('请设置 COZE_SUPABASE_DB_URL 环境变量');
  console.error('或在 Supabase Dashboard 中手动执行 SQL 脚本');
  process.exit(1);
}

// 执行SQL脚本
async function executeSqlFile(pool, sqlFilePath) {
  const sql = readFileSync(sqlFilePath, 'utf-8');

  // 分割SQL语句
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let successCount = 0;
  let errorCount = 0;

  for (const statement of statements) {
    try {
      await pool.query(statement);
      successCount++;
    } catch (error) {
      errorCount++;
      console.error(`执行失败: ${statement.substring(0, 50)}...`);
      console.error(error.message);
    }
  }

  return { successCount, errorCount };
}

// 主函数
async function main() {
  console.log('==========================================');
  console.log('数据库初始化脚本');
  console.log('==========================================\n');

  try {
    // 获取数据库连接URL
    const dbUrl = await getDatabaseUrl();
    console.log('✓ 已获取数据库连接URL\n');

    // 创建连接池
    const pool = new Pool({
      connectionString: dbUrl,
    });

    console.log('步骤 1/2: 创建数据库表...');
    console.log('----------------------------------------');

    // 读取并执行SQL脚本
    const sqlFilePath = join(process.cwd(), 'migrations', 'create-tables.sql');
    const { successCount, errorCount } = await executeSqlFile(pool, sqlFilePath);

    if (errorCount === 0) {
      console.log(`✓ 数据库表创建成功 (成功 ${successCount} 条)\n`);
    } else {
      console.log(`⚠ 数据库表创建完成 (成功 ${successCount} 条, 失败 ${errorCount} 条)\n`);
    }

    // 关闭连接池
    await pool.end();

    console.log('步骤 2/2: 初始化页面数据...');
    console.log('----------------------------------------');
    console.log('请访问 http://localhost:5000/workspace/admin/pages');
    console.log('点击"初始化页面数据"按钮来填充数据\n');

    console.log('==========================================');
    console.log('数据库表结构初始化完成！');
    console.log('==========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n==========================================');
    console.error('初始化失败');
    console.error('==========================================');
    console.error(error.message);
    console.error('\n请尝试以下方法：');
    console.error('1. 手动在 Supabase Dashboard 的 SQL Editor 中执行 migrations/create-tables.sql');
    console.error('2. 设置 COZE_SUPABASE_DB_URL 环境变量后重新运行此脚本\n');
    process.exit(1);
  }
}

// 运行主函数
main();
