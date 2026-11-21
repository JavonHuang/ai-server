import Router from 'koa-router'
import { userAccountLogic } from '@/logic'
import { PageVO } from '@/utils/pageVO'
import type { UserAccountModel } from '@/generated/prisma/models/UserAccount'
import validate from '@/middleware/validate'
import { loginSchema, userSearchSchema, userInsertSchema, userUpdateSchema } from '@/schema/userAccount'
import { getUserSchema } from '@/schema/userAccount'

const router = new Router()

// ==================== 无需登录的接口 ====================

/**
 * 用户登录
 * POST /userAccount/login
 */
router.post('/login', validate(loginSchema, 'body'), async (ctx: any) => {
  const bodyParam: any = ctx.request.body
  const userInfo: UserAccountModel = {
    id: '',
    password: bodyParam.password,
    userAccount: bodyParam.userAccount,
    userName: bodyParam.userName,
    email: null,
    phone: null,
    avatar: null,
    education: null,
    graduateSchool: null,
    age: null,
    birthday: null,
    biography: null,
    status: 0,
    createdTime: BigInt(Date.now()),
    updatedTime: BigInt(Date.now())
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
router.post('/userAccountPageList', validate(userSearchSchema, 'body'), async (ctx: any) => {
  const bodyParam: any = ctx.request.body

  const searchData: Partial<UserAccountModel> = {
    userName: bodyParam.userName || undefined,
    userAccount: bodyParam.userAccount || undefined,
    email: bodyParam.email || undefined,
    phone: bodyParam.phone || undefined,
    status: bodyParam.status !== undefined ? Number(bodyParam.status) : undefined
  }

  const params: PageVO<Partial<UserAccountModel>> = new PageVO<Partial<UserAccountModel>>(
    searchData,
    bodyParam.currentPage,
    bodyParam.pageSize
  )

  const result = await userAccountLogic.userAccountPageList(params)
  ctx.body = result
})

/**
 * 新增用户信息
 * POST /userAccount/insertUserAccountList
 */
router.post('/insertUserAccountList', validate(userInsertSchema, 'body'), async (ctx: any) => {
  const bodyParam: any = ctx.request.body

  const data: Partial<UserAccountModel> = {
    userName: bodyParam.userName,
    userAccount: bodyParam.userAccount,
    password: bodyParam.password,
    email: bodyParam.email,
    phone: bodyParam.phone,
    avatar: bodyParam.avatar,
    education: bodyParam.education || null,
    graduateSchool: bodyParam.graduateSchool || null,
    age: bodyParam.age || null,
    birthday: bodyParam.birthday || null,
    biography: bodyParam.biography || null,
  }

  const result = await userAccountLogic.insertUserAccount({
    ...data,
    emergencyContacts: bodyParam.emergencyContacts,
    educationRecords: bodyParam.educationRecords,
    certificates: bodyParam.certificates,
    workExperiences: bodyParam.workExperiences,
  })
  ctx.body = result
})

/**
 * 更新用户信息
 * POST /userAccount/updateUserAccount
 */
/**
 * 根据用户ID获取用户信息（含紧急联系人）
 * POST /userAccount/getUserWithContacts
 */
router.post('/getUserWithContacts', validate(getUserSchema, 'body'), async (ctx: any) => {
  const bodyParam: any = ctx.request.body

  const result = await userAccountLogic.getUserWithContacts({ id: bodyParam.id })
  ctx.body = result
})

router.post('/updateUserAccount', validate(userUpdateSchema, 'body'), async (ctx: any) => {
  const bodyParam: any = ctx.request.body

  const data: Partial<UserAccountModel> & { id: string } = {
    id: bodyParam.id,
    userName: bodyParam.userName,
    userAccount: bodyParam.userAccount,
    password: bodyParam.password,
    email: bodyParam.email,
    phone: bodyParam.phone,
    avatar: bodyParam.avatar,
    education: bodyParam.education || null,
    graduateSchool: bodyParam.graduateSchool || null,
    age: bodyParam.age || null,
    birthday: bodyParam.birthday || null,
    biography: bodyParam.biography || null,
    status: bodyParam.status
  }

  const result = await userAccountLogic.updateUserAccount({
    ...data,
    emergencyContacts: bodyParam.emergencyContacts,
    educationRecords: bodyParam.educationRecords,
    certificates: bodyParam.certificates,
    workExperiences: bodyParam.workExperiences,
  })
  ctx.body = result
})

export default router.routes()