'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PageEditorDemo() {
  return (
    <>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              页面编辑器演示
            </h1>
            <p className="text-gray-600">
              这是一个演示页面，展示如何使用可视化编辑器修改页面元素
            </p>
          </div>

          {/* 示例卡片 */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <h3 id="card1-title" className="text-lg font-semibold text-gray-900 mb-2">卡片 22222</h3>
              <p id="card1-desc" className="text-gray-600 text-sm">
                这是一个示例卡片，你可以点击编辑这个文本
              </p>
              <Button className="mt-4 w-full">
                点击按钮
              </Button>
            </Card>

            <Card className="p-6 bg-blue-50">
              <h3 id="card2-title" className="text-lg font-semibold text-blue-900 mb-2">卡片 22222</h3>
              <p id="card2-desc" className="text-blue-700 text-sm">
                这个卡片有不同的背景色，点击可以修改
              </p>
              <Button variant="outline" className="mt-4 w-full">
                次级按钮
              </Button>
            </Card>

            <Card className="p-6">
              <h3 id="card3-title" className="text-lg font-semibold text-green-700 mb-2">卡片 3</h3>
              <p id="card3-desc" className="text-green-600 text-sm">
                尝试修改标题的颜色和大小
              </p>
              <Button variant="ghost" className="mt-4 w-full">
                幽灵按钮
              </Button>
            </Card>
          </div>

          {/* 更多示例元素 */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="p-6">
              <h4 className="text-xl font-bold text-gray-900 mb-4">数据展示</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">指标 1</span>
                  <span className="font-semibold text-gray-900">1,234</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">指标 2</span>
                  <span className="font-semibold text-gray-900">5,678</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">指标 3</span>
                  <span className="font-semibold text-gray-900">9,012</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h4 className="text-xl font-bold text-gray-900 mb-4">功能列表</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  点击任意元素选中
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  在右侧面板修改样式
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  修改实时预览
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  点击保存按钮保存
                </li>
              </ul>
            </Card>
          </div>

          {/* 使用说明 */}
          <Card className="mt-8 p-6 bg-blue-50 border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">🎨 如何启用编辑器</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>方法1：</strong>在URL末尾添加 <code>?editor=true</code> 参数</li>
              <li>• <strong>方法2：</strong>按 <strong>Ctrl+Shift+E</strong> 或 <strong>Cmd+Shift+E</strong> 切换编辑器</li>
              <li>• 编辑器状态会保存，刷新页面后自动启用</li>
            </ul>

            <h4 className="font-semibold text-blue-900 mt-4 mb-2">✅ 功能说明</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>修改会保存到源代码文件</strong>，刷新页面后保留</li>
              <li>• 点击任意元素进行选中，右侧面板可以修改样式、内容和布局</li>
              <li>• 修改完成后点击"保存"按钮保存到源文件</li>
              <li>• 支持修改：颜色、字体、文本内容、边距、圆角等</li>
              <li>• <strong>仅支持修改有唯一 id 的元素</strong>（className可能匹配不准确）</li>
            </ul>
          </Card>
        </div>
      </div>
    </>);

}