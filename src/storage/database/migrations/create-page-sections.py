#!/usr/bin/env python3
"""
创建page_sections表的迁移脚本
"""

import os
import sys

try:
    from coze_workload_identity import Client
except ImportError:
    print("Error: coze_workload_identity not found")
    sys.exit(1)

try:
    import psycopg2
except ImportError:
    print("Error: psycopg2 not found")
    sys.exit(1)


def get_database_url():
    """获取数据库连接URL"""
    try:
        client = Client()
        env_vars = client.get_project_env_vars()
        client.close()

        for env_var in env_vars:
            if env_var.key in ['DATABASE_URL', 'COZE_SUPABASE_DATABASE_URL']:
                return env_var.value

        # 如果没有直接的数据库URL，尝试从Supabase URL构建
        supabase_url = None
        supabase_password = None

        for env_var in env_vars:
            if env_var.key == 'COZE_SUPABASE_URL':
                supabase_url = env_var.value
            elif env_var.key == 'COZE_SUPABASE_DB_PASSWORD':
                supabase_password = env_var.value

        if supabase_url and supabase_password:
            # 从supabase_url提取信息
            # supabase_url格式: https://xxx.supabase.co
            import re
            match = re.match(r'https://([^.]+)\.supabase\.co', supabase_url)
            if match:
                project_ref = match.group(1)
                return f"postgres://postgres.{project_ref}:{supabase_password}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

        return None
    except Exception as e:
        print(f"Error getting database URL: {e}", file=sys.stderr)
        return None


def create_page_sections_table():
    """创建page_sections表"""
    database_url = get_database_url()

    if not database_url:
        print("Error: Database URL not found in environment variables", file=sys.stderr)
        return False

    try:
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()

        # 创建表
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS page_sections (
            id SERIAL PRIMARY KEY,
            page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
            section_code TEXT NOT NULL,
            section_name TEXT NOT NULL,
            section_type TEXT DEFAULT 'CONTENT',
            section_config TEXT,
            sort_order INTEGER DEFAULT 0 NOT NULL,
            status TEXT DEFAULT 'active' NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(page_id, section_code)
        );

        -- 创建索引
        CREATE INDEX IF NOT EXISTS idx_page_sections_page_id ON page_sections(page_id);
        CREATE INDEX IF NOT EXISTS idx_page_sections_status ON page_sections(status);
        """

        cursor.execute(create_table_sql)
        conn.commit()

        print("✅ page_sections table created successfully")
        return True

    except Exception as e:
        print(f"❌ Error creating page_sections table: {e}", file=sys.stderr)
        return False
    finally:
        if 'conn' in locals():
            conn.close()


if __name__ == '__main__':
    success = create_page_sections_table()
    sys.exit(0 if success else 1)
