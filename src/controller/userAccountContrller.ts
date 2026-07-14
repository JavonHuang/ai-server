import Router from 'koa-router'
import { userAccountLogic } from '@/logic'
import { PageVO } from '@/utils/pageVO'
import type { UserAccountModel } from '@/generated/prisma/models/UserAccount'

const router =new Router()

router.post('/login',async(ctx:any)=>{

  const bodyParam:any=ctx.request.body
  const userInfo:UserAccountModel ={
    id:"",
    password:bodyParam.password,
    userAccount:bodyParam.userAccount,
    userName:bodyParam.userName,
    email:null,
    phone:null,
    avatar:null,
    status:0,
    createdTime:new Date(),
    updatedTime:new Date()
  }
  const params:PageVO<UserAccountModel> = new PageVO<UserAccountModel>(userInfo,bodyParam.currentPage,bodyParam.pageSize)
  const result =await userAccountLogic.loginAccount(params)
  ctx.body=result
})
export default router.routes()