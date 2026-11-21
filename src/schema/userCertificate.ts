import Joi from 'joi'

// ==================== 新增证书 ====================

export const userCertificateInsertSchema = Joi.object({
  userId: Joi.string().required(),
  certificateName: Joi.string().max(200).required(),
  certificateType: Joi.string().max(50).required(),
  issuingAuthority: Joi.string().max(200).required(),
  issueTime: Joi.number().integer().required(),
  expiryTime: Joi.number().integer().allow(null, 0),
  certificateNo: Joi.string().max(100).required(),
  verifyUrl: Joi.string().max(500).allow('', null),
  attachmentUrl: Joi.string().max(500).allow('', null),
  status: Joi.number().valid(0, 1),
})

// ==================== 更新证书 ====================

export const userCertificateUpdateSchema = Joi.object({
  id: Joi.string().required(),
  certificateName: Joi.string().max(200),
  certificateType: Joi.string().max(50),
  issuingAuthority: Joi.string().max(200),
  issueTime: Joi.number().integer(),
  expiryTime: Joi.number().integer().allow(null, 0),
  certificateNo: Joi.string().max(100),
  verifyUrl: Joi.string().max(500).allow('', null),
  attachmentUrl: Joi.string().max(500).allow('', null),
  status: Joi.number().valid(0, 1),
})

// ==================== 删除证书 ====================

export const userCertificateDeleteSchema = Joi.object({
  id: Joi.string().required(),
})

// ==================== 证书搜索（列表页） ====================

export const userCertificateSearchSchema = Joi.object({
  userId: Joi.string().required(),
  certificateType: Joi.string().max(50),
  status: Joi.number().valid(0, 1),
  currentPage: Joi.number().integer().min(1),
  pageSize: Joi.number().integer().min(1).max(100),
})