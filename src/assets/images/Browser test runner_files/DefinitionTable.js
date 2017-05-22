/*
these definitions serve as the logical connection from words / phrases 
that are found in HTML elements in the dom to the actions the robot can 
take during the checkout workflow   
*/    
class DefinitionTable {

    constructor() {
        this.definitions = {
            // ============== OrderedCheckout ==============
            // -------------- guest checkout ---------------
            // 1 - link to view cart page
            "cartLink": {
                "keyWords": [
                    "bag",
                    "shopping bag",
                    "my-bag",
                    "checkout",
                    "my cart",
                    "view bag",
                    "brown bag",
                    "cart",
                    "my cart / checkout",
                    "view shopping cart",
                    "view cart",
                    "my bag",
                    "basket",
                    "your cart",
                    "go to shopping bag"
                ],
                "tags": [],
                "negativeWords": [
                    "visa checkout by visa",
                    "btnLogin_Checkout"
                ],
                "classifier": 'KeywordClassifier'
            },
            // 2 - button/link action to proceed from the cart to the checkout process
            "continueToCheckout": {
                "keyWords": [
                    'proceed to checkout',
                    'continue to checkout'
                ],
                "negativeWords": [],
                "tags": [],
                "classifier": 'KeywordClassifier'
            },
            // 3 - option select action to checkout as guest, not create an account or sign in
            "selectGuestCheckout": {
                "keyWords": [
                    'checkout as guest'
                ],
                "negativeWords": [
                    'sign in',
                    'create an account',
                    'create account'
                ],
                "tags": [],
                "classifier": 'KeywordClassifier'
            },
            // 4 - continue as guest action/link, move on to shipping/billing details
            "continueAsGuest": {
                "keyWords": [
                    'continue',
                    'continue as guest',
                    'begin guest checkout',
                    'submit to begin quest checkout'
                ],
                "negativeWords": [
                    'sign in',
                    'create',
                    'create an account',
                    'create account'
                ],
                "tags": [],
                "classifier": 'KeywordClassifier'
            },
            // -------------- guest information ---------------
            "email": {
                "keyWords": [
                    "email",
                    "email:",
                    "email address",
                    "e-mail",
                    "e-mail address",
                    "email address",
                    "useremail",
                    "guestEmail"
                ],
                "negativeWords":[
                    "ibEmailAddress",
                    "txtLoginEmailAddress",
                    "btn-email-subscribe",
                    "AEO Emails",
                    "Aerie Emails",
                    "email-subscription",
                    "email-sign-up-body",
                    "login.emailAddress",
                    "SIGN UP FOR EMAIL"
                ],
                "tags": [],
                "classifier": "FormInputClassifier"
            },
            // ------------- shipping information ----------
            "shippingFirstName": {
                "keyWords": [
                    "first name",
                    "firstname",
                    "shippingfirstname",
                    "enter first name"
                ],
                "tags": ['shipping', '2. select shipping address'],
                "classifier": "FormInputClassifier"
            },
            "shippingLastName": {
                "keyWords": [
                    "last name",
                    "lastname",
                    "shippinglastname",
                    "lname",
                    "enter last name"
                ],
                "tags": ['shipping', '2. select shipping address'],
                "classifier": "FormInputClassifier"
            },
            "shippingAddressLine1": {
                "keyWords": [
                    "address",
                    "street address",
                    "house number and street",
                    "address 1",
                    "street address 1",
                    "street address",
                    "address line 1",
                    "street",
                    "street address / p.o. box",
                    "address Line 1",
                    "address / po box",
                    "streetaddress",
                    "enter address line one"
                ],
                "tags": [
                    'shipping', '2. select shipping address'
                ],
                "classifier": "FormInputClassifier"
            },
            "shippingAddressLine2": {
                "keyWords": [
                    "apt / bldg / other",
                    "apt / suite",
                    "apt #, floor, etc. (optional)",
                    "address line 2",
                    "address 2 (optional)",
                    "street address 2",
                    "address 2",
                    "address line 2 (optional)",
                    "apt/unit",
                    "address 2 (optional)",
                    "shippingaddressline2",
                    "enter address line two"
                ],
                "tags": [
                    'shipping', '2. select shipping address'
                ],
                "classifier": "FormInputClassifier"
            },
            "shippingCity": {
                "keyWords": [
                    "city",
                    "city or apo/fpo",
                    "town/city",
                    "shippingcity",
                    "shippingaddressfieldgroup4-shippingcity",
                    "enter city"
                ],
                "tags": ['shipping','2. select shipping address'],
                "classifier": "FormInputClassifier"
            },
            "shippingZipCode": {
                "keyWords": [
                    "postal code",
                    "zip/postal code",
                    "zip code",
                    "zip",
                    "zip/postal",
                    "shippingpostalcode",
                    "ZIP code",
                    "zip/postal code",
                    "enter postal code"
                ],
                "tags": ['shipping', '2. select shipping address'],
                "classifier": "FormInputClassifier"
            },
            "shippingState": {
                "keyWords": [
                    "state",
                    "state/province",
                    "state/province/region",
                    "shippingstate",
                    "shippingaddressfieldgroup4-shippingstate",
                    "select state"
                ],
                "tags": ['shipping', '2. select shipping address'],
                "negativeWords": ["billingaddress.address.stateselect"],
                "classifier": "StateClassifier",
            },
            "shippingCountry": {
                "keyWords": [
                    "country",
                    "country/region",
                    "country or apo/fpo/dpo",
                    "select your country",
                    "countries"
                ],
                "tags": ['shipping', '2. select shipping address']
            },
            "shippingPhone": {
                "keyWords": [
                    "phone",
                    "telephone",
                    "phone number",
                    "day phone include area code",
                    "daytime phone",
                    "primary billing phone",
                    "shippingdayphone",
                    "delivery phone number",
                    "phone (optional)",
                    "phone eg. 1234567890",
                    'enter phone number'
                ],
                "tags": [],
                "negativeWords":[
                        "ext",
                        "ext.",
                        "Ext",
                        "Ext.",
                        "billingaddress.phone"
                    ],
                "classifier": "PhoneInputClassifier"
            },
            "shippingUseThisAddress": {
                "keyWords": [
                    "choose this address",
                    "use this address"
                ],
                "negativeWords": [],
                "classifier": 'KeywordClassifier'
            },
            "shippingContinue": {
                "keyWords": [
                    "continue"
                ],
                "negativeWords": [],
                "classifier": 'KeywordClassifier'
            },
            "continueToBilling": {
                "keyWords": [
                    "continue checkout"
                ],
                "negativeWords": [],
                "classifier": 'FormInputClassifier'
            },
            // ------------- payment information -----------
            "selectPaymentMethod": {
                "keyWords": [
                    'select payment type',
                    'add new credit card...'
                ],
                "negativeWords": [],
                "tags": [],
                "classifier": 'SelectOneClassifier'
            },
            "cardType": {
                "keyWords": [
                    "card type",
                    "cardtype",
                    "type",
                    "credit card type",
                    "card-type",
                    "ccType",
                    "crdType",
                    "creditCard"
                ],
                "tags": [],
                "classifier": 'SelectOneClassifier'
            },
            "creditCardNumber": {
                "keyWords": [
                    "card number",
                    "card number:",
                    "card #",
                    "credit card number",
                    "enter your credit card number",
                    "card number (no dashes or spaces)",
                    "please enter your credit card number",
                    "credit card #",
                    "ccNumber",
                    "crdNumbr",
                    "enter card number"
                ],
                "tags": [],
                "classifier": "FormInputClassifier"
            },
            "creditCardCode": {
                "keyWords": [
                    "security code",
                    "cvv",
                    "cvv2",
                    "csc",
                    "ccid",
                    "ccPin",
                    "ccvnc",
                    "enter security code",
                    "security code"
                ],
                "tags": [],
                "classifier": "FormInputClassifier"
            },
            "expirationMonth": {
                "keyWords": [
                    "exp month",
                    "exp. month",
                    "expirationmonth",
                    "month",
                    "expiration",
                    "expires",
                    "mm",
                    "choose a month",
                    "expiration date",
                    "mm month",
                    "exp-month",
                    "expiration-month",
                    "ccExpireMonth",
                    "cardExpDateMo",
                    "select expiration month"
                ],
                "negativeWords": [],
                "tags": ["credit card", "payment method", "payment methods"],
                "classifier": "ExpMonthClassifier",
            },
            "expirationYear": {
                "keyWords": [
                    "exp year",
                    "exp. year",
                    "expirationyear",
                    "year",
                    "YYYY",
                    "expiration",
                    "expiration year",
                    "yy year",
                    "exp-year",
                    "expiration-year",
                    "ccExpireYear",
                    "cardExpDateYear",
                    "select expiration year"
                ],
                "negativeWords": [],
                "tags": ["credit card", "payment method", "payment methods"],
                "classifier": "ExpYearClassifier"
            },
            // ------------- billing information -----------
			"editBillingAddress": {
                "keyWords": [],
                "negativeWords": [],
                "classifier": 'KeywordClassifier'
            },
            "billingFirstName": {
                "keyWords": [
                    "first name",
                    "firstname",
                    "billfirstname",
                    "fName",
                    "billFname",
                    "enter first name"
                ],
                "tags": ['billing address','1. enter billing address'],
                "classifier": "FormInputClassifier"
            },
            "billingLastName": {
                "keyWords": [
                    "last name",
                    "lastname",
                    "billlastname",
                    "lName",
                    "billLname",
                    "enter last name"
                ],
                "tags": ['billing address','1. enter billing address'],
                "classifier": "FormInputClassifier"
            },
            "billingAddressLine1": {
                "keyWords": [
                    "address",
                    "street address",
                    "house number and street",
                    "address 1",
                    "street address 1",
                    "address line 1",
                    "street",
                    "street address po box",
                    "address po box",
                    "billaddress1",
                    "billAddr1",
                    "enter address line one"
                ],
                "tags": [
                    'address line 1:',
                    'billing address',
                    '1. enter billing address',
                ],
                "classifier": "FormInputClassifier"
            },
            "billingAddressLine2": {
                "keyWords": [
                    "apt bldg other",
                    "apt suite",
                    "apt floor etc optional",
                    "address line 2",
                    "address 2 optional",
                    "street address 2",
                    "address 2",
                    "address line 2 optional",
                    "aptunit",
                    "apt suite",
                    "billaddress2",
                    "billAddr2",
                    "enter address line two",
                    "address line 2 (optional)"
                ],
                "tags": ['address line 2:', 'billing address', '1. enter billing address'],
                "classifier": "FormInputClassifier"
            },
            "billingCity": {
                "keyWords": [
                    "city",
                    "city or apofpo",
                    "towncity",
                    "billcity",
                    "billCity",
                    "enter city"
                ],
                "tags": [
                    'billing address','1. enter billing address'
                ],
                "classifier": "FormInputClassifier"
            },
            "billingState": {
                "keyWords": [
                    "state",
                    "states",
                    "stateprovince",
                    "stateprovinceregion",
                    "billstate",
                    "state/province",
                    "select state"
                ],
                "tags": [
                    'billing address', "bill to",'1. enter billing address'
                ],
                "classifier": "StateClassifier"
            },
            "billingZipCode": {
                "keyWords": [
                    "postal code",
                    "zippostal code",
                    "zip code",
                    "zip",
                    "zippostal",
                    "billpostalcode",
                    "billZip",
                    "zip/postal code",
                    "enter postal code"
                ],
                "tags": [
                    'billing address','1. enter billing address'
                ],
                "classifier": "FormInputClassifier"
            },
            "billingAddressType": {
                "keyWords": [],
                "tags": [
                    "billing address"
                ],
                "classifier": "FormInputClassifier"
            },
            "billingCountry": {
                "keyWords": [
                    "country",
                    "country region",
                    "country or apofpodpo",
                    "select your country",
                    "select country"
                ],
                "tags": ['billing address', '1. enter billing address'],
                "classifier": "FormInputClassifier"
            },
            "billingPhone": {
                "keyWords": [
                    "phone",
                    "phone 555 555 5555",
                    "phone: (555 555 5555)",
                    "phone: (555-555-5555)",
                    "telephone",
                    "phone number",
                    "day phone include area code",
                    "billing phone",
                    "daytime phone",
                    "primary billing phone",
                    "billhomephone",
                    "day phone (include area code)",
                    "billPhone",
                    "phone eg. 1234567890",
                    "enter phone number"
                ],
                "tags": [],
                "negativeWords":[
                        "ext",
                        "ext.",
                        "Ext",
                        "Ext."
                    ],
                "classifier": "PhoneInputClassifier"
            },
            "continueToFinalize": {
                "keyWords": ['apply credit card', 'continue'],
                "negativeWords": [],
                "tags": [],
                "classifier": "KeywordClassifier"
            },
            // ------------------ finalize -----------------
            "shippingCost": {
                "keyWords": [
                    'shipping & handling',
                    'shipping',
                    'shipping:',
                    'shipping charges',
                    'estimated shipping and handling',
                    'estimated shipping:',
                    'estimated shipping',
                    'shipping & handling:'
                ],
                "tags": [],
                "negativeWords":[],
                "classifier": "KeywordValueClassifier"
            },
            "taxCost": {
                "keyWords": [
                    'estimated tax',
                    'estimated tax:',
                    'tax:', 
                    'tax',
                    'estimated sales tax',
                    'estimated sales tax:',
                    'sales tax',
                    'sales tax:'
                ],
                "tags": [],
                "negativeWords":[],
                "classifier": "KeywordValueClassifier"
            },
            "totalCost": {
                "keyWords": [
                    'order total',
                    'order total:',
                    'estimated order total',
                    'total cost',
                    'your order total',
                    'your order total:'
                ],
                "tags": [],
                "negativeWords":[],
                "classifier": "KeywordValueClassifier"
            },
            "placeOrder": {
                "keyWords": [
                    "looks good, place my order",
                    "complete order",
                    "submit to complate order"
                ],
                "tags": [],
                "classifier": "KeywordClassifier"
            },
            // =============================================
            "userName": {
                "keyWords": [
                    "login"
                ],
                "tags": [],
                "negativeWords":[
                    "login.password"
                ],
                "classifier": "FormInputClassifier"
            },
            "passWord": {
                "keyWords": [
                    "password"
                ],
                "tags": [],
                "classifier": "FormInputClassifier"
            },
            "fullName": {
                "keyWords": [],
                "tags": [],
                "classifier": "FormInputClassifier"
            },
            "firstName": {
                "keyWords": [
                    "first name",
                    "firstname",
                    "shippingfirstname",
                    "billfirstname",
                    "shippingaddressfieldgroup4-shippingfirstname",
                    "fName",
                    "billFname"
                ],
                "tags": [],
                "classifier": "FormInputClassifier"
            },
            "lastName": {
                "keyWords": [
                    "last name",
                    "lastname",
                    "shippinglastname",
                    "billlastname",
                    "shippingaddressfieldgroup4-shippinglastname",
                    "lName",
                    "billLname"
                ],
                "tags": [],
                "classifier": "FormInputClassifier"
            },
            "deliveryPOBox": {
                "keyWords": [
                    "this is a p.o. box"
                ],
                "tags": [],
                "classifier": "FormInputClassifier"
            },
            "shippingMethod": {
                "keyWords": [
                    "shipping method",
                    "how to send it?",
                    "select shipping options",
                    "shipping options (estimated)",
                    "shipping",
                    "shipping options",
                    "please select a shipping option",
                    "select method*",
                    "select a shipping option",
                    "choose a handling method",
                    "shipping / delivery options ( estimates )"
                ],
                "tags": [
                    "shipping"
                ]
            },
            "paymentMethod": {
                "keyWords": [
                    "payment",
                    "credit card",
                    "pay with a credit card",
                    "choose a payment method",
                    "credit"
                ],
                "tags": [],
                "negativeWords":[
                    "brand-bar"
                ]

            },
            "dateOfBirth": {
                "keyWords": [],
                "tags": []
            },
            "cardholderName": {
                "keyWords": [
                    "cardholders name",
                    "name on card",
                    "name (as it appears on your card)"
                ],
                "tags": []
            },
            "cardholderFirstName": {
                "keyWords": [
                    "first name"
                ],
                "tags": [],
                "classifier": "FormInputClassifier"
            },
            "cardholderLastName": {
                "keyWords": [
                    "last name"
                ],
                "tags": [],
                "classifier": "FormInputClassifier"
            },
            "creditCardExpiration": {
                "keyWords": [
                    "expiration",
                    "expiration date",
                    "card expiration date",
                    "expire date",
                    "expires"
                ],
                "tags": [],
                "classifier": "FormInputClassifier"
            },
            "expirationMonth": {
                "keyWords": [
                    "exp month",
                    "exp. month",
                    "expirationmonth",
                    "month",
                    "expiration",
                    "expires",
                    "mm",
                    "choose a month",
                    "expiration date",
                    "mm month",
                        "exp-month",
                        "expiration-month",
                        "ccExpireMonth",
                        "cardExpDateMo"
                ],
                "tags": ["credit card", "payment method", "payment methods"],
                "classifier": "ExpMonthClassifier",
                "negativeWords": [],
            },
            "expirationYear": {
                "keyWords": [
                    "exp year",
                    "exp. year",
                    "expirationyear",
                    "year",
                    "YYYY",
                    "expiration",
                    "expiration year",
                    "yy year",
                        "exp-year",
                        "expiration-year",
                        "ccExpireYear",
                        "cardExpDateYear"
                ],
                "tags": ["credit card", "payment method", "payment methods"],
                "classifier": "ExpYearClassifier",
                "negativeWords": []
            },
            "optOut": {
            "keyWords":
                [ 'Be an A&F insider: sign up for emails about new trends and great offers',
                    'yes! send me e-mail updates about the latest trends, products and promotions online and in store',
                    'Send me e-mail updates about the latest trends',
                    'sign up for emails',
                    'subscribe',
                    "btn-email-subscribe",
                    "AEO Emails",
                    "Aerie Emails",
                    "email-subscription"],
            "tags": [],
            "negativeWords":[
                "email address",
                "e-mail",
                "e-mail address",
                "useremail",
                "guestEmail",
                "ibEmailAddress",
                "txtLoginEmailAddress",
                "email-sign-up-body",
                "login.emailAddress",
                "SIGN UP FOR EMAIL"]
            },
            "phoneNumber": {
                "keyWords": [
                    "telephone",
                    "phone number",
                    "day phone include area code",
                    "billing phone",
                    "daytime phone",
                    "primary billing phone",
                    "shippingdayphone",
                    "billhomephone",
                    "day phone (include area code)",
                    "billPhone",
                    "phone eg. 1234567890"
                ],
                "tags": [],
                "negativeWords":[
                        "ext",
                        "ext.",
                        "Ext",
                        "Ext."
                    ],
                "classifier": "PhoneInputClassifier"
            },
            "billingEmail": {
                "keyWords": [
                    "email",
                    "email address",
                    "billing email",
                    "purchaser's email",
                    "billemailaddress",
                    "e-mail"
                ],
                "tags": [
                    "billing"
                ],
                "classifier": "FormInputClassifier"
            },
            "billingConfirmEmail": {
                "keyWords": [
                    "confirm email",
                    "email"
                ],
                "tags": [
                    "billing"
                ],
                "classifier": "FormInputClassifier"
            },
            "addToCart": {
                "keyWords": [
                    "add to bag",
                    "Add To Bag",
                    "Add to Bag",
                    "addToBag",
                    "add-to-bag",
                    "add to cart",
                    "add to shopping bag",
                    "add to brown bag",
                    "add",
                    "add to package / add to cart",
                    "product-page-add-to-bag__button"
                ],
                "tags": [],
                "classifier": "AddToCartClassifier"
            },
            "viewCart": {
                "keyWords": [],
                "tags": []
            },
            "quantity": {
                "keyWords": [
                    "qty",
                    "quantity",
                    "select quantity",
                    "qty:",
                    "enter quantity"
                ],
                "tags": []
            },
            "cartQuantity": {
                "keyWords": [
                    "qty",
                    "quantity"
                ],
                "tags": ["cart"]
            },
            "checkout1": {
                "keyWords": [
                    "checkout",
                    "continue checkout",
                    "continue",
                    "review order",
                    "begin checkout",
                    "next step",
                    "save and go to payment",
                    "continue to billing",
                    "place order",
                    "submit order",
                    "proceed to payment",
                    "next - payment options",
                    "cartTopProceedButton"
                ],
                "tags": [],
                "negativeWords":[
                    "visa checkout by visa",
                    "visa",
                    "visa checkout",
                    "paypal",
                    "PayPal",
                    "Check Out with PayPal",
                    "Pay with PayPal"
                ]
            },
            "checkout2": {
                "keyWords": [
                    "go to payment",
                    "complete order",
                    "continue to payment",
                    "continue",
                    "submit order",
                    "place order",
                    "review order"
                ],
                "tags": []
            },
            "checkout4": {
                "keyWords": [
                    "review your order",
                    "place your order",
                    "submit order"
                ],
                "tags": []
            },
            "checkoutAsGuest": {
                "keyWords": [
                    "guest and new customer",
                    "continue as guest",
                    "I want to checkout as a guest with the option to create an account later",
                    "checkout as guest",
                    "checkout as a guest",
                    "continue",
                    "continue checkout",
                    "guest checkout",
                    "buy as a guest",
                    "continue as guest"
                ],
                "tags": []
            },
            "continue1":{
                "keyWords":[
                    "continue"
                ],
                "tags":[]
            },
            "continue2":{
                "keyWords":[
                    "continue"
                ],
                "tags":[]
            },
            "continue3":{
                "keyWords":[
                    "continue"
                ],
                "tags":[]
            },
            "giftCard": {
                "keyWords": [
                    "use a gift card",
                    "gift card or ps rewards certificate number",
                    "have a gift card  gift card number",
                    "gift card number",
                    "belk gift card number",
                    "add a reward card or gift card",
                    "gift card number or savings code",
                    "16 digit gift card number",
                    "gift card code",
                    "code",
                    "giftcard number",
                    "card",
                    "card number",
                    "enter your 16 digit gift card number"
                ],
                "tags": []
            },
            "giftCardPIN": {
                "keyWords": [],
                "tags": []
            },
            "CAPTCHA": {
                "keyWords": [],
                "tags": []
            },
            "coupon": {
                "keyWords": [],
                "tags": []
            },
            "couponEmail": {
                "keyWords": [],
                "tags": []
            },
            "orderNumber/trackingNumber": {
                "keyWords": [],
                "tags": []
            },
            "billingSameAsShipping": {
                "keyWords": ["use my shipping address"],
                "tags":[]
            },
            "billingDiffShipping": {
                "keyWords": ["bill to a different address"],
                "tags":[]
            },
            "shippingSameAsBilling": {
                "keyWords": ["use my billing address"],
                "tags":[]
            },
            "shippingDiffBilling": {
                "keyWords": ["ship to a different address"],
                "tags":[]
            }
        }
    }
}

if (typeof define !== 'undefined') {
    define('service/DefinitionTable',[], function() {
        return DefinitionTable;
    });            
}

if (typeof angular !== 'undefined') {
    // the variable is defined
    angular.module('robotApp').factory('DefinitionService', [function() {
        var defs = new DefinitionTable().definitions;

        function _getDefinitions() {
            return Object.keys(defs);
        }

        function _getByName(name) {
            return defs[name];
        }

        return {
            getDefinitions: _getDefinitions,
            getByName: _getByName
        };
    }]);
}
