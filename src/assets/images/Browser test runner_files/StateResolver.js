define('use-model/StateResolver', ['use-model/SelectOneResolver', 'util/StateUtil', 'use-model/generic/RescanUseModel'], function(SelectOneResolver, StateUtil, RescanUseModel) {

	class StateResolver extends SelectOneResolver {

		getDropDownRegex(el) {
			return StateUtil.getStateRegexFromAbbr(this.data);
		}

		getRescanUseModel(classifier) {
			classifier.toggleRescan(true);
			return new RescanUseModel(classifier, this, 'FULL_SCAN');

		}
		
	}

	return StateResolver;	
});