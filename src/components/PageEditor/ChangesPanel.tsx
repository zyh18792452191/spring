'use client';

import { Edit2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EditChange {
  id: string;
  selector: string;
  type: 'style' | 'content' | 'attribute';
  property: string;
  value: string;
  oldValue: string;
  timestamp: number;
  elementId?: string;
  elementClass?: string;
}

interface ChangesPanelProps {
  changes: EditChange[];
  onClear: () => void;
  onExport: () => void;
  onSave: () => void;
}

export default function ChangesPanel({ changes, onClear, onExport, onSave }: ChangesPanelProps) {
  if (changes.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999] editor-panel">
      <Card className="shadow-2xl p-4 w-96">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Edit2 className="h-4 w-4 text-blue-600" />
            修改记录 ({changes.length})
          </h4>
          <button
            onClick={() => {}}
            className="p-1 hover:bg-gray-100 rounded"
            title="收起"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="max-h-48 overflow-y-auto space-y-2 mb-3">
          {changes.map((change) => (
            <div key={change.id} className="bg-gray-50 rounded p-2 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className={`font-medium ${
                  change.type === 'style' ? 'text-purple-600' :
                  change.type === 'content' ? 'text-blue-600' :
                  'text-green-600'
                }`}>
                  {change.type === 'style' ? '样式' :
                   change.type === 'content' ? '内容' :
                   '属性'}
                </span>
                <span className="text-gray-400">
                  {new Date(change.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-gray-600">
                <span className="font-medium">{change.property}</span>
                <div className="mt-1 text-gray-500">
                  旧值: <span className="line-through">{change.oldValue || '无'}</span>
                  <br />
                  新值: <span className="text-gray-900 font-medium">{change.value}</span>
                </div>
              </div>
              <div className="mt-1 text-gray-400 text-[10px]">
                {change.selector}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('清除按钮被点击');
              onClear();
            }}
            className="flex-1 text-xs"
          >
            清除
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('导出按钮被点击');
              onExport();
            }}
            className="flex-1 text-xs"
          >
            导出
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              console.log('保存按钮被点击');
              onSave();
            }}
            className="flex-1 text-xs"
          >
            保存
          </Button>
        </div>
      </Card>
    </div>
  );
}
