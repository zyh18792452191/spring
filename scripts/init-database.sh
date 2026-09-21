#!/bin/bash

# 初始化数据库表和数据的脚本
set -e

echo "=========================================="
echo "数据库初始化脚本"
echo "=========================================="

# 检查环境变量
if [ -z "$COZE_SUPABASE_DB_URL" ]; then
    echo "错误: COZE_SUPABASE_DB_URL 环境变量未设置"
    echo "请使用以下格式: postgresql://[user]:[password]@[host]:[port]/[database]"
    exit 1
fi

# 执行创建表的SQL脚本
echo ""
echo "步骤 1/2: 创建数据库表..."
echo "----------------------------------------"

# 使用 psql 执行 SQL
psql "$COZE_SUPABASE_DB_URL" -f migrations/create-tables.sql

if [ $? -eq 0 ]; then
    echo "✓ 数据库表创建成功"
else
    echo "✗ 数据库表创建失败"
    exit 1
fi

# 初始化数据（通过API）
echo ""
echo "步骤 2/2: 初始化页面数据..."
echo "----------------------------------------"

# 调用初始化API
RESPONSE=$(curl -s -X POST http://localhost:5000/api/init-pages-data)

# 检查响应
echo "$RESPONSE" | python3 -c "
import sys
import json
try:
    data = json.load(sys.stdin)
    if data.get('success'):
        print(f\"✓ 初始化成功: 成功 {data['successCount']} 条，失败 {data['errorCount']} 条\")
        if data.get('errors'):
            print('\\n错误详情:')
            for err in data['errors'][:10]:  # 只显示前10个错误
                print(f\"  - {err}\")
            if len(data['errors']) > 10:
                print(f\"  ... 还有 {len(data['errors']) - 10} 个错误\")
    else:
        print(f\"✗ 初始化失败: {data.get('message', '未知错误')}\")
        sys.exit(1)
except Exception as e:
    print(f\"✗ 解析响应失败: {e}\")
    print(f\"原始响应: {data}\")
    sys.exit(1)
"

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "初始化完成！"
    echo "=========================================="
    echo ""
    echo "您可以访问以下页面查看数据："
    echo "  - 页面管理: http://localhost:5000/workspace/admin/pages"
    echo ""
else
    echo ""
    echo "=========================================="
    echo "初始化失败"
    echo "=========================================="
    exit 1
fi
