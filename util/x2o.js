"use strict";
exports.__esModule = true;
var builder_1 = require("./x2o/builder");
/**
 * 将xml字符串转化为对象
 */
function x2o(xml) {
    return new builder_1["default"](xml).build();
}
exports["default"] = x2o;
