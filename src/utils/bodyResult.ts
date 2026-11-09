import { PageVO } from "./pageVO"
import { prisma } from '@/utils/prisma'
import type { ErrorCodeModel } from '@/generated/prisma/models/ErrorCode'

export class BodyResult{
  data:any=null
  code: number
  message:string|undefined
  total:number=0
  currentPage:number=0
  pageSize:number=0
  constructor(data:any,code:number){
    this.data=data
    this.code=code
  }

  public result=async () =>{
    const errorInfo: ErrorCodeModel | null = await prisma.errorCode.findFirst({
      where: {
        code: this.code,
      }
    })
    this.message = errorInfo?.message
    return Promise.resolve(this)
  }

  public resultPageVO=async (param:PageVO<any>) =>{
    this.currentPage = param.currentPage
    this.pageSize = param.pageSize
    this.total = param.total
    const errorInfo: ErrorCodeModel | null = await prisma.errorCode.findFirst({
      where: {
        code: this.code,
      }
    })
    this.message = errorInfo?.message
    return Promise.resolve(this)
  }

}