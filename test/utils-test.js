const expect = require('chai').expect;
const { customFieldResolver, getDeepValue } = require('../src/utils');

describe('utils.js', function () {
  describe('customFieldResolver()', function () {
    it('should get a value from a field name', function () {
      expect(customFieldResolver).to.be.a('function');
      const obj = {
        a: 1,
        entity: {
          b: 2,
          c: 3
        },
        d: 4
      };
      expect(customFieldResolver(obj, null, null, { fieldName: 'a' })).to.equal(1);
      expect(customFieldResolver(obj, null, null, { fieldName: 'b' })).to.equal(2);
      expect(customFieldResolver(obj, null, null, { fieldName: 'c' })).to.equal(3);
      expect(customFieldResolver(obj, null, null, { fieldName: 'd' })).to.equal(4);
    });
  });
});
