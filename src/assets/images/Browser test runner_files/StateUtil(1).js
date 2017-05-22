define('util/StateUtil', [], function() {

	let STATES_DATA = {
			"AL": "Alabama",
			"AK": "Alaska",
			"AS": "American Samoa",
			"AZ": "Arizona",
			"AR": "Arkansas",
			"CA": "California",
			"CO": "Colorado",
			"CT": "Connecticut",
			"DE": "Delaware",
			"DC": "District Of Columbia",
			"FM": "Federated States Of Micronesia",
			"FL": "Florida",
			"GA": "Georgia",
			"GU": "Guam",
			"HI": "Hawaii",
			"ID": "Idaho",
			"IL": "Illinois",
			"IN": "Indiana",
			"IA": "Iowa",
			"KS": "Kansas",
			"KY": "Kentucky",
			"LA": "Louisiana",
			"ME": "Maine",
			"MH": "Marshall Islands",
			"MD": "Maryland",
			"MA": "Massachusetts",
			"MI": "Michigan",
			"MN": "Minnesota",
			"MS": "Mississippi",
			"MO": "Missouri",
			"MT": "Montana",
			"NE": "Nebraska",
			"NV": "Nevada",
			"NH": "New Hampshire",
			"NJ": "New Jersey",
			"NM": "New Mexico",
			"NY": "New York",
			"NC": "North Carolina",
			"ND": "North Dakota",
			"MP": "Northern Mariana Islands",
			"OH": "Ohio",
			"OK": "Oklahoma",
			"OR": "Oregon",
			"PW": "Palau",
			"PA": "Pennsylvania",
			"PR": "Puerto Rico",
			"RI": "Rhode Island",
			"SC": "South Carolina",
			"SD": "South Dakota",
			"TN": "Tennessee",
			"TX": "Texas",
			"UT": "Utah",
			"VT": "Vermont",
			"VI": "Virgin Islands",
			"VA": "Virginia",
			"WA": "Washington",
			"WV": "West Virginia",
			"WI": "Wisconsin",
			"WY": "Wyoming",
			"AA": "U.S. Armed Forces – Americas",
			"AE": "U.S. Armed Forces – Europe",
			"AP": "U.S. Armed Forces – Pacific"
		};

	class StateUtil {

		static getStateRegexFromAbbr(stateAbbr) {
			let nStateAbbr = stateAbbr.toUpperCase();
			
			let name = STATES_DATA[nStateAbbr], regex;

			if(name) {
				//regex group for state alone
				regex = '(^[\\s\\W\\d]*' + nStateAbbr + '[\\s\\W\\d]*$)';
				//regex group for state name
				regex += '|(^[\\s\\W\\d]*' + name + '[\\s\\W\\d]*$)';
				//regex group for abbrev followed by name
				regex += '|(^[\\s\\W\\d]*' + nStateAbbr + '[\\s\\W\\d]+' + name + '[\\s\\W\\d]*$)';
				//regex group for name followed by abbrev
				regex += '|(^[\\s\\W\\d]*' + name + '[\\s\\W\\d]+' + nStateAbbr + '[\\s\\W\\d]*$)';
			} else {
				throw new Error('No state exists for abbreviation of: \'' + stateAbbr + '\'');
			}

			return regex;
		}
		
	}

	return StateUtil;	
});