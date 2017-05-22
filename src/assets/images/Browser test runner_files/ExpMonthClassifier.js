define('classification/ExpMonthClassifier', ['classification/SelectOneClassifier', 'util/DateUtil'], function(SelectOneClassifier, DateUtil) {

	class ExpMonthClassifier extends SelectOneClassifier {

		constructor(definition, keywords, expMonth, negativeWords, contextKeywords, priority) {

			if (typeof expMonth !== 'string') {
				expMonth = expMonth.toString();
			}

			if (expMonth.length === 1) {
				expMonth = '0' + expMonth;
			}
			
			const monthRegex = DateUtil.getExpMonthRegex(expMonth);

			const targetOption = {
				expression: monthRegex,
				flags: 'i'
			};

			super(definition, keywords, targetOption, negativeWords, contextKeywords, priority);

			// this is for unit testing
			this.expMonth = expMonth;
		}
	}

	return ExpMonthClassifier;
});
