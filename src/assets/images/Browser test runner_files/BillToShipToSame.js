define('use-model/BillToShipToSame', ['task/TaskFactory','use-model/UseModelResolver'], function(TaskFactory, UseModelResolver) {

	class BillToShipToSame extends UseModelResolver {

		constructor(config) {
			super(config);	

		}
		
	}

	return BillToShipToSame;	
});