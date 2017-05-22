define(function (require) {
  var registerSuite = require('intern!object');
  var assert = require('intern/chai!assert');
  var Browser = require('system/Browser');

  registerSuite({
    name: 'Browser Suite',
    beforeEach: function() {
    	Browser.webRequestCount = 0;
    	Browser.webNavigationCount = 0;
    },
    'Browser isActive when webRequests > 0': function () {
      
      Browser.webRequestCount = 1;

      var result = Browser.isActive();

      assert.equal(result, true,
        'Browser.isActive() should be true');
    },
    'Browser isActive when webNavigation > 0': function () {
      
      Browser.webNavigationCount = 1;

      var result = Browser.isActive();

      assert.equal(result, true,
        'Browser.isActive() should be true');
    }


  });

})