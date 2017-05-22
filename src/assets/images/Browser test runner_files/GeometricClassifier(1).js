define('vision/GeometricClassifier', ['util/Distance', 'util/ElementCalculations'], function(UtilDistance, ElementCalculations) {

	const MIN_DROP_DOWN_HEIGHT = 30, MAX_DROP_DOWN_HEIGHT = 70, MIN_DROP_DOWN_WIDTH = 80, MAX_DROP_DOWN_WIDTH = 400;

	function GeometricClassifier(elements) {
		this.elements = elements;
		this.elementCalc = new ElementCalculations();

		/*this.uniqueElements = [];
		this.getUniqueElements();*/
	}
	
	GeometricClassifier.prototype.getImageSource = function(element) {
 		var imageSource = null;			
 	
		if (element.tagName === "IMG" && element.src) {
			imageSource = element.src;
		} else if (element.nodeType === 1) {
			if (element.ownerDocument && element.ownerDocument.defaultView) {
				var defaultView = element.ownerDocument.defaultView;
				var bgImage = defaultView.getComputedStyle(element, null).getPropertyValue('background-image');
				
				if (bgImage && bgImage !== 'none') {
					imageSource = bgImage;	
				}
			}
		}

		console.log(`GeometricClassifier: imageSource: ${imageSource}`);
		
		return imageSource;
	};

	GeometricClassifier.prototype.classify = function() {
		this.findNearestText();
		this.findNearestHtmlText();
		this.findNearestInput();
		this.findButtons();
		this.findNearestButton();
		this.findInputs();
		this.findNonStandardDropDowns();

		this.classifyText();
		this.findTextDistances(350);

		this.formattOutput();

		this.output = {
			formattedElements:this.formattedElements,
			inputs:this.formattedInputs,
			buttons:this.formattedButtons
		};
	};

	GeometricClassifier.prototype.classifyText = function() {	
		// NOTE [ARC] can probably glue this all together with a filter()
		let pageText = [],
			text = '';

		this.elements.forEach(function(el) {
			text = el.nodeType === 3 ? el.nodeValue.trim() : ''; // test for text-type node

			if (text != '' && text.length > 1) {
				el.humanText = text;
				pageText.push(el);
			}
		}, this);

		this.textElements = pageText;
	};

	GeometricClassifier.prototype.findTextDistances = function(maxDistance) {
		let inputEl,
			textEl,
			distance,
			distVector;

		this.inputs.forEach(function(inputEl) {
			inputEl.textNeighbors = [];

			this.textElements.forEach(function(textEl) {

				//TODO Cleanup, everything should have a center at this point???
				if (!inputEl.center) {
					inputEl.center = this.elementCalc.determineCenter(inputEl);
				}
				if (!textEl.center) {
					textEl.center = this.elementCalc.determineCenter(textEl);
				}

				distance = UtilDistance.distanceBetweenPoints(inputEl.center.x, inputEl.center.y, textEl.center.x, textEl.center.y);

				if (distance <= maxDistance) {
					distVector = UtilDistance.getDistanceVector(inputEl, textEl);
					if (distVector.location !== 'NONE') {
						inputEl.textNeighbors.push(distVector);	
					}
				}
			}, this);

			inputEl.textNeighbors.sort(function(a, b) {
				return a.distance - b.distance;
			});

		}, this);

		this.buttons.forEach(function(buttonEl) {
			buttonEl.textNeighbors = [];

			this.textElements.forEach(function(textEl) {

				//TODO Cleanup, everything should have a center at this point???
				if (!buttonEl.center) {
					buttonEl.center = this.elementCalc.determineCenter(buttonEl);
				}
				if (!textEl.center) {
					textEl.center = this.elementCalc.determineCenter(textEl);
				}

				distance = UtilDistance.distanceBetweenPoints(buttonEl.center.x, buttonEl.center.y, textEl.center.x, textEl.center.y);

				if (distance <= maxDistance) {
					distVector = UtilDistance.getDistanceVector(buttonEl, textEl);
					if (distVector.location !== 'NONE') {
						buttonEl.textNeighbors.push(distVector);	
					}
				}
			}, this);

			buttonEl.textNeighbors.sort(function(a, b) {
				return a.distance - b.distance;
			});

		}, this);

	};

	GeometricClassifier.prototype.formattOutput = function() {

		// format all elements
		this.formattedElements = this.elements.map(function(element) {
			return this.formatElement(element);
		}, this);
		
		// format all inputs
		this.formattedInputs = this.inputs.map(function(input) {
			return this.formatElement(input);
		}, this);

		// format all buttons
		this.formattedButtons = this.buttons.map(function(button) {
			return this.formatElement(button);
		}, this);
	};

	GeometricClassifier.prototype.formatElement = function(element) {

		if (!element) {
			return null;
		}
		
		var formattedElement = {
			'segments':element.segments,
			'segmentScrollY':element.segmentScrollY,
			'scrollableAncestorScrollTop':element.scrollableAncestorScrollTop,
			'className':element.className,
			'clientHeight':element.clientHeight,
			'clientLeft':element.clientLeft,
			'clientTop':element.clientTop,
			'clientWidth':element.clientWidth,
			'id':element.id,
			'innerHTML':element.innerHTML,
			'innerText':element.innerText,
			'tagName':element.tagName,
			'htmlFor':element.htmlFor,
			'type':element.type,
			'title': element.title,
			'value':element.value,
			'placeholder': element.placeholder,
			'name':element.name,
			'xmax':element.xmax,
			'xmin':element.xmin,
			'ymax':element.ymax,
			'ymin':element.ymin,
			'nodeValue': element.nodeValue,
			'center': this.elementCalc.determineCenter(element), 
			'buttontext':element.buttontext,
			'imageSource':this.getImageSource(element),
			'nearestButton':this.formatRelatedElement(element.nearestButton),
			'nearestInput':this.formatRelatedElement(element.nearestInput),
			'nearestHtml':this.formatRelatedElement(element.nearestHtml),
			'secondNearestHtml':this.formatRelatedElement(element.secondNearestHtml),
			'nearestdistancesofarmin':element.nearestdistancesofarmin,
			'nearestdistancesofarmax':element.nearestdistancesofarmax,
			'nearestTextMax':this.formatRelatedElement(element.nearestTextMax),
			'secondNearestTextMax':this.formatRelatedElement(element.secondNearestTextMax),
			'nearestTextMin':this.formatRelatedElement(element.nearestTextMin),
			'secondNearestTextMin':this.formatRelatedElement(element.secondNearestTextMin),
			'isText':(element.texter) ? true : false,
			'isButton':element.isButton,
			'isInput':element.isInput,
			'isNonStandardDropDown': element.isNonStandardDropDown,
			'textNeighbors':this.formatTextNeighbors(element.textNeighbors),
			'cssContent': element.cssContent,
			'checked': element.checked,
			'pseudoBefore': this.formatPseudoElement(element, ':before'),
			'pseudoAfter': this.formatPseudoElement(element, ':after'),
			'size': element.size || null,
			'max-length': element.maxLength || null,
		};

		if (formattedElement.tagName === 'IMG' && typeof element.alt === 'string') {
			formattedElement['alt'] = element.alt;
		}

		if (formattedElement.tagName === 'IMG' && element.getAttribute('usemap')) {
			formattedElement['useMap'] = element.getAttribute('usemap');
		}

		if (formattedElement.tagName === 'AREA' && element.parentElement && element.parentElement.tagName === 'MAP') {
			formattedElement['parentMapId'] = element.parentElement.id;
			formattedElement['alt'] = element.alt;
			formattedElement['href'] = element.href;
		}

		if (formattedElement.tagName === 'LABEL' && formattedElement.htmlFor) {
			formattedElement.forElement = this.formatRelatedElement(document.getElementById(formattedElement.htmlFor));
		} 

		if (formattedElement.tagName === 'SELECT' && element.options) {
			formattedElement['options'] = this.extractOptions(element.options);
		}

		if (element.nodeType === 1) {
			formattedElement.ariaLabel = element.getAttribute('aria-label');
			formattedElement.dataTitle = element.getAttribute('data-title');
		}

		return formattedElement;	
	};

	GeometricClassifier.prototype.extractOptions = function(options) {
		return Object.keys(options).map(function(optionKey) {
			let text = ((typeof options[optionKey].label === 'string' && options[optionKey].label.length > 0) ? options[optionKey].label : options[optionKey].textContent);

			let isSelected = options[optionKey].selected ? true : false;

			return {
				humanText: text,
				value: options[optionKey].value,
				selected: isSelected
			};
		});
	};

	GeometricClassifier.prototype.formatTextNeighbors = function(neighbors) {
		let format = [], i=0, n;

		if (!neighbors || neighbors.length === 0) {
			return format;
		}

		while(i < 10 && i < neighbors.length) {
			n = neighbors[i];
			format.push({
				'text': n.text,
				'distance': n.distance,
				'centerDistance': n.centerDistance,
				'location': n.location
			});
			i++;
		}

		return format;
	};

	GeometricClassifier.prototype.formatPseudoElement = function(element, psuedoElementName) {
		let pseudoStyle, styleObj={};

		if (element.nodeType !== 1) {
			return styleObj;
		}

		pseudoStyle = window.getComputedStyle(element, psuedoElementName);

		styleObj['width'] = pseudoStyle.width;
		styleObj['height'] = pseudoStyle.height;
		styleObj['top'] = pseudoStyle.top;
		styleObj['bottom'] = pseudoStyle.bottom;
		styleObj['left'] = pseudoStyle.left;
		styleObj['right'] = pseudoStyle.right;

		return styleObj;
	};

	GeometricClassifier.prototype.formatRelatedElement = function(relatedElement) {

		var formattedRelatedElement = null;

		if (relatedElement !== null) {

			formattedRelatedElement = {
				'className':relatedElement.className,
				'clientHeight':relatedElement.clientHeight,
				'clientLeft':relatedElement.clientLeft,
				'clientTop':relatedElement.clientTop,
				'clientWidth':relatedElement.clientWidth,
				'id':relatedElement.id,
				'innerHTML':relatedElement.innerHTML,
				'innerText':relatedElement.innerText,
				'tagName':relatedElement.tagName,
				'placeholder': relatedElement.placeholder,
				'xmax':relatedElement.xmax,
				'xmin':relatedElement.xmin,
				'ymax':relatedElement.ymax,
				'ymin':relatedElement.ymin,
				'center': this.elementCalc.determineCenter(relatedElement), 
				'buttontext':relatedElement.buttontext,
				'nodeValue': relatedElement.nodeValue,
				'textContent': relatedElement.textContent,
				'checked': relatedElement.checked,
				'type': relatedElement.type,
				'value': relatedElement.value
			};
		}

		return formattedRelatedElement
	};

	GeometricClassifier.prototype.findButtons = function() {
				
		this.buttons = new Array();

		for (var i = 0; i < this.elements.length; i++) {

			var elem = this.elements[i];
			
			var bwidth = elem.xmax - elem.xmin;
			var bheight = elem.ymax - elem.ymin;

			if (bwidth > 25 && bwidth <= 500 && bheight > 15 && bheight < 150 && bwidth/bheight < 25 && bwidth/bheight > 1) {
				
				var buttontext = '';
      
				if ((elem.tagName == 'INPUT') && (elem.type == 'button' || elem.type == 'submit' || elem.type == 'image')) {
					if (elem.value) {
						buttontext = elem.value;
					} else {
						buttontext = '';
					}

					this.buttons.push(elem);
		
					elem.isButton = true;
					elem.buttontext = buttontext;			
				}

				if ((elem.tagName=="A") || (elem.tagName=="BUTTON")) {
					if (elem.innerText) {
						buttontext=elem.innerText;
					} else if (elem.title) {
						buttontext=elem.title;
					} else {
						buttontext="";
					}
					
					this.buttons.push(elem);
					
					elem.isButton=true;
					elem.buttontext=buttontext;

				}	
		
				if (elem.tagName=="IMG") {	
					if (elem.title) {
						buttontext=elem.title;
					} else if (elem.alt) {
						buttontext=elem.alt;
					} else {
						buttontext="";
					}

					this.buttons.push(elem);
					
					elem.isButton=true;
					elem.buttontext=buttontext;
				}	

				if (elem.tagName==='LI' || elem.tagName==='LABEL') {
					if (elem.ownerDocument && elem.ownerDocument.defaultView) {
						var defaultView = elem.ownerDocument.defaultView;
						var bgImage = defaultView.getComputedStyle(elem, null).getPropertyValue('background-image');
						var buttonText = elem.getAttribute('aria-label') || elem.getAttribute('data-title') || elem.innerText || '';
						if (bgImage && bgImage !== 'none') {
							elem.isButton = true;
							elem.buttontext = buttonText;
							elem.imageSource = bgImage;
							this.buttons.push(elem);
						}
						else if (buttonText.length > 0) {
							elem.isButton = true;
							elem.buttontext = buttonText;
							this.buttons.push(elem);
						}
					}
				}
			}	
		}	
	};
	
	GeometricClassifier.prototype.findNearestButton = function() {
		
		for (var i=0;i<this.elements.length;i++) {
			var	elem=this.elements[i];
			
			var nearestsofar=null;
			var nearestdistancesofar=1000;
			
			for (var j=0;j<this.elements.length;j++) {
			
				var elem2=this.elements[j];

				var d = UtilDistance.distanceToMin(elem,elem2);
				//consoledotlog(d)
				if (d<nearestdistancesofar&&elem!=elem2&&(elem2.isButton==true)) {
					nearestsofar=elem2;
					nearestdistancesofar=d;
				}

			}
			
			//elem.nearestButton=this.formatElement(nearestsofar);
		
			elem.nearestButton=nearestsofar;
		}
	};

	GeometricClassifier.prototype.findInputs = function() {
		this.inputs = new Array();
		this.inputSizeMatrix = {};
		
		let elHeight,
			elWidth,
			heightWidths;
		
		this.elements.forEach(function(elem) {

			if (elem.id || elem.className || elem.name) {

				const acceptableInputTypes = ['text', 'tel', 'password', 'number', 'email', 'radio', 'checkbox'];
				
				if (((elem.tagName === 'INPUT') && (acceptableInputTypes.includes(elem.type))) || (elem.tagName === 'SELECT')) {
					
					elem.isInput = true;
					this.inputs.push(elem);

					elHeight = elem.ymax - elem.ymin;
					elWidth = elem.xmax - elem.xmin;
				
					heightInputs = this.inputSizeMatrix[elHeight.toString()];

					if (!heightInputs) {
						heightInputs = new Array();
						this.inputSizeMatrix[elHeight.toString()] = heightInputs;
					}

					heightInputs.push(elWidth);
				}
			}
		}, this);
	};

	GeometricClassifier.prototype.findNonStandardDropDowns = function() {
		
		let elHeight,
			elWidth,
			heightWidths,
			inputMaxWidth,
			inputMinWidth,
			nearWidthMin,
			nearWidthMax,
			potentialMatches = [],
			elAdded = false,
			pMatch;
		
		// interate over each scanned element and push each element to an array that could potentially be a match for an NSDD...
		this.elements.forEach(function(elem) {

			elAdded = false;

			// only run check logic on an element that is NOT an input or select
			if (elem.tagName && elem.tagName.length > 0 && elem.tagName !== 'INPUT' && elem.tagName !== 'SELECT') {
				elHeight = elem.ymax - elem.ymin;
				elWidth = elem.xmax - elem.xmin;

				heightWidths = this.inputSizeMatrix[elHeight.toString()];

				if(elem.hasAttribute('aria-expanded') || elem.hasAttribute('aria-haspopup')) {
					elem.isNonStandardDropDown = true;
					this.inputs.push(elem);
					elAdded = true;
				}
				else if (heightWidths) {

					// NOTE [ARC] not sure we need to use apply here since this execution context is within scope of heightWidths
					inputMaxWidth = Math.max.apply(null, heightWidths);
					// NOTE [ARC] not sure we need to use apply here since this execution context is within scope of heightWidths
					inputMinWidth = Math.min.apply(null, heightWidths);

					nearWidthMin = parseInt(elWidth - (elWidth * .05));
					nearWidthMax = parseInt(elWidth + (elWidth * .05));

					heightWidths.forEach(function(val, index) {
						if ((nearWidthMin <= val && nearWidthMax >= val) ||
							(inputMinWidth <= elWidth && inputMaxWidth >= elWidth) ||
							elWidth > MIN_DROP_DOWN_WIDTH) 
						{
							// check to make sure this element isn't already added to potential matches
							if (!elAdded) {
								potentialMatches.push(elem);
								elAdded = true;
							}
						}
					});
				
				} else if (elHeight >= MIN_DROP_DOWN_HEIGHT && elHeight < MAX_DROP_DOWN_HEIGHT && elWidth >= MIN_DROP_DOWN_WIDTH && elWidth <= MAX_DROP_DOWN_WIDTH) {
					// [MM] maybe add a check for a border?
					potentialMatches.push(elem);
					elAdded = true;
				}
			}
		}, this);

		// ...then iterate over each potentialMatch element stored for further checking and if it passes, set this element as an NSDD
		let textInside = false,
			revealButton = false;
		
		potentialMatches.forEach(function(pMatch) {
			textInside = false;
			revealButton = false;

			// NOTE [ARC] leave as a standard `for` loop since it utilizes `break`
			for (let j = 0; j < this.elements.length; j++) {
				elem = this.elements[j];

				if (elem.ymin >= pMatch.ymin && elem.ymax <= pMatch.ymax && elem.xmin >= pMatch.xmin && elem.xmax <= pMatch.xmax) {
					
					if (elem.nodeType === 3) { // text node
						
						textInside = true;
					
					} else {
						const heightsClose = Math.abs((elem.ymax - elem.ymin) - (pMatch.ymax - pMatch.ymin)) <= 5;
						const widthCloseToHeight = (elem.xmax - elem.xmin) >= ((pMatch.ymax - pMatch.ymin) / 3);
						const inRevealLocation =  elem.xmin >= (pMatch.xmax - (pMatch.ymax - pMatch.ymin));
						const revealIsLessThanHalf = (pMatch.xmax - pMatch.xmin) > ((elem.xmax-elem.xmin) * 2);
					 	
						if (heightsClose && widthCloseToHeight && inRevealLocation && revealIsLessThanHalf) {
					 		revealButton = true;
					 	}
					}
				}

				if (revealButton && textInside) {
					break;
				}
			}

			if (revealButton && textInside) {
				pMatch.isNonStandardDropDown = true;
				this.inputs.push(pMatch);
			}
		}, this);
	};

	GeometricClassifier.prototype.findNearestInput = function() {
		for (var i=0;i<this.elements.length;i++) {

			var elem = this.elements[i];
			
			var nearestsofar = null;
			var nearestdistancesofar = 1000;
			
			for (var j=0;j<this.elements.length;j++) {
				
				var elem2=this.elements[j];

				var d = UtilDistance.distanceToMin(elem,elem2);
				//consoledotlog(d)
				if (d<nearestdistancesofar&&elem!=elem2&&(elem2.tagName=="INPUT"||elem2.tagName=="SELECT")) {
					nearestsofar=elem2;
					nearestdistancesofar=d;
				}
			}

			//elem.nearestInput=this.formatElement(nearestsofar);

			elem.nearestInput=nearestsofar;
		}
	};

	GeometricClassifier.prototype.findNearestHtmlText = function() {

		for (var i=0;i<this.elements.length;i++) {

			var elem=this.elements[i];
			
			
			var nearestsofar=null;
			var secondNearestHtml=null;
			var nearestdistancesofar=1000;
			
			for (var j=0;j<this.elements.length;j++) {
				
				var elem2=this.elements[j];

				var d = UtilDistance.distanceToMinWithoutAngles(elem,elem2)
				
				if (d<nearestdistancesofar&&elem!=elem2&&elem2.textContent) {
					secondNearestHtml=nearestsofar;
					nearestsofar=elem2;
					nearestdistancesofar=d;
				}

			}
			
			// elem.nearestHtml=this.formatElement(nearestsofar);
			// elem.secondNearestHtml=this.formatElement(secondNearestHtml)
			elem.nearestHtml=nearestsofar;
			elem.secondNearestHtml=secondNearestHtml;
		}
	};

	GeometricClassifier.prototype.findNearestText = function() {

		
		for (let i = 0; i < this.elements.length; i++) {
	
			var elem = this.elements[i];
			
			var nearestsofarmax=null;
			var secondnearestsofarmax=null;
			var nearestsofarmin=null;
			var secondnearestsofarmin=null;
			var nearestdistancesofarmax=1000;
			var nearestdistancesofarmin=1000;
			
			for (var j=0;j<this.elements.length;j++) {
				var elem2=this.elements[j];

				var dmin = UtilDistance.distanceToMin(elem,elem2);
				var dmax = UtilDistance.distanceToMax(elem,elem2);
				
				if (elem.id&&elem.id=="shippingAddressFieldGroup4-shippingPostalCode") {
					if (elem2.textContent) {
						//MM consolelog("postaltextdistancecheck="+elem2.textContent+ " dmin="+dmin);
					}
					if (elem2.nodeValue) {
						//MM consolelog("postalnodedistancecheck="+elem2.nodeValue+ " dmin="+dmin);
					}
				}

				if (dmax<nearestdistancesofarmax&&elem!=elem2&&elem2.nodeName=="#text"&&elem2.nodeValue.trim()!=""&&elem2.nodeValue.trim().length>1) {//||elem.textContent.trim()!="")) {
					secondnearestsofarmax=nearestsofarmax;
					nearestsofarmax=elem2;
					nearestdistancesofarmax=dmax;
				}
	
				if (dmax<nearestdistancesofarmax&&elem!=elem2&&elem2.nodeName=="LABEL"&&elem2.textContent.trim()!=""&&elem2.textContent.trim().length>1) {//||elem.textContent.trim()!="")) {
					secondnearestsofarmax=nearestsofarmax;
					nearestsofarmax=elem2;
					nearestdistancesofarmax=dmax;
				}
				

				if (dmin<nearestdistancesofarmin&&elem!=elem2&&elem2.nodeName=="#text"&&elem2.nodeValue.trim()!=""&&elem2.nodeValue.trim().length>1) {//||elem.textContent.trim()!="")) {
					secondnearestsofarmin=nearestsofarmin;
					nearestsofarmin=elem2;
					nearestdistancesofarmin=dmin;
				}
				
				if (dmin<nearestdistancesofarmin&&elem!=elem2&&elem2.nodeName=="LABEL"&&elem2.textContent.trim()!=""&&elem2.textContent.trim().length>1) {//||elem.textContent.trim()!="")) {
					secondnearestsofarmin=nearestsofarmin;
					nearestsofarmin=elem2;
					nearestdistancesofarmin=dmin;
				}

			}

			elem.nearestdistancesofarmin=nearestdistancesofarmin;
			elem.nearestdistancesofarmax=nearestdistancesofarmax;

			// elem.nearestTextMax=this.formatElement(nearestsofarmax);
			// elem.secondNearestTextMax=this.formatElement(secondnearestsofarmax);
			// elem.nearestTextMin=this.formatElement(nearestsofarmin);
			// elem.secondNearestTextMin=this.formatElement(secondnearestsofarmin);

			elem.nearestTextMax=nearestsofarmax;
			elem.secondNearestTextMax=secondnearestsofarmax;
			elem.nearestTextMin=nearestsofarmin;
			elem.secondNearestTextMin=secondnearestsofarmin;


		//consolelog(elem.id +" nearestmax="+elem.nearestTextMax.nodeValue + " nearestmin="+elem.nearestTextMin.nodeValue+"min="+nearestdistancesofarmin+ "max="+nearestdistancesofarmax);
		//consolelog(elem.id +" nearestmax="+elem.nearestTextMax.textContent + " nearestmin="+elem.nearestTextMin.textContent+"min="+nearestdistancesofarmin+ "max="+nearestdistancesofarmax);

		}
	};

	return GeometricClassifier;
});
