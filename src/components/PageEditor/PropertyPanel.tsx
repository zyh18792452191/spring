'use client';

import { useState, useEffect } from 'react';
import {
  X, Save, Type, Palette, Layout, AlignCenter, Image, Link as LinkIcon, Hash
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ElementInfo {
  element: HTMLElement;
  tagName: string;
  className: string;
  styles: CSSStyleDeclaration;
  attributes: Record<string, string>;
  bounds: DOMRect;
}

interface PropertyPanelProps {
  element: ElementInfo;
  onUpdateStyle: (property: string, value: string) => void;
  onUpdateAttribute: (name: string, value: string) => void;
  onUpdateContent: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function PropertyPanel({
  element,
  onUpdateStyle,
  onUpdateAttribute,
  onUpdateContent,
  onClose,
  onSave,
}: PropertyPanelProps) {
  const [activeTab, setActiveTab] = useState<'style' | 'content' | 'layout'>('style');
  const [textColor, setTextColor] = useState(element.styles.color);
  const [backgroundColor, setBackgroundColor] = useState(element.styles.backgroundColor);
  const [fontSize, setFontSize] = useState(element.styles.fontSize);
  const [fontWeight, setFontWeight] = useState(element.styles.fontWeight);
  const [textAlign, setTextAlign] = useState(element.styles.textAlign);
  const [padding, setPadding] = useState(element.styles.padding);
  const [margin, setMargin] = useState(element.styles.margin);
  const [borderRadius, setBorderRadius] = useState(element.styles.borderRadius);
  const [textContent, setTextContent] = useState(element.element.textContent || '');

  // 挂载时输出日志
  useEffect(() => {
    console.log('PropertyPanel 挂载:', {
      tagName: element.tagName,
      hasElement: !!element.element,
      elementId: element.element.id,
      elementClass: element.className,
    });
  }, [element]);

  // 预定义颜色
  const predefinedColors = [
    { name: '中国移动蓝', value: '#0085D0' },
    { name: '浅蓝', value: '#60B3E2' },
    { name: '极浅蓝', value: '#C0E1F3' },
    { name: '红色', value: '#EF4444' },
    { name: '绿色', value: '#10B981' },
    { name: '黄色', value: '#F59E0B' },
    { name: '灰色', value: '#6B7280' },
    { name: '黑色', value: '#111827' },
    { name: '白色', value: '#FFFFFF' },
    { name: '透明', value: 'transparent' },
  ];

  // 更新文本内容
  const handleTextContentChange = (value: string) => {
    console.log('handleTextContentChange 被调用:', value);
    setTextContent(value);
    element.element.textContent = value;
    onUpdateContent(value);
  };

  // 应用颜色
  const handleColorChange = (property: string, value: string) => {
    console.log('PropertyPanel handleColorChange 被调用:', { property, value });
    if (property === 'color') {
      setTextColor(value);
    } else if (property === 'backgroundColor') {
      setBackgroundColor(value);
    }
    onUpdateStyle(property, value);
  };

  return (
    <div className="fixed top-20 right-4 z-[9999] w-96 editor-panel">
      <Card className="shadow-2xl">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="font-semibold text-gray-900">
              &lt;{element.tagName}&gt;
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('PropertyPanel 保存按钮被点击');
                onSave();
              }}
            >
              <Save className="h-4 w-4 mr-1" />
              保存
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log('PropertyPanel 关闭按钮被点击');
                onClose();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 内容标签页 */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
            <TabsTrigger value="style" className="flex items-center gap-1">
              <Palette className="h-3 w-3" />
              样式
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-1">
              <Type className="h-3 w-3" />
              内容
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-1">
              <Layout className="h-3 w-3" />
              布局
            </TabsTrigger>
          </TabsList>

          {/* 样式标签 */}
          <TabsContent value="style" className="p-4 space-y-4">
            {/* 文字颜色 */}
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-2 block">
                文字颜色
              </Label>
              <div className="grid grid-cols-5 gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color.value}
                    className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: color.value,
                      borderColor: textColor === color.value ? '#0085D0' : '#E5E7EB',
                    }}
                    onClick={() => handleColorChange('color', color.value)}
                    title={color.name}
                  />
                ))}
              </div>
              <Input
                type="color"
                value={textColor}
                onChange={(e) => handleColorChange('color', e.target.value)}
                className="mt-2 h-8"
              />
            </div>

            {/* 背景颜色 */}
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-2 block">
                背景颜色
              </Label>
              <div className="grid grid-cols-5 gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={`bg-${color.value}`}
                    className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: color.value,
                      borderColor: backgroundColor === color.value ? '#0085D0' : '#E5E7EB',
                    }}
                    onClick={() => handleColorChange('backgroundColor', color.value)}
                    title={color.name}
                  />
                ))}
              </div>
              <Input
                type="color"
                value={backgroundColor}
                onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                className="mt-2 h-8"
              />
            </div>

            {/* 字体大小 */}
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-2 block">
                字体大小
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={fontSize}
                  onChange={(e) => {
                    console.log('字体大小输入改变:', e.target.value);
                    setFontSize(e.target.value);
                    onUpdateStyle('fontSize', e.target.value);
                  }}
                  className="flex-1"
                />
                <Select
                  value={fontSize}
                  onValueChange={(v) => {
                    console.log('字体大小选择改变:', v);
                    setFontSize(v);
                    onUpdateStyle('fontSize', v);
                  }}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12px">12px</SelectItem>
                    <SelectItem value="14px">14px</SelectItem>
                    <SelectItem value="16px">16px</SelectItem>
                    <SelectItem value="18px">18px</SelectItem>
                    <SelectItem value="20px">20px</SelectItem>
                    <SelectItem value="24px">24px</SelectItem>
                    <SelectItem value="32px">32px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 字体粗细 */}
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-2 block">
                字体粗细
              </Label>
              <Select
                value={fontWeight}
                onValueChange={(v) => {
                  setFontWeight(v);
                  onUpdateStyle('fontWeight', v);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="300">细体 (300)</SelectItem>
                  <SelectItem value="400">正常 (400)</SelectItem>
                  <SelectItem value="500">中等 (500)</SelectItem>
                  <SelectItem value="600">粗体 (600)</SelectItem>
                  <SelectItem value="700">特粗 (700)</SelectItem>
                  <SelectItem value="800">超粗 (800)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* 内容标签 */}
          <TabsContent value="content" className="p-4 space-y-4">
            {element.element.textContent !== null && (
              <div>
                <Label className="text-xs font-medium text-gray-700 mb-2 block">
                  文本内容
                </Label>
                <textarea
                  value={textContent}
                  onChange={(e) => handleTextContentChange(e.target.value)}
                  className="w-full h-32 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="输入文本内容..."
                />
              </div>
            )}

            {/* 元素ID */}
            {element.element.id && (
              <div>
                <Label className="text-xs font-medium text-gray-700 mb-2 block">
                  元素ID
                </Label>
                <Input
                  value={element.element.id}
                  onChange={(e) => onUpdateAttribute('id', e.target.value)}
                  className="text-sm"
                />
              </div>
            )}

            {/* 元素class */}
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-2 block">
                CSS Class
              </Label>
              <Input
                value={element.className}
                onChange={(e) => onUpdateAttribute('class', e.target.value)}
                className="text-sm"
                placeholder="输入class名称..."
              />
            </div>
          </TabsContent>

          {/* 布局标签 */}
          <TabsContent value="layout" className="p-4 space-y-4">
            {/* 文本对齐 */}
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-2 block">
                文本对齐
              </Label>
              <div className="flex gap-2">
                {[
                  { value: 'left', icon: '←' },
                  { value: 'center', icon: '↔' },
                  { value: 'right', icon: '→' },
                ].map((align) => (
                  <button
                    key={align.value}
                    className={`flex-1 py-2 px-3 rounded border text-sm font-medium transition-colors ${
                      textAlign === align.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setTextAlign(align.value);
                      onUpdateStyle('textAlign', align.value);
                    }}
                  >
                    {align.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* 内边距 */}
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-2 block">
                内边距 (Padding)
              </Label>
              <Input
                type="text"
                value={padding}
                onChange={(e) => {
                  setPadding(e.target.value);
                  onUpdateStyle('padding', e.target.value);
                }}
                placeholder="例如: 16px 或 8px 16px"
                className="text-sm"
              />
            </div>

            {/* 外边距 */}
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-2 block">
                外边距 (Margin)
              </Label>
              <Input
                type="text"
                value={margin}
                onChange={(e) => {
                  setMargin(e.target.value);
                  onUpdateStyle('margin', e.target.value);
                }}
                placeholder="例如: 16px 或 8px 16px"
                className="text-sm"
              />
            </div>

            {/* 圆角 */}
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-2 block">
                圆角 (Border Radius)
              </Label>
              <Input
                type="text"
                value={borderRadius}
                onChange={(e) => {
                  setBorderRadius(e.target.value);
                  onUpdateStyle('borderRadius', e.target.value);
                }}
                placeholder="例如: 8px 或 50%"
                className="text-sm"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* 底部操作栏 */}
        <div className="p-3 border-t bg-gray-50 rounded-b-lg">
          <div className="text-xs text-gray-500">
            元素尺寸: {Math.round(element.bounds.width)} × {Math.round(element.bounds.height)} px
          </div>
        </div>
      </Card>
    </div>
  );
}
