"use strict";
exports.__esModule = true;
var Builder = /** @class */ (function () {
    function Builder(xml) {
        if (xml === void 0) { xml = ''; }
        this.names = [];
        this.values = [];
        this.value = null;
        // 非转义普通文本|开始标签|结束标签|CDATA内容|缺少CDATA结束标记|非法字符<|转义字符|非法字符&|非法字符串]]>|剩余普通文本
        var regex = /([^]*?)(?:<(?:(\w+)>|\/(\w+)>|!\[CDATA\[(?:([^]*?)\]\]>|())|())|&(?:(\w+);|())|(\]\]\>))|([^]+)$/g;
        var match;
        while (match = regex.exec(xml)) {
            if (typeof match[1] !== 'undefined')
                this.text(match[1]);
            if (typeof match[2] !== 'undefined')
                this.start(match[2]);
            if (typeof match[3] !== 'undefined')
                this.end(match[3]);
            if (typeof match[4] !== 'undefined')
                this.text(match[4]);
            if (typeof match[5] !== 'undefined')
                throw new Error('缺少CDATA结束标记');
            if (typeof match[6] !== 'undefined')
                throw new Error('非法字符：<');
            if (typeof match[7] !== 'undefined') {
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
                        throw new Error("\u672A\u77E5\u7684\u5B9E\u4F53\u540D\u79F0\uFF1A" + match[7]);
                }
            }
            if (typeof match[8] !== 'undefined')
                throw new Error('字符“&”只能用于构成转义字符');
            if (typeof match[9] !== 'undefined')
                throw new Error('字符序列“]]>”不能出现在内容中');
            if (typeof match[10] !== 'undefined')
                this.text(match[10]);
        }
    }
    Builder.prototype.start = function (name) {
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
        }
        else {
            this.value = this.value || {};
            if (Array.isArray(this.value)) {
                throw new Error('<item>标签用于表示数组项，因此不能和其他普通标签成为兄弟节点');
            }
            if (this.value.hasOwnProperty(name)) {
                throw new Error("\u6807\u7B7E<" + name + ">\u5728\u5144\u5F1F\u8282\u70B9\u4E2D\u51FA\u73B0\u4E86\u591A\u6B21");
            }
        }
        this.names.push(name);
        this.values.push(this.value);
        this.value = null;
    };
    Builder.prototype.text = function (content) {
        if (!content)
            return;
        this.value = this.value || '';
        if (typeof this.value !== 'string') {
            if (content.trim()) {
                throw new Error('兄弟节点中不能同时含有标签节点和文本节点');
            }
        }
        else {
            this.value += content;
        }
    };
    Builder.prototype.end = function (name) {
        if (name !== this.names.pop()) {
            throw new Error('开始标签和结束标签不匹配');
        }
        var value = this.values.pop();
        if (name.toLowerCase() === 'item') {
            value.push(this.value);
        }
        else {
            value[name] = this.value;
        }
        this.value = value;
    };
    Builder.prototype.build = function () {
        if (this.names.length > 0) {
            throw new Error('部分标签没有闭合');
        }
        return this.value;
    };
    return Builder;
}());
exports["default"] = Builder;
