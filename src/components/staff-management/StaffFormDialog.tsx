"use client";

import { useState, useEffect } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import TagSelect from './TagSelect';
import { getOrganizationPath } from '@/lib/staff-management/organization-data';

interface StaffFormData {
  employeeNo: string;
  name: string;
  organizationId: string; // 组织ID（合并原organization和department）
  position: string;
  phone: string;
  email: string;
  status: string;
  account4a: string;
  accountOa: string;
  accountProvincial: string;
  tags: string[];
  isDefaultReceiver: boolean;
}

interface StaffFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StaffFormData) => Promise<void>;
  initialData?: StaffFormData;
  isEdit?: boolean;
}

const POSITIONS = ['运营总监', '运营经理', '运营主管', '运营专员', '市场专员', '技术专员'];
const STATUSES = ['active', 'inactive'];

export default function StaffFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isEdit = false,
}: StaffFormDialogProps) {
  const [formData, setFormData] = useState<StaffFormData>({
    employeeNo: '',
    name: '',
    organizationId: '',
    position: '',
    phone: '',
    email: '',
    status: 'active',
    account4a: '',
    accountOa: '',
    accountProvincial: '',
    tags: [],
    isDefaultReceiver: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof StaffFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchingPhone, setSearchingPhone] = useState(false);
  const [showPhoneSearchDialog, setShowPhoneSearchDialog] = useState(false);
  const [searchPhoneValue, setSearchPhoneValue] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        employeeNo: '',
        name: '',
        organizationId: '',
        position: '',
        phone: '',
        email: '',
        status: 'active',
        account4a: '',
        accountOa: '',
        accountProvincial: '',
        tags: [],
        isDefaultReceiver: false,
      });
    }
    setErrors({});
  }, [initialData, open]);

  const validate = () => {
    const newErrors: Partial<Record<keyof StaffFormData, string>> = {};

    // 工号通过手机号搜索自动填充
    if (!formData.employeeNo.trim()) {
      newErrors.employeeNo = '请先通过手机号搜索员工';
    }
    // 姓名、组织、岗位、邮箱、状态、4A账号、OA账号通过手机号搜索自动填充，不需要验证
    if (!formData.phone.trim()) {
      newErrors.phone = '手机号不能为空';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '手机号格式不正确';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('提交失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof StaffFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // 手机号搜索员工列表
  const handleSearchByPhone = async () => {
    if (!searchPhoneValue.trim()) {
      setSearchError('请输入手机号');
      return;
    }

    setSearchError('');
    setSearchResults([]); // 先清空之前的结果
    setSearchingPhone(true);
    try {
      console.log('开始搜索，手机号:', searchPhoneValue);
      const response = await fetch(`/api/staff-management/search-by-phone?phone=${searchPhoneValue}`);
      const result = await response.json();
      console.log('搜索结果:', result);

      if (result.success && result.data) {
        setSearchResults(result.data);
        if (result.data.length === 0) {
          setSearchError('未找到该手机号的员工信息');
        } else {
          console.log('设置搜索结果，数量:', result.data.length);
        }
      } else {
        setSearchError('未找到该手机号的员工信息');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('搜索失败:', error);
      setSearchError('搜索失败，请重试');
      setSearchResults([]);
    } finally {
      setSearchingPhone(false);
    }
  };

  // 选择员工并填充表单
  const handleSelectEmployee = (employee: any) => {
    setFormData(prev => ({
      ...prev,
      phone: employee.phone,
      name: employee.name,
      employeeNo: employee.employee_no,
      department: employee.department || '',
      position: employee.position || '',
      email: employee.email || '',
      status: employee.status || 'active',
      account4a: employee.account_4a || '',
      accountOa: employee.account_oa || '',
    }));
    setShowPhoneSearchDialog(false);
    setSearchResults([]);
    setSearchPhoneValue('');
    setSearchError('');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto" style={{ maxWidth: '800px' }}>
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑人员' : '新增人员'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '修改人员信息' : '添加新的运营人员信息'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                手机号 <span className="text-red-500">*</span>
                {!isEdit && <span className="text-gray-500 text-xs ml-2">(点击搜索按钮输入手机号)</span>}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  placeholder="点击右侧搜索按钮"
                  readOnly
                  disabled={isEdit}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {!isEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowPhoneSearchDialog(true)}
                    title="通过手机号搜索员工"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeNo">
                工号 <span className="text-gray-500 text-xs">(通过手机号搜索自动填充)</span>
              </Label>
              <Input
                id="employeeNo"
                value={formData.employeeNo}
                placeholder="请先通过手机号搜索"
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                姓名 <span className="text-gray-500 text-xs">(通过手机号搜索自动填充)</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                placeholder="请先通过手机号搜索"
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationId">
                组织 <span className="text-gray-500 text-xs">(通过手机号搜索自动填充)</span>
              </Label>
              <Input
                id="organizationId"
                value={formData.organizationId ? getOrganizationPath(formData.organizationId) : ''}
                placeholder="请先通过手机号搜索"
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">
                岗位 <span className="text-gray-500 text-xs">(通过手机号搜索自动填充)</span>
              </Label>
              <Input
                id="position"
                value={formData.position}
                placeholder="请先通过手机号搜索"
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                邮箱 <span className="text-gray-500 text-xs">(通过手机号搜索自动填充)</span>
              </Label>
              <Input
                id="email"
                value={formData.email}
                placeholder="请先通过手机号搜索"
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">
                状态 <span className="text-gray-500 text-xs">(通过手机号搜索自动填充)</span>
              </Label>
              <Input
                id="status"
                value={formData.status === 'active' ? '在职' : '离职'}
                placeholder="请先通过手机号搜索"
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account4a">
                4A账号 <span className="text-gray-500 text-xs">(通过手机号搜索自动填充)</span>
              </Label>
              <Input
                id="account4a"
                value={formData.account4a}
                placeholder="请先通过手机号搜索"
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountOa">
                OA账号 <span className="text-gray-500 text-xs">(通过手机号搜索自动填充)</span>
              </Label>
              <Input
                id="accountOa"
                value={formData.accountOa}
                placeholder="请先通过手机号搜索"
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isDefaultReceiver">默认工单接收人</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefaultReceiver"
                  checked={formData.isDefaultReceiver}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, isDefaultReceiver: e.target.checked }));
                    if (errors.isDefaultReceiver) {
                      setErrors(prev => ({ ...prev, isDefaultReceiver: undefined }));
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                <label htmlFor="isDefaultReceiver" className="text-sm text-gray-600">
                  设为默认接收人后，在工单调度派发时会被优先展示
                </label>
              </div>
            </div>
          </div>

          {/* 标签选择 */}
          <div className="space-y-2">
            <Label htmlFor="tags">
              标签
            </Label>
            <TagSelect
              value={formData.tags}
              onChange={(value) => handleChange('tags', value as any)}
            />
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? '提交中...' : isEdit ? '保存' : '新增'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* 手机号搜索弹窗 */}
    <Dialog open={showPhoneSearchDialog} onOpenChange={setShowPhoneSearchDialog}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>通过手机号搜索员工</DialogTitle>
          <DialogDescription>
            输入手机号搜索员工列表，点击员工即可自动填充到表单中
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="searchPhone">手机号</Label>
            <div className="flex gap-2">
              <Input
                id="searchPhone"
                value={searchPhoneValue}
                onChange={(e) => setSearchPhoneValue(e.target.value)}
                placeholder="请输入手机号"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchPhoneValue.trim()) {
                    handleSearchByPhone();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleSearchByPhone}
                disabled={searchingPhone || !searchPhoneValue.trim()}
              >
                {searchingPhone ? '搜索中...' : '搜索'}
              </Button>
            </div>
          </div>

          {searchError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{searchError}</AlertDescription>
            </Alert>
          )}

          {searchResults.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 text-sm font-medium">
                找到 {searchResults.length} 条员工信息
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">工号</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">姓名</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">手机号</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">部门</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">岗位</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">状态</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((employee) => (
                      <tr key={employee.id} className="border-t hover:bg-gray-50 cursor-pointer">
                        <td className="px-4 py-3 text-sm font-mono">{employee.employee_no}</td>
                        <td className="px-4 py-3 text-sm font-medium">{employee.name}</td>
                        <td className="px-4 py-3 text-sm">{employee.phone}</td>
                        <td className="px-4 py-3 text-sm">{employee.department || '-'}</td>
                        <td className="px-4 py-3 text-sm">{employee.position || '-'}</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge
                            variant={employee.status === 'active' ? 'default' : 'destructive'}
                            className={employee.status === 'inactive' ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''}
                          >
                            {employee.status === 'active' ? '在职' : '离职'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Button
                            size="sm"
                            onClick={() => handleSelectEmployee(employee)}
                          >
                            选择
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            setShowPhoneSearchDialog(false);
            setSearchResults([]);
            setSearchPhoneValue('');
            setSearchError('');
          }}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
