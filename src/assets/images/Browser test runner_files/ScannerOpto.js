define(function (require) {
  var registerSuite = require('intern!object');
  var assert = require('intern/chai!assert');
  var ScannerOpto = require('vision/ScannerOpto');

  var scannedElement = {xmin:10, ymin:10, xmax:100, ymax:100, x:11, y:11, definition:'sample'};

  function getScannerOpto() {
    return new ScannerOpto(window, document);
  }


  registerSuite({
    name: 'ScannerOpto',
    beforeEach: function() {
      document.body.innerHTML = '';
    },
    'it displays scan results': function () {
      let opto = getScannerOpto();

      opto.display([scannedElement]);

      assert.equal(document.body.childNodes.length, 1,
        'vision box was not added');
    },
    'it clears the scan display': function () {
      let opto = getScannerOpto();

      opto.display([scannedElement]);
      opto.clearDisplay();

      assert.equal(document.body.childNodes.length, 0,
        'vision box was not cleared');
    },
    'it displays classification': function () {
      let opto = getScannerOpto();

      opto.displayClassifications([scannedElement]);
      
      assert.equal(document.body.childNodes.length, 1,
        'classification was not displayed');
    }

  });

})