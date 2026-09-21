import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { SelectedCommunity } from './utils';
import { CellInfo } from '../components/CommunityPortrait';

interface AOIDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aoi: SelectedCommunity | null;
  onCellDetail?: (cell: CellInfo) => void;
}

/** 将AOI下的communityCode解析为小区列表，并生成画像所需数据 */
export function parseCommunitiesFromAOI(aoi: SelectedCommunity): CellInfo[] {
  const codes = aoi.communityCode.split(',').map(c => c.trim()).filter(Boolean);
  // 根据AOI信息生成每个小区的画像数据
  const districtNames: Record<string, string[]> = {
    '天山区': ['大巴扎小区', '解放路小区'],
    '沙依巴克区': ['友好北路小区', '炉院街小区'],
    '新市区': ['北京路小区', '铁路局小区'],
    '水磨沟区': ['南湖小区'],
    '头屯河区': ['开发区小区', '钢铁厂小区'],
  };

  const names = districtNames[aoi.district] || codes.map((_, i) => `${aoi.district}小区${i + 1}`);
  // 按taskCustomerCount均分
  const avgHouseholds = Math.round(aoi.taskCustomerCount / codes.length);

  return codes.map((code, i) => {
    const total = avgHouseholds * 2;
    const used = Math.round(avgHouseholds * 1.6);
    return {
      id: code,
      name: names[i] || `${aoi.district}小区${i + 1}`,
      type: 'lowSaturation',
      address: `新疆乌鲁木齐市${aoi.district}${aoi.grid}`,
      householdCount: avgHouseholds + Math.round(Math.random() * 50),
      penetration: +(72 + Math.random() * 15).toFixed(1),
      share: +(35 + Math.random() * 20).toFixed(1),
      cellCode: code,
      cellType: '住宅型',
      cityName: '乌鲁木齐市',
      districtName: aoi.district,
      networkName: aoi.grid,
      longitude: 87.6 + i * 0.01,
      latitude: 43.8 + i * 0.005,
      userCount: Math.round(avgHouseholds * 0.72),
      totalPorts: total,
      unusedPorts: total - used,
      portUsageRate: +(70 + Math.random() * 20).toFixed(1),
      isKeyCell: Math.random() > 0.5,
      dataDate: '2025-06-01',
      info: `特征标签：流量零低, ${aoi.hasExistingTask ? '在途工单' : '空闲'}`,
    };
  });
}

export default function AOIDetailDialog({ open, onOpenChange, aoi, onCellDetail }: AOIDetailDialogProps) {
  if (!aoi) return null;

  const communities = parseCommunitiesFromAOI(aoi);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[800px] disableMaxWidth" 
        disableMaxWidth
      >
        <DialogTitle>AOI详情 - {aoi.aoiName}</DialogTitle>

        {/* AOI概览 */}
        <div className="grid grid-cols-4 gap-3 py-3">
          <div className="bg-muted/50 rounded-md p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">AOI编码</div>
            <div className="text-sm font-semibold">{aoi.aoiCode}</div>
          </div>
          <div className="bg-muted/50 rounded-md p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">所属区域</div>
            <div className="text-sm font-semibold">{aoi.city} · {aoi.district}</div>
          </div>
          <div className="bg-muted/50 rounded-md p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">任务客户数</div>
            <div className="text-sm font-semibold text-primary">{aoi.taskCustomerCount}</div>
          </div>
          <div className="bg-muted/50 rounded-md p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">近30日派单</div>
            <div className="text-sm font-semibold">{aoi.recentDispatchCount}次</div>
          </div>
        </div>

        {/* 小区列表 */}
        <div className="text-sm font-medium mb-2 flex items-center gap-1">
          <span>小区列表</span>
          <span className="text-xs text-muted-foreground">（共{communities.length}个小区）</span>
        </div>
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-3 py-2 font-medium">小区名称</th>
                <th className="text-left px-3 py-2 font-medium">小区编码</th>
                <th className="text-left px-3 py-2 font-medium">户数</th>
                <th className="text-left px-3 py-2 font-medium">用户数</th>
                <th className="text-left px-3 py-2 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {communities.map((cell) => (
                <tr key={cell.cellCode} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2">
                    <span
                      className="text-primary cursor-pointer hover:underline"
                      onClick={() => onCellDetail?.(cell)}
                    >
                      {cell.name}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{cell.cellCode}</td>
                  <td className="px-3 py-2">{cell.householdCount}</td>
                  <td className="px-3 py-2">{cell.userCount}</td>
                  <td className="px-3 py-2">
                    <button
                      className="text-primary hover:underline text-xs"
                      onClick={() => onCellDetail?.(cell)}
                    >
                      详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
