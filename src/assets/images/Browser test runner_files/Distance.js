define(function (require) {
  var registerSuite = require('intern!object');
  var assert = require('intern/chai!assert');
  var Distance = require('util/Distance');

  var rightText = {
   "segments": {
      "1": {
         "segment": 1,
         "scrollY": 0,
         "box": {
            "xmin": 795,
            "ymin": 443,
            "xmax": 854.875,
            "ymax": 459
         },
         "center": {
            "x": 824.9375,
            "y": 451
         },
         "scrollableAncestorScrollTop": 0
      },
      "scanToken": "SbPrpnDTd8"
   },
   "segmentScrollY": 0,
   "scrollableAncestorScrollTop": 0,
   "xmax": 854.875,
   "xmin": 795,
   "ymax": 459,
   "ymin": 443,
   "nodeValue": "Shipping",
   "center": {
      "x": 824.9375,
      "y": 451
   },
   "imageSource": null,
   "isText": true,
   "textNeighbors": [],
}

  var rightEl = {
   "className": "fulfillment-type-radio left",
   "clientHeight": 14,
   "clientLeft": 0,
   "clientTop": 0,
   "clientWidth": 14,
   "id": "ci775446003882SHIPPING",
   "innerHTML": "",
   "innerText": "",
   "tagName": "INPUT",
   "type": "radio",
   "title": "",
   "value": "SHIPPING",
   "placeholder": "",
   "name": "fulfillmentType",
   "xmax": 788,
   "xmin": 774,
   "ymax": 461,
   "ymin": 447,
   "nodeValue": null,
   "center": {
      "x": 781,
      "y": 454
   },
   "imageSource": null,
   "isText": false,
   "isInput": true,
   "textNeighbors": [],
   "cssContent": [
      "",
      ""
   ],
   "checked": false,
   "scrollableAncestorScrollTop": 0
};

  var refEl = getElement(200, 200, 80, 30);

  //Set up a reference element, we'll put text around this element to run tests against it
  function getElement(x,y,w,h) {
    return { xmin: x, ymin: y, xmax:x+w, ymax:y+h, center: { x: x + (w/2), y: y + (h/2) } };
  }

  function getSmallInputEl() {
    return getElement(200, 200, 70, 30);
  }

  function getWideTextAbove(x,y) {
    return getElement(x, y, 120, 30);
  }

  function getTextLeft() {
    return getElement(100, 200, 40, 30);
  }

  function getTextRight() {
    return getElement(300, 200, 40, 30);
  }
   
  
  function getTextAbove() {
    return getElement(200, 150, 40, 30);
  }
  
  function getTextBelow() {
    return getElement(200, 250, 40, 30);
  } 


  registerSuite({
    name: 'Distance Util',
    'Distance vector to the RIGHT': function () {
      
      var result = Distance.getDistanceVector(refEl, getTextRight());

      assert.equal(result.location, 'RIGHT',
        'Text should be located to the RIGHT');
    },
    'Distance vector to the RIGHT and a little above': function () {
      let textEl = getTextRight();
      textEl.center.y += 5;
      textEl.ymin += 5;
      textEl.ymax += 5;

      var result = Distance.getDistanceVector(refEl, textEl);

      assert.equal(result.location, 'RIGHT',
        'Text should be located to the RIGHT');
    },
    'Distance vector to the RIGHT and a little below': function () {
      let textEl = getTextRight();
      textEl.center.y -= 5;
      textEl.ymin -= 5;
      textEl.ymax -= 5;

      var result = Distance.getDistanceVector(refEl, textEl);

      assert.equal(result.location, 'RIGHT',
        'Text should be located to the RIGHT');
    },
    'Distance vector to the VERY CLOSE RIGHT': function () {
      
      var result = Distance.getDistanceVector(rightEl, rightText);

      assert.equal(result.location, 'RIGHT',
        'Text should be located to the RIGHT');
    },
    'Distance vector to the LEFT': function () {
      let textEl = getTextLeft()

      var result = Distance.getDistanceVector(refEl, textEl);

      assert.equal(result.location, 'LEFT',
        'Text should be located to the LEFT');
    },
    'Distance vector to the LEFT and a little above': function () {
      let textEl = getTextLeft();
      textEl.center.y += 10;
      textEl.ymin += 10;
      textEl.ymax += 10;

      var result = Distance.getDistanceVector(refEl, textEl);

      assert.equal(result.location, 'LEFT',
        'Text should be located to the LEFT');
    },
    'Distance vector to the LEFT and a little below': function () {
      let textEl = getTextLeft();
      textEl.center.y -= 10;
      textEl.ymin -= 10;
      textEl.ymax -= 10;

      var result = Distance.getDistanceVector(refEl, textEl);

      assert.equal(result.location, 'LEFT',
        'Text should be located to the LEFT');
    },
    'Distance vector ABOVE': function () {
      let textEl = getTextAbove();

      var result = Distance.getDistanceVector(refEl, textEl);

      assert.equal(result.location, 'ABOVE',
        'Text should be located to the ABOVE');
    },
    'Distance vector ABOVE and a little left': function () {
      let textEl = getTextAbove();
      textEl.center.x -= 5;
      textEl.xmin -= 5;
      textEl.xmax -= 5;

      var result = Distance.getDistanceVector(refEl, textEl);

      assert.equal(result.location, 'ABOVE',
        'Text should be located to the ABOVE');
    },
    'Distance vector above and a little right': function () {
      let textEl = getTextAbove();
      textEl.center.x += 5;
      textEl.xmin += 5;
      textEl.xmax += 5;


      var result = Distance.getDistanceVector(refEl, textEl);

      assert.equal(result.location, 'ABOVE',
        'Text should be located to the ABOVE');
    },
    'Distance vector below': function () {
      let textEl = getTextBelow();

      var result = Distance.getDistanceVector(refEl, textEl);

      assert.equal(result.location, 'BELOW',
        'Text should be located to the BELOW');
    },
    'Distance vector below and a little left': function () {
      let textEl = getTextBelow();
      textEl.center.x -= 10;
      textEl.xmin -= 10;
      textEl.xmax -= 10;
      var result = Distance.getDistanceVector(refEl, textEl);

      assert.equal(result.location, 'BELOW',
        'Text should be located to the BELOW');
    },
    'Distance vector below and a little right': function () {
      let textEl = getTextBelow();
      textEl.center.x += 10;
      textEl.xmin += 10;
      textEl.xmax += 10;

      var result = Distance.getDistanceVector(refEl, textEl);

      assert.equal(result.location, 'BELOW',
        'Text should be located to the BELOW');
    },
     'Text exactly left': function () {
      let textEl = { center: { x: 437, y: 705}, xmax: 478.765625, xmin: 397,ymax: 714,ymin: 697};
        inputEl = {center: {x:505,y:705 },xmax: 524.09375,xmin: 487.09375,ymax: 721,ymin: 689};
      var result = Distance.getDistanceVector(inputEl, textEl);

      assert.equal(result.location, 'LEFT',
        'Text should be located to the LEFT');
    },
    'Distance vector inside': function () {

      let textEl = { center: { x: refEl.center.x + 25, y: refEl.center.y + 5}};

      var result = Distance.getDistanceVector(refEl, textEl);

      assert.equal(result.location, 'INSIDE',
        'Text should be located to the INSIDE');
    },
    'it finds the nearest with a single list':function() {
      let cluster, lists, colorList, refEl, color1, color2, color3;

      refEl = { center: {x:200,y:200}, nodeValue:'Mens Crew Socks'};
      color1 = { center: {x:75,y:898}, nodeValue:'Red'};
      color2 = { center: {x:230,y:210}, nodeValue:'Red'};
      color3 = { center: {x:600,y:575}, nodeValue:'Red'};

      colorList = [color1, color2, color3];
      lists = [colorList];

      cluster = Distance.findNearestClusterTo(refEl, lists, 0, 0, []);

      assert.strictEqual(cluster[0], color2, 'it didnt pick the nearest color');
    },
    'it finds the nearest with multiple lists':function() {
      let cluster, lists, colorList, sizeList, refEl, color1, color2, color3, size1, size2, size3;

      refEl = { center: {x:200,y:200}, nodeValue:'Mens Crew Socks'};
      
      color1 = { center: {x:75,y:898}, nodeValue:'Red'};
      color2 = { center: {x:230,y:210}, nodeValue:'Red'};
      color3 = { center: {x:600,y:575}, nodeValue:'Red'};

      size1 = { center: {x:75,y:898}, nodeValue:'XL'};
      size2 = { center: {x:600,y:575}, nodeValue:'XL'};
      size3 = { center: {x:225,y:220}, nodeValue:'XL'};
      
      colorList = [color1, color2, color3];
      sizeList = [size1, size2, size3];
      lists = [colorList, sizeList];

      cluster = Distance.findNearestClusterTo(refEl, lists, 0, 0, []);

      assert.strictEqual(cluster[1], size3, 'it didnt pick the nearest size');
    },
    'it calculates geometric median' : function() {
      let els = [], result;

      els.push({ center: {x:0,y:0}, nodeValue:'Mens Crew Socks'});
      els.push({ center: {x:0,y:200}, nodeValue:'Mens Crew Socks'});
      els.push({ center: {x:200,y:0}, nodeValue:'Mens Crew Socks'});
      els.push({ center: {x:200,y:200}, nodeValue:'Mens Crew Socks'});

      result = Distance.findGeometricMedian(els);

      assert.deepEqual(result, {x:100, y:100}, 'it didnt find the median');
    },
    'small width inputs include text above when text is longer than input': function() {
        const smallInput = getSmallInputEl();
        smallInput.tagName = 'INPUT';
        const aboveText = getWideTextAbove(200, 150);

        var result = Distance.getDistanceVector(smallInput, aboveText);

        assert.equal(result.location, 'ABOVE', 'Text should be located ABOVE');
    },
    'small width inputs exclude text above when text is longer than input but not left justified': function() {
        const smallInput = getSmallInputEl();
        smallInput.tagName = 'INPUT';
        const aboveText = getWideTextAbove(240, 150);


        var result = Distance.getDistanceVector(smallInput, aboveText);

        assert.equal(result.location, 'NONE', 'Text should be located NONE');
    },
    'Text above with small overlap still above':function() {
        const input = {xmin:50, xmax:200, ymin:113,ymax:142, center:{x:125,y:126.5}};
        
        const aboveTextWIthOverlap = {xmin:55, xmax:155, ymin:95,ymax:115, center:{x:105, y:105}};

        var result = Distance.getDistanceVector(input, aboveTextWIthOverlap);

        assert.equal(result.location, 'ABOVE', 'Text should be located ABOVE');
    },
    'Text above with large overlap has NONE location':function() {
        const input = {xmin:50, xmax:200, ymin:105,ymax:135, center:{x:125, y:120}};
        
        const aboveTextWIthOverlap = {xmin:55, xmax:155, ymin:95,ymax:115, center:{x:105, y:105}};

        var result = Distance.getDistanceVector(input, aboveTextWIthOverlap);

        assert.equal(result.location, 'NONE', 'Text should have location of NONE');
    },
    'Text Above Button':function() {
      const textAbove = {
         "xmax": 771.640625,
         "xmin": 665.46875,
         "ymax": 529,
         "ymin": 514,
         "nodeValue": "Choose Style:",
         "center": {
            "x": 718.5546875,
            "y": 521.5
         }
       };

      const btn = {
        "xmax": 981.46875,
         "xmin": 666.46875,
         "ymax": 570,
         "ymin": 532,
         "nodeValue": null,
         "center": {
            "x": 823.96875,
            "y": 551
         }
       };

        var result = Distance.getDistanceVector(btn, textAbove);

        assert.equal(result.location, 'ABOVE', 'Text should have location of ABOVE');  
      }

  });

})