define('use-model/CardTypeResolver', ['task/TaskFactory','use-model/UseModelResolver'], function(TaskFactory, UseModelResolver) {

	class CardTypeResolver extends UseModelResolver {

		constructor(config) {
			super(config);	

			let visaWords = ['Visa'],
				mcWords = ['MasterCard', 'Master Card'],
				discoverWords = ['Discover', 'Disc'],
				amexWords = ['AmericanExpress', 'American Express', 'AmEx', 'Am Ex'];

			this.cardData = {
				'visa': visaWords,
				'v': visaWords,
				'mastercard': mcWords,
				'm': mcWords,
				'discover': discoverWords,
				'd':discoverWords,
				'americanexpress': amexWords,
				'a': amexWords
			}
		}

		getDropDownRegex(el) {

			let aliases = this.cardData[this.data.toLowerCase()], i, regex='';

			for(i=0;i<aliases.length;i++){
				regex += '(^[\\s\\W\\d]*' + aliases[i] + '[\\s\\W\\d]*$)';
				regex += ((i+1)<aliases.length) ? '|' : '';
			}
			
			return regex;
		}
		
	}

	return CardTypeResolver;	
});