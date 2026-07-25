/**
 * 校验必填字段
 * @param body 请求体
 * @param requiredFields 必填字段名列表
 * @returns 缺失的字段列表，为空数组表示校验通过
 */
export const getMissingFields = (body: Record<string, any>, requiredFields: string[]): string[] => {
  return requiredFields.filter(field => body[field] === undefined || body[field] === null || body[field] === '')
}