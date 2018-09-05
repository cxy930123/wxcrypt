"use strict";
exports.__esModule = true;
var crypto_1 = require("crypto");
/**
 * 生成签名
 */
exports["default"] = (function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return crypto_1.createHash('sha1')
        .update(args.sort().join(''))
        .digest('hex');
});
