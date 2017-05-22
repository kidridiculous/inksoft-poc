define(function (require) {
  var registerSuite = require('intern!object');
  var assert = require('intern/chai!assert');
  var StateUtil = require('util/StateUtil');

  var lettersMatcher = /^[a-zA-Z\s]*$/;

  registerSuite({
    name: 'StateUtil',
    'it returns valid regex string': function () {
      
      var result = new RegExp(StateUtil.getStateRegexFromAbbr('AZ'));

      assert.instanceOf(result, RegExp, 'not a valid regex');
    },
    'it upper cases abbreviation': function () {
      
      var result = new RegExp(StateUtil.getStateRegexFromAbbr('az'));

      assert.instanceOf(result, RegExp, 'not a valid regex');
    },
    'it throws an exception if state DNE': function () {
      let expectedErr = null;

      try {
      	StateUtil.getStateRegexFromAbbr('abc');
      } catch(err) {
      	expectedErr = err;
      }
      
      assert.isNotNull(expectedErr, 'did not throw an error');
    }
  });

})