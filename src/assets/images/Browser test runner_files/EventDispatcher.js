define('util/EventDispatcher', [], function() {

	class EventDispatcher {

		constructor() {
			this.listeners = {};

		}

		addListener (event, fn) {
			this.listeners[event] = this.listeners[event] || [];
  			this.listeners[event].push(fn);	
		}

		removeListener(event, fn) {
			let handlers = this.listeners[event];
			if(handlers) {
				handlers.splice(handlers.indexOf(fn), 1);	
			}
		}

		dispatchEvent (event, ...args) {
  			const eventListeners = this.listeners[event];
  			if (eventListeners) {
    			eventListeners.forEach(event => {
      			event.apply(null, args)
    			})
  			}
		}

		getListeners (event) {
  			return this.listeners[event];
		}

		clearListeners (event) {
  			if (event) {
    			this.listeners[event] = [];
  			}
		}
	}

	return EventDispatcher;
})