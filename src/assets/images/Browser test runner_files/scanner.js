define(function (require) {
  var registerSuite = require('intern!object');
  var assert = require('intern/chai!assert');
  var Scanner = require('vision/Scanner2');

  var inputHtml = require('intern/dojo/text!private/tests/fixtures/scanner/input.html');
  var emailHtml = require('intern/dojo/text!private/tests/fixtures/scanner/email.html');
  var selectHtml = require('intern/dojo/text!private/tests/fixtures/scanner/select.html');
  var spanInButtonHtml = require('intern/dojo/text!private/tests/fixtures/scanner/spanInButton.html');
  var pagingHtml = require('intern/dojo/text!private/tests/fixtures/scanner/paging.html');
  var domDropDown = require('intern/dojo/text!private/tests/fixtures/dropdown/domdropdown.html');
  var imageMapHtml = require('intern/dojo/text!private/tests/fixtures/scanner/imagemap.html');

  function getScanner() {
    return new Scanner(window, document);
  }

  registerSuite({
    name: 'Scanner',
    'it finds input type text': function () {
      document.body.innerHTML = inputHtml;

      let scnr = getScanner();

      let scanOutput = scnr.viewPortScan( 8, 8);

      var result = scanOutput[0];

      assert.equal(result.id, 'name',
        'Scanned element should be the name input');
    },
    'it finds input type email': function () {
      document.body.innerHTML = emailHtml;

      let scnr = getScanner();

      let scanOutput = scnr.viewPortScan( 8, 8);

      var result = scanOutput[0];

      assert.equal(result.id, 'mail',
        'Scanned element should be the email input');
    },
    'it finds select element': function () {
      document.body.innerHTML = selectHtml;

      let scnr = getScanner();

      let scanOutput = scnr.viewPortScan( 8, 8);

      var result = scanOutput[0];

      assert.equal(result.id, 'month',
        'Scanned element should be the name input');
    },
    'it finds text inside button child element': function() {
      document.body.innerHTML = spanInButtonHtml;

      let scnr = getScanner();

      let scanOutput = scnr.viewPortScan( 8, 8);

      var result = scanOutput[2];

      assert.equal(result.textContent, 'Click Me',
        'Span text should be \'Click Me\'');
    },
    'it keeps filter tags with only text':function() {
      document.body.innerHTML = '<div>Text in div</div>';

      let scnr = getScanner();

      let scanOutput = scnr.viewPortScan( 8, 8);
      var divFound = false;
      scanOutput.forEach(function(el){
        if(el.tagName === 'DIV') {
          divFound = true;
        }
      });

      assert.equal(divFound, true,
        'DIV tag was not found ');
    },
    'it filters div tags with more than text':function() {
      document.body.innerHTML = '<div>Text in div<span>Text in span</span></div>';

      let scnr = getScanner();

      let scanOutput = scnr.viewPortScan( 8, 8);
      var divFound = false;

      scanOutput.forEach(function(el) {
        if(el.tagName === 'DIV') {
          result = true;
        }
      });

      assert.equal(divFound, false,
        'DIV tag was found and should not have');
    },
    'it scans elements that are scrollable':function() {
      document.body.innerHTML = domDropDown;
      let scnr = getScanner();
      scnr.setScanScrollableElements(true);

      let scanOutput = scnr.viewPortScan( 8, 8);
      

      assert.equal(scanOutput.length, 21,
        'Didn\'t find elements in scroll');
    },
    'it pages correctly': function() {

      var deferred = this.async(2000);

      document.body.innerHTML = pagingHtml;      

      var cH = document.documentElement.clientHeight;

      var p1 = document.getElementById('page1'),
        p2 = document.getElementById('page2');

      var p1Footer = document.getElementById('page1Footer'),
        p2Footer = document.getElementById('page2Footer');

      p1.style.height = (cH-200).toString() + 'px';
      p2.style.height = (cH-200).toString() + 'px';
      p1Footer.style.height = '200px';
      p2Footer.style.height = '200px';

      let scnr = getScanner();

      scnr.fullScan(8,8, deferred.callback(function(scanOutput) {
        assert.equal(scanOutput.length, 8, 'it didnt find exactly 8 elements');
      }));
      
    },
    'it scans points': function() {

      this.skip('needs refactoring, test is dependent currently on screen size');
      var deferred = this.async(2000);

      document.body.innerHTML = pagingHtml;      
      

      var points = [ {x:76, y:217} ];
      var segment = {index:2, scrollY:461, points:points};


      var cH = document.documentElement.clientHeight;

      var p1 = document.getElementById('page1'),
        p2 = document.getElementById('page2');

      var p1Footer = document.getElementById('page1Footer'),
        p2Footer = document.getElementById('page2Footer');

      p1.style.height = (cH-200).toString() + 'px';
      p2.style.height = (cH-200).toString() + 'px';
      p1Footer.style.height = '200px';
      p2Footer.style.height = '200px';

      let scnr = getScanner();

      scnr.samplePointScan(8,8, [segment], deferred.callback(function(scanOutput) {
        assert.equal(scanOutput.length, 1, 'it didnt find exactly 1 element');
      }));
      
    },
    'it scans fixed points':function() {
      
      document.body.innerHTML = emailHtml;

      let scnr = getScanner();

      let scanOutput = scnr.viewPortPointScan([{x:20, y:20}]);

      var result = scanOutput[0];

      assert.equal(result.id, 'mail',
        'Scanned element should be the email input');
    },
    'it can scroll a parent element from a point':function() {
      document.body.innerHTML = domDropDown;
      let scnr = getScanner();
      scnr.setScanScrollableElements(true);

      let scanOutput = scnr.viewPortScan( 8, 8);

      let targetEl = scanOutput.filter(function(el) {
        return (el.scrollableAncestorScrollTop > 0 && el.nodeType === 1);
      }).sort(function(a, b){
        return b.scrollableAncestorScrollTop - a.scrollableAncestorScrollTop;
      })[0];
      
      var x = targetEl.xmin + ((targetEl.xmax-targetEl.xmin)/2);
      var y = targetEl.ymin + ((targetEl.ymax - targetEl.ymin) / 2);
      Scanner.scrollParentFromPoint(x, y, targetEl.scrollableAncestorScrollTop);

      var sameEl = document.elementFromPoint(x, y);

      assert.equal(targetEl, sameEl,
        'Didn\'t find elements in scroll');
    },
    'it scans image map':function() {
      document.body.innerHTML = imageMapHtml;
      let scnr = getScanner();
      scnr.setScanScrollableElements(true);

      let scanOutput = scnr.viewPortScan( 8, 8);      

      assert.equal(scanOutput[2].xmin, 258, 'area image maps are not correctly being found');

    }

  });

})