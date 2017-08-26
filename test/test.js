const assert = require('assert');
const mocha = require('mocha');
const describe = mocha.describe;
const it = mocha.it;

describe('Array', () => {
  describe('#indexOf()', () => {
    it('should return -1 when the value is not present', function () {
      assert.equal(-1, [1, 2, 3].indexOf(4));
    });
  });
});
