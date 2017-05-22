define('use-model/ShipToBillToSame', ['task/TaskFactory','use-model/UseModelResolver'], function(TaskFactory, UseModelResolver) {

	class ShipToBillToSame extends UseModelResolver {

		constructor(config) {
			super(config);	

		}
		
	}

	return ShipToBillToSame;	
});