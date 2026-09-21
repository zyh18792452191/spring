"use client";

import { useState, useEffect } from 'react';
import { Search, X, User, Building2, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Employee {
  id: string;
  employee_no: string;
  name: string;
  region: string;
  department: string;
  position: string;
  status: string;
}

interface EmployeeSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (employee: Employee) => void;
  excludeEmployeeNo?: string; // 排除已选择的工号（用于编辑时）
}

export default function EmployeeSelectDialog({
  open,
  onOpenChange,
  onSelect,
  excludeEmployeeNo,
}: EmployeeSelectDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadEmployees();
    }
  }, [open, searchQuery]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        pageSize: '20',
      });
      if (searchQuery.trim()) {
        params.append('name', searchQuery.trim());
        params.append('employeeNo', searchQuery.trim());
      }

      const response = await fetch(`/api/staff-management?${params}`);
      const result = await response.json();

      if (result.success) {
        // 过滤掉已选择的工号
        const filtered = result.data.filter((emp: Employee) =>
          emp.employee_no !== excludeEmployeeNo
        );
        setEmployees(filtered);
      }
    } catch (error) {
      console.error('加载员工列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (employee: Employee) => {
    onSelect(employee);
    onOpenChange(false);
    setSearchQuery('');
    setSelectedId(null);
  };

  const handleConfirm = () => {
    if (selectedId) {
      const employee = employees.find(e => e.id === selectedId);
      if (employee) {
        handleSelect(employee);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>选择员工</DialogTitle>
        </DialogHeader>

        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索工号或姓名..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* 员工列表 */}
        <div className="flex-1 overflow-y-auto min-h-[300px] mt-4 border rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              加载中...
            </div>
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 py-8">
              <User className="h-12 w-12 mb-2 text-gray-300" />
              <p>未找到匹配的员工</p>
              <p className="text-sm mt-1">请尝试其他关键词</p>
            </div>
          ) : (
            <div className="divide-y">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedId === employee.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => setSelectedId(employee.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{employee.name}</span>
                          <Badge
                            variant={employee.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {employee.status === 'active' ? '在职' : '离职'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          工号：{employee.employee_no}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {employee.region}
                          </span>
                          <span>{employee.department || '-'}</span>
                          <span>{employee.position || '-'}</span>
                        </div>
                      </div>
                    </div>
                    {selectedId === employee.id && (
                      <Check className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部操作按钮 */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            共找到 {employees.length} 位员工
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setSearchQuery('');
                setSelectedId(null);
              }}
            >
              取消
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedId}
            >
              确认选择
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
