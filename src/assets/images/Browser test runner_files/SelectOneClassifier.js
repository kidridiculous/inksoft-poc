define(function (require) {
	var registerSuite = require('intern!object');
	var assert = require('intern/chai!assert');
	var SelectOneClassifier = require('classification/SelectOneClassifier');
    
	registerSuite({
		name: 'SelectOneClassifier',

		'it creates a regex from string':function(){

			let instance = new SelectOneClassifier('definition', [], 'Arizona', []);
			
			assert.instanceOf(instance.targetOptionRegex, RegExp, 'its not creating a Regex from string');

		},
		'it can be created with a regex object':function(){

			let instance = new SelectOneClassifier('definition', [], {expression:'/^\d[a-zA-Z]*$/', flags:'gi'}, []);
			
			assert.instanceOf(instance.targetOptionRegex, RegExp, 'its not creating a Regex from expression object');

		},
		'it throws an error if the target option is not a string or object':function(){
			let errMsg = null, instance;
		
			try {
				instance = new SelectOneClassifier('definition', [], {}, []);
			} catch (err) {
				errMsg = err;
			}

			assert.isNotNull(errMsg, 'an error was not thrown');
		},
		'it matches by keyword against text neighbors':function() {
			let instance, element, result;

			instance = new SelectOneClassifier('shippingState', ['state', 'province', 'state/province'], 'Arizona', []);

			element = { textNeighbors: [{location:'ABOVE', text:'State'}]};


			result = instance.matchesKeywords(element);

			assert.isTrue(result, 'match was not found');
		},
		'it matches by keyword against text neighbors not INSIDE':function() {
			let instance, element, result;

			instance = new SelectOneClassifier('shippingState', ['state', 'province', 'state/province'], 'Arizona', []);

			element = { textNeighbors: [{location:'INSIDE', text:'Select'}, {location:'ABOVE', text:'Province'}]};


			result = instance.matchesKeywords(element);

			assert.isTrue(result, 'match was not found');
		},
		'it matches by Select tag options':function() {
			let instance, element, result;

			instance = new SelectOneClassifier('shippingState', ['state', 'province', 'state/province'], 'Arizona', []);

			element = { tagName:'SELECT', options:[{humanText:'Arkansas'},{humanText:'Alabama'},{humanText:'Arizona'},{humanText:'Iowa'}]};

			result = instance.matchesKeywords(element);

			assert.isTrue(result, 'match was not found');
		},
		'it matches by targetOption':function() {
			let instance, element, result;

			instance = new SelectOneClassifier('shippingState', ['state', 'province', 'state/province'], 'Arizona', []);
			instance.toggleTargetOption(true);

			element = { tagName:'SPAN', innerText:'Arizona'};

			result = instance.matchesKeywords(element);

			assert.isTrue(result, 'match was not found');
		},
		'it does not match by targetOption':function() {
			let instance, element, result;

			instance = new SelectOneClassifier('shippingState', ['state', 'province', 'state/province'], 'Arizona', []);
			instance.toggleTargetOption(false);

			element = { tagName:'SPAN', innerText:'1 - Arizona'};

			result = instance.matchesKeywords(element);

			assert.isFalse(result, 'match was found');
		},
		'it does not match when there is a negative word match':function() {
			let instance, element, result;

			instance = new SelectOneClassifier('shippingState', ['state', 'province', 'state/province'], 'Arizona', ['billing state']);

			element = { tagName:'SELECT', options:[{humanText:'Arizona'}], textNeighbors: [{location:'ABOVE', text:'Billing State'}, {location:'ABOVE', text:'province'}]};


			result = instance.matchesKeywords(element);

			assert.isFalse(result, 'match was incorrectly made');
		},
		'it score non standard drop down higher than keyword':function() {
			let instance, elementSmallerScore, elementBiggerScore , smallerScore, biggerScore;

			instance = new SelectOneClassifier('shippingState', ['state', 'province', 'state/province'], 'Arizona', ['billing state']);

			elementSmallerScore = { tagName:'DIV', textNeighbors: [{location:'ABOVE', text:'State', distance:10}]};
			elementBiggerScore = { tagName:'SPAN', textNeighbors: [{location:'ABOVE', text:'State', distance:10}], isNonStandardDropDown:true};

			

			smallerScore = instance.scoreMatch({matchLocation: 'KEYWORD', element:elementSmallerScore});
			biggerScore = instance.scoreMatch({matchLocation: 'KEYWORD', element:elementBiggerScore});

			assert.isAbove(biggerScore, smallerScore, 'dom drop down element did not have a larger score');

		},
		'it scores target non standard drop down higher than target option':function() {
			let instance, elementSmallerScore, elementBiggerScore , smallerScore, biggerScore;

			instance = new SelectOneClassifier('shippingState', ['state', 'province', 'state/province'], 'Arizona', ['billing state']);

			elementBiggerScore = { tagName:'DIV',  textNeighbors: [{location:'ABOVE', text:'State', distance:10}], isNonStandardDropDown:true};
			elementSmallerScore = { tagName:'SPAN', innerText:'Arizona'};

			smallerScore = instance.scoreMatch({matchLocation: 'TARGET_OPTION', element:elementSmallerScore});
			biggerScore = instance.scoreMatch({matchLocation: 'KEYWORD', element:elementBiggerScore});

			assert.isAbove(biggerScore, smallerScore, 'target option element did not have a larger score');

		},
		'it scores select option match higher than keyword':function() {
			let instance, elementSmallerScore, elementBiggerScore , smallerScore, biggerScore;

			instance = new SelectOneClassifier('shippingState', ['state', 'province', 'state/province'], 'Arizona', ['billing state']);

			elementSmallerScore = { tagName:'INPUT', type:'text', textNeighbors:[{location:'ABOVE', text:'State', distance:10}]};
			elementBiggerScore = { tagName:'SELECT', options:[{humanText:'Arizona'}], textNeighbors: [{location:'ABOVE', text:'State', distance:10}]};

			smallerScore = instance.scoreMatch({matchLocation: 'KEYWORD', element:elementSmallerScore});
			biggerScore = instance.scoreMatch({matchLocation: 'SELECT_OPTION', element:elementBiggerScore});

			assert.isAbove(biggerScore, smallerScore, 'select option element did not have a larger score');

		},
		'it scores a keyword context match higher than a target option with no context':function() {

			let instance, elementSmallerScore, elementBiggerScore , smallerScore, biggerScore, contextMatch;

			instance = new SelectOneClassifier('shippingState', ['state', 'province', 'state/province'], 'Arizona', ['billing state'], ['shipping address','shipping destination']);

			contextMatch = { nodeValue: 'Shipping address', ymin:500 };
			instance.matchesTags(contextMatch);

			elementSmallerScore = { tagName:'SPAN', innerText:'Arizona', ymin:100 };
			elementBiggerScore = { tagName:'DIV', textNeighbors: [{location:'ABOVE', text:'State', distance:10}], ymin:620, isNonStandardDropDown:true};

			smallerScore = instance.scoreMatch({matchLocation: 'TARGET_OPTION', element:elementSmallerScore});
			biggerScore = instance.scoreMatch({matchLocation: 'KEYWORD', element:elementBiggerScore});

			assert.isAbove(biggerScore, smallerScore, 'keyword match with context did not have a bigger score');

		},
		'it has match type enum':function() {
			assert.isNotNull(SelectOneClassifier.MatchType, 'MatchType is not defined');
		},
		'it matches by TARGET_OPTION': function(){

		}


	});
});