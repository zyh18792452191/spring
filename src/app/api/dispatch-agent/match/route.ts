import { NextRequest, NextResponse } from 'next/server';
import { matchTicket, matchTicketWithPool, TICKETS } from '@/lib/dispatch-agent';
import type { DispatchTicket, StaffCandidate } from '@/lib/dispatch-agent';

/**
 * 人员匹配Agent
 * POST body:
 * - { ticket_id } 兼容 Demo
 * - { ticket, staff_pool? } 业务接入
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body?.ticket) {
      const ticket = body.ticket as DispatchTicket;
      const staffPool = body.staff_pool as StaffCandidate[] | undefined;
      const matchingBasis = staffPool?.length
        ? await matchTicketWithPool(ticket, staffPool)
        : await matchTicket(ticket);
      return NextResponse.json({ success: true, data: matchingBasis });
    }

    const ticketId = body?.ticket_id;
    const ticket = TICKETS.find((t) => t.ticket_id === ticketId);

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: `未找到工单: ${ticketId}` },
        { status: 404 }
      );
    }

    const matchingBasis = await matchTicket(ticket);
    return NextResponse.json({ success: true, data: matchingBasis });
  } catch (error) {
    console.error('人员匹配Agent执行失败:', error);
    const message = error instanceof Error ? error.message : '人员匹配Agent执行失败';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
