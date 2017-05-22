define('use-model/userData/CreditCardNumber',['task/TaskFactory', 'use-model/generic/TextInputUseModel'],function(TaskFactory, TextInputUseModel){

	class CreditCardNumber extends TextInputUseModel {

		constructor(classifier, resolver){
			super(classifier, resolver);
		}
		
		valuesMatch(elementValue, myValue) {

			elementValue = elementValue || '';
			//Strip out numbers as many phone inputs do formatting for you
			let numbersOnly = elementValue.replace(/[^\d]/g, '');
			return numbersOnly===myValue;
		}
		
	
	}

	return CreditCardNumber;
})