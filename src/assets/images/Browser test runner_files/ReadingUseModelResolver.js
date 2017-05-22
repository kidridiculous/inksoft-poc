define('use-model/ReadingUseModelResolver', ['task/TaskFactory', 'use-model/UseModelResolver', 'use-model/generic/ValueReadingUseModel'], function(TaskFactory, UseModelResolver, ValueReadingUseModel) {

	class ReadingUseModelResolver extends UseModelResolver {

		constructor(config){
			super(config);
		}

		getUseModel(classifier) {
			this.resolved = true;
			this.timesResolved++;
			classifier.resolved();
			
			return new ValueReadingUseModel(classifier, this);
		}
	}

	return ReadingUseModelResolver;
})		
