define('util/Messaging', [], function(){

	class Messaging {
		
		// constructor(){
		// 	this.workingTab;    // 'working' here means the tab that we have the product page open in... like a working directory
		// }

		static sendMessageToBackground(message,data,handler){

			if (typeof handler == 'undefined'){

				var handler = function(response){
					console.log("default message handler. response from background: " + response);
				}
			}

			if(typeof message == 'undefined'){
				var message = '';
			}

			if(typeof data == 'undefined'){
				var data = {};
			}

			chrome.runtime.sendMessage({"message" : message,"data":data}, function(response) {
		        handler(response);
		    });
		}

		sendMessageToWorkingTab(messageObject, callback){

        	chrome.tabs.sendMessage(this.workingTab.id, messageObject,function(response){
        		callback(response);
        	});
		}

		// getWorkingTab(callback){
		// 	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				
		// 		this.workingTab = tabs[0];

		// 		console.log('workingTab : ' + JSON.stringify(this.workingTab,null,4));

		// 		callback(this.workingTab);
		// 	});
		// }



	}// end messaging class

	return Messaging;
});
