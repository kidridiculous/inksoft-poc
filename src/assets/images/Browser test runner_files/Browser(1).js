define('system/Browser', ['util/EventDispatcher', 'lib/text!private/robotExtension/clientLogic/proxy_credentials.json'], function(EventDispatcher, ProxyCredentialsJson) {

	const ProxyCreds = JSON.parse(ProxyCredentialsJson);

	try {
	chrome.webRequest.onAuthRequired.addListener(
		function(details){
			if(details.isProxy === true) {
				console.log('PROXY-AUTH ==> ' + details.url);
				return {
					authCredentials: { 'username': ProxyCreds.username, 'password':ProxyCreds.password}
				};
			}
			return {cancel : true};
		}, 
		{ urls:["<all_urls>"]},
		["blocking"]);

	} catch(err) {
		
	}
	const WEB_NAVIGATION_BEGIN = 'WEB_NAVIGATION_BEGIN';
	const WEB_NAVIGATION_END = 'WEB_NAVIGATION_END';

	const WEB_REQUEST_BEGIN = 'WEB_REQUEST_BEGIN';
	const WEB_REQUEST_END = 'WEB_REQUEST_END';

	

	class BrowserState extends EventDispatcher {

		constructor() {
			super();
			this.webRequestCount = 0;
			this.webNavigationCount = 0;
			this.currentUrl = '';
		}

		get tabId() {
			return this._tabId;
		}

		set tabId(value) {
			this._tabId = value;
		}

		isActive() {
			return (this.webRequestCount > 0 || this.webNavigationCount > 0);
		}

		getCounts() {
			return {
				webRequestCount: this.webRequestCount,
				webNavigationCount: this.webNavigationCount
			};
		}

		monitor() {

			this.clearChromeListeners();

			var requestFilter1 = { urls:['<all_urls>'],tabId:this.tabId};
			var requestFilter2 = { urls:['<all_urls>'],tabId:this.tabId};
			var requestFilter3 = { urls:['<all_urls>'],tabId:this.tabId};
			var requestFilter4 = { urls:['<all_urls>'],tabId:this.tabId};
			
			//Monitor Web Requests
			this.incWebRequestDelegate = this.incWebRequest.bind(this);
			this.decWebRequestDelegate = this.decWebRequest.bind(this);
			

			chrome.webRequest.onBeforeRequest.addListener(this.incWebRequestDelegate, requestFilter1, ["blocking"]);
			chrome.webRequest.onBeforeRedirect.addListener(this.decWebRequestDelegate, requestFilter2);
			chrome.webRequest.onErrorOccurred.addListener(this.decWebRequestDelegate, requestFilter3);
			chrome.webRequest.onCompleted.addListener(this.decWebRequestDelegate, requestFilter4);
			

			//Monitor Web Navigation
			this.incWebNavDelegate = this.incWebNavigation.bind(this);
			this.decWebNavDelegate = this.decWebNavigation.bind(this);

			chrome.webNavigation.onBeforeNavigate.addListener(this.incWebNavDelegate);
			chrome.webNavigation.onCompleted.addListener(this.decWebNavDelegate);
			chrome.webNavigation.onErrorOccurred.addListener(this.decWebNavDelegate);
		}

		halt() {
			this.clearChromeListeners();
		}

		reset() {
			this.webRequestCount = 0;
			this.webNavigationCount = 0;
		}

		clearChromeListeners() {
			chrome.webRequest.onBeforeRequest.removeListener(this.incWebRequestDelegate);
			chrome.webRequest.onBeforeRedirect.removeListener(this.decWebRequestDelegate);
			chrome.webRequest.onErrorOccurred.removeListener(this.decWebRequestDelegate);
			chrome.webRequest.onCompleted.removeListener(this.decWebRequestDelegate);

			chrome.webNavigation.onBeforeNavigate.removeListener(this.incWebNavDelegate);
			chrome.webNavigation.onCompleted.removeListener(this.decWebNavDelegate);
			chrome.webNavigation.onErrorOccurred.removeListener(this.decWebNavDelegate);
			//chrome.webNavigation.onHistoryStateUpdated
		}


		incWebRequest (details) {
			this.webRequestCount += 1;
			this.dispatchEvent(WEB_REQUEST_BEGIN, {count:this.webRequestCount});
			return {};
		}

		decWebRequest (details) {
			this.webRequestCount -= 1;
			if(this.webRequestCount <= 0) {
				this.webRequestCount = 0;
			}
			this.dispatchEvent(WEB_REQUEST_END, {count:this.webRequestCount});
		}

		incWebNavigation(details) {
			if(details.tabId === this.tabId)
			{

				//Main Fram
				if(details.frameId === 0) {
					this.currentUrl = details.url;
				}

				this.webNavigationCount += 1;
				this.dispatchEvent(WEB_NAVIGATION_BEGIN, {count:this.webNavigationCount, isMainFrame: details.frameId === 0});
			}
		}

		decWebNavigation(details) {
			if(details.tabId === this.tabId)
			{
				this.webNavigationCount -= 1;

				if(this.webNavigationCount <= 0) {
					this.webNavigationCount = 0;	
				}
				this.dispatchEvent(WEB_NAVIGATION_END, {count:this.webNavigationCount, isMainFrame: details.frameId === 0});
			}
		}

		
		//Our target tab hasn't browsed anywhere
		isEmptyUrl() {
			return (this.currentUrl === 'about:blank' || this.currentUrl === '');
		}


	}

	return new BrowserState();

})