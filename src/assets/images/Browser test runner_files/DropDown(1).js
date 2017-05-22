define('use-model/generic/DropDown',[],function(){

	class DropDown{

		constructor(){

		}

		selectFromDropDown(elementData, dynamicData){

			let selectElement;

			if( !dynamicData.hasOwnProperty('regex') ){
				throw new Error('no regex passed with dynamicData');
			}

			if( elementData.hasOwnProperty('id')){

				selectElement = document.getElementById(elementData.id);

				if(dynamicData.hasOwnProperty('optionValue'))
				{
					selectElement.value =  dynamicData.optionValue;	
				}
				

			} else if(elementData.hasOwnProperty('clientCoordinates')) {

				var x = elementData.clientCoordinates.x;
				var y = elementData.clientCoordinates.y;

				selectElement = document.elementFromPoint(x,y);
			} else {
				throw Error("could not find element from dynamicData - need and Id or client coordinates");
			}

			if(selectElement && selectElement.tagName !== 'SELECT') {
				throw Error('not a select element');
			}

			var options = selectElement.options,
				ithOption;

			for(var index in options){
	
				ithOption = options[index];

				let matcher = new RegExp(dynamicData.regex), optionText = ithOption.label || ithOption.textContent;

				let match = matcher.test(optionText);

				if(match){

					console.log('Match Found:' + optionText);
	
					if(ithOption.value) {
						selectElement.value = ithOption.value;
					}
					ithOption.setAttribute('selected', true);
					selectElement.options.selectedIndex = index;

					//Dispatch Event on Select to indicate a change in selection has occurred
					selectElement.dispatchEvent(new Event('change'));
					break;
				}
			}


		}
	}
	return DropDown
})