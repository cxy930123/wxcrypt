"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 将对象转化为xml字符串
 */
function o2x(obj) {
    if (typeof obj === 'string') {
        var cdata = /[<>&'"]/.test(obj);
        if (obj.includes(']]>')) {
            cdata = false;
        }
        return cdata ? "<![CDATA[" + obj + "]]>" : obj
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
        return obj.map(function (item) { return "<item>" + o2x(item) + "</item>"; }).join('');
    }
    return Object.keys(obj).map(function (key) { return "<" + key + ">" + o2x(obj[key]) + "</" + key + ">"; }).join('');
}
exports.default = o2x;
