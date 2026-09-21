'use client';

import { useState } from 'react';
import { ArrowLeft, Clock, User, Calendar, FileText, AlertCircle, CheckCircle, TrendingUp, MessageSquare, Download, MoreHorizontal, ChevronRight, Phone, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WorkOrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const workOrderId = params.id;

  // 模拟工单数据
  const workOrder = {
    id: workOrderId,
    title: '离网客户价值保有率提升',
    status: 'timeout',
    statusText: '已超时',
    priority: 'high',
    priorityText: '高',
    initiator: '张三',
    createTime: '2024-01-31 14:30',
    deadline: '2024-02-05 18:00',
    assignee: '李四',
    department: '市场运营部',
    description: '针对离网客户价值保有率下降的情况，需要制定提升策略并执行相关营销活动。',
    progress: 75,
    timeline: [
      { id: 1, title: '工单创建', time: '2024-01-31 14:30', status: 'completed' },
      { id: 2, title: '需求分析', time: '2024-02-01 10:00', status: 'completed' },
      { id: 3, title: '策略制定', time: '2024-02-02 15:00', status: 'completed' },
      { id: 4, title: '审批流程', time: '2024-02-03 09:00', status: 'completed' },
      { id: 5, title: '执行实施', time: '2024-02-04 10:00', status: 'inProgress' },
      { id: 6, title: '效果评估', time: '2024-02-06 14:00', status: 'pending' },
    ],
  };

  const comments = [
    { id: 1, user: '张三', time: '2024-01-31 14:30', content: '工单已创建，请尽快处理。' },
    { id: 2, user: '李四', time: '2024-02-01 10:15', content: '收到，正在进行需求分析。' },
    { id: 3, user: '李四', time: '2024-02-02 16:00', content: '策略方案已制定，等待审批。' },
  ];

  const [activeTab, setActiveTab] = useState('timeline');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/workspace')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">工单详情</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
              <Download className="w-4 h-4" />
              导出
            </button>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：工单信息 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 工单基本信息 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">{workOrder.title}</h2>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-sm font-medium rounded ${
                      workOrder.status === 'timeout' ? 'bg-red-100 text-red-700' :
                      workOrder.status === 'completed' ? 'bg-green-100 text-green-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {workOrder.statusText}
                    </span>
                    <span className={`px-3 py-1 text-sm font-medium rounded ${
                      workOrder.priority === 'high' ? 'bg-red-100 text-red-700' :
                      workOrder.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      优先级：{workOrder.priorityText}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                    处理工单
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <User className="w-4 h-4" />
                    发起人
                  </div>
                  <div className="text-sm font-medium text-gray-900">{workOrder.initiator}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Calendar className="w-4 h-4" />
                    创建时间
                  </div>
                  <div className="text-sm font-medium text-gray-900">{workOrder.createTime}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Clock className="w-4 h-4" />
                    截止时间
                  </div>
                  <div className={`text-sm font-medium ${workOrder.status === 'timeout' ? 'text-red-600' : 'text-gray-900'}`}>
                    {workOrder.deadline}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <FileText className="w-4 h-4" />
                    责任部门
                  </div>
                  <div className="text-sm font-medium text-gray-900">{workOrder.department}</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-500 mb-2">工单描述</div>
                <p className="text-sm text-gray-700 leading-relaxed">{workOrder.description}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-500 mb-2">处理进度</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${workOrder.progress}%` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{workOrder.progress}%</span>
                </div>
              </div>
            </div>

            {/* 时间线 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">处理时间线</h3>
              <div className="space-y-4">
                {workOrder.timeline.map((item, index) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        item.status === 'completed' ? 'bg-green-500' :
                        item.status === 'inProgress' ? 'bg-blue-500' :
                        'bg-gray-300'
                      }`} />
                      {index < workOrder.timeline.length - 1 && (
                        <div className={`w-0.5 h-12 ${
                          item.status === 'completed' ? 'bg-green-200' :
                          'bg-gray-200'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-900">{item.title}</div>
                        <div className="text-xs text-gray-500">{item.time}</div>
                      </div>
                      {item.status === 'inProgress' && (
                        <div className="mt-1 text-xs text-blue-600">进行中</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：评论和附件 */}
          <div className="space-y-6">
            {/* 处理人信息 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">处理人</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{workOrder.assignee}</div>
                  <div className="text-xs text-gray-500">主要责任人</div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                  <Phone className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                  <Mail className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* 评论区 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">评论</h3>
              <div className="space-y-4 mb-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-900">{comment.user}</div>
                        <div className="text-xs text-gray-500">{comment.time}</div>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <textarea
                    placeholder="添加评论..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <div className="flex items-center justify-end mt-2">
                    <button className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                      发送
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
