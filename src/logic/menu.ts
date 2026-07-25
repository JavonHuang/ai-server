import { BodyResult } from '@/utils/bodyResult'
import { PageVO } from '@/utils/pageVO'
import { prisma } from '@/utils/prisma'
import type { MenuModel } from '@/generated/prisma/models/Menu'

/**
 * 菜单树节点（扩展了 children 字段，时间戳转为字符串、状态字段转为字符串）
 */
type MenuTreeNode = Omit<MenuModel, 'createdTime' | 'updatedTime' | 'status' | 'visible'> & {
  children: MenuTreeNode[]
  status: string
  visible: string
  createdTime: string
  updatedTime: string
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
    createdTime: menu.createdTime.toISOString().replace('T', ' ').substring(0, 19),
    updatedTime: menu.updatedTime.toISOString().replace('T', ' ').substring(0, 19),
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

  // 先建立 id -> node 的映射
  formattedMenus.forEach(node => {
    menuMap.set(node.id, node)
  })

  // 遍历构建父子关系
  formattedMenus.forEach(node => {
    if (node.parentId && menuMap.has(node.parentId)) {
      menuMap.get(node.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  })

  // 按 sortOrder 递归排序
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
  const menus = await prisma.menu.findMany({
    where: {
      status: 1,
      visible: 1
    },
    orderBy: {
      sortOrder: 'asc'
    }
  })

  const tree = buildMenuTree(menus)
  return new BodyResult(tree, 200).result()
}

/**
 * 获取菜单管理列表（分页，包含所有状态的菜单）
 * POST /menu/menuPageList
 */
const getMenuPageList = async (params: PageVO<Partial<MenuModel>>) => {
  const where: any = {}

  if (params.data?.name) {
    where.name = { contains: params.data.name }
  }
  if (params.data?.parentId !== undefined) {
    where.parentId = params.data.parentId
  }
  if (params.data?.status !== undefined) {
    where.status = Number(params.data.status)
  }
  if (params.data?.visible !== undefined) {
    where.visible = Number(params.data.visible)
  }

  // 查询总数
  const total = await prisma.menu.count({ where })

  // 查询数据
  const menuList = await prisma.menu.findMany({
    where,
    skip: params.startIndex,
    take: params.pageSize,
    orderBy: [
      { sortOrder: 'asc' },
      { createdTime: 'desc' }
    ]
  })

  // 格式化时间
  const formattedList = menuList.map(menu => {
    return {
      ...menu,
      status: String(menu.status),
      visible: String(menu.visible),
      createdTime: menu.createdTime.toISOString().replace('T', ' ').substring(0, 19),
      updatedTime: menu.updatedTime.toISOString().replace('T', ' ').substring(0, 19),
    }
  })

  const pageVOData = new PageVO<Array<typeof formattedList[0]>>(formattedList, params.currentPage, params.pageSize)
  pageVOData.total = total

  return new BodyResult(formattedList, 200).resultPageVO(pageVOData)
}

/**
 * 获取完整菜单树（管理用，包含所有状态的菜单）
 * GET /menu/menuFullTree
 */
const getMenuFullTree = async () => {
  const menus = await prisma.menu.findMany({
    orderBy: {
      sortOrder: 'asc'
    }
  })

  const tree = buildMenuTree(menus)
  return new BodyResult(tree, 200).result()
}

/**
 * 新增菜单
 * POST /menu/insertMenu
 */
const insertMenu = async (data: Partial<MenuModel> & { parentId?: string | null }) => {
  try {
    // 生成路径 path
    let path: string
    if (data.parentId) {
      // 查询父节点路径
      const parent = await prisma.menu.findUnique({
        where: { id: data.parentId }
      })
      if (!parent) {
        return new BodyResult(null, 1005).result() // 1005: 父节点不存在
      }
      // 先创建，再用 id 更新 path
      path = parent.path // 临时值，创建后会更新
    } else {
      path = '/' // 临时值
    }

    // 创建菜单
    const newMenu = await prisma.menu.create({
      data: {
        parentId: data.parentId || null,
        name: data.name || '',
        icon: data.icon || null,
        path: path,
        sortOrder: data.sortOrder ?? 0,
        route: data.route || null,
        link: data.link || null,
        target: data.target || '_self',
        status: data.status ?? 1,
        visible: data.visible ?? 1,
        remark: data.remark || null,
      }
    })

    // 更新 path 为完整物化路径
    const fullPath = data.parentId
      ? `${path}${newMenu.id}/`
      : `/${newMenu.id}/`

    await prisma.menu.update({
      where: { id: newMenu.id },
      data: { path: fullPath }
    })

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
    const updateData: any = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.icon !== undefined) updateData.icon = data.icon
    if (data.sortOrder !== undefined) updateData.sortOrder = Number(data.sortOrder)
    if (data.route !== undefined) updateData.route = data.route
    if (data.link !== undefined) updateData.link = data.link
    if (data.target !== undefined) updateData.target = data.target
    if (data.status !== undefined) updateData.status = Number(data.status)
    if (data.visible !== undefined) updateData.visible = Number(data.visible)
    if (data.remark !== undefined) updateData.remark = data.remark

    // 处理父节点变更（需要更新当前节点及所有子节点的 path）
    if (data.parentId !== undefined) {
      const currentMenu = await prisma.menu.findUnique({
        where: { id: data.id }
      })

      if (!currentMenu) {
        return new BodyResult(null, 1007).result() // 1007: 菜单不存在
      }

      // 不允许将自己设为自己的父节点
      if (data.parentId === data.id) {
        return new BodyResult(null, 1008).result() // 1008: 不能将菜单设为自身的子节点
      }

      const newParentId = data.parentId || null

      if (currentMenu.parentId !== newParentId) {
        // 计算新路径
        let newPath: string
        if (newParentId) {
          const parent = await prisma.menu.findUnique({
            where: { id: newParentId }
          })
          if (!parent) {
            return new BodyResult(null, 1005).result() // 1005: 父节点不存在
          }
          // 检查是否会导致循环引用（新父节点的路径是否包含当前节点 id）
          if (parent.path.includes(`/${data.id}/`)) {
            return new BodyResult(null, 1009).result() // 1009: 不能将菜单移到自身的子节点下
          }
          newPath = `${parent.path}${data.id}/`
        } else {
          newPath = `/${data.id}/`
        }

        // 更新所有子节点的 path
        const oldPath = currentMenu.path
        const descendants = await prisma.menu.findMany({
          where: {
            path: { startsWith: oldPath },
            id: { not: data.id }
          }
        })

        // 批量更新子节点路径
        for (const desc of descendants) {
          const updatedPath = desc.path.replace(oldPath, newPath)
          await prisma.menu.update({
            where: { id: desc.id },
            data: { path: updatedPath }
          })
        }

        updateData.parentId = newParentId
        updateData.path = newPath
      }
    }

    await prisma.menu.update({
      where: { id: data.id },
      data: updateData
    })

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
    const menu = await prisma.menu.findUnique({
      where: { id: data.id }
    })

    if (!menu) {
      return new BodyResult(null, 1007).result() // 1007: 菜单不存在
    }

    // 删除所有子菜单（通过 path 前缀匹配）
    await prisma.menu.deleteMany({
      where: {
        path: { startsWith: menu.path }
      }
    })

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
