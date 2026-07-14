import Router from 'koa-router'
import userAccountContrller from './userAccountContrller'

const router =new Router()

router.use('/userAccount',userAccountContrller)

export default router