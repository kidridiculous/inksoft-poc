define('goal/Checkout', 
	['task/TaskFactory',
		'use-model/UseModelResolver',
		'use-model/SelectOneResolver',
		'use-model/StateResolver',
		'use-model/ExpMonthResolver',
		'use-model/PlaceOrderResolver',
		'use-model/ShipToBillToSame',
		'use-model/ShipToBillToDifferent',
    	'use-model/BillToShipToSame',
		'use-model/BillToShipToDifferent',
		'use-model/PhoneResolver',
    	'use-model/CardTypeResolver',
    	'use-model/CreditCardNumberResolver',
		'use-model/ZipCodeResolver',
	 	'goal/AbstractGoal',
		'classification/ScanClassifier',
		'use-model/ReadingUseModelResolver',
    'use-model/OptOut'],
	function(TaskFactory, 
		UseModelResolver,
		SelectOneResolver,
		StateResolver,
		ExpMonthResolver,
		PlaceOrderResolver,
		ShipToBillToSame,
		ShipToBillToDifferent,
		BillToShipToSame,
		BillToShipToDifferent,
		PhoneResolver,
		CardTypeResolver,
		CreditCardNumberResolver,
		ZipCodeResolver,
		AbstractGoal,
		ScanClassifier,
		ReadingUseModelResolver,
		OptOut) {

/*
	this goal should start immediately after the add-to-bag button is clicked

	but, 

	there is no url to represent the product-in-cart state ,
	so for debugging,

	starting from the cart page with the product in the cart:
		1) click the checkout button
		2) validate page load ? can we know that url? is it enough that we get a page load?
		3) firstname
		4) lastname
		5) address line 1
		6) address line 2
		7) city
		8) state
		9) zip ( postal in this case )
		10) click continue 
*/
	
	class Checkout extends AbstractGoal {

		constructor(purchaseData) {
			super();

			this.purchaseData = purchaseData;
			this.shippingInfo = purchaseData.shippingAddress;
			this.billingInfo = purchaseData.card.address;
			this.card = purchaseData.card;
			this.submit = purchaseData.submit || false;

			// this.userData = {
			// 	firstName:'Frank',
			// 	lastName: 'Sinatra',
			// 	addressLine1: '1400 Delaware st',
			// 	addressLine2: '',
			// 	city:'Berkeley',
			// 	state: 'CA',
			// 	email:'frank@sinatra.com',
			// 	zipCode: '94702',
			// 	phoneNumber: '5102134567'
			// };

			this.giftCards = [{cardNumber:'4111111111111111', cardPin:'9999'}];

			this.createProcessor();
			
			this.createResolvers(purchaseData);
		}

		createProcessor() {
			this.classifier = new ScanClassifier();
		}
		
		createResolvers() {
			this.createShippingAddressResolvers();
			this.createBillingAddressResolvers();
			this.createCheckoutFlowResolvers();
			this.createPaymentResolvers();
			this.createReadingResolvers();
			this.createGenericResolvers();

			this.addResolver(this.createResolver('billingConfirmEmail', this.billingInfo.email));
			this.addResolver(new PhoneResolver({ definition: 'phoneNumber', data: this.billingInfo.phone }));

			let emailResolver = this.createResolver('email',this.billingInfo.email);
			emailResolver.useOnce = false;
			this.addResolver(emailResolver);

      		this.addResolver(new OptOut({definition:'optOut', data:false}));
			this.addResolver(new PlaceOrderResolver({definition:'placeOrder', submit: this.submit}));
		}

		createShippingAddressResolvers() {
			this.addResolver(this.createResolver('shippingFirstName', this.shippingInfo.firstName));
			this.addResolver(this.createResolver('shippingLastName', this.shippingInfo.lastName));
			this.addResolver(this.createResolver('shippingAddressLine1', this.shippingInfo.address1));
			this.addResolver(this.createResolver('shippingCity', this.shippingInfo.city));
			this.addResolver(new StateResolver({definition:'shippingState', data:this.shippingInfo.state}));
			this.addResolver(new ZipCodeResolver({definition:'shippingZipCode', data:this.shippingInfo.postal}));
			this.addResolver(new ShipToBillToSame({ definition: 'shippingSameAsBilling', data: false }));
			this.addResolver(new ShipToBillToDifferent({ definition:'shippingDiffBilling', data: true}));
			this.addResolver(this.createResolver('shippingAddressLine2', this.shippingInfo.address2));	
			this.addResolver(this.createResolver('shippingCountry', 'United States'));	
			this.addResolver(this.createResolver('shippingEmail', this.shippingInfo.email));
			this.addResolver(new PhoneResolver({ definition: 'shippingPhone', data: this.shippingInfo.phone }));
		}

		createBillingAddressResolvers() {
			this.addResolver(this.createResolver('billingFirstName', this.billingInfo.firstName));
			this.addResolver(this.createResolver('billingLastName', this.billingInfo.lastName));
			this.addResolver(this.createResolver('billingAddressLine1', this.billingInfo.address1));
			this.addResolver(this.createResolver('billingCity', this.billingInfo.city));
			this.addResolver(new StateResolver({definition:'billingState', data:this.billingInfo.state}));
			this.addResolver(new ZipCodeResolver({definition:'billingZipCode', data:this.billingInfo.postal}));
			this.addResolver(new BillToShipToSame({definition:'billingSameAsShipping', data:false}));
			this.addResolver(new BillToShipToDifferent({definition:'billingDiffShipping', data:true}));
			this.addResolver(this.createResolver('billingAddressLine2', this.billingInfo.address2));
			this.addResolver(this.createResolver('billingCountry', 'United States'));
			this.addResolver(this.createResolver('billingEmail', this.billingInfo.email));
			this.addResolver(new PhoneResolver({ definition: 'billingPhone', data: this.billingInfo.phone }));
		}

		createCheckoutFlowResolvers() {
			this.addResolver(this.createResolver('cartLink'));
			this.addResolver(new UseModelResolver({ definition: 'continueToCheckout' }));
			this.addResolver(new UseModelResolver({ definition: 'selectGuestCheckout' }));
			this.addResolver(new UseModelResolver({ definition: 'continueAsGuest' }));
			this.addResolver(new UseModelResolver({ definition: 'shippingUseThisAddress' }));
			this.addResolver(new UseModelResolver({ definition: 'continueToBilling' }));
			this.addResolver(new UseModelResolver({ definition: 'editBillingAddress' }));
			this.addResolver(new UseModelResolver({ definition: 'continueToFinalize' }));
			this.addResolver(new UseModelResolver({ definition: 'shippingContinue' }));

			// this.addResolver(this.createResolver('viewCart'));
			// this.addResolver(this.createResolver('checkout'));
			
			this.addResolver(this.createResolver('checkout1'));
			this.addResolver(this.createResolver('checkout2'));
			this.addResolver(this.createResolver('checkout3'));
			this.addResolver(this.createResolver('checkout4'));
			this.addResolver(this.createResolver('checkoutAsGuest'));
			this.addResolver(this.createResolver('continue1'));
			this.addResolver(this.createResolver('continue2'));
			this.addResolver(this.createResolver('continue3'));
			this.addResolver(this.createResolver('continue4'));
			this.addResolver(this.createResolver('continue5'));
			this.addResolver(this.createResolver('continue6'));
		}

		createGenericResolvers() {
			let basic = this.createResolver('basicButton');
			basic.useOnce = false;
			this.addResolver(basic);
			this.addResolver(this.createResolver('popup'));
		}

		createPaymentResolvers() {
			let monthString = this.card.month.toString(),
				yearString = this.card.year.toString();
			
			if (monthString.length === 1) {
				monthString = '0' + monthString;
			}

			this.addResolver(new UseModelResolver({ definition: 'selectPaymentMethod' }));
			
			this.addResolver(this.createResolver('cardholderName', this.billingInfo.firstName + ' ' + this.billingInfo.lastName));
			this.addResolver(this.createResolver('cardholderFirstName', this.billingInfo.firstName));
			this.addResolver(this.createResolver('cardholderLastName', this.billingInfo.lastName));
			this.addResolver(new CreditCardNumberResolver({ definition: 'creditCardNumber', data: this.card.number} ));
			this.addResolver(this.createResolver('creditCardExpiration', yearString + '-' + monthString));

			//Somewhere cards are not getting brand so do a little logic to try and ensure brand gets set
			//Most likely related to bad data, so putting this stop gap in place
			if (!this.card.brand) {
				let ccFirst = this.card.number.substr(0,1);
				switch(ccFirst) {
					case '3':
						this.card.brand = 'a';
					break;
					case '4':
						this.card.brand = 'v';
					break;
					case '5':
						this.card.brand = 'm';
					break;
					case '6':
						this.card.brand = 'd';
					break;
				}
			}
			
			this.addResolver(new CardTypeResolver({ definition: 'cardType', data: this.card.brand }));
			this.addResolver(this.createResolver('creditCardCode', this.purchaseData.securityCode));    //  should this be in the order data? this.card.code , or similar??
			this.addResolver(new ExpMonthResolver({ definition: 'expirationMonth', data: monthString }));
			this.addResolver(new SelectOneResolver({ definition: 'expirationYear', data: yearString }));
			this.addResolver(this.createResolver('paymentMethod', 'Credit Card'));
		}

		createReadingResolvers() {
			this.addResolver(new ReadingUseModelResolver({ definition: 'taxCost' }));
			this.addResolver(new ReadingUseModelResolver({ definition: 'shippingCost' }));
			this.addResolver(new ReadingUseModelResolver({ definition: 'totalCost' }));
		}

		addResolver(resolver) {
			this.resolvers[resolver.definition] = resolver;
		}

		sortClassifiers(classifiers) {
			// sort classifiers by their element Top-to-bottom and left-to-right but always put popup at the bottom
			classifiers.sort((a, b) => {
				const defA = a.definition,
					defB = b.definition,
					elA = a.getElement(),
					elB = b.getElement(),
					yDiff = elA.center.y - elB.center.y,
					xDiff = elA.center.x - elB.center.x;

				if ((defA === 'popup' && defB === 'popup') || (defA !== 'popup' && defB !== 'popup')) {
					return yDiff === 0 ? xDiff : yDiff;
				} else {
					// sort A Lower than B
					return defA === 'popup' ? 1 : 0;
				}
			});		
		}
	}

    return Checkout;
});
