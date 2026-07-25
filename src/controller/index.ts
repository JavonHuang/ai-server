import Router from 'koa-router'
import userAccountContrller from './userAccountContrller'
import menuController from './menuController'

const router =new Router()

router.use('/userAccount',userAccountContrller)
router.use('/menu',menuController)

export default router