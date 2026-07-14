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
