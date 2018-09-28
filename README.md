# wxcrypt(WXBizMsgCrypt)

微信公众号和企业号接收消息和事件时用于加解密的类（NodeJS版本）。

## 安装

```bash
$ npm install wxcrypt
```

## 引入

### ES6:

```js
import * as WXBizMsgCrypt from 'wxcrypt';
```

### Typescript:

```ts
import WXBizMsgCrypt = require('wxcrypt');
```

### NodeJS:

```js
const WXBizMsgCrypt = require('wxcrypt');
```

## 使用

### 初始化加解密类

```js
/**
 * @param {string} token 公众号或企业微信Token
 * @param {string} encodingAESKey 用于消息体的加密
 * @param {string} appid 公众号的AppID或企业微信的CropID
 */
new WXBizMsgCrypt(token, encodingAESKey, appid);
```

### 验证URL函数（仅企业微信）

本函数实现：

1. 签名校验
2. 解密数据包，得到明文消息内容

```js
/**
 * 验证URL函数（仅用于企业微信）
 * @param {string} msgSignature 从接收消息的URL中获取的msg_signature参数
 * @param {string} timestamp 从接收消息的URL中获取的timestamp参数
 * @param {string} nonce 从接收消息的URL中获取的nonce参数
 * @param {string} echostr 从接收消息的URL中获取的echostr参数。注意，此参数必须是urldecode后的值
 * @return {string} 解密后的明文消息内容，用于回包。注意，必须原样返回，不要做加引号或其它处理
 */
verifyURL(msgSignature, timestamp, nonce, echostr)
```

### 解密函数

本函数实现：

1. 签名校验
2. 解密数据包，得到明文消息结构体

```js
/**
 * @param {string} msgSignature 从接收消息的URL中获取的msg_signature参数
 * @param {string} timestamp 从接收消息的URL中获取的timestamp参数
 * @param {string} nonce 从接收消息的URL中获取的nonce参数
 * @param {string} postData 从接收消息的URL中获取的整个post数据
 * @return {string} 解密后的msg，以xml组织
 */
decryptMsg(msgSignature, timestamp, nonce, postData)
```

### 加密函数

本函数实现：

1. 加密明文消息结构体
2. 生成签名
3. 构造被动响应包

```js
/**
 * 加密函数
 * @param {string} replyMsg 返回的消息体原文
 * @param {string} timestamp 时间戳，调用方生成
 * @param {string} nonce 随机字符串，调用方生成
 * @return {string} 用于返回的密文，以xml组织
 */
encryptMsg(replyMsg, timestamp, nonce)
```

> __相关链接__：
> 
> 1. 微信公众平台技术文档[《消息加解密接入指引》](https://open.weixin.qq.com/cgi-bin/showdocument?action=dir_list&t=resource/res_list&verify=1&id=open1419318479&token=&lang=zh_CN)
> 2. 企业微信开发文档[《加解密方案说明》](https://work.weixin.qq.com/api/doc#12976)

## 辅助函数

除了对WXBizMsgCrypt的实现，本项目还提供几个辅助函数。

### 签名函数`sign`

传入若干个字符串，用于生成签名。可用于公众号url签名校验。具体算法为：

```js
sha1(sort(str1、str2、...))
```

#### 引入

```js
import { sign } from 'wxcrypt'; // ES6
const { sign } = require('wxcrypt'); // CommonJS
```

#### 使用

```ts
sign(...args: string[]): string;
```

### 对象转XML字符串`o2x`

传入任意对象，生成xml字符串。

> __注意：__
>
> 1. 对象最外层应该只有一个key，但这不是强制性的
> 2. 不支持嵌套数组

#### 引入

```js
import { o2x } from 'wxcrypt'; // ES6
const { o2x } = require('wxcrypt'); // CommonJS
```

#### 使用

```ts
o2x(obj: any): string
```

#### 示例1：数组的处理

数组将会展开为兄弟节点，但不允许嵌套的数组

```js
o2x({
  xml: {
    timestamp: 1536123965810,
    articles: {
      item: [
        {
          title: 'Article1',
          desc: 'Description1'
        },
        {
          title: 'Article2',
          desc: 'Description2'
        }
      ]
    }
  }
})
```

将返回如下字符串（格式化之后）：

```xml
<xml>
  <timestamp>1536123965810</timestamp>
  <articles>
    <item>
      <title>Article1</title>
      <desc>Description1</desc>
    </item>
    <item>
      <title>Article2</title>
      <desc>Description2</desc>
    </item>
  </articles>
</xml>
```

#### 示例2：特殊字符的处理

函数自动判断特殊字符的处理方式（使用CDATA或转义），具体如下：

1. 含有特殊字符（`<>&'"`）时，使用CDATA处理
2. 含有`]]>`时，由于会和CDATA冲突，使用转义处理

```js
o2x({
  xml: {
    // 没有特殊字符，不处理
    type: 'video',
    // 引号是特殊字符，使用CDATA处理
    title: '"愤怒＂的小鸟',
    // 含有"]]>"，需要转义
    description: ']]><[['
  }
})
```

将返回如下字符串（格式化之后）：

```xml
<xml>
  <type>video</type>
  <title><![CDATA["愤怒＂的小鸟]]></title>
  <description>]]&gt;&lt;[[</description>
</xml>
```

### XML字符串转对象`x2o`

传入xml字符串，生成js对象

> __注意：__
>
> 1. 虽然xml最外层应该只有一个根节点，但这不是强制的
> 2. 如果有两个以上兄弟节点的标签名相同，则会被合并成一个数组
> 3. 所有的文本节点都会转化为字符串（而不是数字或布尔类型）

#### 引入

```js
import { x2o } from 'wxcrypt'; // ES6
const { x2o } = require('wxcrypt'); // CommonJS
```

#### 使用

```ts
x2o(xml: string): any
```

#### 示例1：同名兄弟节点的处理

包含同名的兄弟节点时，将转化为数组

```js
x2o(`<xml>
  <timestamp>1536123965810</timestamp>
  <articles>
    <item>
      <title>Article1</title>
      <desc>Description1</desc>
    </item>
    <item>
      <title>Article2</title>
      <desc>Description2</desc>
    </item>
  </articles>
</xml>`)
```

将返回如下对象：

```js
{
  xml: {
    timestamp: '1536123965810',
    articles: {
      item: [{
        title: 'Article1',
        desc: 'Description1'
      }, {
        title: 'Article2',
        desc: 'Description2'
      }]
    }
  }
}
```

#### 示例2：特殊字符的处理

由于微信发来的xml字符串只都是用CDATA处理，而没有用转义处理，当遇到精心构造的消息时（如包含字符串`]]>`的消息），可能导致xml字符串不规范，甚至产生岐义。这种情况下，一般的xml解析器可能会解析失败。本函数针对这种情况做了特殊处理，使得解析的结果尽可能准确。

本示例中：

- `content`的值含有特殊字符串`]]>`，是CDATA的结束标记，使用一般的xml解析器将解析失败
- `title`和`description`字段有岐义，有两种方式解析，函数会自动选择一种作为解析结果

```js
x2o(`<xml>
  <type><![CDATA[custom]]></type>
  <content><![CDATA[]]><[[]]></content>
  <title><![CDATA[标题]]></title><description>]]></title>
  <description><![CDATA[描述]]></description>
</xml>`)
```

将返回如下对象：

```js
{
  xml: {
    type: 'custom',
    content: ']]><[[',
    title: '标题]]></title><description>',
    description: '描述'
  }
}
```
