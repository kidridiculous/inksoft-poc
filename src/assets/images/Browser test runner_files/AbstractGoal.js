define('goal/AbstractGoal', [
	'use-model/UseModelResolver',
	'use-model/StateResolver',
	'classification/ScanClassifier',
	'system/Browser'
], function(UseModelResolver, StateResolver, ScanClassifier, Browser) {
	
	class AbstractGoal {

		constructor() {
				
			this.complete = false;

			this.resolutionCount = 0;

			this.resolvers = {};

			this.classifier = new ScanClassifier();

			this.scanOptions = {
				xResolution: 8,
				yResolution: 8
			};

			this.noUseModelsCount = 0;

		}

		getScanOptions() {
			return this.scanOptions;
		}

		getClassifier() {
			return this.classifier;
		}

		isComplete() {
			return this.complete;
		}

		createResolver(def, data) {
			var config = { definition: def};
			if(typeof data === "number") {
				config.data = data.toString();
			}
			else if(typeof data === "string") {
				config.data = data;	
			}
			return new UseModelResolver(config);
		}

		findUseModels(robotVision) {
			let cls, i, j, def, resolver, resolvedUseModels = [], useModel, classifiers;
			
			this.resolutionCount++;

			classifiers = robotVision.getClassifiersWithElements();

			this.sortClassifiers(classifiers);
		
			for(i=0;i<classifiers.length;i++) {
				cls = classifiers[i];

				if(this.resolvers[cls.definition] ) {
					resolver = this.resolvers[cls.definition];
					if(!resolver.isComplete()) {
						useModel = resolver.getUseModel(cls);
						if(useModel !== null){
							resolvedUseModels.push(useModel);	
						}
						
					}
				}
			}

			//If browser is still working don't increment the no use model count because there still may be content loading
		    if (resolvedUseModels.length === 0 && !Browser.isActive()) {
				this.incrementNoUseModels();
			} else {
				this.resetNoUseModels();
			}

			return resolvedUseModels;
		}

		sortClassifiers(classifiers) {
			//Sort Classifiers by there element Top-to-bottom and left-to-right
			classifiers.sort(function(a, b) {

				let elA = a.getElement(), elB = b.getElement(), yDiff = elA.center.y - elB.center.y, xDiff = elA.center.x - elB.center.x;

				if(yDiff === 0) {
					return xDiff;
				} else {
					return yDiff;
				}
			});		
		}


		resetNoUseModels() {
			this.noUseModelsCount = 0;
		}

		incrementNoUseModels() {
			this.noUseModelsCount += 1;
		}
		
		getConsecutiveNoUseModelCount() {
			return this.noUseModelsCount;
		}

		allResolved() {
			var definitions = Object.keys(this.resolvers), allRes = true;
			definitions.forEach(function(def) {
				allRes = allRes && this.resolvers[def].resolved;
			}, this);
			return allRes;
		}

		increaseScanAccuracy() {
			if(!this._originalScanOptions) {
				this._originalScanOptions = { xResolution: this.scanOptions.xResolution, yResolution:this.scanOptions.yResolution};
			}

			if(this.scanOptions.xResolution > 2) {
				this.scanOptions.xResolution = 2;
			}

			if(this.scanOptions.yResolution > 2) {
				this.scanOptions.yResolution = 2;
			}
		}

		restoreScanOptions() {
			if(this._originalScanOptions) {
				this.scanOptions = this._originalScanOptions;
			}
		}

	}

	return AbstractGoal;
});		