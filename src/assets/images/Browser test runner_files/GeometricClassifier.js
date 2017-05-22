define(function (require) {
  var registerSuite = require('intern!object');
  var assert = require('intern/chai!assert');
  var Scanner = require('vision/Scanner2');
  var GeometricClassifier = require('vision/GeometricClassifier');

  var inputHtml = require('intern/dojo/text!private/tests/fixtures/scanner/input.html');
  var emailHtml = require('intern/dojo/text!private/tests/fixtures/scanner/email.html');
  var selectHtml = require('intern/dojo/text!private/tests/fixtures/scanner/select.html');
  var spanInButtonHtml = require('intern/dojo/text!private/tests/fixtures/scanner/spanInButton.html');
  var pagingHtml = require('intern/dojo/text!private/tests/fixtures/scanner/paging.html');
  var domDropDown = require('intern/dojo/text!private/tests/fixtures/dropdown/domdropdown.html');
  var labelHtml = require('intern/dojo/text!private/tests/fixtures/scanner/label.html');

  function getScanner() {
    return new Scanner(window);
  }

  function getGeoClassifier(elements) {
    return new GeometricClassifier(elements);
  }

  registerSuite({
    name: 'GeometricClassifier',
    'it gets options from select elements': function() {
      var scnr = getScanner();
      
      document.body.innerHTML = selectHtml;

      let scanOutput = scnr.viewPortScan(8, 8);

      var geo = getGeoClassifier(scanOutput);

      geo.classify();

      var result = geo.output.formattedElements[0];

      assert.equal(result.options[0].humanText, '01', 'Did not extract the options from select');

    },
    'it gets htmlFor from label elements': function() {
      var scnr = getScanner();
      
      document.body.innerHTML = labelHtml;

      let scanOutput = scnr.viewPortScan(8, 8);

      var geo = getGeoClassifier(scanOutput);

      geo.classify();

      var result = geo.output.formattedElements[0];

      assert.equal(result.forElement.id, 'theCheckbox', 'Did not extract the options from select');

    }

  });
})