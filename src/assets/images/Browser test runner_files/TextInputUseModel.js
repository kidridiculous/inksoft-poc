define('use-model/generic/TextInputUseModel', [
	'task/TaskFactory',
	'use-model/generic/ScannedElementUseModel',
	'vision/ScanComparer'
], function(TaskFactory, ScannedElementUseModel, ScanComparer) {

	const FOCUS_OUT_ABOVE_RIGHT = 'ABOVE_RIGHT';
	const FOCUS_OUT_ABOVE = 'ABOVE';


	function createTextEntryPromise(useModel, targetElement, inputData) {
			return new Promise((resolve, reject) => {
				ScannedElementUseModel.spawn(function* () {

					let focusClick, focusOutClick, deleteText, typeText, scanTask;
					try {
						while(!useModel.valuesMatch(targetElement.value, inputData)) {
							// focus on the beginning of the input
							focusClick = TaskFactory.getLeftMouseClickTask(targetElement.xmin + 5, targetElement.center.y, targetElement.segmentScrollY);
							focusClick.setDefinition(useModel.getDefinition());
							yield focusClick.execute();

							if(targetElement.value && targetElement.value.length > 0) {
								deleteText = TaskFactory.getTextInputClearTask(targetElement.value.length);
								deleteText.setDefinition(useModel.getDefinition());
								yield deleteText.execute();
							}
							
							// only type in the information if there is something to type
							if (typeof inputData === 'string' && inputData.length > 0) {
								// type in the text
								typeText = TaskFactory.getTypeTask(inputData);
								typeText.setDefinition(useModel.getDefinition());
								
								yield typeText.execute();

								// add rescan to validate information was entered
								scanResults = yield useModel.getElementVerificationPromise(targetElement);
								targetElement = (typeof scanResults !== 'undefined' && scanResults !== null) ? useModel.matchOnInputElement(targetElement, scanResults.formattedElements) : null;
								
								if(targetElement === null) {
									reject('TextInputUseModel - Unable to verify that we entered the text correctly');
								}
							}
						}

						const focusOutPoint = useModel.getFocusOutPoint(targetElement);

						//focus out of the element
						focusOutClick = TaskFactory.getLeftMouseClickTask(focusOutPoint.x, focusOutPoint.y, targetElement.segmentScrollY);
						focusOutClick.setDefinition(useModel.getDefinition());
						yield focusOutClick.execute();

						yield TaskFactory.getTimeoutTask(1500).execute();

						resolve();
					} catch(err) {
						reject(err);
					}
				});
			});
		}

	class TextInputUseModel extends ScannedElementUseModel {

		constructor(classifier, resolver) {
			super(classifier, resolver);

			this.focusOutLocation = FOCUS_OUT_ABOVE_RIGHT;

			if (typeof this.inputData !== 'string' && this.inputData !== null && this.inputData !== undefined) {
				this.inputData = this.inputData.toString();
			} else if (this.inputData === null) {
				this.inputData = '';
			}
		}

		getVerifySuccessPromise() {
			return this.getTextEntryPromise(this.targetElement, this.inputData);
		}

		getTextEntryPromise(targetElement, inputData) {
			return createTextEntryPromise(this, targetElement, inputData);
		}

		/*
		generateTasks() {
			let task;
			
			if (this.valuesMatch(this.targetElement.value, this.inputData)) {
				return;
			} else if (this.targetElement.value && this.targetElement.value.length > 0) {
				// focus on the beginning of the input
				task = TaskFactory.getLeftMouseClickTask(this.targetElement.xmin + 5, this.targetElement.center.y, this.targetElement.segmentScrollY);
				task.setDefinition(this.getDefinition());
				this.taskQueue.push(task);
				// get a task to delete text in the input
				task = TaskFactory.getTextInputClearTask(this.targetElement.value.length);
				task.setDefinition(this.getDefinition());
				this.taskQueue.push(task);				
			} else {
				// focus on the element
				task = TaskFactory.getLeftMouseClickTask(this.targetElement.center.x, this.targetElement.center.y,this.targetElement.segmentScrollY);	
				task.setDefinition(this.getDefinition());
				this.taskQueue.push(task);
			}

			// only type in the information if there is something to type
			if (typeof this.inputData === 'string' && this.inputData.length > 0) {
				// type in the text
				task = TaskFactory.getTypeTask(this.inputData);
				task.setDefinition(this.getDefinition());
				this.taskQueue.push(task);

				// add rescan to validate information was entered
				task = TaskFactory.getSamplePointScan(this.targetElement);
				task.setDefinition(this.getDefinition());
				this.taskQueue.push(task);

			}

			const focusOutPoint = this.getFocusOutPoint(this.targetElement);

			// focus out of the element
			task = TaskFactory.getLeftMouseClickTask(focusOutPoint.x, focusOutPoint.y, this.targetElement.segmentScrollY);
			task.setDefinition(this.getDefinition());
			
			this.taskQueue.push(task);

			//Add short wait so background script frees up chrome to do other things
			task = TaskFactory.getTimeoutTask(1000, this.getDefinition());
			this.taskQueue.push(task);

			

			super.generateTasks();
		}
		*/

		valuesMatch(elementValue, myValue) {
		 	elementValue = elementValue || '';

		 	if (typeof myValue !== 'string' && myValue !== null) {
		 		myValue = myValue.toString();
		 	}

		 	myValue = myValue || '';

		 	return myValue.toLowerCase() === elementValue.toLowerCase();
		}

		setFocusOutAbove() {
			this.focusOutLocation = FOCUS_OUT_ABOVE;
		}

		getFocusOutPoint(el) {
			let focusOutX, focusOutY;

			switch(this.focusOutLocation) {
				case FOCUS_OUT_ABOVE:
					focusOutX = el.xmax - ((el.xmax - el.xmin) / 2);
					focusOutY = el.ymin - 5;
				break;
				case FOCUS_OUT_ABOVE_RIGHT:
					focusOutX = el.xmax + 5;
					focusOutY = el.ymin - 5;
				break;
			}

			return { x: focusOutX, y: focusOutY };
		}
	}

	return TextInputUseModel;
});
