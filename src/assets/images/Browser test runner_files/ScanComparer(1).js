define('vision/ScanComparer', [], function() {

	class ScanComparer {

		constructor(lowRes, highRes) {
			this.lowResElements = lowRes;
			this.highResElements = highRes;
		}

		static compareElementsByProperties(knownElement, testElement, compareProps) {
			let prop,
				knownHas,
				testHas,
				aVal,
				bVal,
				matching = true,
				exprMatch = false,
				knownExpression;

			for (let i = 0; i < compareProps.length; i++) {
				exprMatch = false;
				prop = compareProps[i];
				knownHas = knownElement.hasOwnProperty(prop);
				testHas = testElement.hasOwnProperty(prop);

				if (knownHas && testHas) {

					if (typeof knownElement[prop] === 'object' && knownElement[prop] !== null) {
						exprMatch = true;
						knownExpression = new RegExp(knownElement[prop].expression, knownElement[prop].flags);
					} else if (typeof knownElement[prop] === 'string') {
						aVal = knownElement[prop].toLowerCase().trim();
					} else {
						aVal = knownElement[prop];
					}
					
					if (typeof testElement[prop] === 'string') {
						bVal = testElement[prop].toLowerCase().trim();
					} else {
						bVal = testElement[prop];
					}

					if (exprMatch) {
						matching = knownExpression.test(bVal);
					} else {
						matching = aVal === bVal;	
					}
					
				} else if (!knownHas && !testHas) {
					matching = true;
				} else {
					matching = false;
				}

				if (!matching) {
					break;
				}
			}

			return matching;
		}

		compare() {
			let lowResEl,
				highResEl,
				elementFound,
				noMovement;
			
			this.missingCount = 0;
			this.foundCount = 0;
			this.moveCount = 0;

			for (let i = 0; i<this.lowResElements.length; i++) {
				lowResEl = this.lowResElements[i];
				elementFound = false;
				noMovement = false;
				
				for (let j = 0; j < this.highResElements.length; j++) {
					highResEl = this.highResElements[j];

					if (this.elementsMatch(lowResEl, highResEl)) {
						elementFound = true;
						
						if (this.positionsMatch(lowResEl, highResEl)) {
							noMovement = true;
							break;
						}
					}
				}

				if (elementFound) {
					this.foundCount += 1;
					
					if (!noMovement) {
						this.moveCount += 1;
					}

				} else {
					this.missingCount += 1;
				}
			}
		}

		elementsMatch(elemA, elemB) {
			const compareProps = ['id','name','className','tagName','title','imageSource','placeHolder'];

			return ScanComparer.compareElementsByProperties(elemA, elemB, compareProps);
		}

		positionsMatch(elemA, elemB) {
			
			let samePosition = true, buffer = 5,
				xMinDiff = Math.abs(elemA.xmin - elemB.xmin),
				xMaxDiff = Math.abs(elemA.xmax - elemB.xmax),
				yMinDiff = Math.abs(elemA.ymin - elemB.ymin), 
				yMaxDiff = Math.abs(elemA.ymax - elemB.ymax),
				widthDiff = Math.abs((elemA.xmax - elemA.xmin) - (elemB.xmax - elemB.xmin)),
				heightDiff = Math.abs((elemA.ymax - elemA.ymin) - (elemB.ymax - elemB.ymin)),
				diffs = [xMinDiff, xMaxDiff, yMinDiff, yMaxDiff, widthDiff, heightDiff];

			diffs.forEach(function(diff) {
				if (diff > buffer) {
					samePosition = false;
				}
			});

			return samePosition;
		}
	}

	return ScanComparer;
});
