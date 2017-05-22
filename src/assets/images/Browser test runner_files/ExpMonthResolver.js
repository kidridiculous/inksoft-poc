define('use-model/ExpMonthResolver', ['use-model/SelectOneResolver', 'util/DateUtil'], function(SelectOneResolver, DateUtil) {

	class ExpMonthResolver extends SelectOneResolver {

		getDropDownRegex(el) {
			return DateUtil.getExpMonthRegex(this.data);
		}
		
	}

	return ExpMonthResolver;	
});