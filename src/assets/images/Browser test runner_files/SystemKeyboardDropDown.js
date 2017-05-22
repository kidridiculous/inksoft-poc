define('use-model/generic/SystemKeyboardDropDown',['task/TaskFactory', 'use-model/generic/ScannedElementUseModel'],function(TaskFactory, ScannedElementUseModel){


	function getClickTask(element) {
		var task = TaskFactory.getLeftMouseClickTask(element.center.x, element.center.y, element.segmentScrollY);
		task.timeoutMS = 2000;
		return task;
	}

	function getTypedTextTask(optionText) {
		var task = TaskFactory.getTypeTask(optionText);
		task.timeoutMS = 2000;
		return task;
	}

	function findMatchingOption(options, regexString) {
		let matcher = new RegExp(regexString, 'i'), i, optionText, option;

		for(i=0;i<options.length;i++) {
			optionText = options[i].humanText;

			match = matcher.test(optionText);

			if(match) {
				return options[i];
			}
		}

		return null;
	}

	class SystemKeyboardDropDown extends ScannedElementUseModel {

		constructor(classifier, resolver, regexString){
			super(classifier, resolver);
			this.regexString = regexString;
		}

		getVerifySuccessPromise() {
			let matchingOption = findMatchingOption(this.targetElement.options, this.regexString),
				optionTypeText = '';

			if(matchingOption === null) {
				return;
			}

			if(matchingOption.selected) {
				return;
			} else {
				optionTypeText = matchingOption.humanText;
			}

			if(optionTypeText.length === 0) {
				return;
			}

			const clickTask = getClickTask(this.targetElement);
			const typeTask = getTypedTextTask(optionTypeText);
			const enterTask = TaskFactory.getKeyboardEnterTask();

			clickTask.setDefinition(this.getDefinition());
			typeTask.setDefinition(this.getDefinition());
			enterTask.setDefinition(this.getDefinition());

			return new Promise((resolve, reject) => {	
				clickTask.execute()
					.then(typeTask.execute.bind(typeTask))
					.then(enterTask.execute.bind(enterTask))
					.then(()=>{resolve();})
					.catch((err) => {
						reject(err);
					});
			});
		}
		
	}

	return SystemKeyboardDropDown;
})