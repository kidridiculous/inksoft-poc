define('classification/ProductSkuInCartClassifier',
	   ['classification/KeywordClassifier', 'util/TextUtil', 'util/Distance'],
	   function(KeywordClassifier, TextUtil, DistanceUtil){
	//matches an element from the scan to a single attribute

	const RelaxLevel = { STRICT:0, RELAXED:1, LOOSE:2};

	class ProductSkuInCartClassifier extends KeywordClassifier {

		constructor(definition, product){
			super(definition);

			if(typeof product === 'string') {
				this.product = JSON.parse(product);
			} else {
				this.product = product;
			}
			
			this.attributeExceptions = ['one size', '1 size', 'one color', '1 color'];
			this.nameMatches = [];
			this.attributeMatches = {};
						
			//Average Distance to Geometric Median of classified text
			this.proximity = 100;

			//Relaxation Level
			this.relaxation = RelaxLevel.STRICT;

			this.initializeAttributes(this.product);
			this.resetAttrMatches();
		}

		getProductName() {
			let name = '';
			try
			{
				name = (new DOMParser).parseFromString(this.product.name, 'text/html').body.innerText;
			} catch(err) {
				name = this.product.name;
			}
			return TextUtil.cleanText(name);
		}

		hasAttributes() {
			return Array.isArray(this.attributeKeys) && this.attributeKeys.length > 0;
		}

		reset() {
			super.reset();
			this.nameMatches = [];
			this.resetAttrMatches();
		}

		resetAttrMatches() {
			if(!this.hasAttributes()) return;

			this.attributeKeys.forEach(function(att) {
				this.attributeMatches[att] = [];
			}, this);
		}

		initializeAttributes(product) {
			let allKeys = Object.keys(product.attributes);

			this.attributeKeys = [];
			this.attributes = {};

			allKeys.forEach(function(attrKey){
				let attr = product.attributes[attrKey], attrLabel;

				attrLabel = TextUtil.cleanText(attr.label);
				if(this.attributeExceptions.indexOf(attrLabel) === -1) {
					this.attributes[attrKey] = Object.assign({}, attr);
					this.attributeKeys.push(attrKey);
				}

			}, this);
		}

		matchesKeywords(element, scannedTextList){
			
			let humanText = this.getVisibleText(element),
				matchFound = false,
				matchLocation='',
				matchType='',
				nameMatchTest=false,
				titleMatch = false,
				keywordMatch = false;

			nameMatchTest = this.matchesName(element, humanText);

			if(nameMatchTest) {
				this.nameMatches.push({element:element, matchLocation:KeywordClassifier.Matching.MatchLocation.HUMAN, matchType:KeywordClassifier.Matching.MatchType.EXACT});
				return true;
			}

			if(TextUtil.containsMatch(humanText, [this.getProductName()])) {
				this.nameMatches.push({element:element, matchLocation:KeywordClassifier.Matching.MatchLocation.HUMAN, matchType:KeywordClassifier.Matching.MatchType.CONTAINS});

				if(this.hasAttributes()) {
					this.matchAttributes(element, humanText);
				}

				return true;
			}
			else if(this.hasAttributes()) {
				return this.matchAttributes(element, humanText);
			}





			/*
			if(productHasIcon && element.imageSource && element.imageSource.length > 0) {

				var containsSrcMatch = TextUtil.containsMatch([element.imageSource],[this.getIcon()]);

				if(containsSrcMatch){
					this.keywordMatches.push({element:element, matchLocation:KeywordClassifier.Matching.MatchLocation.IMAGE, matchType:KeywordClassifier.Matching.MatchType.EXACT});
					return true;
				}

			} else {
				//Look inside the options to see if there is an option that matches the one we want to select
				if(element.tagName === 'SELECT') {
					if(this.matchElementOptions(element)) {
						this.keywordMatches.push({element:element, matchLocation:KeywordClassifier.Matching.MatchLocation.HUMAN, matchType:KeywordClassifier.Matching.MatchType.EXACT});
						return true;
					}					
				}

				if(this.attributeTitle.length > 0) {
					if(TextUtil.exactMatch(humanText, [this.attributeTitle, this.attributeTitle.toLowerCase()])) {
						matchFound = true;
						matchLocation = KeywordClassifier.Matching.MatchLocation.HUMAN;
						matchType = KeywordClassifier.Matching.MatchType.EXACT;
						negativeMatch = this.negativeWordMatch(humanText);
					} else if(TextUtil.containsMatch(humanText, [this.attributeTitle])) {
						matchFound = true;
						matchLocation = KeywordClassifier.Matching.MatchLocation.HUMAN;
						matchType = KeywordClassifier.Matching.MatchType.CONTAINS;
						negativeMatch = this.negativeWordMatch(humanText);
					}

					if(negativeMatch) { matchFound = false; }

					if(matchFound) {
						this.titleMatches.push({element:element, matchLocation:matchLocation, matchType:matchType});
						titleMatch = true;
					}
				}

				keywordMatch = super.matchesKeywords(element, scannedTextList);

				return (titleMatch || keywordMatch);
			}

			*/
		 	
		}

		matchesName(element, elementText) {
			let replaceRegex = /[^\s\w]+/g, productText = this.getProductName().replace(replaceRegex,'');

			switch(this.relaxation) {
				
				case RelaxLevel.RELAXED:
					elementText = elementText.map(function(t) {
						return t.replace(replaceRegex,'');
					});
					return TextUtil.exactMatch(elementText, [productText]);
				break;
				case RelaxLevel.LOOSE:
					elementText = elementText.map(function(t) {
						return t.replace(replaceRegex,'');
					});
					let productParts = productText.split(' ').filter(function(text) { return text !== '';}), exactOrderScore=0, matchingWordScore=0;

					exactOrderScore = TextUtil.exactOrderScore(elementText, productParts);
					
					matchingWordScore = TextUtil.wordMatchScore(elementText, productParts);

					return exactOrderScore > .5 || matchingWordScore > .5;

				break;
				case RelaxLevel.STRICT:
					return TextUtil.exactMatch(elementText, [this.getProductName()]);
				break;
				default: 
					return false;
					break;
				
			}
			
		}

		matchAttributes(element, extractedElementText) {
			if(!this.hasAttributes()) return false;

			let attr, attrMatch = false, nodeValue;


			this.attributeKeys.forEach(function(key){
				attr = this.attributes[key];

				if(TextUtil.exactMatch(extractedElementText, [TextUtil.cleanText(attr.label)])) {
					this.attributeMatches[key].push({element:element, matchLocation:KeywordClassifier.Matching.MatchLocation.HUMAN, matchType:KeywordClassifier.Matching.MatchType.EXACT});
					attrMatch = true;
				} else if(TextUtil.containsMatch(extractedElementText, [TextUtil.cleanText(attr.label)])) {
					this.attributeMatches[key].push({element:element, matchLocation:KeywordClassifier.Matching.MatchLocation.HUMAN, matchType:KeywordClassifier.Matching.MatchType.CONTAINS});
					attrMatch = true;
				} else {
					//Look at just node value and see if a portion of it matches the attribute
					nodeValue = element.nodeValue;
					if(nodeValue) {
						if(TextUtil.containsMatch([TextUtil.cleanText(attr.label)], [nodeValue])) {
							//Calculate the percentage match by using word count
							var labelCount = attr.label.split(' ').length;
							var nodeValueCount = nodeValue.split(' ').length;
							if(labelCount > 0 && ((nodeValueCount/labelCount) > .32)) {
								this.attributeMatches[key].push({element:element, matchLocation:KeywordClassifier.Matching.MatchLocation.HUMAN, matchType:KeywordClassifier.Matching.MatchType.CONTAINS});
							}
						}
					}
				}
			}, this);

			return attrMatch;
		}

		getVisibleText(element) {
			let textArray = [];
			if(element.buttontext) {
				this.sanitize(element.buttontext, textArray);
			}
			if(element.nodeValue) {
				this.sanitize(element.nodeValue, textArray);
			}
			if(element.innerText){
				this.sanitize(element.innerText, textArray);
			}
				
			if(element.ariaLabel){
				this.sanitize(element.ariaLabel,textArray);
			}	

			if(element.dataTitle){
				this.sanitize(element.dataTitle,textArray);
			}	

			if(element.value){
				this.sanitize(element.value, textArray);
			}

			if(element.title){
				this.sanitize(element.title, textArray);
			}
			return textArray;
		}

		postMatchUpdate() {
			let nameFound = false, attrsFound = true, elementClusters, attrMatchCount=0;

			if(this.nameMatches.length > 0) {
				nameFound = true;
			}

			if(this.hasAttributes()) {

				attrMatchCount = this.attributeKeys.filter(function(attrKey) {
					return this.attributeMatches[attrKey].length > 0;
				}, this).length;

				if(this.relaxation === RelaxLevel.STRICT) {
					//All must match
					attrsFound = attrMatchCount === this.attributeKeys.length;					
				} else {
					
					attrsFound = (attrMatchCount / this.attributeKeys.length) >= .5;
				}
				
			}

			if( nameFound && attrsFound) {

				elementClusters = this.findNearestClusters();

				elementClusters = elementClusters.filter(function(c){
					return c.distanceSummary.mean <= this.proximity;
				}, this);

				elementClusters.sort(function(c1, c2) {
					let c1Mean = c1.distanceSummary.mean, c2Mean = c2.distanceSummary.mean;

					if(c1Mean < c2Mean) {
						return -1;
					}
					else if(c1Mean > c2Mean) {
						return 1;
					}
					else {
						return 0;
					}
				});

				if(elementClusters.length > 0) {
					this.matchingElement = elementClusters[0].referenceElement;
				}
			}
		}


		findNearestClusters() {
			let clusters = [], attrLists = [];

			
			this.attributeKeys.forEach(function(attrKey) {
				if(this.attributeMatches[attrKey].length > 0) {
					attrLists.push([]);
					this.attributeMatches[attrKey].forEach(function(attrMatch) {
						this[this.length-1].push(attrMatch.element);
					}, attrLists);	
				}
				
			}, this);

			this.nameMatches.forEach(function(match) {
				var elements = DistanceUtil.findNearestClusterTo(match.element, attrLists, 0, 0, []);
				var gMedian = DistanceUtil.findGeometricMedian(elements);
				var distanceSummary = DistanceUtil.getDistanceSummary(gMedian, elements);
				var  clusterData = {referenceElement:match.element, elements:elements, distanceSummary: distanceSummary};
				clusters.push(clusterData);
			}, this);

			return clusters;
		}

		relax() {

			if(this.relaxation < RelaxLevel.LOOSE) {
				this.relaxation += 1;
			}
		}





	}	

	return ProductSkuInCartClassifier;

});

