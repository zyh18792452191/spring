'use client';

import { X, Phone, Mail, Building2, User, Calendar, CheckCircle, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { getOrganizationPath } from '@/lib/staff-management/organization-data';

interface StaffDetailDialogProps {
  staff: {
    id: string;
    employee_no: string;
    name: string;
    region: string;
    department: string;
    position: string;
    phone: string;
    email: string;
    status: string;
    account_4a: string;
    account_oa: string;
    account_provincial: string;
    business_scenarios?: string[];
    tags?: string[];
    created_at: string;
    updated_at: string;
    created_by: string;
    updated_by: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StaffDetailDialog({ staff, open, onOpenChange }: StaffDetailDialogProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 构建组织ID：如果有部门，则使用 region-departmentId 格式
  // 注意：数据库中 department 存储的是部门编码（如 "cunliang"），需要与省公司拼接
  const organizationId = staff.department 
    ? `${staff.region}-${staff.department}` 
    : staff.region;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto" style={{ maxWidth: '800px' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            人员详情
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 基本信息 */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              基本信息
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">手机号码</Label>
                <div className="mt-1 text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {staff.phone || '-'}
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-500">工号</Label>
                <div className="mt-1 text-sm font-mono bg-gray-50 px-2 py-1 rounded">
                  {staff.employee_no}
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-500">姓名</Label>
                <div className="mt-1 text-sm font-medium">{staff.name}</div>
              </div>
              <div>
                <Label className="text-sm text-gray-500">组织</Label>
                <div className="mt-1 text-sm">
                  {getOrganizationPath(organizationId) || staff.region}
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-500">岗位</Label>
                <div className="mt-1 text-sm">{staff.position || '-'}</div>
              </div>
              <div>
                <Label className="text-sm text-gray-500">状态</Label>
                <div className="mt-1">
                  <Badge variant={staff.status === 'active' ? 'default' : 'secondary'}>
                    {staff.status === 'active' ? '在职' : '离职'}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-500">邮箱</Label>
                <div className="mt-1 text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {staff.email || '-'}
                </div>
              </div>
            </div>
          </div>

          {/* 账号信息 */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              账号信息
            </h3>
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-gray-500">4A账号</Label>
                <div className="mt-1 text-sm">
                  {staff.account_4a ? (
                    <span className="font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded">
                      {staff.account_4a}
                    </span>
                  ) : (
                    <span className="text-gray-400">未配置</span>
                  )}
                  <span className="ml-2 text-xs text-gray-500">
                    {staff.account_4a ? '（非必填，该省公司在集团无账号）' : '（非必填，该省公司在集团无账号）'}
                  </span>
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-500">OA账号</Label>
                <div className="mt-1 text-sm">
                  {staff.account_oa ? (
                    <span className="font-mono bg-green-50 text-green-700 px-2 py-1 rounded">
                      {staff.account_oa}
                    </span>
                  ) : (
                    <span className="text-red-500">未配置（必填）</span>
                  )}
                  <span className="ml-2 text-xs text-gray-500">
                    （必填，派单时需要通过调度中心派到省OA）
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 标签 */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              标签
            </h3>
            <div className="flex flex-wrap gap-2">
              {staff.tags && staff.tags.length > 0 ? (
                staff.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-sm">
                    {tag}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-400 text-sm">未配置</span>
              )}
            </div>
          </div>

          {/* 创建和更新信息 */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              系统信息
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">创建时间</Label>
                <div className="mt-1 text-xs">{formatDate(staff.created_at)}</div>
              </div>
              <div>
                <Label className="text-sm text-gray-500">创建人</Label>
                <div className="mt-1 text-sm">{staff.created_by || '-'}</div>
              </div>
              <div>
                <Label className="text-sm text-gray-500">更新时间</Label>
                <div className="mt-1 text-xs">{formatDate(staff.updated_at)}</div>
              </div>
              <div>
                <Label className="text-sm text-gray-500">更新人</Label>
                <div className="mt-1 text-sm">{staff.updated_by || '-'}</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
