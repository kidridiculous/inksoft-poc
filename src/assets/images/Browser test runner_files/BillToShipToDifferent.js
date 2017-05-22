define('use-model/BillToShipToDifferent', ['task/TaskFactory','use-model/UseModelResolver'], function(TaskFactory, UseModelResolver) {

	class BillToShipToDifferent extends UseModelResolver {

		constructor(config) {
			super(config);	

		}
		
	}

	return BillToShipToDifferent;	
});