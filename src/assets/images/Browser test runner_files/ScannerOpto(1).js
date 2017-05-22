define('vision/ScannerOpto', ['util/ElementCalculations', 'vision/GeometricClassifier', 'service/Knowledge'],function(ElementCalculations, GeometricClassifier, Knowledge){
	
	let elemCalcs = new ElementCalculations();

	function findHighestZIndex(document, tagSearch)
	{
		var elems = document.getElementsByTagName(tagSearch);
		var highest = 0;
		for (var i = 0; i < elems.length; i++)
		{
			var zindex=parseInt(document.defaultView.getComputedStyle(elems[i],null).getPropertyValue("z-index"));
			if ((zindex != NaN) && (zindex > highest))
		    {
		    	highest = zindex;
		    }
		}
		return highest;
	}

	function createLineElement(x, y, length, angle, title, color, zIndex) {
	    var line = document.createElement("div"); 
	    line.setAttribute('title', title);
	    var styles = 'border: 1px solid ' + color + '; '
	               + 'width: ' + length + 'px; '
	               + 'height: 0px; '
	               + 'z-index:' + zIndex.toString() + ';'
	               + '-moz-transform: rotate(' + angle + 'rad); '
	               + '-webkit-transform: rotate(' + angle + 'rad); '
	               + '-o-transform: rotate(' + angle + 'rad); '  
	               + '-ms-transform: rotate(' + angle + 'rad); '  
	               + 'position: absolute; '
	               + 'top: ' + y + 'px; '
	               + 'left: ' + x + 'px; ';
	    line.setAttribute('style', styles);  
	    return line;
	}

	function createLine(x1, y1, x2, y2, title, color, zIndex) {
	    var a = x1 - x2,
	        b = y1 - y2,
	        c = Math.sqrt(a * a + b * b);

	    var sx = (x1 + x2) / 2,
	        sy = (y1 + y2) / 2;

	    var x = sx - c / 2,
	        y = sy;

	    var alpha = Math.PI - Math.atan2(-b, a);

	    return createLineElement(x, y, c, alpha, title, color, zIndex);
	}

	function clearOpto(toggleOnly) {
		if(this.lines) {
			this.lines.forEach(function(line) {
				this.ownerDocument.body.removeChild(line);
			}, this);
			this.ownerDocument.body.removeChild(this.infoDiv);
			this.ownerDocument.body.removeChild(this.clearDiv);
			delete this.infoDiv;
			delete this.clearDiv;
			delete this.lines;
		}

		if(!toggleOnly) {
			this.ownerDocument.body.removeChild(this.robotOpto);	
		}
		
	}

	function scanClick() {
		var showScanOutput = function() {
			showAddTemplateEntry(this);
		};

		var zIndexRef = parseInt(findHighestZIndex(this.ownerDocument, '*')) + 1;

		if(this.lines) {
			clearOpto.apply(this, [true]);
			this.robotOpto.style.border="solid 1px #c0c0c0";
			return;
		}
		else {
			this.lines = [];
			this.robotOpto.style.border="solid 4px #000";
		}

		let myCenter = elemCalcs.determineCenter(this);

		if(this.textNeighbors) {
			let counter = 100;
			this.textNeighbors.forEach(function(other) {
				let line, color = 'rgba(255, 0, 0, ' + (counter / 100).toString() + ')';
				counter -= 20;
				if(other.center) {
					line = createLine(myCenter.x, myCenter.y, other.center.x, other.center.y, 'test', color, zIndexRef+5);	
					this.lines.push(line);
					this.ownerDocument.body.appendChild(line);
				}
			}, this);
		}

		this.infoDiv = document.createElement("div"); 
		this.ownerDocument.body.appendChild(this.infoDiv); 
		this.infoDiv.style.fontSize=14;
		this.infoDiv.innerText='I';
    	this.infoDiv.style.color="white";
    	this.infoDiv.style.padding=2;
    	this.infoDiv.style.position='absolute';
  		this.infoDiv.style.height = '20px';
  		this.infoDiv.style.width = '20px';
  		this.infoDiv.style.top = (this.ymin + 10) + "px";
  		this.infoDiv.style.left = (this.xmin + 10) + "px";
  		this.infoDiv.style.backgroundColor = 'blue';
    	this.infoDiv.style.zIndex=zIndexRef + 6;
    	this.infoDiv.addEventListener('click', showScanOutput.bind(this));

    	this.clearDiv = this.ownerDocument.createElement("div"); 
		this.ownerDocument.body.appendChild(this.clearDiv); 
		this.clearDiv.style.fontSize=14;
		this.clearDiv.innerText='R';
    	this.clearDiv.style.color="white";
    	this.clearDiv.style.padding=2;
    	this.clearDiv.style.position='absolute';
  		this.clearDiv.style.height = '20px';
  		this.clearDiv.style.width = '20px';
  		this.clearDiv.style.top = (this.ymin + 10) + "px";
  		this.clearDiv.style.left = (this.xmin + 40) + "px";
  		this.clearDiv.style.backgroundColor = 'red';
    	this.clearDiv.style.zIndex=zIndexRef + 6;
    	this.clearDiv.addEventListener('click', clearOpto.bind(this, false));
    	
	};


	function showAddTemplateEntry(elem) {
		var document = elem.ownerDocument;
		var window = document.defaultView;
		var mainEntry = document.createElement('div');
		mainEntry.style.position = 'fixed';
		mainEntry.style.overflow = 'scroll';
		mainEntry.style.top = '100px';
		mainEntry.style.left = '100px';
		mainEntry.style.width = '720px';
		mainEntry.style.zIndex = parseInt(findHighestZIndex(document, '*')) + 1;
		mainEntry.style.backgroundColor = '#ccc';
		mainEntry.style.border = 'solid 2px #999';
		mainEntry.style.padding = '20px';


		var geo = new GeometricClassifier();
		var jsonString = JSON.stringify(geo.formatElement(elem), null, 3);
		var definitionList = Knowledge.getDefinitionNames().sort();
		
		//Json
		var jsonCode = document.createElement("pre");
		jsonCode.style.maxHeight = '350px';
		jsonCode.style.width = '100%';
		jsonCode.style.backgroundColor = '#fff';
		jsonCode.style.textTransform = 'none';
		jsonCode.style.overflowX = 'scroll';
		jsonCode.style.overflowY = 'scroll';
		jsonCode.style.padding = '10px';
		jsonCode.style.textAlign = 'left';
		jsonCode.appendChild(document.createTextNode(jsonString));
		mainEntry.appendChild(jsonCode);
		mainEntry.appendChild(document.createElement("BR"));
		
		//Select
		var defsLabel = document.createElement("label");
		defsLabel.appendChild(document.createTextNode("Classifier"));
		mainEntry.appendChild(defsLabel);

		mainEntry.appendChild(document.createElement("BR"));
		
		var defs = document.createElement("select");
		definitionList.forEach(function(d){
			var option = document.createElement("option");
			option.text = d;
			defs.add(option);
		});
		mainEntry.appendChild(defs);
		mainEntry.appendChild(document.createElement("BR"));

		//Priority
		var priorityLabel = document.createElement("label");
		priorityLabel.appendChild(document.createTextNode("Priority"));
		mainEntry.appendChild(priorityLabel);
		
		mainEntry.appendChild(document.createElement("BR"));
		var priority = document.createElement('input');
		priority.placeholder = 'enter priority X.Y or X';
		priority.type= 'text';
		mainEntry.appendChild(priority);

		mainEntry.appendChild(document.createElement("BR"));
		
		var cancel = document.createElement('button');
		cancel.appendChild(document.createTextNode("Close"));
		cancel.addEventListener('click', function(){
			document.body.removeChild(mainEntry);
		});

		mainEntry.appendChild(cancel);				

		var add = document.createElement('button');
		add.appendChild(document.createTextNode("To Clipboard"));
		add.addEventListener('click', function(){
			var text = jsonCode.innerText;
			var json = JSON.parse(text);
			json.classifier = defs.options[defs.selectedIndex].text;
			json.priority = priority.value;
			jsonCode.innerText = JSON.stringify(json, null, 3);
			
			var range = document.createRange();  
  			range.selectNode(jsonCode);  
  			window.getSelection().addRange(range); 
			document.execCommand('copy');

		});
		mainEntry.appendChild(add);				
		

		document.body.appendChild(mainEntry); 

	}

	class ScannerOpto {

		constructor(window, document) {
			this.window = window;
			this.document = document;
			this.visionBoxes = [];

		}

		addVisionBox(tag, x, y, width, height) {
			var box = this.document.createElement(tag);
			box.id = 'robot-opto-' + this.visionBoxes.length.toString();
	    	
	    	//Set default styles
	   		box.style.border='solid 1px #c0c0c0';
	   		box.style.fontSize=9;
	    	box.style.color='white';
	    	box.style.padding=0;
	    	box.style.pointerEvents='none';
	    	box.style.position='absolute';
	        box.style.width=width.toString()+'px';
	        box.style.height=height.toString()+'px';	        
	        box.style.top=y.toString()+'px';
	        box.style.left= x.toString()+'px';

	    	//Add it
	   		this.visionBoxes.push(box);
	   		this.document.body.appendChild(box); 

	   		return box;
		}

		//Clear anything that we are displaying
		clearDisplay() {
			if(this.visionBoxes) {
	    		for(var i=0;i<this.visionBoxes.length;i++){
	    			try{
	    				this.document.body.removeChild(this.visionBoxes[i]);	
	    			} catch (e){}
	    			
	    		}
	    		
	    		var clearBtn = this.document.getElementById('robot-opto-clear');
	    		
	    		if(clearBtn) {
	    			this.document.body.removeChild(clearBtn);
	    		}
	    		
	    		this.visionBoxes = [];
    		}	
		}

		display(elements, debug) {
			var zIndexStart = parseInt(findHighestZIndex(this.document, "*")) + 1;

			for(var i=0;i<elements.length;i++) {
				var elem = elements[i];

				var divTag = this.addVisionBox('div', elem.xmin, elem.ymin, elem.xmax-elem.xmin, elem.ymax-elem.ymin); 
		        
		        //Override colors
		   		if(elem.isButton) {
					divTag.style.backgroundColor="rgba(211, 84, 0, 0.4)";
		   		}
		   		else if(elem.isInput || elem.isNonStandardDropDown) {
		   			divTag.style.backgroundColor="rgba(0, 0, 0, 0.3)";
		   		}
		   		else {
					divTag.style.backgroundColor="rgba(255, 255, 0, 0.1)";
		   		}
		    	
		   		//Override pointer events
		    	if(debug) {
		    		divTag.style.pointerEvents="auto";
		    	}
		    	
		        divTag.style.zIndex=zIndexStart;
		        divTag.addEventListener('click', scanClick.bind(elem));
				elem.robotOpto = divTag;
		    }

		    if(debug) {
	    		//Add clear display button
	    		var clearScan = document.createElement('div');
	    		clearScan.addEventListener('click', this.clearDisplay.bind(this));
	    		clearScan.id = 'robot-opto-clear';
	    		clearScan.innerText = 'Clear Scan (' + elements.length.toString() + ')';
	    		clearScan.setAttribute('style', 'position:fixed;background-color:yellow; padding:10px 20px; bottom:20px;border-radius:5px;border:solid 1px black;margin:auto;z-index:' + (zIndexStart + 3).toString());
	        	this.document.body.appendChild(clearScan);
	    	}

    		
		}

		displayClassifications(displayList) {
			let def, x, y, i, zIndex = parseInt(findHighestZIndex(this.document, '*')) + 1;
			for(i=0;i<displayList.length;i++){
	            try {
	                def = displayList[i].definition;
	                x = displayList[i].x.toString();
	                y = displayList[i].y.toString();

	                var clsLabel = this.document.createElement('div');
	                clsLabel.addEventListener('click', this.clearDisplay.bind(this));
	                clsLabel.id = 'robot-opto-classification-'+def;
	                clsLabel.innerText = def;
	                clsLabel.setAttribute('style', 'position:absolute;background-color:rgba(255,255,255,0.3); padding:5px 10px; top:' + y + 'px;left:' + x + 'px;border-radius:5px;border:solid 1px black;margin:auto;z-index:' + zIndex.toString() + ';');
	                clsLabel.style.pointerEvents='none';
	                this.document.body.appendChild(clsLabel);

	                this.visionBoxes.push(clsLabel);
                } catch (ex) {
                    console.log("error in displayClassifications " + ex.message+"\n\n"+displayList[i]);
                }
			}
		}


	}


	return ScannerOpto;

})
