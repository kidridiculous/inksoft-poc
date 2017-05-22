define(function (require) {
  var registerSuite = require('intern!object');
  var assert = require('intern/chai!assert');
  var CreditCardNumber = require('use-model/userData/CreditCardNumber');

	var result = registerSuite({
	    name: 'CreditCardNumber use model',
	    'valuesMatch strips out non-numeric and matches': function () {
	      
	      	//Mock a classifier
	    	let cardNumber = '4444555566667777',
	    		classifier = {timesResolved:1, matchesKeywords:() => {return false;}, reset:() => {}, getElement:() => {return {segmentScrollY:0, center:{x:10, y:10}};}, postMatchUpdate:()=>{return;},hasElement:()=>{return false;}},
	    		//Mock a resolver
	      		resolver = {timesResolved:1, matchesKeywords:() => {return false;}, getData:() => {return cardNumber;}},

	      		formattedNumber = '4444-5555-6666-7777',

	      		um = new CreditCardNumber(classifier, resolver);
	      	
	      	var result = um.valuesMatch(formattedNumber, cardNumber);

	      	assert.isTrue(result, 'card numbers should match when removing non-numeric characters');
	      	
	    },
	    'valuesMatch does not match': function () {
	      
	    	//Mock a classifier
	    	let cardNumber = '4444555566667777',
	    		classifier = {timesResolved:1, matchesKeywords:() => {return false;}, reset:() => {}, getElement:() => {return {segmentScrollY:0, center:{x:10, y:10}};}, postMatchUpdate:()=>{return;},hasElement:()=>{return false;}},
	    		//Mock a resolver
	      		resolver = {timesResolved:1, matchesKeywords:() => {return false;}, getData:() => {return cardNumber;}},

	      		formattedNumber = '4444-5555-7777-6666',

	      		um = new CreditCardNumber(classifier, resolver);
	      	
	      	var result = um.valuesMatch(formattedNumber, cardNumber);

	      	assert.isFalse(result, 'card numbers should not match when removing non-numeric characters');
	    }
	});
})