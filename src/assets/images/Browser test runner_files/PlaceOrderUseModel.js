define('use-model/retail/PlaceOrderUseModel',['task/TaskFactory', 'use-model/generic/ButtonUseModel', 'system/Browser'],function(TaskFactory, ButtonUseModel, Browser){

	class PlaceOrderUseModel extends ButtonUseModel {

		constructor(classifier, resolver, submit){
			super(classifier, resolver);
			this.isSubmit = submit;
		}

		getVerifySuccessPromise() {
			let mouseTask;
			if(this.isSubmit) {
				mouseTask = TaskFactory.getLeftMouseClickTask(this.targetElement.center.x, this.targetElement.center.y, this.targetElement.segmentScrollY);
				const waitTask = TaskFactory.getTimeoutTask(3000, this.getDefinition());
				return this.addBrowserListeners()
					.then(mouseTask.execute.bind(clickTask))
					.then(waitTask.execute.bind(waitTask))
					.then(this.getHttpActivityIdlePromise.bind(this))
					.catch((err)=> {
						console.log(err);
						this.destroyBrowserListeners();
					});
				
			}
			else {
				mouseTask = TaskFactory.getMouseMoveTask(this.targetElement.center.x, this.targetElement.center.y, this.targetElement.segmentScrollY);
				return mouseTask.execute.bind(mouseTask);
			}
	
		}

		complete() {

			this.destroyBrowserListeners();

			return super.complete();
		}

		cancel() {
			//Remove Listeners
			this.destroyBrowserListeners();

			this.httpAfterClick = false;
			this.idleHttpAfterClick = false;
			this.webNavigationAfterClick = false;
			this.webRequestAfterClick = false;
			this.totalRequestBegin = 0;
			this.totalRequestEnd = 0;
			this.totalNavBegin = 0;
			this.totalNavEnd = 0;
			
			return super.cancel();
		}

		
	}

	return PlaceOrderUseModel;
})