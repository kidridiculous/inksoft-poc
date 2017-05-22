define(function (require) {
  var registerSuite = require('intern!object');
  var assert = require('intern/chai!assert');
  var ProductShippingClassifier = require('classification/ProductShippingClassifier');

  var productNameEl = {
   "segments": {
      "1": {
         "segment": 1,
         "scrollY": 0,
         "box": {
            "xmin": 343,
            "ymin": 443,
            "xmax": 481,
            "ymax": 479
         },
         "center": {
            "x": 412,
            "y": 461
         },
         "scrollableAncestorScrollTop": 0
      },
      "scanToken": "diz8rpvHQV"
   },
   "segmentScrollY": 0,
   "scrollableAncestorScrollTop": 0,
   "className": "emphasized-copy short-description",
   "clientHeight": 36,
   "clientLeft": 0,
   "clientTop": 0,
   "clientWidth": 138,
   "id": "",
   "innerHTML": "Watch Dogs 2 - Xbox One",
   "innerText": "Watch Dogs 2 - Xbox One",
   "tagName": "SPAN",
   "title": "",
   "xmax": 481,
   "xmin": 343,
   "ymax": 479,
   "ymin": 443,
   "nodeValue": null,
   "center": {
      "x": 412,
      "y": 461
   },
   "imageSource": null,
   "isText": false,
   "textNeighbors": []
}


  var shippingEl = {
   "segments": {
      "1": {
         "segment": 1,
         "scrollY": 0,
         "box": {
            "xmin": 774,
            "ymin": 447,
            "xmax": 788,
            "ymax": 461
         },
         "center": {
            "x": 781,
            "y": 454
         },
         "scrollableAncestorScrollTop": 0
      },
      "scanToken": "diz8rpvHQV"
   },
   "segmentScrollY": 0,
   "scrollableAncestorScrollTop": 0,
   "className": "fulfillment-type-radio left",
   "clientHeight": 14,
   "clientLeft": 0,
   "clientTop": 0,
   "clientWidth": 14,
   "id": "ci775345006234SHIPPING",
   "innerHTML": "",
   "innerText": "",
   "tagName": "INPUT",
   "type": "radio",
   "title": "",
   "value": "SHIPPING",
   "placeholder": "",
   "name": "fulfillmentType",
   "xmax": 788,
   "xmin": 774,
   "ymax": 461,
   "ymin": 447,
   "nodeValue": null,
   "center": {
      "x": 781,
      "y": 454
   },
   "imageSource": null,
   "isText": false,
   "isInput": true,
   "textNeighbors": [
      {
         "text": "Shipping",
         "distance": 7.615773105863909,
         "centerDistance": 44.03979911682159,
         "location": "RIGHT"
      },
      {
         "text": "free",
         "distance": 114.11127809757676,
         "centerDistance": 139.77212223753762,
         "location": "LEFT"
      },
      {
         "text": "Available today at:",
         "distance": 151.0060023447433,
         "centerDistance": 209.5744946577115,
         "location": "LEFT"
      },
      {
         "text": "Store Pickup",
         "distance": 163.43411280548386,
         "centerDistance": 213.2203176754713,
         "location": "LEFT"
      },
      {
         "text": "$59.99",
         "distance": 227.00495589303773,
         "centerDistance": 258.47310252047987,
         "location": "RIGHT"
      },
      {
         "text": "Remove",
         "distance": 234.79565583715555,
         "centerDistance": 261.54549127512723,
         "location": "RIGHT"
      },
      {
         "text": "Weekly Ad",
         "distance": 325.49306985770164,
         "centerDistance": 338.5429202300509,
         "location": "ABOVE"
      }
   ],
   "cssContent": [
      "",
      ""
   ],
   "checked": false
};

  var shippingTextEl = {
   "segments": {
      "1": {
         "segment": 1,
         "scrollY": 0,
         "box": {
            "xmin": 795,
            "ymin": 443,
            "xmax": 854.875,
            "ymax": 459
         },
         "center": {
            "x": 824.9375,
            "y": 451
         },
         "scrollableAncestorScrollTop": 0
      },
      "scanToken": "YcEYXrlPnW"
   },
   "segmentScrollY": 0,
   "scrollableAncestorScrollTop": 0,
   "xmax": 854.875,
   "xmin": 795,
   "ymax": 459,
   "ymin": 443,
   "nodeValue": "Shipping",
   "center": {
      "x": 824.9375,
      "y": 451
   },
   "imageSource": null,
   "isText": true
};



  registerSuite({
    name: 'ProductShippingClassifier',
    beforeEach: function() {
    	
    },
    'It returns true on matching on product name': function () {
      
      var classifier = new ProductShippingClassifier('productShipping.1', {name:'Watch Dogs 2 - Xbox One'});

      var result = classifier.matchesKeywords(productNameEl);

      assert.equal(result, true,
        'Should return true');
    },
    'It sets productCartElement after matching on product name': function () {
      
      var classifier = new ProductShippingClassifier('productShipping.1', {name:'Watch Dogs 2 - Xbox One'});

      classifier.matchesKeywords(productNameEl);

      assert.equal(classifier.productCartElement, productNameEl,
        'productCartElement should equal matching product name element');
    },
    'It returns true on matching on shipping text': function () {
      
      var classifier = new ProductShippingClassifier('productShipping.1', {name:'Watch Dogs 2 - Xbox One'});

      var result = classifier.matchesKeywords(shippingEl);

      assert.equal(result, true,
        'Should return true');
    },
    'It appends shippingElement after matching on shipping element': function () {
      
      var classifier = new ProductShippingClassifier('productShipping.1', {name:'Watch Dogs 2 - Xbox One'});

      classifier.matchesKeywords(shippingEl);

      assert.equal(classifier.shippingElements[0], shippingEl,
        'shippingElements[0] should equal matching shippingEl');
    },
    'It picks the shipping option': function () {
      
      var classifier = new ProductShippingClassifier('productShipping.1', {name:'Watch Dogs 2 - Xbox One'});

      classifier.matchesKeywords(productNameEl);
      classifier.matchesKeywords(shippingEl);

      classifier.postMatchUpdate();

      assert.equal(classifier.matchingElement, shippingEl,
        'matchingElement should have been set to the shippingEl');
    },
    'It picks the best shipping option': function () {
      
      var classifier = new ProductShippingClassifier('productShipping.1', {name:'Watch Dogs 2 - Xbox One'});

      classifier.matchesKeywords(productNameEl);
      classifier.matchesKeywords(shippingEl);
      classifier.matchesKeywords(shippingTextEl);

      classifier.postMatchUpdate();

      assert.equal(classifier.matchingElement, shippingEl,
        'matchingElement should have been set to the shippingEl');
    }
  });

})