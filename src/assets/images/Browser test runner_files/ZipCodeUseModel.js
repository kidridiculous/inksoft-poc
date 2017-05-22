define('use-model/userData/ZipCodeUseModel',['task/TaskFactory', 'use-model/generic/TextInputUseModel'],function(TaskFactory, TextInputUseModel){

	class ZipCodeUseModel extends TextInputUseModel {

		constructor(classifier, resolver){
			super(classifier, resolver);
		}
		
		valuesMatch(elementValue, myValue) {
            
            if(this.isZipPlus4(elementValue) && this.isShortZip(myValue)) {
                return elementValue.substr(0,5) === myValue;
            } else if(this.isZipPlus4(myValue) && this.isShortZip(elementValue)) {
                return myValue.substr(0,5) === elementValue;
            } else {
                return super.valuesMatch(elementValue, myValue);
            }
		}

        isZipPlus4(zipString) {
            return /^\d{5}-\d{4}$/.test(zipString);
        }

        isShortZip(zipString) {
            return /^\d{5}$/.test(zipString);
        }

		
	
	}

	return ZipCodeUseModel;
})