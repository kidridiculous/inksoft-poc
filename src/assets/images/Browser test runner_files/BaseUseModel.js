define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');
    var BaseUseModel = require('use-model/generic/BaseUseModel');


    registerSuite({
	    name: 'BaseUseModel',
	    'it resolves': function () {
            var deferred = this.async(5000);
            
            const instance = new BaseUseModel();
            instance.execute().then(deferred.callback(function(output) {
                assert.isTrue(output, 'Result is not truthy');
            }));
	    },
        'it completes the usemodel': function () {
            var deferred = this.async(5000);
            
            const instance = new BaseUseModel();
            instance.execute().then(deferred.callback(function(output) {
                assert.isTrue(instance.isComplete() , 'Result is not truthy');
            }));
	    }
	});
})