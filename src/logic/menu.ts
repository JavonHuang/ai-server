import { BodyResult } from '@/utils/bodyResult'
import { PageVO } from '@/utils/pageVO'
import {
  findEnabledMenus,
  findAllMenus,
  findMenuPage,
  createMenu,
  updateMenu as dbUpdateMenu,
  findMenuById,
  deleteMenuAndDescendants,
  findDescendantsByPath,
} from '@/dbBase'
import type { MenuModel } from '@/generated/prisma/models/Menu'
import { safeBigInt } from './common'

/**
 * 菜单树节点（扩展了 children 字段，时间戳转为字符串、状态字段转为字符串）
 */
type MenuTreeNode = Omit<MenuModel, 'createdTime' | 'updatedTime' | 'status' | 'visible'> & {
  children: MenuTreeNode[]
  status: string
  visible: string
  createdTime: number
  updatedTime: number
}

/**
 * 格式化单个菜单节点（时间戳 + 状态转字符串）
 */
const formatMenuNode = (menu: MenuModel): MenuTreeNode => {
  return {
    id: menu.id,
    parentId: menu.parentId,
    name: menu.name,
    icon: menu.icon,
    path: menu.path,
    sortOrder: menu.sortOrder,
    route: menu.route,
    link: menu.link,
    target: menu.target,
    status: String(menu.status),
    visible: String(menu.visible),
    remark: menu.remark,
    createdTime: safeBigInt(menu.createdTime),
    updatedTime: safeBigInt(menu.updatedTime),
    children: []
  }
}

/**
 * 从扁平列表构建菜单树
 */
const buildMenuTree = (menus: MenuModel[]): MenuTreeNode[] => {
  const formattedMenus = menus.map(formatMenuNode)
  const menuMap = new Map<string, MenuTreeNode>()
  const roots: MenuTreeNode[] = []

  formattedMenus.forEach(node => {
    menuMap.set(node.id, node)
  })

  formattedMenus.forEach(node => {
    if (node.parentId && menuMap.has(node.parentId)) {
      menuMap.get(node.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  })

  const sortTree = (nodes: MenuTreeNode[]) => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder)
    nodes.forEach(node => {
      if (node.children.length > 0) {
        sortTree(node.children)
      }
    })
  }
  sortTree(roots)

  return roots
}

/**
 * 获取菜单树（全量，仅返回启用且可见的菜单）
 * GET /menu/menuTree
 */
const getMenuTree = async () => {
  const menus = await findEnabledMenus()
  const tree = buildMenuTree(menus)
  return new BodyResult(tree, 200).result()
}

/**
 * 获取菜单管理列表（分页，包含所有状态的菜单）
 * POST /menu/menuPageList
 */
const getMenuPageList = async (params: PageVO<Partial<MenuModel>>) => {
  const { total, list } = await findMenuPage(
    params.data || {},
    params.startIndex,
    params.pageSize
  )

  // 转时间戳
  const formattedList = list.map(menu => ({
    ...menu,
    status: String(menu.status),
    visible: String(menu.visible),
    createdTime: safeBigInt(menu.createdTime),
    updatedTime: safeBigInt(menu.updatedTime),
  }))

  const pageVOData = new PageVO<Array<typeof formattedList[0]>>(formattedList, params.currentPage, params.pageSize)
  pageVOData.total = total

  return new BodyResult(formattedList, 200).resultPageVO(pageVOData)
}

/**
 * 获取完整菜单树（管理用，包含所有状态的菜单）
 * GET /menu/menuFullTree
 */
const getMenuFullTree = async () => {
  const menus = await findAllMenus()
  const tree = buildMenuTree(menus)
  return new BodyResult(tree, 200).result()
}

/**
 * 新增菜单
 * POST /menu/insertMenu
 */
const insertMenu = async (data: Partial<MenuModel> & { parentId?: string | null }) => {
  try {
    let path: string
    if (data.parentId) {
      const parent = await findMenuById(data.parentId)
      if (!parent) {
        return new BodyResult(null, 1005).result() // 1005: 父节点不存在
      }
      path = parent.path
    } else {
      path = '/'
    }

    const newMenu = await createMenu({ ...data, path })

    const fullPath = data.parentId
      ? `${path}${newMenu.id}/`
      : `/${newMenu.id}/`

    await dbUpdateMenu(newMenu.id, { path: fullPath })

    return new BodyResult(null, 200).result()
  } catch (error: any) {
    console.error('insertMenu error:', error)
    return new BodyResult(null, 1006).result() // 1006: 菜单创建失败
  }
}

/**
 * 更新菜单
 * POST /menu/updateMenu
 */
const updateMenu = async (data: Partial<MenuModel> & { id: string }) => {
  try {
    const { id, ...updateData } = data

    // 处理父节点变更（需要更新当前节点及所有子节点的 path）
    if (data.parentId !== undefined) {
      const currentMenu = await findMenuById(id)

      if (!currentMenu) {
        return new BodyResult(null, 1007).result() // 1007: 菜单不存在
      }

      if (data.parentId === data.id) {
        return new BodyResult(null, 1008).result() // 1008: 不能将菜单设为自身的子节点
      }

      const newParentId = data.parentId || null

      if (currentMenu.parentId !== newParentId) {
        let newPath: string
        if (newParentId) {
          const parent = await findMenuById(newParentId)
          if (!parent) {
            return new BodyResult(null, 1005).result() // 1005: 父节点不存在
          }
          if (parent.path.includes(`/${data.id}/`)) {
            return new BodyResult(null, 1009).result() // 1009: 不能将菜单移到自身的子节点下
          }
          newPath = `${parent.path}${data.id}/`
        } else {
          newPath = `/${data.id}/`
        }

        const oldPath = currentMenu.path
        const descendants = await findDescendantsByPath(oldPath, id)

        for (const desc of descendants) {
          const updatedPath = desc.path.replace(oldPath, newPath)
          await dbUpdateMenu(desc.id, { path: updatedPath })
        }

        updateData.parentId = newParentId
        updateData.path = newPath
      }
    }

    await dbUpdateMenu(id, updateData)
    return new BodyResult(null, 200).result()
  } catch (error: any) {
    console.error('updateMenu error:', error)
    if (error.code === 'P2025') {
      return new BodyResult(null, 1007).result() // 1007: 菜单不存在
    }
    return new BodyResult(null, 1010).result() // 1010: 菜单更新失败
  }
}

/**
 * 删除菜单（同时删除所有子菜单）
 * POST /menu/deleteMenu
 */
const deleteMenu = async (data: { id: string }) => {
  try {
    await deleteMenuAndDescendants(data.id)
    return new BodyResult(null, 200).result()
  } catch (error: any) {
    console.error('deleteMenu error:', error)
    return new BodyResult(null, 1011).result() // 1011: 菜单删除失败
  }
}

export const menuLogic = {
  getMenuTree,
  getMenuFullTree,
  getMenuPageList,
  insertMenu,
  updateMenu,
  deleteMenu,
}