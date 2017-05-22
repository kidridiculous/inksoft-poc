define('util/Distance', function() {


	function distanceToMinWithoutAngles(elem1,elem2){
		//elem1 is input elem2 is text  
		//so input could be at 100,100 and text could be at 50,100 then what happens.
		//50-100 = -50,100-100 = 0 so vector is at -50,0 which is what degree 90 not 270
		//-50,0 is -90
		//middle to middle
		//400 to 600 middle is 500 not 200
		//e1midx=elem1.xmin+(elem1.xmax-elem1.xmin)/2;
		//e2midx=elem2.xmin+(elem2.xmax-elem2.xmin)/2;
		//e1midy=elem1.ymin+(elem1.ymax-elem1.ymin)/2;
		//e2midy=elem2.ymin+(elem2.ymax-elem2.ymin)/2;
		//var d=Math.sqrt(Math.pow(e2midx-e1midx,2)+Math.pow(e2midy-e1midy,2));
		//using input upper right to text lower left sounds good
		//var d=Math.sqrt(Math.pow(elem2.xmax-elem1.xmin,2)+Math.pow(elem2.ymax-elem1.ymin,2));
		//using upper right corners. upper right is 0,0 which is minx and miny
		var d=Math.sqrt(Math.pow(elem2.xmin-elem1.xmin,2)+Math.pow(elem2.ymin-elem1.ymin,2));
		//up is 0 90 is to the right -90 is to the left
		//down is 180 or -180  up is 0
		//so this one I want to make sure it's either to the left which is -90
		//left is -75 or less, -115 or more so greater than -115 but less than -75
		return d;
	} 
   
	function distanceToMin(elem1,elem2){
		//elem1 is input elem2 is text  
		//so input could be at 100,100 and text could be at 50,100 then what happens.
		//50-100 = -50,100-100 = 0 so vector is at -50,0 which is what degree 90 not 270
		//-50,0 is -90
		//middle to middle
		//400 to 600 middle is 500 not 200
		//e1midx=elem1.xmin+(elem1.xmax-elem1.xmin)/2;
		//e2midx=elem2.xmin+(elem2.xmax-elem2.xmin)/2;
		//e1midy=elem1.ymin+(elem1.ymax-elem1.ymin)/2;
		//e2midy=elem2.ymin+(elem2.ymax-elem2.ymin)/2;
		//var d=Math.sqrt(Math.pow(e2midx-e1midx,2)+Math.pow(e2midy-e1midy,2));
		//using input upper right to text lower left sounds good
		//var d=Math.sqrt(Math.pow(elem2.xmax-elem1.xmin,2)+Math.pow(elem2.ymax-elem1.ymin,2));
		//using upper right corners. upper right is 0,0 which is minx and miny
		var d=Math.sqrt(Math.pow(elem2.xmin-elem1.xmin,2)+Math.pow(elem2.ymin-elem1.ymin,2));
		var angle = Math.atan2(elem1.ymin - elem2.ymin,elem1.xmin - elem2.xmin)*180/Math.PI	
		//0 is to the left and it goes clockwise so 90 is up, 180 is right 270 is down
		//up is 0 90 is to the right -90 is to the left
		//down is 180 or -180  up is 0
		//so this one I want to make sure it's either to the left which is -90
		//left is -75 or less, -115 or more so greater than -115 but less than -75
		//shippingAddressFieldGroup4-shippingPostalCode
		//if(elem.id&&elem.id=="zipcode"){
		//		consolelog("tempnodenearestmin="+elem2.nodeValue+ " angle="+angle +" min="+d);
		//		consolelog("temptextnearestmin="+elem2.textContent+" angle="+angle +" min="+d);
		//}
		if((angle<10&&angle>-10)||(angle>75&&angle<115&&d<50)){
			return d;
		}
		else{
			return 4*d; //this will take the others out of the picture
		}
	}     
	
	function distanceToMax(elem1,elem2){
		//max case should be used when
		//when to the right like total and tax
		//elem1 is input elem2 is text
		//middle to middle
		//400 to 600 middle is 500 not 200
		//e1midx=elem1.xmin+(elem1.xmax-elem1.xmin)/2;
		//e2midx=elem2.xmin+(elem2.xmax-elem2.xmin)/2;
		//e1midy=elem1.ymin+(elem1.ymax-elem1.ymin)/2;
		//e2midy=elem2.ymin+(elem2.ymax-elem2.ymin)/2;
		//var d=Math.sqrt(Math.pow(e2midx-e1midx,2)+Math.pow(e2midy-e1midy,2));
		//using input upper right to text lower left sounds good
		//var d=Math.sqrt(Math.pow(elem2.xmax-elem1.xmin,2)+Math.pow(elem2.ymax-elem1.ymin,2));
		//using upper right corners. upper right is 0,0 which is minx and miny
		//this one is to the right or down the right is 90 so 
		var d=Math.sqrt(Math.pow(elem2.xmax-elem1.xmin,2)+Math.pow(elem2.ymax-elem1.ymin,2));
		//for max
		var angle = Math.atan2(elem1.ymin - elem2.ymax,elem1.xmin - elem2.ymax)*180/Math.PI	
		//left is 0 and it goes clockwise so this is only to right or bottom
		if((angle>165&&angle<195)||(angle>265&&angle<285&&d<50)){
			return d;
		}
		else{
			return 4*d; //this will take the others out of the picture
		}
	}  

	function getDistanceVector(interactiveEl, textEl) {
		//Use center to determine a general location
		let vector, location = 'NONE', centerDistance=-1, distance=-1, angle=0;
		const elParentScrollY = interactiveEl.scrollableAncestorScrollTop, textElParentScrollY = textEl.scrollableAncestorScrollTop;

		centerDistance = distanceBetweenPoints(textEl.center.x, textEl.center.y, interactiveEl.center.x, interactiveEl.center.y);

		if(elParentScrollY === textElParentScrollY) {
			if(isInside(textEl.center, interactiveEl.xmin, interactiveEl.ymin, interactiveEl.xmax, interactiveEl.ymax)) {
				location = 'INSIDE';
				distance = 0;
			}
			else {
					
				if(isTextRight(textEl, interactiveEl)) {
					location = 'RIGHT';
					distance = distanceBetweenPoints(textEl.xmin, textEl.center.y, interactiveEl.xmax, interactiveEl.center.y);
					angle = angleBetweenPoints(textEl.xmin, textEl.center.y, interactiveEl.xmax, interactiveEl.center.y);
				}
				else if(isTextAbove(textEl, interactiveEl)) {
					location = 'ABOVE';
					//TODO - should be opposite edge for RTL 
					distance = distanceBetweenPoints(textEl.xmin, textEl.ymax, interactiveEl.xmin, interactiveEl.ymin);
					angle = angleBetweenPoints(textEl.xmin, textEl.ymax, interactiveEl.xmin, interactiveEl.ymin);
				}
				else if(isTextLeft(textEl, interactiveEl)) {
					location = 'LEFT';
					distance = distanceBetweenPoints(textEl.xmax, textEl.center.y, interactiveEl.xmin, interactiveEl.center.y);
					angle = angleBetweenPoints(textEl.xmax, textEl.center.y, interactiveEl.xmin, interactiveEl.center.y);
				} else if(isTextBelow(textEl, interactiveEl)) {
					location = 'BELOW';
					//TODO - should be opposite edge for RTL 
					distance = distanceBetweenPoints(textEl.xmin, textEl.ymin, interactiveEl.xmin, interactiveEl.ymax);
					angle = angleBetweenPoints(textEl.xmin, textEl.ymin, interactiveEl.xmin, interactiveEl.ymax);
				}
			}
		}

		
		vector = {
			location: location,
			centerDistance: centerDistance,
			distance: distance,
			angle: angle,
			text: textEl.humanText,
			center: { x: textEl.center.x, y: textEl.center.y }
		}

		return vector;
	
	}

	function angleBetweenPoints(x1, y1, x2, y2) {
		let rise = y1 - y2,
			run = x1 - x2;

		return Math.atan2(rise, run) * 180 / Math.PI;
	}

	function distanceBetweenPoints(x1, y1, x2, y2) {
		return Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2));
	}

	function isInside(innerPoint, x1, y1, x2, y2) {

		let innerX = innerPoint.x, innerY = innerPoint.y;

		return (innerX > x1 && innerX < x2) && (innerY > y1 && innerY < y2);
	}

	function isTextRight(textEl, el) {
		let xDistance = textEl.xmin - el.xmax,
			topRight = 0, bottomRight = 0, angle=15;

		if(xDistance < 0) {
			return false;
		} else if (xDistance < 25) {
			angle = 35;
		}

		topRight = angleBetweenPoints(textEl.xmin, textEl.ymin, el.xmax, el.ymin);
		bottomRight = angleBetweenPoints(textEl.xmin, textEl.ymax, el.xmax, el.ymax);
				
		return (topRight > (angle * -1) && topRight < 90) && (bottomRight > -90 && bottomRight < angle);
	}

	function isTextLeft(textEl, el) {
		let topLeft = angleBetweenPoints(textEl.xmax, el.ymin, el.xmin, textEl.ymin),
			bottomLeft = angleBetweenPoints(textEl.xmax, el.ymax, el.xmin, textEl.ymax);
		return (topLeft < -90  || topLeft >= 165) && (bottomLeft > 90 || bottomLeft <= -165);
	}

	function isTextAbove(textEl, el) {
		let topLeft, 
			topRight;
		
		const yDiff = el.ymin - textEl.ymax,
			xDiff = el.xmin - textEl.xmin,
			elHeight = el.ymax - el.ymin,
			yOverlap = textEl.ymax - el.ymin,
			textElHeight = textEl.ymax - textEl.ymin;

		//If the bottom of the text element has a small overlap with the element 
		//and that overlap is less than 10% of textEl Height and less than 10% of element height
		//use the top of the text el to calculate angles
		if (yOverlap > 0 && yOverlap <= ((textEl.ymax - textEl.ymin) * .1) && yOverlap <= ((el.ymax - el.ymin) * .1)) {
			topLeft = angleBetweenPoints(textEl.xmin, textEl.ymin, el.xmin, el.ymin);
			topRight = angleBetweenPoints(textEl.xmax, textEl.ymin, el.xmax, el.ymin);
		} else {
			topLeft = angleBetweenPoints(textEl.xmin, textEl.ymax, el.xmin, el.ymin);
			topRight = angleBetweenPoints(textEl.xmax, textEl.ymax, el.xmax, el.ymin);	
		}
		
		// text Falls above the element inside the funnel that extends from the elements xmin and xmax and fanning 15 degrees outside from those points
		const textAboveAndContained = topLeft >= -105 && topLeft < 0 && topRight <= -75 && topRight > -180;

		// handle the scenario where there is an input element and the text above is longer that the input
		const textAboveButWiderThanInput = topLeft >= -105 && topLeft < 0 && yDiff <= elHeight && Math.abs(el.xmin - textEl.xmin) <= elHeight;

		// handle the scenario where there is an input element and the text above is next to the input but slightly to the left and falls outside of the top funnel
		const textAboveButOutsideTheTopFunnelDueToProximity = yDiff >= 0 && yDiff <= textElHeight && xDiff >= 0 && xDiff <= textElHeight;

		return textAboveAndContained || textAboveButWiderThanInput || textAboveButOutsideTheTopFunnelDueToProximity;
	}

	function isTextBelow(textEl, el) {
		let bottomLeft = angleBetweenPoints(textEl.xmin, textEl.ymin, el.xmin, el.ymin),
			bottomRight = angleBetweenPoints(textEl.xmax, textEl.ymin, el.xmax, el.ymax);
		return bottomLeft <= 105 && bottomLeft > 0 && bottomRight >= 75 && bottomRight < 180;
	}

	
	function findNearestClusterTo(refEl, nearElLists, i, j, cluster) {
			//If we are done finding the nearest elements
		if(i === nearElLists.length) {
			//Append the refElement to the cluster and return the cluster
			cluster.push(refEl);
			return cluster;
		}

		let elList = nearElLists[i], el1, el2, distEl1, distEl2;
		if(j===0) {
			cluster.push(elList[j]);
			return findNearestClusterTo(refEl, nearElLists, i, j+1, cluster);
		}else if(j === elList.length) {
			return findNearestClusterTo(refEl, nearElLists, i+1, 0, cluster);
		} else {
			el1 = cluster[cluster.length-1];
			el2 = elList[j];
			distEl1 = distanceBetweenPoints(refEl.center.x, refEl.center.y, el1.center.x, el1.center.y);
			distEl2 = distanceBetweenPoints(refEl.center.x, refEl.center.y, el2.center.x, el2.center.y);

			if(distEl2 < distEl1) {
				cluster[cluster.length-1] = el2;
			}
			return findNearestClusterTo(refEl, nearElLists, i, j+1, cluster);
		}
	}

	function isElementBelow(refEl, belowEl) {
		let xPad = 10;
		return refEl.ymax < belowEl.ymin &&
			(refEl.xmin - xPad) < belowEl.xmin &&
			(refEl.xmax + xPad) > belowEl.xmax;
	}

	class GeometricMedian {

		constructor(points) {
			this.points = points;

			this.precision = 1;

			// given a point (x, y) on a grid, we can find its left/right/up/down neighbors
			// by using these constants: (x + dx[0], y + dy[0]) = upper neighbor etc.
			this.dx = [-1, 0, 1, 0];
			this.dy = [0, 1, 0, -1];

			this.medianX =0;
			this.medianY =0;

			this.points.forEach(function(p){
				this.medianX += p.x;
				this.medianY += p.y;
			}, this);

			this.medianX = this.medianX / this.points.length;
			this.medianY = this.medianY / this.points.length;
		}

		calculate() {	
			let d = this.distanceTo(this.medianX, this.medianY), 
				step = 100,
				done = false, nx, ny, t, i;

    		// while we still need a more precise answer
    		while ( step > this.precision )
    		{
		        done = false;
		        for (i=0;i<4;++i)
		        {
		            // check the neighbors in all 4 directions.
		            nx = this.medianX + step*this.dx[i];
		            ny = this.medianY + step*this.dy[i];

		            // find the sum of distances to each neighbor
		            t = this.distanceTo(nx, ny);

		            // if a neighbor offers a better sum of distances
		            if ( t < d )
		            {
		                //update the current minimum
		                d = t;
		                this.medianX = nx;
		                this.medianY = ny;

		                // an improvement has been made, so
		                // don't half step in the next iteration, because we might need
		                // to jump the same amount again
		                done = true;
		                break;
		            }
		        }

		        // half the step size, because no update has been made, so we might have
		        // jumped too much, and now we need to head back some.
		        if ( !done ) {
		        	step = step / 2;
		        }
		    }

		    return {x:this.medianX, y:this.medianY};
		}

		distanceTo(x, y) {

			let distSum = 0, i, dx, dy;

    		for (i = 0; i < this.points.length; i++ ) {
    			dx = this.points[i].x - this.medianX;
    			dy = this.points[i].y - this.medianY;

    			distSum += Math.sqrt(dx*dx + dy*dy);
    		}
    	
    		return distSum;
		}
	}


	function findGeometricMedian(elements) {
		let points = [], gm;

		elements.forEach(function(el) {
			points.push(el.center);
		});

		gm = new GeometricMedian(points);

		return gm.calculate();
	}

	function getDistanceSummary(refPoint, elements) {
		let dists = [], sum = 0, d, mean=0;

		elements.forEach(function(el){
			d = distanceBetweenPoints(refPoint.x, refPoint.y, el.center.x, el.center.y);
			sum += d;
			dists.push(d);
		});


		
		return {
			mean:(sum/elements.length), 
			min: Math.min.apply(null, dists), 
			max: Math.max.apply(null, dists)
		};
	}

	return {
		distanceToMax: distanceToMax,
		distanceToMin: distanceToMin,
		distanceToMinWithoutAngles: distanceToMinWithoutAngles,
		getDistanceVector: getDistanceVector,
		distanceBetweenPoints: distanceBetweenPoints,
		isTextAbove:isTextAbove,
		findNearestClusterTo: findNearestClusterTo,
		findGeometricMedian: findGeometricMedian,
		getDistanceSummary: getDistanceSummary,
		isElementBelow: isElementBelow
	}
})