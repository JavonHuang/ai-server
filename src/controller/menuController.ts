import Router from 'koa-router'
import { menuLogic } from '@/logic'
import { PageVO } from '@/utils/pageVO'
import { getMissingFields } from '@/utils/validator'
import type { MenuModel } from '@/generated/prisma/models/Menu'

const router = new Router()

// ==================== 菜单接口 ====================

/**
 * 获取菜单树（前端用，仅启用且可见的菜单）
 * POST /menu/menuTree
 */
router.post('/menuTree', async (ctx: any) => {
  const result = await menuLogic.getMenuTree()
  ctx.body = result
})

/**
 * 获取完整菜单树（管理用，包含所有状态）
 * POST /menu/menuFullTree
 */
router.post('/menuFullTree', async (ctx: any) => {
  const result = await menuLogic.getMenuFullTree()
  ctx.body = result
})

/**
 * 菜单分页列表（管理用）
 * POST /menu/menuPageList
 */
router.post('/menuPageList', async (ctx: any) => {
  const bodyParam: any = ctx.request.body

  const searchData: Partial<MenuModel> = {
    name: bodyParam.name || undefined,
    parentId: bodyParam.parentId !== undefined ? bodyParam.parentId : undefined,
    status: bodyParam.status !== undefined ? bodyParam.status : undefined,
    visible: bodyParam.visible !== undefined ? bodyParam.visible : undefined,
  }

  const currentPage = parseInt(bodyParam.currentPage) || 1
  const pageSize = parseInt(bodyParam.pageSize) || 10

  const params: PageVO<Partial<MenuModel>> = new PageVO<Partial<MenuModel>>(
    searchData,
    currentPage,
    pageSize
  )

  const result = await menuLogic.getMenuPageList(params)
  ctx.body = result
})

/**
 * 新增菜单
 * POST /menu/insertMenu
 */
router.post('/insertMenu', async (ctx: any) => {
  const bodyParam: any = ctx.request.body

  const missing = getMissingFields(bodyParam, ['name'])
  if (missing.length > 0) {
    ctx.body = { code: 400, message: `参数不完整:[${missing.join(',')}]` }
    return
  }

  const data: Partial<MenuModel> & { parentId?: string | null } = {
    parentId: bodyParam.parentId || null,
    name: bodyParam.name,
    icon: bodyParam.icon,
    sortOrder: bodyParam.sortOrder,
    route: bodyParam.route,
    link: bodyParam.link,
    target: bodyParam.target,
    status: bodyParam.status,
    visible: bodyParam.visible,
    remark: bodyParam.remark,
  }

  const result = await menuLogic.insertMenu(data)
  ctx.body = result
})

/**
 * 更新菜单
 * POST /menu/updateMenu
 */
router.post('/updateMenu', async (ctx: any) => {
  const bodyParam: any = ctx.request.body

  const missing = getMissingFields(bodyParam, ['id'])
  if (missing.length > 0) {
    ctx.body = { code: 400, message: `参数不完整:[${missing.join(',')}]` }
    return
  }

  const data: Partial<MenuModel> & { id: string } = {
    id: bodyParam.id,
    parentId: bodyParam.parentId,
    name: bodyParam.name,
    icon: bodyParam.icon,
    sortOrder: bodyParam.sortOrder,
    route: bodyParam.route,
    link: bodyParam.link,
    target: bodyParam.target,
    status: bodyParam.status,
    visible: bodyParam.visible,
    remark: bodyParam.remark,
  }

  const result = await menuLogic.updateMenu(data)
  ctx.body = result
})

/**
 * 删除菜单（同时删除所有子菜单）
 * POST /menu/deleteMenu
 */
router.post('/deleteMenu', async (ctx: any) => {
  const bodyParam: any = ctx.request.body

  const missing = getMissingFields(bodyParam, ['id'])
  if (missing.length > 0) {
    ctx.body = { code: 400, message: `参数不完整:[${missing.join(',')}]` }
    return
  }

  const result = await menuLogic.deleteMenu({ id: bodyParam.id })
  ctx.body = result
})

export default router.routes()
