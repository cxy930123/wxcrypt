"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var x2o_builder_1 = require("./x2o-builder");
/**
 * 将xml字符串转化为对象
 */
function x2o(xml) {
    return new x2o_builder_1.default(xml).build();
}
exports.default = x2o;
