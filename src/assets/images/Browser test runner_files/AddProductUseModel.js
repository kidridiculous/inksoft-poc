define(function (require) {
  var registerSuite = require('intern!object');
  var assert = require('intern/chai!assert');
  var AddProductUseModel = require('use-model/retail/AddProductUseModel');

	registerSuite({
	    name: 'AddProductUseModel',
	    'it can be created': function () {
	     	const useModel = new AddProductUseModel({definition:'addToCart', getElement: () => {return { center:{x:1,y:1}}}}, {getData:()=>{return '';}});
	      
			assert.isDefined(useModel, 'Could not create use model');
	    }
	});
})