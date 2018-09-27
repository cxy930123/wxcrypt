import { x2o, o2x } from './util';
declare class WXBizMsgCrypt {
    private token;
    private appid;
    static readonly sign: (...args: string[]) => string;
    static readonly x2o: typeof x2o;
    static readonly o2x: typeof o2x;
    private aesKey;
    private iv;
    /**
     * 构造函数
     * @param token 公众号或企业微信Token
     * @param encodingAESKey 用于消息体的加密
     * @param appid 公众号的AppID或企业微信的CropID
     */
    constructor(token: string, encodingAESKey: string, appid: string);
    /**
     * 将密文翻译成明文
     * @param msgSignature 消息体签名
     * @param timestamp 时间戳
     * @param nonce 用于签名的随机字符串
     * @param msgEncrypt 消息体（Base64编码的密文）
     */
    private decrypt;
    /**
     * 验证URL函数（仅用于企业微信）
     * @param msgSignature 从接收消息的URL中获取的msg_signature参数
     * @param timestamp 从接收消息的URL中获取的timestamp参数
     * @param nonce 从接收消息的URL中获取的nonce参数
     * @param echostr 从接收消息的URL中获取的echostr参数。注意，此参数必须是urldecode后的值
     * @return 解密后的明文消息内容，用于回包。注意，必须原样返回，不要做加引号或其它处理
     */
    verifyURL(msgSignature: string, timestamp: string, nonce: string, echostr: string): string;
    /**
     * 解密函数
     * @param msgSignature 从接收消息的URL中获取的msg_signature参数
     * @param timestamp 从接收消息的URL中获取的timestamp参数
     * @param nonce 从接收消息的URL中获取的nonce参数
     * @param postData 从接收消息的URL中获取的整个post数据
     * @return 解密后的msg，以xml组织
     */
    decryptMsg(msgSignature: string, timestamp: string, nonce: string, postData: string): string;
    /**
     * 加密函数
     * @param replyMsg 返回的消息体原文
     * @param timestamp 时间戳，调用方生成
     * @param nonce 随机字符串，调用方生成
     * @return 用于返回的密文，以xml组织
     */
    encryptMsg(replyMsg: string, timestamp: string, nonce: string): string;
}
declare namespace WXBizMsgCrypt { }
export = WXBizMsgCrypt;
