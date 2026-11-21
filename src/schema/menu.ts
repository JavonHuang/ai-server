import Joi from 'joi'

// ==================== 菜单搜索（列表页） ====================

export const menuSearchSchema = Joi.object({
  name: Joi.string().max(100),
  parentId: Joi.allow(null),
  status: Joi.number().valid(0, 1),
  visible: Joi.number().valid(0, 1),
  currentPage: Joi.number().integer().min(1),
  pageSize: Joi.number().integer().min(1).max(100),
})

// ==================== 新增菜单 ====================

export const menuInsertSchema = Joi.object({
  parentId: Joi.allow(null),
  name: Joi.string().max(100).required(),
  icon: Joi.string().allow('', null),
  sortOrder: Joi.number().integer().min(0).default(0),
  route: Joi.string().allow('', null),
  link: Joi.string().uri().allow('', null),
  target: Joi.string().valid('_self', '_blank').default('_self'),
  status: Joi.number().valid(0, 1).default(1),
  visible: Joi.number().valid(0, 1).default(1),
  remark: Joi.string().max(500).allow('', null),
})

// ==================== 更新菜单 ====================

export const menuUpdateSchema = Joi.object({
  id: Joi.string().required(),
  parentId: Joi.allow(null),
  name: Joi.string().max(100),
  icon: Joi.string().allow('', null),
  sortOrder: Joi.number().integer().min(0),
  route: Joi.string().allow('', null),
  link: Joi.string().uri().allow('', null),
  target: Joi.string().valid('_self', '_blank'),
  status: Joi.number().valid(0, 1),
  visible: Joi.number().valid(0, 1),
  remark: Joi.string().max(500).allow('', null),
})

// ==================== 删除菜单 ====================

export const menuDeleteSchema = Joi.object({
  id: Joi.string().required(),
})