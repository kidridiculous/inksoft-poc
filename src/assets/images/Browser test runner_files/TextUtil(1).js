define('util/TextUtil', [], function(){


	class TextUtil {
		constructor() {
			
		}

		static uniq(textArray) {
			var seen = {};
		    return a.filter(function(item) {
		        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
		    });
		}

		static exactMatch(textList, keywordList) {
			return TextUtil.matchWords(textList, keywordList, function(text, keyword){
				return text === keyword;
			});
		}

		static containsMatch(textList, keywordList) {
			return TextUtil.matchWords(textList, keywordList, function(text, keyword){
				return text.indexOf(keyword) != -1;
			});
		}	

		static partialMatch(textList, keywordList, partialAmount) {
			return TextUtil.matchWords(textList, keywordList, function(text, keyword){
				return text.indexOf(keyword) != -1 && (text.length / keyword.length) <= partialAmount;
			});
		}	

		static regexMatch(textList, regex) {
			let i =0, match=false;
			for(i=0;i<textList.length;i++) {
				if(regex.test(textList[i])){
					match = true;
					break;
				}
			}

			return match;
		}

		static matchWords(textList, keywords, matcherFn) {
			
			var match;

			for (var i = 0; i < textList.length; i++) {
				let word = textList[i];

				for (var j = 0; j < keywords.length; j++) {
					let keyword = keywords[j];

					match = matcherFn(word, keyword);
					if (match){
						break;
					}
				}
				if(match){
					break;
				}
			}

			return match;
		}

		static cleanText(text) {

			if(typeof text !== "string"){
                return '';
            }

			//trim text, make lowercase and replace &nbsp; with a space
			return text.trim().toLowerCase().replace(/\u00a0/g, " ");
		}

		static tokenizeText(text) {
			var filteredString = sani.replace(/[^a-z0-9+]+/gi, ' ');

			var tokenSet = filteredString.split(' ');

			if(tokenSet && tokenSet.length > 0){
				acc = acc.concat(tokenSet);
			}
		}

		static stripNonAlphaNumeric(text) {
			let replaceRegex = /[^\s\w]+/g, cleanText = text.replace(replaceRegex,'');

			return cleanText.toLowerCase();
		}

		static appendText(text, list) {
			if(!list.includes(text) && text.length > 0) {
				list.push(text);
			}
		}

		static randomString(length) {
		    var text = "";
		    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		    for(var i = 0; i < length; i++) {
		        text += possible.charAt(Math.floor(Math.random() * possible.length));
		    }
		    return text;
		}


		static exactOrderScore(potentialMatches, matchParts) {

			let matches = 0, mostMatches = 0, textParts;

			potentialMatches.forEach(function(textItem) {
				textParts = textItem.split(' ').filter(function(t) { return t !== '';});
				matches = 0;
				matchParts.forEach(function(partText, idx) {
					if(idx < textParts.length) {
						if(partText === textParts[idx]) {
							if(idx === matches) {
								matches += 1;
							}
						}
					}
				});

				if(matches > mostMatches) {
					mostMatches = matches;
				}
			});

			return (mostMatches / matchParts.length);
		}

		static wordMatchScore(potentialMatches, matchParts) {
			let matches = 0, mostMatches = 0, textParts;

			potentialMatches.forEach(function(textItem) {
				textParts = textItem.split(' ');
				matches = 0;
				matchParts.forEach(function(partText) {
					if(textParts.indexOf(partText) >= 0) {
						matches += 1;
					}
				});

				if(matches > mostMatches) {
					mostMatches = matches;
				}
			});			

			return mostMatches/matchParts.length;
		}

	}
	

	return TextUtil;

});

// define('util/TextUtil', [], function() {
	
// 	class TextUtil {
// 		constructor() {
// 		}

// 		// TODO [ARC] I don't think this method actually works?
// 		static uniq(textArray) {
// 			let seen = {};
// 		    return a.filter((item) => {
// 		        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
// 		    });
// 		}

// 		// TS returns a boolean
// 		static exactMatch(textList, keywordList) {
// 			return TextUtil.matchWords(textList, keywordList, (text, keyword) => {
// 				return text === keyword;
// 			});
// 		}

// 		// TS returns a boolean
// 		static containsMatch(textList, keywordList) {
// 			return TextUtil.matchWords(textList, keywordList, (text, keyword) => {
// 				return text.includes(keyword);
// 			});
// 		}	

// 		// TS returns a boolean
// 		static regexMatch(textList, regex) {
// 			return textList.some((item) => {
// 				return regex.test(item);
// 			});
// 		}

// 		// TS returns a boolean
// 		static matchWords(textList, keywords, matcherFn) {
// 			return textList.some((text) => {
// 				return keywords.some((keyword) => {
// 					return matcherFn(text, keyword)
// 				});
// 			});
// 		}

// 		// TS returns a string
// 		static cleanText(text) {
// 			return (typeof text !== 'string') ? '' : text.trim().toLowerCase()
// 		}

// 		// TS returns void
// 		static tokenizeText(text) {
// 			const filteredString = sani.replace(/[^a-z0-9+]+/gi, ' ');
// 			const tokenSet = filteredString.split(' ');

// 			if (tokenSet && tokenSet.length > 0) {
// 				acc = acc.concat(tokenSet);
// 			}
// 		}

// 		// TS returns a string
// 		static stripNonAlphaNumeric(text) {
// 			const replaceRegex = /[^\s\w]+/g;
// 			const cleanText = text.replace(replaceRegex, '');

// 			return cleanText.toLowerCase();
// 		}

// 		// TS returns void
// 		static appendText(text, list) {
// 			if (!list.includes(text) && text.length > 0) {
// 				list.push(text);
// 			}
// 		}

// 		// TS returns a string
// 		static randomString(length) {
// 		    let text = '';
// 		    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		    
// 			// TODO [ARC] refactor this if possible
// 			for (let i = 0; i < length; i++) {
// 		        text += possible.charAt(Math.floor(Math.random() * possible.length));
// 		    }

// 		    return text;
// 		}


// 		// TS returns a number
// 		static exactOrderScore(potentialMatches, matchParts) {
// 			const mostMatches = potentialMatches.reduce((acc, textItem) => {
// 				const textParts = textItem.split(' ').filter((item) => {
// 					return item !== '';
// 				});
				
// 				const matches = matchParts.reduce((acc, item, idx) => {
// 					return (idx < textParts.length && item === textParts[idx] && idx === acc) ? acc + 1 : acc;
// 				}, 0);

// 				return (matches > acc) ? matches : acc;
// 			}, 0);

// 			return (mostMatches / matchParts.length);
// 		}

// 		// TS returns a number
// 		static wordMatchScore(potentialMatches, matchParts) {
// 			const mostMatches = potentialMatches.reduce((acc, textItem) => {
// 				const textParts = textItem.split(' ');
				
// 				const matches = matchParts.reduce((acc, item) => {
// 					return textParts.includes(item) ? acc + 1 : acc;
// 				}, 0);

// 				return (matches > acc) ? matches : acc;
// 			}, 0);

// 			return (mostMatches / matchParts.length);
// 		}
// 	}

// 	return TextUtil;
// });
