import Joi from 'joi'

// ==================== 新增教育经历 ====================

export const educationRecordInsertSchema = Joi.object({
  userId: Joi.string().required(),
  startTime: Joi.number().integer().required(),
  endTime: Joi.number().integer().allow(null, 0),
  schoolName: Joi.string().max(200).required(),
  educationLevel: Joi.string().max(20).required(),
  degree: Joi.string().max(20).allow('', null),
  major: Joi.string().max(100).allow('', null),
  isCurrent: Joi.number().valid(0, 1),
  status: Joi.number().valid(0, 1),
})

// ==================== 更新教育经历 ====================

export const educationRecordUpdateSchema = Joi.object({
  id: Joi.string().required(),
  startTime: Joi.number().integer(),
  endTime: Joi.number().integer().allow(null, 0),
  schoolName: Joi.string().max(200),
  educationLevel: Joi.string().max(20),
  degree: Joi.string().max(20).allow('', null),
  major: Joi.string().max(100).allow('', null),
  isCurrent: Joi.number().valid(0, 1),
  status: Joi.number().valid(0, 1),
})

// ==================== 删除教育经历 ====================

export const educationRecordDeleteSchema = Joi.object({
  id: Joi.string().required(),
})

// ==================== 教育经历搜索（列表页） ====================

export const educationRecordSearchSchema = Joi.object({
  userId: Joi.string().required(),
  status: Joi.number().valid(0, 1),
  currentPage: Joi.number().integer().min(1),
  pageSize: Joi.number().integer().min(1).max(100),
})