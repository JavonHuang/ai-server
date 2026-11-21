import { miniToken } from '@/token'
import { BodyResult } from '@/utils/bodyResult'
import { PageVO } from '@/utils/pageVO'
import {
  findUserByAccountAndPassword,
  findUserAccountPage,
  createUserAccount,
  updateUserAccount as dbUpdateUserAccount,
  findUserAccountById,
  findEmergencyContactsByUserId,
  findEducationRecordsByUserId,
  findUserCertificatesByUserId,
  findUserWorkExperiencesByUserId,
} from '@/dbBase'
import { prisma } from '@/utils/prisma'
import type { UserAccountModel } from '@/generated/prisma/models/UserAccount'
import type { EmergencyContactModel } from '@/generated/prisma/models/EmergencyContact'

const loginAccount = async (params: PageVO<UserAccountModel>) => {
  const userInfo = await findUserByAccountAndPassword(
    params.data?.userAccount || '',
    params.data?.password || ''
  )

  const pageVOData = new PageVO<Array<UserAccountModel>>(userInfo ? [userInfo] : [], params.currentPage, params.pageSize)
  pageVOData.total = userInfo ? 1 : 0

  if (userInfo) {
    const token = miniToken.generateToken(userInfo)
    return new BodyResult(`Bearer ` + token, 200).resultPageVO(pageVOData)
  } else {
    return new BodyResult(null, 1001).resultPageVO(pageVOData)
  }
}

/**
 * 根据用户ID获取用户信息（含紧急联系人、教育经历、证书、工作经历）- POST /userAccount/getUserWithContacts
 */
const getUserWithContacts = async (data: { id: string }) => {
  try {
    const user = await findUserAccountById(data.id)
    if (!user) {
      return new BodyResult(null, 1002).result() // 1002: 用户不存在
    }

    const { password, ...safeUser } = user

    const [contacts, education, certificates, workExperiences] = await Promise.all([
      findEmergencyContactsByUserId(data.id),
      findEducationRecordsByUserId(data.id),
      findUserCertificatesByUserId(data.id),
      findUserWorkExperiencesByUserId(data.id),
    ])

    const safeContacts = (contacts as any[]).map((c: any) => ({
      ...c,
      status: String(c.status)
    }))
    const safeEducation = (education as any[]).map((e: any) => ({
      ...e,
      status: String(e.status),
      isCurrent: String(e.isCurrent)
    }))
    const safeCertificates = (certificates as any[]).map((c: any) => ({
      ...c,
      status: String(c.status)
    }))
    const safeWorkExperiences = (workExperiences as any[]).map((w: any) => ({
      ...w,
      status: String(w.status),
      isCurrent: String(w.isCurrent)
    }))

    return new BodyResult({
      ...safeUser,
      status: String(safeUser.status),
      emergencyContacts: safeContacts,
      educationRecords: safeEducation,
      certificates: safeCertificates,
      workExperiences: safeWorkExperiences
    }, 200).result()
  } catch (error: any) {
    return new BodyResult(null, 1004).result() // 1004: 查询失败
  }
}

/**
 * 用户列表（分页）- POST /userAccount/userAccountPageList
 */
const userAccountPageList = async (params: PageVO<Partial<UserAccountModel>>) => {
  const { total, list } = await findUserAccountPage(
    params.data || {},
    params.startIndex,
    params.pageSize
  )

  // 移除密码字段
  const safeList = list.map(user => {
    const { password, ...safeUser } = user
    return {
      ...safeUser,
      status: String(safeUser.status)
    }
  })

  const pageVOData = new PageVO<Array<typeof safeList[0]>>(safeList, params.currentPage, params.pageSize)
  pageVOData.total = total

  return new BodyResult(safeList, 200).resultPageVO(pageVOData)
}

/**
 * 新增用户 - POST /userAccount/insertUserAccountList
 */
const insertUserAccount = async (data: Partial<UserAccountModel> & {
  emergencyContacts?: any[]
  educationRecords?: any[]
  certificates?: any[]
  workExperiences?: any[]
}) => {
  try {
    const now = BigInt(Date.now())

    // 使用 Prisma 事务保证用户和子表数据的原子性
    const user = await prisma.$transaction(async (tx) => {
      // 创建用户
      const created = await (tx.userAccount as any).create({
        data: {
          userName: data.userName || null,
          userAccount: data.userAccount || '',
          password: data.password || '',
          email: data.email || null,
          phone: data.phone || null,
          avatar: data.avatar || null,
          education: data.education || null,
          graduateSchool: data.graduateSchool || null,
          age: data.age || null,
          birthday: data.birthday || null,
          biography: data.biography || null,
          status: data.status ?? 1,
          createdTime: now,
          updatedTime: now
        }
      })

      // 批量插入子表数据
      const tasks: Promise<any>[] = []

      if (data.emergencyContacts?.length) {
        for (const item of data.emergencyContacts) {
          tasks.push(tx.emergencyContact.create({
            data: { ...item, userId: created.id, status: 1, createdTime: now, updatedTime: now }
          }))
        }
      }
      if (data.educationRecords?.length) {
        for (const item of data.educationRecords) {
          tasks.push(tx.educationRecord.create({
            data: { ...item, userId: created.id, status: 1, createdTime: now, updatedTime: now }
          }))
        }
      }
      if (data.certificates?.length) {
        for (const item of data.certificates) {
          tasks.push(tx.userCertificate.create({
            data: { ...item, userId: created.id, status: 1, createdTime: now, updatedTime: now }
          }))
        }
      }
      if (data.workExperiences?.length) {
        for (const item of data.workExperiences) {
          tasks.push(tx.userWorkExperience.create({
            data: { ...item, userId: created.id, status: 1, createdTime: now, updatedTime: now }
          }))
        }
      }

      if (tasks.length) {
        await Promise.all(tasks)
      }

      return created
    })

    return new BodyResult(null, 200).result()
  } catch (error: any) {
    if (error.code === 'P2002') {
      return new BodyResult(null, 1003).result() // 1003: 账号已存在
    }
    return new BodyResult(error, 1004).result() // 1004: 创建失败
  }
}

/**
 * 更新用户信息 - POST /userAccount/updateUserAccount
 */
const updateUserAccount = async (data: Partial<UserAccountModel> & {
  id: string
  emergencyContacts?: any[]
  educationRecords?: any[]
  certificates?: any[]
  workExperiences?: any[]
}) => {
  try {
    const { id, ...updateData } = data
    const now = BigInt(Date.now())

    await prisma.$transaction(async (tx) => {
      // 更新用户基本信息
      await (tx.userAccount as any).update({
        where: { id },
        data: {
          ...(updateData.userName !== undefined && { userName: updateData.userName }),
          ...(updateData.email !== undefined && { email: updateData.email }),
          ...(updateData.phone !== undefined && { phone: updateData.phone }),
          ...(updateData.avatar !== undefined && { avatar: updateData.avatar }),
          ...(updateData.education !== undefined && { education: updateData.education }),
          ...(updateData.graduateSchool !== undefined && { graduateSchool: updateData.graduateSchool }),
          ...(updateData.age !== undefined && { age: updateData.age }),
          ...(updateData.birthday !== undefined && { birthday: updateData.birthday }),
          ...(updateData.biography !== undefined && { biography: updateData.biography }),
          ...(updateData.status !== undefined && { status: Number(updateData.status) }),
          updatedTime: now
        }
      })

      // 删除重建策略：先删后插
      if (data.emergencyContacts !== undefined) {
        await tx.emergencyContact.deleteMany({ where: { userId: id } })
        for (const item of data.emergencyContacts) {
          await tx.emergencyContact.create({
            data: { ...item, userId: id, status: 1, createdTime: now, updatedTime: now }
          })
        }
      }

      if (data.educationRecords !== undefined) {
        await tx.educationRecord.deleteMany({ where: { userId: id } })
        for (const item of data.educationRecords) {
          await tx.educationRecord.create({
            data: { ...item, userId: id, status: 1, createdTime: now, updatedTime: now }
          })
        }
      }

      if (data.certificates !== undefined) {
        await tx.userCertificate.deleteMany({ where: { userId: id } })
        for (const item of data.certificates) {
          await tx.userCertificate.create({
            data: { ...item, userId: id, status: 1, createdTime: now, updatedTime: now }
          })
        }
      }

      if (data.workExperiences !== undefined) {
        await tx.userWorkExperience.deleteMany({ where: { userId: id } })
        for (const item of data.workExperiences) {
          await tx.userWorkExperience.create({
            data: { ...item, userId: id, status: 1, createdTime: now, updatedTime: now }
          })
        }
      }
    })

    return new BodyResult(null, 200).result()
  } catch (error: any) {
    if (error.code === 'P2002') {
      return new BodyResult(null, 1003).result() // 1003: 账号已存在
    }
    if (error.code === 'P2025') {
      return new BodyResult(null, 1002).result() // 1002: 用户不存在
    }
    return new BodyResult(null, 1004).result() // 1004: 更新失败
  }
}

export const userAccountLogic = {
  loginAccount,
  userAccountPageList,
  insertUserAccount,
  updateUserAccount,
  getUserWithContacts,
}