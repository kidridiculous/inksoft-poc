define('classification/ProductShippingClassifier', ['classification/KeywordClassifier', 'util/TextUtil', 'util/Distance'],function(KeywordClassifier, TextUtil, DistanceUtil){

	class ProductShippingClassifier extends KeywordClassifier{
		constructor(definition, product) {
			super(definition, ['delivery', 'shipping'],[],[]);
			this.product = product;
			this.location = 'LEFT'
			this.shippingElements = [];
		}

		reset() {
			super.reset();
			this.shippingElements = [];
		}

		getName() {
			return this.product.name;
		}

		matchesKeywords(element) {

			let humanText = this.getVisibleText(element), match = false;

			if(TextUtil.exactMatch(humanText, [TextUtil.cleanText(this.getName())])) {
				this.productCartElement = element;	
				match = true;
			}

			if(TextUtil.exactMatch(this.keywords, humanText)) {
				this.shippingElements.push(element);
				match = true;
			}	

			return match;
		}

		postMatchUpdate(){
			let i=0, shipEl;
			if(this.productCartElement) {
				for(i=0;i<this.shippingElements.length;i++) {
					shipEl = this.shippingElements[i];

					if(this.matchShippingToProductLocation(this.productCartElement, shipEl)) {
						this.keywordMatches.push(
							{
								element:shipEl, 
								matchLocation:KeywordClassifier.Matching.MatchLocation.HUMAN, 
								matchType:KeywordClassifier.Matching.MatchType.EXACT
							});
					}
				}
			}

			super.postMatchUpdate();
		}

		matchShippingToProductLocation(productEl, shipEl) {
			return (productEl.xmax < shipEl.xmin &&
			productEl.ymin - 50 < shipEl.center.y &&
			productEl.ymin + 50 > shipEl.center.y)
		}

		handleMultipleMatches(results) {

			results.forEach(function(match){
                match.score = this.scoreMatch(match);
            }, this);

            let singleMatch = results.sort(
                function(a, b){ 
                    return b.score - a.score;
                }
            )[0].element;

            return singleMatch;
        }

        /* Returns a score for how good the match is */
        scoreMatch(match) {
            let score = 0

            if(match.element.tagName && match.element.tagName.length) {
                if(match.element.tagName === 'INPUT') {
             		score += 1;
                }    
            }

            if(match.element.type && match.element.type.length) {
                if(match.element.type === 'radio') {
             		score += 3;
                }    
            }

            return score;
		}


	}

	return ProductShippingClassifier

});