define(function (require) {
  var registerSuite = require('intern!object');
  var assert = require('intern/chai!assert');
  var CreditCardNumberResolver = require('use-model/CreditCardNumberResolver');
  var CreditCardNumber = require('use-model/userData/CreditCardNumber');

	registerSuite({
	    name: 'CreditCardNumberResolver',
	    'text input usemodel returns CreditCardNumber use model': function () {
	      
	    //Mock a classifier
	    let classifier = {timesResolved:1, matchesKeywords:() => {return false;}, reset:() => {}, getElement:() => {return {};}, postMatchUpdate:()=>{return;},hasElement:()=>{return false;}},
	    //Mock a resolver
	      	resolver = new CreditCardNumberResolver({definition:'creditCardNumber', data:'4444'});

	      	um = resolver.getTextInputUseModel(classifier);

	      
	      	assert.instanceOf(um, CreditCardNumber, 'should be an instance of CreditCardNumber use model');
	    }
	});
})