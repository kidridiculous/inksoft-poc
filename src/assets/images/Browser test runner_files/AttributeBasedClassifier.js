define(function (require) {
	var registerSuite = require('intern!object');
	var assert = require('intern/chai!assert');
	var AttributeBasedClassifier = require('classification/AttributeBasedClassifier');
	
	var productData = {
		    "price": 68,
		    "retailerId": 66,
		    "retailer": "Abercrombie",
		    "stocks": 43,
		    "quantity": 1,
		    "wid": "7145131",
		    "sid": "622167323",
		    "picture": "http://anf.scene7.com/is/image/anf/anf_121976_02_prod1",
		    "url": "https://www.abercrombie.com/shop/us/mens-polos-tops/icon-polo-7616144_07?ofp=true",
		    "xid": "66_5623d7ac4af6a10b07bc78e02a1ca813d7801b20",
		    "currency": "$",
		    "status": 1,
		    "name": "Waffle Henley Sweater",
		    "attributes": {
		        "color": {
		            "label": "GREY",
		            "title": "Color",
		            "value": "GREY",
		            "icon": "https://anf.scene7.com/is/image/anf/anf_126054_sw112x112?wid=42"
		        },
		        "size1": {
		            "label": "M",
		            "title": "Size",
		            "value": "M"
		        }
		    }
		};

	var merchantId = 1;		

	var getClassifierInstance = function() { return new AttributeBasedClassifier(merchantId,productData); }

	registerSuite({
		name: 'AttributeBasedClassifier',

		'it creates attribute classifiers':function(){

			var c = getClassifierInstance();

			var colorClassifierCreated = false;
			var sizeClassifierCreated = false;

			for (var i = 0; i < c.classifiers.length; i++) {
				let ithClassifier = c.classifiers[i];

				if(ithClassifier.definition == "productAttribute.color"){
					colorClassifierCreated = true;
				}

				if(ithClassifier.definition == "productAttribute.size1"){
					sizeClassifierCreated = true;
				}
			}

			var actual = colorClassifierCreated && sizeClassifierCreated;
			var expected = true;
			var message = 'classifiers should be created for both color and size'; 
			assert.equal(actual,expected,message);
		}
	});
});