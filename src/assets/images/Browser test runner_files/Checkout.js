define(function (require) {
  var registerSuite = require('intern!object');
  var assert = require('intern/chai!assert');
  var Checkout = require('goal/Checkout');

  var purchaseData = {
		"giftcards": [],
	    "account": {},
	    "card": {
	    	"address": {
				"addressId":12345, 
		    	"userId": 1245, 
		    	"createTime": 123, 
		    	"lastUpdateTime":123, 
		    	"lastUseTime":123, 
		    	"removeTime":123, 
		    	"firstName": "BillingFirstName", 
		    	"middleName": "BillingMiddleName", 
		    	"lastName": "BillingLastName", 
		    	"title": "TestTitle", 
		    	"organization": "TestOrganization", 
		    	"address1": "555 Billing Street", 
		    	"address2": "apt 1", 
		    	"city": "Flagstaff", 
		     	"state": "AZ", 
		    	"postal": "86001", 
		    	"country": "US", 
		    	"phone": "7777777777", 
		    	"email": "Billing@email.com", 
		    	"phoneAreaCode": "928", 
		    	"phoneExCode": "", 
		    	"phoneSubCode": "" 
	    	},
	    	"number": "4539813029361472", 
	    	"name": "TestCardName", 
	    	"cardId": 12345, 
	    	"valid": true,
	    	"type": 1, 
	    	"retailerId": 3, 
	    	"userId": 12345, 
	    	"brand": "Visa", 
	    	"year": 2017, 
	    	"month": 1, 
	    	"createTime": 1478609834, 
	    	"lastUseTime": 1478609834, 
	    	"removeTime": 1478609834 
	    },
	    "shippingAddress":{
			"addressId":12345, 
	    	"userId": 1245, 
	    	"createTime": 123, 
	    	"lastUpdateTime":123, 
	    	"lastUseTime":123, 
	    	"removeTime":123, 
	    	"firstName": "ShippingFirstName", 
	    	"middleName": "ShippingMiddleName", 
	    	"lastName": "ShippingLastName", 
	    	"title": "ShippingTitle", 
	    	"organization": "ShippingOrganization", 
	    	"address1": "444 Shipping Street", 
	    	"address2": "apt 0", 
	    	"city": "Flagstaff", 
	     	"state": "AZ", 
	    	"postal": "86001", 
	    	"country": "US", 
	    	"phone": "5555555555", 
	    	"email": "Shipping@email.com", 
	    	"phoneAreaCode": "928", 
	    	"phoneExCode": "", 
	    	"phoneSubCode": "" 
	    },
	    "coupon": "", 
	    "products": [
	        {
	            "retailerId": "3",
	            "url": "https://www.ae.com/women-aeo-lace-up-hammer-boot-brown/web/s-prod/1414_9147_200?cm=sUS-cUSD&catId=cat120147",
	            "name": "AEO LACE-UP HAMMER BOOT",
	            "price": 41.97,
	            "picture": "https://pics.ae.com/is/image/aeo/1414_9147_200_f?$pdp-main$",
	            "xid": "",
	            "wid": "",
	            "quantity": "2",
	            "attributes": {
	              "color": {
	                "label": "black",
	                "title": "Color",
	                "value": "black",
	                "icon":"//pics.ae.com/is/image/aeo/1414_9147_001_s"
	              },
	              "size1": {
	                "label": "6",
	                "title": "Size",
	                "value": "6"
	              }
	            }
	        }
	    ], 
	    "shippingOption": {
	    	"value": "#F",
	    	"cost": 0
	    },
	    "module": "guest",
	    "securityCode": "SecurityCodeString",
	    "buyer":0,
	    "orderId":0
	};

	var expected = {
		phoneNumber:"7777777777", 
		email:"Billing@email.com",
		shippingFirstName:"ShippingFirstName",
		shippingLastName:"ShippingLastName",
		shippingAddressLine1:"444 Shipping Street",
		shippingCity:"Flagstaff",
		shippingState:"AZ",
		shippingZipCode:"86001",
		shippingAddressLine2:"apt 0",
		shippingEmail:"Shipping@email.com",
		shippingPhone:"5555555555",
		billingFirstName: "BillingFirstName",
		billingLastName:"BillingLastName",
		billingAddressLine1:"555 Billing Street",
		billingCity:"Flagstaff",
		billingState:"AZ",
		billingZipCode:"86001",
		billingAddressLine2:"apt 1",
		billingEmail:"Billing@email.com",
		billingPhone:"7777777777",
		cardholderName:"BillingFirstName BillingLastName",
		cardholderFirstName:"BillingFirstName",
		cardholderLastName:"BillingLastName",
		creditCardNumber:"4539813029361472",
		creditCardExpiration:"2017-1",
		cardType:1,
		expirationMonth:1,
		expirationYear:2017,
		creditCardCode:'111'
	};	 	

	var cout = new Checkout(purchaseData)
	registerSuite({
	name: 'Checkout',
	'it verifies data for all resolvers': function () {
		this.skip('Needs refactoring into individual tests');
		var expectedKeys = Object.keys(expected);

		var actual = true;

		for (var i = 0; i < expectedKeys.length; i++) {

			let ithKey = expectedKeys[i];

			let ithActual = cout.resolvers[ithKey].data;

			let ithExpected = expected[ithKey];

			let ithBool = ithActual === ithExpected;

			console.log('match : ' + ithBool + ', ithActual : ' + ithActual + ' , ithExpected : ' + ithExpected);

			actual = actual && ithBool;
		}

		var message = 'data in resolvers should match';

	    assert.equal(actual, true, message);
	},
	'popups are sorted to the bottom': function() {
		const goal = new Checkout(purchaseData);
		const mockPopup = { definition:'popup', getElement:() => {return {center:{x:100,y:50}};}};
		const mockBtn = { definition:'basicButton', getElement:() => {return {center:{x:100,y:100}};}};

		let cls = [mockPopup, mockBtn, mockBtn, mockBtn];
    
    	goal.sortClassifiers(cls);

    	assert.strictEqual(cls[3], mockPopup);
		

	},
	'popups stay at the bottom': function() {
		const goal = new Checkout(purchaseData);
		const mockPopup = { definition:'popup', getElement:() => {return {center:{x:100,y:200}};}};
		const mockBtn = { definition:'basicButton', getElement:() => {return {center:{x:100,y:100}};}};

		let cls = [mockBtn, mockPopup, mockBtn];
    
    	goal.sortClassifiers(cls);

    	assert.strictEqual(cls[2], mockPopup);
		

	}


	});

})