import type { StaffCandidate } from './types';

export interface ProvincePersonnelLike {
  id: string;
  name: string;
  department: string;
  phone?: string;
  tags?: string[];
  position?: string;
  remark?: string;
}

export function provincePersonnelToStaffPool(
  personnel: ProvincePersonnelLike[]
): StaffCandidate[] {
  return personnel.map((p, index) => ({
    staff_id: p.id,
    skill_tags: p.tags ?? [],
    performance_score: Math.round((0.72 + (index % 4) * 0.05) * 100) / 100,
    remark: p.remark ?? `${p.name}（${p.department}${p.position ? ` · ${p.position}` : ''}）`,
  }));
}

export function resolvePersonnelByStaffId(
  staffId: string | null | undefined,
  personnel: ProvincePersonnelLike[]
): ProvincePersonnelLike | null {
  if (!staffId) return null;
  return (
    personnel.find((p) => p.id === staffId || p.name === staffId) ??
    personnel.find((p) => staffId.includes(p.name)) ??
    null
  );
}
