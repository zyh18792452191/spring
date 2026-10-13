'use client';

export type ActivityType = 'IOP普通营销' | '剧本营销';
export type ActivitySource = '策略调度' | '客群调度';
export type ActivityStatus = '草稿' | '审批中' | '执行中' | '已完成';

export interface ActivityInstance {
  id: string;
  name: string;
  type: ActivityType;
  status: ActivityStatus;
  updatedAt: string;
  scenario: string; // 运营场景
  source: ActivitySource; // 来源
  dispatchSystem: string; // 调度系统：IOP / 网格通 / 剧本营销
  strategyPlan?: string; // 采用的策略方案
  speech?: string; // 营销话术
}

const STORAGE_KEY = 'market-activity-instances';

export function getActivityInstances(): ActivityInstance[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ActivityInstance[]) : [];
  } catch {
    return [];
  }
}

export function createActivityId(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const seq = String(Date.now()).slice(-4);
  return `ACT-${y}${m}${d}-${seq}`;
}

export function recordActivityInstance(
  params: Omit<ActivityInstance, 'id' | 'status' | 'updatedAt'>
): ActivityInstance {
  const now = new Date();
  const instance: ActivityInstance = {
    ...params,
    id: createActivityId(),
    status: '审批中',
    updatedAt: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`,
  };

  if (typeof window !== 'undefined') {
    const instances = getActivityInstances();
    instances.unshift(instance);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(instances));
  }

  return instance;
}
