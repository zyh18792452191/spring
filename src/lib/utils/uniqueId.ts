/**
 * 生成唯一ID
 * 使用时间戳 + 随机数确保唯一性
 */
export function generateUniqueId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `editor-${timestamp}-${random}`;
}

/**
 * 生成短ID（用于元素ID属性）
 * 格式: e-<随机字符>
 */
export function generateElementShortId(): string {
  const random = Math.random().toString(36).substring(2, 8);
  return `e-${random}`;
}

/**
 * 确保元素有唯一ID
 * 如果元素没有data-editor-id属性，则添加一个
 */
export function ensureElementHasId(element: HTMLElement): string {
  let id = element.getAttribute('data-editor-id');
  if (!id) {
    id = generateElementShortId();
    element.setAttribute('data-editor-id', id);
  }
  return id;
}

/**
 * 检查ID是否唯一
 * 用于调试，确保ID在页面中唯一
 */
export function isIdUnique(id: string): boolean {
  const elements = document.querySelectorAll(`[data-editor-id="${id}"]`);
  return elements.length <= 1;
}
