"use strict";
exports.__esModule = true;
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
            .replace(/'/g, '&aops;')
            .replace(/"/g, '&quot;');
    }
    if (typeof obj === 'number') {
        return Number.isFinite(obj) ? String(obj) : '';
    }
    if (typeof obj !== 'object' || obj === null) {
        return '';
    }
    var xml = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            var value = obj[key];
            if (Array.isArray(value)) {
                for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
                    var item = value_1[_i];
                    xml.push("<" + key + ">" + o2x(item) + "</" + key + ">");
                }
            }
            else {
                xml.push("<" + key + ">" + o2x(value) + "</" + key + ">");
            }
        }
    }
    return xml.join('');
}
exports["default"] = o2x;
