require('should');
const { x2o } = require('../util');

describe('#xml2obj', () => {
  describe('#parse string', () => {
    it('#basic string', () => {
      const text = 'This is a basic string.';
      should(x2o(text)).eql(text);
    })

    it('#empty string should return null', () => {
      should(x2o('')).eql(null);
    })

    it('#string with "&" should throw error', () => {
      should(() => x2o('string with "&"')).throwError();
    })

    it('#string with "<" should throw error', () => {
      should(() => x2o('string with "<"')).throwError();
    })

    it('#string with "]]>" should throw error', () => {
      should(() => x2o('string with "]]>"')).throwError();
    })

    it(`#entities (&<>'")`, () => {
      should(x2o('&amp;&lt;&gt;&apos;&quot;')).eql(`&<>'"`);
    })

    it('cdata', () => {
      should(x2o('before<![CDATA[<xml></xml>]]>end')).eql('before<xml></xml>end');
    })

    it('cdata without ending should throw error', () => {
      should(() => x2o('<![CDATA[')).throwError();
    })

    it('#known entity should throw error', () => {
      should(() => x2o('&entity;')).throwError();
    })
  })

  describe('#parse array', () => {
    it('#empty array', () => {
      should(x2o('<item></item>')).eql([null]);
    })

    it('#one dimensional array', () => {
      should(x2o('<item>a</item><item>b</item>')).eql(['a', 'b']);
    })

    it('#nested array', () => {
      should(x2o('<item><item>1</item><item></item></item><item> </item>')).eql([['1', null], ' '])
    })

    it('#complex array', () => {
      should(x2o('<xml><item><node><item><item></item></item></node></item></xml>')).eql({ xml: [{ node: [[null]] }] });
    })

    it('#mix item with common tags should throw error', () => {
      should(() => x2o('<item></item><xml></xml>')).throwError();
    })

    it('#mix item with text should throw error', () => {
      should(() => x2o('text<item></item>')).throwError();
      should(() => x2o('<item></item>text')).throwError();
    })
  })

  describe('#parse normal xml', () => {
    it('#xml with normal whitespace', () => {
      const xml = `
      <xml>
        <a>a</a>
        <b>c</b>
        <c>b</c>
      </xml>
      `;
      should(x2o(xml)).eql({ xml: { a: 'a', b: 'c', c: 'b' } });
    })

    it('#xml with more than one root tag', () => {
      should(x2o('<a></a><b></b>')).eql({ a: null, b: null });
    })

    it('#tags with same name in siblings should cause error', () => {
      should(() => x2o('<b></b><a></a><a></a>')).throwError();
      should(() => x2o('<a></a><a></a><b></b>')).throwError();
      should(() => x2o('<a></a><b></b><a></a>')).throwError();
    })

    it('#tags not matching should throw error', () => {
      should(() => x2o('<a>')).throwError();
      should(() => x2o('</a>')).throwError();
      should(() => x2o('<a><b></a></b>')).throwError();
    })
  })
})
