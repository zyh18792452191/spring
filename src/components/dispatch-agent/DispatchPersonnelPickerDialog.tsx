'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ProvincePersonnelLike } from '@/lib/dispatch-agent/personnelAdapter';

interface DispatchPersonnelPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  territoryName: string;
  personnel: ProvincePersonnelLike[];
  selectedPersonId?: string;
  onConfirm: (person: { id: string; name: string; department: string }) => void;
}

export default function DispatchPersonnelPickerDialog({
  open,
  onOpenChange,
  territoryName,
  personnel,
  selectedPersonId,
  onConfirm,
}: DispatchPersonnelPickerDialogProps) {
  const [keyword, setKeyword] = useState('');
  const [pickedId, setPickedId] = useState<string | undefined>(selectedPersonId);

  const filtered = useMemo(() => {
    const q = keyword.trim();
    if (!q) return personnel;
    return personnel.filter(
      (p) =>
        p.name.includes(q) ||
        p.department.includes(q) ||
        (p.phone && p.phone.includes(q))
    );
  }, [keyword, personnel]);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setKeyword('');
      setPickedId(selectedPersonId);
    }
    onOpenChange(next);
  };

  const handleConfirm = () => {
    const person = personnel.find((p) => p.id === pickedId);
    if (!person) return;
    onConfirm({ id: person.id, name: person.name, department: person.department });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>选择执行人 - {territoryName}</DialogTitle>
        </DialogHeader>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="按姓名、部门、手机号搜索"
            className="pl-10"
          />
        </div>
        <div className="mt-3 max-h-[320px] overflow-y-auto rounded-lg border">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">暂无可用人员</div>
          ) : (
            filtered.map((person) => {
              const selected = pickedId === person.id;
              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => setPickedId(person.id)}
                  className={`flex w-full items-center justify-between border-b px-4 py-3 text-left last:border-b-0 hover:bg-gray-50 ${
                    selected ? 'bg-blue-50' : ''
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900">{person.name}</div>
                    <div className="text-xs text-gray-500">{person.department}</div>
                  </div>
                  {selected && <span className="text-xs text-blue-600">已选</span>}
                </button>
              );
            })
          )}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!pickedId}>
            确定
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
