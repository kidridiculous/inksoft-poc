define('use-model/UseModelResolver', [
	'task/TaskFactory',
	'use-model/generic/SystemKeyboardDropDown', 
	'use-model/generic/TextInputUseModel',
	'use-model/generic/ButtonUseModel',
	'use-model/generic/RescanUseModel',
	'use-model/generic/CheckboxUseModel',
	'use-model/generic/RadioButtonUseModel',
	'service/Knowledge',
], function(
	TaskFactory,
	SystemKeyboardDropDown,
	TextInputUseModel,
	ButtonUseModel,
	RescanUseModel,
	CheckboxUseModel,
	RadioButtonUseModel,
	Knowledge
) {

	class UseModelResolver {

		constructor(config) {
			
			if (config) {
				this.merchant = config.merchant || '';
				this.definition = config.definition;
				this.data = config.data || '';
			}

			this.resolved = false;
			this.useOnce = true;
			this.timesResolved = 0;
		}

		isComplete() {
			return this.resolved && this.useOnce;
		}

		getData() {
			return this.data;
		}

		getUseModel(classifier) {

			const element = classifier.getElement();
			let useModel = null;

			const textInputTypes = ['text', 'tel', 'password', 'email', 'number'];

			if (element.tagName === 'SELECT') {
				
				useModel = this.getSelectUseModel(classifier);

			} else if (element.tagName === 'INPUT' && textInputTypes.includes(element.type.toLowerCase())) {
				
				useModel = this.getTextInputUseModel(classifier);
			
			} else if (element.tagName === 'INPUT' && element.type === 'radio') {
				
				useModel = this.getRadioButtonUseModel(classifier);

			} else if (element.tagName === 'INPUT' && element.type === 'checkbox') {
				
				useModel = this.getCheckboxUseModel(classifier);

			} else if (element.isButton || element.buttontext || element.center) {
				
				useModel = this.getDefaultUseModel(classifier);
			
			} else {
				
				throw new Error('unable to resolve usemodel for element');
			
			}

			if (useModel !== null) {
				this.resolved = true;
				this.timesResolved++;
				classifier.resolved();
			}

			return useModel;
		}

		getDefaultUseModel(classifier) {
			return this.getButtonUseModel(classifier);
		}

		resolve(element) {

			if (this.resolved && this.useOnce) {
				return;
			}

			this.resolved = true;

			this.timesResolved++;

			const textInputTypes = ['text', 'tel', 'password', 'email', 'number'];

			if (element.tagName === 'SELECT') {
				
				return this.resolveSelectTask(element);
			
			} else if (element.tagName === 'INPUT' && textInputTypes.includes(element.type.toLowerCase())) {
				
				return this.resolveInputTask(element);

			} else if (element.tagName === 'INPUT' && element.type === 'radio') {
				
				return this.resolveRadioButtonTask(element);

			} else if (element.tagName === 'INPUT' && element.type === 'checkbox') {
				
				return this.resolveCheckBoxTask(element);

			} else if (element.isButton || element.buttontext) {
				
				return this.resolveButtonTask(element);

			} else if (element.center) {
				
				return this.resolveBlindClick(element); // a last ditch effort for an element without a tagname prop??
			
			} else {
				
				throw new Error('unable to resolve usemodel for element');
			
			}
			
		}

		resolveBlindClick(element) {
			return TaskFactory.getLeftMouseClickTask(element.center.x, element.center.y, element.segmentScrollY);
		}

		getTimesResolved() {
			return this.timesResolved;
		}

		resolveInputTask(element) {
			let elementType = element.type.toLowerCase(), tasks = [], task;

			if (this.valuesMatch(element.value, this.data)) {
				return tasks;
			} else if (element.value && element.value.length > 0) {
				//Focus on the end of the input
				task = TaskFactory.getLeftMouseClickTask(element.xmax - 5, element.center.y, element.segmentScrollY);
				task.classification = this.definition;
				tasks.push(task);

				//Get a task to delete text in the input
				task = TaskFactory.getKeyboardDeleteTask(element.value.length);
				task.classification = this.definition;
				tasks.push(task);				
				
			} else {
				//Focus on the element
				task = TaskFactory.getLeftMouseClickTask(element.center.x, element.center.y,element.segmentScrollY);	
				task.classification = this.definition;
				tasks.push(task);
			}		
			
			//Type in the text
			task = TaskFactory.getTypeTask(this.data);
			task.classification = this.definition;
			tasks.push(task);

			//Focus out of the element
			task = TaskFactory.getLeftMouseClickTask(element.xmax, element.ymin - 5, element.segmentScrollY);
			task.classification = this.definition;
			task.timeoutMS = 2000;

			tasks.push(task);

			return tasks;
		}

		getButtonUseModel(classifier) {
			return new ButtonUseModel(classifier, this);
		}

		getSelectUseModel(classifier) {
			const regex = this.getDropDownRegex();
			return new SystemKeyboardDropDown(classifier, this, regex);
		}

		getCheckboxUseModel(classifier) {
			return new CheckboxUseModel(classifier, this);
		}

		getRadioButtonUseModel(classifier) {
			return new RadioButtonUseModel(classifier, this);
		}

		getTextInputUseModel(classifier) {
			return new TextInputUseModel(classifier, this);
		}

		getDropDownRegex() {
			if (this.data) {
				return `^\\s*${this.data}\\s*$`;
			} else {
				return Knowledge.getClassificationDefinition(this.definition).keyWords.map((keyword) => {
                    return `(^[\\s\\W\\d]*${keyword}[\\s\\W\\d]*$)`;
                }).join('|');
			}
		}
	}

	return UseModelResolver;
});
