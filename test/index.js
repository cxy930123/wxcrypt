require('should');
const randomstring = require('randomstring');
const { default: WXBizMsgCrypt } = require('..');
const { x2o } = require('../util');

describe('#main', () => {
  const token = randomstring.generate();
  const encodingAESKey = randomstring.generate(43);
  const appid = randomstring.generate(18);
  const crypto = new WXBizMsgCrypt(token, encodingAESKey, appid);

  let Encrypt, MsgSignature, TimeStamp, Nonce;
  let str, timestamp, nonce, echostr;

  it('#encrypt', () => {
    str = randomstring.generate();
    timestamp = `${Date.now()}`;
    nonce = randomstring.generate();
    ({
      xml: {
        Encrypt, MsgSignature, TimeStamp, Nonce
      }
    } = x2o(crypto.encryptMsg(str, timestamp, nonce)));
  })

  it('#encrypt should not be undefined', () => {
    should(Encrypt).not.be.undefined();
  })

  it('#signature should not be undefined', () => {
    should(MsgSignature).not.be.undefined();
  })

  it('#timestamp should not be undefined', () => {
    should(TimeStamp).not.be.undefined();
  })

  it('#nonce should not be undefined', () => {
    should(Nonce).not.be.undefined();
  })

  it('#decrypt', () => {
    echostr = crypto.decrypt(MsgSignature, TimeStamp, Nonce, Encrypt);
  })

  it('#echostr should equals str', () => {
    should(echostr).equals(str);
  })

  it('#timestamp should not be changed', () => {
    should(TimeStamp).equals(timestamp);
  })

  it('#nonce should not be changed', () => {
    should(Nonce).equals(nonce);
  })
})
