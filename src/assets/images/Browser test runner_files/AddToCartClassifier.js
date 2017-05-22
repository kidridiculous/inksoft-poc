define('classification/AddToCartClassifier',['classification/KeywordClassifier','service/Knowledge'],
	function(KeywordClassifier, Knowledge){

	class AddToCartClassifier extends KeywordClassifier{

		constructor(definitionData){

			var definition = 'addToCart';
			var keywords = Knowledge.getClassificationDefinition(definition).keyWords;
			var negativeWords = [];
			var tags = [];

			super(definition, keywords, negativeWords, tags);
		}

    matchesKeywords(element, scannedTextList) {
			if(element.tagName === 'SELECT'){
				return false;
			}
      return super.matchesKeywords(element, scannedTextList);
		}

		
			postMatchUpdate(){

        	if(this.keywordMatches.length === 1){

				this.matchingElement = this.keywordMatches[0].element;
				return;

			} else if(this.keywordMatches.length > 1){

                this.handleMultipleMatches();

			}
        }

        handleMultipleMatches(){
            var tagTypeCounts = this.getTagTypeCounts();

            if(this.onlyOneButton(tagTypeCounts)/* && this.onlyOneText(tagTypeCounts)*/){
                this.matchingElement = this.getButtonElement();
                return;
            }
        }        

        onlyOneText(tagTypeCounts){
        	if(typeof tagTypeCounts.isText !== 'undefined'){
        		return (tagTypeCounts.isText === 1);
        	}else{
        		return false;
        	}
        }

        onlyOneButton(tagTypeCounts){
        	if(typeof tagTypeCounts.isButton !== 'undefined'){
        		return (tagTypeCounts.isButton === 1);
        	}else{
        		return false;
        	}
        }

        getButtonElement(){
        	var buttonElement = null;
        	for (var i = 0; i < this.keywordMatches.length; i++) {
        		let ithMatch = this.keywordMatches[i];
        		if(ithMatch.element.hasOwnProperty('isButton') && (ithMatch.element.isButton == true)){
        			buttonElement = ithMatch.element;
        			break;
        		}
        	}

        	return buttonElement;
        }

        getTagTypeCounts(){

        	var results = {};

        	var ithTagName;

        	for (var i = 0; i < this.keywordMatches.length; i++) {

        		let ithMatch = this.keywordMatches[i];

        		if(ithMatch.element.hasOwnProperty("isText") && (ithMatch.element.isText == true)){
        		
        			ithTagName = "isText";

                }else if(ithMatch.element.hasOwnProperty("isButton") && (ithMatch.element.isButton == true)){

                    ithTagName = 'isButton';
        		
        		}else{
                    /*
                        might need to use tagType instead??    
                    */
	        		ithTagName = ithMatch.element.tagName;
	        	}	

        		if(!results.hasOwnProperty(ithTagName)){

        			results[ithTagName] = 1;

        		}else{
        			results[ithTagName] += 1;
        		}
        	}

        	return results
        }
	}
	
	return AddToCartClassifier;
});		