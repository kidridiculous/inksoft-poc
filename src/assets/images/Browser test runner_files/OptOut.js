define('use-model/OptOut', ['task/TaskFactory','use-model/UseModelResolver'], function(TaskFactory, UseModelResolver) {

	class OptOut extends UseModelResolver {

		constructor(config) {
			super(config);
			this.useOnce = false;
		}
		
	}

	return OptOut;	
});