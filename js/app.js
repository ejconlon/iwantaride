var DEBUG_ENABLED = true;
var lat = null;
var lon = null;

function debug(msg) {
    if (DEBUG_ENABLED) {
	console.log(msg);
    }
}

function my_marker(map,latLng,image,title){
	var t = this;
	
	this.map = map;
	
	
	
	this.marker = new google.maps.Marker({
    position: latLng,
    title: title,
    map: map,
	icon : image,
    draggable: true
  });

	this.clear_from_map = function (){
		t.marker.setMap(null)
		google.maps.event.removeListener(t.dragstart);
		google.maps.event.removeListener(t.drag);
		google.maps.event.removeListener(t.dragend);
	
	}
	
   	var _clear_from_map = function (){
	t.map.removeOverlay(t.marker);
	google.maps.event.removeListener(t.dragstart);
	google.maps.event.removeListener(t.drag);
	google.maps.event.removeListener(t.dragend);
	}


	this.dragstart = google.maps.event.addListener(this.marker, 'dragstart', function() {
	    debug(t.marker.getPosition());
	   
	  });

	  this.drag = google.maps.event.addListener(this.marker, 'drag', function() {
	    debug('Dragging...');
	    debug(t.marker.getPosition());
	  });

	  this.dragend = google.maps.event.addListener(this.marker, 'dragend', function() {
	    debug('Drag ended');
	    debug(t.marker.getPosition());
	  });


}
//


function my_map(){
	var t = this;
	_construct = function (){
		t.CURRENT_APP_STATE = 'start';
		set_lat_lng();
		t.map = draw_map();
		t.directionsService = new google.maps.DirectionsService();
		if (t.map){
			//overlayPoint();
			google.maps.event.addListener(t.map, 'dblclick', double_clicked);
			
			var myLatLng = new google.maps.LatLng(lat, lon);
			
				init_cb();

		}
		
	}
	
	double_clicked = function (a,b){
		//new my_marker(t.map, a.latLng, 'img/car_icon.jpg');
		//debug(t.CURRENT_APP_STATE);
		t.latLng = a.latLng
		switch (t.CURRENT_APP_STATE){
			case "start":
				
				t.start_marker = new my_marker(t.map, t.latLng, 'img/car_icon.jpg','startPoint');
				t.CURRENT_APP_STATE = "startSet";
			break;
			case "startSet":
				 t.end_marker = new my_marker(t.map, t.latLng, 'img/flag.png','endPoint');
				 t.CURRENT_APP_STATE = "endSet";
				 calcRoute(t.start_marker.marker.position,t.end_marker.marker.position);
				
				
			break;
			
		}
		
		debug(a.latLng);
	}
	 this.clearClicked = function (){
		if (this.start_marker){
			this.start_marker.clear_from_map()
		}
		if (this.end_marker){
			this.end_marker.clear_from_map();
		}
		
		this.CURRENT_APP_STATE = 'start';
	}
	
	
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
	//processRoute([0,results['routes']]);	
		
		
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
	    disableDoubleClickZoom : true,
		center: new google.maps.LatLng(lat, lon),
	    mapTypeId: google.maps.MapTypeId.ROADMAP
	  }
	
	  return new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	}else{
		return false;
	}
	}
	
 _construct();
}
var instance;
function initialize(){
	instance = new my_map();
}

$(document).ready(function() {
	
	$("#lonfield").val(lon)
	$("#lonfield").val(lon)
	
	google.maps.event.addDomListener(window, 'load', initialize);
	
    
	
});

