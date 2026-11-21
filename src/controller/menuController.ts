import Router from 'koa-router'
import { menuLogic } from '@/logic'
import { PageVO } from '@/utils/pageVO'
import validate from '@/middleware/validate'
import { menuSearchSchema, menuInsertSchema, menuUpdateSchema, menuDeleteSchema } from '@/schema/menu'
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
router.post('/menuPageList', validate(menuSearchSchema, 'body'), async (ctx: any) => {
  const bodyParam: any = ctx.request.body

  const searchData: Partial<MenuModel> = {
    name: bodyParam.name || undefined,
    parentId: bodyParam.parentId !== undefined ? bodyParam.parentId : undefined,
    status: bodyParam.status !== undefined ? Number(bodyParam.status) : undefined,
    visible: bodyParam.visible !== undefined ? Number(bodyParam.visible) : undefined,
  }

  const params: PageVO<Partial<MenuModel>> = new PageVO<Partial<MenuModel>>(
    searchData,
    bodyParam.currentPage,
    bodyParam.pageSize
  )

  const result = await menuLogic.getMenuPageList(params)
  ctx.body = result
})

/**
 * 新增菜单
 * POST /menu/insertMenu
 */
router.post('/insertMenu', validate(menuInsertSchema, 'body'), async (ctx: any) => {
  const bodyParam: any = ctx.request.body

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
router.post('/updateMenu', validate(menuUpdateSchema, 'body'), async (ctx: any) => {
  const bodyParam: any = ctx.request.body

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
router.post('/deleteMenu', validate(menuDeleteSchema, 'body'), async (ctx: any) => {
  const bodyParam: any = ctx.request.body

  const result = await menuLogic.deleteMenu({ id: bodyParam.id })
  ctx.body = result
})

export default router.routes()