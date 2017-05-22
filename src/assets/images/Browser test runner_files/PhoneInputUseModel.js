define('use-model/userData/PhoneInputUseModel', [
	'task/TaskFactory',
	'use-model/generic/TextInputUseModel',
], function(TaskFactory, TextInputUseModel) {

	class PhoneInputUseModel extends TextInputUseModel  {

		constructor(classifier, resolver) {
			super(classifier, resolver);

			if (typeof this.inputData !== 'string' && this.inputData !== null && this.inputData !== undefined) {
				this.inputData = this.inputData.toString();
			} else if (this.inputData === null) {
				this.inputData = '';
			}
		}

		getVerifySuccessPromise() {

			const matchData = this.classifier.getMatchData();

			if (matchData === 'PHONE_SINGLE' || matchData === '') {
				
				return super.getVerifySuccessPromise();
				
			} else {
				const phoneSegmentInputData = [];
				phoneSegmentInputData[0] = this.inputData.slice(0, 3);
				phoneSegmentInputData[1] = this.inputData.slice(3, 6);
				phoneSegmentInputData[2] = this.inputData.slice(6, 10);

				const phoneSegmentElements = this.classifier.getPhoneInputMatches();

				const self = this;

				return new Promise((resolve, reject) => {
					TextInputUseModel.spawn(function* () {
						try {
							/* forEach is not a Generator funciton and therefor we cannot yield inside of it...using for loop
							phoneSegmentInputData.forEach(function(segmentData, idx) {
								yield self.getTextEntryPromise(phoneSegmentElements[idx], segmentData);
							});	
							*/
							let idx;
							for(idx=0;idx<phoneSegmentInputData.length;idx++) {
								yield self.getTextEntryPromise(phoneSegmentElements[idx], phoneSegmentInputData[idx]);
							}							
							resolve();
						} catch (err) {
							reject(err);
						}
					});
				});
			}
		}
		
			
		valuesMatch(elementValue, myValue) {

			elementValue = elementValue || '';
			
			// strip out numbers as many phone inputs do formatting for you
			let numbersOnly = elementValue.replace(/[^\d]/g, '');

			myValue = myValue || '';

			return numbersOnly === myValue;
		}
	}

	return PhoneInputUseModel;
});
