/**
 * 将xml字符串转化为对象
 */
export default function x2o(xml: string): any {
  const root = xml.match(/<(\w+)>(<!\[CDATA\[)?([\s\S]*)(\]\]>)?<\/\1>/g);
  if (!root) {
    return xml
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&aops;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&');
  }
  const obj = {};
  for (const node of root) {
    const [, key, value] = node.match(/<(\w+)>([\s\S]*)<\/\1>/);
    obj[key] = obj[key] || [];
    if (value.startsWith('<![CDATA[') && value.endsWith(']]>')) {
      obj[key].push(value.slice('<![CDATA['.length, -']]>'.length));
    } else {
      obj[key].push(x2o(value));
    }
  }
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (obj[key].length === 1) {
        obj[key] = obj[key][0];
      }
    }
  }
  return obj;
}
