define(function (require) {
	var registerSuite = require('intern!object');
	var assert = require('intern/chai!assert');
	var ProductAttributeClassifier = require('classification/ProductAttributeClassifier');

	var definition = 'color';

	var attribute = {
        "label": "RED",
        "title": "Color",
        "value": "RED"//s,
        // "icon": "https://anf.scene7.com/is/image/anf/anf_126054_sw112x112?wid=42"
    };

    var sizeAttr = {
        "label": "6",
        "title": "Size",
        "value": "30106"//s,
        // "icon": "https://anf.scene7.com/is/image/anf/anf_126054_sw112x112?wid=42"
    };
	
	var getClassifierInstance = function() { return new ProductAttributeClassifier(definition, attribute); }
	var getSizeInstance = function() { return new ProductAttributeClassifier('productAttribute.size', sizeAttr); }

	var sizeElement = { tagName:'SELECT', center:{x:100,y:100}, xmin:60, xmax:140, ymin: 85, ymax:115, options:[{humanText:'6', value:'6'},{humanText:'8',value:'8'},{humanText:'10',value:'10'},{humanText:'12',value:'12'}], textNeighbors:[{text:'Select Size', location:'LEFT', distance: 16, centerDistance: 56}]}
	var qtyElement = { tagName:'SELECT', center:{x:100,y:100}, xmin:60, xmax:140, ymin: 85, ymax:115, options:[{humanText:'1', value:'1'},{humanText:'2',value:'2'},{humanText:'3',value:'3'},{humanText:'4',value:'4'},{humanText:'5',value:'5'},{humanText:'6',value:'6'}], textNeighbors:[{text:'Select Qty', location:'LEFT', distance: 16, centerDistance: 56}]}

	registerSuite({
		name: 'ProductAttributeClassifier',

		'it finds a match using a keyword':function(){

			var c = getClassifierInstance();
			
			var element = {
				innerText:'red'
			};

			scannedTextList = [
				'doodoo',
				'hairdoo',
				'bamboo',
				'red'
			];

			var matchFound = c.matchesKeywords(element, scannedTextList);

			var actualKeywordMatches = c.keywordMatches; 

			var expectedKeywordMatches = [
				{
					element:{
						innerText:'red'
					},
					matchLocation:"HUMAN",
					matchType:"EXACT"
				}
			];
			
			var message = 'finds one exact match in location : human , innerText'; 

			assert.deepEqual(actualKeywordMatches , expectedKeywordMatches , message);
		},
		'it finds a match in select el options':function() {
			var c = getSizeInstance();

			var result = c.matchesKeywords(sizeElement);

			assert.isTrue(result, 'classifier did not match by select options');
		},
		'it does negative match check for select option':function() {
			var c = getSizeInstance();
			
			var result = c.matchesKeywords(qtyElement);

			assert.isFalse(result, 'classifier incorrectly matched');
		}	
	});
});