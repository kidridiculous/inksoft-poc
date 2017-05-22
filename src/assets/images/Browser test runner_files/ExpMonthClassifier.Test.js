define(function(require) {
	const registerSuite = require('intern!object');
	const assert = require('intern/chai!assert');
	const SelectOneClassifier = require('classification/SelectOneClassifier');
    const ExpMonthClassifier = require('classification/ExpMonthClassifier');

    // constructor(definition, keywords, expMonth, negativeWords, contextKeywords, priority)
    
	registerSuite({
		name: 'ExpMonthClassifier',
		'it converts a numberic expMonth into a string': () => {
			
            const instance = new ExpMonthClassifier('expMonth', [], 9, [], [], 1);
            console.warn(instance);
			
			assert.isString(instance.expMonth, 'it\'s not converting a numeric expMonth argument to a string');
		},
		'it converts single-length expMonth to double-length format': () => {

			const instance = new ExpMonthClassifier('expMonth', [], '9', [], [], 1);
			
			assert.equal(instance.expMonth, '09', 'it\'s not converting a single-length expMonth to a double-length expMonth correctly');
		},
        'it does not improperly convert double-length expMonth': () => {

			const instance = new ExpMonthClassifier('expMonth', [], '09', [], [], 1);
			
			assert.equal(instance.expMonth, '09', 'it\'s converting a double-length expMonth improperly');
		},
        'it does not improperly convert double-length expMonth': () => {

			const instance = new ExpMonthClassifier('expMonth', [], 11, [], [], 1);
			
			assert.equal(instance.expMonth, '11', 'it\'s converting a double-length expMonth improperly');
		},
        'it matches expMonth correctly': () => {

			const instance = new ExpMonthClassifier('expMonth', [], '2', [], [], 1);

            const element = {
                options: [
                    {
                        humanText: '1 - Jan'
                    },
                    {
                        humanText: '2 - Feb'
                    }
                ]
            };

            const result = instance.matchElementOptions(element);
			
			assert.isTrue(result, 'it didn\'t match expMonth correctly for an option format type 2 - Feb');
		},
        'it matches expMonth correctly': () => {

			const instance = new ExpMonthClassifier('expMonth', [], '10', [], [], 1);

            const element = {
                options: [
                    {
                        humanText: '10 - October'
                    }
                ]
            };

            const result = instance.matchElementOptions(element);
			
			assert.isTrue(result, 'it didn\'t match expMonth correctly for an option format type 10 - October');
		},
        'it matches expMonth correctly': () => {

			const instance = new ExpMonthClassifier('expMonth', [], '10', [], [], 1);

            const element = {
                options: [
                    {
                        humanText: '10 - Nov'
                    }
                ]
            };

            const result = instance.matchElementOptions(element);
			
			assert.isFalse(result, 'it didn\'t match expMonth correctly for an option format type 10 - Nov');
		},
        'it matches expMonth correctly for 4-length month abbreviations': () => {

			const instance = new ExpMonthClassifier('expMonth', [], '09', [], [], 1);

            const element = {
                options: [
                    {
                        humanText: '9 - Sept'
                    },
                    {
                        humanText: '12 - Dec'
                    }
                ]
            };

            const result = instance.matchElementOptions(element);
			
			assert.isTrue(result, 'it didn\'t match expMonth correctly for an option format type 9 - Sept');
		}
    });
});
