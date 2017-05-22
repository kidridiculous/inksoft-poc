define('use-model/generic/ValueReadingUseModel',['task/TaskFactory', 'use-model/generic/ScannedElementUseModel'],function(TaskFactory, ScannedElementUseModel){

	class ValueReadingUseModel extends ScannedElementUseModel {

		constructor(classifier, resolver){
			super(classifier, resolver);
			this.valueElement = this.classifier.getElement();
		}


		getVerifySuccessPromise() {
			const extractedValue = this.extractValueFromElement(), definition = this.getDefinition();
			return new Promise((resolve, reject) => {
				TaskFactory.getContentExtractTask(definition, extractedValue).execute()
					.then(resolve)
					.catch(reject);
			});
		}
		

		extractValueFromElement() {
			if(this.valueElement.nodeValue !== null) {
				//Remove
				return this.valueElement.nodeValue.replace(/[$,\s]*/gi, '');
			}
			return '';
		}


	}

	return ValueReadingUseModel;
})