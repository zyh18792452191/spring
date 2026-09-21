import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * POST /api/scenarios/initialize
 * 初始化业务场景数据
 *
 * 如果数据库中没有业务场景数据，则插入预定义的业务场景数据
 */
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 检查是否已有数据
    const { data: existingScenarios, error: checkError } = await client
      .from('business_scenarios')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking existing scenarios:', checkError);
      return NextResponse.json(
        {
          success: false,
          error: checkError.message,
        },
        { status: 500 }
      );
    }

    if (existingScenarios && existingScenarios.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Business scenarios already initialized',
        data: {
          count: existingScenarios.length,
        },
      });
    }

    // 定义业务场景数据（与模板创建页面中的三级选项一致）
    // 使用清晰的层级结构，避免编码冲突
    const scenariosData = [
      // === 公众市场 ===
      {
        scenario_code: 'PUBLIC_MARKET_L1',
        scenario_name: '公众市场',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 1,
        parent_scenario_id: null,
        sort_order: 1,
        status: 'active',
        description: '公众市场业务场景',
      },
      // 公众市场二级
      {
        scenario_code: 'PUBLIC_MARKET_OPERATION_L2',
        scenario_name: '市场运营',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 2,
        parent_scenario_id: null,
        sort_order: 1,
        status: 'active',
        description: '市场运营业务场景',
      },
      {
        scenario_code: 'PUBLIC_CUSTOMER_OPERATION_L2',
        scenario_name: '客户运营',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 2,
        parent_scenario_id: null,
        sort_order: 2,
        status: 'active',
        description: '客户运营业务场景',
      },
      {
        scenario_code: 'PUBLIC_PRODUCT_OPERATION_L2',
        scenario_name: '产品运营',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 2,
        parent_scenario_id: null,
        sort_order: 3,
        status: 'active',
        description: '产品运营业务场景',
      },
      {
        scenario_code: 'PUBLIC_CHANNEL_OPERATION_L2',
        scenario_name: '渠道运营',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 2,
        parent_scenario_id: null,
        sort_order: 4,
        status: 'active',
        description: '渠道运营业务场景',
      },
      {
        scenario_code: 'PUBLIC_INTERNATIONAL_OPERATION_L2',
        scenario_name: '国际运营',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 2,
        parent_scenario_id: null,
        sort_order: 5,
        status: 'active',
        description: '国际运营业务场景',
      },
      {
        scenario_code: 'PUBLIC_SEGMENT_MARKET_L2',
        scenario_name: '细分市场运营',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 2,
        parent_scenario_id: null,
        sort_order: 6,
        status: 'active',
        description: '细分市场运营业务场景',
      },
      // 市场运营三级
      {
        scenario_code: 'PUBLIC_MARKET_OPERATION_MARKET_L3',
        scenario_name: '市场运营',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 1,
        status: 'active',
        description: '市场运营子场景',
      },
      {
        scenario_code: 'PUBLIC_MARKET_OPERATION_NEW_SUBS_L3',
        scenario_name: '新入网',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 2,
        status: 'active',
        description: '新入网子场景',
      },
      {
        scenario_code: 'PUBLIC_MARKET_OPERATION_GROUP_CUSTOMERS_L3',
        scenario_name: '集团成员客户',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 3,
        status: 'active',
        description: '集团成员客户子场景',
      },
      // 客户运营三级
      {
        scenario_code: 'PUBLIC_CUSTOMER_OPERATION_CUSTOMER_L3',
        scenario_name: '客户运营',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 1,
        status: 'active',
        description: '客户运营子场景',
      },
      {
        scenario_code: 'PUBLIC_CUSTOMER_OPERATION_MID_HIGH_END_L3',
        scenario_name: '中高端',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 2,
        status: 'active',
        description: '中高端子场景',
      },
      {
        scenario_code: 'PUBLIC_CUSTOMER_OPERATION_NEW_SUBS_L3',
        scenario_name: '新入网',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 3,
        status: 'active',
        description: '新入网子场景',
      },
      {
        scenario_code: 'PUBLIC_CUSTOMER_OPERATION_GROUP_CUSTOMERS_L3',
        scenario_name: '集团成员客户',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 4,
        status: 'active',
        description: '集团成员客户子场景',
      },
      {
        scenario_code: 'PUBLIC_CUSTOMER_OPERATION_GLOBAL_L3',
        scenario_name: '全球通',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 5,
        status: 'active',
        description: '全球通子场景',
      },
      {
        scenario_code: 'PUBLIC_CUSTOMER_OPERATION_WARNING_L3',
        scenario_name: '中高端流失预警',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 6,
        status: 'active',
        description: '中高端流失预警子场景',
      },
      // 产品运营三级
      {
        scenario_code: 'PUBLIC_PRODUCT_OPERATION_PRODUCT_L3',
        scenario_name: '产品运营',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 1,
        status: 'active',
        description: '产品运营子场景',
      },
      {
        scenario_code: 'PUBLIC_PRODUCT_OPERATION_DATA_PRODUCTS_L3',
        scenario_name: '数据产品',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 2,
        status: 'active',
        description: '数据产品子场景',
      },
      {
        scenario_code: 'PUBLIC_PRODUCT_OPERATION_CONTENT_PRODUCTS_L3',
        scenario_name: '内容产品',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 3,
        status: 'active',
        description: '内容产品子场景',
      },
      // 渠道运营三级
      {
        scenario_code: 'PUBLIC_CHANNEL_OPERATION_CHANNEL_L3',
        scenario_name: '渠道运营',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 1,
        status: 'active',
        description: '渠道运营子场景',
      },
      {
        scenario_code: 'PUBLIC_CHANNEL_OPERATION_ONLINE_L3',
        scenario_name: '线上渠道',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 2,
        status: 'active',
        description: '线上渠道子场景',
      },
      {
        scenario_code: 'PUBLIC_CHANNEL_OPERATION_OFFLINE_L3',
        scenario_name: '线下渠道',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 3,
        status: 'active',
        description: '线下渠道子场景',
      },
      // 国际运营三级
      {
        scenario_code: 'PUBLIC_INTERNATIONAL_OPERATION_INTERNATIONAL_L3',
        scenario_name: '国际运营',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 1,
        status: 'active',
        description: '国际运营子场景',
      },
      {
        scenario_code: 'PUBLIC_INTERNATIONAL_OPERATION_ROAMING_L3',
        scenario_name: '漫游业务',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 2,
        status: 'active',
        description: '漫游业务子场景',
      },
      {
        scenario_code: 'PUBLIC_INTERNATIONAL_OPERATION_BUSINESS_L3',
        scenario_name: '国际业务',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 3,
        status: 'active',
        description: '国际业务子场景',
      },
      // 细分市场运营三级
      {
        scenario_code: 'PUBLIC_SEGMENT_MARKET_SEGMENT_L3',
        scenario_name: '细分市场运营',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 1,
        status: 'active',
        description: '细分市场运营子场景',
      },
      {
        scenario_code: 'PUBLIC_SEGMENT_MARKET_YOUTH_L3',
        scenario_name: '青年市场',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 2,
        status: 'active',
        description: '青年市场子场景',
      },
      {
        scenario_code: 'PUBLIC_SEGMENT_MARKET_SILVER_L3',
        scenario_name: '银发市场',
        module_code: 'PUBLIC',
        module_name: '公众市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 3,
        status: 'active',
        description: '银发市场子场景',
      },
      // === 政企市场 ===
      {
        scenario_code: 'ENTERPRISE_MARKET_L1',
        scenario_name: '政企市场',
        module_code: 'ENTERPRISE',
        module_name: '政企市场',
        level: 1,
        parent_scenario_id: null,
        sort_order: 2,
        status: 'active',
        description: '政企市场业务场景',
      },
      // === 家庭市场 ===
      {
        scenario_code: 'HOME_MARKET_L1',
        scenario_name: '家庭市场',
        module_code: 'HOME',
        module_name: '家庭市场',
        level: 1,
        parent_scenario_id: null,
        sort_order: 3,
        status: 'active',
        description: '家庭市场业务场景',
      },
      // 家庭市场二级
      {
        scenario_code: 'HOME_BROADBAND_L2',
        scenario_name: '宽带业务',
        module_code: 'HOME',
        module_name: '家庭市场',
        level: 2,
        parent_scenario_id: null,
        sort_order: 1,
        status: 'active',
        description: '宽带业务子场景',
      },
      {
        scenario_code: 'HOME_SECURITY_L2',
        scenario_name: '家庭安防',
        module_code: 'HOME',
        module_name: '家庭市场',
        level: 2,
        parent_scenario_id: null,
        sort_order: 2,
        status: 'active',
        description: '家庭安防子场景',
      },
      // 宽带业务三级
      {
        scenario_code: 'HOME_BROADBAND_BROADBAND_L3',
        scenario_name: '宽带业务',
        module_code: 'HOME',
        module_name: '家庭市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 1,
        status: 'active',
        description: '宽带业务子场景',
      },
      {
        scenario_code: 'HOME_BROADBAND_FIBER_L3',
        scenario_name: '光纤宽带',
        module_code: 'HOME',
        module_name: '家庭市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 2,
        status: 'active',
        description: '光纤宽带子场景',
      },
      {
        scenario_code: 'HOME_BROADBAND_BUSINESS_L3',
        scenario_name: '企业宽带',
        module_code: 'HOME',
        module_name: '家庭市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 3,
        status: 'active',
        description: '企业宽带子场景',
      },
      // 家庭安防三级
      {
        scenario_code: 'HOME_SECURITY_HOME_SECURITY_L3',
        scenario_name: '家庭安防',
        module_code: 'HOME',
        module_name: '家庭市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 1,
        status: 'active',
        description: '家庭安防子场景',
      },
      {
        scenario_code: 'HOME_SECURITY_SMART_LOCK_L3',
        scenario_name: '智能门锁',
        module_code: 'HOME',
        module_name: '家庭市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 2,
        status: 'active',
        description: '智能门锁子场景',
      },
      {
        scenario_code: 'HOME_SECURITY_SMART_CAMERA_L3',
        scenario_name: '智能摄像头',
        module_code: 'HOME',
        module_name: '家庭市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 3,
        status: 'active',
        description: '智能摄像头子场景',
      },
      // === 产品市场 ===
      {
        scenario_code: 'PRODUCT_MARKET_L1',
        scenario_name: '产品市场',
        module_code: 'PRODUCT',
        module_name: '产品市场',
        level: 1,
        parent_scenario_id: null,
        sort_order: 4,
        status: 'active',
        description: '产品市场业务场景',
      },
      // 产品市场二级
      {
        scenario_code: 'PRODUCT_5G_PRODUCTS_L2',
        scenario_name: '5G产品',
        module_code: 'PRODUCT',
        module_name: '产品市场',
        level: 2,
        parent_scenario_id: null,
        sort_order: 1,
        status: 'active',
        description: '5G产品子场景',
      },
      {
        scenario_code: 'PRODUCT_CLOUD_SERVICES_L2',
        scenario_name: '云服务',
        module_code: 'PRODUCT',
        module_name: '产品市场',
        level: 2,
        parent_scenario_id: null,
        sort_order: 2,
        status: 'active',
        description: '云服务子场景',
      },
      // 5G产品三级
      {
        scenario_code: 'PRODUCT_5G_PRODUCTS_5G_PRODUCTS_L3',
        scenario_name: '5G产品',
        module_code: 'PRODUCT',
        module_name: '产品市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 1,
        status: 'active',
        description: '5G产品子场景',
      },
      {
        scenario_code: 'PRODUCT_5G_PRODUCTS_5G_PACKAGES_L3',
        scenario_name: '5G套餐',
        module_code: 'PRODUCT',
        module_name: '产品市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 2,
        status: 'active',
        description: '5G套餐子场景',
      },
      {
        scenario_code: 'PRODUCT_5G_PRODUCTS_5G_DEVICES_L3',
        scenario_name: '5G终端',
        module_code: 'PRODUCT',
        module_name: '产品市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 3,
        status: 'active',
        description: '5G终端子场景',
      },
      // 云服务三级
      {
        scenario_code: 'PRODUCT_CLOUD_SERVICES_CLOUD_SERVICES_L3',
        scenario_name: '云服务',
        module_code: 'PRODUCT',
        module_name: '产品市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 1,
        status: 'active',
        description: '云服务子场景',
      },
      {
        scenario_code: 'PRODUCT_CLOUD_SERVICES_CLOUD_STORAGE_L3',
        scenario_name: '云存储',
        module_code: 'PRODUCT',
        module_name: '产品市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 2,
        status: 'active',
        description: '云存储子场景',
      },
      {
        scenario_code: 'PRODUCT_CLOUD_SERVICES_CLOUD_COMPUTING_L3',
        scenario_name: '云计算',
        module_code: 'PRODUCT',
        module_name: '产品市场',
        level: 3,
        parent_scenario_id: null,
        sort_order: 3,
        status: 'active',
        description: '云计算子场景',
      },
    ];

    // 插入数据
    const { data: insertedScenarios, error: insertError } = await client
      .from('business_scenarios')
      .insert(scenariosData)
      .select();

    if (insertError) {
      console.error('Error initializing scenarios:', insertError);
      return NextResponse.json(
        {
          success: false,
          error: insertError.message,
        },
        { status: 500 }
      );
    }

    // 设置父子关系
    // 创建场景编码到ID的映射
    const scenarioCodeToId = new Map();
    insertedScenarios?.forEach((scenario: any) => {
      scenarioCodeToId.set(scenario.scenario_code, scenario.id);
    });

    // 定义父子关系（二级场景的父是一级场景，三级场景的父是二级场景）
    const parentChildRelations = [
      // 公众市场的二级场景 -> 一级
      { childCode: 'PUBLIC_MARKET_OPERATION_L2', parentCode: 'PUBLIC_MARKET_L1' },
      { childCode: 'PUBLIC_CUSTOMER_OPERATION_L2', parentCode: 'PUBLIC_MARKET_L1' },
      { childCode: 'PUBLIC_PRODUCT_OPERATION_L2', parentCode: 'PUBLIC_MARKET_L1' },
      { childCode: 'PUBLIC_CHANNEL_OPERATION_L2', parentCode: 'PUBLIC_MARKET_L1' },
      { childCode: 'PUBLIC_INTERNATIONAL_OPERATION_L2', parentCode: 'PUBLIC_MARKET_L1' },
      { childCode: 'PUBLIC_SEGMENT_MARKET_L2', parentCode: 'PUBLIC_MARKET_L1' },

      // 市场运营三级 -> 二级
      { childCode: 'PUBLIC_MARKET_OPERATION_MARKET_L3', parentCode: 'PUBLIC_MARKET_OPERATION_L2' },
      { childCode: 'PUBLIC_MARKET_OPERATION_NEW_SUBS_L3', parentCode: 'PUBLIC_MARKET_OPERATION_L2' },
      { childCode: 'PUBLIC_MARKET_OPERATION_GROUP_CUSTOMERS_L3', parentCode: 'PUBLIC_MARKET_OPERATION_L2' },

      // 客户运营三级 -> 二级
      { childCode: 'PUBLIC_CUSTOMER_OPERATION_CUSTOMER_L3', parentCode: 'PUBLIC_CUSTOMER_OPERATION_L2' },
      { childCode: 'PUBLIC_CUSTOMER_OPERATION_MID_HIGH_END_L3', parentCode: 'PUBLIC_CUSTOMER_OPERATION_L2' },
      { childCode: 'PUBLIC_CUSTOMER_OPERATION_NEW_SUBS_L3', parentCode: 'PUBLIC_CUSTOMER_OPERATION_L2' },
      { childCode: 'PUBLIC_CUSTOMER_OPERATION_GROUP_CUSTOMERS_L3', parentCode: 'PUBLIC_CUSTOMER_OPERATION_L2' },
      { childCode: 'PUBLIC_CUSTOMER_OPERATION_GLOBAL_L3', parentCode: 'PUBLIC_CUSTOMER_OPERATION_L2' },
      { childCode: 'PUBLIC_CUSTOMER_OPERATION_WARNING_L3', parentCode: 'PUBLIC_CUSTOMER_OPERATION_L2' },

      // 产品运营三级 -> 二级
      { childCode: 'PUBLIC_PRODUCT_OPERATION_PRODUCT_L3', parentCode: 'PUBLIC_PRODUCT_OPERATION_L2' },
      { childCode: 'PUBLIC_PRODUCT_OPERATION_DATA_PRODUCTS_L3', parentCode: 'PUBLIC_PRODUCT_OPERATION_L2' },
      { childCode: 'PUBLIC_PRODUCT_OPERATION_CONTENT_PRODUCTS_L3', parentCode: 'PUBLIC_PRODUCT_OPERATION_L2' },

      // 渠道运营三级 -> 二级
      { childCode: 'PUBLIC_CHANNEL_OPERATION_CHANNEL_L3', parentCode: 'PUBLIC_CHANNEL_OPERATION_L2' },
      { childCode: 'PUBLIC_CHANNEL_OPERATION_ONLINE_L3', parentCode: 'PUBLIC_CHANNEL_OPERATION_L2' },
      { childCode: 'PUBLIC_CHANNEL_OPERATION_OFFLINE_L3', parentCode: 'PUBLIC_CHANNEL_OPERATION_L2' },

      // 国际运营三级 -> 二级
      { childCode: 'PUBLIC_INTERNATIONAL_OPERATION_INTERNATIONAL_L3', parentCode: 'PUBLIC_INTERNATIONAL_OPERATION_L2' },
      { childCode: 'PUBLIC_INTERNATIONAL_OPERATION_ROAMING_L3', parentCode: 'PUBLIC_INTERNATIONAL_OPERATION_L2' },
      { childCode: 'PUBLIC_INTERNATIONAL_OPERATION_BUSINESS_L3', parentCode: 'PUBLIC_INTERNATIONAL_OPERATION_L2' },

      // 细分市场运营三级 -> 二级
      { childCode: 'PUBLIC_SEGMENT_MARKET_SEGMENT_L3', parentCode: 'PUBLIC_SEGMENT_MARKET_L2' },
      { childCode: 'PUBLIC_SEGMENT_MARKET_YOUTH_L3', parentCode: 'PUBLIC_SEGMENT_MARKET_L2' },
      { childCode: 'PUBLIC_SEGMENT_MARKET_SILVER_L3', parentCode: 'PUBLIC_SEGMENT_MARKET_L2' },

      // 家庭市场的三级场景 -> 二级
      { childCode: 'HOME_BROADBAND_BROADBAND_L3', parentCode: 'HOME_BROADBAND_L2' },
      { childCode: 'HOME_BROADBAND_FIBER_L3', parentCode: 'HOME_BROADBAND_L2' },
      { childCode: 'HOME_BROADBAND_BUSINESS_L3', parentCode: 'HOME_BROADBAND_L2' },
      { childCode: 'HOME_SECURITY_HOME_SECURITY_L3', parentCode: 'HOME_SECURITY_L2' },
      { childCode: 'HOME_SECURITY_SMART_LOCK_L3', parentCode: 'HOME_SECURITY_L2' },
      { childCode: 'HOME_SECURITY_SMART_CAMERA_L3', parentCode: 'HOME_SECURITY_L2' },

      // 产品市场的三级场景 -> 二级
      { childCode: 'PRODUCT_5G_PRODUCTS_5G_PRODUCTS_L3', parentCode: 'PRODUCT_5G_PRODUCTS_L2' },
      { childCode: 'PRODUCT_5G_PRODUCTS_5G_PACKAGES_L3', parentCode: 'PRODUCT_5G_PRODUCTS_L2' },
      { childCode: 'PRODUCT_5G_PRODUCTS_5G_DEVICES_L3', parentCode: 'PRODUCT_5G_PRODUCTS_L2' },
      { childCode: 'PRODUCT_CLOUD_SERVICES_CLOUD_SERVICES_L3', parentCode: 'PRODUCT_CLOUD_SERVICES_L2' },
      { childCode: 'PRODUCT_CLOUD_SERVICES_CLOUD_STORAGE_L3', parentCode: 'PRODUCT_CLOUD_SERVICES_L2' },
      { childCode: 'PRODUCT_CLOUD_SERVICES_CLOUD_COMPUTING_L3', parentCode: 'PRODUCT_CLOUD_SERVICES_L2' },
    ];

    // 更新父子关系
    for (const relation of parentChildRelations) {
      const childId = scenarioCodeToId.get(relation.childCode);
      const parentId = scenarioCodeToId.get(relation.parentCode);

      if (childId && parentId) {
        const { error: updateError } = await client
          .from('business_scenarios')
          .update({ parent_scenario_id: parentId })
          .eq('id', childId);

        if (updateError) {
          console.error(`Error updating parent for ${relation.childCode}:`, updateError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Business scenarios initialized successfully',
      data: {
        count: insertedScenarios?.length || 0,
        scenarios: insertedScenarios,
      },
    });
  } catch (error) {
    console.error('Error initializing scenarios:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize scenarios',
      },
      { status: 500 }
    );
  }
}
