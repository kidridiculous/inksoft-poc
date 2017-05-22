define('classification/KeywordValueClassifier',['util/TextUtil', 'util/Distance', 'classification/KeywordClassifier'], function(TextUtil, Distance, KeywordClassifier) {

	class KeywordValueClassifier extends KeywordClassifier {

		constructor(definition, keywords, negativeWords, tags, priority) {
			super(definition, keywords, negativeWords, tags, priority);

			this.valueMatchExpression = new RegExp(/\$?(\d|,)+\.?\d+|(FREE)/, 'i');
			this.valuePositionRelation = 'RIGHT';
		}

		reset() {
			super.reset();
			this.valueMatches = [];
		}

		matchesKeywords(element, scannedTextList) {
			let compValue = element.nodeValue;
			if(typeof compValue === 'string') {
				compValue = compValue.trim();
				if( this.valueMatchExpression.test( compValue )) {
					this.valueMatches.push(element);
				}
				else
				{
					return super.matchesKeywords(element, scannedTextList);
				}
			}
			return false;
		}

		postMatchUpdate() {
			let kMatch, valMatch, i,j, positionInfo, matches = [];

			for(i=0;i<this.keywordMatches.length;i++){
				kMatch = this.keywordMatches[i];
				for(j=0;j<this.valueMatches.length;j++) {
					valMatch = this.valueMatches[j];

					positionInfo = Distance.getDistanceVector(kMatch.element, valMatch);
					if(this.matchesPositionRelation(positionInfo)){
						matches.push({keywordElement:kMatch.element, valueElement:valMatch, position:positionInfo});
					}
				}
			}

			if(matches.length === 1) {
				this.matchingElement = matches[0].valueElement;
			}
			else if(matches.length > 1) {
				matches.sort(function(a,b){
					const aKeyCenter = a.keywordElement.center, bKeyCenter = b.keywordElement.center, aValCenter = a.valueElement.center, bValCenter = b.valueElement.center;

					const aKeyValDiff = Math.abs(aKeyCenter.y - aValCenter.y), bKeyValDiff = Math.abs(bKeyCenter.y - bValCenter.y);

					let yDiff = aKeyValDiff - bKeyValDiff;
					if(yDiff === 0) {
						return a.position.distance - b.position.distance;	
					}
					
					return  yDiff;
					
					
				});
				this.matchingElement = matches[0].valueElement;
			}

		}

		matchesPositionRelation(positionInfo) {
			return positionInfo.location === this.valuePositionRelation;
		}
	}

	return KeywordValueClassifier;

})