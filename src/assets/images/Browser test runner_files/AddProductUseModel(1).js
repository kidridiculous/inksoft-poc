define('use-model/retail/AddProductUseModel',['task/TaskFactory', 'use-model/generic/ButtonUseModel', 'system/Browser'], function(TaskFactory, ButtonUseModel, Browser){

	class AddProductUseModel extends ButtonUseModel {

		constructor(classifier, resolver, submit){
			super(classifier, resolver);
			this.isSubmit = submit;
			this.httpAfterClick = false;
			this.idleHttpAfterClick = false;
			this.webNavigationAfterClick = false;
			this.webRequestAfterClick = false;
			this.totalRequestBegin = 0;
			this.totalRequestEnd = 0;
		}

		getVerifySuccessPromise() {

			
			const clickTask = TaskFactory.getLeftMouseClickTask(this.targetElement.center.x, this.targetElement.center.y, this.targetElement.segmentScrollY);
			const waitTask = TaskFactory.getTimeoutTask(3000, this.getDefinition());
			return this.addBrowserListeners()
				.then(clickTask.execute.bind(clickTask))
				.then(waitTask.execute.bind(waitTask))
				.then(this.getHttpActivityIdlePromise.bind(this))
				.catch((err)=> {
					console.log(err);
					this.destroyBrowserListeners();
				});
			
		}

		
		complete() {

			this.destroyBrowserListeners();

			return super.complete();
		}

		cancel() {
			//Remove Listeners
			this.destroyBrowserListeners();
			return super.cancel();
		}
	}

	return AddProductUseModel;
})