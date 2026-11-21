import Joi from 'joi'

// ==================== 新增工作经历 ====================

export const userWorkExperienceInsertSchema = Joi.object({
  userId: Joi.string().required(),
  companyName: Joi.string().max(200).required(),
  position: Joi.string().max(100).required(),
  department: Joi.string().max(100).allow('', null),
  startTime: Joi.number().integer().required(),
  endTime: Joi.number().integer().allow(null, 0),
  isCurrent: Joi.number().valid(0, 1),
  responsibilities: Joi.string().allow('', null),
  address: Joi.string().max(500).allow('', null),
  contactName: Joi.string().max(100).allow('', null),
  contactPhone: Joi.string().max(20).allow('', null),
  status: Joi.number().valid(0, 1),
})

// ==================== 更新工作经历 ====================

export const userWorkExperienceUpdateSchema = Joi.object({
  id: Joi.string().required(),
  companyName: Joi.string().max(200),
  position: Joi.string().max(100),
  department: Joi.string().max(100).allow('', null),
  startTime: Joi.number().integer(),
  endTime: Joi.number().integer().allow(null, 0),
  isCurrent: Joi.number().valid(0, 1),
  responsibilities: Joi.string().allow('', null),
  address: Joi.string().max(500).allow('', null),
  contactName: Joi.string().max(100).allow('', null),
  contactPhone: Joi.string().max(20).allow('', null),
  status: Joi.number().valid(0, 1),
})

// ==================== 删除工作经历 ====================

export const userWorkExperienceDeleteSchema = Joi.object({
  id: Joi.string().required(),
})

// ==================== 工作经历搜索（列表页） ====================

export const userWorkExperienceSearchSchema = Joi.object({
  userId: Joi.string().required(),
  status: Joi.number().valid(0, 1),
  currentPage: Joi.number().integer().min(1),
  pageSize: Joi.number().integer().min(1).max(100),
})