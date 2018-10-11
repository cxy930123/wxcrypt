"use strict";
var util_1 = require("./util");
var crypto_1 = require("crypto");
var WXBizMsgCrypt = /** @class */ (function () {
    /**
     * 构造函数
     * @param token 公众号或企业微信Token
     * @param encodingAESKey 用于消息体的加密
     * @param appid 公众号的AppID或企业微信的CropID
     */
    function WXBizMsgCrypt(token, encodingAESKey, appid) {
        this.token = token;
        this.appid = appid;
        this.aesKey = Buffer.from(encodingAESKey, 'base64');
        this.iv = this.aesKey.slice(0, 16);
    }
    /**
     * 将密文翻译成明文
     * @param msgSignature 消息体签名
     * @param timestamp 时间戳
     * @param nonce 用于签名的随机字符串
     * @param msgEncrypt 消息体（Base64编码的密文）
     */
    WXBizMsgCrypt.prototype.decrypt = function (msgSignature, timestamp, nonce, msgEncrypt) {
        var _this = this;
        // 校验消息体签名
        if (msgSignature !== util_1.sign(this.token, timestamp, nonce, msgEncrypt)) {
            util_1.tryThrow(-40001, '签名验证错误');
        }
        // AES解密
        var decipher = util_1.tryThrow(-40004, 'AESKey 非法', function () { return crypto_1.createDecipheriv('aes-256-cbc', _this.aesKey, _this.iv).setAutoPadding(false); });
        var buffer = util_1.tryThrow(-40007, 'AES 解密失败', function () { return Buffer.concat([
            decipher.update(msgEncrypt, 'base64'),
            decipher.final()
        ]); });
        // 去除开头的随机字符串[16字节]
        buffer = buffer.slice(16);
        // 获取消息明文长度[4字节]
        var msgLen = buffer.readInt32BE(0);
        buffer = buffer.slice(4);
        // 获取消息明文[msgLen字节]
        var msgDecrypt = buffer.slice(0, msgLen).toString();
        buffer = buffer.slice(msgLen);
        // 获取尾部填充部分的长度
        var padLen = buffer.slice(-1)[0];
        // 去除尾部填充部分[padLen字节]
        buffer = buffer.slice(0, -padLen);
        // 校验AppID（CropID）
        var appid = buffer.toString();
        if (appid !== this.appid) {
            util_1.tryThrow(-40005, 'appid/corpid 校验错误');
        }
        return msgDecrypt;
    };
    /**
     * 验证URL函数（仅用于企业微信）
     * @param msgSignature 从接收消息的URL中获取的msg_signature参数
     * @param timestamp 从接收消息的URL中获取的timestamp参数
     * @param nonce 从接收消息的URL中获取的nonce参数
     * @param echostr 从接收消息的URL中获取的echostr参数。注意，此参数必须是urldecode后的值
     * @return 解密后的明文消息内容，用于回包。注意，必须原样返回，不要做加引号或其它处理
     */
    WXBizMsgCrypt.prototype.verifyURL = function (msgSignature, timestamp, nonce, echostr) {
        return this.decrypt.apply(this, arguments);
    };
    /**
     * 解密函数
     * @param msgSignature 从接收消息的URL中获取的msg_signature参数
     * @param timestamp 从接收消息的URL中获取的timestamp参数
     * @param nonce 从接收消息的URL中获取的nonce参数
     * @param postData 从接收消息的URL中获取的整个post数据
     * @return 解密后的msg，以xml组织
     */
    WXBizMsgCrypt.prototype.decryptMsg = function (msgSignature, timestamp, nonce, postData) {
        return this.decrypt(msgSignature, timestamp, nonce, util_1.tryThrow(-40002, 'xml解析失败', function () { return util_1.x2o(postData).xml.Encrypt; }));
    };
    /**
     * 加密函数
     * @param replyMsg 返回的消息体原文
     * @param timestamp 时间戳，调用方生成
     * @param nonce 随机字符串，调用方生成
     * @return 用于返回的密文，以xml组织
     */
    WXBizMsgCrypt.prototype.encryptMsg = function (replyMsg, timestamp, nonce) {
        var _this = this;
        // 生成随机字符串[16字节]
        var random16 = crypto_1.pseudoRandomBytes(16);
        // 消息明文
        var msgDecrypt = Buffer.from(replyMsg);
        // 消息明文长度
        var msgLen = Buffer.alloc(4);
        msgLen.writeInt32BE(msgDecrypt.length, 0);
        // AppID（或CropID）
        var appid = Buffer.from(this.appid);
        // 计算填充长度
        var rawLen = [
            random16,
            msgLen,
            msgDecrypt,
            appid
        ].map(function (buffer) { return buffer.length; }).reduce(function (prev, next) { return prev + next; });
        var padLen = 32 - rawLen % 32;
        // 尾部填充部分
        var padding = Buffer.alloc(padLen, padLen);
        // AES加密
        var cipher = util_1.tryThrow(-40004, 'AESKey 非法', function () { return crypto_1.createCipheriv('aes-256-cbc', _this.aesKey, _this.iv).setAutoPadding(false); });
        var msgEncrypt = util_1.tryThrow(-40006, 'AES 加密失败', function () { return Buffer.concat([
            cipher.update(random16),
            cipher.update(msgLen),
            cipher.update(msgDecrypt),
            cipher.update(appid),
            cipher.update(padding),
            cipher.final()
        ]).toString('base64'); });
        // 生成消息密文
        var msgSignature = util_1.tryThrow(-40003, 'sha加密生成签名失败', function () { return util_1.sign(_this.token, timestamp, nonce, msgEncrypt); });
        return util_1.tryThrow(-40011, '生成xml失败', function () { return util_1.o2x({
            xml: {
                Encrypt: msgEncrypt,
                MsgSignature: msgSignature,
                TimeStamp: timestamp,
                Nonce: nonce
            }
        }); });
    };
    WXBizMsgCrypt.sign = util_1.sign;
    WXBizMsgCrypt.x2o = util_1.x2o;
    WXBizMsgCrypt.o2x = util_1.o2x;
    return WXBizMsgCrypt;
}());
module.exports = WXBizMsgCrypt;
