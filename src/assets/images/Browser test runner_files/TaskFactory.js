define('task/TaskFactory', 
	['util/Messaging',
	'util/ElementCalculations',
	'lib/socket.io',
	'util/Mouse',
	'system/Browser',
	'util/ScreenShot',
  'util/StatusMessage',
	'controller/RobotConfig'], 
	function(Messaging, ElementCalculations, Socket, MouseUtil, Browser, ScreenShot, StatusMessage, RobotConfig) {

	const messaging = new Messaging();
	const elementCalculations = new ElementCalculations();
	const socket = Socket('http://localhost:2087');

	// TODO get these helpers into a separate js file to use here and RobotController
	// =============== promise helpers ===============
	// ===============================================

	const chromeCreate = function(properties) {
		return new Promise(function(resolve, reject) {
			if (!properties) {
				reject(`ERROR: chromeCreate no properties provided`);
			} else {
				chrome.tabs.create(properties, resolve);
			}
		});
	};
	
	const chromeExecuteScript = function(tabId, details) {
		return new Promise(function(resolve, reject) {
			if (!tabId) {
				reject(`ERROR: chromeExecuteScript no tabId provided`);
			} else if (!details) {
				reject(`ERROR: chromeExecuteScript no details provided`);
			} else {
				chrome.tabs.executeScript(Browser.tabId, details, resolve);
			}
		});
	};

	const chromeQuery = function (query) {
		return new Promise(function(resolve, reject) {
			if (!query) {
				reject(`ERROR: chromeQuery no query provided`);
			} else {
				chrome.tabs.query(query, resolve);
			}
		});
	};

	const chromeSendMessage = function(tabId, message, options) {
		options = options || {};
		
		return new Promise(function(resolve, reject) {
			if (!tabId) {
				reject(`ERROR: chromeSendMessage no tabId provided`);
			} else if (!message) {
				reject(`ERROR: chromeSendMessage no message provided`);
			} else {
				chrome.tabs.sendMessage(Browser.tabId, message, options, resolve);
			}
		});
	};

	const chromeUpdate = function(tabId, updateProperties) {
		return new Promise(function(resolve, reject) {
			if (!tabId) {
				reject(`ERROR: chromeUpdate no tabId provided`);
			} else if (!updateProperties) {
				reject(`ERROR: chromeUpdate no updateProperties provided`);
			} else {
				chrome.tabs.update(Browser.tabId, updateProperties, resolve);
			}
		});
	};

	// ==============================================

	// abstract
	class Task {
		constructor() {
			this._complete = false;
			this._definition = '';
		}

		isComplete() {
			return this._complete;
		}

		execute(callback) {
			StatusMessage.sendTask({task:this.constructor.name, definition:this._definition});
			this._promise  = this.createPromise();

			return this._promise;
		}

		createPromise() {
			return Promise.resolve();
		}

		validationTimedOut(compare) {
			
			if (!this.executionBegin) return false;

			const currentTaskTimeSpent = (compare.getTime() - this.executionBegin.getTime());

			return currentTaskTimeSpent > this.timeoutMS;
		}

		timeout() {
			this._complete = true;
		}

		validate() {
			this._complete = true;
		}

		setDefinition(def) {
			this._definition = def;
		}

	}

	//[MM] Abstract Class 
	class ContentScriptTask extends Task {
		
		execute() {

			StatusMessage.sendTask({task:this.constructor.name, definition:this._definition});
			//Promise that will resolve if the content script is reloaded to handle cases where
			//a task thta is dependent on the content script gets blown up because of a page refresh
			const interruption = new Promise((resolve, reject) => {
				chrome.runtime.onMessage.addListener(function contentScriptLoaded(request, sender, sendResponse) { 
					if(request.message === 'contentScriptLoaded') {
						chrome.runtime.onMessage.removeListener(contentScriptLoaded);
						reject({message:'Task Interrupted'});
					}
				});
			})

			const mainPromise = this.createPromise();

			//Return a promise that is racing between one of the two completing, ie the main promise (the actual task) and the interrupt occuring
			return Promise.race([interruption, mainPromise]);
			
		}
	}

	//MM - Convereted to WaitTask
	class TimeoutTask extends Task {
		constructor(timeoutMS, definition) {
			super();
			this.timeoutMS = timeoutMS;
			this.setDefinition(definition);
		}

		createPromise() {
			const self = this;

			return new Promise((resolve, reject) => {
				setTimeout(function() {
					console.log('DONE WAITING');
					resolve();
				}, self.timeoutMS);
			});
		}
	}


	class ScreenShotTask extends ContentScriptTask {
		constructor() {
			super();
		}

		createPromise() {
			
			return new Promise((resolve, reject) => {
				ScreenShot.getFullPage(function(fullPageScreenShot) {
					console.log(`SUCCESS: screenshot task, fullPageScreenShot ${JSON.stringify(fullPageScreenShot).substring(0,100)}...`);

					const action = { screenShot: fullPageScreenShot };
					socket.emit('SCREENSHOT', action, function() {
						resolve();
					});
				});
			});

		}
	}

	class ContentExtractTask extends Task {
		constructor(definition, value) {
			super();
			this.contentDefinition = definition;
			this.contentValue = value;
		}

		createPromise() {

			const action = {
				'definition': this.contentDefinition,
				'value': this.contentValue
			};

			return new Promise((resolve, reject) => {
				socket.emit('CONTENT_EXTRACTED', action, function() {
					resolve();
				});
			});
		}
	}

	//MM - converted to TS
	class WindowScrollTask extends ContentScriptTask {
		
		constructor(scrollX, scrollY) {
			super();
			this.scrollX = scrollX;
			this.scrollY = scrollY;
			this.timeoutMS = 500;
		}

		createPromise() {

			const self = this;

			const details = {
				allFrames: false,
				code: `window.scrollTo(${this.scrollX.toString()},${this.scrollY.toString()});`
			};

			return new Promise((resolve, reject) => {
				chromeExecuteScript(Browser.tabId, details)
					.then(function() {
						resolve();
					})
					.catch(function(err) {
						console.error(`ERROR: failed to executeScript at WindowScrollTask`, err);
						reject(err);
					});
			});		
		}
	}

	class SimpleMouseClickTask extends Task {
		
		constructor(x, y) {
			super();
			this.type = 'LEFT_CLICK';
			this.x = x;
			this.y = y;
			this.useTimeout = false;
		}
		
		execute(callback) {
			super.execute();
			console.log(`task: executing SimpleMouseClickTask`);

			const self = this;
			
			const action = {
				action: this.type,
				x: this.x,
				y: this.y
			};
			
			socket.emit('action', action, function() {
				self.validate();
				if (callback) callback();
			});
		}
		
		validate(event) {
			super.validate();
		}	
	}

	class MouseTask extends Task {
		
		constructor(type, x, y, scrollX, scrollY, parentScrollY) {
			super();
			this.type = type;
			this.x = x;
			this.y = y;
			this.scrollX = scrollX;
			this.scrollY = scrollY;
			this.parentScrollY = parentScrollY;
			this.useTimeout = false;
		}

		createPromise() {
			
			const self = this;
			
			const details = {
				allFrames: false,
				code: `window.scrollTo(${this.scrollX.toString()},${this.scrollY.toString()});`
			};

			console.log(`MouseTask details: ${details.code}`);

			// if (this.parentScrollY > 0) {
			// 	details.code += 'var scnr = require(\'vision/Scanner2\');scnr.scrollParentFromPoint(' + this.x.toString() + ',' + this.y.toString() + ',' + this.parentScrollY.toString() + ');';
			// }
			return new Promise((resolve, reject) => {
				chromeExecuteScript(Browser.tabId, details)
				.then(function() {
					console.log(`${self.type} ${self.x.toString()} ${self.y.toString()}`);
					
					const action = {
						action: self.type,
						x: self.x,
						y: self.y
					};
					
					socket.emit('action', action, function() {
						console.log('CLICK COMPLETE');
						resolve();
					});
				})
				.catch(function(err) {
					console.error(`ERROR: failed to executeScript at MouseTask`, err);
					reject(err);
				});
			});
		}

		static get LEFT_CLICK() {
			return 'LEFT_CLICK';
		}

		static get MOVE_MOUSE() {
			return 'MOVE_MOUSE';
		}

	}

	class KeyboardTask extends Task {
		constructor(text) {
			super();
			this.text = text;
			// this.timeoutMS = this.text.length * 40 + this.staticKeyboardTaskBufferMS;
			this.useTimeout = false;
		}

		createPromise() {			
			const action = {
				action:'KEYBOARD',
				text: this.text
			};

			return new Promise((resolve, reject) => {
				socket.emit('action', action, function() {
					resolve();
				});
			});
		}
	}

	class DeleteKeyboardTask extends Task {
		constructor(numDeletes) {
			super();
			this.numDeletes = numDeletes;	
			// this.timeoutMS = numDeletes * 40 + this.staticKeyboardTaskBufferMS;
			this.useTimeout = false;
		}

		createPromise() {

			const action = {
				action:'KEYBOARD_DELETE',
				count: this.numDeletes
			};

			return new Promise((resolve, reject) => {
				socket.emit('action', action, function() {
					resolve();
				});
			});
			
		}
	}

	class TextInputClearTask extends Task {
		constructor(numDeletes) {
			super();
			this.numDeletes = numDeletes;
			// this.timeoutMS = ((numDeletes * 2) + 6) * 40;
			this.useTimeout = false;
		}

		createPromise() {	
			const action = {
				action: 'TEXT_INPUT_CLEAR',
				count: this.numDeletes
			};

			return new Promise((resolve, reject) => {
				socket.emit('action', action, function() {
					resolve();
				});
			});
			
		}
	}

	class EnterKeyboardTask extends Task {
		constructor() {
			super();
			// this.timeoutMS = 500;
			this.useTimeout = false;
		}

		createPromise(callback) {
			const action = {
				action:'KEYBOARD_ENTER'
			};

			return new Promise((resolve, reject) => {
				socket.emit('action', action, function() {
					resolve();
				});
			});
		}
	}

	class BrowserTask extends Task {
		constructor(options) {
			super();
			this.options = options;
			this.useTimeout = false;
		}
		
		execute(callback) {
			
			StatusMessage.sendTask({task:this.constructor.name, definition:this._definition});

			const self = this;

			const loadCompletePromise = new Promise((resolve, reject) => {
				Browser.addListener('WEB_NAVIGATION_END', function webNavEnd() {
					Browser.removeListener('WEB_NAVIGATION_END', webNavEnd);
					resolve();
				});
			});

			const taskPromise = this.createPromise();


			return Promise.race([loadCompletePromise, taskPromise]);
			
		}

		createPromise() {
			const updateProperties = {
				url: this.options.url
			};

			return new Promise((resolve, reject) => {
				chromeUpdate(Browser.tabId, updateProperties)
					.then(function() {
						//Do nothing WebNavigationEnd Will resolve the promise
					})
					.catch(function(err) {
						reject(err);
					});
			});		
		}
	}

	 class SendCompletedTask extends Task {

		 constructor(exitCode, startTime, latestVision){
			 super();
			 this.exitCode = exitCode;
			 this.startTime = startTime;
			 this.latestVision = latestVision;
		 }
		 
		 createPromise() {
			return new Promise((resolve, reject) => {
				StatusMessage.sendCompleted(this.exitCode, this.startTime, this.latestVision, () => {resolve();});	
			});
		 }
		 
	 }

	class AncestorScrollTask extends ContentScriptTask {
		
		constructor(x, y, scrollTop) {
			super();
			this.x = x;
			this.y = y;
			this.scrollTop = scrollTop;
		}

		createPromise() {
			

			const self = this;

			const message = {
				'command': 'scrollParentFromPoint',
				'data': {
					'x': this.x,
					'y':this.y,
					'scrollTop': this.scrollTop
				}
			};

			const options = {};

			return new Promise((resolve, reject) => {
				chromeSendMessage(Browser.tabId, message, options)
					.then(resolve, reject);
			});
			
		}
	}

	// TODO add support for constructor to accept resolution
	class ScanTask extends ContentScriptTask {
		
		constructor() {
			super();
		}

		createPromise() {
	
			const self = this;			

			//Promise to get the target tabID
			const getTabId = new Promise((resolve, reject) => {
				if (Browser.tabId) { 
					resolve(Browser.tabId);
				} else {
					const query = {
						active: true,
						currentWindow: true
					};
					chromeQuery(query)
						.then(function(tabs) { 
							resolve(tabs[0].id);
						})
						.catch(function(err) {
							reject(err);
						});
				}
			});

			return new Promise((resolve, reject) => {
				//Find the tabId
				getTabId.then(function(tabId) {
					//Message Details to trigger scan
					const message = {
						'command': 'scan',
						'xResolution': RobotConfig.getXResolution(),
						'yResolution': RobotConfig.getYResolution()
					};
					
					const options = {};

					chromeSendMessage(Browser.tabId, message, options)
						.then(function(scanOutput) {
							//resolve Promise with scan results
							resolve(scanOutput);
						})
						.catch(function(err) {
							console.error(`ERROR: failed to sendMessage at ScanTask`, err);
							reject(err);
						});
				})
				.catch(function(err){
					console.error(`ERROR: failed to get tabId`, err);
					reject(err);
				});
			});						
		}
	}
       
	class CheckScanTask extends ScanTask {
		constructor() {
			super();
		}

		createPromise() {
			// TODO does this need to call super.execute() or is this a complete override?
			console.log(`task: executing CheckScanTask`);

			const self = this;

			const message = {
				'command': 'scan',
				'xResolution': 24,
				'yResolution': 16
			};

			return new Promise((resolve, reject) => {
					chromeSendMessage(Browser.tabId, message)
					.then(function(scanOutput) {
						resolve(scanOutput);
					})
					.catch(function(err) {
						console.error(`ERROR: failed to sendMessage at CheckScanTask`, err);
						reject(err);
					});
			});
		}
	}

	class ScanExperiment extends ScanTask {
		constructor(xRes, yRes, xStart, yStart, width, height, classifier, useModel) {
			super();
			this.command = 'targetScan'
			this.xStart = xStart;
			this.yStart = yStart;
			this.width = width;
			this.height = height;
			this.classifier = classifier;
			this.useModel = useModel;
			this.xResolution = xRes;
			this.yResolution = yRes;
		}

		viewportScan() {
			this.command = 'viewportScan';
		}

		fullScan() {
			this.command = 'scan';
		}

		createPromise(callback) {
			// TODO does this need to call super.execute() or is this an override?
			console.log(`task: executing ScanExperiment with ${this.command}`);
			
			const self = this;
			
			const message = {
				'command': this.command,
				'xResolution': this.xResolution, 
				'yResolution': this.yResolution,
				'xStart': this.xStart,
				'yStart': this.yStart,
				'width': this.width,
				'height': this.height
			};

			return new Promise((resolve, reject) => {
				chromeSendMessage(Browser.tabId, message)
					.then(function(scanOutput) {
						resolve(scanOutput);
					})
					.catch(function(err) {
						console.error(`ERROR: failed to sendMessage at CheckScanTask`, err);
						reject(err);
					});
			});
		}

		/* [MM] - DEPRECATED OLD INTERFACE
		getAdditionalTasks(scanData) {
			let tasks = [];

			if (this.classifier.constructor.prototype.hasOwnProperty('processAdditionalScan')) {
				this.classifier.processAdditionalScan(scanData);

				if (this.useModel.constructor.prototype.hasOwnProperty('resolveAdditionalTasks')) {
					tasks = this.useModel.resolveAdditionalTasks(this.classifier);
				}
			}

			return tasks;
		}
		*/
	}

	class SamplePointScan extends ScanTask {
		constructor(x, y) {
			super();
			this.x = x;
			this.y = y;
			this.useTimeout = false;
		}

		createPromise() {
			// TODO does this need to call super.execute() or is this an override?
			console.log(`task: executing SamplePointScan`);
			
			const self = this;
			
			const message = {
				'command': 'samplePointScan',
				'x': this.x,
				'y': this.y
			};

			return new Promise((resolve, reject) => {
				chromeSendMessage(Browser.tabId, message)
					.then(function(scanOutput) {
						resolve(scanOutput);
					})
					.catch(function(err) {
						console.error(`ERROR: failed to sendMessage at SamplePointScan`, err);
						reject(err);
					});
			});

		}
	}

	/* [MM] DEPRECATED

    class LogToDiskTask extends Task {
		constructor(messageType, messageText){
			super();
			this.messageType = messageType;
			this.messageText = messageText;
		}
       
		execute(callback) {
			super.execute();
			console.log(`task: executing LogToDiskTask`);

			const action = {
				'action': 'LOGTODISK',
				'messageType': this.messageType,
				'messageText': this.messageText
			};
			
			socket.emit('action', action, function() {
				if (callback) callback();
			});
		}
	}
*/
	/* [MM] - DEPRECATED
	class DropDownTask extends Task {
		constructor(id, x, y, scrollX, scrollY, regex) {
			super();
			this.id = id;
			this.x = x;
			this.y = y;
			this.scrollX = scrollX;
			this.scrollY = scrollY;
			this.regex = regex;
		}

		execute(callback) {
			super.execute();
			console.log(`task: executing DropDownTask`);

			let elData = {};
			
			let dynData = {
				'regex': this.regex
			};

			if (this.id && this.id.length > 0) elData["id"] = this.id;
			
			elData["clientCoordinates"] = {
				'x': Math.floor(this.x),
				'y': Math.floor(this.y)
			};

			let data = {
				'elementData': elData,
				'dynamicData': dynData
			};

			const details = {
				allFrames: false,
				code: `window.scrollTo(${this.scrollX.toString()},${this.scrollY.toString()});`
			};

			chromeExecuteScript(Browser.tabId, details)
				.then(function() {
					
					const message = {
						'command': 'dropDownMenu',
						'data': data
					};
					
					// TODO unnest this promise
					chromeSendMessage(Browser.tabId, message)
						.then(function(response) {
							console.log('SUCCESS: drop down message sent', response || '');
						})
						.catch(function(err) {
							console.error(`ERROR: failed to sendMessage at DropDownTask`, err);
						});
				})
				.catch(function(err) {
					console.error(`ERROR: failed to executeScript at DropDownTask`, err);
				});
		}
	}
	*/
	
	class TaskFactory {

		static getTimeoutTask(timeoutMS, definition) {
		 	return new TimeoutTask(timeoutMS, definition);
		}

		static getBrowserTask(options) {
			return new BrowserTask(options);
		}
	
		static getLeftMouseClickTask(x, y, scrollY, parentScrollY) {
			const systemClick = MouseUtil.calculateSystemClick(x, y, scrollY, parentScrollY);
				
			return new MouseTask(MouseTask.LEFT_CLICK, systemClick.x, systemClick.y, systemClick.scrollX, systemClick.scrollY, parentScrollY);
		}

		static getMouseMoveTask(x, y, scrollY) {
			const systemClick = MouseUtil.calculateSystemClick(x, y, scrollY);
			
			return new MouseTask(MouseTask.MOVE_MOUSE, systemClick.x, systemClick.y, systemClick.scrollX, systemClick.scrollY);
		}

		static getTypeTask(text) {	
			return new KeyboardTask(text);
		}
                   
       	static getLogToDiskTask(messageType, messageText) {
            return new LogToDiskTask(messageType, messageText);
       	}
	

	    static getSendCompletedTask(exitCode, startTime, latestVision){
	      return new SendCompletedTask(exitCode, startTime, latestVision);
	    }

		// TODO Will need to parameterize this function here to accept the x/y resolution of the scan 
		// May want to make the resolution arguments optional and set defaults if they don't exist, 
		// if not will need to update every invocation of this function
		static getScanTask() {
			return new ScanTask();
		}

		static getScanExperimentTask(xRes, yRes, xStart, yStart, width, height, classifier, useModel) {
			return new ScanExperiment(xRes, yRes, xStart, yStart, width, height, classifier, useModel);
		}

		static getCheckScan() {
			return new CheckScanTask();
		}

		static getSamplePointScan(element) {
			const keys = Object.keys(element.segments);
			const segment = element.segments[keys[0]];

			return new SamplePointScan(segment.center.x, segment.center.y);
		}

		static getHolsterMouse() {
      		return new MouseTask(MouseTask.MOVE_MOUSE,0,0,0,0);
		}

		static getWindowScrollTask(scrollX, scrollY) {
			return new WindowScrollTask(scrollX, scrollY);
		}

		/* [MM] DEPRECATED
		static getDropDownTask(id, center, scrollY, regex) {
			const browserOffset = MouseUtil.getOffset();
            const step = 150;
			const scrollX = 0;
			const scrollSteps = 0;
            const adjustedY = center.y - scrollY;   
            const adjustedX = center.x;
            
			return new DropDownTask(id, adjustedX, adjustedY, scrollX, scrollY, regex);
		}
		*/

		/* [MM] - DEPRECATED
		static getContentScriptTask(code) {
			return new ContentScriptTask(code);
		}
		*/

		static getKeyboardDeleteTask(numDeletes) {
			return new DeleteKeyboardTask(numDeletes);
		}

		static getTextInputClearTask(numDeletes) {
			return new TextInputClearTask(numDeletes);	
		}

		static getKeyboardEnterTask() {
			return new EnterKeyboardTask();
		}

		/* [MM] DEPRECATED
		static getSimpleMouseClickTask(x, y) {
			return new SimpleMouseClickTask(x, y);
		}
		*/

		static getContentExtractTask(definition, value) {
			return new ContentExtractTask(definition, value);
		}

		static getScreenShotTask() {
			return new ScreenShotTask();
		}

		static getAncestorScrollTask(x, y, scrollTop) {
			return new AncestorScrollTask(x, y, scrollTop);
		}
	}

	return TaskFactory;

});
