import { NextRequest, NextResponse } from 'next/server';

/**
 * 4A票据透传 API
 * 
 * 后端调用4A CreateAiuapTokenSoap申请Token
 * SOAP协议 + 3DES加密
 * 
 * 前置条件：
 * 1. 运营平台已在4A系统注册（获取ACCT/PWD）
 * 2. 确认精益平台4A的SERVICEID
 * 3. 网络策略已开通（运营平台↔4A）
 * 
 * 当前为接口占位，4A联调时替换为真实SOAP调用
 */

// 4A配置（应从环境变量读取，勿硬编码）
const A4_CONFIG = {
  // SOAP端点
  createTokenUrl: process.env.A4_CREATE_TOKEN_URL || '',
  // 运营平台4A注册账号
  acct: process.env.A4_ACCT || '',
  // 运营平台4A注册密码（3DES加密后的密文）
  pwd: process.env.A4_PWD || '',
  // 精益平台SERVICEID
  serviceId: process.env.A4_LEAN_SERVICE_ID || '',
  // 3DES密钥
  desKey: process.env.A4_3DES_KEY || '',
};

interface SsoRequestBody {
  path?: string;
}

interface SsoResponse {
  code: number;
  message: string;
  token?: string;
  appId?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<SsoResponse>> {
  try {
    const body: SsoRequestBody = await request.json();
    const targetPath = body.path || '';

    // 校验4A配置
    if (!A4_CONFIG.createTokenUrl || !A4_CONFIG.acct || !A4_CONFIG.pwd) {
      return NextResponse.json({
        code: -1,
        message: '4A配置缺失，请检查环境变量：A4_CREATE_TOKEN_URL / A4_ACCT / A4_PWD',
      }, { status: 500 });
    }

    if (!A4_CONFIG.serviceId) {
      return NextResponse.json({
        code: -1,
        message: '精益平台SERVICEID未配置，请检查环境变量：A4_LEAN_SERVICE_ID',
      }, { status: 500 });
    }

    // TODO: 4A联调时替换为真实SOAP调用
    // 以下为4A CreateAiuapTokenSoap调用的伪代码逻辑：
    //
    // 1. 构造SOAP请求体
    // const soapEnvelope = `
    //   <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    //                     xmlns:aiu="http://aiuap.chinamobile.com/">
    //     <soapenv:Header/>
    //     <soapenv:Body>
    //       <aiu:CreateAiuapTokenSoap>
    //         <aiu:ACCT>${A4_CONFIG.acct}</aiu:ACCT>
    //         <aiu:PWD>${A4_CONFIG.pwd}</aiu:PWD>
    //         <aiu:SERVICEID>${A4_CONFIG.serviceId}</aiu:SERVICEID>
    //         <aiu:IP>${clientIp}</aiu:IP>
    //       </aiu:CreateAiuapTokenSoap>
    //     </soapenv:Body>
    //   </soapenv:Envelope>
    // `;
    //
    // 2. 发送SOAP请求
    // const response = await fetch(A4_CONFIG.createTokenUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'text/xml; charset=utf-8' },
    //   body: soapEnvelope,
    // });
    //
    // 3. 解析XML响应
    // const xml = await response.text();
    // 解析RSP字段判断是否成功（RSP=0成功，其他失败）
    // 解析TOKEN和APPACCTID字段
    //
    // 4. 返回Token给前端

    // 临时返回：4A联调前返回模拟提示
    return NextResponse.json({
      code: -2,
      message: '4A票据透传接口待联调，请联系4A管理员完成配置后启用。当前为占位响应。',
    });

    // 联调完成后的正常返回格式：
    // return NextResponse.json({
    //   code: 0,
    //   message: 'success',
    //   token: parsedToken,
    //   appId: parsedAppAcctId,
    // });

  } catch (error) {
    console.error('[SSO] 4A Token申请异常:', error);
    return NextResponse.json({
      code: -1,
      message: error instanceof Error ? error.message : '4A Token申请异常',
    }, { status: 500 });
  }
}
