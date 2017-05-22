define('classification/SimpleClassifier',['service/Knowledge','service/DefinitionTable','util/Distance'], function(Knowledge, DefinitionTable, Distance) {

	class SimpleClassifier {

		constructor(settings) {
			this.settings = settings || SimpleClassifier.defaultSettings;
			this.classifiers = [];
            this.classifiedElements = [];

            var DefinitionTableInstance = new DefinitionTable();

            this.definitionTable = DefinitionTableInstance.definitions;

            this.uniquelyClassifiedElements = [];

            this.useTokenization = false;
		}

		update(vision) {
		
			this.inputDefinitions = {};
			this.buttonDefinitions = {};
			
			this.classifiedElements = [];
			if(vision.formattedElements.length !== 0 ){
				this.elementDefinitions = this.findElementDefinitions(vision.formattedElements);
			}
		}

		hasInputDefinition(definition) {
			return this.inputDefinitions.hasOwnProperty(definition);
		}

		hasButtonDefinition(definition) {
			return this.buttonDefinitions.hasOwnProperty(definition);
		}

		hasDefinition(definition) {
			return this.elementDefinitions.hasOwnProperty(definition);
		}

		getInputDefinition(definition) {
			return this.inputDefinitions[definition];
		}

		getButtonDefinition(definition) {
			return this.buttonDefinitions[definition];
		}

		getElementsByDefinition(definition) {
			return this.elementDefinitions[definition];
		}

		getClassifiedElement(classification) {
			// this short-circuits on the first classifier match found
			const foundElement = this.classifiedElements.find(function(element) {
				return element.classification === classification;
			});

			// NOTE [ARC] if you have more time to track this down, it might be ok to just return the above if undefined is ok instead of null
			return foundElement === undefined ? null : foundElement;
		}

		getClassifiedElements() {
			return this.classifiedElements;
		}
		
		findElementDefinitions(elements) {
			
			let negativeMatch, goodMatches, elementText, jthKeyword, definitions={}, jthDefs, kthJthDef, uniquelyClassifiedIthElement,textElements, definitionData;

			var ithElement;

			var elementsWithTokens = this.getTokensFromElementText(elements);

			textElements = elementsWithTokens.filter(function(el) {return el.isText;});

			elementsWithTokens = elementsWithTokens.filter(function(el){ return (el.isButton || el.buttontext || el.isInput);});

			for (var i = 0; i < elementsWithTokens.length; i++) {
				
				ithElement = elementsWithTokens[i];
				
				ithElement.classification = [];
			
				let elementTokenArray = ithElement.tokens;

				for(var j=0;j<elementTokenArray.length;j++){

					jthKeyword = elementTokenArray[j];

					jthDefs = Knowledge.getKeywordDefinitions(jthKeyword);

					goodMatches = [];

					if(jthDefs) {

						for (var k = 0; k < jthDefs.length; k++) {
							negativeMatch = false;
							kthJthDef = jthDefs[k];

							definitionData = Knowledge.getClassificationDefinition(kthJthDef);
							if(definitionData.negativeWords && definitionData.negativeWords.length > 0) {
								negativeMatch = this.doKeywordsMatch(elementTokenArray, definitionData.negativeWords, SimpleClassifier.Matching.EXACT);

								if(negativeMatch) {
									//Move to next definition
									continue;
								}
							}

							goodMatches.push(kthJthDef);

							if(definitions[kthJthDef]){

								definitions[kthJthDef].push(ithElement);

							}else{

								definitions[kthJthDef] = [];

								definitions[kthJthDef].push(ithElement);
							}
						}

						ithElement.classification = this.uniq(ithElement.classification.concat(goodMatches));

						if(ithElement.classification.length > 1) {
							uniquelyClassifiedIthElement = this.determineUniqueClassification(ithElement, textElements);
							this.classifiedElements.push(uniquelyClassifiedIthElement);
						}	
						else if(ithElement.classification.length === 1) {
							this.classifiedElements.push(ithElement);
						}

						break;
					}
				}
			}

			return definitions;
		}

		getTokensFromElementText(elements){

			let elementsWithTokens = [], ithElement, elementText;

			for(var i=0;i<elements.length;i++) {

				ithElement = elements[i];

				elementText = this.extractElementText(ithElement);

				if(elementText.length > 0){

					ithElement['tokens'] = elementText;

					elementsWithTokens.push(ithElement);					
				}
			}	

			return elementsWithTokens;
		}

		determineUniqueClassification(testElement, potentialContextElements){

			testElement['contextMatches'] = [];

			for (var j = 0; j < potentialContextElements.length; j++) {

				let jthContextElement = potentialContextElements[j];

				if(jthContextElement.isText){

					var contextMatchObject = this.matchClassificationToContextTag(testElement, jthContextElement );

					if(contextMatchObject != null){

						testElement.contextMatches.push({
							classification : contextMatchObject.classification,
							matchedContextTag : contextMatchObject.contextTag,
							contextElement : jthContextElement
						});						
					}					
				}
			}

			if(testElement.contextMatches.length == 0 ){

				console.log('failed to match context to element...');

			} else if(testElement.contextMatches.length == 1){

				this.uniquelyClassifiedElements.push(testElement);

			} else{
				testElement = this.filterClassificationsByGeometry(testElement);
			}

			return testElement;
		}

		filterClassificationsByGeometry(testElement){

			var contextMatches = testElement.contextMatches;

			for (var i = 0; i < contextMatches.length; i++) {
				
				let ithContextMatch = contextMatches[i];

				let ithMatchedContextElement = ithContextMatch.contextElement;

				let isAbove = Distance.isTextAbove(ithMatchedContextElement,testElement);

				if(isAbove){

					let distanceVectorObject = Distance.getDistanceVector(testElement, ithMatchedContextElement);

					contextMatches[i]['relativeDistance'] = distanceVectorObject.centerDistance;					
				}
			}

			contextMatches.sort(function(a, b) {
			    return a.relativeDistance - b.relativeDistance;
			});

			testElement['correctClassification'] = testElement.contextMatches[0];

			return testElement;
		}

		matchClassificationToContextTag(testElement, contextElement){

			/*
				Here we want to compare the contextual tags of the potential classifications on the
				testElement with the tokens that are retrieved from the text on the context element. 
				
				The contextElement is above the testElement on the page. 

				The idea is that if a token from the context element matches
				the contextual tag from the testElemtent, then the classification that that context tag belongs to 
				is the correct classification for the test element. If more than one element has a matching token,
				the nearest one to the testElemnt will be chosen. 	
			*/

			var result = null;

			for (var k = 0; k < testElement.classification.length; k++) {
				
				let kthClassification = testElement.classification[k];

				// TODO : might need to Handle more than one tag in the future...
				let contextMatch, tags = Knowledge.getClassificationDefinition(kthClassification).tags; //this.definitionTable[kthClassification].tags[0]; 

				contextMatch = this.doKeywordsMatch(contextElement.tokens, tags, SimpleClassifier.Matching.CONTAINS);


				if(contextMatch) { 

						/*
							lets assume for now that only one token from the context
							element is gonna match , also assume that there is only one
							relevant context tag on the testElement
						*/
					result = {
						classification:kthClassification,
						contextTag:tags.join(',')
					};
				}
			}
			return result;
		}

		uniq(a) {
		    var seen = {};
		    return a.filter(function(item) {
		        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
		    });
		}

		matchByKeywords(elements, keywords) {
			let sanitizedKeywords = [], matches = [];

			keywords.forEach(function(keyword){
				sanitizedKeywords = this.sanitize(keyword, sanitizedKeywords);
			}, this);

			let i=0, el;
			while(i<elements.length)
			{	
				el = elements[i];
				if(this.keywordMatcher(el, sanitizedKeywords)){
					matches.push(el);
				}
				i++;
			}

			return matches;
		}

		keywordMatcher (element, keywords) {
			var match = false;

			var elementText = this.extractElementText(element);

			return this.doKeywordsMatch(elementText, keywords, /*this.settings.strictness*/1);
		}

		doKeywordsMatch(textList, keywords, strictness) {
			
			var match;

			for (var i = 0; i < textList.length; i++) {
				let word = textList[i];

				for (var j = 0; j < keywords.length; j++) {
					let keyword = keywords[j];

					match = this.matchText(word, keyword, strictness);
					if (match){
						break;
					}
				}
			}

			return match;
		}

		extractElementText(element) {
			let textArray = [];

			if(element.placeholder) {
				textArray = this.sanitize(element.placeholder, textArray);
			}

			if(element.buttontext) {
				textArray = this.sanitize(element.buttontext, textArray);
			}

			if(element.id) {
				textArray = this.sanitize(element.id, textArray);
			}

			if(element.name) {
				textArray = this.sanitize(element.name, textArray);	
			}

			if(element.title) {
				textArray = this.sanitize(element.title, textArray);	
			}

			if(element.cssContent && element.cssContent.length > 0) {
				element.cssContent.forEach(function(text) {
					if(typeof text == 'string') {
						textArray = this.sanitize(text, textArray);
					}
				}, this);
			}

			if(element.className){
				textArray = this.sanitize(element.className, textArray);
			}

			if(element.innerText){
				textArray = this.sanitize(element.innerText, textArray);
			}
				
			if(element.htmlFor){
				textArray = this.sanitize(element.htmlFor, textArray);
			}

			if(element.value){
				textArray = this.sanitize(element.value, textArray);
			}
			
			if(element.isInput && element.textNeighbors && element.textNeighbors.length > 0) {
				textArray = this.sanitize(element.textNeighbors[0].text, textArray);
			}

			if(element.nodeValue) {
				textArray = this.sanitize(element.nodeValue, textArray);
			}

			textArray = this.uniq(textArray);

			return textArray;
		}

		extractRelatedText(element, textAcc) {

			if(element.nodeValue) {
				textAcc = this.sanitize(element.nodeValue, textAcc);
			}

			if(element.textContent) {
				textAcc = this.sanitize(element.textContent, textAcc);	
			}

			return textAcc;
		}

		sanitize(text, acc) {
			
			if(typeof text !== "string"){
                return acc;
            }

			var sani = text.trim().toLowerCase();

			if(sani && sani.length > 0)
			{
				acc.push(sani);
			}

			if(this.useTokenization){

				var filteredString = sani.replace(/[^a-z0-9+]+/gi, ' ');

				var tokenSet = filteredString.split(' ');

				if(tokenSet && tokenSet.length > 0){
					acc = acc.concat(tokenSet);
				}
			}	

			acc = this.uniq(acc);

			return acc;
		}

		matchText(text, keyword, strictness) {

			switch (strictness) {
				case SimpleClassifier.Matching.EXACT:
					return this.exactMatch(text, keyword);
				break;
				case SimpleClassifier.Matching.CONTAINS:
					return this.containsMatch(text, keyword)
				break;
				case SimpleClassifier.Matching.FUZZY:
					return this.fuzzyMatch()
				break;
			}
			return false;
		}

		exactMatch (text, keyword) {
			return text === keyword;
		}

		containsMatch (text, keyword) {
			return text.indexOf(keyword) != -1;
		}

		fuzzyMatch (text, keyword) {
			return false;
		}
	}

	SimpleClassifier.Matching = { 'EXACT': 1, 'CONTAINS': 2, 'FUZZY': 3};

	SimpleClassifier.defaultSettings = { strictness: SimpleClassifier.Matching.EXACT };

	SimpleClassifier.Definitions = {

	}

	return SimpleClassifier;
});

/* 
function RBinputNearKeywords(elem,keywords,array,minormax,relaxed){
	//so I want the last ones to be less important, and the first ones to be most important
	//so the first one goes in 0, the second goes in 1, etc. and we use push. But city is weird
	//because it's so short it gets it wrong. So the problem is city is the second nearest gets the same
	//priority as the first nearest and that's not right. Second nearest if found first should be ignored.
	//do I really need first nearest maybe it should be broken up as a second function so first goes first

	if (relaxed === undefined || relaxed === null) {
		relaxed=true;
	}
	
	if(minormax=="min"||minormax===undefined||minormax===null){
		min=true;
	}
	else{
		min=false;
	}
	
	if(RBdiagnostics==true){
		consolelog("input near keywords");
		consolelog("does "+elem+ " " + elem.id +" contain keywords "+keywords);
		//consolelog("input near keywords");
	}
	
	keywordfound=false;
	for(var i=0;i<keywords.length;i++){
		
	//consolelog(i+" " +keywords[i]);
	//	consolelog("tagname="+elem.tagName);
	//	consolelog("type="+elem.type);
	//	consolelog("value="+elem.value);
	//	consolelog("nt="+elem.nearestTextMin);
	//	consolelog("placeholder"+elem.placeholder);
		
		//if it's in a placeholder
		if(elem.placeholder){
			//consolelog(elem.placeholder)
			//consolelog(elem.placeholder.toLowerCase().trim());
			if(relaxed==true){
				if(elem.placeholder.toLowerCase().trim().substr(0,40).indexOf(keywords[i].trim().toLowerCase())>-1){
					consolelog("a placeholder keyword was found "+elem.placeholder);
					if(array){
						array.push(elem);//so it is the first one, everything else is pushed in second or third so that's fine.
						//do I ever want it to be the first one is the last one?
					}
				
					keywordfound=true;
					
					break;
				}
			}
			if(relaxed==false) {
				
				if(elem.placeholder.toLowerCase().trim()==keywords[i].trim().toLowerCase()){
					consolelog("a placeholder keyword was found "+elem.placeholder);
					if(array){
						array.push(elem);//so it is the first one, everything else is pushed in second or third so that's fine.
						//do I ever want it to be the first one is the last one?
					}
				
					keywordfound=true;
					break;
				}
			}
		}
						
		//so it may not be in the nearesttext because it maybe hidden by the item so look inside the textContent of the item				
	//	if(elem.textContent){
	//	consolelog("it has textContent");
	//	if(elem.textContent.trim()!=""){
	//	consolelog(keywords[i]+"=="+elem.textContent.trim().toLowerCase().substr(0,40));
	//	if(elem.textContent.trim().toLowerCase()==keywords[i].trim().toLowerCase()){
	//			consolelog("found textContent with keyword"+keywords[i].trim().toLowerCase());
	//		keywordfound=true;
	//		if(array){
	//							array.push(elem);//so it is the first one, everything else is pushed in second or third so that's fine.
	//							//do I ever want it to be the first one is the last one?
	//							}
	//		break;
	//	}
	//	}
	//	}
	//if(elem.nearestTextMin){
	//	//consolelog(elem.nearestTextMin+" " +elem.nearestTextMin.nodeValue+ " " +elem.nearestTextMin.textContent);
	//	}
		//consolelog("after classname");
		if(min==false){
		//consolelog("min is false");
		if(elem.nearestTextMax){

			if(RBdiagnostics==true){
				if(elem.nearestTextMax.nodeValue){
					consolelog("maxnodevalue"+keywords[i].trim().toLowerCase()+"=="+elem.nearestTextMax.nodeValue.trim().toLowerCase().substr(0,40));
				}
				if(elem.nearestTextMax.textContent){
					consolelog("maxtextcontent"+keywords[i].trim().toLowerCase()+"=="+elem.nearestTextMax.textContent.trim().toLowerCase().substr(0,40));
				}
			}
					
			if(relaxed==true){
				if(elem.nearestTextMax.nodeValue){
					if(elem.nearestTextMax.nodeValue.trim().toLowerCase().substr(0,40).indexOf(keywords[i].trim().toLowerCase())>-1){
								consolelog("found nearest one");
						if(array){
							array.push(elem);
						}
						keywordfound=true;		
						break;
					}
				}
				
				if(elem.nearestTextMax.textContent){
					if(elem.nearestTextMax.textContent.trim().toLowerCase().substr(0,40).indexOf(keywords[i].trim().toLowerCase())>-1){
						consolelog("found nearest one");

						if(array){
							array.push(elem);
						}
						
						keywordfound=true;		
						break;
					}
				}
			}
				
				
			if(relaxed==false){
				if(elem.nearestTextMax.nodeValue){

					if(elem.nearestTextMax.nodeValue.trim().toLowerCase()==keywords[i].trim().toLowerCase()){
								consolelog("found nearest one");
						if(array){
							array.push(elem);
						}
						keywordfound=true;		
						break;
					}
				}
				
				if(elem.nearestTextMax.textContent){

				if(elem.nearestTextMax.textContent.trim().toLowerCase()==keywords[i].trim().toLowerCase()){
								consolelog("found nearest one");

				
				
				if(array){
				array.push(elem);
				}
				keywordfound=true;		
				break;
				}
				}
				}
				
			
		}
		}
		

			
			if(min==true){
		if(elem.nearestTextMin){
		


			if(RBdiagnostics==true){
					if(elem.nearestTextMin.nodeValue){

					consolelog("minnodevalue"+keywords[i].trim().toLowerCase()+"=="+elem.nearestTextMin.nodeValue.trim().toLowerCase().substr(0,40));
					}
							if(elem.nearestTextMin.textContent){

					consolelog("mintextcontent"+keywords[i].trim().toLowerCase()+"=="+elem.nearestTextMin.textContent.trim().toLowerCase().substr(0,40));
					}

					}
					
				if(relaxed==true){
					if(elem.nearestTextMin.nodeValue){

				if(elem.nearestTextMin.nodeValue.trim().toLowerCase().substr(0,40).indexOf(keywords[i].trim().toLowerCase())>-1){
								consolelog("found nearest one");

				
				
				if(array){
				array.push(elem);
				}
				keywordfound=true;		
				break;
				}
				}
				if(elem.nearestTextMin.textContent){

				if(elem.nearestTextMin.textContent.trim().toLowerCase().substr(0,40).indexOf(keywords[i].trim().toLowerCase())>-1){
								consolelog("found nearest one");

				
				
				if(array){
				array.push(elem);
				}
				keywordfound=true;		
				break;
				}
				}
				}
				
				
				if(relaxed==false){
					if(elem.nearestTextMin.nodeValue){

				if(elem.nearestTextMin.nodeValue.trim().toLowerCase()==keywords[i].trim().toLowerCase()){
								consolelog("found nearest one");

				
				
				if(array){
				array.push(elem);
				}
				keywordfound=true;		
				break;
				}
				}
				if(elem.nearestTextMin.textContent){

				if(elem.nearestTextMin.textContent.trim().toLowerCase()==keywords[i].trim().toLowerCase()){
								consolelog("found nearest one");

				
				
				if(array){
				array.push(elem);
				}
				keywordfound=true;		
				break;
				}
				}
				}
				
			
		}
		
		}
		
		
		
		
		//so this is a case made for when radio buttons have a label, the label cannot be seen by the scanner, but the text is in the label. The textcontent is not in the radio
		//button but next to it as a label. So maybe this will work.
		if(elem.tagName=="INPUT"&&elem.type=="radio"){
			consolelog("its a radio input without any text content otherwise it would have been found by now"+keywords[i]);
			if(elem.parentNode){
				//consolelog("it has a parent");
				//consolelog("length="+elem.parentNode.childNodes.length);
				if(elem.parentNode.childNodes.length<10){
					//consolelog("the parent childnodes is less than 4");
					for(var n=0;n<elem.parentNode.childNodes.length;n++){
						//consolelog("n="+n);
						if(elem.parentNode.childNodes[n].textContent){
							//consolelog("textContent="+elem.parentNode.childNodes[n].textContent);
							//consolelog("does radio"+elem.parentNode.childNodes[n].textContent.trim().toLowerCase() + "==" + keywords[i]);
							//consolelog("indexof="+elem.parentNode.childNodes[n].textContent.trim().toLowerCase().indexOf(keywords[i]));
							if(elem.parentNode.childNodes[n].textContent.trim().toLowerCase().indexOf(keywords[i].trim().toLowerCase())>-1){
								//consolelog("radio found one"+ elem.ymin);
								keywordfound=true;
								if(array){
									array.push(elem);
								}
								return keywordfound;

							}//if indexOf finds the keywords
						}//textContent
					}//for n
				}//if less than 4 childnodes
			}//if parent
		}//if 
	//consolelog("return "+keywordfound);
	}


					
	return keywordfound;
}
*/