define('use-model/generic/ButtonUseModel',['task/TaskFactory', 'use-model/generic/ScannedElementUseModel'],function(TaskFactory, ScannedElementUseModel){

	class ButtonUseModel extends ScannedElementUseModel {

		constructor(classifier, resolver){
			super(classifier, resolver);
			this.clickQty = 1;
		}

		setClickQty(value) {
			this.clickQty = value;
		}


		getVerifySuccessPromise() { 

			const self = this;

			return new Promise((resolve, reject) => {

				ScannedElementUseModel.spawn(
					function*() {
						try {
							let task, pseudoCoords, centerX, centerY, i=0;

							while(i<self.clickQty) {

								if(self.targetHasNoSize() && self.targetHasVisiblePseudo()) {
									pseudoCoords = self.getPseudoElementCoords();
									centerX = ((pseudoCoords.xmax - pseudoCoords.xmin) / 2) + pseudoCoords.xmin;
									centerY = ((pseudoCoords.ymax - pseudoCoords.ymin) / 2) + pseudoCoords.ymin;

									task = TaskFactory.getLeftMouseClickTask(centerX, centerY, self.targetElement.segmentScrollY, self.targetElement.scrollableAncestorScrollTop);
								} else {
									task = TaskFactory.getLeftMouseClickTask(self.targetElement.center.x, self.targetElement.center.y, self.targetElement.segmentScrollY, self.targetElement.scrollableAncestorScrollTop);
								}

								task.setDefinition(self.getDefinition());

								yield self.addBrowserListeners();

								yield task.execute();

								yield self.getHttpActivityIdlePromise();

								self.destroyBrowserListeners();

								i++;

							}

							resolve();
						} catch (err) {
							self.destroyBrowserListeners();
							reject(err);
						}
					}
				);
			
			});	
		}
	}

	return ButtonUseModel;
})