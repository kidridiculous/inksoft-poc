define('vision/Scanner2', ['util/ElementCalculations', 'vision/GeometricClassifier', 'service/Knowledge', 'util/TextUtil'],function(ElementCalculations, GeometricClassifier, Knowledge, TextUtil){

	let elemCalcs = new ElementCalculations(),
		SCROLL_DELAY = 150, segmentScanner;

	function scrollToPosition(win, scrollY) {
		console.log('scrolling to:' + scrollY.toString());
		win.scrollTo(0, scrollY);
		win.setTimeout(function() {
			segmentScanner.next();
		}, SCROLL_DELAY);
	}

	//Use a generator to perform the async scroll and scan
	function* SegmentScanner(scnr, segments, samplePointScan, callback) {
		var i=0;
		while(i<segments.length) {
			scrollToPosition(scnr.getWindow(), segments[i].scrollY);
			yield i; 
			if(samplePointScan) {
				scnr.scanPoints(segments[i], segments[i].points);
			} else{
				scnr.scanSegment(segments[i]);	
			}
			
			i++;
		}

		scrollToPosition(scnr.getWindow(), 0);
		yield;
		scnr.postProcessScan();
		callback(scnr.scannedElements);
	}

	function defaultFilter(element) {
		let filterTags = ['HTML','FORM','FIELDSET','SVG','IFRAME','SECTION','TABLE'],
			keepIfTextOnlyTags = ['TH', 'TR', 'TD', 'DIV', 'HEADER'];
			tagName = element.tagName;
		
		if(tagName && filterTags.indexOf(tagName) >= 0) {
			//Filter It
			return true;
		}

		if(tagName && keepIfTextOnlyTags.indexOf(tagName) >= 0) {
			//If their is only one child node and it is text keep
			if(element.childNodes && 
				((element.childNodes.length == 1 && element.childNodes[0].nodeType === 3) 
					|| element.childNodes.length == 0)) {
				return false;
			} else {
				//Look for a full border
				const compStyle = window.getComputedStyle(element, null);
				if(compStyle.getPropertyValue("border-left-style") === 'solid' &&
					compStyle.getPropertyValue("border-top-style") === 'solid' &&
					compStyle.getPropertyValue("border-right-style") === 'solid' &&
					compStyle.getPropertyValue("border-bottom-style") === 'solid')
				{
					return false;
				}

				if(hasBoxShadowBorder(compStyle)) {
					return false;
				}

				return true;
			}
		}

		return false;

	}

	//Return true if the computed style has a boxShadow that would make the element look like it has a border, otherwise false
	function hasBoxShadowBorder(compStyle) {
		let boxShadowCSS = compStyle.getPropertyValue('box-shadow');
		const bsColor = /rgb\(\d{1,3},\s\d{1,3},\s\d{1,3}\)/.exec(boxShadowCSS);

		if(bsColor === null) {
			return false;
		}

		boxShadowCSS = boxShadowCSS.replace(bsColor, '').trim();

		let boxShadowParts = boxShadowCSS.split(' ');

		if(boxShadowParts.length === 5) {
			//Remove 'px'
			boxShadowParts = boxShadowParts.map(function(p) { return p.replace('px', '');});

			const hShadow = parseInt(boxShadowParts[0]), vShadow = parseInt(boxShadowParts[1]),  blur = parseInt(boxShadowParts[2]),  spread = parseInt(boxShadowParts[3]), style = boxShadowParts[4];

			return (hShadow + vShadow + blur)  < spread && style === 'inset';

		}
		
		return false;		
	}

	function getCssContent(win, el, appendTo) {
		let style, content;

		//before
		style = win.getComputedStyle(el, ':before');
		content = style.content || '';
		if(typeof content == 'string') {
			content.trim();
			if(content.length > 0 && !appendTo.includes(content)) {
				appendTo.push(content.replace(/["]+/g, ''));
			}
		}
		
		//After
		style = win.getComputedStyle(el, ':after');
		content = style.content || '';
		if(typeof content == 'string') {
			content.trim();
			if(content.length > 0 && !appendTo.includes(content)) {
				appendTo.push(content.replace(/["]+/g, ''));
			}
		}
	}

	function isElementScrollable(win, element) {

		if(element.nodeType !== 1) {
			return false;
		}

		let overflowY = '', compStyle = win.getComputedStyle(element, null);
		let overflowVals = ['visible','hidden','scroll','auto','initial','inherit'];

		if(overflowVals.indexOf(compStyle.getPropertyValue('overflow-y')) >= 0) {
			overflowY = compStyle.getPropertyValue('overflow-y');
		} else if(overflowVals.indexOf(compStyle.getPropertyValue('overflow')) >= 0) {
			overflowY = compStyle.getPropertyValue('overflow');
		}

		return (element.scrollHeight > element.clientHeight) && (overflowY === 'auto' || overflowY === 'scroll');
	}

	class Scanner {

		constructor(win, doc) {

			//Set Defaults
			this.maxHeight = 3000;
			this.maxWidth = 3000;
			this.headerPadding = 200;
			this.footerPadding = 200;

			this.setWindow(win);
		
			this.postFilterFn = defaultFilter;
			this.scannedElements = [];

			this.scanScrollableElements = true;
		}

		static scrollParentFromPoint(x, y, scrollTop) {
			let element = document.elementFromPoint(x, y), foundScrollable = false;

			while(!foundScrollable && element != null) {
				if(isElementScrollable(window, element)){
					foundScrollable = true;
				} else {
					element = element.parentElement;
				}
			}

			if(foundScrollable) {
				element.scrollTop = scrollTop;
			}
		}

		setWindow(win) {
			this.window = win;
			this.setDocument(win.document);
		}

		getWindow() {
			return this.window;
		}

		setDocument(doc){
			this.document = doc;
			this.body = this.document.body;
			this.html = this.document.documentElement;
		}

		setScanScrollableElements(value) {
			this.scanScrollableElements = value;
		}

		getScanScrollableElements() {
			return this.scanScrollableElements;
		}



		postProcessScan() {

			let processedElements = [], el;

			for(var i=0;i<this.scannedElements.length;i++) {
				el = this.scannedElements[i];

				if(!this.postFilterFn(el)) {

					if(el.nodeType === 3) {
						el.texter = true;
					}

					if(el.tagName === 'AREA' && el.parentElement && el.parentElement.tagName === 'MAP') {
						let mapId = el.parentElement.name || el.parentElement.id;
						let img = this.document.querySelector('img[usemap="#' + mapId + '"]');
						
						if(img.segments === undefined || img.segments === null) {

							let segKey = Object.keys(el.segments)[0], areaSeg = el.segments[segKey];
							this.addPositionInformation(segKey, areaSeg.scrollY, img, 0, 0, areaSeg.scrollableAncestorScrollTop)
						}

						elemCalcs.assignDimensions(img);
						elemCalcs.assignAreaDimensions(img, el);

						el.segmentScrollY = img.segmentScrollY;
						el.scrollableAncestorScrollTop = img.scrollableAncestorScrollTop;
						el.center = elemCalcs.determineCenter(el);
						
					} else {

						elemCalcs.assignDimensions(el);
						el.center = elemCalcs.determineCenter(el);	
					}

					

					//Extract CSS content
					var contentText = [];
					var sibling = el.previousElementSibling;
					if(sibling) {
						getCssContent(this.window, sibling, contentText);
					}

					sibling = el.nextElementSibling;
					if(sibling) {
						getCssContent(this.window, sibling, contentText);
					}

					if(el.nodeType === 1) {
						getCssContent(this.window, el, contentText);
					}
		
					if(contentText.length > 0) {
						el.cssContent = contentText;	
					}
			
					processedElements.push(el);
				}
			}

			this.scannedElements = processedElements;
			
		}

		//Async due to scrolling
		fullScan(xResolution, yResolution, callback) {	

			this.setup();
			this.xResolution = xResolution;
			this.yResolution = yResolution;

			let segments = this.getScanSegments();

			segmentScanner = SegmentScanner(this, segments, false, callback);

			segmentScanner.next();

			//this.rawScan(this.body, this.html, xResolution, yResolution);
		}

		samplePointScan(xResolution, yResolution, segmentsWithPoints, callback) {
			this.xResolution = xResolution;
			this.yResolution = yResolution;

			this.setup();

			segmentScanner = SegmentScanner(this, segmentsWithPoints, true, callback);

			segmentScanner.next();
		}

		fixedScan(xResolution, yResolution, xStart, yStart, width, height) {
			this.xResolution = xResolution;
			this.yResolution = yResolution;

			this.setup();

			let endX = Math.min(this.fullWidth, xStart+width), endY = Math.min(yStart+height, this.fullHeight);

			this.scanViewPort(xResolution, yResolution, xStart, endX, yStart, endY, 0);

			this.postProcessScan();

			return this.scannedElements;

		}

		viewPortPointScan(points) {
			this.xResolution = 0;
			this.yResolution = 0;

			this.setup();

			for(var i=0;i<points.length;i++) {
				this.scanPoint(points[i].x, points[i].y, 0, 0);
			}

			this.postProcessScan();

			return this.scannedElements;
		}

		scanSegment(segment) {
			this.scanViewPort(this.xResolution, this.yResolution, 0, this.fullWidth, 0, segment.maxScanY, segment.index);			
		}

		scanPoints(segment, points) {
			let point, i;

			for(i=0;i<points.length;i++) {
				point = points[i];

				this.scanPoint(point.x, point.y, segment.index, 0);
			}
			
		}

		viewPortScan(xResolution, yResolution) {
			this.xResolution = xResolution;
			this.yResolution = yResolution;

			this.setup();

			this.scanViewPort(xResolution, yResolution, 0, this.viewPortWidth, 0, this.viewPortHeight, 0);

			this.postProcessScan();

			return this.scannedElements;
		}

		scanViewPort(xResolution, yResolution, startX, endX, startY, endY, segment) {
			let nextEl, scrollableElements, startCount = this.scannedElements.length;

			startX = Math.min(Math.max(0, startX), this.viewPortWidth);

			startY = Math.min(Math.max(0, startY), this.viewPortHeight);

			if(startX < 0 || startX > this.viewPortWidth) {
				throw new Error('Start X out of Range' + startX.toString());
			}

			if(startY < 0 || startY > this.viewPortHeight) {
				throw new Error('Start Y out of Range' + startY.toString());
			}

			this.scanFromTo(xResolution, yResolution, startX, endX, startY, endY, segment, 0);

			if(this.scanScrollableElements && startCount < this.scannedElements.length) {
				scrollableElements = this.findScrollableElements(this.scannedElements.slice(startCount));
				scrollableElements.forEach(function(el) {
					this.scanScrollableElement(el, segment);
				}, this);
			}
		}


		scanFromTo(xResolution, yResolution, startX, endX, startY, endY, segment, elementOffset) {
			
			for(var y = startY;y <= endY;y+=yResolution) {

				for(var x=startX;x<=endX;x+=xResolution) {
					this.scanPoint(x, y, segment, elementOffset);
				}
			}

		}

		scanPoint(x, y, segment, elementOffset) {
			let nextEl;

			nextEl = this.getNodeFromPoint(x, y);
				
			if(nextEl) {
				this.addPositionInformation(segment, this.window.scrollY, nextEl, x, y, elementOffset);
				if( this.scannedElements.indexOf(nextEl) ==- 1) {
					this.scannedElements.push(nextEl);
				}
			}
		}

		findScrollableElements(elements) {
			let scrollables = [], el, i;

			for(i=0;i<elements.length;i++) {
				el = elements[i];
				if(isElementScrollable(this.window, el)) {
					scrollables.push(el);
				}
			}

			return scrollables;
		}

		scanScrollableElement(element, segment) {
			let scrollHeight = element.scrollHeight, clientHeight = element.clientHeight, scrollPasses = 0, currentPass = 0, 
				x,y,xEnd,yEnd, scrollTop,
				positionBox = element.segments[segment.toString()].box,
				initialScrollTop = element.scrollTop;

			scrollPasses = Math.floor(scrollHeight / clientHeight);

			for(currentPass=1;currentPass <= scrollPasses;currentPass++) {
				scrollTop = currentPass * clientHeight;

				//Scan Inside the elements bounds
				x = positionBox.xmin;
				xEnd = positionBox.xmax;
				y = positionBox.ymin;
				yEnd = positionBox.ymax;

				element.scrollTop = scrollTop;

				this.scanFromTo(this.xResolution, this.yResolution, x, xEnd, y, yEnd, segment, element.scrollTop);
			}

			element.scrollTop = initialScrollTop;

		}

		getScanSegments() {

			let scanStep = this.viewPortHeight - this.headerPadding - this.footerPadding,
				scannableArea = this.fullHeight - this.headerPadding - this.footerPadding,
				segmentCount = Math.ceil(scannableArea / scanStep), 
				i, segment, scrollY, maxScanY, segments = [];

			for(i=1;i<=segmentCount;i++) {
				scrollY = (this.viewPortHeight - this.headerPadding - this.footerPadding) * (i - 1);
				maxScanY = i === segmentCount ? this.viewPortHeight : this.viewPortHeight - this.footerPadding;

				segment = { index: i, scrollY: scrollY, maxScanY: maxScanY};
				segments.push(segment);
				console.log(segment);
			}
			
			return segments;
		}

		setup() {

			//this.body.style.overflowY = 'visible';

			this.fullHeight = Math.max( this.body.scrollHeight, this.body.offsetHeight, this.html.clientHeight, this.html.scrollHeight, this.html.offsetHeight );
    	
    		if(this.fullHeight > this.maxHeight) {
    			this.fullHeight = this.maxHeight;
    		}

			this.fullWidth = Math.max( this.body.scrollWidth, this.body.offsetWidth, this.html.clientWidth, this.html.scrollWidth, this.html.offsetWidth );

			if(this.fullWidth > this.maxWidth) {
				this.fullWidth = this.maxWidth;
			}

			this.viewPortWidth = this.html.clientWidth;
   			this.viewPortHeight = this.html.clientHeight;

   			//As we start attaching scan information to dom elements we need a reference to the scan responsible
   			//for appending that information and if we want to replace it with a new scan
   			this.scanToken = TextUtil.randomString(10);

   			this.scannedElements = [];

		}

		getNodeFromPoint(x, y) {

			var el = this.document.elementFromPoint(x, y);

			if(el) {
				
				if(el.childNodes) {
	 
	     			var nodes = el.childNodes;
		 
					if(nodes.length > 0) {

	    				for ( var i = 0, n; n = nodes[i++];) {

	        				if (n.nodeType === 3) {

	            				var r = this.document.createRange();
	 
	        					r.selectNode(n);
	 
	            				var rects = r.getClientRects();
	 
		        				for ( var j = 0, rect; rect = rects[j++];) {
	 
	                				if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
	                    				return n;
	                				}
	            				}
	        				}
	    				}
		 			}

	   			}
	   		}
	   		
	   		return el;		
		}

		addPositionInformation(segment, scrollOffset, element, segmentX, segmentY, elementOffset) {
			var segmentData;
			if(!element.segments || element.segments.scanToken !== this.scanToken) {
				segmentData = { scanToken: this.scanToken };
				element.segments = segmentData;	
			} 
			segmentData = element.segments;

			if(!element.segments[segment.toString()]) {
				var box = this.getElementBounds(element);
				var p = { segment: segment, scrollY: scrollOffset, box: box, center: elemCalcs.getCenter(box.xmin,box.xmax,box.ymin,box.ymax), scrollableAncestorScrollTop:elementOffset};
				element.segments[segment.toString()] = p;
			}

		}

		getElementBounds(elem) {
	    	var rect, box = {};
	    
	    	if (elem.nodeType === 3) {
				var r = this.document.createRange();
	            r.selectNode(elem);
	            rect = r.getBoundingClientRect();
	        }
	        else
	        {
		    	rect=elem.getBoundingClientRect();
		    }	

		    box.xmin=rect.left;
	        box.ymin=rect.top;
	        box.xmax=rect.right;
	        box.ymax=rect.bottom;

	        return box;
	    }


	}


	return Scanner;

})
