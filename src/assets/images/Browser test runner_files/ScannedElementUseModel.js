define('use-model/generic/ScannedElementUseModel', [
	'task/TaskFactory',
	'use-model/generic/BaseUseModel',
	'vision/ScanComparer',
	'use-model/generic/ScanUseModel',
	'util/StatusMessage',
	'controller/RobotVision'
], function(TaskFactory, BaseUseModel, ScanComparer, ScanUseModel, StatusMessage, RobotVision) {

	function hasPseudoVisibleElement(pseudoElement) {
		let w = 0,
			h = 0;
		
		if (typeof pseudoElement.width === 'string') {
			w = parseIntFromString(pseudoElement.width);
		}

		if (typeof pseudoElement.height === 'string') {
			h = parseIntFromString(pseudoElement.height);
		}

		return ((w > 0) && (h > 0));
	}

	function getPseudoElementCoords(x, y, pseudoElement) {
		let coords = {}, top=0, bottom=0, left=0, right=0,
		height=parseIntFromString(pseudoElement.height),
		width=parseIntFromString(pseudoElement.width);

		if (typeof pseudoElement.top === 'string') {
			top = parseIntFromString(pseudoElement.top);
		}

		if (typeof pseudoElement.bottom === 'string') {
			bottom = parseIntFromString(pseudoElement.bottom);
		}

		if (typeof pseudoElement.right === 'string') {
			right = parseIntFromString(pseudoElement.right);
		}

		if (typeof pseudoElement.left === 'string') {
			left = parseIntFromString(pseudoElement.left);
		}

		coords.xmin = x + left;
		coords.xmax = coords.xmin + width;
		coords.ymin = y + top;
		coords.ymax = coords.ymin + height;

		return coords;
	}

	function parseIntFromString(val) {
		const intVal = parseInt(val.replace(/[^-.\d]/g, ''));

		return isNaN(intVal) ? 0 : intVal;
	}


	function createElementVerificationPromise(useModel, targetEl) {
			let element = targetEl, task, ancestorTask=null, width, height, pseudoCoords;
			// get Sample Point Scan - validate element is still there
			if (element.tagName === 'INPUT' || element.tagName === 'SELECT') {
				task = TaskFactory.getSamplePointScan(element);
				task.setDefinition(useModel.getDefinition());
			} else {
				width = element.xmax - element.xmin,
				height = element.ymax - element.ymin;
				if (useModel.targetHasNoSize(element)) {
					if (useModel.targetHasVisiblePseudo(element)) {
						pseudoCoords = useModel.getPseudoElementCoords(element);
					} 
				}

				if (useModel.targetHasScrollableAncestor(element)) {
					ancestorTask = TaskFactory.getAncestorScrollTask(element.center.x, element.center.y, element.scrollableAncestorScrollTop);
					ancestorTask.setDefinition(useModel.getDefinition());
				}

				if (pseudoCoords) {
					task = TaskFactory.getScanExperimentTask(8, 8, pseudoCoords.xmin, pseudoCoords.ymin - element.segmentScrollY, pseudoCoords.xmax - pseudoCoords.xmin, (pseudoCoords.ymax - element.segmentScrollY) - (pseudoCoords.ymin - element.segmentScrollY) , useModel.classifier, useModel);		
					task.setDefinition(useModel.getDefinition());
				} else {
					task = TaskFactory.getScanExperimentTask(8, 8, element.xmin, element.ymin - element.segmentScrollY, element.xmax - element.xmin, (element.ymax - element.segmentScrollY) - (element.ymin - element.segmentScrollY), useModel.classifier, useModel);
					task.setDefinition(useModel.getDefinition());
				}
			}

			if(ancestorTask !== null) {
				return new Promise((resolve, reject) => {
					ancestorTask.execute()
						.then(task.execute.bind(task))
						.then(resolve)
						.catch(reject);
				});
			} else {
				return new Promise((resolve, reject) => {
					task.execute().then(resolve, reject);
				});
			}

			
		}

	class ScannedElementUseModel extends BaseUseModel {

		constructor(classifier, resolver) {
			super(classifier, resolver);
			this.targetElement = this.classifier.getElement();
			this.inputData = this.resolver.getData();
			//this.taskQueue = this.getTasks();
			this.scanProcessCount = 0;
		}

		/* [MM] DO I STILL NEED scanProcessCount??? REMOVE OVERRIDE FOR NOW 
		isComplete() {
			return super.isComplete() && this.scanProcessCount > 0;
		}
		*/

		createGenerator(resolve, reject) {

			const self = this;

			return function* () {
				try {
					yield self.getVerifyPromise();

					yield self.getVerifySuccessPromise();

					//[MM] TODO - Remove Legacy Behavior for ordered checkout when appropriate
					if(self.getScanOnComplete()) {
						const scanResults = yield TaskFactory.getScanTask().execute();
						RobotVision.setVision(scanResults);
					}
					
					self.tasksComplete = true;
					resolve();
				} catch(err) {
					self.tasksComplete = false;
					self.cancel();
					reject(err);
				}
			};
		}

		getVerifyPromise() {

			const self = this;
			const scrollTask = this.getScrollTask();

			return new Promise((resolve, reject) => {
				scrollTask.execute()
					.then(self.getElementVerificationPromise.bind(self, self.targetElement))
					.then(scanOutput => {
						self.targetElement = (typeof scanOutput !== 'undefined' && scanOutput !== null) ? self.matchOnInputElement(self.targetElement, scanOutput.formattedElements) : null;
						if (self.targetElement !== null) {
							const foundMessage = `${self.constructor.name} verified targetElement for ${self.getDefinition()}`;
							StatusMessage.sendProgress(foundMessage); 
							resolve();
						} else {
							const message = `${self.constructor.name} failed verification on targetElement for ${self.getDefinition()}`;
							StatusMessage.sendProgress(message); 
							reject(message);
						}
					})
					.catch(err => {
						reject(err);
					});
			});
		}

		getVerifySuccessPromise() {
			return Promise.resolve();
		}

		//Returns the matching element or null if not found
		matchOnInputElement(elementToMatch, scannedElements) {
			const compareProps = ['id', 'name', 'tagName', 'title', 'type', 'placeHolder', 'nodeType', 'nodeValue', 'innerText'];
			let match = false, matchingEl;

			if(Array.isArray(scannedElements)) {
				scannedElements.forEach(function(element) {
					if (ScanComparer.compareElementsByProperties(elementToMatch, element, compareProps)) {
						// update input element to newest view
						match = true;
						matchingEl = element;
					}
				}, this);	
			}

			if(match) {
				return matchingEl;
			}
			console.log('match not found for ==>')
			console.log(elementToMatch);
			return null;
		}

		getScrollTask() {
			return TaskFactory.getWindowScrollTask(0, this.targetElement.segmentScrollY);
		}

		getElementVerificationPromise(targetElement) {
			return createElementVerificationPromise(this, targetElement);
		}

		targetHasNoSize(element) {
			if (!element) {
				return true;
			}

			const width = element.xmax - element.xmin,
				height = element.ymax - element.ymin;

			return (width === 0 && height === 0);
		}

		targetHasVisiblePseudo(element) {
			if (!element) {
				return false;
			}

			let result = hasPseudoVisibleElement(element.pseudoBefore) || hasPseudoVisibleElement(element.pseudoAfter);

			return result;
		}

		targetHasScrollableAncestor(element) {
			if (!element) {
				return false;
			}

			let result = element.scrollableAncestorScrollTop > 0;

			return result;
		}

		getPseudoElementCoords(element) {
			let pseudoCoords = {};
			if (hasPseudoVisibleElement(element.pseudoBefore)) {
				pseudoCoords = getPseudoElementCoords(element.xmin, element.ymin, element.pseudoBefore);
			} else if (hasPseudoVisibleElement(element.pseudoAfter)) {
				pseudoCoords = getPseudoElementCoords(element.xmin, element.ymin, element.pseudoAfter);
			}

			return pseudoCoords;
		}

		getScanOnComplete() {
			return this.classifier && typeof this.classifier.getScanOnComplete === 'function' && this.classifier.getScanOnComplete();
		}

	}

	return ScannedElementUseModel;
})