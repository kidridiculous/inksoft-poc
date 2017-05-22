define('use-model/ZipCodeResolver', [
	'task/TaskFactory',
	'use-model/UseModelResolver',
	'use-model/userData/ZipCodeUseModel'
], function(TaskFactory, UseModelResolver, ZipCodeUseModel) {

	class ZipCodeResolver extends UseModelResolver {

		constructor(config) {
			super(config);
		}

		getTextInputUseModel(classifier) {
			return new ZipCodeUseModel(classifier, this);
		}
	}

	return ZipCodeResolver;
});
