define(function (require) {
	var registerSuite = require('intern!object');
	var assert = require('intern/chai!assert');
	var StateClassifier = require('classification/StateClassifier');
    
	registerSuite({
		name: 'StateClassifier',
		'it filters TARGET_OPTION when not rescan':function() {
			let elementTargetOpt, elementKeyword, instance = new StateClassifier('shippingState', ['state', 'province', 'state/province'], 'AZ', ['billing state'], ['shipping address','shipping destination']);
			
			elementTargetOpt = { tagName:'SPAN', innerText:'Arizona', ymin:100 };
			elementKeyword = { tagName:'DIV', textNeighbors: [{location:'ABOVE', text:'State', distance:10}], ymin:620, isNonStandardDropDown:true};
			
			instance.elementMatches.push({matchLocation: 'TARGET_OPTION', element:elementTargetOpt});
			instance.elementMatches.push({matchLocation: 'KEYWORD', element:elementKeyword});

			instance.postMatchUpdate();

			assert.equal(instance.elementMatches.length, 1, 'target option matches not filtered');

		},
		'it keeps TARGET_OPTION when rescan':function() {
			let elementTargetOpt, elementKeyword, instance = new StateClassifier('shippingState', ['state', 'province', 'state/province'], 'AZ', ['billing state'], ['shipping address','shipping destination']);
			
			elementTargetOpt = { tagName:'SPAN', innerText:'Arizona', ymin:100 };
			elementKeyword = { tagName:'DIV', textNeighbors: [{location:'ABOVE', text:'State', distance:10}], ymin:620, isNonStandardDropDown:true};
			
			instance.elementMatches.push({matchLocation: 'TARGET_OPTION', element:elementTargetOpt});
			instance.elementMatches.push({matchLocation: 'KEYWORD', element:elementKeyword});

			instance.toggleRescan(true);
			
			instance.postMatchUpdate();

			assert.equal(instance.elementMatches.length, 2, 'target option matches not kept');

		}


	});
});