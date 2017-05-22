
define('classification/ScanClassifier', [
	'service/Knowledge',
	'util/Distance',
	'classification/KeywordClassifier',
	'classification/FormInputClassifier',
	'classification/AddToCartClassifier',
	'classification/QuantityClassifier',
	'classification/ProductAttributeClassifier'
], function(
	Knowledge,
	Distance,
	KeywordClassifier,
	FormInputClassifier,
	PhoneInputClassifier,
	AddToCartClassifier,
	QuantityClassifier,
	ProductAttributeClassifier
) {

	class ScanClassifier {
    
		constructor(merchantId) {
			this.createClassifiers();
			this.doHLC = false;
		}

		createClassifiers() {
			this.classifiers = [];
			
			let definitions = Knowledge.getDefinitions(),
				classifier;

			for (let def in definitions) {

				classifier = this.createClassifier(def, Knowledge.getClassificationDefinition(def));
				
				this.classifiers.push(classifier);
			}
		}

		initializeClassifiers(list) {
			this.classifiers = list;
		}

		createClassifier(definitionName, definitionData) {

			if (definitionData.classifier === 'FormInputClassifier') {

				return new FormInputClassifier(
					definitionName,
					definitionData.keyWords,
					definitionData.negativeWords,
					definitionData.tags
				);

			} else if (definitionData.classifier === 'AddToCartClassifier') {
				 return new AddToCartClassifier(definitionData);

			} else if (definitionData.classifier === 'QuantityClassifier') {
				 return new QuantityClassifier(definitionData);

			} else if (definitionData.classifier === 'ProductAttributeClassifier') {
				// TODO [ARC] this can break because the call signature does not match the method signature (definitinoData, attributes)
				return new ProductAttributeClassifier(definitionData);				 

			} else {
				return new KeywordClassifier(
					definitionName,
					definitionData.keyWords,
					definitionData.negativeWords,
					definitionData.tags,
					definitionData.priority
				);
			}
		}

		update(scannerData) {
			if (typeof scannerData === 'undefined') return;
					
			try {
		        this.resetClassifiers();

                // Push all data through classifiers
                this.classifyElements(scannerData.formattedElements);

                // Now that all data has been through classifiers, make a second pass on all classified elements
                if (this.doHLC) {
                	this.updateClassifiedElements();	
                }

                // Update classifiers after they have seen everything from the scna
                this.updateClassifiers();
            
			} catch (e) {
                console.log(e);
                debugger;
            }

		}

		classifyElements(elements) {
			elements.forEach((element) => {
				this.classifyElement(element);
			});
		}

		classifyElement(element) {
			element.classification = [];

       		this.classifiers.forEach((cls) => {

				if (cls.matchesKeywords(element)) {
					
					this.matchingClassifiers[cls.definition] = cls;

					console.log(`found matching classifier: ${cls.definition}`);
					
					if (!element.classification.includes(cls.definition)) {
						element.classification.push(cls.definition);
					}

					if (!this.classifiedElements.includes(element)) {
						this.classifiedElements.push(element);
					}			

				} else if (cls.matchesTags(element)) {
					// TODO ???
				}
			});
		}

		resetClassifiers() {			
			this.classifiers.forEach((classifier) => {
				classifier.reset();
			});

			this.matchingClassifiers = {};
			this.classifiedElements = [];
		}

		updateClassifiedElements() {
			let definition,
				tagMatch;

			this.classifiedElements.forEach(function(element) {
				// perform High Level Classification
				if (element.classification.length > 1) {
					definition = this.highLevelClassify(element);

					if (definition) {
						for (let j = 0; j < element.classification.length; j++) {
							if (element.classification[j] != definition) {
								cls = this.matchingClassifiers[element.classification[j]];
								cls.removeMatch(element);
							}
						}
						
						element.classification = [ definition ];
					}
				}
			}, this);
		}

		updateClassifiers() {
			this.classifiers.forEach((cls) => {
				cls.postMatchUpdate();
			});
		}

		highLevelClassify(element) {
			let isAbove,
				definition,
				cls,
				tagMatches,
				tagElement,
				distanceObj,
				highLevelMatches = [];

			for (let i = 0; i < element.classification.length; i++) {
				definition = element.classification[i];
				cls = this.matchingClassifiers[definition];

				tagMatches = cls.tagMatches;

				for (let j = 0; j < tagMatches.length; j++) {
					
					tagElement = tagMatches[j];

					isAbove = Distance.isTextAbove(tagElement,element);

					if (isAbove) {
						distanceObj = Distance.getDistanceVector(element, tagElement);

						highLevelMatches.push({
							definition: definition,
							relativeDistance: distanceObj.centerDistance
						});
					}
				}
			}

			highLevelMatches.sort(function(a, b) {
			    return a.relativeDistance - b.relativeDistance;
			});

			return (highLevelMatches.length > 0) ? (highLevelMatches[0].definition) : null;
		}

		getClassifiersWithElements() {
			return this.classifiers.filter(function(cls) {
				return cls.hasElement();
			});
		}

		findByDefinition(definitionName) {
			return this.classifiers.find(function(cls) {
				return cls.definition === definitionName;
			});
		}
	}

	return ScanClassifier;
});
