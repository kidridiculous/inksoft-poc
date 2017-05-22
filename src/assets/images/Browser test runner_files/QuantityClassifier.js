define(function (require) {
	var registerSuite = require('intern!object');
	var assert = require('intern/chai!assert');
	var QuantityClassifier = require('classification/quantity/QuantityClassifier');

	var redColorElement = { nodeValue: "red", center:{x:180,y:180} };
	var blueColorElement = { nodeValue: "blue" , center:{x:180,y:180} };
	var blueSocksNameElement = { nodeValue: "Mens Blue Striped Crew Socks", center:{x:200,y:160}  };
	var socksNameElement = { nodeValue: "Mens Striped Crew Socks", center:{x:200,y:160}  };

	const definition = 'quantity';

	var productWithAttr = 
	{ "name": "Royal Princess Fragrance",
		"attributes": 
		{ "color" : 
			{
		        "label": "RED",
		        "title": "Color",
		        "value": "RED"
	    	}
	    }
    };	

    
	
	var getClassifierInstance = function(qtyVal, product) { return new QuantityClassifier(definition, qtyVal, product); }

	registerSuite({
		name: 'QuantityClassifier',

		'it can be instantiated':function(){

			var c = getClassifierInstance(1, productWithAttr);

			assert.equal(c.constructor.name, 'QuantityClassifier', 'it can not be created');

		},
		'it catalogs inputs elements of type text':function(){

			var c = getClassifierInstance(1, productWithAttr);
			
			const inputEl =  {tagName:'INPUT', type:'text', textNeighbors:[]};

			var matchFound = c.matchesKeywords(inputEl, []);

			assert.strictEqual(c.allInputs[0], inputEl, 'it is not cataloging text inputs');
			
		},
		'it catalogs inputs elements of type tel':function(){

			var c = getClassifierInstance(1, productWithAttr);
			
			const inputEl =  {tagName:'INPUT', type:'tel', textNeighbors:[]};

			var matchFound = c.matchesKeywords(inputEl, []);

			assert.strictEqual(c.allInputs[0], inputEl, 'it is not cataloging tel inputs');
			
		},
		'it catalogs inputs elements of type number':function(){

			var c = getClassifierInstance(1, productWithAttr);
			
			const inputEl =  {tagName:'INPUT', type:'number', textNeighbors:[]};

			var matchFound = c.matchesKeywords(inputEl, []);

			assert.strictEqual(c.allInputs[0], inputEl, 'it is not cataloging number inputs');
			
		},
		'it does not catalog other types of inputs':function(){

			var c = getClassifierInstance(1, productWithAttr);
			
			const inputEl =  {tagName:'INPUT', type:'email', textNeighbors:[]};

			var matchFound = c.matchesKeywords(inputEl, []);

			assert.equal(c.allInputs.length, 0, 'it is cataloging wrong inputs');
			
		},
		'it matches on qty inputs and product name in proximity':function(){

			var c = getClassifierInstance(1, productWithAttr);
			
			const nameEl =  {nodeValue:productWithAttr.name, textNeighbors:[], center:{x:500, y:210}, xmin:400, xmax: 600, ymin:180, ymax: 240};
			const inputEl =  {tagName:'INPUT', type:'number', textNeighbors:[], center: {x:535, y:780}, xmin:505, xmax:565, ymin:760, ymax: 800};

			c.matchesKeywords(nameEl, []);
			c.matchesKeywords(inputEl, []);

			c.postMatchUpdate();

			assert.strictEqual(c.getElement(), inputEl, 'm');
			
		},
		'it catalogs product name matches':function(){

			var c = getClassifierInstance(1, productWithAttr);
			
			const nameEl =  {nodeValue:productWithAttr.name, textNeighbors:[]};

			var matchFound = c.matchesKeywords(nameEl, []);

			assert.strictEqual(c.allProductNames[0], nameEl, 'it is not cataloging name match text');
			
		},
		'reset clears out name matches': function() {
			var c = getClassifierInstance(1, productWithAttr);
			c.allProductNames = [{}, {}];

			c.reset();

			assert.equal(c.allProductNames.length, 0, 'reset did not empty allProductNames')
		},
		'reset clears out input matches': function() {
			var c = getClassifierInstance(1, productWithAttr);
			c.allInputs = [{}, {}];

			c.reset();

			assert.equal(c.allInputs.length, 0, 'reset did not empty allInputs')
		},
		'get product name returns the product name': function() {
			var c = getClassifierInstance(1, productWithAttr);

			assert.equal(c.getProductName(), productWithAttr.name, 'product name is not being returned')
		}	


	});
});