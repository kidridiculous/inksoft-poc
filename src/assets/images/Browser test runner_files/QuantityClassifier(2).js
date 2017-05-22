define('classification/QuantityClassifier',['classification/KeywordClassifier','service/Knowledge'],
	function(KeywordClassifier, Knowledge){

	class QuantityClassifier extends KeywordClassifier{

		constructor(quantityValue){

			var definition = 'quantity';
			var keywords = Knowledge.getClassificationDefinition(definition).keyWords;

            keywords.push(quantityValue.toString());

			var negativeWords = Knowledge.getClassificationDefinition(definition).negativeWords;
			var tags = Knowledge.getClassificationDefinition(definition).tags;

			super(definition, keywords, negativeWords, tags);

            this.useDomMatching = false;

            this.quantityValue = quantityValue.toString();
		}

		matchesKeywords(element, scannedTextList){
			return super.matchesKeywords(element,scannedTextList);
		}

        update(scanData){
            return super.update(scanData);
        }

        postMatchUpdate(){

            if(this.keywordMatches.length === 1){

                this.matchingElement = this.keywordMatches[0].element;
                return;

            } else if(this.keywordMatches.length > 1){

                this.handleMultipleMatches();

            }else{
                throw new Error('could not resolve single matchingElement in QuantityClassifier!');
            }


        }

        handleMultipleMatches(){
            var tagTypeCounts = this.getTagTypeCounts();



            if(this.onlyOneInput(tagTypeCounts)/* && this.onlyOneText(tagTypeCounts)*/){
                this.matchingElement = this.getInputElement();
                return;
            
            }else if( (this.onlyOneLabel(tagTypeCounts) ) && (typeof this.getLabelElement() !== null) && this.labelHasRadioInputChild() ){

                if(this.elementContainsMatchingQuantity(this.getLabelElement()) ){

                    this.matchingElement = this.getLabelElement();
                    return;
                }    
            }else{
                throw new Error('need to handle an new case for matching in QuantityClassifier...');
            }
        }        
               
        elementContainsMatchingQuantity(elem){
            var result = false;

            // perhaps this will have to be refined 

            var innerHTMLDefined = (typeof elem.innerText !== 'undefined');
            var innerTextDefined = (typeof elem.innerText !== 'undefined');

            var innerHTMLContainsValue = innerHTMLDefined && (elem.innerHTML.indexOf(this.quantityValue) !== -1);
            var innerTextContainsValue = innerTextDefined && (elem.innerText.indexOf(this.quantityValue) !== -1);

            if( innerHTMLContainsValue || innerTextContainsValue ){
                 result = true;   
            }

            return result;
        }

        labelHasRadioInputChild(){    // this is perhaps too specific?? maybe it belongs in a banana republic classifier??

            var result = false;
            var labelElement = this.getLabelElement();

            if( ( labelElement !== null ) && (typeof labelElement.innerHTML !== 'undefined') ){
                
                var hasInputChild = (labelElement.innerHTML.indexOf('<input') !== -1);

                // there could be a more robust way to determine this??
                var innerHtmlContainsRadioString = (labelElement.innerHTML.indexOf('radio') !== -1);

                if(hasInputChild && innerHtmlContainsRadioString){
                    result = true;
                }
            }

            return result
        }

        onlyOneInput(tagTypeCounts){
            if(typeof tagTypeCounts.isInput !== 'undefined'){
                return (tagTypeCounts.isInput === 1);
            }else{
                return false;
            }
        }

        onlyOneLabel(tagTypeCounts){
            if(typeof tagTypeCounts.LABEL !== 'undefined'){
                return (tagTypeCounts.LABEL === 1);
            }else{
                return false;
            }
        }

        onlyOneText(tagTypeCounts){
            if(typeof tagTypeCounts.isText !== 'undefined'){
                return (tagTypeCounts.isText === 1);
            }else{
                return false;
            }
        }

        getLabelElement(){
            var labelElement = null;
            for (var i = 0; i < this.keywordMatches.length; i++) {
                let ithMatch = this.keywordMatches[i];
                if(ithMatch.element.hasOwnProperty('tagName') && (ithMatch.element.tagName == 'LABEL')){
                    labelElement = ithMatch.element;
                    break;
                }
            }

            return labelElement;
        }


        getInputElement(){
            var inputElement = null;
            for (var i = 0; i < this.keywordMatches.length; i++) {
                let ithMatch = this.keywordMatches[i];
                if(ithMatch.element.hasOwnProperty('isInput') && (ithMatch.element.isInput == true)){
                    inputElement = ithMatch.element;
                    break;
                }
            }

            return inputElement;
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
                
                }else if(ithMatch.element.hasOwnProperty("isInput") && (ithMatch.element.isInput == true)){

                    ithTagName = 'isInput';

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

        classifyElements(elements){
            return super.classifyElements(elements);
        };

        updateClassifiedElements(){
            return super.updateClassifiedElements();
        };

        updateClassifiers(){
            return super.updateClassifiers();
        };
	}
	
	return QuantityClassifier;
});		