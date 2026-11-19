import { BodyResult } from "@/utils/bodyResult";
import Joi from "joi";

/**
 * 验证中间件工厂
 * @param {Object} schema - Joi 验证规则对象
 * @param {String} source - 数据来源: 'body', 'query', 'params'
 */
const validate = (schema: Joi.ObjectSchema<any>, source = 'body') => {
  return async (ctx:any, next:any) => {
    let data;
    // 根据来源获取数据
    if (source === 'body') data = ctx.request.body;
    else if (source === 'query') data = ctx.query;
    else if (source === 'params') data = ctx.params;

    // 执行验证
    const { error, value } = schema.validate(data, {
      abortEarly: false, // 返回所有错误，而不是遇到第一个就停止
      stripUnknown: true // 移除未在 schema 中定义的字段
    });

    if (error) {
      // 格式化错误信息
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      ctx.status = 400;
      ctx.body =  new BodyResult(errors, 400)
      return; // 终止后续中间件执行
    }

    // 可选：将清洗后的数据挂载到 ctx 上，防止原始数据被篡改
    // ctx.validatedData = value; 
    
    await next();
  };
};

export default validate;
