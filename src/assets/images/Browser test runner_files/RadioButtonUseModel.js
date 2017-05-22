define('use-model/generic/RadioButtonUseModel',['task/TaskFactory', 'use-model/generic/ScannedElementUseModel', 'vision/ScanComparer'],function(TaskFactory, ScannedElementUseModel, ScanComparer){

	class RadioButtonUseModel extends ScannedElementUseModel {

		constructor(classifier, resolver){
			super(classifier, resolver);
		}

		getVerifySuccessPromise() {

			const self = this;
			return new Promise((resolve, reject) => {
				ScannedElementUseModel.spawn(function* () {
					try {
						let scanResults, attemptCount = 0;
						
						//If the element needs to be selected 
						while(self.needsChecked() && attemptCount < 3) {

							//do the clicking/selecting of the raio button
							yield TaskFactory.getLeftMouseClickTask(self.targetElement.center.x, self.targetElement.center.y, self.targetElement.segmentScrollY).execute();

							//Scan The radio button to ensure it was actually clicked
							scanResults = yield TaskFactory.getSamplePointScan(self.targetElement).execute();
							
							self.targetElement = self.matchOnInputElement(self.targetElement, scanResults.formattedElements);

							if (self.targetElement !== null) {
								attemptCount += 1;
								//If it was actually clicked the next trip through the while condition
								//will determine if the click did the selecting and fall through to the resolve
							} else {
								//Assume it was clicked and resolve, and that clicking it caused some kind of mutation?
								// [TODO - MM] We may be able to change this once we introduce groups and we are not using the prioritized instructions
								resolve();
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
			//No target element to click
			if(!this.targetElement) { return false;}

			return this.inputData && !this.targetElement.checked;
		}
	}

	return RadioButtonUseModel;
})