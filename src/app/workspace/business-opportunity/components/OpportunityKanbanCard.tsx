'use client';

import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle, XCircle, Users, MapPin, Package, Zap, Calendar } from 'lucide-react';

// 评级颜色配置
const RATING_COLORS: Record<string, string> = {
  '高': 'bg-red-100 text-red-700 border-red-200',
  'HIGH': 'bg-red-100 text-red-700 border-red-200',
  '中': 'bg-amber-100 text-amber-700 border-amber-200',
  'MEDIUM': 'bg-amber-100 text-amber-700 border-amber-200',
  '低': 'bg-slate-100 text-slate-600 border-slate-200',
  'LOW': 'bg-slate-100 text-slate-600 border-slate-200',
};

const RATING_LABELS: Record<string, string> = {
  'HIGH': '高', 'MEDIUM': '中', 'LOW': '低',
};

// 有效期状态
function getValidityInfo(validHours: number, status: string): { label: string; color: string; icon: React.ReactNode } {
  if (status === 'COMPLETED' || status === 'ABANDONED') {
    return { label: '-', color: 'text-muted-foreground', icon: <Clock className="w-3 h-3" /> };
  }
  if (validHours <= 6) {
    return { label: `剩余${validHours}h`, color: 'text-red-500', icon: <AlertTriangle className="w-3 h-3" /> };
  }
  if (validHours <= 24) {
    return { label: `剩余${validHours}h`, color: 'text-amber-500', icon: <Clock className="w-3 h-3" /> };
  }
  return { label: `剩余${validHours}h`, color: 'text-green-500', icon: <Clock className="w-3 h-3" /> };
}

// 转化结果
function getConversionBadge(result?: string) {
  if (!result || result === 'PENDING') return null;
  if (result === 'SUCCESS') {
    return <Badge className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0"><CheckCircle className="w-3 h-3 mr-0.5" />已转化</Badge>;
  }
  return <Badge className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0"><XCircle className="w-3 h-3 mr-0.5" />未转化</Badge>;
}

export interface CustomerKanbanCardData {
  type: 'customer';
  id: string;
  businessTypeName: string;
  rating: string;
  recommendedProducts?: { id: string; name: string; price: number }[];
  validHours: number;
  status: string;
  statusLabel: string;
  conversionResult?: string;
  region?: string;
  category?: string;
  collectTime?: string;
  validUntil?: string;
}

export interface GroupKanbanCardData {
  type: 'group';
  id: string;
  businessTypeName: string;
  rating: string;
  groupName: string;
  groupScale: number;
  recommendedStrategy?: string;
  region?: string;
  status: string;
  statusLabel: string;
  category?: string;
  collectTime?: string;
  validUntil?: string;
}

export type KanbanCardData = CustomerKanbanCardData | GroupKanbanCardData;

interface OpportunityKanbanCardProps {
  data: KanbanCardData;
  onClick?: () => void;
  selected?: boolean;
  onSelect?: () => void;
  showCheckbox?: boolean;
}

// 状态颜色
const STATUS_COLORS: Record<string, string> = {
  '待派单': 'bg-slate-100 text-slate-600',
  '待抢单': 'bg-blue-100 text-blue-600',
  '执行中': 'bg-amber-100 text-amber-600',
  '已完结': 'bg-green-100 text-green-600',
  '待调度': 'bg-slate-100 text-slate-600',
  '调度中': 'bg-blue-100 text-blue-600',
  '已完成': 'bg-green-100 text-green-600',
  '已废弃': 'bg-gray-100 text-gray-500',
};

export default function OpportunityKanbanCard({
  data,
  onClick,
  selected,
  onSelect,
  showCheckbox,
}: OpportunityKanbanCardProps) {
  const ratingLabel = RATING_LABELS[data.rating] || data.rating;
  const ratingColor = RATING_COLORS[data.rating] || RATING_COLORS['低'];

  return (
    <div
      className={`p-3 rounded-lg border bg-card cursor-pointer transition-all hover:shadow-md ${
        selected ? 'border-primary ring-1 ring-primary/20' : 'border-border hover:border-primary/40'
      }`}
      onClick={onClick}
    >
      {/* 头部：评级 + 状态 + 复选框 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className={`${ratingColor} text-[10px] px-1.5 py-0 font-medium`}>
            {ratingLabel}
          </Badge>
          <Badge className={`${STATUS_COLORS[data.statusLabel] || 'bg-gray-100 text-gray-600'} text-[10px] px-1.5 py-0 font-normal`}>
            {data.statusLabel}
          </Badge>
        </div>
        {showCheckbox && onSelect && (
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => { e.stopPropagation(); onSelect(); }}
            className="rounded border-gray-300"
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>

      {/* 业务类型名称 */}
      <div className="text-sm font-medium text-foreground mb-1.5 line-clamp-1">
        {data.businessTypeName}
      </div>

      {/* 分类 */}
      {data.category && (
        <div className="text-[11px] text-muted-foreground mb-1.5 line-clamp-1">
          {data.category}
        </div>
      )}

      {data.type === 'customer' ? (
        /* 客户商机特有信息 */
        <div className="space-y-1.5">
          {/* 推荐产品 */}
          {data.recommendedProducts && data.recommendedProducts.length > 0 && (
            <div className="flex items-center gap-1">
              <Package className="w-3 h-3 text-primary shrink-0" />
              <span className="text-[11px] text-foreground line-clamp-1">
                {data.recommendedProducts[0].name}
                {data.recommendedProducts.length > 1 && ` +${data.recommendedProducts.length - 1}`}
              </span>
            </div>
          )}
          {/* 有效期 */}
          <div className="flex items-center gap-1">
            {(() => {
              const vi = getValidityInfo(data.validHours, data.status);
              return (
                <>
                  {vi.icon}
                  <span className={`text-[11px] ${vi.color}`}>{vi.label}</span>
                </>
              );
            })()}
            {data.conversionResult && getConversionBadge(data.conversionResult)}
          </div>
          {/* 区域 */}
          {data.region && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="text-[11px] text-muted-foreground line-clamp-1">{data.region}</span>
            </div>
          )}
        </div>
      ) : (
        /* 客群商机特有信息 */
        <div className="space-y-1.5">
          {/* 客群名称 + 规模 */}
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-primary shrink-0" />
            <span className="text-[11px] text-foreground line-clamp-1">{data.groupName}</span>
            <span className="text-[11px] text-primary font-medium ml-auto">{data.groupScale.toLocaleString()}人</span>
          </div>
          {/* 推荐策略 */}
          {data.recommendedStrategy && (
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500 shrink-0" />
              <span className="text-[11px] text-foreground line-clamp-1">{data.recommendedStrategy}</span>
            </div>
          )}
          {/* 区域 */}
          {data.region && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="text-[11px] text-muted-foreground line-clamp-1">{data.region}</span>
            </div>
          )}
        </div>
      )}

      {/* 底部：采集时间 + 有效期至 + ID */}
      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border">
        <div className="flex items-center gap-2">
          {data.collectTime && (
            <div className="flex items-center gap-0.5">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">{data.collectTime}</span>
            </div>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground">{data.id}</span>
      </div>
    </div>
  );
}
