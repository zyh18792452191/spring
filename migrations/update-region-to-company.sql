-- 更新region字段，将省份名称改为公司名称
-- 执行前请备份数据库

UPDATE staff_management SET region = '中国移动通信集团上海公司' WHERE region = '上海';
UPDATE staff_management SET region = '中国移动通信集团云南公司' WHERE region = '云南';
UPDATE staff_management SET region = '中国移动通信集团内蒙古公司' WHERE region = '内蒙古';
UPDATE staff_management SET region = '中国移动通信集团北京公司' WHERE region = '北京';
UPDATE staff_management SET region = '中国移动通信集团吉林公司' WHERE region = '吉林';
UPDATE staff_management SET region = '中国移动通信集团四川公司' WHERE region = '四川';
UPDATE staff_management SET region = '中国移动通信集团天津公司' WHERE region = '天津';
UPDATE staff_management SET region = '中国移动通信集团宁夏公司' WHERE region = '宁夏';
UPDATE staff_management SET region = '中国移动通信集团安徽公司' WHERE region = '安徽';
UPDATE staff_management SET region = '中国移动通信集团山东公司' WHERE region = '山东';
UPDATE staff_management SET region = '中国移动通信集团山西公司' WHERE region = '山西';
UPDATE staff_management SET region = '中国移动通信集团广东公司' WHERE region = '广东';
UPDATE staff_management SET region = '中国移动通信集团广西公司' WHERE region = '广西';
UPDATE staff_management SET region = '中国移动通信集团新疆公司' WHERE region = '新疆';
UPDATE staff_management SET region = '中国移动通信集团江苏公司' WHERE region = '江苏';
UPDATE staff_management SET region = '中国移动通信集团江西公司' WHERE region = '江西';
UPDATE staff_management SET region = '中国移动通信集团河北公司' WHERE region = '河北';
UPDATE staff_management SET region = '中国移动通信集团河南公司' WHERE region = '河南';
UPDATE staff_management SET region = '中国移动通信集团浙江公司' WHERE region = '浙江';
UPDATE staff_management SET region = '中国移动通信集团海南公司' WHERE region = '海南';
UPDATE staff_management SET region = '中国移动通信集团湖北公司' WHERE region = '湖北';
UPDATE staff_management SET region = '中国移动通信集团湖南公司' WHERE region = '湖南';
UPDATE staff_management SET region = '中国移动通信集团甘肃公司' WHERE region = '甘肃';
UPDATE staff_management SET region = '中国移动通信集团福建公司' WHERE region = '福建';
UPDATE staff_management SET region = '中国移动通信集团西藏公司' WHERE region = '西藏';
UPDATE staff_management SET region = '中国移动通信集团贵州公司' WHERE region = '贵州';
UPDATE staff_management SET region = '中国移动通信集团辽宁公司' WHERE region = '辽宁';
UPDATE staff_management SET region = '中国移动通信集团重庆公司' WHERE region = '重庆';
UPDATE staff_management SET region = '中国移动通信集团陕西公司' WHERE region = '陕西';
UPDATE staff_management SET region = '中国移动通信集团青海公司' WHERE region = '青海';
UPDATE staff_management SET region = '中国移动通信集团黑龙江公司' WHERE region = '黑龙江';

-- 验证更新结果
SELECT DISTINCT region FROM staff_management ORDER BY region;
