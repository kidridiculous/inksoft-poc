define('classification/ProductAttributeClassifier', ['classification/KeywordClassifier', 'util/TextUtil', 'util/Distance'], function(KeywordClassifier, TextUtil, DistanceUtil) {
	
	//matches an element from the scan to a single attribute
	const INPUT_TYPES = ['text', 'tel', 'password', 'email', 'number'];

	const TITLE_PREFIXES = ['select', 'choose', 'please select', 'please choose'];

	const REVEAL_KEYWORDS = ['view more', 'view\nmore'];

	const WIDTH_SYNONYMS = {
		'S': ['s (slim)'],
		'N': ['n (narrow)'],	
		'B': ['n (narrow)'],
		'M': ['n (medium)'],
		'W': ['w (wide)'],
		'WW': ['ww (extra wide)'],
		'D': ['d (medium)'],
		'E': ['e (wide)'],
		'EE': ['ee (extra wide)'],
		'EEE': ['eee (extra-extra wide)'],
		'EEEE': ['eeee (extra-extra-extra wide)']
	};

	const SIZE_SYNONYMS = {
		'Regular-XX-Small': ['xx-small'],
		'Regular-X-Small': ['x-small'],
		'Regular-Small': ['small'],
		'Regular-Medium': ['medium'],
		'Regular-Large': ['large'],
		'Regular-X-Large': ['x-large'],
		'Petite-Petite P': ['petite p'],
		'Petite-Small P': ['small p'],
		'Petite-Medium P': ['medium p'],
		'Petite-Large P': ['large p']
	};


	const LABEL_SYNONYMS = {'width':WIDTH_SYNONYMS, 'size':SIZE_SYNONYMS};

	class ProductAttributeClassifier extends KeywordClassifier {

		constructor(definition, attribute) {
			let keywords = [],
				tags = [],
				attributeLabel = '',
				attributeValue = '',
				attributeTitle = '';
		
			if (typeof attribute.label === 'string' && attribute.label.length > 0) {
				keywords.push(attribute.label);
				keywords.push(attribute.label.toLowerCase());
				attributeLabel = attribute.label;
			}			

			if (typeof attribute.value === 'string' && attribute.value.length > 0) {
				keywords.push(attribute.value);
				keywords.push(attribute.value.toLowerCase());
				attributeValue = attribute.value;
			}

			if (typeof attribute.title === 'string' && attribute.title.length > 0) {
				attributeTitle = attribute.title.toLowerCase();

				if(LABEL_SYNONYMS[attributeTitle]) {
					const attrSyn = LABEL_SYNONYMS[attributeTitle];
					if(Array.isArray(attrSyn[attributeLabel])) {
						keywords = keywords.concat(attrSyn[attributeLabel]);
					}
				}
			}

			const negativeWords = ['size guide', 'size chart', 'fit & sizing', 'qty', 'quantity', 'select quantity', 'select qty', 'qty:', 'fewer sizes', 'fewer colors', 'hides content', 'fewer colors hides content', 'fewer sizes hides content', 'add to bag'];

			super(definition, keywords, negativeWords, tags);

			this.titleKeywords = this.getTitleKeywords(attributeTitle);
			this.attribute = attribute;
			this.attributeLabel = attributeLabel;
			this.attributeTitle = attributeTitle;
			this.attributeValue = attributeValue;
			this.revealMatches = [];
		}

		getTitleKeywords(attrTitle) {
			const titleKeywords = TITLE_PREFIXES.map((prefix) => {
				return `${prefix} ${attrTitle}`;
			});

			titleKeywords.push(attrTitle);

			return titleKeywords;
		}

		reset() {
			super.reset();
			this.titleMatches = [];
			this.titleLabelMatches = [];
			this.revealMatches = [];
		}

		getMatchData() {
			return this.matchType;
		}

		postMatchUpdate(matchType) {

			const labelMatchOnly = (matchType === 'TARGET_OPTION');

			// search Keyword matches first it would contain elements that match the attribute label or value
			if (this.keywordMatches.length === 1) {
				this.matchType = 'ATTRIBUTE_LABEL';
				this.matchingElement = this.keywordMatches[0].element;
			} else if (this.keywordMatches.length > 1) {
				this.matchType = 'ATTRIBUTE_LABEL';
				this.matchingElement = this.handleMultipleMatches(this.keywordMatches);
			} else if (this.titleLabelMatches.length === 1 && !labelMatchOnly) {
				this.matchType = 'ATTRIBUTE_LABEL';
				this.matchingElement = this.titleLabelMatches[0];
			} else if (this.titleLabelMatches.length > 1) {
				this.matchType = 'ATTRIBUTE_LABEL';
				this.matchingElement = this.handleMultipleMatches(this.titleLabelMatches);
			} else if (this.revealMatches.length === 1 && !labelMatchOnly) {
				this.matchType = 'ATTRIBUTE_REVEAL';
				this.matchingElement = this.revealMatches[0];
			} else if (this.revealMatches.length > 1 && !labelMatchOnly) {
				this.matchType = 'ATTRIBUTE_REVEAL';
				this.matchingElement = this.findBestRevealMatch(this.revealMatches, this.titleMatches);
			} else if(!labelMatchOnly){
				// if no matches based on the attribute look to matches based on title
				if (this.titleMatches.length === 1) {
					this.matchType = 'ATTRIBUTE_TITLE';
					this.matchingElement = this.titleMatches[0].element;
				} else if (this.titleMatches.length > 1) {
					this.matchType = 'ATTRIBUTE_TITLE';
					this.matchingElement = this.handleMultipleMatches(this.titleMatches);	
				} else {
					console.error('unable to match product attribute');
				}
			}
		}

		matchesKeywords(element, scannedTextList) {
			if (element.tagName === 'SELECT' && (element.type === 'select-one' && element.id === 'sbc-quantity-picker')) {
				return false;
			}
			
			let productHasIcon = this.hasIcon(),
				humanText = this.getVisibleText(element),
				matchFound = false,
				matchLocation = '',
				matchType = '',
				negativeMatch = false,
				titleMatch = false,
				keywordMatch = false,
				revealMatch = false;

			if (productHasIcon && element.imageSource && element.imageSource.length > 0) {

				const containsSrcMatch = TextUtil.containsMatch([element.imageSource], [this.getIcon()]);

				if (containsSrcMatch) {
					this.keywordMatches.push({
						element: element,
						matchLocation: KeywordClassifier.Matching.MatchLocation.IMAGE,
						matchType: KeywordClassifier.Matching.MatchType.EXACT
					});
					
					return true;
				}

			} else {

				if (this.isRevealMatch(element)) {
					revealMatch = true;
					this.revealMatches.push(element);
				}

				if (element.tagName === 'INPUT' && INPUT_TYPES.includes(element.type)) {
					return false;
				}

				// look inside the options to see if there is an option that matches the one we want to select
				if (element.tagName === 'SELECT') {
					if (this.matchElementOptions(element)) {
						negativeMatch = this.negativeWordMatch(humanText);
						if (!negativeMatch) {
							this.keywordMatches.push({
								element: element,
								matchLocation: KeywordClassifier.Matching.MatchLocation.HUMAN,
								matchType: KeywordClassifier.Matching.MatchType.EXACT
							});
							
							return true;	
						} 
						return false;
					}					
				} else {
					keywordMatch = super.matchesKeywords(element, scannedTextList);
				}

				if (this.attributeTitle.length > 0) {

					if (this.isLabelAndTitleMatch(humanText)) {
						this.titleLabelMatches.push({
							element: element
						});
					}

					if (TextUtil.exactMatch(humanText, this.titleKeywords)) {

						matchFound = true;
						matchLocation = KeywordClassifier.Matching.MatchLocation.HUMAN;
						matchType = KeywordClassifier.Matching.MatchType.EXACT;
						negativeMatch = this.negativeWordMatch(humanText);

					} else if (TextUtil.partialMatch(humanText, this.titleKeywords, 3)) {

						matchFound = true;
						matchLocation = KeywordClassifier.Matching.MatchLocation.HUMAN;
						matchType = KeywordClassifier.Matching.MatchType.CONTAINS;
						negativeMatch = this.negativeWordMatch(humanText);
					
					}

					if (negativeMatch) {
						matchFound = false;
					}

					if (matchFound) {
						this.titleMatches.push({
							element: element,
							matchLocation: matchLocation,
							matchType: matchType
						});
						
						titleMatch = true;
					}
				}
				
				return (titleMatch || keywordMatch || revealMatch);
			}
		 	
		}

		isLabelAndTitleMatch(elText) {
			const alphaNumericText = elText.map((t) => {
				return TextUtil.stripNonAlphaNumeric(t);
			});

			const titleLabelText = [this.attributeTitle.toLowerCase() + ' ' + this.attributeLabel.toLowerCase()];

			return TextUtil.exactMatch(alphaNumericText, titleLabelText);
		}

		getVisibleText(element) {
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

			if (element.alt) {
				this.sanitize(element.alt, textArray);
			}

			if (element.textNeighbors && element.textNeighbors.length > 0) {
				let foundFirstNotInside = false,
					txtIndex = 0,
					nearText;
				
				while (!foundFirstNotInside && txtIndex < element.textNeighbors.length) {
					nearText = element.textNeighbors[txtIndex];
					
					foundFirstNotInside = nearText.location !== 'INSIDE';
					if(nearText.distance < 100) {
						this.sanitize(nearText.text, textArray);
					}
					txtIndex += 1;
				}	
			}

			return textArray;
		}

		hasIcon() {
			return (this.attribute) && this.attribute.icon && this.attribute.icon.length > 0;
		}

		getIcon() {
			return this.attribute.icon;
		}
		
		matchElementOptions(element) {
			const options = element.options;
			const regex = new RegExp(`^[\\s\\W\\d]*${this.attributeLabel}[\\s\\W\\d]*$`, 'i');

			return options.some((elem) => {
				return regex.test(elem.humanText);
			});
		}

		// matchOlUlElementListItems(element) {
		// 	// if the element argument is not an ol or ul, return immediately
		// 	if (element.tagName !== 'OL' || element.tagName !== 'UL') {
		// 		return false;
		// 	}

		// 	return
		// }

		handleMultipleMatches(results) {
			results.forEach((item) => {
				item.score = this.scoreMatch(item);
			});

			const sortedResults = results.sort(function(a, b) { 
				const scoreDiff = b.score - a.score;
				// if scores are the same, then pick the one closer to the top
				return (scoreDiff === 0) ? (a.element.segmentScrollY - b.element.segmentScrollY) : scoreDiff;
			});

			return sortedResults[0].element;
		}

		// returns a score for how good the match is
		scoreMatch(match) {
			let score = 0,
				labelRegex = new RegExp(this.attributeLabel, 'i'),
				valueRegex = new RegExp(this.attributeValue, 'i');

			switch (match.matchLocation) {
				case KeywordClassifier.Matching.MatchLocation.IMAGE:
					score+= 4;
					if (labelRegex.test(match.element.innerHTML)) {
						score += 1;
					}
					break;
				case KeywordClassifier.Matching.MatchLocation.HUMAN:
					score+= 2;
					break;
				case KeywordClassifier.Matching.MatchLocation.DOM:
					score += 1;
					break;
			}

			switch (match.matchType) {
				case KeywordClassifier.Matching.MatchType.EXACT:
					score+= 2;
					break;
				case KeywordClassifier.Matching.MatchType.CONTAINS:
					score+= 1;
					break;
			}

			if (match.element.tagName && match.element.tagName.length) {
				switch(match.element.tagName) {
					case 'SELECT':
						score += 4;
						break;
					case 'LABEL':
						score += 2;
						if(match.element.forElement && match.element.forElement.tagName === 'INPUT') {
							score += .5;
						}
						break;
					case 'IMG':
					case 'A':
					
					case 'SPAN':
					case 'DIV':
					case 'BUTTON':
					case 'INPUT':
						score += 2
						break;
					default:
						score += 1;
						break;
				}
			}

			if (match.element.isButton) {
				score += 1;
			}	

			if (match.element.isNonStandardDropDown) {
				score += 2;
			}

			score += this.getKeywordScore(match.element);

			return score;
		}

		getKeywordScore(element) {
			const textExtractors = ['buttontext', 'nodeValue', 'innerText', 'ariaLabel', 'dataTitle', 'value', 'title','alt']
			let textArray = [];

			textExtractors.forEach(function(prop) {
				if(element[prop]) {
					this.sanitize(element[prop], textArray);
				}
			}, this);

			if(element.textNeighbors) {
				const insideText = element.textNeighbors.find(function(text) {
					return text.location === 'INSIDE';
				});

				if(insideText !== undefined) {
					this.sanitize(insideText.text, textArray);
				}
			}
			
			if (TextUtil.exactMatch(this.keywords, textArray)) {
				return 1;
			}
			return 0;

			
		}

		isRevealMatch(el) {
			if (el.isButton) {
				const btnText = [ TextUtil.cleanText(el.buttontext) ];

				return TextUtil.exactMatch(btnText, REVEAL_KEYWORDS);
			}

			return false;
		}

		findBestRevealMatch(revealMatches, titleMatches) {
			if (titleMatches.length == 0) {
				return revealMatches[0];				
			} else {
				const titleMatch = this.handleMultipleMatches(this.titleMatches);

				return revealMatches.reduce((el1, el2) => {
					const d1 = DistanceUtil.distanceBetweenPoints(titleMatch.center.x, titleMatch.center.y, el1.center.x, el1.center.y);
					const d2 = DistanceUtil.distanceBetweenPoints(titleMatch.center.x, titleMatch.center.y, el2.center.x, el2.center.y);

					return d1 <= d2 ? el1 : el2;
				});
			}
		}
	}	

	return ProductAttributeClassifier;
});
