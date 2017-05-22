define(function (require) {
  var registerSuite = require('intern!object');
  var assert = require('intern/chai!assert');
  var ScanComparer = require('vision/ScanComparer');

  function getComparer(lowResElements, highResElements) {
    return new ScanComparer(lowResElements, highResElements);
  }

  /*
    matching properties

    'id','name','className','tagName','title','imageSource','placeHolder'
  
  */
  registerSuite({
    name: 'ScanComparer',
    'Instance can be created': function () {
      
      let comparer = getComparer([],[]);

      assert.equal(comparer.constructor.name, 'ScanComparer',
        'Unable to create instance');
    }, 
    'It matches one element correctly': function() {

      let el = {tagName:'div'}, comparer = getComparer([el], [el]);

      var result = comparer.compare();

      assert.equal(comparer.foundCount, 1, 'it didn\'t find one element');
    },
    'It finds the match when the element is last in high res scan':function() {
      let el = {tagName:'div'}, comparer = getComparer([el], [{}, {}, {},el]);

      var result = comparer.compare();

      assert.equal(comparer.foundCount, 1, 'it didn\'t find one element');
    },
    'match not found when field missing':function() {
      let elNotFound = {tagName:'div'}, el ={tagName:'div', className:'css1 css2'}, comparer = getComparer([elNotFound], [el]);

      var result = comparer.compare();

      assert.equal(comparer.foundCount, 0, 'it should have 0 matches');
    },
    'match not found when field value differ':function() {
      let elNotFound = {tagName:'div', className:'css3 css4'}, el ={tagName:'div', className:'css1 css2'}, comparer = getComparer([elNotFound], [el]);

      var result = comparer.compare();

      assert.equal(comparer.foundCount, 0, 'it should have 0 matches');
    },
    'matches when in the same position':function() {
      let el1 = {tagName:'div', xmin:10, xmax:100, ymin:10, ymax:30}, 
        el2 ={ tagName:'div', xmin:10, xmax:102, ymin:11, ymax:33}, 
        comparer = getComparer([el1], [el2]);

      var result = comparer.compare();

      assert.equal(comparer.foundCount, 1, 'it should have 1 match');
    },
    'matches found using an expression':function() {
      let expressionElement = {tagName:'div', name:'', buttontext:{expression:'^\\d+$', flags:'gi'}}, 
        testEl ={ tagName:'div', name:'', buttontext:'23'};
        
      var result = ScanComparer.compareElementsByProperties(expressionElement, testEl, ['tagName', 'name', 'buttontext']);

      assert.equal(result, true, 'elements should have matched');
    },
    'null is not interpretted as an expression':function() {
      let expressionElement = {tagName:'div', name:'', buttontext:null}, 
        testEl ={ tagName:'div', name:'', buttontext:null};
        
      var result = ScanComparer.compareElementsByProperties(expressionElement, testEl, ['tagName', 'name', 'buttontext']);

      assert.equal(result, true, 'elements should have matched');
    },
    'matches not found when using an expression':function() {
      let expressionElement = {tagName:'div', name:'', buttontext:{expression:'^\\d+$', flags:'gi'}}, 
        testEl ={ tagName:'div', name:'', buttontext:'ad 23 asdf'};
        
      var result = ScanComparer.compareElementsByProperties(expressionElement, testEl, ['tagName', 'name', 'buttontext']);

      assert.equal(result, false, 'elements should not have matched');
    },

  });

})