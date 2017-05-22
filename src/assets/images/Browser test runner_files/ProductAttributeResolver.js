define(function (require) {
  var registerSuite = require('intern!object');
  var assert = require('intern/chai!assert');
  var ProductAttributeResolver = require('use-model/ProductAttributeResolver');

  let mockClassifier = { getElement:() => {return {isButton:true, center:{x:100,y:100}};}, getMatchData:()=>{ return 'ATTRIBUTE_TITLE';},hasElement:()=>{return true;}, resolved:()=>{}};

	registerSuite({
	    name: 'ProductAttributeResolver',
	    'it increments consecutive rescan': function () {
	      
	    	//Mock a classifier
	    	let resolver = new ProductAttributeResolver({definition:'productAttr.size', data:'XL'});
	      	
	      	var um = resolver.getUseModel(mockClassifier);
	      	um = resolver.getUseModel(mockClassifier);
	      	
	      	assert.equal(resolver.consecutiveRescans, 2, 'It should have two consecutive rescans');
	    },
	    'it produces a RescanUseModel when matched by attribute title': function() {
			//Mock a classifier
	    	let resolver = new ProductAttributeResolver({definition:'productAttr.size', data:'XL'});
	      	
	      	var um = resolver.getUseModel(mockClassifier);
	      	
	      	assert.equal(um.constructor.name, 'RescanUseModel', 'It should produce a rescan use model');
	    },
	    'it produces no usemodels after 5 consecutive rescans': function () {
	      
	    	let resolver = new ProductAttributeResolver({definition:'productAttr.size', data:'XL'});
	      	
	      	var um = resolver.getUseModel(mockClassifier);
	      	um = resolver.getUseModel(mockClassifier);
	      	um = resolver.getUseModel(mockClassifier);
	      	um = resolver.getUseModel(mockClassifier);
	      	um = resolver.getUseModel(mockClassifier);
	      	um = resolver.getUseModel(mockClassifier);
	      	
	      	assert.isNull(um, 'it should not produce a use model');
	    },

	});
})