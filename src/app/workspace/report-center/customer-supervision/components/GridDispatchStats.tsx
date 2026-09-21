'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { DRILL, DrillRow } from '../drillData';
import SectionCard from './SectionCard';
import Pager from './Pager';

// 下钻路径：city → district → grid → microGrid（物理网格为最底层，不再继续下钻）
interface DrillPath {
  city: string;
  district: string;
  grid: string;
  microGrid: string;
}

const EMPTY_PATH: DrillPath = { city: '', district: '', grid: '', microGrid: '' };

interface DrillTableProps {
  title: string;
  rows: DrillRow[];
  currentName: string;
  isLeaf: boolean;
  onDrill: (name: string) => void;
  onCollapse: () => void;
}

// 单级下钻统计卡片（表格 + 操作列 + 分页）
function DrillTable({ title, rows, currentName, isLeaf, onDrill, onCollapse }: DrillTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  // 下钻/收起后重置分页
  const handleDrill = (name: string) => { setPage(1); onDrill(name); };
  const handleCollapse = () => { setPage(1); onCollapse(); };

  return (
    <SectionCard title={title}>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 hover:bg-gray-100">
            <TableHead className="font-semibold text-gray-900 text-center w-48">{title.replace('按', '').replace('统计', '')}</TableHead>
            <TableHead className="font-semibold text-gray-900 text-center">看管客户数</TableHead>
            <TableHead className="font-semibold text-gray-900 text-center">看管全球通客户数</TableHead>
            <TableHead className="font-semibold text-gray-900 text-center">已分派物理网格数</TableHead>
            <TableHead className="font-semibold text-gray-900 text-center">未分派物理网格数</TableHead>
            {!isLeaf && <TableHead className="font-semibold text-gray-900 text-center w-24">操作</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageData.length > 0 ? (
            pageData.map((row) => (
              <TableRow key={row.name} className="hover:bg-gray-50">
                <TableCell className="text-center font-medium text-gray-900">{row.name}</TableCell>
                <TableCell className="text-center">{row.customerCount}</TableCell>
                <TableCell className="text-center">{row.globalCount}</TableCell>
                <TableCell className="text-center">{row.dispatchedGrids.toLocaleString()}</TableCell>
                <TableCell className="text-center">{row.undispatchedGrids}</TableCell>
                {!isLeaf && (
                  <TableCell className="text-center">
                    {row.name === currentName ? (
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-orange-500 hover:text-orange-600" onClick={handleCollapse}>
                        <ArrowUp className="w-3.5 h-3.5 mr-0.5" />收起
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-[#3471ff] hover:text-[#3471ff]/80" onClick={() => handleDrill(row.name)}>
                        <ArrowDown className="w-3.5 h-3.5 mr-0.5" />下钻
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={isLeaf ? 5 : 6} className="text-center py-16 text-gray-400">暂无数据</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="mt-4">
        <Pager total={rows.length} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />
      </div>
    </SectionCard>
  );
}

// Tab2 物理网格分派统计 —— 5级下钻统计（按地州→区县→网格→微格→物理网格）
export default function GridDispatchStats() {
  const [path, setPath] = useState<DrillPath>(EMPTY_PATH);

  const setLevel = (key: keyof DrillPath, name: string) => {
    if (key === 'city') setPath({ city: name, district: '', grid: '', microGrid: '' });
    else if (key === 'district') setPath({ ...path, district: name, grid: '', microGrid: '' });
    else if (key === 'grid') setPath({ ...path, grid: name, microGrid: '' });
    else setPath({ ...path, microGrid: name });
  };

  const collapseLevel = (key: keyof DrillPath) => {
    if (key === 'city') setPath(EMPTY_PATH);
    else if (key === 'district') setPath({ ...path, district: '', grid: '', microGrid: '' });
    else if (key === 'grid') setPath({ ...path, grid: '', microGrid: '' });
    else setPath({ ...path, microGrid: '' });
  };

  return (
    <div className="space-y-4">
      {/* 按地州统计（始终展示） */}
      <DrillTable
        title="按地州统计"
        rows={DRILL.cityRows}
        currentName={path.city}
        isLeaf={false}
        onDrill={(name) => setLevel('city', name)}
        onCollapse={() => collapseLevel('city')}
      />
      {/* 按区县统计（选中地州后展示） */}
      {path.city && (
        <DrillTable
          title="按区县统计"
          rows={DRILL.districts[path.city] ?? []}
          currentName={path.district}
          isLeaf={false}
          onDrill={(name) => setLevel('district', name)}
          onCollapse={() => collapseLevel('district')}
        />
      )}
      {/* 按网格统计（选中区县后展示） */}
      {path.district && (
        <DrillTable
          title="按网格统计"
          rows={DRILL.grids[path.district] ?? []}
          currentName={path.grid}
          isLeaf={false}
          onDrill={(name) => setLevel('grid', name)}
          onCollapse={() => collapseLevel('grid')}
        />
      )}
      {/* 按微格统计（选中网格后展示） */}
      {path.grid && (
        <DrillTable
          title="按微格统计"
          rows={DRILL.microGrids[path.grid] ?? []}
          currentName={path.microGrid}
          isLeaf={false}
          onDrill={(name) => setLevel('microGrid', name)}
          onCollapse={() => collapseLevel('microGrid')}
        />
      )}
      {/* 按物理网格统计（最底层，无操作列） */}
      {path.microGrid && (
        <DrillTable
          title="按物理网格统计"
          rows={DRILL.physicalGrids[path.microGrid] ?? []}
          currentName=""
          isLeaf
          onDrill={() => {}}
          onCollapse={() => {}}
        />
      )}
    </div>
  );
}
