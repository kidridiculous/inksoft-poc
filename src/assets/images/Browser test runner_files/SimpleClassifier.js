define(function (require) {
  var registerSuite = require('intern!object');
  var assert = require('intern/chai!assert');
  var SimpleClassifier = require('classification/SimpleClassifier');
  var DefinitionTable = require('service/DefinitionTable')

  var getExactClassifier = function() { return new SimpleClassifier({strictness:SimpleClassifier.Matching.EXACT}); }
  var keywords = ['Add To Cart', 'Add To Bag', ' Exp Month', 'CVV '];

  registerSuite({
    name: 'SimpleClassifier',

    'it determines unique classifications':function(){

      var c = getExactClassifier();

      var testElement = {
        classification:[
          'shippingAddressLine1',
          'billingAddressLine1'
        ],
        center:{
          x:100,
          y:100
        },
        xmin:95,
        xmax:105,
        ymin:95,
        ymax:105
      };

      var potentialContextElements = [
      {
        tokens:['derp', 'burp', 'shipping'],
        isText:true,
        center:{
          x:90,
          y:75
        },
        xmin:85,
        xmax:95,
        ymin:65,
        ymax:85
      },
      {
        tokens:['apple', 'banana', 'billing', 'billing address'],
        isText:true,  
        center:{
          x:90,
          y:55
        },
        xmin:80,
        xmax:100,
        ymin:45,
        ymax:65
      }];

      var testElementOutput = c.determineUniqueClassification(testElement, potentialContextElements);

      //console.log('testElementOutput : ' + JSON.stringify(testElementOutput,null,4));

      var actual = (typeof testElementOutput.correctClassification !== 'undefined') && 
                    (testElementOutput.correctClassification.classification === 'shippingAddressLine1');

      var expected = true;

      var message = 'expects a property on the testElementOutput object that is an array with one element'; 

      assert.deepEqual(actual,expected,message);

    },

    'it matches classifications to context tags':function(){

      var DefinitionTableInstance = new DefinitionTable();

      this.definitionTable = DefinitionTableInstance.definitions;

      var c = getExactClassifier();

      var testElement = {
        classification:[
          'shippingAddressLine1',
          'billingAddressLine1'
        ]  
      };

      var contextElement = {
        tokens:['derp', 'burp', 'shipping']
      };

      var output = c.matchClassificationToContextTag(testElement, contextElement);


      //console.log('output : ' + JSON.stringify(output,null,4));

      var actual = output.classification;

      var expected = 'shippingAddressLine1';

      var message = 'should find a matching context tag'; 

      assert.deepEqual(actual,expected,message);

    },

    'it gets tokens from element text':function(){

      var element1 = {
        placeholder:'placeholder',
        buttontext:'buttontext_',
        id:'thisistheElementid',
        name:'button-thing',
        title:'',
        className:'thisIsTheButton-Clickit',
        innerHTML:'<label for="signInEmailAddress">Email address<span class="cssHide"></span></label>',
        innerText:'Email Address',
        htmlFor:'',
        type:'label',
        value:''
      };


      var elements = [element1];
      
      var c = getExactClassifier();
      
      var actual = c.getTokensFromElementText(elements);
      //console.log('actual, elements with tokens : ' + JSON.stringify(actual,null,4) );

      var firstElementActualTokens = actual[0].tokens;

      var firstElementExpectedTokens = [
          "placeholder",
          "buttontext_",
          "thisistheelementid",
          "button-thing",
          "thisisthebutton-clickit",
          "email address"
      ];

      //console.log('firstElementActualTokens : ' + JSON.stringify(firstElementActualTokens,null,4));

      var message = 'expected correct tokens from each element';

      assert.deepEqual(firstElementActualTokens, firstElementExpectedTokens, message);
    },


  	'it sanitizes text': function() {
  		var c = getExactClassifier();

  		var result = c.sanitize(' Add To Cart ', []);

  		assert.equal(result[0], 'add to cart',
  			'SimpleClassifer sanitizes text');
  	},
  	'it does exact matching': function() {
  		var c = getExactClassifier();

  		var result = c.exactMatch('add to cart', 'add to cart');

  		assert.equal(result, true,
  			'Should match exactly');
  	},
  	'it doesn\'t exactly match': function() {
  		var c = getExactClassifier();

  		var result = c.exactMatch('add to cart', 'add to bag');

  		assert.equal(result, false,
  			'Exact matching should fail');
  	},
  	'it uses Exact matching setting': function() {
  		var c = getExactClassifier();

  		var result = c.matchText('add to cart', 'add to cart', SimpleClassifier.Matching.EXACT);
  		assert.equal(result, true,
        'SimpleClassifier should match by setting');

  	},
  	'it extracts text': function() {
  		var c = getExactClassifier();
  		var el = { placeholder : 'Checkout'};
  		var result = c.extractElementText(el);
  		assert.equal(result[0], 'checkout',
        'SimpleClassifier extract text');

  	},
  	'it classifies by placeholder': function () {
      var c = getExactClassifier();
      var el = { placeholder : 'Add To Cart'};
      var elements = [];
      elements.push(el);

      var result = c.matchByKeywords(elements, keywords);

      assert.equal(result.length, 1,
        'SimpleClassifier should match by element placeholder');
    },
    'it matches by buttontext': function () {
      var c = getExactClassifier();
      var el = { buttontext : 'Add To Cart'};
      var elements = [];
      elements.push(el);

      var result = c.matchByKeywords(elements, keywords);

      assert.equal(result.length, 1,
        'SimpleClassifier should match by element placeholder');
    },
    'it matches with case insensitivity': function () {
      var c = getExactClassifier();
      var el = { placeholder : 'aDD to cArT'};
      var elements = [];
      elements.push(el);

      var result = c.matchByKeywords(elements, keywords);

      assert.equal(result.length, 1,
        'SimpleClassifier should find one match');
    },
    'it matches buttons that exist': function() {
      var c = getExactClassifier();
      var scanData = { buttons:[], inputs:[] , formattedElements:[]};
      var btn = { buttontext: 'Add to Bag'}
      scanData.formattedElements.push(btn);
      c.update(scanData);
  
      var result = c.hasDefinition('addToCart');

      assert.equal(result, true, 'SimpleClassifier classifies buttons');
      
    }

  });

})