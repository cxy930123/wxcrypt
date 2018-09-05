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
      .replace(/'/g, '&aops;')
      .replace(/"/g, '&quot;');
  }
  if (typeof obj === 'number') {
    return Number.isFinite(obj) ? String(obj) : '';
  }
  if (typeof obj !== 'object' || obj === null) {
    return '';
  }
  const xml = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (Array.isArray(value)) {
        for (const item of value) {
          xml.push(`<${key}>${o2x(item)}</${key}>`);
        }
      } else {
        xml.push(`<${key}>${o2x(value)}</${key}>`);
      }
    }
  }
  return xml.join('');
}
