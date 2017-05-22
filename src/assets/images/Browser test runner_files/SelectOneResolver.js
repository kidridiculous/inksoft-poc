define('use-model/SelectOneResolver', ['use-model/UseModelResolver', 'util/StateUtil', 'use-model/generic/RescanUseModel'], function(UseModelResolver, StateUtil, RescanUseModel) {

	class SelectOneResolver extends UseModelResolver {

		constructor(config) {
			super(config);
			this.consecutiveRescans = 0;	
		}

		getUseModel(classifier) {
			let useModel = super.getUseModel(classifier);

			if(useModel !== null && useModel.constructor.name === 'RescanUseModel') {
				
				this.consecutiveRescans += 1;

				//Turn on target option matching
				if(typeof classifier.toggleTargetOption === 'function') {
					classifier.toggleTargetOption(true);
				}

				
				if(this.consecutiveRescans > 4) {
					useModel = null;
					//Turn on target option matching
					if(typeof classifier.toggleTargetOption === 'function') {
						classifier.toggleTargetOption(false);
					}
				}

			} else {

				this.consecutiveRescans = 0;
				if(typeof classifier.toggleTargetOption === 'function') {
					classifier.toggleTargetOption(false);
				}
			}

			return useModel;
		}

		getDefaultUseModel(classifier) {
			let defaultUseModel;

			if(classifier.getMatchData() === 'KEYWORD') {
				
				defaultUseModel = this.getRescanUseModel(classifier);
		
			} else {
				
				this.consecutiveRescans = 0;

				defaultUseModel = this.getButtonUseModel(classifier);

			}	

			return defaultUseModel;
		}

		getRescanUseModel(classifier) {
			return new RescanUseModel(classifier, this, 'FULL_SCAN');
		}
		
	}

	return SelectOneResolver;	
});