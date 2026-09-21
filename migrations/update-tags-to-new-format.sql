-- 更新人员表中的标签数据，将旧格式标签（如"存量运营人员"）映射到新格式标签
-- 执行前请备份数据库

-- 更新存量运营人员
UPDATE staff_management
SET tags = array_replace(tags, '存量运营人员', '存量运营')
WHERE '存量运营人员' = ANY(tags);

-- 更新融合运营人员（属于存量运营的子标签）
UPDATE staff_management
SET tags = array_replace(tags, '融合运营人员', '存量运营 / 融合运营')
WHERE '融合运营人员' = ANY(tags);

-- 更新家庭运营人员
UPDATE staff_management
SET tags = array_replace(tags, '家庭运营人员', '家庭运营')
WHERE '家庭运营人员' = ANY(tags);

-- 更新国际业务运营人员
UPDATE staff_management
SET tags = array_replace(tags, '国际业务运营人员', '国际业务运营')
WHERE '国际业务运营人员' = ANY(tags);

-- 更新终端运营人员（映射到家庭运营）
UPDATE staff_management
SET tags = array_replace(tags, '终端运营人员', '家庭运营')
WHERE '终端运营人员' = ANY(tags);

-- 更新产品运营人员（映射到存量运营）
UPDATE staff_management
SET tags = array_replace(tags, '产品运营人员', '存量运营')
WHERE '产品运营人员' = ANY(tags);

-- 更新积分运营人员（映射到存量运营）
UPDATE staff_management
SET tags = array_replace(tags, '积分运营人员', '存量运营')
WHERE '积分运营人员' = ANY(tags);

-- 更新渠道运营人员（映射到存量运营）
UPDATE staff_management
SET tags = array_replace(tags, '渠道运营人员', '存量运营')
WHERE '渠道运营人员' = ANY(tags);

-- 更新权益运营人员（映射到存量运营）
UPDATE staff_management
SET tags = array_replace(tags, '权益运营人员', '存量运营')
WHERE '权益运营人员' = ANY(tags);

-- 验证更新结果
SELECT unnest(tags) as tag_name, COUNT(*) as count
FROM staff_management
WHERE array_length(tags, 1) > 0
GROUP BY tag_name
ORDER BY count DESC;
