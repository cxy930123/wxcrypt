require('should');
const { o2x, x2o } = require('../util');

describe('#obj2xml', () => {
  describe('#parse string', () => {
    it('#basic string', () => {
      const text = 'This is a basic string.';
      should(o2x(text)).eql(text);
    })

    it('#null should return empty string', () => {
      should(o2x(null)).eql('');
    })

    it(`#entities (&<>'")`, () => {
      should(o2x(`&<]]>'"`)).eql('&amp;&lt;]]&gt;&apos;&quot;');
    })

    it('cdata', () => {
      should(o2x('<xml></xml>')).eql('<![CDATA[<xml></xml>]]>');
    })
  })

  describe('#parse array', () => {
    it('#empty dimensional array', () => {
      should(o2x([])).eql('');
    })

    it('#one dimensional array', () => {
      should(o2x(['a', 'b'])).eql('<item>a</item><item>b</item>');
    })

    it('#nested array', () => {
      should(o2x([['1', null], ' '])).eql('<item><item>1</item><item></item></item><item> </item>')
    })

    it('#complex array', () => {
      should(o2x({ xml: [{ node: [[null]] }] })).eql('<xml><item><node><item><item></item></item></node></item></xml>');
    })
  })

  describe('#parse normal object', () => {
    it('#xml with normal ', () => {
      const obj = { xml: { a: 'a', b: 'c', c: 'b' } };
      should(x2o(o2x(obj))).eql(obj);
    })

    it('#more than one root tag', () => {
      const obj = { a: null, b: null };
      should(x2o(o2x(obj))).eql(obj);
    })
  })
})
