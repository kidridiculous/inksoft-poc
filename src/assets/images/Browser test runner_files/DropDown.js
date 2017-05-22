define(function (require) {
    var tdd = require('intern!tdd');

  	var assert = require('intern/chai!assert');
    	
  	var DropDown = require('use-model/generic/DropDown');

  	var getNewDropDownHandler = function(){return new DropDown();}

  	tdd.suite('DropDown', function () {

      	tdd.beforeEach(function () {
            
      		var select_withTextContent = document.createElement("SELECT");
      	    select_withTextContent.style.position = "absolute";
            select_withTextContent.style.top = '100px';
            select_withTextContent.style.left = '100px';

      	    document.body.appendChild(select_withTextContent);
      		select_withTextContent.setAttribute("id", "selectTestElement_withTextContent");

      		var option = document.createElement("option");
      		option.textContent = "Kiwi";
      		select_withTextContent.add(option);

      		var option2 = document.createElement("option");
      		option2.textContent = "Dog Food";
      		select_withTextContent.add(option2);

      		var option3 = document.createElement("option");
      		option3.textContent = "Big Bird";
      		select_withTextContent.add(option3);

      		var option4 = document.createElement("option");
      		option4.textContent = "Big Beer";
      		select_withTextContent.add(option4);



            var select_withLabel = document.createElement("SELECT");

            document.body.appendChild(select_withLabel);
            select_withLabel.setAttribute("id", "selectTestElement_withLabel");

            var option5 = document.createElement("option");
            option5.label = "Kiwi";
            select_withLabel.add(option5);

            var option6 = document.createElement("option");
            option6.label = "Dog Food";
            select_withLabel.add(option6);

            var option7 = document.createElement("option");
            option7.label = "Big Bird";
            select_withLabel.add(option7);

            var option8 = document.createElement("option");
            option8.label = "Big Beer";
            select_withLabel.add(option8);

        });

      	tdd.test('selectFromDropDown with TextContent using element id',function() {

      		var elementData = {id:'selectTestElement_withTextContent'};

      		var dynamicData = {regex:'Big Beer'};

      		var c = getNewDropDownHandler();

      		c.selectFromDropDown(elementData, dynamicData);

      		var selectElement = document.getElementById('selectTestElement_withTextContent');

      		var actual = selectElement.value;

      		var expected = 'Big Beer';

            assert.equal(actual, expected, 'should be Big Beer');    
        });



        tdd.test('selectFromDropDown with Label using element id',function() {

            var elementData = {id:'selectTestElement_withLabel'};

            var dynamicData = {regex:'Big Beer'};

            var c = getNewDropDownHandler();

            c.selectFromDropDown(elementData, dynamicData);

            var selectElement_withLabel = document.getElementById('selectTestElement_withLabel');

            var selectOptionIndex = selectElement_withLabel.selectedIndex;

            var actual = selectElement_withLabel.options[selectOptionIndex].label;

            var expected = 'Big Beer';

            assert.equal(actual, expected, 'should be Big Beer');    
        });

        tdd.test('selectFromDropDown using coordinates',function() {

            var selectElement = document.getElementById('selectTestElement_withTextContent');

            var centerX = parseInt(selectElement.style.left,10) + selectElement.clientWidth/2;

            var centerY = parseInt(selectElement.style.top,10) + selectElement.clientHeight/2;

            var elementData = {
                clientCoordinates:{
                    x:centerX,
                    y:centerY
                }
            };

            var dynamicData = {regex:'Big Beer'};

            var c = getNewDropDownHandler();

            c.selectFromDropDown(elementData, dynamicData);

            var actual = selectElement.value;

            var expected = 'Big Beer';

            assert.equal(actual, expected, 'should be Big Beer');    
        });

        tdd.test('selectFromDropDown with regex',function() {

            var elementData = {id:'selectTestElement_withLabel'};

            var dynamicData = {regex:'\\s*Beer\\s*'};

            var c = getNewDropDownHandler();

            c.selectFromDropDown(elementData, dynamicData);

            var selectElement_withLabel = document.getElementById('selectTestElement_withLabel');

            var selectOptionIndex = selectElement_withLabel.selectedIndex;

            var actual = selectElement_withLabel.options[selectOptionIndex].label;

            var expected = 'Big Beer';

            assert.equal(actual, expected, 'should be Big Beer');    
        });

        tdd.afterEach(function () {
            
            document.getElementById("selectTestElement_withTextContent").remove();
            document.getElementById("selectTestElement_withLabel").remove();

        });

    });
});
