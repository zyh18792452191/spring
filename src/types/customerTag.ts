// 客户标签相关类型定义

// 标签类型枚举
export type TagType = 'boolean' | 'number' | 'percentage' | 'enum' | 'string';

// 条件操作符枚举
export type Operator = 'equal' | 'not_equal' | 'greater_than' | 'less_than' | 'between' | 'in';

// 客户标签定义
export interface CustomerTag {
  id: string;
  name: string;
  type: TagType;
  category: string; // 标签分类
  description?: string;
  options?: string[]; // 枚举类型的选项
}

// 条件值（根据标签类型不同）
export interface ConditionValue {
  singleValue?: number | boolean | string;
  rangeValue?: { min: number; max: number };
  multipleValue?: string[]; // 枚举多选
}

// 单个标签的条件
export interface TagCondition {
  tagId: string;
  tagName: string;
  tagType: TagType;
  operator: Operator;
  value: ConditionValue;
}

// 客群分层（一个节点对应一个客群分层）
export interface CustomerSegment {
  id: string;
  name: string;
  tagConditions: TagCondition[]; // 所有选中的标签及其条件
  logic: 'AND' | 'OR'; // 条件之间的逻辑关系（通常是AND）
}

// 客户标签节点数据
export interface CustomerTagNodeData {
  selectedTags: string[]; // 选中的标签ID列表（用于快速筛选）
  segment: CustomerSegment; // 客群分层配置（包含所有标签的条件）
}

// 节点类型枚举（更新）
export type NodeType = 'root' | 'category' | 'business_metric' | 'segment_metric' | 'customer_tag';

// 获取标签类型的操作符列表
export function getOperatorsByType(tagType: TagType): Operator[] {
  switch (tagType) {
    case 'boolean':
      return ['equal', 'not_equal'];
    case 'number':
    case 'percentage':
      return ['equal', 'not_equal', 'greater_than', 'less_than', 'between'];
    case 'enum':
      return ['equal', 'not_equal', 'in'];
    case 'string':
      return ['equal', 'not_equal'];
    default:
      return ['equal'];
  }
}

// 获取操作符的中文显示
export function getOperatorLabel(operator: Operator): string {
  const labels: Record<Operator, string> = {
    equal: '等于',
    not_equal: '不等于',
    greater_than: '大于',
    less_than: '小于',
    between: '区间',
    in: '包含',
  };
  return labels[operator];
}
