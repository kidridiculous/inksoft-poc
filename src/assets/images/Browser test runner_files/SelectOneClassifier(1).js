define('classification/SelectOneClassifier', ['util/TextUtil'], function(TextUtil) {

	let Matching = {
		MatchLocation: {
			SELECT_OPTION: 'SELECT_OPTION',
			TARGET_OPTION: 'TARGET_OPTION',
			KEYWORD: 'KEYWORD'
		}
	};

	class SelectOneClassifier {

		constructor(definition, keywords, targetOption, negativeWords, contextKeywords, priority) {
			this.definition = definition;
			this.targetOption = targetOption;
			this.keywords = keywords;
			this.negativeWords = negativeWords;
			this.elementMatches = [];
			this.contextMatches = [];
			this.matchingElement = null;
			this.timesResolved = 0;
			this.priority = priority;
			this.contextKeywords = contextKeywords;
			this.keywordScoreDistance = 100;
			this.useTargetOption = false;
			
			if (typeof this.priority === 'undefined') {
				this.priority = '';
			}

			this._scanOnComplete = false;
			
			if (typeof this.targetOption === 'string') {
				
				this.targetOptionRegex = new RegExp('^[\\s\\W]*' + this.targetOption + '[\\s\\W]*$', 'i');
			
			} else if (typeof this.targetOption === 'object' && this.targetOption.expression && this.targetOption.flags) {
				
				this.targetOptionRegex = new RegExp(this.targetOption.expression, this.targetOption.flags);
			
			} else {
				
				throw Error('targetOption should be a string or object with \'expression\' and \'flags\' values');
			
			}
		}

	 	toggleTargetOption(val) {
	 		this.useTargetOption = val;
	 	}

		resolved() {
			this.timesResolved += 1;
		}
		
		getElement() {
			return this.matchingElement;
		}

		hasElement() {
			return this.matchingElement !== null;
		}

		getPriority() {
			return this.priority;
		}

		alwaysClassify() {
			return false;
		}

		getScanOnComplete() {
			return this._scanOnComplete;
		}

		setScanOnComplete(value) {
			this._scanOnComplete = value;
		}
		
		removeMatch(element) {
			this.elementMatches = this.elementMatches.filter(item => {
				return this.element !== item;
			}, this);
		}

		sanitize(text, textList) {
			TextUtil.appendText(TextUtil.cleanText(text), textList);
		}

		reset() {
			this.elementMatches = [];
			this.contextMatches = [];
			this.matchLocation = '';
			this.matchingElement = null;
		}

		matchesTags(element) {
			let humanText = this.getVisibleText(element),
				matchFound = false;

			if (this.contextKeywords && this.contextKeywords.length > 0) {
				matchFound = TextUtil.exactMatch(this.contextKeywords, humanText);
			}	

			if (matchFound) {
				this.contextMatches.push(element);
			}
			
			return matchFound;
		}

		matchesKeywords(element, scannedTextList) {
			return this.matches(element, scannedTextList);
		}

		matches(element, scannedTextList) {
			let humanText = this.getVisibleText(element, false),
				elementOnlyText = this.getVisibleText(element, true),
				matchFound = false,
				matchLocation = '',
				matchType = '',
				keywordMatch = false,
				optionMatch = false;
			
			if (element.tagName === 'SELECT') {
				if (this.matchElementOptions(element)) {
					
					//matchType = KeywordClassifier.Matching.MatchType.EXACT;
					matchLocation = Matching.MatchLocation.SELECT_OPTION;
					matchFound = true;
				
				}					
			} else if (this.matchesTargetOption(element, elementOnlyText) && this.useTargetOption) {
				
				matchLocation = Matching.MatchLocation.TARGET_OPTION;
				matchFound = true;
			
			} else if (TextUtil.exactMatch(humanText, this.keywords)) {
				
				matchLocation = Matching.MatchLocation.KEYWORD;
				matchFound = true;
			
			}

			if (matchFound) {
				matchFound = !this.negativeWordMatch(humanText);
			}
			
			if (matchFound) {
				this.elementMatches.push({
					element: element,
					matchLocation:matchLocation
				});
			}

			return matchFound;
		}

		// TS returns bool
		matchElementOptions(element) {
			return element.options.some(opt => {
				return this.targetOptionRegex.test(opt.humanText);
			}, this);
		}

		negativeWordMatch(textList) {
			return (this.negativeWords && this.negativeWords.length > 0) ? (TextUtil.exactMatch(textList, this.negativeWords)) : false;
		}

		matchesTargetOption(element, humanText) {
			return TextUtil.regexMatch(humanText, this.targetOptionRegex);
		}

		getVisibleText(element, elementOnly) {
			let textArray = [];
			
			if (element.buttontext) {
				this.sanitize(element.buttontext, textArray);
			}
			
			if (element.nodeValue) {
				this.sanitize(element.nodeValue, textArray);
			}
			
			if (element.innerText) {
				this.sanitize(element.innerText, textArray);
			}
				
			if (element.ariaLabel) {
				this.sanitize(element.ariaLabel,textArray);
			}	

			if (element.dataTitle) {
				this.sanitize(element.dataTitle,textArray);
			}	

			if (element.value) {
				this.sanitize(element.value, textArray);
			}

			if (element.title) {
				this.sanitize(element.title, textArray);
			}

			if (element.name) {
				this.sanitize(element.name, textArray);
			}

			if (element.textNeighbors && element.textNeighbors.length > 0) {
				let foundFirstNotInside = false,
					txtIndex = 0,
					nearText;
				
				while (!foundFirstNotInside && txtIndex < element.textNeighbors.length) {
					nearText = element.textNeighbors[txtIndex];
					foundFirstNotInside = nearText.location !== 'INSIDE';

					if (elementOnly) {
						if (nearText.location === 'INSIDE') {
							this.sanitize(nearText.text, textArray);	
						}
					} else {
						this.sanitize(nearText.text, textArray);
					}
					
					txtIndex += 1;
				}
			}

			return textArray;
		}

		postMatchUpdate(matchFilter) {
			// only match on specific types
			if (typeof matchFilter === 'string') {
				this.elementMatches = this.elementMatches.filter(match => {
					return match.matchLocation === matchFilter;
				});
			}

			// search keyword matches first it would contain elements that match the attribute label or value
			let match;
			
			if (this.elementMatches.length == 1) {
				
				this.matchType = this.elementMatches[0].matchLocation;
				this.matchingElement = this.elementMatches[0].element;
			
			} else if (this.elementMatches.length > 1) {
				
				match = this.handleMultipleMatches(this.elementMatches);
				this.matchType = match.matchLocation;
				this.matchingElement = match.element;
			
			}
		}

		getMatchData() {
			return this.matchType;
		}

		handleMultipleMatches(results) {
			// score each match result
			// NOTE [ARC] you could probably map this instead, not sure if the match scores and sort need to be saved beyond this method
			results.forEach(match => {
				match.score = this.scoreMatch(match);
			}, this);

			// return the single highest-scored match item from the results (result at scored index 0)
			return results.sort((a, b) => { 
				const scoreDiff = b.score - a.score;
				// if scores are the same, then pick the one closer to the top
				return (scoreDiff === 0) ? (a.element.segmentScrollY - b.element.segmentScrollY) : scoreDiff;
			})[0];
		}

		scoreMatch(match) {
			let score = 0;

			switch (match.matchLocation) {
				case Matching.MatchLocation.SELECT_OPTION:
					score += 2;
					score += this.getKeywordScore(match.element);
					break;
				case Matching.MatchLocation.TARGET_OPTION:
					score += 2;
					score += this.getKeywordScore(match.element);
					break;
				case Matching.MatchLocation.KEYWORD:
					score += 1;
					score += this.getKeywordScore(match.element);
					break;
			}

			switch (match.element.tagName) {
				case 'INPUT':
					switch (match.element.type) {
						case 'radio':
						case 'checkbox':
						score += .5;
						break;
					}
				break;
			}

			if (match.element.isNonStandardDropDown) {
				score += .5;
			}

			score += this.getContextScore(match.element);

			return score;
		}
		
		getKeywordScore(element) {
			let nearText,
				geoDistScore = 0,
				i = 0,
				keywordScore = 0;

			if (element.textNeighbors) {
				while (i < element.textNeighbors.length) {
					nearText = element.textNeighbors[i];
					if (nearText.distance < this.keywordScoreDistance) {
						geoDistScore = Math.abs(this.keywordScoreDistance - nearText.distance) / this.keywordScoreDistance * ((element.textNeighbors.length-i)/element.textNeighbors.length);
						if (TextUtil.exactMatch(this.keywords, [TextUtil.cleanText(nearText.text)])) { 
							keywordScore += geoDistScore;
						} else if (TextUtil.containsMatch(this.keywords, [TextUtil.cleanText(nearText.text)])) {
							keywordScore += (geoDistScore / 2);
						}
					}
					i++;
				}
			}

			return keywordScore;
		}

		getContextScore(element) {
			const score = this.contextMatches.reduce((aggregator, contextMatch) => {
				return (element.ymin > contextMatch.ymin) ? aggregator + 1 : aggregator;
			}, 0);

			return Math.min(1, score);
		}
	}

	SelectOneClassifier.MatchType = Matching.MatchLocation;

	return SelectOneClassifier;
});
