define('use-model/generic/CheckboxUseModel',['task/TaskFactory', 'use-model/generic/ScannedElementUseModel', 'vision/ScanComparer'],function(TaskFactory, ScannedElementUseModel, ScanComparer){

	class CheckboxUseModel extends ScannedElementUseModel {

		constructor(classifier, resolver){
			super(classifier, resolver);
		}

		getVerifySuccessPromise() {

			const self = this;
			return new Promise((resolve, reject) => {
				ScannedElementUseModel.spawn(function* () {
					try {
						let scanResults, postScanMatch = true;

						while(postScanMatch && (self.needsChecked() || self.needsUnchecked())) {
							yield TaskFactory.getLeftMouseClickTask(self.targetElement.center.x, self.targetElement.center.y, self.targetElement.segmentScrollY).execute();

							
							scanResults = yield TaskFactory.getSamplePointScan(self.targetElement).execute();
							//Try to find the element we clicked in the scan experiment
							self.targetElement = self.matchOnInputElement(self.targetElement, scanResults.formattedElements);

							//If its not found don't run again
							if (self.targetElement === null) {
								postScanMatch = false;
							} 
						} 
						resolve();
					} catch (err) {
						reject(err);
					}
				});
			});		
		}
	
		needsChecked() {
			return (this.inputData && !this.targetElement.checked);
		}

		needsUnchecked() {
			return (!this.inputData && this.targetElement.checked);
		}
	}

	return CheckboxUseModel;
})