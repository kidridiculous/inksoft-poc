define('use-model/generic/BaseUseModel',['task/TaskFactory','system/Browser'],function(TaskFactory, Browser){

	function spawn(generatorFunc) {
		function continuer(verb, arg) {
			var result;
			try {
				result = generator[verb](arg);
			} catch (err) {
				return Promise.reject(err);
			}
			
			if (result.done) {
				return result.value;
			} else {
				return Promise.resolve(result.value).then(onFulfilled, onRejected);
			}
		}

		var generator = generatorFunc();
		var onFulfilled = continuer.bind(continuer, "next");
		var onRejected = continuer.bind(continuer, "throw");
		return onFulfilled();
	}

	class BaseUseModel {

		constructor(classifier, resolver) {
			this.classifier = classifier;
			this.resolver = resolver;
			this.tasksComplete = false;
			this.httpInfo = { navBegin:0, navEnd:0, requestBegin:0, requestEnd:0};
		}

		execute() {

			const promise = new Promise((resolve, reject) => {
				spawn(this.createGenerator(resolve, reject));
			});

			this._promise = promise;

			return promise;
		}

		createGenerator(resolve, reject) {
			const self = this;
			return function*() {
				self.tasksComplete = true;
				resolve(true);
			}
		}
	
		isComplete() {
			return this.tasksComplete;
		}

		/* [MM] DEPRECATED
		getNextTask() {
			let nextTask = null;
			if(this.taskIndex < this.taskQueue.length) {
				nextTask = this.taskQueue[this.taskIndex];
				this.taskIndex++;
			}
			return nextTask;
		}

		/* Cancel the use of this model */
		cancel() {	

			var resolverExists = (typeof this.resolver !== 'undefined');
			var classifierExists = (typeof this.classifier !== 'undefined');

			if(resolverExists){

				this.resolver.resolved = false;
				this.resolver.timesResolved -= 1;
				if(this.resolver.timesResolved < 0) {
					this.resolver.timesResolved = 0;
				}

			}

			if(classifierExists){
				this.classifier.timesResolved -= 1;

				if(this.classifier.timesResolved < 0) {
					this.classifier.timesResolved = 0;
				}
			}

			return this;

		}

		/* Complete the use model */
		complete() {

			return this;
		}

		getDefinition() {
			if(this.classifier) {
				return this.classifier.definition;	
			} else {
				'none';
			}
			
		}

		static spawn(gFx) {
			return spawn(gFx);
		}

		addBrowserListeners() {
			this.webNavBeginDelegate = this.onWebNavBegin.bind(this);
			this.webNavEndDelegate = this.onWebNavEnd.bind(this);
			this.webReqBeginDelegate = this.onWebRequestBegin.bind(this);
			this.webReqEndDelegate = this.onWebRequestEnd.bind(this);

			return new Promise((resolve, reject) => {
				try {
					Browser.addListener('WEB_NAVIGATION_BEGIN', this.webNavBeginDelegate);
					Browser.addListener('WEB_NAVIGATION_END', this.webNavEndDelegate);

					Browser.addListener('WEB_REQUEST_BEGIN', this.webReqBeginDelegate);			
					Browser.addListener('WEB_REQUEST_END', this.webReqEndDelegate);			
				
					resolve();
				} catch (err) {
					reject(err);
				}
			});
			
		}

		destroyBrowserListeners() {
			Browser.removeListener('WEB_REQUEST_END', this.webReqEndDelegate);	
			Browser.removeListener('WEB_NAVIGATION_END', this.webNavEndDelegate);

			Browser.removeListener('WEB_REQUEST_BEGIN', this.webReqBeginDelegate);			
			Browser.removeListener('WEB_NAVIGATION_BEGIN', this.webNavBeginDelegate);

			//Reset httpInfo
			this.httpInfo = { navBegin:0, navEnd:0, requestBegin:0, requestEnd:0};
			this.webNavigationAfterClick = false;
		}

		onWebNavBegin(detail) {
			if(detail.isMainFrame) {
				this.webNavigationAfterClick = true;
				this.httpInfo.navBegin += 1;
			}
		}

		onWebNavEnd(detail) {
			if(detail.isMainFrame && this.webNavigationAfterClick) {
				this.httpInfo.navEnd += 1;
			}
		}

		onWebRequestBegin() {
			this.httpInfo.requestBegin += 1;
		}

		onWebRequestEnd(details) {
			this.httpInfo.requestEnd += 1;
		}

		getHttpInfo() {
			return this.httpInfo;
		}


		
		//Returns a promise that resolves when all httpActivity completes
		getHttpActivityIdlePromise() {
			
			const self = this;
			return new Promise((resolve, reject) => {
				spawn(function* () {
					try {
						//Wait an initial amount of time for some kind of activity
						yield TaskFactory.getTimeoutTask(1500).execute();

						let httpInfo = self.getHttpInfo();

						while(httpInfo.requestBegin !== httpInfo.requestEnd
							&& httpInfo.navBegin !== httpInfo.navEnd
							&& Browser.isActive()) {	
							
							yield TaskFactory.getTimeoutTask(1000).execute();
							httpInfo = self.getHttpInfo();
						}	

						console.log(`Waited for ${httpInfo.navEnd} navigation events and ${httpInfo.requestEnd} events`);
						self.destroyBrowserListeners();

						yield TaskFactory.getTimeoutTask(1500).execute();
						
						resolve();

					}
					catch (err) {
						self.destroyBrowserListeners();
						reject(err);
					}

				})
			});
			
		}

	}

	return BaseUseModel;
})