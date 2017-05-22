define('use-model/ProductAttributeResolver', [
	'task/TaskFactory',
	'use-model/UseModelResolver',
	'use-model/generic/RescanUseModel',
	'use-model/generic/ValueReadingUseModel'
], function(TaskFactory, UseModelResolver, RescanUseModel, ValueReadingUseModel) {

	class ProductAttributeResolver extends UseModelResolver {

		constructor(config) {
			super(config);
			this.consecutiveRescans = 0;
			this.useOnce = false;
		}

		getDefaultUseModel(classifier) {
			const targetEl = classifier.getElement();

			if (classifier.getMatchData() === 'ATTRIBUTE_TITLE' || classifier.getMatchData() === 'ATTRIBUTE_REVEAL') {

				if (this.consecutiveRescans >= 5) {
					this.consecutiveRescans = 0;
					return null;
				}

				this.consecutiveRescans += 1;

				return new RescanUseModel(classifier, this);
			
			} else {
				
				if (targetEl.isNonStandardDropDown) {
					return new ValueReadingUseModel(classifier, this);
				}
				
				return this.getButtonUseModel(classifier);
			
			}	
		}

	}

	return ProductAttributeResolver;
});
