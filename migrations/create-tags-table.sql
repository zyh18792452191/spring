-- 创建标签表（两级结构）
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level IN (1, 2)),
  parent_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  is_system BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_tags_parent_id ON tags(parent_id);
CREATE INDEX IF NOT EXISTS idx_tags_level ON tags(level);
CREATE INDEX IF NOT EXISTS idx_tags_is_system ON tags(is_system);

-- 插入初始数据（系统预置标签）
-- 一级标签
INSERT INTO tags (id, name, level, parent_id, is_system, sort_order, description) VALUES
  ('a1b2c3d4-e5f6-7890-1234-567890abcdef1', '存量运营', 1, NULL, true, 1, '存量运营相关标签'),
  ('a1b2c3d4-e5f6-7890-1234-567890abcdef2', '国际业务运营', 1, NULL, true, 2, '国际业务运营相关标签'),
  ('a1b2c3d4-e5f6-7890-1234-567890abcdef3', '家庭运营', 1, NULL, true, 3, '家庭运营相关标签')
ON CONFLICT (id) DO NOTHING;

-- 二级标签（存量运营下）
INSERT INTO tags (id, name, level, parent_id, is_system, sort_order, description) VALUES
  ('b1c2d3e4-f5g6-7890-1234-567890abcdef1', '中高端客户运营', 2, 'a1b2c3d4-e5f6-7890-1234-567890abcdef1', true, 1, '中高端客户运营'),
  ('b1c2d3e4-f5g6-7890-1234-567890abcdef2', '离网维系', 2, 'a1b2c3d4-e5f6-7890-1234-567890abcdef1', true, 2, '离网维系'),
  ('b1c2d3e4-f5g6-7890-1234-567890abcdef3', '用量运营', 2, 'a1b2c3d4-e5f6-7890-1234-567890abcdef1', true, 3, '用量运营'),
  ('b1c2d3e4-f5g6-7890-1234-567890abcdef4', '融合运营', 2, 'a1b2c3d4-e5f6-7890-1234-567890abcdef1', true, 4, '融合运营'),
  ('b1c2d3e4-f5g6-7890-1234-567890abcdef5', '细分市场运营', 2, 'a1b2c3d4-e5f6-7890-1234-567890abcdef1', true, 5, '细分市场运营')
ON CONFLICT (id) DO NOTHING;

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 注释
COMMENT ON TABLE tags IS '运营人员标签表（两级结构）';
COMMENT ON COLUMN tags.id IS '标签ID';
COMMENT ON COLUMN tags.name IS '标签名称';
COMMENT ON COLUMN tags.level IS '标签层级：1-一级标签，2-二级标签';
COMMENT ON COLUMN tags.parent_id IS '父标签ID（一级标签为NULL）';
COMMENT ON COLUMN tags.is_system IS '是否为系统预置标签（预置标签不可修改和删除）';
COMMENT ON COLUMN tags.sort_order IS '排序顺序';
