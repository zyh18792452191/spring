const parser = require('@babel/parser');
const traverse = require('@babel/traverse');
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const { readFileSync, writeFileSync, existsSync } = require('fs');
const path = require('path');

console.log('Page Editor Utils - 模块导入成功');
console.log('parser:', typeof parser);
console.log('traverse:', typeof traverse);
console.log('generate:', typeof generate);
console.log('t:', typeof t);

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

/**
 * 根据页面路径获取源文件路径
 */
function getSourceFilePath(pagePath: string): string {
  // 验证输入
  if (!pagePath || typeof pagePath !== 'string') {
    console.error('无效的页面路径:', pagePath);
    throw new Error(`无效的页面路径: ${pagePath}`);
  }

  // 自动映射：将页面路径转换为文件路径
  // 例如：/workspace/analytics -> src/app/workspace/analytics/page.tsx

  // 特殊映射（某些页面可能有不同的文件名）
  const specialMappings: Record<string, string> = {
    '/': 'src/app/page.tsx',
    '/page-editor-demo': 'src/app/page-editor-demo/page.tsx',
  };

  // 检查是否有特殊映射
  if (specialMappings[pagePath]) {
    return path.join(process.cwd(), specialMappings[pagePath]);
  }

  // 默认映射规则
  let filePath: string;

  if (pagePath === '/') {
    filePath = 'src/app/page.tsx';
  } else {
    // 移除开头的 /，替换为 src/app/
    const normalizedPath = pagePath.replace(/^\//, '');
    filePath = `src/app/${normalizedPath}/page.tsx`;
  }

  const fullPath = path.join(process.cwd(), filePath);

  console.log('页面路径映射:', { pagePath, filePath, fullPath });

  return fullPath;
}

/**
 * 解析源文件为AST
 */
function parseSourceFile(filePath: string): any {
  // 检查文件是否存在
  if (!existsSync(filePath)) {
    throw new Error(`源文件不存在: ${filePath}`);
  }

  const sourceCode = readFileSync(filePath, 'utf-8');
  return parser.parse(sourceCode, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });
}

/**
 * 根据className或id匹配JSX元素
 */
function matchJSXElement(
  node: any,
  selector: string,
  elementType: 'className' | 'id'
): boolean {
  const openingElement = node.openingElement;

  // 查找 className 或 id 属性
  const classNameAttr = openingElement.attributes.find((attr: any) =>
    t.isJSXAttribute(attr) && attr.name.name === elementType
  );

  if (!classNameAttr) return false;

  let attributeValue = '';
  if (t.isStringLiteral((classNameAttr as any).value)) {
    attributeValue = (classNameAttr as any).value.value;
  }

  // 简单匹配：selector如果是 #id，匹配id属性；如果是 .class，匹配className
  if (selector.startsWith('#') && elementType === 'id') {
    return selector.slice(1) === attributeValue;
  } else if (selector.startsWith('.') && elementType === 'className') {
    // 对于className，匹配是否包含该class
    return attributeValue.includes(selector.slice(1));
  }

  return false;
}

/**
 * 在AST中查找匹配的JSX元素
 */
function findJSXElementBySelector(
  ast: any,
  selector: string
): any | null {
  let foundElement: any | null = null;

  traverse.default(ast, {
    JSXElement(path: any) {
      if (foundElement) return; // 已经找到，跳过

      const node = path.node;

      // 尝试通过id匹配
      if (selector.startsWith('#')) {
        if (matchJSXElement(node, selector, 'id')) {
          foundElement = node;
        }
      }
      // 尝试通过className匹配
      else if (selector.startsWith('.')) {
        if (matchJSXElement(node, selector, 'className')) {
          foundElement = node;
        }
      }
    },
  });

  return foundElement;
}

/**
 * 修改JSX元素的className
 */
function modifyJSXClassName(
  element: any,
  newClassName: string
): void {
  const openingElement = element.openingElement;

  // 查找className属性
  let classNameAttr = openingElement.attributes.find((attr: any) =>
    t.isJSXAttribute(attr) && attr.name.name === 'className'
  );

  if (t.isJSXAttribute(classNameAttr)) {
    // 更新现有的className
    (classNameAttr as any).value = t.stringLiteral(newClassName);
  } else {
    // 添加新的className属性
    openingElement.attributes.push(
      t.jsxAttribute(
        t.jsxIdentifier('className'),
        t.stringLiteral(newClassName)
      )
    );
  }
}

/**
 * 修改JSX元素的style属性
 */
function modifyJSXStyle(
  element: any,
  styleProperty: string,
  styleValue: string
): void {
  const openingElement = element.openingElement;

  // 查找style属性
  let styleAttr = openingElement.attributes.find((attr: any) =>
    t.isJSXAttribute(attr) && attr.name.name === 'style'
  );

  if (t.isJSXAttribute(styleAttr)) {
    // 如果已有style属性，这里简化处理，直接覆盖
    // 实际应用中可能需要合并现有样式
    const styleObj = `{ ${styleProperty}: '${styleValue}' }`;
    (styleAttr as any).value = t.jsxExpressionContainer(
      t.identifier(styleObj)
    );
  } else {
    // 添加新的style属性
    openingElement.attributes.push(
      t.jsxAttribute(
        t.jsxIdentifier('style'),
        t.jsxExpressionContainer(
          t.objectExpression([
            t.objectProperty(
              t.identifier(styleProperty),
              t.stringLiteral(styleValue)
            ),
          ])
        )
      )
    );
  }
}

/**
 * 修改JSX元素的文本内容
 */
function modifyJSXTextContent(
  element: any,
  newText: string
): void {
  // 查找文本节点
  for (const child of element.children) {
    if (t.isJSXText(child)) {
      child.value = newText;
      return;
    }
  }

  // 如果没有文本节点，添加一个新的
  element.children.push(t.jsxText(newText));
}

/**
 * 应用单个修改到AST
 */
function applyChangeToAST(
  ast: any,
  change: EditChange
): boolean {
  // 查找匹配的元素
  const element = findJSXElementBySelector(ast, change.selector);
  if (!element) {
    console.warn(`无法找到匹配的元素: ${change.selector}`);
    return false;
  }

  // 根据修改类型应用修改
  switch (change.type) {
    case 'attribute':
      if (change.property === 'className' || change.property === 'class') {
        modifyJSXClassName(element, change.value);
      } else {
        // 其他属性暂不支持
        console.warn(`不支持的属性修改: ${change.property}`);
        return false;
      }
      break;

    case 'style':
      modifyJSXStyle(element, change.property, change.value);
      break;

    case 'content':
      if (change.property === 'textContent') {
        modifyJSXTextContent(element, change.value);
      }
      break;

    default:
      console.warn(`不支持的修改类型: ${change.type}`);
      return false;
  }

  return true;
}

/**
 * 保存修改到源文件
 */
export function saveChangesToSource(
  changes: EditChange[],
  pagePath: string
): { success: boolean; message: string; filePath?: string } {
  try {
    console.log('=== 开始保存到源文件 ===');
    console.log('修改数量:', changes.length);
    console.log('页面路径:', pagePath);

    // 1. 获取源文件路径
    const filePath = getSourceFilePath(pagePath);
    console.log('源文件路径:', filePath);

    // 2. 解析源文件
    console.log('开始解析源文件...');
    const ast = parseSourceFile(filePath);
    console.log('AST解析成功, AST type:', ast.type);

    // 3. 应用所有修改
    let successCount = 0;
    let failCount = 0;

    for (const change of changes) {
      console.log(`应用修改: ${change.type} - ${change.property} = ${change.value}`);
      const success = applyChangeToAST(ast, change);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    console.log(`应用修改完成: 成功 ${successCount} 个, 失败 ${failCount} 个`);

    // 4. 生成新的代码
    console.log('开始生成新代码...');
    const { code } = generate(ast, {
      retainLines: true,
      retainFunctionParens: true,
    });
    console.log('代码生成成功, 长度:', code.length);

    // 5. 保存文件
    console.log('开始保存文件...');
    writeFileSync(filePath, code, 'utf-8');
    console.log('文件保存成功');

    return {
      success: true,
      message: `成功保存 ${successCount} 处修改到源文件`,
      filePath,
    };
  } catch (error) {
    console.error('保存到源文件失败:', error);
    console.error('错误堆栈:', (error as any).stack);
    return {
      success: false,
      message: `保存失败: ${error instanceof Error ? error.message : '未知错误'}`,
    };
  }
}
