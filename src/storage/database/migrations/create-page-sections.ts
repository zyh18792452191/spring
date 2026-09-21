import { Client } from 'pg';
import { loadEnv } from '@/storage/database/supabase-client';

/**
 * 初始化page_sections表
 */
export async function createPageSectionsTable() {
  loadEnv();

  const connectionString = process.env.COZE_SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('Database connection string not found');
    return false;
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();

    const createTableSQL = `
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
    `;

    await client.query(createTableSQL);

    console.log('✅ page_sections table created successfully');
    return true;
  } catch (error) {
    console.error('❌ Error creating page_sections table:', error);
    return false;
  } finally {
    await client.end();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  createPageSectionsTable()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}
