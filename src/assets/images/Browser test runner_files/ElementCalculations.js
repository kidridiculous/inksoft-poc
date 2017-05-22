define('util/ElementCalculations', [], function(){

	class ElementCalculations {

		constructor() {

		}

		determineCenter(element){

			if(!element) {return null;}

			var xmin = element.xmin,
			xmax = element.xmax,
			ymin = element.ymin,
			ymax = element.ymax;

			return this.getCenter(xmin, xmax, ymin, ymax);

		}

		getCenter(xMin, xMax, yMin, yMax) {
			var center = {
				x:xMin + (xMax - xMin)/2,
				y:yMin + (yMax - yMin)/2
			}

			return center;
		}

		assignDimensions (el) {
			var key = Object.keys(el.segments)[0];
			var p = el.segments[key];
			el.xmin = p.box.xmin;
			el.xmax = p.box.xmax;
			el.ymin = p.box.ymin + p.scrollY;
			el.ymax = p.box.ymax + p.scrollY;
			el.segmentScrollY = p.scrollY;
			el.scrollableAncestorScrollTop = p.scrollableAncestorScrollTop;
		}

		assignAreaDimensions(image, area) {
			let x1,y1,x2,y2,radius,coordSplit;
			if(area.tagName !== 'AREA') { return;}
			if(area.getAttribute('shape') === 'rect') {
				if(area.getAttribute('coords') !== null) {
					coordSplit = area.getAttribute('coords').split(',');

					if(coordSplit.length !== 4) { return;}

					x1 = parseInt(coordSplit[0]);
					y1 = parseInt(coordSplit[1]);
					x2 = parseInt(coordSplit[2]);
					y2 = parseInt(coordSplit[3]);

					area.xmin = parseInt(image.xmin) + x1;
					area.ymin = parseInt(image.ymin) + y1;
					area.xmax = parseInt(image.xmin) + x2;
					area.ymax = parseInt(image.ymin) + y2;	
				}
				

			} else if (area.getAttribute('shape') === 'circle') {
				if(area.getAttribute('coords') !== null) {
					coordSplit = area.getAttribute('coords').split(',');

					if(coordSplit.length !== 3) { return; }
						
					x1 = parseInt(coordSplit[0]);
					y1 = parseInt(coordSplit[1]);
					radius = parseInt(coordSplit[2]);

					area.xmin = parseInt(image.xmin) + x1 - radius;
					area.xmax = parseInt(image.xmin) + x1 + radius;
					area.ymin = parseInt(image.ymin) + y1 - radius;
					area.ymax = parseInt(image.ymin) + y1 + radius;
				}
			} else if (area.getAttribute('shape') === 'poly') {
				if(area.getAttribute('coords') !== null) {
					coordSplit = area.getAttribute('coords').split(',');
					x1 = 0;
					x2 = 0;
					y1 = 0;
					y2 = 0;
					coordSplit.forEach(function(val, idx) {
						if(idx % 2 === 0) {
							//Its an x coord
							x1 = Math.min(x1, parseInt(val));
							x2 = Math.max(x2, parseInt(val));
						} else {
							//Its a y coord
							y1 = Math.min(x1, parseInt(val));
							y2 = Math.max(x2, parseInt(val));
						}
					});

					area.xmin = parseInt(image.xmin) + x1;
					area.ymin = parseInt(image.ymin) + y1;
					area.xmax = parseInt(image.xmin) + x2;
					area.ymax = parseInt(image.ymin) + y2;	
				}
			}
		}


	}	

	return ElementCalculations;
});	