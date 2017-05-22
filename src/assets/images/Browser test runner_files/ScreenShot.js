define('util/ScreenShot', ['system/Browser'], function(Browser){

	let HEADER_HEIGHT = 200, FOOTER_HEIGHT = 200;

	class ScreenShot {

		constructor(){

		}

		capture(callback){
			var self = this;
			console.log('capturing tab');
			chrome.tabs.captureVisibleTab(null, {format: 'png', quality: 100}, function(dataURI){
				var img = new Image;
				img.src = dataURI;
				img.onload = function(){

					self.context.drawImage(
							img,
							self.srcImage.x,
							self.srcImage.y,
							self.srcImage.width,
							self.srcImage.height,
							self.destImage.x,
							self.destImage.y,
							self.destImage.width,
							self.destImage.height);
					console.log('drawing capture');
					callback();
				};
				
			});
		}

		showImgInNewTab(dataURI){
			//chrome.storage.local.set({screenshot:dataURI});
			chrome.runtime.sendMessage({
			    "message":'OPEN_SCREENSHOT',
			    "dataURI": dataURI
			});
			
		}

		getFullPage(callback){
			this.canvas = document.createElement('canvas');
			this.context = this.canvas.getContext('2d');
			var self = this;
			self.images = [];
			self.windowPropertiesArray = [];
			self.resetScroll(function(){
				self.gatherImages(function(){

					self.fullPageDataUrl = self.getDataUrl(self.canvas);

					//self.showImgInNewTab(self.fullPageDataUrl, function(){
						callback(self.fullPageDataUrl);
					//});
				});				
			});
		}

		getDataUrl(canvasObject){

			console.log('canvasObject.height : ' + canvasObject.height);
			console.log('canvasObject.width : ' + canvasObject.width);


			return canvasObject.toDataURL("image/jpeg",1);
		}

		resetScroll(callback){
			console.log('Reset scroll');
			var self = this;
			self.index = 0;
			chrome.tabs.sendMessage(Browser.tabId, {"command":'captureScrollReset'}, function(response){
				if(typeof response !== 'undefined'){
          response.isReset = true;
          self.handleWindowSettings(response);
				}
				callback();
			});
		}

		gatherImages(endCallback){

			var self = this;

			function next() {

				self.capture(function(){
					if(self.scrollComplete) {
						endCallback();
					} else {
						self.index += 1;
						self.scrollActiveTabByFrameHeight(next);
					}
				});
			}		
			next(false);
		}


		handleWindowSettings(windowSettings){


			this.scrollComplete = false;

		
			this.viewportHeight = windowSettings.innerHeight;
			this.viewportWidth = windowSettings.innerWidth;
			this.docHeight = windowSettings.docHeight;
			this.hScrollHeight = windowSettings.hScrollHeight;
			this.vScrollWidth = windowSettings.vScrollWidth;
			this.singleImageScreenShot = windowSettings.singleImageScreenShot;
			this.devicePixelRatio = windowSettings.devicePixelRatio;
			this.scrollYDelta = windowSettings.scrollYDelta;
			this.scrollY = windowSettings.scrollY;
			this.frameHeight = this.viewportHeight - FOOTER_HEIGHT - HEADER_HEIGHT;

			if(this.docHeight <= this.viewportHeight || (this.scrollYDelta < this.frameHeight && !windowSettings.isReset)) {
				this.scrollComplete = true;
			}

			this.srcImage = {
				x: 0,
				y: 0,
				width: 0,
				height: 0,
			};

			this.destImage = {
				x: 0,
				y:0,
				width:0,
				height: 0
			};

			let imgWidth = (this.viewportWidth-this.vScrollWidth) * this.devicePixelRatio;
			this.srcImage.width = imgWidth;
			this.destImage.width = imgWidth;


			if(windowSettings.isReset && this.scrollComplete) {
				//Single Page with no scroll capture
				console.log('Calculating single page capture');
				this.srcImage.height = (this.viewportHeight-this.hScrollHeight) * this.devicePixelRatio;
				this.destImage.height = (this.viewportHeight-this.hScrollHeight) * this.devicePixelRatio;
			} else if(windowSettings.isReset) {
				//First Page of multiple
				console.log('Calculating first page capture');
				this.firstPageHeight = (this.viewportHeight - FOOTER_HEIGHT - this.hScrollHeight);
				this.srcImage.height = this.firstPageHeight * this.devicePixelRatio;
				this.destImage.height = this.firstPageHeight * this.devicePixelRatio;
			} else if(this.scrollComplete) {
				//Last Page
				console.log('Calculating last page capture');
				var lastPageHeight = this.scrollYDelta + FOOTER_HEIGHT;
				this.srcImage.y = (this.viewportHeight - lastPageHeight) * this.devicePixelRatio;
				this.srcImage.height = lastPageHeight * this.devicePixelRatio;
				this.destImage.height = lastPageHeight * this.devicePixelRatio;
				this.destImage.y = (this.firstPageHeight + ((this.index - 1) * this.frameHeight) - this.hScrollHeight) * this.devicePixelRatio
			} else {
				var middlePageHeight = this.scrollYDelta;
				this.srcImage.y = (this.viewportHeight - FOOTER_HEIGHT - middlePageHeight) * this.devicePixelRatio;
				this.srcImage.height = middlePageHeight * this.devicePixelRatio;
				this.destImage.height = middlePageHeight * this.devicePixelRatio;
				this.destImage.y = (this.firstPageHeight + ((this.index - 1) * this.frameHeight) - this.hScrollHeight) * this.devicePixelRatio
			}

			console.log(this.srcImage);
			console.log(this.destImage);


			if(this.index == 0){
				// can only do this once because setting the value of the height or width props CLEARS the canvas!!
				console.log('Setting canvas width and height:')
				this.canvas.height = (this.docHeight) * this.devicePixelRatio;
				this.canvas.width = (this.viewportWidth - this.vScrollWidth) * this.devicePixelRatio;				
			}
			
		}

		scrollActiveTabByFrameHeight(callback){   
			var self = this;
			chrome.tabs.sendMessage(Browser.tabId, {"command":'captureScroll',frameHeight: self.frameHeight},function(response){
				self.handleWindowSettings(response);
				callback();
			});
		}
	}

	return new ScreenShot();
});
