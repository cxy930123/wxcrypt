import { sign, x2o, o2x, tryThrow } from './util';
import { createDecipheriv, pseudoRandomBytes, createCipheriv } from 'crypto';

class WXBizMsgCrypt {
  static readonly sign = sign;
  static readonly x2o = x2o;
  static readonly o2x = o2x;

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
    // 校验消息体签名
    if (msgSignature !== sign(this.token, timestamp, nonce, msgEncrypt)) {
      tryThrow(-40001, '签名验证错误');
    }

    // AES解密
    const decipher = tryThrow(-40004, 'AESKey 非法', () => createDecipheriv('aes-256-cbc', this.aesKey, this.iv).setAutoPadding(false));
    let buffer = tryThrow(
      -40007, 'AES 解密失败',
      () => Buffer.concat([
        decipher.update(msgEncrypt, 'base64'),
        decipher.final()
      ])
    );

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
      tryThrow(-40005, 'appid/corpid 校验错误');
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
      tryThrow(-40002, 'xml解析失败', () => x2o(postData).xml.Encrypt)
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
    const cipher = tryThrow(-40004, 'AESKey 非法', () => createCipheriv('aes-256-cbc', this.aesKey, this.iv).setAutoPadding(false));
    const msgEncrypt = tryThrow(
      -40006, 'AES 加密失败',
      () => Buffer.concat([
        cipher.update(random16),
        cipher.update(msgLen),
        cipher.update(msgDecrypt),
        cipher.update(appid),
        cipher.update(padding),
        cipher.final()
      ]).toString('base64')
    );

    // 生成消息密文
    const msgSignature = tryThrow(-40003, 'sha加密生成签名失败', () => sign(this.token, timestamp, nonce, msgEncrypt));
    return tryThrow(
      -40011, '生成xml失败',
      () => o2x({
        xml: {
          Encrypt: msgEncrypt,
          MsgSignature: msgSignature,
          TimeStamp: timestamp,
          Nonce: nonce
        }
      })
    );
  }
}

export = WXBizMsgCrypt;
