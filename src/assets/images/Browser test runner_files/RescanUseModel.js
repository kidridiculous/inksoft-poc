define(function (require) {
  var registerSuite = require('intern!object');
  var assert = require('intern/chai!assert');
  var RescanUseModel = require('use-model/generic/RescanUseModel');

	registerSuite({
	    name: 'RescanUseModel',
	    'it cancels after 3 attempts': function () {
	      
	    const targetElement = {center:{x:100,y:100},segmentScrollY:0, tagName:'A', name:'something_classified'};
	    //Mock a classifier
	    let classifier = {timesResolved:1, matchesKeywords:() => {return false;}, reset:() => {}, getElement:() => {return targetElement;}, postMatchUpdate:()=>{return;},hasElement:()=>{return false;}, getScanOnComplete:()=> {return false;}},
	    //Mock a resolver
	      	resolver = {timesResolved:1, matchesKeywords:() => {return false;}, getData:() => {return '';}}
	      	um = new RescanUseModel(classifier, resolver),
	      	//Empty Scan that will never match
	      	emptyScan = {formattedElements:[]};

	      	//Validation scan
	      	um = um.processScan({formattedElements:[targetElement]});

	      	//Empty Scan
	      	um = um.processScan(emptyScan);
	      	um = um.processScan(emptyScan);
	      	um = um.processScan(emptyScan);

	      
	      	assert.isNull(um, 'Rescan should fail after 3 attempts');
	    }
	});
})