import { prisma } from '@/utils/prisma'
import type { UserAccountModel } from '@/generated/prisma/models/UserAccount'
import type { MenuModel } from '@/generated/prisma/models/Menu'

// ================ UserAccount ================

/**
 * 根据账号和密码查询用户
 */
export const findUserByAccountAndPassword = async (userAccount: string, password: string) => {
  return prisma.userAccount.findFirst({
    where: { userAccount, password }
  })
}

/**
 * 查询用户列表（分页）
 */
export const findUserAccountPage = async (data: Partial<UserAccountModel>, startIndex: number, pageSize: number) => {
  const where: any = {}

  if (data.userName) where.userName = { contains: data.userName }
  if (data.userAccount) where.userAccount = { contains: data.userAccount }
  if (data.email) where.email = { contains: data.email }
  if (data.phone) where.phone = { contains: data.phone }
  if (data.status !== undefined) where.status = data.status

  const total = await prisma.userAccount.count({ where })
  const list = await prisma.userAccount.findMany({
    where,
    skip: startIndex,
    take: pageSize,
    orderBy: { createdTime: 'desc' }
  })

  return { total, list }
}

/**
 * 创建用户
 */
export const createUserAccount = async (data: Partial<UserAccountModel>) => {
  const now = BigInt(Date.now())
  return prisma.userAccount.create({
    data: {
      userName: data.userName || null,
      userAccount: data.userAccount || '',
      password: data.password || '',
      email: data.email || null,
      phone: data.phone || null,
      avatar: data.avatar || null,
      status: data.status ?? 1,
      createdTime: now,
      updatedTime: now
    }
  })
}

/**
 * 更新用户信息
 */
export const updateUserAccount = async (id: string, data: Partial<UserAccountModel>) => {
  const updateData: any = {}
  if (data.userName !== undefined) updateData.userName = data.userName
  if (data.userAccount !== undefined) updateData.userAccount = data.userAccount
  if (data.email !== undefined) updateData.email = data.email
  if (data.phone !== undefined) updateData.phone = data.phone
  if (data.avatar !== undefined) updateData.avatar = data.avatar
  if (data.status !== undefined) updateData.status = Number(data.status)

  return prisma.userAccount.update({ where: { id }, data: updateData })
}

/**
 * 根据ID查询用户
 */
export const findUserAccountById = async (id: string) => {
  return prisma.userAccount.findUnique({ where: { id } })
}

// ================ Menu ================

/**
 * 获取菜单树（仅启用且可见的菜单）
 */
export const findEnabledMenus = async () => {
  return prisma.menu.findMany({
    where: { status: 1, visible: 1 },
    orderBy: { sortOrder: 'asc' }
  })
}

/**
 * 获取完整菜单树（包含所有状态）
 */
export const findAllMenus = async () => {
  return prisma.menu.findMany({ orderBy: { sortOrder: 'asc' } })
}

/**
 * 查询菜单列表（分页）
 */
export const findMenuPage = async (data: Partial<MenuModel>, startIndex: number, pageSize: number) => {
  const where: any = {}

  if (data.name) where.name = { contains: data.name }
  if (data.parentId !== undefined) where.parentId = data.parentId
  if (data.status !== undefined) where.status = Number(data.status)
  if (data.visible !== undefined) where.visible = Number(data.visible)

  const total = await prisma.menu.count({ where })
  const list = await prisma.menu.findMany({
    where,
    skip: startIndex,
    take: pageSize,
    orderBy: [{ sortOrder: 'asc' }, { createdTime: 'desc' }]
  })

  return { total, list }
}

/**
 * 创建菜单
 */
export const createMenu = async (data: Partial<MenuModel>) => {
  const now = BigInt(Date.now())
  return prisma.menu.create({
    data: {
      parentId: data.parentId || null,
      name: data.name || '',
      icon: data.icon || null,
      path: data.path || '',
      sortOrder: data.sortOrder ?? 0,
      route: data.route || null,
      link: data.link || null,
      target: data.target || '_self',
      status: data.status ?? 1,
      visible: data.visible ?? 1,
      remark: data.remark || null,
      createdTime: now,
      updatedTime: now
    }
  })
}

/**
 * 更新菜单
 */
export const updateMenu = async (id: string, data: Partial<MenuModel>) => {
  const updateData: any = {}

  if (data.parentId !== undefined) updateData.parentId = data.parentId
  if (data.name !== undefined) updateData.name = data.name
  if (data.icon !== undefined) updateData.icon = data.icon
  if (data.path !== undefined) updateData.path = data.path
  if (data.sortOrder !== undefined) updateData.sortOrder = Number(data.sortOrder)
  if (data.route !== undefined) updateData.route = data.route
  if (data.link !== undefined) updateData.link = data.link
  if (data.target !== undefined) updateData.target = data.target
  if (data.status !== undefined) updateData.status = Number(data.status)
  if (data.visible !== undefined) updateData.visible = Number(data.visible)
  if (data.remark !== undefined) updateData.remark = data.remark

  return prisma.menu.update({ where: { id }, data: updateData })
}

/**
 * 根据ID查询菜单
 */
export const findMenuById = async (id: string) => {
  return prisma.menu.findUnique({ where: { id } })
}

/**
 * 删除菜单（同时删除所有子菜单）
 */
export const deleteMenuAndDescendants = async (id: string) => {
  const menu = await prisma.menu.findUnique({ where: { id } })
  if (!menu) return null

  await prisma.menu.deleteMany({
    where: { path: { startsWith: menu.path } }
  })

  return menu
}

/**
 * 查询某个路径下的所有子节点
 */
export const findDescendantsByPath = async (path: string, excludeId: string) => {
  return prisma.menu.findMany({
    where: { path: { startsWith: path }, id: { not: excludeId } }
  })
}

// ================ EmergencyContact ================

/**
 * 查询用户的所有紧急联系人
 */
export const findEmergencyContactsByUserId = async (userId: string) => {
  return prisma.emergencyContact.findMany({
    where: { userId, status: 1 },
    orderBy: { createdTime: 'desc' }
  })
}

/**
 * 查询用户紧急联系人（分页）
 */
export const findEmergencyContactPage = async (data: { userId?: string; status?: number }, startIndex: number, pageSize: number) => {
  const where: any = {}

  if (data.userId) where.userId = data.userId
  if (data.status !== undefined) where.status = data.status

  const total = await prisma.emergencyContact.count({ where })
  const list = await prisma.emergencyContact.findMany({
    where,
    skip: startIndex,
    take: pageSize,
    orderBy: { createdTime: 'desc' }
  })

  return { total, list }
}

/**
 * 创建紧急联系人
 */
export const createEmergencyContact = async (data: {
  userId: string
  relation: string
  name: string
  phone: string
  address?: string | null
}) => {
  const now = BigInt(Date.now())
  return prisma.emergencyContact.create({
    data: {
      userId: data.userId,
      relation: data.relation,
      name: data.name,
      phone: data.phone,
      address: data.address || null,
      status: 1,
      createdTime: now,
      updatedTime: now
    }
  })
}

/**
 * 更新紧急联系人
 */
export const updateEmergencyContact = async (id: string, data: {
  relation?: string
  name?: string
  phone?: string
  address?: string | null
  status?: number
}) => {
  const updateData: any = {}
  if (data.relation !== undefined) updateData.relation = data.relation
  if (data.name !== undefined) updateData.name = data.name
  if (data.phone !== undefined) updateData.phone = data.phone
  if (data.address !== undefined) updateData.address = data.address
  if (data.status !== undefined) updateData.status = data.status

  return prisma.emergencyContact.update({ where: { id }, data: updateData })
}

/**
 * 根据ID查询紧急联系人
 */
export const findEmergencyContactById = async (id: string) => {
  return prisma.emergencyContact.findUnique({ where: { id } })
}

/**
 * 删除紧急联系人
 */
export const deleteEmergencyContact = async (id: string) => {
  return prisma.emergencyContact.delete({ where: { id } })
}

// ================ EducationRecord ================

/**
 * 查询用户的所有教育经历
 */
export const findEducationRecordsByUserId = async (userId: string) => {
  return prisma.educationRecord.findMany({
    where: { userId, status: 1 },
    orderBy: [{ isCurrent: 'desc' }, { startTime: 'desc' }]
  })
}

/**
 * 查询用户教育经历（分页）
 */
export const findEducationRecordPage = async (data: { userId?: string; status?: number }, startIndex: number, pageSize: number) => {
  const where: any = {}
  if (data.userId) where.userId = data.userId
  if (data.status !== undefined) where.status = data.status

  const total = await prisma.educationRecord.count({ where })
  const list = await prisma.educationRecord.findMany({
    where,
    skip: startIndex,
    take: pageSize,
    orderBy: { createdTime: 'desc' }
  })

  return { total, list }
}

/**
 * 创建教育经历
 */
export const createEducationRecord = async (data: {
  userId: string
  startTime: bigint | number
  endTime?: bigint | number | null
  schoolName: string
  educationLevel: string
  degree?: string | null
  major?: string | null
  isCurrent?: number
}) => {
  const now = BigInt(Date.now())
  return (prisma.educationRecord as any).create({
    data: {
      userId: data.userId,
      startTime: BigInt(data.startTime),
      endTime: data.endTime ? BigInt(data.endTime) : null,
      schoolName: data.schoolName,
      educationLevel: data.educationLevel,
      degree: data.degree || null,
      major: data.major || null,
      isCurrent: data.isCurrent ?? 0,
      status: 1,
      createdTime: now,
      updatedTime: now
    }
  })
}

/**
 * 更新教育经历
 */
export const updateEducationRecord = async (id: string, data: {
  startTime?: bigint | number
  endTime?: bigint | number | null
  schoolName?: string
  educationLevel?: string
  degree?: string | null
  major?: string | null
  isCurrent?: number
  status?: number
}) => {
  const updateData: any = {}
  if (data.startTime !== undefined) updateData.startTime = BigInt(data.startTime)
  if (data.endTime !== undefined) updateData.endTime = data.endTime ? BigInt(data.endTime) : null
  if (data.schoolName !== undefined) updateData.schoolName = data.schoolName
  if (data.educationLevel !== undefined) updateData.educationLevel = data.educationLevel
  if (data.degree !== undefined) updateData.degree = data.degree
  if (data.major !== undefined) updateData.major = data.major
  if (data.isCurrent !== undefined) updateData.isCurrent = data.isCurrent
  if (data.status !== undefined) updateData.status = data.status

  return prisma.educationRecord.update({ where: { id }, data: updateData })
}

/**
 * 删除教育经历
 */
export const deleteEducationRecord = async (id: string) => {
  return prisma.educationRecord.delete({ where: { id } })
}

// ================ UserCertificate ================

/**
 * 查询用户的所有证书
 */
export const findUserCertificatesByUserId = async (userId: string) => {
  return prisma.userCertificate.findMany({
    where: { userId, status: 1 },
    orderBy: { createdTime: 'desc' }
  })
}

/**
 * 查询用户证书（分页）
 */
export const findUserCertificatePage = async (data: { userId?: string; certificateType?: string; status?: number }, startIndex: number, pageSize: number) => {
  const where: any = {}
  if (data.userId) where.userId = data.userId
  if (data.certificateType) where.certificateType = data.certificateType
  if (data.status !== undefined) where.status = data.status

  const total = await prisma.userCertificate.count({ where })
  const list = await prisma.userCertificate.findMany({
    where,
    skip: startIndex,
    take: pageSize,
    orderBy: { createdTime: 'desc' }
  })

  return { total, list }
}

/**
 * 创建证书
 */
export const createUserCertificate = async (data: {
  userId: string
  certificateName: string
  certificateType: string
  issuingAuthority: string
  issueTime: bigint | number
  expiryTime?: bigint | number | null
  certificateNo: string
  verifyUrl?: string | null
  attachmentUrl?: string | null
}) => {
  const now = BigInt(Date.now())
  return (prisma.userCertificate as any).create({
    data: {
      userId: data.userId,
      certificateName: data.certificateName,
      certificateType: data.certificateType,
      issuingAuthority: data.issuingAuthority,
      issueTime: BigInt(data.issueTime),
      expiryTime: data.expiryTime ? BigInt(data.expiryTime) : null,
      certificateNo: data.certificateNo,
      verifyUrl: data.verifyUrl || null,
      attachmentUrl: data.attachmentUrl || null,
      status: 1,
      createdTime: now,
      updatedTime: now
    }
  })
}

/**
 * 更新证书
 */
export const updateUserCertificate = async (id: string, data: {
  certificateName?: string
  certificateType?: string
  issuingAuthority?: string
  issueTime?: bigint | number
  expiryTime?: bigint | number | null
  certificateNo?: string
  verifyUrl?: string | null
  attachmentUrl?: string | null
  status?: number
}) => {
  const updateData: any = {}
  if (data.certificateName !== undefined) updateData.certificateName = data.certificateName
  if (data.certificateType !== undefined) updateData.certificateType = data.certificateType
  if (data.issuingAuthority !== undefined) updateData.issuingAuthority = data.issuingAuthority
  if (data.issueTime !== undefined) updateData.issueTime = BigInt(data.issueTime)
  if (data.expiryTime !== undefined) updateData.expiryTime = data.expiryTime ? BigInt(data.expiryTime) : null
  if (data.certificateNo !== undefined) updateData.certificateNo = data.certificateNo
  if (data.verifyUrl !== undefined) updateData.verifyUrl = data.verifyUrl
  if (data.attachmentUrl !== undefined) updateData.attachmentUrl = data.attachmentUrl
  if (data.status !== undefined) updateData.status = data.status

  return prisma.userCertificate.update({ where: { id }, data: updateData })
}

/**
 * 删除证书
 */
export const deleteUserCertificate = async (id: string) => {
  return prisma.userCertificate.delete({ where: { id } })
}

// ================ UserWorkExperience ================

/**
 * 查询用户的所有工作经历
 */
export const findUserWorkExperiencesByUserId = async (userId: string) => {
  return prisma.userWorkExperience.findMany({
    where: { userId, status: 1 },
    orderBy: [{ isCurrent: 'desc' }, { startTime: 'desc' }]
  })
}

/**
 * 查询用户工作经历（分页）
 */
export const findUserWorkExperiencePage = async (data: { userId?: string; status?: number }, startIndex: number, pageSize: number) => {
  const where: any = {}
  if (data.userId) where.userId = data.userId
  if (data.status !== undefined) where.status = data.status

  const total = await prisma.userWorkExperience.count({ where })
  const list = await prisma.userWorkExperience.findMany({
    where,
    skip: startIndex,
    take: pageSize,
    orderBy: { createdTime: 'desc' }
  })

  return { total, list }
}

/**
 * 创建工作经历
 */
export const createUserWorkExperience = async (data: {
  userId: string
  companyName: string
  position: string
  department?: string | null
  startTime: bigint | number
  endTime?: bigint | number | null
  isCurrent?: number
  responsibilities?: string | null
  address?: string | null
  contactName?: string | null
  contactPhone?: string | null
}) => {
  const now = BigInt(Date.now())
  return (prisma.userWorkExperience as any).create({
    data: {
      userId: data.userId,
      companyName: data.companyName,
      position: data.position,
      department: data.department || null,
      startTime: BigInt(data.startTime),
      endTime: data.endTime ? BigInt(data.endTime) : null,
      isCurrent: data.isCurrent ?? 0,
      responsibilities: data.responsibilities || null,
      address: data.address || null,
      contactName: data.contactName || null,
      contactPhone: data.contactPhone || null,
      status: 1,
      createdTime: now,
      updatedTime: now
    }
  })
}

/**
 * 更新工作经历
 */
export const updateUserWorkExperience = async (id: string, data: {
  companyName?: string
  position?: string
  department?: string | null
  startTime?: bigint | number
  endTime?: bigint | number | null
  isCurrent?: number
  responsibilities?: string | null
  address?: string | null
  contactName?: string | null
  contactPhone?: string | null
  status?: number
}) => {
  const updateData: any = {}
  if (data.companyName !== undefined) updateData.companyName = data.companyName
  if (data.position !== undefined) updateData.position = data.position
  if (data.department !== undefined) updateData.department = data.department
  if (data.startTime !== undefined) updateData.startTime = BigInt(data.startTime)
  if (data.endTime !== undefined) updateData.endTime = data.endTime ? BigInt(data.endTime) : null
  if (data.isCurrent !== undefined) updateData.isCurrent = data.isCurrent
  if (data.responsibilities !== undefined) updateData.responsibilities = data.responsibilities
  if (data.address !== undefined) updateData.address = data.address
  if (data.contactName !== undefined) updateData.contactName = data.contactName
  if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone
  if (data.status !== undefined) updateData.status = data.status

  return prisma.userWorkExperience.update({ where: { id }, data: updateData })
}

/**
 * 删除工作经历
 */
export const deleteUserWorkExperience = async (id: string) => {
  return prisma.userWorkExperience.delete({ where: { id } })
}