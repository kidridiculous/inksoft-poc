define(function (require) {
	var registerSuite = require('intern!object');
	var assert = require('intern/chai!assert');
	var KeywordValueClassifier = require('classification/KeywordValueClassifier');

	const definition = 'keyValClassifier';
	
	var getClassifierInstance = function(keywords, negativeWords, tags) { return new KeywordValueClassifier(definition, keywords, negativeWords, tags); }

	registerSuite({
		name: 'KeywordValueClassifier',

		'it picks the value element that is most horizontal VALUE BELOW KEYWORD':function(){

			var c = getClassifierInstance([], [], []);
				
			const kw1 = {nodeValue:'Shipping Total', center:{x:710,y:208}, xmin:700, xmax: 720, ymin:200, ymax: 216};

			const val1 = {nodeValue:'$0.00', center:{x:906,y:210}, xmin:900, xmax: 912, ymin:204, ymax: 216};
			const val2 = {nodeValue:'$45.99', center:{x:907,y:242}, xmin:902, xmax:912 , ymin:236, ymax: 248};

			c.keywordMatches.push({element:kw1});
			c.valueMatches.push(val1);
			c.valueMatches.push(val2);

			c.postMatchUpdate();
			const result = c.getElement();
			assert.strictEqual(result, val1, 'its not picking the most horizontal');
		},
		'it picks the value element that is most horizontal VALUE ABOVE KEYWORD':function(){

			var c = getClassifierInstance([], [], []);
				
			const kw1 = {nodeValue:'Shipping Total', center:{x:710,y:210}, xmin:700, xmax: 720, ymin:200, ymax: 220};

			const val1 = {nodeValue:'$0.00', center:{x:906,y:208}, xmin:900, xmax: 912, ymin:198, ymax: 214};
			const val2 = {nodeValue:'$45.99', center:{x:907,y:242}, xmin:902, xmax:912 , ymin:236, ymax: 248};

			c.keywordMatches.push({element:kw1});
			c.valueMatches.push(val1);
			c.valueMatches.push(val2);

			c.postMatchUpdate();
			const result = c.getElement();
			assert.strictEqual(result, val1, 'its not picking the most horizontal');
		}

	});
});