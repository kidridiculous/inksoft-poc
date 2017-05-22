define(function (require) {
	var registerSuite = require('intern!object');
	var assert = require('intern/chai!assert');
	var ProductSkuInCartClassifier = require('classification/ProductSkuInCartClassifier');

	var definition = 'productSku.1';

	var redColorElement = { nodeValue: "red", center:{x:180,y:180} };
	var blueColorElement = { nodeValue: "blue" , center:{x:180,y:180} };
	var blueSocksNameElement = { nodeValue: "Mens Blue Striped Crew Socks", center:{x:200,y:160}  };
	var socksNameElement = { nodeValue: "Mens Striped Crew Socks", center:{x:200,y:160}  };

	var productWithAttr = 
	{ "name": "Mens Striped Crew Socks",
		"attributes": 
		{ "color" : 
			{
		        "label": "RED",
		        "title": "Color",
		        "value": "RED"
	    	}
	    }
    };	

    var productWithExceptionAttr = 
	{ "name": "Signature Hat",
		"attributes": 
		{ "size" : 
			{
		        "label": "One Size",
		        "title": "Size",
		        "value": "one size"
	    	}
	    }
    };	

    var productWithEncodedName = 
	{ "name": "Men&#039;s Hat",
		"attributes": 
		{ "size" : 
			{
		        "label": "One Size",
		        "title": "Size",
		        "value": "one size"
	    	}
	    }
    };

    var productWithChars = 
	{ "name": "Antigua� Hat®",
		"attributes": 
		{ "size" : 
			{
		        "label": "One Size",
		        "title": "Size",
		        "value": "one size"
	    	}
	    }
    };	

    var productWithAmps = 
	{ "name": "Van Heusen Dress Shirts Big & Tall Wrinkle Free Flex Collar Dress Shirt",
		"attributes": 
		{ "size" : 
			{
		        "label": "One Size",
		        "title": "Size",
		        "value": "one size"
	    	}
	    }
    };	


    var productNoAttr = 
		{ "name": "Mens Blue Striped Crew Socks",
		  "attributes": {}
	    };	
	
	var getClassifierInstance = function(product) { return new ProductSkuInCartClassifier(definition, product); }

	registerSuite({
		name: 'ProductSkuInCartClassifier',

		'it finds a match by product name':function(){

			var c = getClassifierInstance(productNoAttr);
			

			var matchFound = c.matchesKeywords(blueSocksNameElement, []);

			assert.lengthOf(c.nameMatches, 1, 'its not matching by product name');
		},
		'it finds a match by attribute label':function(){

			var c = getClassifierInstance(productWithAttr);
			

			var matchFound = c.matchesKeywords(redColorElement, []);

			assert.lengthOf(c.attributeMatches['color'], 1, 'its not matching by attribute');
		},
		'it doesnt match by attribute label':function(){

			var c = getClassifierInstance(productWithAttr);
			

			var matchFound = c.matchesKeywords(blueColorElement, []);

			assert.isFalse(matchFound, 'its shouldnt match');
		},
		'it positively classifies when it finds everything':function() {
			var c = getClassifierInstance(productWithAttr);
			
			c.matchesKeywords(redColorElement, []);
			c.matchesKeywords(socksNameElement, []);
			c.postMatchUpdate();

			assert.isTrue(c.hasElement(), 'expected classifier to have matching element');	
		},
		'it does not classify when it doesnt find everything':function() {
			var c = getClassifierInstance(productWithAttr);
			
			c.matchesKeywords(blueColorElement, []);
			c.matchesKeywords(socksNameElement, []);
			c.postMatchUpdate();

			assert.isFalse(c.hasElement(), 'expected classifier to not have a matching element');	
		},
		'it does not classifies when outside of proximity':function() {
			var c = getClassifierInstance(productWithAttr);
			var redColorFarAway = JSON.parse(JSON.stringify(redColorElement));

			redColorFarAway.center.x = 45;
			redColorFarAway.center.y = 845;

			c.matchesKeywords(redColorFarAway, []);
			c.matchesKeywords(socksNameElement, []);
			c.postMatchUpdate();

			assert.isFalse(c.hasElement(), 'expected classifier to not have matching element');	
		},
		'it excludes attributes that are in the exception list':function() {
			var c = getClassifierInstance(productWithExceptionAttr);
						
			assert.isFalse(c.hasAttributes(), 'classifier should not have any attributes');
		},
		'it decodes html text in product name': function() {
			var c = getClassifierInstance(productWithEncodedName);

			var result = c.getProductName();
						
			assert.equal(result, 'men\'s hat', 'classifier should not have any attributes');

		},
		'it does a relaxed match by name': function() {
			var c = getClassifierInstance(productWithChars);

			c.relax();

			var result = c.matchesName({}, ['antigua® hat']);
						
			assert.isTrue(result, 'classifier should match by name');
		},
		'it does not a match when relaxed by name': function() {
			var c = getClassifierInstance(productWithChars);

			c.relax();

			var result = c.matchesName({}, ['antigua dress®']);
						
			assert.isFalse(result, 'classifier should not match by name');
		},
		'it does a loose match by name': function() {
			var c = getClassifierInstance(productWithChars);

			c.relax();
			c.relax();

			var result = c.matchesName({}, ['antigua® hat xl']);
						
			assert.isTrue(result, 'classifier should match by name');
		},
		'it does not a match when loose by name': function() {
			var c = getClassifierInstance(productWithChars);

			c.relax();
			c.relax();

			var result = c.matchesName({}, ['antigua xl black']);
						
			assert.isFalse(result, 'classifier should not match by name');
		},
		'it match when loose when ampersands present': function() {
			var c = getClassifierInstance(productWithAmps);

			c.relax();
			c.relax();	

		    
			var result = c.matchesName({}, ['van heusen dress shirts flex collar glen plaid big']);
						
			assert.isTrue(result, 'classifier should not match by name');
		}

	});
});