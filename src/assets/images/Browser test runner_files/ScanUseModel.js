define('use-model/generic/ScanUseModel',['task/TaskFactory', 'use-model/generic/BaseUseModel', 'controller/RobotVision'],function(TaskFactory, BaseUseModel, RobotVision){

	class ScanUseModel extends BaseUseModel {

		constructor() {
			super();
			//this.taskQueue = this.getTasks();
		}

		createGenerator(resolve, reject) {
			const self = this;
			return function *() {
				try {
					yield TaskFactory.getHolsterMouse().execute();

					const scanResults = yield TaskFactory.getScanTask().execute();

					console.log(scanResults);

					//Update RobotVision with latest view
					RobotVision.setVision(scanResults);
					self.tasksComplete = true;
					resolve(scanResults);

				}
				catch (err) {
					reject(err);
				}
			};
		}

		/* [MM] DEPRECATED
		getTasks() {
			return [ TaskFactory.getHolsterMouse(), TaskFactory.getScanTask() ];
		}
		*/
	}

	return ScanUseModel;
})
