define('classification/OrderedClassification', ['classification/ScanClassifier'], function(ScanClassifier) {

	class OrderedClassification extends ScanClassifier {

		constructor(merchantId) {
			super();
			this._currentPriority = 0;
			this._allClassifiers = this.classifiers.slice();
		}

		update(scannerData) {

			if(this.allResolved(this._currentPriority)){
				this._currentPriority = this._currentPriority + 1;	
			}
			super.update(scannerData);
		}

		isComplete() {
			return this._currentPriority > this.maxPriority;
		}

		getCurrentPriority() {
			return this._currentPriority;
		}

		resetClassifiers() {
			super.resetClassifiers();
			//Remove everything
			this.classifiers.splice(0);
			this.classifiers = this.getClassifiersByPriority(this._currentPriority, true);
		}

		initializeClassifiers(list) {
			this._allClassifiers = list;
			this.maxPriority = this.getMaxPriority(list);
			this.classifiers = [];
		}

		getMaxPriority(classifiers) {
			let maxPriority = 0;
			classifiers.forEach(function(clsfyr){
				let priorityInt = this.getMajorPriority(clsfyr.priority);
				if(priorityInt>maxPriority) {
					maxPriority = priorityInt;
				}
			}, this);

			return maxPriority;
		}

		getMajorPriority(priorityString) {
			if(typeof priorityString === 'undefined') {
				return -1;
			}

			let dotIndex = priorityString.indexOf('.'), priorityInt=0;
			if(dotIndex > 0) {
				priorityInt = parseInt(priorityString.substr(0, dotIndex));
			} else {
				priorityInt = parseInt(priorityString);
			}
			return priorityInt;
		}

		getClassifiersByPriority(priority, includeRunAlways) {
			let i=0, classifier, priorityString, dotIndex, priorityInt, matches=[];

			for(i=0;i<this._allClassifiers.length;i++) {
				classifier = this._allClassifiers[i];

				if(includeRunAlways && classifier.alwaysClassify()) {
					matches.push(classifier);
					continue;
				}

				priorityString = classifier.getPriority();
				priorityInt = this.getMajorPriority(priorityString);
				
				if(priorityInt === priority) {
					matches.push(classifier);
				}
			}

			return matches.sort(function(a, b){ return a.getPriority().localeCompare(b.getPriority());});
		}

		allResolved(priority) {
			let classifiers = this.getClassifiersByPriority(priority, false), resolved=true;

			classifiers.forEach(function(c) {
				resolved = resolved && (c.timesResolved > 0);
			});
			
			return resolved;
		}

		getClassifiersWithElements() {
			let classifiers = super.getClassifiersWithElements(), expectedClassifiers = [], exceptionClassifiers = [];
			classifiers.forEach(function(cls) {
				if(cls.alwaysClassify()) {
					exceptionClassifiers.push(cls);
				} else {
					expectedClassifiers.push(cls);
				}
			});

			if(expectedClassifiers.length === 0) {
				return exceptionClassifiers;
			} else {
				return expectedClassifiers;
			}
		}

		getAllClassifiers() {
			return this._allClassifiers;
		}

	}

	return OrderedClassification;
})