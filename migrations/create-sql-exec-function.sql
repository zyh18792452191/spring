-- 创建执行 SQL 的函数（仅用于管理员）
-- 注意：这个函数应该只用于管理目的，需要谨慎使用
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 只有超级用户可以调用这个函数
REVOKE ALL ON FUNCTION exec_sql(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO postgres;

-- 创建触发器函数：自动更新页面信息
CREATE OR REPLACE FUNCTION update_page_info()
RETURNS TRIGGER AS $$
BEGIN
  -- 当页面更新时，自动更新相关信息
  NEW.scenario_name = (
    SELECT scenario_name
    FROM business_scenarios
    WHERE scenario_code = NEW.scenario_code
  );

  NEW.module_name = (
    SELECT module_name
    FROM modules
    WHERE module_code = NEW.module_code
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_update_page_info ON pages;
CREATE TRIGGER trigger_update_page_info
  BEFORE INSERT OR UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_page_info();

-- 创建更新关联配置中 page_name 的触发器
CREATE OR REPLACE FUNCTION update_association_page_name()
RETURNS TRIGGER AS $$
BEGIN
  -- 当页面更新时，同步更新关联配置中的页面名称
  UPDATE report_associations
  SET page_name = NEW.page_name
  WHERE page_id = NEW.page_code;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_update_association_page_name ON pages;
CREATE TRIGGER trigger_update_association_page_name
  AFTER UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_association_page_name();
