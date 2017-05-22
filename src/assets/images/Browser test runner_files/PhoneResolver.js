define(function (require) {
  var registerSuite = require('intern!object');
  var assert = require('intern/chai!assert');
  var PhoneResolver = require('use-model/PhoneResolver');

	registerSuite({
	    name: 'PhoneResolver',
	    'valuesMatch strips non-numeric': function () {
	      
	      this.skip('Need to refactor');
	      var rawPhone = '5558675309';
	      var formattedPhone = '(555) 867-5309';
	      var phoneResolver = new PhoneResolver({definition:'phoneNumber'});
	      var result = phoneResolver.valuesMatch(formattedPhone, rawPhone);

	      assert.isTrue(result, 'Phone numbers should match');
	    }
	});
})