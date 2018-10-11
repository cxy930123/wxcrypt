/**
 * 尝试执行函数，并返回执行结果
 * @param errcode 失败时的错误码
 * @param errmsg 失败时的错误描述
 * @param fn 尝试执行的函数
 */
export default function <T>(
  errcode: number, errmsg: string,
  fn: () => T = () => { throw new Error(`${errcode}: ${errmsg}`); }
): T {
  try {
    return fn();
  } catch (err) {
    throw Object.assign(err, { errcode, errmsg });
  }
}
