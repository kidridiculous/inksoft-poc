define('classification/DomClassifier', [
	'util/TextUtil',
	'util/Distance',
	'vision/ScanComparer',
	'service/Knowledge',
	'controller/RobotConfig'
], function(TextUtil, DistanceUtil, ScanComparer, Knowledge, RobotConfig) {

	class DomClassifier {

		constructor(knownElementProperties) {

			this.knownElementProperties = knownElementProperties;

			this.keywordMatches = [];
			this.tagMatches = [];
			this._alwaysClassify = knownElementProperties.alwaysClassify || false;

			this.knownElementProperties.tagName = this.knownElementProperties.tagName ? this.knownElementProperties.tagName.toUpperCase() : '';

			if (this.knownElementProperties.id === undefined) {
				this.knownElementProperties.id = '';
			}

			if (typeof this.knownElementProperties.alwaysClassify === 'boolean') {
				this._alwaysClassify = this.knownElementProperties.alwaysClassify;
			}

			this.definition = knownElementProperties.classifier;

			this.definitionData = Knowledge.getClassificationDefinition(this.definition);

			this.priority = (knownElementProperties.priority === undefined) ? '' : knownElementProperties.priority;

			this.timesResolved = 0;

			this._scanOnComplete = (this._scanOnComplete === undefined) ? false : knownElementProperties.scanOnComplete;
		}

		alwaysClassify() {
			return this._alwaysClassify;
		}

		resolved() {
			this.timesResolved += 1;
		}

		getMatchData() {
			return '';
		}

		getScanOnComplete() {
			return this._scanOnComplete;
		}

		setScanOnComplete(value) {
			this._scanOnComplete = value;
		}

		matchesKeywords(element) {
			let result = false;

			const knownPropertyKeys = RobotConfig.getDomClassiferCompareProperties();
				
			const matchBool = ScanComparer.compareElementsByProperties(this.knownElementProperties, element, knownPropertyKeys);

			if (matchBool) {
				this.keywordMatches.push(element);
				result = matchBool;
			}

			return result;
		}

		matchesTags(element) {
			let humanText = this.getVisibleText(element),
				matchFound = false;

			if (this.definitionData && this.definitionData.tags && this.definitionData.tags.length > 0 && humanText.length > 0) {
				matchFound = TextUtil.exactMatch(this.definitionData.tags, humanText);
			}	

			if (matchFound) {
				this.tagMatches.push(element);
			}
			
			return matchFound;
		}

		getVisibleText(element) {
			let textArray = [];

			if (element.innerText) {
				this.sanitize(element.innerText, textArray);
			}
				
			if (element['aria-label']) {
				this.sanitize(element['aria-label'], textArray);
			}	

			if (element.nodeValue) {
				this.sanitize(element.nodeValue, textArray);
			}

			return textArray;
		}

		sanitize(text, textList) {
			TextUtil.appendText(TextUtil.cleanText(text), textList);
		}

		reset() {
			this.keywordMatches = [];
			this.tagMatches = [];
			this.matchingElement = null;
		}

		getElement() {
			return this.matchingElement;
		}

		hasElement() {
			return this.matchingElement !== null && this.matchingElement !== undefined;
		}

		getPriority() {
			return this.priority;
		}

		removeMatch(element) {
			this.keywordMatches = this.keywordMatches.filter((matchEl) => {
				return matchEl !== element;
			});
		}

		hasMatches() {
			return (this.keywordMatches.length > 0);
		}

		postMatchUpdate() {
			if (this.keywordMatches.length < 1) return;

			this.matchingElement = this.keywordMatches.length === 1 ? this.keywordMatches[0] : this.handleMultipleMatches();
		}

		handleMultipleMatches(results) {

			const knownX = this.knownElementProperties.xmin, knownY = this.knownElementProperties.ymin;

			if (this.definitionData && this.definitionData.keyWords && this.definitionData.keyWords.length > 0) {
				
				this.keywordMatches.forEach((match) => {
					match.score = this.scoreMatch(match);
				});

				this.keywordMatches.sort((a, b) => { 
					const scoreDiff = b.score - a.score;
					// if scores are the same, then pick the one closer to the known
					if (scoreDiff === 0) {
						const distA = DistanceUtil.distanceBetweenPoints(knownX, knownY, a.xmin, a.ymin);
						const distB = DistanceUtil.distanceBetweenPoints(knownX, knownY, b.xmin, b.ymin);

						return distA - distB;
					}
					return scoreDiff;
				});

				return this.keywordMatches[0];
			
			} else {
				const filteredElements = this.keywordMatches.filter((el) => {
					return (el.xmin > (knownX-10) && el.xmin < (knownX + 10) && el.ymin  > (knownY - 10) && el.ymin < (knownY + 10));
				});

				if (filteredElements.length === 1) {
					return filteredElements[0];
				}

				const nearestElementsSorted = this.keywordMatches.map((el, index) => {
					const dist = DistanceUtil.distanceBetweenPoints(knownX, knownY, el.xmin, el.ymin);
					return {
						distance: dist,
						index: index
					};
				})
					.sort((a, b) => {
						return a.distance - b.distance;
					});

				return this.keywordMatches[nearestElementsSorted[0].index];
			}
		}

		/* Returns a score for how good the match is */
		scoreMatch(match) {
			let score = 0,
				nearTextCount,
				knownText,
				keyWords = this.definitionData.keyWords,
				keywordScore = 0,
				tagScore = 0;
			
			// get keyword score
			if (match.placeholder && TextUtil.exactMatch(keyWords, [TextUtil.cleanText(match.placeholder)])) {
				keywordScore += 1;
			}

			if (match.textNeighbors) {
				let count = 0;
				
				keywordScore = match.textNeighbors.reduce(function(memo, nearText) {
					if (nearText.distance && nearText.distance < 100) {
						const geoDistScore = Math.abs(100 - nearText.distance) / 100 * ((match.textNeighbors.length - count) / match.textNeighbors.length);
						count++;
						
						if (TextUtil.exactMatch(keyWords, [TextUtil.cleanText(nearText.text)])) {
							return memo + geoDistScore;
						} else if (TextUtil.containsMatch(keyWords, [TextUtil.cleanText(nearText.text)])) {
							return memo + geoDistScore / 2;
						}
					}

					return memo + 0;
				}, keywordScore);
			}
			
			score = Math.min(keywordScore, 1);

			if (this.tagMatches.length > 0) {
				score = this.tagMatches.reduce(function(memo, nearText) {
					if (DistanceUtil.isElementBelow(nearText, match)) {
						return memo + .1;
					} else if (nearText.ymax < match.ymin) {
						return memo + .1;
					} else {
						return memo + 0;
					}
				}, score);
			}

			if (match.textNeighbors && match.textNeighbors.length > 0 && this.knownElementProperties.textNeighbors && this.knownElementProperties.textNeighbors.length > 0) {
				// score matches better if the known textNeighbors are same as the match
				nearTextCount = Math.min(match.textNeighbors.length, this.knownElementProperties.textNeighbors.length);
				
				let i = 0;
				let stillMatching = true;
				
				while (i < nearTextCount && stillMatching) {
					let nearText = match.textNeighbors[i];
					knownText = this.knownElementProperties.textNeighbors[i];

					if (nearText.location === knownText.location &&
						TextUtil.cleanText(nearText.text) === TextUtil.cleanText(knownText.text)) {
						score += 1;
					} else {
						stillMatching = false;
					}

					i++;
				}
			}

			let matchInnerText = TextUtil.cleanText(match.innerText), knownInnerText = TextUtil.cleanText(this.knownElementProperties.innerText);
			if (matchInnerText !== '' && matchInnerText === knownInnerText) {
				score += 1;
			}

			return score;
		}

	}
	
	return DomClassifier;
});
