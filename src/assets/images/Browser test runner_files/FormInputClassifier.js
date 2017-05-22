define('classification/FormInputClassifier', ['classification/KeywordClassifier'], function(KeywordClassifier) {

	// matches an element from the scan to a single attribute
	class FormInputClassifier extends KeywordClassifier {

		isFormInput(el) {
			let inputTypes = ['text', 'tel', 'password', 'email', 'number', 'checkbox', 'radio'];

			return (el.tagName === 'INPUT' && inputTypes.includes(el.type)) || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA';
		}

		// sort the results array and return the element of the result at index 0
		handleMultipleMatches(results) {
			const isFormInput = this.isFormInput;

			return results.sort(function(a, b) {
				const aIsForm = isFormInput(a.element);
				const bIsForm = isFormInput(b.element);
				
				if (aIsForm && bIsForm) return 0;
				
				if (aIsForm) return -1;
				
				if (bIsForm) return 1;

			})[0].element;
		}

	}

	return FormInputClassifier;
});
