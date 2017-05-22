define(function (require) {
  var registerSuite = require('intern!object');
  var assert = require('intern/chai!assert');
  var AddProductResolver = require('use-model/AddProductResolver');

	registerSuite({
	    name: 'AddProductResolver',
	    'it can be created': function () {
	     	const resolver = new AddProductResolver({definition:'addToCart'});
	      
			assert.isDefined(resolver, 'Could not create resolver');
	    }
	});
})