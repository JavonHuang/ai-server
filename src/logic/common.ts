/**
 * JSON.stringify 不支持 bigint，需要转为 number
 */
export function safeBigInt(v: bigint | number | null | undefined): number {
  return typeof v === 'bigint' ? Number(v) : (v as number)
}