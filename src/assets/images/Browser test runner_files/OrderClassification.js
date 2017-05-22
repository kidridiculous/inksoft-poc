define(function (require) {
	var registerSuite = require('intern!object');
	var assert = require('intern/chai!assert');
	var OrderedClassification = require('classification/OrderedClassification');
	var PopupClassifier = require('classification/PopupClassifier');
	var DomClassifier = require('classification/DomClassifier');

	var instance;


	registerSuite({
		name: 'OrderedClassification',
		beforeEach: function() {
			instance = new OrderedClassification();
		},

		'it includes classifiers that are always enabled':function(){
			var list = [];
			list.push(new DomClassifier({priority:'1'}));
			list.push(new PopupClassifier({}));

			instance.initializeClassifiers(list);

			var count = instance.getClassifiersByPriority(1, true).length;
			assert.equal(count, 2, 'Should find \'always detect\' classifiers');
		},
		'it excludes classifiers that are always enabled':function(){
			var list = [];
			list.push(new DomClassifier({priority:'1'}));
			list.push(new PopupClassifier({}));

			instance.initializeClassifiers(list);

			var count = instance.getClassifiersByPriority(1, false).length;
			assert.equal(count, 1, 'Should find \'always detect\' classifiers');
		}
	});
});