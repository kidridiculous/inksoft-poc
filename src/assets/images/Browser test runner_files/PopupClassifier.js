define('classification/PopupClassifier',['classification/DomClassifier', 'util/TextUtil'],function(DomClassifier, TextUtil){

	class PopupClassifier extends DomClassifier {

		constructor(options) {
			super(options);
			/*  
			 *  The maximum number of elements,
			 *  below this max number indicates 
			 *  a potential popup scenario
			 */
			this.maxElements = 100;
			this.maxFirstPageElements = 50;
			this.keywords  = ['close', 'continue shopping'];
			this.closerSizeMatches = [];

		}

		alwaysClassify() {
			return true;
		}

		matchesKeywords(element){
			this.elementCount += 1;
			

			if(element.segments["1"]) {
				this.firstPageElementCount += 1;

				if((element.xmax - element.xmin) < 40 && (element.ymax - element.ymin) < 40 && (element.tagName === 'IMG')) {
					this.closerSizeMatches.push(element);
				}
			}

			let popupCloserScore = this.scorePopupCloser(element);
			if(popupCloserScore > 0) {
				this.keywordMatches.push({score:popupCloserScore, element:element});
				return true;
			}

			return false;
		}

		scorePopupCloser(element) {
			let score = 0, i, word, elementText;

			//className
			elementText = TextUtil.cleanText(element.className).split(' ');
			score += this.scoreTextMatch(elementText);

			//title
			elementText = [ TextUtil.cleanText(element.title) ];
			score += this.scoreTextMatch(elementText);

			//innerText
			elementText = [ TextUtil.cleanText(element.innerText) ];
			score += this.scoreTextMatch(elementText);

			//Check an area image map tag alt and href
			if(element.tagName === 'AREA') {
				elementText = [ TextUtil.cleanText(element.alt) ];
				score += this.scoreTextMatch(elementText);

				elementText = [ TextUtil.cleanText(element.href) ];
				score += this.scoreTextMatch(elementText);
			}

			return score;				

		}

		scoreTextMatch(elementText) {

			if(TextUtil.exactMatch(elementText, this.keywords)) {
				return 3;
			} else if(TextUtil.containsMatch(elementText, this.keywords)) {
				return 1;
			}

			return 0;
		}


		postMatchUpdate() {
			if(this.elementCountMatch()) {
				if(this.keywordMatches.length > 0) {
					this.keywordMatches.sort(function(a,b){
						return b.score - a.score;
					});

					this.matchingElement = this.keywordMatches[0].element;
				} else if(this.closerSizeMatches.length > 0) {
					this.closerSizeMatches.sort(function(a, b) {
						const yDiff = a.ymin - b.ymin, xDiff = b.xmax - a.xmax;
						return (yDiff === 0) ? xDiff : yDiff;
					});

					this.matchingElement = this.closerSizeMatches[0];
				}


			} 
		}

		elementCountMatch() {
			return (this.elementCount < this.maxElements || this.firstPageElementCount < this.maxFirstPageElements);
		}



		reset() {
			super.reset();
			this.elementCount = 0;
			this.firstPageElementCount = 0;
			this.closerSizeMatches = [];
		}
	}

	return PopupClassifier;

});

