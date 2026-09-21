/**
 * 对话历史持久化存储
 * 使用 localStorage 保存对话消息、步骤状态、报告内容
 */

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string | number;
  component?: string;
  componentData?: Record<string, unknown>;
}

export interface ConversationState {
  id: string;
  title: string;
  messages: ConversationMessage[];
  currentStep: string;
  reportStatus: string;
  reportSections: Record<string, unknown>[];
  outputFormat?: string;
  generationType?: string;
  selectedDataSources?: { type: string; name: string; detail?: string }[];
  templateConfirmed?: boolean;
  accountPeriodType?: 'daily' | 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
  accountPeriodValue?: { year: number; month: number; day?: number; quarter?: number; semiAnnual?: number };
  createdAt: number;
  updatedAt: number;
  archivedAt?: number;
  visibility?: 'private' | 'region';
}

const STORAGE_KEY = 'ai-insight-conversations';
const CURRENT_ID_KEY = 'ai-insight-current-conversation-id';

function getStorage(): Record<string, ConversationState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setStorage(data: Record<string, ConversationState>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save conversations:', e);
  }
}

export function getAllConversations(): ConversationState[] {
  const data = getStorage();
  return Object.values(data).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getConversation(id: string): ConversationState | null {
  const data = getStorage();
  return data[id] ?? null;
}

export function saveConversation(state: ConversationState): void {
  const data = getStorage();
  data[state.id] = { ...state, updatedAt: Date.now() };
  setStorage(data);
}

export function createConversation(title: string): ConversationState {
  const id = `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const state: ConversationState = {
    id,
    title,
    messages: [],
    currentStep: '需求收集',
    reportStatus: 'draft',
    reportSections: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  saveConversation(state);
  setCurrentConversationId(id);
  return state;
}

export function deleteConversation(id: string): void {
  const data = getStorage();
  delete data[id];
  setStorage(data);
  // 如果删除的是当前对话，清除当前ID
  if (getCurrentConversationId() === id) {
    localStorage.removeItem(CURRENT_ID_KEY);
  }
}

export function archiveConversation(id: string): void {
  const data = getStorage();
  if (data[id]) {
    data[id].reportStatus = 'final';
    data[id].archivedAt = Date.now();
    data[id].updatedAt = Date.now();
    setStorage(data);
  }
}

export function reopenConversation(id: string): void {
  const data = getStorage();
  if (data[id]) {
    data[id].reportStatus = 'draft';
    delete data[id].archivedAt;
    data[id].updatedAt = Date.now();
    setStorage(data);
  }
}

export function renameConversation(id: string, title: string): void {
  const data = getStorage();
  if (data[id]) {
    data[id].title = title;
    data[id].updatedAt = Date.now();
    setStorage(data);
  }
}

export function getCurrentConversationId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CURRENT_ID_KEY);
}

export function setCurrentConversationId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CURRENT_ID_KEY, id);
}

/* ────────── 归档产出物公共存储（供下载专区等页面读取） ────────── */

export interface ArchivedOutput {
  id: string;
  conversationId: string;
  name: string;
  generationType: 'report' | 'spreadsheet' | 'dashboard' | 'summary';
  visibility: 'private' | 'region';
  businessScenario?: string;
  fileType: string;
  archivedAt: number;
}

const ARCHIVED_OUTPUTS_KEY = 'ai-insight-archived-outputs';

export function getArchivedOutputs(): ArchivedOutput[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ARCHIVED_OUTPUTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addArchivedOutput(output: ArchivedOutput): void {
  const list = getArchivedOutputs();
  // 避免重复
  const idx = list.findIndex(o => o.conversationId === output.conversationId);
  if (idx >= 0) {
    list[idx] = output;
  } else {
    list.unshift(output);
  }
  if (typeof window === 'undefined') return;
  localStorage.setItem(ARCHIVED_OUTPUTS_KEY, JSON.stringify(list));
}

export function removeArchivedOutput(conversationId: string): void {
  const list = getArchivedOutputs().filter(o => o.conversationId !== conversationId);
  if (typeof window === 'undefined') return;
  localStorage.setItem(ARCHIVED_OUTPUTS_KEY, JSON.stringify(list));
}
