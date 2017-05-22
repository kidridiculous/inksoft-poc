define(function (require) {
  var registerSuite = require('intern!object');
  var assert = require('intern/chai!assert');
  var MouseUtil = require('util/Mouse');

  //Set up a reference element, we'll put text around this element to run tests against it
  function set1000x800() {
    var offset = {clientHeight:800,clientWidth:1000,left:25,top:25,x:25,y:100};
    MouseUtil.setOffset(offset);
  }

  registerSuite({
    name: 'Mouse Util',
    beforeEach: function() {
      set1000x800();
    },
    'systemClick adds x offset': function () {
      
      var result = MouseUtil.calculateSystemClick(100,100, 0);

      assert.equal(result.x, 125,
        'System Click should add the x offset');
    },
    'systemClick adds y offset': function () {
      
      var result = MouseUtil.calculateSystemClick(100,100, 0);

      assert.equal(result.y, 200,
        'System Click should add the y offset');
    },
    'scrollY is subtracted from y position':function() {
      var myY = 800;
      var scrollY = 200;
      var yOffset = 100;
      var result = MouseUtil.calculateSystemClick(100,myY,scrollY);      

      var expectedY = yOffset + myY - scrollY;

      assert.equal(result.y, expectedY,
        'Y shold be adjusted based on scrollY');
    }

  });

})