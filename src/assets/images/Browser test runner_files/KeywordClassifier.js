define('classification/KeywordClassifier', [
	'util/TextUtil',
	'util/Distance'
], function(TextUtil, Distance) {

	class KeywordClassifier {

		constructor(definition, keywords, negativeWords, tags, priority) {
			this.definition = definition;
			this.keywords = keywords;
			this.negativeWords = negativeWords;
			this.tags = tags;
			this.useDomMatching = false;
			this.priority = priority || '1';
			this.timesResolved = 0;
			this.reset();
			this._scanOnComplete = false;
		}

		resolved() {
			this.timesResolved += 1;
		}

		reset() {
			this.matchData = '';
			this.keywordMatches = [];
			this.tagMatches = [];
			this.matchingElement = null;
		}
		
		// TS returns a string
		getMatchData() {
			return this.matchData;
		}

		// TS returns an element
		getElement() {
			return this.matchingElement;
		}

		// TS returns a boolean
		hasElement() {
			return this.matchingElement !== null;
		}

		// TS returns a string
		getPriority() {
			return this.priority;
		}

		// TS returns a booleans
		alwaysClassify() {
			return false;
		}

		// TS returns a boolean
		getScanOnComplete() {
			return this._scanOnComplete;
		}

		setScanOnComplete(value) {
			this._scanOnComplete = value;
		}
		
		// TS returns a boolean
		// removes a matching element from this.keyWordMatches and returns true if a match was found, false if not
		removeMatch(element) {
			const matchFound = this.keywordMatches.includes(function(match) {
				return match.element === element;
			});

			if (matchFound) {
				this.keywordMatches = this.keywordMatches.filter(function(match) {
					return match.element !== element;
				});
			}

			return matchFound;
		}

		// TS returns a boolean
		// if a match is found, push a match object to the keywordMatches array
		matchesKeywords(element, scannedTextList) {
			let humanText = this.getVisibleText(element),
				matchLocation,
				matchType,
				matchFound = false,
				negativeMatch = false;
 
			if (TextUtil.exactMatch(humanText, this.keywords)) {
				
				matchFound = true;
				matchLocation = KeywordClassifier.Matching.MatchLocation.HUMAN;
				matchType = KeywordClassifier.Matching.MatchType.EXACT;
				negativeMatch = this.negativeWordMatch(humanText);

			// NOTE [ARC] the first argument is false so this logic seems to never run, commented out for now
			// } else if (false && TextUtil.containsMatch(humanText, this.keywords)) {
				
			// 	matchFound = true;
			// 	matchLocation = KeywordClassifier.Matching.MatchLocation.HUMAN;
			// 	matchType = KeywordClassifier.Matching.MatchType.CONTAINS;
			// 	negativeMatch = this.negativeWordMatch(humanText);

			} else if (this.useDomMatching) {

				const domText = this.getDomText(element);

				if (TextUtil.exactMatch(domText, this.keywords)) {

					matchFound = true;
					matchLocation = KeywordClassifier.Matching.MatchLocation.DOM;
					matchType = KeywordClassifier.Matching.MatchType.EXACT;
					negativeMatch = this.negativeWordMatch(domText);

				} else if(TextUtil.containsMatch(domText, this.keywords)) {
					
					matchFound = true;
					matchLocation = KeywordClassifier.Matching.MatchLocation.DOM;
					matchType = KeywordClassifier.Matching.MatchType.CONTAINS;
					negativeMatch = this.negativeWordMatch(domText);

				}
			}

			if (negativeMatch) {
				matchFound = false;
			}

			if (matchFound) {
				this.keywordMatches.push({
					element: element,
					matchLocation: matchLocation,
					matchType: matchType
				});
			}

			return matchFound;
		}

		matchesTags(element) {

			let humanText = this.getVisibleText(element),
				matchFound = false;

			if (this.tags && this.tags.length > 0) {
				matchFound = TextUtil.containsMatch(humanText, this.tags);
			}	

			if (matchFound) {
				this.tagMatches.push(element);
			}
			
			return matchFound;
		}

		negativeWordMatch(textList) {
			let negMatch = false;

			if (this.negativeWords && this.negativeWords.length > 0) {
				negMatch = TextUtil.exactMatch(textList, this.negativeWords);
			}

			return negMatch;
		}

		hasMatches() {
			return (this.keywordMatches.length > 0);
		}

		// extracts the human visible text that the scanned element has
		getVisibleText(element) {
			let textArray = [];

			if (element.placeholder) {
				this.sanitize(element.placeholder, textArray);
			}

			if (element.buttontext) {
				this.sanitize(element.buttontext, textArray);
			}
			
			if (element.title) {
				this.sanitize(element.title, textArray);	
			}

			if (element.cssContent && element.cssContent.length > 0) {
				element.cssContent.forEach(function(text) {
					if (typeof text === 'string') {
						this.sanitize(text, textArray);
					}
				}, this);
			}
			
			if (element.innerText) {
				this.sanitize(element.innerText, textArray);
			}
				
			if (element['aria-label']) {
				this.sanitize(element['aria-label'],textArray);
			}	

			if (element.value) {
				this.sanitize(element.value, textArray);
			}
			
			if (element.isInput && element.textNeighbors && element.textNeighbors.length > 0) {
				this.sanitize(element.textNeighbors[0].text, textArray);
			}

			if (element.nodeValue) {
				this.sanitize(element.nodeValue, textArray);
			}

			if(element.name) {
				this.sanitize(element.name, textArray);
			}

			return textArray;
		}

		// get text from the element that is only obtainable from the dom
		getDomText(element) {
			let textArray = [];

			if (element.id) {
				this.sanitize(element.id, textArray);
			}

			if (element.name) {
				this.sanitize(element.name, textArray);	
			}

			if (element.className) {
				this.sanitize(element.className, textArray);
			}

			if (element.htmlFor) {
				this.sanitize(element.htmlFor, textArray);
			}

			return textArray;
		}


		sanitize(text, textList) {
			TextUtil.appendText(TextUtil.cleanText(text), textList);
		}

		classificationComplete() {
			// TODO is this still needed?
		}

		// method for any post processing this classifier should do after it has seen all scanned data
		postMatchUpdate() {

			if (this.keywordMatches.length === 1) {

				this.matchingElement = this.keywordMatches[0].element;

			} else if (this.keywordMatches.length > 1) {
				// it should be an element with a tag and it should be something that has a center
				const results = this.keywordMatches.filter(function(match) {
					const el = match.element;

					if (typeof el.center !== 'object') {
						return false;
					}

					if (typeof el.center.x !== 'number' || typeof el.center.y !== 'number') {
						return false;
					}
					
					if (el.isButton || el.isInput || el.buttontext) {
						return true;	
					}

					if (el.tagName) {
						return true;
					}

				});

				if (results.length === 1) {
	
					this.matchingElement = results[0].element;

				} else if (results.length > 1) {

					this.matchingElement = this.handleMultipleMatches(results);

				} 
			}
		}

		handleMultipleMatches(results) {
			return results.sort(function(a, b) {
				return a.element.classification.length - b.element.classification.length
			})[0].element;
		}
	}

	KeywordClassifier.Matching = {};

	KeywordClassifier.Matching.MatchLocation = {
		HUMAN: 'HUMAN',
		DOM: 'DOM',
		IMAGE:'IMAGE'
	};

	KeywordClassifier.Matching.MatchType = {
		EXACT: 'EXACT',
		CONTAINS: 'CONTAINS'
	};

	return KeywordClassifier;
});
