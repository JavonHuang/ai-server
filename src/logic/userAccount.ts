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

export const userAccountLogic  = {
  loginAccount,
}