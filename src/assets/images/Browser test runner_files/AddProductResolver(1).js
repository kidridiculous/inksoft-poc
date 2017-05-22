define('use-model/AddProductResolver', 
	['task/TaskFactory',
	'use-model/UseModelResolver', 
	'use-model/retail/AddProductUseModel'], 
	function(TaskFactory, UseModelResolver, AddProductUseModel) {

	class AddProductResolver extends UseModelResolver {

		constructor(config) {
			super(config);
			this.useOnce = false;
		}
		
		getButtonUseModel(classifier) {
			return new AddProductUseModel(classifier, this);
		}
	}

	return AddProductResolver;
});