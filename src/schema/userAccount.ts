import Joi from 'joi'

// ==================== 分页基础 ====================

export const pageSchema = Joi.object({
  currentPage: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
})

// ==================== 登录 ====================

export const loginSchema = Joi.object({
  userAccount: Joi.string().required(),
  password: Joi.string().required(),
  currentPage: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
})

// ==================== 用户搜索（列表页） ====================

export const userSearchSchema = Joi.object({
  userName: Joi.string().max(100),
  userAccount: Joi.string().max(100),
  email: Joi.string().max(100),
  phone: Joi.string().max(20),
  status: Joi.number().valid(0, 1),
  currentPage: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
})

// ==================== 新增用户 ====================

export const userInsertSchema = Joi.object({
  userName: Joi.string().max(100),
  userAccount: Joi.string().max(100).required(),
  password: Joi.string().min(6).max(64).required(),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).allow('', null),
  avatar: Joi.string().uri().allow('', null),
  education: Joi.string().max(50).allow(null, ''),
  graduateSchool: Joi.string().max(200).allow(null, ''),
  age: Joi.number().integer().min(1).max(150).allow(null),
  birthday: Joi.string().max(20).allow(null, ''),
  biography: Joi.string().max(1000).allow(null, ''),
})

// ==================== 更新用户 ====================

export const userUpdateSchema = Joi.object({
  id: Joi.string().required(),
  userName: Joi.string().max(100),
  userAccount: Joi.string().max(100),
  password: Joi.string().min(6).max(64).allow(null),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).allow('', null),
  avatar: Joi.string().uri().allow('', null),
  education: Joi.string().max(50).allow(null, ''),
  graduateSchool: Joi.string().max(200).allow(null, ''),
  age: Joi.number().integer().min(1).max(150).allow(null),
  birthday: Joi.string().max(20).allow(null, ''),
  biography: Joi.string().max(1000).allow(null, ''),
  status: Joi.number().valid(0, 1),
})

// ==================== 获取用户信息（含紧急联系人） ====================

export const getUserSchema = Joi.object({
  id: Joi.string().required(),
})