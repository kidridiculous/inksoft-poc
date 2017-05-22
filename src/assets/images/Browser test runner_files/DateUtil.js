define('util/DateUtil', [], function() {

	const MONTH_DATA = {
		"01": ["January", "Jan"],
		"02": ["February", "Feb"],
		"03": ["March", "Mar"],
		"04": ["April", "Apr"],
		"05": ["May", "May"],
		"06": ["June", "Jun"],
		"07": ["July", "Jul"],
		"08": ["August", "Aug"],
		"09": ["September", "Sep", "Sept"],
		"10": ["October", "Oct"],
		"11": ["November", "Nov"],
		"12": ["December", "Dec"]
	};

	class DateUtil {

		static getExpMonthRegex(monthString) {
		
			const month = MONTH_DATA[monthString];
			
			let regex;

			if (month) {
				//regex group for month # alone
				regex = '(^[\\s\\W\\d]*' + monthString + '[\\s\\W\\d]*$)';
				//regex group for month name
				regex += '|(^[\\s\\W\\d]*' + month[0] + '[\\s\\W\\d]*$)';
				//regex group for month abbr
				regex += '|(^[\\s\\W\\d]*' + month[1] + '[\\s\\W\\d]*$)';
				//regex group for month abbr (4 long)
            	if (2 in month) regex += '|(^[\\s\\W\\d]*' + month[2] + '[\\s\\W\\d]*$)';
				//regex group for month # and name
				regex += '|(^[\\s\\W\\d]*' + monthString + '[\\s\\W\\d]+' + month[0] + '[\\s\\W\\d]*$)';
				//regex group for month # and abbr (3 long)
				regex += '|(^[\\s\\W\\d]*' + monthString + '[\\s\\W\\d]+' + month[1] + '[\\s\\W\\d]*$)';
				//regex group for month # and abbr (4 long)
				if (2 in month) regex += '|(^[\\s\\W\\d]*' + monthString + '[\\s\\W\\d]+' + month[2] + '[\\s\\W\\d]*$)';
			} else {
				throw new Error('No month exists for abbreviation of: \'' + monthString + '\'');
			}

			return regex;
		}	
	}

	return DateUtil;	
});
