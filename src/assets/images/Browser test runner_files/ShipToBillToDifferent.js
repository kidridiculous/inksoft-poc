define('use-model/ShipToBillToDifferent', ['task/TaskFactory','use-model/UseModelResolver'], function(TaskFactory, UseModelResolver) {

	class ShipToBillToDifferent extends UseModelResolver {

		constructor(config) {
			super(config);	
		}
		
	}

	return ShipToBillToDifferent;	
});