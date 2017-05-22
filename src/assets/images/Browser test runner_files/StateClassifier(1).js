define('classification/StateClassifier', ['classification/SelectOneClassifier', 'util/StateUtil'], function(SelectOneClassifier, StateUtil) {

	class StateClassifier extends SelectOneClassifier {

		constructor(definition, keywords, stateAbbr, negativeWords, contextKeywords, priority) {
			var stateRegex = StateUtil.getStateRegexFromAbbr(stateAbbr);

			super(definition, keywords, {expression:stateRegex, flags:'i'}, negativeWords, contextKeywords, priority);

			this.isRescan = false;

			console.log(SelectOneClassifier.MatchType.TARGET_OPTION);
		}

		postMatchUpdate(matchFilter) {
			
			if(!this.isRescan) {
				//Filter out any TARGET_OPTION matches
				this.elementMatches = this.elementMatches.filter(function(match) {
					return match.matchLocation !== SelectOneClassifier.MatchType.TARGET_OPTION;
				})
			}

			super.postMatchUpdate(matchFilter);

		}

		toggleRescan(val){
			this.isRescan = val;
		}

	}

	return StateClassifier;
})