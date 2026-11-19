import Koa from 'koa';
import koaBody from 'koa-body';
import cors from 'koa2-cors';
const serve = require('koa-static');
const path = require('path');
import {miniToken} from '@/token/index'
import koaJwt from 'koa-jwt';


import router from '@/controller/index'

const app = new Koa();
app.proxy = true
app.use(cors({
  origin: '*',
}))


//路由权限控制 除了path里的路径不需要验证token 其他都要
app.use(
    koaJwt({
        secret: 'my_app_secret'
    }).unless({
        path: [/^\/userAccount\/login/, /^\/register/]
    })
);

app.use(serve(path.join(__dirname, '../public')));

//token校验中间件
app.use((ctx, next) => {
  if (ctx.header && ctx.header.authorization) {
    const parts = ctx.header.authorization.split(' ');
    if (parts.length === 2) {
      //取出token
      const scheme = parts[0];
      const token = parts[1];
      
      if (/^Bearer$/i.test(scheme)) {
        try {
         const result = miniToken.verify(token)
          if(result){
            ctx.res.setHeader('Authorization',`Bearer `+ result);
          }
        } catch (error) {
          ctx.status = 401;
          ctx.body ='Protected resource, use Authorization header to get access\n';
        }
      }
    }
  }

  return next().catch(err => {
    if (err.status === 401) {
      ctx.status = 401;
      ctx.body =
        'Protected resource, use Authorization header to get access\n';
    } else {
      throw err;
    }});
 });   

 app.use( async (ctx, next) => {
  try {
    await next();
    
    // 处理 404 Not Found
    if (ctx.status === 404 && !ctx.body) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: 'Resource Not Found',
        code: 404
      };
    }
  } catch (err:any) {
    // 1. 设置状态码：优先使用 err.status，否则默认 500
    const status =  500;
    ctx.status = status;

    // 2. 统一返回格式
    ctx.body = {
      success: false,
      message: err.message || 'Internal Server Error',
      code: status,
      // 开发环境下可以返回堆栈信息，生产环境建议隐藏
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    };

    // 3. 触发应用级别的 error 事件，用于日志记录
    // 注意：不要在这里直接 console.error，而是交给 app.on('error') 处理
    ctx.app.emit('error', err, ctx);
  }
})

app.use(koaBody({
  multipart: true,  
  formidable: {
    uploadDir: path.join(__dirname, '../uploads'), // 设置文件上传目录
    keepExtensions: true,    // 保持文件的后缀
    maxFieldsSize: 20 * 1024 * 1024, // 字段的最大限制，2MB
  }
}))
app.use(router.routes()).use(router.allowedMethods())

app.listen(4000, () => {
  console.log('Server is running on http://localhost:4000');
});
