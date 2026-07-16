import { miniToken } from '@/token'
import { BodyResult } from '@/utils/bodyResult'
import { PageVO } from '@/utils/pageVO'
import { generateID } from '@/utils/tool'
import { prisma } from '@/utils/prisma'
import type { UserAccountModel } from '@/generated/prisma/models/UserAccount'

const loginAccount=async (params:PageVO<UserAccountModel>) =>{
  // 根据账号和密码直接查询数据库
  const userInfo: UserAccountModel | null = await prisma.userAccount.findFirst({
    where: {
      userAccount: params.data?.userAccount,
      password: params.data?.password,
    }
  })

  const pageVOData = new PageVO<Array<UserAccountModel>>(userInfo ? [userInfo] : [], params.currentPage, params.pageSize)
  pageVOData.total = userInfo ? 1 : 0

  if(userInfo){
    const token = miniToken.generateToken(userInfo)
    return new BodyResult(`Bearer `+token, 200).resultPageVO(pageVOData);
  }else{
    return new BodyResult(null, 1001).resultPageVO(pageVOData);
  }
}

/**
 * 用户列表（分页）- POST /userAccount/userAccountPageList
 */
const userAccountPageList = async (params: PageVO<Partial<UserAccountModel>>) => {
  const where: any = {}

  // 构建查询条件
  if (params.data?.userName) {
    where.userName = { contains: params.data.userName }
  }
  if (params.data?.userAccount) {
    where.userAccount = { contains: params.data.userAccount }
  }
  if (params.data?.email) {
    where.email = { contains: params.data.email }
  }
  if (params.data?.phone) {
    where.phone = { contains: params.data.phone }
  }
  if (params.data?.status !== undefined) {
    where.status = params.data.status
  }

  // 查询总数
  const total = await prisma.userAccount.count({ where })

  // 查询数据
  const userList = await prisma.userAccount.findMany({
    where,
    skip: params.startIndex,
    take: params.pageSize,
    orderBy: {
      createdTime: 'desc'
    }
  })

  // 移除密码字段并格式化时间
  const safeUserList = userList.map(user => {
    const { password, ...safeUser } = user
    return {
      ...safeUser,
      status: String(safeUser.status),
      createdTime: safeUser.createdTime.toISOString().replace('T', ' ').substring(0, 19),
      updatedTime: safeUser.updatedTime.toISOString().split('T')[0]
    }
  })

  const pageVOData = new PageVO<Array<typeof safeUserList[0]>>(safeUserList, params.currentPage, params.pageSize)
  pageVOData.total = total

  return new BodyResult(safeUserList, 200).resultPageVO(pageVOData)
}

/**
 * 新增用户 - POST /userAccount/insertUserAccountList
 */
const insertUserAccount = async (data: Partial<UserAccountModel>) => {
  try {
    const newUser = await prisma.userAccount.create({
      data: {
        userName: data.userName || null,
        userAccount: data.userAccount || '',
        password: data.password || '',
        email: data.email || null,
        phone: data.phone || null,
        avatar: data.avatar || null,
        status: 1
      }
    })

    return new BodyResult(null, 200).result()
  } catch (error: any) {
    // 处理唯一约束错误
    if (error.code === 'P2002') {
      return new BodyResult(null, 1003).result() // 1003: 账号已存在
    }
    return new BodyResult(null, 1004).result() // 1004: 创建失败
  }
}

/**
 * 更新用户信息 - POST /userAccount/updateUserAccount
 */
const updateUserAccount = async (data: Partial<UserAccountModel> & { id: string }) => {
  try {
    const updateData: any = {}

    if (data.userName !== undefined) updateData.userName = data.userName
    if (data.userAccount !== undefined) updateData.userAccount = data.userAccount
    if (data.email !== undefined) updateData.email = data.email
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.avatar !== undefined) updateData.avatar = data.avatar
    if (data.status !== undefined) updateData.status = Number(data.status)

    const updatedUser = await prisma.userAccount.update({
      where: { id: data.id },
      data: updateData
    })

    return new BodyResult(null, 200).result()
  } catch (error: any) {
    // 处理唯一约束错误
    if (error.code === 'P2002') {
      return new BodyResult(null, 1003).result() // 1003: 账号已存在
    }
    // 用户不存在
    if (error.code === 'P2025') {
      return new BodyResult(null, 1002).result() // 1002: 用户不存在
    }
    return new BodyResult(null, 1004).result() // 1004: 更新失败
  }
}

export const userAccountLogic  = {
  loginAccount,
  userAccountPageList,
  insertUserAccount,
  updateUserAccount,
}