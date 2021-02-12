var dataExchange = {
  exchangeId: '',
  data: {},

  // handlers for all event types. An initial handlers are provided, the rest should be added from elsewhere
  handlers: {
    initialData: function (data) { dataExchange.data = data; }
  },

  // what to do with a message
  _eventHandler: function (event) {
    if (typeof event === 'undefined' || typeof event.data === 'undefined' ||event.data.exchangeId !== dataExchange.exchangeId) {
      return;
    }

    let handler = dataExchange.handlers[event.data.event.eventType];
    if (typeof handler !== 'undefined'){ 
      handler(event.data.event.value);
    } 
  },

  // addEventListener support for IE8
  _bindEvent: function (element, eventName, eventHandler) {
    if (element.addEventListener) {
      element.addEventListener(eventName, eventHandler, false);
    } else if (element.attachEvent) {
      element.attachEvent('on' + eventName, eventHandler);
    }
  },

  // Send a message to the parent
  sendParentMessage: function (eventType, value) {
    // Make sure you are sending a string, and to stringify JSON
    window.parent.postMessage({
      exchangeId: dataExchange.exchangeId,
      event: {
        eventType: eventType,
        value: value
      }
    },
      '*');
  },


  // Listen to messages from parent window
  startListening: function () {
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('exchangeId')) {
      dataExchange.exchangeId = urlParams.get('exchangeId');
    }
    dataExchange._bindEvent(window, 'message', dataExchange._eventHandler);
  }
};

dataExchange.startListening();
//// indicate loaded
dataExchange.sendParentMessage('loaded', true)
