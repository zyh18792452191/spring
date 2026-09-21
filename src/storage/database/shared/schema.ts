import { pgTable, serial, timestamp, unique, text, integer, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const businessScenarios = pgTable("business_scenarios", {
	id: serial().primaryKey().notNull(),
	scenarioCode: text("scenario_code").notNull(),
	scenarioName: text("scenario_name").notNull(),
	moduleCode: text("module_code").notNull(),
	moduleName: text("module_name").notNull(),
	level: integer().default(1).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	status: text().default('active').notNull(),
	parentScenarioId: integer("parent_scenario_id"),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("business_scenarios_scenario_code_unique").on(table.scenarioCode),
]);

export const modules = pgTable("modules", {
	id: serial().primaryKey().notNull(),
	moduleCode: text("module_code").notNull(),
	moduleName: text("module_name").notNull(),
	icon: text(),
	sortOrder: integer("sort_order").default(0).notNull(),
	status: text().default('active').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("modules_module_code_unique").on(table.moduleCode),
]);

export const reportAssociations = pgTable("report_associations", {
	id: serial().primaryKey().notNull(),
	reportId: integer("report_id").notNull(),
	reportCode: text("report_code").notNull(),
	reportName: text("report_name").notNull(),
	pageId: text("page_id").notNull(),
	pageName: text("page_name").notNull(),
	associationType: text("association_type").default('template').notNull(),
	priority: integer().default(0).notNull(),
	tags: text(),
	status: text().default('active').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const reportTemplates = pgTable("report_templates", {
	id: serial().primaryKey().notNull(),
	templateCode: text("template_code").notNull(),
	templateName: text("template_name").notNull(),
	description: text(),
	category: text().notNull(),
	templateConfig: text("template_config"),
	status: text().default('active').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("report_templates_template_code_unique").on(table.templateCode),
]);

export const pages = pgTable("pages", {
	id: serial().primaryKey().notNull(),
	pageCode: text("page_code").notNull(),
	pageName: text("page_name").notNull(),
	pageType: text("page_type").notNull(),
	pagePath: text("page_path").notNull(),
	scenarioId: integer("scenario_id").notNull(),
	scenarioCode: text("scenario_code").notNull(),
	scenarioName: text("scenario_name").notNull(),
	moduleCode: text("module_code").notNull(),
	moduleName: text("module_name").notNull(),
	isTreePage: boolean("is_tree_page").default(false).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	status: text().default('active').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	parentPageId: integer("parent_page_id"),
}, (table) => [
	unique("pages_page_code_unique").on(table.pageCode),
]);

export const pageSections = pgTable("page_sections", {
	id: serial().primaryKey().notNull(),
	pageId: integer("page_id").notNull(),
	pageCode: text("page_code").notNull(),
	sectionCode: text("section_code").notNull(),
	sectionName: text("section_name").notNull(),
	sectionType: text("section_type").default('CONTENT'),
	sectionConfig: text(),
	parentSectionId: integer("parent_section_id"),
	sortOrder: integer("sort_order").default(0).notNull(),
	status: text().default('active').notNull(),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("page_sections_page_section_unique").on(table.pageId, table.sectionCode),
]);

export const reports = pgTable("reports", {
	id: serial().primaryKey().notNull(),
	reportCode: text("report_code").notNull(),
	reportName: text("report_name").notNull(),
	templateId: integer("template_id").notNull(),
	templateCode: text("template_code").notNull(),
	templateName: text("template_name").notNull(),
	content: text(),
	status: text().default('draft').notNull(),
	createdBy: text("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("reports_report_code_unique").on(table.reportCode),
]);

// 素材表
export const materials = pgTable("materials", {
	id: serial().primaryKey().notNull(),
	materialCode: text("material_code").notNull().unique(),
	materialName: text("material_name").notNull(),
	materialType: text("material_type").notNull(), // 图片、视频、文档等
	businessType: text("business_type").notNull(), // 业务类型
	visibility: text("visibility").default('national').notNull(), // 可见权限：national(全国)、province(省份)
	fileKey: text("file_key").notNull(), // 文件在对象存储中的 key
	fileUrl: text("file_url"), // 文件访问 URL（带签名的临时 URL）
	fileSize: integer("file_size"), // 文件大小（字节）
	fileMimeType: text("file_mime_type"), // 文件 MIME 类型
	coverKey: text("cover_key"), // 封面文件 key
	coverUrl: text("cover_url"), // 封面访问 URL
	copyrightInfo: text("copyright_info").notNull(), // 版权信息：owned(拥有版权)、no_copyright(暂不具备版权)
	copyrightStatement: text("copyright_statement").notNull(), // 版权声明
	copyrightProofKey: text("copyright_proof_key"), // 版权证明文件 key
	copyrightProofUrl: text("copyright_proof_url"), // 版权证明访问 URL
	description: text("description"), // 素材介绍
	status: text("status").default('published').notNull(), // 状态：draft(草稿)、published(已发布)
	createdBy: text("created_by").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 素材关联表（运营任务与素材的关联关系）
export const materialAssociations = pgTable("material_associations", {
	id: serial().primaryKey().notNull(),
	taskId: integer("task_id").notNull(), // 运营任务 ID
	materialId: integer("material_id").notNull(), // 素材 ID
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("material_associations_task_material_unique").on(table.taskId, table.materialId),
]);

// 表单模板配置表（存储不同类型任务的表单配置）
export const formTemplates = pgTable("form_templates", {
	id: serial().primaryKey().notNull(),
	templateCode: text("template_code").notNull().unique(),
	templateName: text("template_name").notNull(),
	description: text(),
	// 表单配置 JSON，存储表单字段定义
	formConfig: text("form_config").notNull(),
	status: text().default('active').notNull(),
	createdBy: text("created_by").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 运营任务表
export const operationalTasks = pgTable("operational_tasks", {
	id: serial().primaryKey().notNull(),
	taskCode: text("task_code").notNull().unique(),
	taskName: text("task_name").notNull(),
	// 任务状态：not_started(未开始)、in_progress(进行中)、finished(已结束)、offline(已下线)
	status: text().default('not_started').notNull(),
	startTime: timestamp("start_time", { withTimezone: true, mode: 'string' }).notNull(),
	endTime: timestamp("end_time", { withTimezone: true, mode: 'string' }).notNull(),
	durationDays: integer("duration_days").notNull(), // 活动时长（天）
	// 关联的表单模板
	formTemplateId: integer("form_template_id"),
	formTemplateName: text("form_template_name"),
	// 表单数据 JSON，存储用户填写的表单数据
	formData: text("form_data").notNull(),
	createdBy: text("created_by").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});
