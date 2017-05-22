define('use-model/generic/RescanUseModel',['task/TaskFactory', 'use-model/generic/ScannedElementUseModel', 'util/StatusMessage'], function(TaskFactory, ScannedElementUseModel, StatusMessage) {

	let ScanType = { VIEWPORT_SCAN: 'VIEWPORT_SCAN', FULL_SCAN: 'FULL_SCAN', TARGET_SCAN:'TARGET_SCAN'};

	const PHASES = { VALIDATE_TARGET:'VALIDATE_TARGET', RESCAN:'RESCAN'};

	class RescanUseModel extends ScannedElementUseModel {

		constructor(classifier, resolver, scanType){
			super(classifier, resolver);
			this.targetElement = this.classifier.getElement();
			this.inputData = resolver.getData();
			
			if(typeof scanType === 'string') {
				this.scanType = scanType;
			} else { 
				this.scanType = ScanType.VIEWPORT_SCAN;
			}		
		}

		getVerifySuccessPromise() {

			const self = this;
			return new Promise((resolve, reject) => {
				ScannedElementUseModel.spawn(function* () {
					try {
						let scanResults, scanElements, el, useModel, attemptCount = 0, noDerivedUseModel = true;

						while(attemptCount < 3 && noDerivedUseModel)
						{
							//Only add these clicks on non target scan
							if(self.scanType !== ScanType.TARGET_SCAN) {
								//Initial Click Task
								const clickTask = TaskFactory.getLeftMouseClickTask(self.targetElement.center.x, self.targetElement.center.y, self.targetElement.segmentScrollY);
								clickTask.setDefinition(self.getDefinition());

								yield clickTask.execute();

								
								//Add Pause Like a human would after clicking to see what happens
								const waitTask = TaskFactory.getTimeoutTask(1500, self.getDefinition());
								yield waitTask.execute();
							}

							//Rescan area
							let w = self.targetElement.xmax - self.targetElement.xmin;
							w = Math.max(w, 100);
							w = w * 3;
							let h = 300;

							const scanTask = TaskFactory.getScanExperimentTask(4, 4, self.targetElement.xmin, self.targetElement.ymin - self.targetElement.segmentScrollY, w, h, self.classifier, self.resolver);
							scanTask.setDefinition(self.getDefinition());
							if(self.scanType === ScanType.VIEWPORT_SCAN){
								scanTask.viewportScan();
							} else if(self.scanType === ScanType.FULL_SCAN) {
								console.log('Switching to FULL_SCAN experiment');
								scanTask.fullScan();
							}
							scanResults = yield scanTask.execute();

							//See if we can match in the new scan
							scanElements = scanResults.formattedElements;

							self.classifier.reset();

							for(var i=0;i<scanElements.length;i++){
								el = scanElements[i];
								self.classifier.matchesKeywords(el);
							}

							self.classifier.postMatchUpdate('TARGET_OPTION');

							if(self.classifier.hasElement()) {
								useModel = self.resolver.getUseModel(self.classifier);
								if(useModel !== null) {
									noDerivedUseModel = false;
									StatusMessage.sendUseModel({
										useModel:useModel.constructor.name, 
										definition: useModel.getDefinition(),
										element: useModel.targetElement
									});
									yield useModel.execute();
								} else {
									reject('Could not derive use model from rescan');	
								}
							} else if(attemptCount > 2) {	
								reject('Could not derive use model from rescan');	
							} else {
								attemptCount++;
							}
						}

						resolve();
					} catch (err) {
						reject(err);
					}
				});
			});		
		}
/*
		generateTasks() {
			let task, w, h;

			if(!this.targetElement) {return;}

			//Switch phase to rescan after we have validated the target element
			this.phase = PHASES.RESCAN;

			//Only add these clicks on non target scan
			if(this.scanType !== ScanType.TARGET_SCAN) {
				//Initial Click Task
				task = TaskFactory.getLeftMouseClickTask(this.targetElement.center.x, this.targetElement.center.y, this.targetElement.segmentScrollY);
				task.setDefinition(this.getDefinition());
				this.taskQueue.push(task);

				//Add Pause Like a human would after clicking to see what happens
				task = TaskFactory.getTimeoutTask(1500, this.getDefinition());
				this.taskQueue.push(task);	
			}
			
			//Rescan task
			w = this.targetElement.xmax - this.targetElement.xmin;
			w = Math.max(w, 100);
			w = w * 3;
			h = 300;

			task = TaskFactory.getScanExperimentTask(4, 4, this.targetElement.xmin, this.targetElement.ymin - this.targetElement.segmentScrollY, w, h, this.classifier, this.resolver);
			task.setDefinition(this.getDefinition());

			if(this.scanType === ScanType.VIEWPORT_SCAN){
				task.viewportScan();
			} else if(this.scanType === ScanType.FULL_SCAN) {
				console.log('Switching to FULL_SCAN experiment');
				task.fullScan();
			}
			
			this.taskQueue.push(task);

			super.generateTasks();

		}

		processScan(scanData) {

			if(this.phase === PHASES.VALIDATE_TARGET) {
				return super.processScan(scanData);
			} else if (this.phase === PHASES.RESCAN){
				return this.processRescan(scanData);
			}
		}	

		processRescan(scanData) {

			let el, elements = scanData.formattedElements, match = false, useModel = null;
				
			this.rescanAttempts += 1;

			this.classifier.reset();
			
			for(var i=0;i<elements.length;i++){
				el = elements[i];
				this.classifier.matchesKeywords(el);
			}

			this.classifier.postMatchUpdate('TARGET_OPTION');

			if(this.classifier.hasElement()) {
				useModel = this.resolver.getUseModel(this.classifier);
			} else
			{	
				if(this.rescanAttempts >= 3) {
					useModel = null;
				} else {
					useModel = this;	
				}
			}

			if(useModel === null) { 
				this.cancel(); 
			} 

			return useModel;
		}
		*/

		cancel() {
			super.cancel();

			if(this.classifier && this.classifier.constructor.name === 'StateClassifier') {
				this.classifier.toggleRescan(false);
			}
		}
	}

	return RescanUseModel;
})