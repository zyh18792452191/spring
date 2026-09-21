/**
 * 数据脱敏工具函数
 * 
 * 遵循《个人信息保护法》第51条及工信部第24号令第13条，
 * 端侧展示必须对个人敏感信息进行去标识化处理。
 * 
 * 脱敏规则依据电信运营商行业实践（移动/电信/联通营销系统统一规范）：
 * - 手机号码：中间4位脱敏（前3位为运营商号段，后4位为用户常用尾号，中间4位既满足去标识化又保留业务可读性）
 * - 座机号码：区号后4位脱敏
 */

/**
 * 手机号码/电话号码脱敏
 * - 11位手机号：138****5678
 * - 8位以上座机：区号后4位用*替换
 * - 空值或"--"：原样返回
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone || phone === '--') return '--';
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length === 11) {
    return cleaned.slice(0, 3) + '****' + cleaned.slice(7);
  }
  if (cleaned.length >= 8) {
    const start = Math.floor(cleaned.length / 2) - 2;
    return cleaned.slice(0, start) + '****' + cleaned.slice(start + 4);
  }
  return phone;
}

/**
 * 姓名脱敏
 * - 两个字：张*
 * - 三个字：张*明
 * - 四个字及以上：张**明
 */
export function maskName(name: string | null | undefined): string {
  if (!name || name === '--') return '--';
  if (name.length === 2) return name[0] + '*';
  if (name.length === 3) return name[0] + '*' + name[2];
  if (name.length > 3) return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
  return name;
}

/**
 * 身份证号脱敏
 * - 18位：650102****1234
 */
export function maskIdCard(idCard: string | null | undefined): string {
  if (!idCard || idCard === '--') return '--';
  const cleaned = idCard.replace(/\s/g, '');
  if (cleaned.length === 18) {
    return cleaned.slice(0, 6) + '********' + cleaned.slice(14);
  }
  if (cleaned.length === 15) {
    return cleaned.slice(0, 6) + '*****' + cleaned.slice(11);
  }
  return idCard;
}
