export * from './util';
import { sign, x2o, o2x } from './util';
import { createDecipheriv, pseudoRandomBytes, createCipheriv } from 'crypto';

const ERROR_SIGNATURE_DISMATCH = new Error('Signature dismatch.');
const ERROR_APPID_OR_CROPID_DISMATCH = new Error('AppID or CropID dismatch.');
const ERROR_TIMESTAMP_DISMATCH = new Error('The time difference between the server and the client cannot exceed 5 minutes.')

export default class {
  static readonly ERROR_SIGNATURE_DISMATCH = ERROR_SIGNATURE_DISMATCH;
  static readonly ERROR_APPID_OR_CROPID_DISMATCH = ERROR_APPID_OR_CROPID_DISMATCH;
  static readonly ERROR_TIMESTAMP_DISMATCH = ERROR_TIMESTAMP_DISMATCH;

  private aesKey: Buffer;
  private iv: Buffer;

  /**
   * 构造函数
   * @param token 公众号或企业微信Token
   * @param encodingAESKey 用于消息体的加密
   * @param appid 公众号的AppID或企业微信的CropID
   */
  constructor(
    private token: string,
    encodingAESKey: string,
    private appid: string
  ) {
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
  private decrypt(
    msgSignature: string,
    timestamp: string,
    nonce: string,
    msgEncrypt: string
  ) {
    // 校验时间戳
    if (Math.abs(+timestamp - Date.now()) > 300000) {
      throw ERROR_TIMESTAMP_DISMATCH;
    }

    // 校验消息体签名
    if (msgSignature !== sign(this.token, timestamp, nonce, msgEncrypt)) {
      throw ERROR_SIGNATURE_DISMATCH;
    }

    // AES解密
    const decipher = createDecipheriv('aes-256-cbc', this.aesKey, this.iv).setAutoPadding(false);
    let buffer = Buffer.concat([
      decipher.update(msgEncrypt, 'base64'),
      decipher.final()
    ]);

    // 去除开头的随机字符串[16字节]
    buffer = buffer.slice(16);

    // 获取消息明文长度[4字节]
    const msgLen = buffer.readInt32BE(0);
    buffer = buffer.slice(4);

    // 获取消息明文[msgLen字节]
    const msgDecrypt = buffer.slice(0, msgLen).toString();
    buffer = buffer.slice(msgLen);

    // 获取尾部填充部分的长度
    const padLen = buffer.slice(-1)[0];

    // 去除尾部填充部分[padLen字节]
    buffer = buffer.slice(0, -padLen);

    // 校验AppID（CropID）
    const appid = buffer.toString();
    if (appid !== this.appid) {
      throw ERROR_APPID_OR_CROPID_DISMATCH;
    }

    return msgDecrypt;
  }

  /**
   * 验证URL函数（仅用于企业微信）
   * @param msgSignature 从接收消息的URL中获取的msg_signature参数
   * @param timestamp 从接收消息的URL中获取的timestamp参数
   * @param nonce 从接收消息的URL中获取的nonce参数
   * @param echostr 从接收消息的URL中获取的echostr参数。注意，此参数必须是urldecode后的值
   * @return 解密后的明文消息内容，用于回包。注意，必须原样返回，不要做加引号或其它处理
   */
  verifyURL(
    msgSignature: string,
    timestamp: string,
    nonce: string,
    echostr: string
  ): string {
    return this.decrypt.apply(this, arguments);
  }

  /**
   * 解密函数
   * @param msgSignature 从接收消息的URL中获取的msg_signature参数
   * @param timestamp 从接收消息的URL中获取的timestamp参数
   * @param nonce 从接收消息的URL中获取的nonce参数
   * @param postData 从接收消息的URL中获取的整个post数据
   * @return 解密后的msg，以xml组织
   */
  decryptMsg(
    msgSignature: string,
    timestamp: string,
    nonce: string,
    postData: string
  ) {
    return this.decrypt(
      msgSignature,
      timestamp,
      nonce,
      x2o(postData).xml.Encrypt
    );
  }

  /**
   * 加密函数
   * @param replyMsg 返回的消息体原文
   * @param timestamp 时间戳，调用方生成
   * @param nonce 随机字符串，调用方生成
   * @return 用于返回的密文，以xml组织
   */
  encryptMsg(
    replyMsg: string,
    timestamp: string,
    nonce: string
  ) {
    // 生成随机字符串[16字节]
    const random16 = pseudoRandomBytes(16);

    // 消息明文
    const msgDecrypt = Buffer.from(replyMsg);

    // 消息明文长度
    const msgLen = Buffer.alloc(4);
    msgLen.writeInt32BE(msgDecrypt.length, 0);

    // AppID（或CropID）
    const appid = Buffer.from(this.appid);

    // 计算填充长度
    const rawLen = [
      random16,
      msgLen,
      msgDecrypt,
      appid
    ].map(
      buffer => buffer.length
    ).reduce((prev, next) => prev + next);
    const padLen = 32 - rawLen % 32;

    // 尾部填充部分
    const padding = Buffer.alloc(padLen, padLen);

    // AES加密
    const cipher = createCipheriv('aes-256-cbc', this.aesKey, this.iv).setAutoPadding(false);
    const msgEncrypt = Buffer.concat([
      cipher.update(random16),
      cipher.update(msgLen),
      cipher.update(msgDecrypt),
      cipher.update(appid),
      cipher.update(padding),
      cipher.final()
    ]).toString('base64');

    // 生成消息密文
    const msgSignature = sign(this.token, timestamp, nonce, msgEncrypt);
    return o2x({
      xml: {
        Encrypt: msgEncrypt,
        MsgSignature: msgSignature,
        TimeStamp: timestamp,
        Nonce: nonce
      }
    });
  }
}
