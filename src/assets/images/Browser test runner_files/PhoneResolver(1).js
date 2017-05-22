define('use-model/PhoneResolver', [
	'task/TaskFactory',
	'use-model/UseModelResolver',
	'use-model/userData/PhoneInputUseModel'
], function(TaskFactory, UseModelResolver, PhoneInputUseModel) {

	class PhoneResolver extends UseModelResolver {

		constructor(config) {
			super(config);
		}

		getTextInputUseModel(classifier) {
			return new PhoneInputUseModel(classifier, this);
		}
	}

	return PhoneResolver;
});
