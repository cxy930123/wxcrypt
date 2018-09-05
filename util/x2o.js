"use strict";
exports.__esModule = true;
/**
 * 将xml字符串转化为对象
 */
function x2o(xml) {
    var root = xml.match(/<(\w+)>(<!\[CDATA\[)?([\s\S]*)(\]\]>)?<\/\1>/g);
    if (!root) {
        return xml
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&aops;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&');
    }
    var obj = {};
    for (var _i = 0, root_1 = root; _i < root_1.length; _i++) {
        var node = root_1[_i];
        var _a = node.match(/<(\w+)>([\s\S]*)<\/\1>/), key = _a[1], value = _a[2];
        obj[key] = obj[key] || [];
        if (value.startsWith('<![CDATA[') && value.endsWith(']]>')) {
            obj[key].push(value.slice('<![CDATA['.length, -']]>'.length));
        }
        else {
            obj[key].push(x2o(value));
        }
    }
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (obj[key].length === 1) {
                obj[key] = obj[key][0];
            }
        }
    }
    return obj;
}
exports["default"] = x2o;
