define('use-model/CreditCardNumberResolver', ['task/TaskFactory','use-model/UseModelResolver', 'use-model/userData/CreditCardNumber'], function(TaskFactory, UseModelResolver, CreditCardNumber) {

	class CreditCardNumberResolver extends UseModelResolver {

		constructor(config) {
			super(config);
			
		}

		getTextInputUseModel(classifier) {
			return new CreditCardNumber(classifier, this);
		}
		
	}

	return CreditCardNumberResolver;	
});