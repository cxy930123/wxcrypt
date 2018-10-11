"use strict";
exports.__esModule = true;
/**
 * 尝试执行函数，并返回执行结果
 * @param errcode 失败时的错误码
 * @param errmsg 失败时的错误描述
 * @param fn 尝试执行的函数
 */
function default_1(errcode, errmsg, fn) {
    if (fn === void 0) { fn = function () { throw new Error(errcode + ": " + errmsg); }; }
    try {
        return fn();
    }
    catch (err) {
        throw Object.assign(err, { errcode: errcode, errmsg: errmsg });
    }
}
exports["default"] = default_1;
