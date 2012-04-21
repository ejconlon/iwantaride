var DEBUG_ENABLED = true;
var lat = null;
var lon = null;

function debug(msg) {
    if (DEBUG_ENABLED) {
	console.log(msg);
    }
}

function my_map(){
	var t = this;
	function renderDirections(result) {
	      var directionsRenderer = new google.maps.DirectionsRenderer;
	      directionsRenderer.setMap(t.map);
	      directionsRenderer.setDirections(result);
	   }
	function calcRoute(start,end,calc_cb,cb_args) {
    	var request = {
        origin:start, 
        destination:end,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    	};

		t.directionsService.route(request, function(response, status) {
		debug("callback called");
		debug(status)	;
      if (status == google.maps.DirectionsStatus.OK) {
		
        renderDirections(response);
      }
		if (typeof(calc_cb)=="function"){
				calc_cb(cb_args);

		}

    });
  }
	function processRoute(argumentArray){
		
		var key = argumentArray[0];
		var results = argumentArray[1];
		var newKey = key + 1; 
		if (results[key]){
			currentResult = results[key];
			var lat =  (currentResult['start_point']['lat']);
			var lon = (currentResult['start_point']['lon']);
			var starLatLng = new google.maps.LatLng(lat, lon);
			var lat = currentResult['end_point']['lat'];
			var lon = currentResult['end_point']['lon'];
			var endLatLng = new google.maps.LatLng(lat, lon);
			var cb_arguments = [newKey,  results]
			calcRoute(starLatLng,endLatLng, processRoute,cb_arguments);
			}
		
	}
	
	function init_cb() {
		var results ={
			'routes': [
				{
					'start_point' : {'lat' : Number(lat)+ Number(.1) , 'lon' : Number(lon) + Number(.01)},
					'end_point' : {'lat' : Number(lat) -.01, 'lon' : Number(lon) } 
					
				},
				{
					'start_point' : {'lat' : Number(lat)+ .1 , 'lon' : Number(lon) + .1},
					'end_point' : {'lat' : Number(lat) -.1, 'lon' : Number(lon) + 1 } 
					
				}
			]
			
		}
	processRoute([0,results['routes']]);	
		
		
	}
	function set_lat_lng() {
	    if (google.loader.ClientLocation) {
		lat = google.loader.ClientLocation.latitude;
		lon = google.loader.ClientLocation.longitude;
	    } else {
		debug('Location set manually');
		lat = '36.9742';
		lon = '-122.0297';
	    }
	}
	function overlayPoint(){
		var image = 'img/beachflag.png';
	    var myLatLng = new google.maps.LatLng(lat, lon);
	    var beachMarker = new google.maps.Marker({
	        position: myLatLng,
	        map: t.map,
	        icon: image
	    });
	}
	function draw_map(){
		 if ($('#map_canvas').length != 0) {
		var myOptions = {
	    zoom: 12,
	    center: new google.maps.LatLng(lat, lon),
	    mapTypeId: google.maps.MapTypeId.ROADMAP
	  }
	
	  return new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	}else{
		return false;
	}
	}
	
	set_lat_lng();
	this.map = draw_map();
	this.directionsDisplay = new google.maps.DirectionsRenderer();
	this.directionsDisplay.setMap(this.map);
	this.directionsService = new google.maps.DirectionsService();
	if (this.map){
		//overlayPoint();
		init_cb();
		
	}
}


$(document).ready(function() {
	$("#lonfield").val(lon)
	$("#lonfield").val(lon)
	
	new my_map();
});

