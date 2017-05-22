define('classification/quantity/QuantityClassifier',['classification/KeywordClassifier','service/Knowledge', 'util/TextUtil', 'util/Distance'],
    function(KeywordClassifier, Knowledge, TextUtil, DistanceUtil){

    /* The distance to detect for Qty input near the product name */
    const QTY_TO_PRODUCT_NAME_DISTANCE = 1000;

    /* The Max Width of an unlabeled qty input */
    const QTY_INPUT_NO_LABEL_MAX_WIDTH = 120;

    /* Dirty Matching expression against dom for qty input matching */
    const QTY_DOM_MATCH_EXPRESSION = /qty|quantity/i;

    const isQtyInput = function(elem) {
        return elem.tagName === 'INPUT' && (elem.type === 'number' || elem.type === 'text' || elem.type=== 'tel');
    };

      const isQtySelect = function(elem) {
        return elem.tagName === 'SELECT' && (elem.type === 'select-one' && elem.id === 'sbc-quantity-picker');
      };

    const matchesProductName = function(elem, productName) {
        if(elem.nodeValue) {
            const cleanProductName = TextUtil.stripNonAlphaNumeric(productName);
            const productNameParts = cleanProductName.split(' ').filter(function(part){ return part !== '';});
            const cleanNodeValue = TextUtil.stripNonAlphaNumeric(elem.nodeValue);

            return (cleanNodeValue === TextUtil.stripNonAlphaNumeric(productName))
                    || (elem.nodeValue === productName)
                    || (TextUtil.exactOrderScore([cleanNodeValue], productNameParts) >= .75) 
                    || (TextUtil.wordMatchScore([cleanNodeValue], productNameParts) >= .75);
        }
        return false;
    };


    const qtyInElementDom = function(inputEl) {
        const inputName = inputEl.name || '';
        const inputId = inputEl.id || '';
        const inputClass = inputEl.className || '';

        return QTY_DOM_MATCH_EXPRESSION.test(inputName)
            || QTY_DOM_MATCH_EXPRESSION.test(inputId)
            || QTY_DOM_MATCH_EXPRESSION.test(inputClass);

    }

    class QuantityClassifier extends KeywordClassifier {

        constructor(definition, quantityValue, product){

            var qtyDefinition = Knowledge.getClassificationDefinition('quantity');

            var keywords = qtyDefinition.keyWords;

            var negativeWords = qtyDefinition.negativeWords;

            var tags = qtyDefinition.tags;

            super(definition, keywords, negativeWords, tags);

            this.useDomMatching = false;

            this.quantityValue = quantityValue.toString();

            this.product = product;

            this.allSelects = [];
            this.allInputs = [];
            this.allProductNames = [];
        }   

        reset(){
            super.reset();
            this.allInputs = [];
            this.allSelects = [];
            this.allProductNames = [];
        }

        getProductName() {
            return this.product.name;
        }
               

        matchesKeywords(element, scannedTextList) {
            let matchFound;
            //Has to have a tag
            if(typeof element.tagName !== 'string') {
                matchFound = false;
            } else {
                matchFound = super.matchesKeywords(element, scannedTextList);   
            }

             
            //Look for a scenario where there is an input with no near text
            if(!matchFound) {
              if(isQtyInput(element)) {
                this.allInputs.push(element);
              }
              else if(isQtySelect(element)) {
                this.allSelects.push(element);
              }
              else if(matchesProductName(element, this.getProductName())) {
                this.allProductNames.push(element);
              }
            }

            return matchFound;

        }

        postMatchUpdate() {
            if(this.allInputs.length > 0 && this.allProductNames.length > 0 && !this.hasMatches()) {
                this.findNearQty(this.allInputs, this.allProductNames);
            } else if (this.allInputs.length > 0 && !this.hasMatches()) {
                const qtyMatch = this.allInputs.find(function(el) {
                    return qtyInElementDom(el);
                });
                if(qtyMatch) {
                    this.keywordMatches.push({element:qtyMatch, matchLocation:'DOM', matchType:'CONTAINS'});
                }
            }
            
            if(this.allSelects.length > 0 && !this.hasMatches()) {
                this.findNearSelectQty(this.allSelects);
            }

            super.postMatchUpdate();
        }

        handleMultipleMatches(results){

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
                switch(match.element.tagName) {
                    case 'SELECT':
                        if(this.containsQtyOption(match.element)) {
                            score += 4;    
                        }
                        break;
                    case 'INPUT':
                        if(this.textInputHasMatchingTextNear(match.element)){
                            score += 4;    
                        } else if(match.productNameVector){
                            score += (QTY_TO_PRODUCT_NAME_DISTANCE - match.productNameVector.distance) / QTY_TO_PRODUCT_NAME_DISTANCE;
                        }
                        break;
                    default:
                        score += 1;
                        break;
                }
            }
            return score;
        }

        containsQtyOption(element) {

            let matcher = new RegExp('^[\\s\\W0]*' + this.quantityValue.toString() + '[\\s\\W]*$', 'i'), i, optionText, match=false;

            if(!element.options) { return match; }

            for(i=0;i<element.options.length;i++) {
                optionText = element.options[i].humanText;

                match = matcher.test(optionText);

                if(match) {
                    break;
                }
            }

            return match;
        }

        textInputHasMatchingTextNear(element) {
            let nearText =[], i = Math.min(element.textNeighbors.length, 3);
            
            if(element.textNeighbors.length > 0) {
                this.sanitize(element.textNeighbors[0].text, nearText);
                return TextUtil.exactMatch(nearText, this.keywords);
            }             

            return false;           
        }


        //In some cases there may be product pages that have a qty input with no label or text near it indicating qty.
        //This is to look for that scenario
        findNearQty(inputElems, productNameElems) {
            productNameElems.forEach(function(nameEl) {
                inputElems.forEach(function(inputEl) {
                    const vector = DistanceUtil.getDistanceVector(nameEl, inputEl);

                    if((vector.location === 'BELOW' || vector.location === 'RIGHT') && vector.distance < QTY_TO_PRODUCT_NAME_DISTANCE) {
                        this.keywordMatches.push({element:inputEl, matchLocation:'HUMAN', matchType:'EXACT', productNameVector:vector});
                    } else if (vector.location === 'NONE'
                        && vector.centerDistance < QTY_TO_PRODUCT_NAME_DISTANCE 
                        && nameEl.ymin <= inputEl.ymin) {

                        if(qtyInElementDom(inputEl)) {
                            this.keywordMatches.push({element:inputEl, matchLocation:'DOM', matchType:'CONTAINS', productNameVector:vector});
                        }
                    } 
    
                }, this);
            }, this);
        }

      //In some cases there may be product pages that have a qty select with no label or text near it indicating qty.
      //This is to look for that scenario
      findNearSelectQty(selectElems) {
          selectElems.forEach(function(selectEl) {
            this.keywordMatches.push({element:selectEl, matchLocation:'HUMAN', matchType:'EXACT'});
          }, this);
      }
    }
    
    return QuantityClassifier;
});     