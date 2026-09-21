// 移植自 AI Demo/demo_ranking_matching.py 的 _arbitration_llm_call / _judge_arbitration_call /
// run_gray_zone_arbitration（灰色地带LLM裁决子步骤，对应文档2.5运转逻辑步骤5）。
// 直接调用DeepSeek的OpenAI兼容REST接口（与已验证跑通的python demo保持同一条真实路径）。
import { MATCH_ARBITRATION_PROMPT, MATCH_JUDGE_PROMPT } from './prompts';
import type { ArbitrationResult, CandidateScore, DispatchTicket } from './types';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const MODEL = 'deepseek-chat';
const MAX_RETRIES = 2;

interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

async function callDeepSeek(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY 未配置');
  }

  const resp = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      response_format: { type: 'json_object' },
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`DeepSeek请求失败: ${resp.status} ${text}`);
  }

  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('DeepSeek返回内容为空');
  }
  return content;
}

// 模型偶尔会用markdown代码块包裹JSON，做防御性剥离后再解析
function parseJsonResponse<T>(raw: string): T {
  const stripped = raw
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/```\s*$/, '')
    .trim();
  return JSON.parse(stripped) as T;
}

async function callLlmWithRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 2 ** attempt * 1000));
      }
    }
  }
  throw lastError;
}

interface ArbitrationLlmResponse {
  selected_staff_id?: string;
  reason?: string;
}

async function arbitrationLlmCall(
  ticket: DispatchTicket,
  nearTied: CandidateScore[]
): Promise<ArbitrationLlmResponse> {
  const payload = {
    工单: {
      ticket_id: ticket.ticket_id,
      scenario_id: ticket.scenario_id,
      所需技能标签: ticket.required_skill_tags,
    },
    候选人名单: nearTied.map((c) => ({
      staff_id: c.staff_id,
      技能匹配分: c.skill_match_score,
      效能分: c.performance_score,
      综合分: c.combined_score,
      评语: c.remark,
    })),
  };

  const content = await callDeepSeek([
    { role: 'system', content: MATCH_ARBITRATION_PROMPT },
    { role: 'user', content: JSON.stringify(payload) },
  ]);
  return parseJsonResponse<ArbitrationLlmResponse>(content);
}

interface JudgeLlmResponse {
  valid?: boolean;
  issue?: string;
}

async function judgeArbitrationCall(
  nearTied: CandidateScore[],
  selectedStaffId: string,
  reason: string
): Promise<JudgeLlmResponse> {
  const payload = {
    候选人评语原文: Object.fromEntries(nearTied.map((c) => [c.staff_id, c.remark])),
    AI选择: selectedStaffId,
    AI理由: reason,
  };

  const content = await callDeepSeek([
    { role: 'system', content: MATCH_JUDGE_PROMPT },
    { role: 'user', content: JSON.stringify(payload) },
  ]);
  return parseJsonResponse<JudgeLlmResponse>(content);
}

// 复核不通过或调用失败 -> fallback_applied=true，确定性回退到综合分最高者，不阻断分配流程
export async function runGrayZoneArbitration(
  ticket: DispatchTicket,
  candidateScores: CandidateScore[],
  epsilon: number
): Promise<ArbitrationResult> {
  const topScore = candidateScores[0].combined_score;
  const nearTied = candidateScores.filter((c) => topScore - c.combined_score < epsilon);

  try {
    const arb = await callLlmWithRetry(() => arbitrationLlmCall(ticket, nearTied));
    const selectedId = arb.selected_staff_id;
    const reason = arb.reason ?? '';
    const validIds = new Set(nearTied.map((c) => c.staff_id));
    if (!selectedId || !validIds.has(selectedId)) {
      throw new Error(`LLM选择的候选人「${selectedId}」不在传入名单内`);
    }

    const verdict = await judgeArbitrationCall(nearTied, selectedId, reason);
    if (!verdict.valid) {
      return {
        llm_reason: reason,
        judge_pass: false,
        fallback_applied: true,
        issue: verdict.issue ?? '',
        selected_staff_id: null,
      };
    }
    return {
      llm_reason: reason,
      judge_pass: true,
      fallback_applied: false,
      issue: '',
      selected_staff_id: selectedId,
    };
  } catch (e) {
    return {
      llm_reason: null,
      judge_pass: null,
      fallback_applied: true,
      issue: `LLM裁决调用失败：${e instanceof Error ? e.message : String(e)}`,
      selected_staff_id: null,
    };
  }
}
