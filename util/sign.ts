import { createHash } from 'crypto';

/**
 * 生成签名
 */
export default (...args: string[]) => createHash('sha1')
  .update(args.sort().join(''))
  .digest('hex')
