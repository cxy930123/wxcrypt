export default class Builder {
  private names: string[] = [];
  private values = [];
  private value = null;

  constructor(xml: string = '') {
    // 非转义普通文本|开始标签|结束标签|CDATA内容|缺少CDATA结束标记|非法字符(<)|转义字符|非法字符(&)|非法字符串(]]>)|剩余普通文本
    const regex = /([^]*?)(?:<(?:(\w+)>|\/(\w+)>|!\[CDATA\[(?:([^]*?)\]\]>|())|())|&(?:(\w+);|())|(\]\]\>))|([^]+)$/g;
    let match: RegExpMatchArray;
    while (match = regex.exec(xml)) {
      // 非转义普通文本
      if (match[1]) this.text(match[1]);
      // 开始标签
      if (match[2]) this.start(match[2]);
      // 结束标签
      if (match[3]) this.end(match[3]);
      // CDATA内容
      if (typeof match[4] !== 'undefined') this.text(match[4]);
      // 缺少CDATA结束标记
      if (typeof match[5] !== 'undefined') throw new Error('缺少CDATA结束标记');
      // 非法字符(<)
      if (typeof match[6] !== 'undefined') throw new Error('非法字符：<');
      // 转义字符
      if (match[7]) {
        switch (match[7]) {
          case 'amp':
            this.text('&');
            break;
          case 'lt':
            this.text('<');
            break;
          case 'gt':
            this.text('>');
            break;
          case 'apos':
            this.text("'");
            break;
          case 'quot':
            this.text('"');
            break;
          default:
            throw new Error(`未知的实体名称：${match[7]}`);
        }
      }
      // 非法字符(&)
      if (typeof match[8] !== 'undefined') throw new Error('字符“&”只能用于构成转义字符');
      // 非法字符串(]]>)
      if (typeof match[9] !== 'undefined') throw new Error('字符序列“]]>”不能出现在内容中');
      // 剩余普通文本
      if (match[10]) this.text(match[10]);
    }
  }

  start(name: string) {
    if (typeof this.value === 'string') {
      if (this.value.trim()) {
        throw new Error('兄弟节点中不能同时含有文本节点和标签节点');
      }
      this.value = null;
    }
    if (name.toLowerCase() === 'item') {
      this.value = this.value || [];
      if (!Array.isArray(this.value)) {
        throw new Error('<item>标签用于表示数组项，因此不能和其他普通标签成为兄弟节点');
      }
    } else {
      this.value = this.value || {};
      if (Array.isArray(this.value)) {
        throw new Error('<item>标签用于表示数组项，因此不能和其他普通标签成为兄弟节点');
      }
      if (this.value.hasOwnProperty(name)) {
        throw new Error(`标签<${name}>在兄弟节点中出现了多次`);
      }
    }
    this.names.push(name);
    this.values.push(this.value);
    this.value = null;
  }

  text(content: string) {
    this.value = this.value || '';
    if (typeof this.value !== 'string') {
      if (content.trim()) {
        throw new Error('兄弟节点中不能同时含有标签节点和文本节点');
      }
    } else {
      this.value += content;
    }
  }

  end(name: string) {
    if (name !== this.names.pop()) {
      throw new Error('开始标签和结束标签不匹配');
    }
    const value = this.values.pop();
    if (name.toLowerCase() === 'item') {
      value.push(this.value);
    } else {
      value[name] = this.value;
    }
    this.value = value;
  }

  build() {
    if (this.names.length > 0) {
      throw new Error('部分标签没有闭合');
    }
    return this.value;
  }
}
