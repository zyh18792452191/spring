'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Search, Download } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { CITIES, CITY_DISTRICTS, DISTRICT_GRIDS, GRID_DETAILS } from '../data';
import Pager from './Pager';

type AssignedFilter = 'ALL' | 'YES' | 'NO';

interface GridDispatchDetailProps {
  initialCity?: string;
}

// Tab3 存量用户物理网格分派明细
export default function GridDispatchDetail({ initialCity }: GridDispatchDetailProps) {
  // 草稿筛选条件（输入态）
  const [draftKeyword, setDraftKeyword] = useState('');
  const [draftCity, setDraftCity] = useState('ALL');
  const [draftDistrict, setDraftDistrict] = useState('ALL');
  const [draftGrid, setDraftGrid] = useState('ALL');
  const [draftAssigned, setDraftAssigned] = useState<AssignedFilter>('ALL');

  // 已提交筛选条件（查询生效态）
  const [city, setCity] = useState('ALL');
  const [keyword, setKeyword] = useState('');
  const [district, setDistrict] = useState('ALL');
  const [grid, setGrid] = useState('ALL');
  const [assigned, setAssigned] = useState<AssignedFilter>('ALL');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Tab2 下钻带入地州
  useEffect(() => {
    if (initialCity) {
      setDraftCity(initialCity);
      setCity(initialCity);
      setDraftDistrict('ALL');
      setDistrict('ALL');
      setDraftGrid('ALL');
      setGrid('ALL');
      setPage(1);
    }
  }, [initialCity]);

  // 区县 / 网格下拉选项（随已提交地州联动）
  const districts = city === 'ALL' ? [] : CITY_DISTRICTS[city] ?? [];
  const grids = district === 'ALL' ? [] : DISTRICT_GRIDS[district] ?? [];

  // 地州变化时重置下级
  const handleCityChange = (v: string) => {
    setDraftCity(v);
    setDraftDistrict('ALL');
    setDraftGrid('ALL');
  };

  const handleDistrictChange = (v: string) => {
    setDraftDistrict(v);
    setDraftGrid('ALL');
  };

  const handleReset = () => {
    setDraftKeyword('');
    setDraftCity('ALL');
    setDraftDistrict('ALL');
    setDraftGrid('ALL');
    setDraftAssigned('ALL');
    setKeyword('');
    setCity('ALL');
    setDistrict('ALL');
    setGrid('ALL');
    setAssigned('ALL');
    setPage(1);
  };

  const handleQuery = () => {
    setKeyword(draftKeyword);
    setCity(draftCity);
    setDistrict(draftDistrict);
    setGrid(draftGrid);
    setAssigned(draftAssigned);
    setPage(1);
  };

  const handleExport = () => {
    toast.success(`导出成功，共 ${filtered.length} 条物理网格明细，文件已生成`);
  };

  const filtered = useMemo(() => {
    return GRID_DETAILS.filter((r) => {
      if (keyword && !r.gridName.includes(keyword)) return false;
      if (city !== 'ALL' && r.city !== city) return false;
      if (district !== 'ALL' && r.district !== district) return false;
      if (grid !== 'ALL' && r.grid !== grid) return false;
      if (assigned === 'YES' && !r.assigned) return false;
      if (assigned === 'NO' && r.assigned) return false;
      return true;
    });
  }, [keyword, city, district, grid, assigned]);

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  return (
    <div className="space-y-4">
      {/* 筛选区 */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">物理网格名称：</label>
              <Input
                value={draftKeyword}
                onChange={(e) => setDraftKeyword(e.target.value)}
                placeholder="请输入物理网格名称"
                className="w-48 h-9 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">地州：</label>
              <Select value={draftCity} onValueChange={handleCityChange}>
                <SelectTrigger className="w-36 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  <SelectItem value="ALL">全部</SelectItem>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">区县：</label>
              <Select value={draftDistrict} onValueChange={handleDistrictChange} disabled={draftCity === 'ALL'}>
                <SelectTrigger className="w-36 h-9 text-sm">
                  <SelectValue placeholder={draftCity === 'ALL' ? '请先选择地州' : '请选择'} />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  <SelectItem value="ALL">全部</SelectItem>
                  {(CITY_DISTRICTS[draftCity] ?? []).map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">网格：</label>
              <Select value={draftGrid} onValueChange={setDraftGrid} disabled={draftDistrict === 'ALL'}>
                <SelectTrigger className="w-40 h-9 text-sm">
                  <SelectValue placeholder={draftDistrict === 'ALL' ? '请先选择区县' : '请选择'} />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  <SelectItem value="ALL">全部</SelectItem>
                  {(DISTRICT_GRIDS[draftDistrict] ?? []).map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">是否分派：</label>
              <div className="flex items-center bg-gray-100 rounded-md p-0.5">
                {([
                  { value: 'ALL', label: '全部' },
                  { value: 'YES', label: '是' },
                  { value: 'NO', label: '否' },
                ] as { value: AssignedFilter; label: string }[]).map((opt) => (
                  <button
                    key={opt.value}
                    className={cn(
                      'px-3 h-8 rounded text-sm font-medium transition-colors',
                      draftAssigned === opt.value ? 'bg-white text-[#3471ff] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    )}
                    onClick={() => setDraftAssigned(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-1" />重置
              </Button>
              <Button size="sm" className="bg-[#3471ff] hover:bg-[#3471ff]/90" onClick={handleQuery}>
                <Search className="w-4 h-4 mr-1" />查询
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-1" />导出
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 明细表格 */}
      <Card>
        <CardContent className="pt-4 pb-5">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100 hover:bg-gray-100">
                <TableHead className="font-semibold text-gray-900 text-center w-14">序号</TableHead>
                <TableHead className="font-semibold text-gray-900 text-center">物理网格ID</TableHead>
                <TableHead className="font-semibold text-gray-900 text-center">物理网格名称</TableHead>
                <TableHead className="font-semibold text-gray-900 text-center w-20">是否分派</TableHead>
                <TableHead className="font-semibold text-gray-900 text-center w-20">拍照客户数</TableHead>
                <TableHead className="font-semibold text-gray-900 text-center">所属微格</TableHead>
                <TableHead className="font-semibold text-gray-900 text-center">所属网格</TableHead>
                <TableHead className="font-semibold text-gray-900 text-center">所属区县</TableHead>
                <TableHead className="font-semibold text-gray-900 text-center">所属地州</TableHead>
                <TableHead className="font-semibold text-gray-900 text-center">维系人4A账号</TableHead>
                <TableHead className="font-semibold text-gray-900 text-center w-20">维系人4A名称</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.length > 0 ? (
                pageData.map((row, idx) => (
                  <TableRow key={row.id} className="hover:bg-gray-50">
                    <TableCell className="text-center text-gray-500">{(page - 1) * pageSize + idx + 1}</TableCell>
                    <TableCell className="text-center">{row.gridId}</TableCell>
                    <TableCell className="text-center font-medium text-gray-900">{row.gridName}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className={row.assigned ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}>
                        {row.assigned ? '是' : '否'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{row.photoCount}</TableCell>
                    <TableCell className="text-center">{row.microGrid}</TableCell>
                    <TableCell className="text-center">{row.grid}</TableCell>
                    <TableCell className="text-center">{row.district}</TableCell>
                    <TableCell className="text-center">{row.city}</TableCell>
                    <TableCell className="text-center">{row.account}</TableCell>
                    <TableCell className="text-center">{row.keeperName}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-16 text-gray-400">暂无数据</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="mt-4">
            <Pager
              total={filtered.length}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
