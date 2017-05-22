define(function (require) {
  var registerSuite = require('intern!object');
  var assert = require('intern/chai!assert');
  var TextUtil = require('util/TextUtil');

  var lettersMatcher = /^[a-zA-Z\s]*$/;

  registerSuite({
    name: 'TextUtil',
    'matchRegex matches on first': function () {
      
      var result = TextUtil.regexMatch(['foo bar','8675309','420'], lettersMatcher);

      assert.isTrue(result, 'Regex should match when the match is first');
    },
    'matchRegex matches on last': function () {
      
      var result = TextUtil.regexMatch(['8675309','711','weclome back'], lettersMatcher);

      assert.isTrue(result, 'Regex should match when the match is last');
    },
    'matchRegex matches on middle': function () {
      
      var result = TextUtil.regexMatch(['8675309', 'ill be back','420'], lettersMatcher);

      assert.isTrue(result, 'Regex should match when the match is in the middle');
    },
    'matchRegex does not find a match':function() {
      var result = TextUtil.regexMatch(['420', '8675309','711'], lettersMatcher);

      assert.isFalse(result, 'Regex should not find a match');
    },
    'exact order returns 1 when all match': function() {
      var result = TextUtil.exactOrderScore(['one two three'], ['one', 'two', 'three']);

      assert.equal(result, 1, 'did not score an exact match');
    },
    'it scores the last as the best': function() {
      var result = TextUtil.exactOrderScore(['one two five','one two three'], ['one', 'two', 'three']);

      assert.equal(result, 1, 'did not score the best match');
    },
    'it scores the middle as the best': function() {
      var result = TextUtil.exactOrderScore(['one two five','one two three', 'one three five'], ['one', 'two', 'three']);

      assert.equal(result, 1, 'did not score the best match');
    },
    'it scores the correctly': function() {
      var result = TextUtil.exactOrderScore(['one two four five'], ['one', 'two', 'three']);

      ///turn .6<repeating> into 6
      result = Math.floor(result*10);
      assert.equal(result, 6, 'did not score partially correctly');
    },
    'it strips non alphanumeric':function() {
        const result = TextUtil.stripNonAlphaNumeric('the cat\'s house was $50 dollars & zero % of one')

        assert.equal(result, 'the cats house was 50 dollars  zero  of one', 'alphanumeric characters not successfully removed');
    }
  });

})