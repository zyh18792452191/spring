'use client';

import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { SCREEN_LIST, ScreenItem } from './data';

// 投屏管理：大屏列表管理，支持按大屏名称检索与"打开新标签页访问"
export default function ScreenManagePage() {
  const [keyword, setKeyword] = useState('');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query) return SCREEN_LIST;
    return SCREEN_LIST.filter((s) => s.name.includes(query));
  }, [query]);

  const handleClear = () => {
    setKeyword('');
    setQuery('');
  };

  const handleSearch = () => {
    setQuery(keyword.trim());
  };

  const handleOpen = (item: ScreenItem) => {
    toast.success(`已在新标签页打开「${item.name}」大屏`);
    window.open(item.url, '_blank', 'noopener');
  };

  return (
    <div className="h-full flex flex-col bg-[#F0F3F6]">
      {/* 蓝色渐变标题栏 */}
      <div className="flex-shrink-0 bg-gradient-to-r from-[#2E6BE6] to-[#52A0FF] px-6 py-3.5">
        <h1 className="text-lg font-semibold text-white">投屏管理</h1>
      </div>

      {/* 内容卡片 */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded shadow-sm overflow-hidden">
          {/* 顶部蓝色渐变装饰带 */}
          <div className="h-1 bg-gradient-to-r from-[#2E6BE6] to-[#52A0FF]" />

          {/* 搜索区 */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#FAFAFA] border-b border-gray-200 flex-wrap">
            <label className="text-sm text-gray-700 whitespace-nowrap">大屏名称：</label>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="请输入"
              className="h-7 w-64 border border-[#E6E6E6] rounded bg-white px-2 text-sm outline-none focus:border-[#409EFF] transition-colors"
            />
            <button
              onClick={handleClear}
              className="flex items-center gap-1 h-7 px-2 text-sm text-gray-600 hover:text-gray-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />清空
            </button>
            <button
              onClick={handleSearch}
              className="flex items-center gap-1 h-7 px-3 rounded text-sm text-white bg-[#409EFF] hover:bg-[#3388E6] transition-colors"
            >
              <Search className="w-3.5 h-3.5" />查询
            </button>
          </div>

          {/* 大屏列表 */}
          <Table className="table-fixed min-w-[560px]">
            <TableHeader>
              <TableRow className="bg-gray-100 hover:bg-gray-100">
                <TableHead className="font-semibold text-gray-900 text-center w-16">序号</TableHead>
                <TableHead className="font-semibold text-gray-900 text-center">大屏名称</TableHead>
                <TableHead className="font-semibold text-gray-900 text-center w-32">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <TableRow key={item.id} className="hover:bg-[#F6F8FB]">
                    <TableCell className="text-center text-gray-500">{item.id}</TableCell>
                    <TableCell className="text-center text-gray-800">{item.name}</TableCell>
                    <TableCell className="text-center">
                      <button
                        className="text-[#409EFF] underline underline-offset-2 hover:text-[#3388E6]"
                        onClick={() => handleOpen(item)}
                      >
                        打开新标签页访问
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-16 text-gray-400">暂无数据</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
