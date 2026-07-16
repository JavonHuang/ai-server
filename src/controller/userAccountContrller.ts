import Router from 'koa-router'
import { userAccountLogic } from '@/logic'
import { PageVO } from '@/utils/pageVO'
import type { UserAccountModel } from '@/generated/prisma/models/UserAccount'

const router = new Router()

// ==================== 无需登录的接口 ====================

/**
 * 用户登录
 * POST /userAccount/login
 */
router.post('/login', async (ctx: any) => {
  const bodyParam: any = ctx.request.body
  const userInfo: UserAccountModel = {
    id: "",
    password: bodyParam.password,
    userAccount: bodyParam.userAccount,
    userName: bodyParam.userName,
    email: null,
    phone: null,
    avatar: null,
    status: 0,
    createdTime: new Date(),
    updatedTime: new Date()
  }
  const params: PageVO<UserAccountModel> = new PageVO<UserAccountModel>(userInfo, bodyParam.currentPage, bodyParam.pageSize)
  const result = await userAccountLogic.loginAccount(params)
  ctx.body = result
})

// ==================== 需要登录的接口（文档定义）====================

/**
 * 用户列表（分页）
 * POST /userAccount/userAccountPageList
 */
router.post('/userAccountPageList', async (ctx: any) => {
  const bodyParam: any = ctx.request.body

  const searchData: Partial<UserAccountModel> = {
    userName: bodyParam.userName || undefined,
    userAccount: bodyParam.userAccount || undefined,
    email: bodyParam.email || undefined,
    phone: bodyParam.phone || undefined,
    status: bodyParam.status !== undefined ? parseInt(bodyParam.status) : undefined
  }

  const currentPage = parseInt(bodyParam.currentPage) || 1
  const pageSize = parseInt(bodyParam.pageSize) || 10

  const params: PageVO<Partial<UserAccountModel>> = new PageVO<Partial<UserAccountModel>>(
    searchData,
    currentPage,
    pageSize
  )

  const result = await userAccountLogic.userAccountPageList(params)
  ctx.body = result
})

/**
 * 新增用户信息
 * POST /userAccount/insertUserAccountList
 */
router.post('/insertUserAccountList', async (ctx: any) => {
  const bodyParam: any = ctx.request.body

  const data: Partial<UserAccountModel> = {
    userName: bodyParam.userName,
    userAccount: bodyParam.userAccount,
    password: bodyParam.password,
    email: bodyParam.email,
    phone: bodyParam.phone,
    avatar: bodyParam.avatar
  }

  const result = await userAccountLogic.insertUserAccount(data)
  ctx.body = result
})

/**
 * 更新用户信息
 * POST /userAccount/updateUserAccount
 */
router.post('/updateUserAccount', async (ctx: any) => {
  const bodyParam: any = ctx.request.body

  const data: Partial<UserAccountModel> & { id: string } = {
    id: bodyParam.id,
    userName: bodyParam.userName,
    userAccount: bodyParam.userAccount,
    password: bodyParam.password,
    email: bodyParam.email,
    phone: bodyParam.phone,
    avatar: bodyParam.avatar,
    status: bodyParam.status
  }

  const result = await userAccountLogic.updateUserAccount(data)
  ctx.body = result
})

export default router.routes()
