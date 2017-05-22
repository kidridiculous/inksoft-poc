define('util/Mouse', [], function(){

	

	class MouseUtil {
		constructor() {
			this._offset = {x:0,y:0};
		}

		calibrate(callback) {
			var calibrateUrl = chrome.extension.getURL('calibrate.html');
			chrome.tabs.create({url:calibrateUrl}, callback);
		}

		setOffset(val) {
			this._offset = val;
		}

		getOffset() {
			return this._offset;
		}


		calculateSystemClick(x, y, scrollY) {
			let browserOffset = this.getOffset(), adjustedX, adjustedY, scrollX=0;

			
			/*
			if(y >= (browserOffset.clientHeight - footerPadding)) {
				scrollSteps = Math.ceil((y - (browserOffset.clientHeight - footerPadding)) / scrollStep);
				scrollY = scrollStep * scrollSteps;
				adjustedY = y - scrollY + browserOffset.y;
			}
			else
			{
					adjustedY = y + browserOffset.y;	
			}
			*/

			adjustedY = y - scrollY + browserOffset.y;

			adjustedX = x + browserOffset.x;

			return {x:adjustedX, y:adjustedY, scrollX:scrollX, scrollY:scrollY};

		}
	}
	

	return new MouseUtil();

});