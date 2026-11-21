import { PageVO } from "./pageVO"
import { prisma } from '@/utils/prisma'
import type { ErrorCodeModel } from '@/generated/prisma/models/ErrorCode'

/**
 * 递归处理对象中的 bigint，转为 number（JSON.stringify 不支持 bigint）
 */
function stripBigInt(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (key, val) => {
    if (typeof val === 'bigint') return Number(val)
    return val
  }))
}

export class BodyResult{
  data:any=null
  code: number
  message:string|undefined
  total:number=0
  currentPage:number=0
  pageSize:number=0
  constructor(data:any,code:number){
    this.data = stripBigInt(data)
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
    this.data = stripBigInt(param.data)
    const errorInfo: ErrorCodeModel | null = await prisma.errorCode.findFirst({
      where: {
        code: this.code,
      }
    })
    this.message = errorInfo?.message
    return Promise.resolve(this)
  }

}