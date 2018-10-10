/**
 * 将对象转化为xml字符串
 */
export default function o2x(obj: any): string {
  if (typeof obj === 'string') {
    let cdata = /[<>&'"]/.test(obj);
    if (obj.includes(']]>')) {
      cdata = false;
    }
    return cdata ? `<![CDATA[${obj}]]>` : obj
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/'/g, '&apos;')
      .replace(/"/g, '&quot;');
  }
  if (typeof obj === 'number') {
    return Number.isFinite(obj) ? String(obj) : '';
  }
  if (typeof obj !== 'object' || obj === null) {
    return '';
  }
  if (Array.isArray(obj)) {
    return obj.map(item => `<item>${o2x(item)}</item>`).join('');
  }
  return Object.keys(obj).map(key => `<${key}>${o2x(obj[key])}</${key}>`).join('');
}
