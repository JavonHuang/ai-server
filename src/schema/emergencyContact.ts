import Joi from 'joi'

// ==================== 新增紧急联系人 ====================

export const emergencyContactInsertSchema = Joi.object({
  userId: Joi.string().required(),
  relation: Joi.string().max(50).required(),
  name: Joi.string().max(100).required(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required(),
  address: Joi.string().max(500).allow('', null),
})

// ==================== 更新紧急联系人 ====================

export const emergencyContactUpdateSchema = Joi.object({
  id: Joi.string().required(),
  relation: Joi.string().max(50),
  name: Joi.string().max(100),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/),
  address: Joi.string().max(500).allow('', null),
  status: Joi.number().valid(0, 1),
})

// ==================== 删除紧急联系人 ====================

export const emergencyContactDeleteSchema = Joi.object({
  id: Joi.string().required(),
})

// ==================== 紧急联系人搜索（列表页） ====================

export const emergencyContactSearchSchema = Joi.object({
  userId: Joi.string().required(),
  status: Joi.number().valid(0, 1),
  currentPage: Joi.number().integer().min(1),
  pageSize: Joi.number().integer().min(1).max(100),
})