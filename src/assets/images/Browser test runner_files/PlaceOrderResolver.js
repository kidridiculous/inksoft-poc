define('use-model/PlaceOrderResolver', ['task/TaskFactory','use-model/UseModelResolver', 'use-model/retail/PlaceOrderUseModel'], function(TaskFactory, UseModelResolver, PlaceOrderUseModel) {

	class PlaceOrderResolver extends UseModelResolver {

		constructor(config) {
			super(config);	
			this.isSubmit = config.submit;
			console.log('PlaceOrderResolver.isSubmit = ' + this.isSubmit);
		}

		getButtonUseModel(classifier) {
			return new PlaceOrderUseModel(classifier, this, this.isSubmit);
		}	
		
	}

	return PlaceOrderResolver;	
});