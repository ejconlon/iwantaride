var DEBUG_ENABLED = true;
function getBaseURL () {
   return location.protocol + "//" + location.hostname + 
      (location.port && ":" + location.port) + "/";
}
var lat = null;
var lon = null;

function debug(msg) {
    if (DEBUG_ENABLED) {
	console.log(msg);
    }
}

function my_marker(type,route,latLng,image,title){
	var t = this;
	this.my_route = route;
	this.map = this.my_route.map;
	this.marker_type = type;
	
	
	this.marker = new google.maps.Marker({
    position: latLng,
    title: title,
    map: t.map,
	icon : image,
    draggable: true
  });

	this.clear_from_map = function (){
		t.marker.setMap(null)
		google.maps.event.removeListener(t.dragstart);
		google.maps.event.removeListener(t.drag);
		google.maps.event.removeListener(t.dragend);
		delete t.marker;
	
	}
	
  


	this.dragstart = google.maps.event.addListener(this.marker, 'dragstart', function() {
	    debug(t.marker.getPosition());
	
		
	   
	  });

	  this.drag = google.maps.event.addListener(this.marker, 'drag', function() {
	    debug('Dragging...');
	    debug(t.marker.getPosition());
	  });

	  this.dragend = google.maps.event.addListener(this.marker, 'dragend', function(a) {
	    debug('Drag ended');
		switch (t.marker_type){
				case "START":
					t.my_route.action(t.latLng);
				break;
				default:
					t.my_route.action(false,t.latLng);
				break;
		}
	    debug(a);
	  });


}
//


function my_route(map){
	var t = this;
	
	_construct = function (){
		t.CURRENT_APP_STATE = 'start';
		set_lat_lng();
		t.map = map;
		t.start_marker = false;
		t.end_marker = false;
		t.directionsService = new google.maps.DirectionsService();
		if (t.map){
			//overlayPoint();
			google.maps.event.addListener(t.map, 'dblclick', double_clicked);
			
			var myLatLng = new google.maps.LatLng(lat, lon);
			
				init_cb();

		}
	
		t.directionsRenderer = new google.maps.DirectionsRenderer;
		
	}
	
	this.load = function (){
		var from = false;
		var to = false;
		var from_lon = $("#from_lon").val();
		var from_lat = $("#from_lat").val();
		var to_lon = $("#to_lon").val();
		var to_lat = $("#to_lat").val();
		if (from_lon && from_lat){
			 from = new google.maps.LatLng(from_lat, from_lon);
		
		}
		if (to_lat && to_lon){
			to = new google.maps.LatLng(to_lat, to_lon);
		}
		this.action(to,from)
		
	}
	
	
	
	this.action = function (newStart,newEnd){
		if (newStart){
			if (t.start_marker){
				t.start_marker.clear_from_map();
			}
			t.start_marker = new my_marker("START",t, newStart, getBaseURL()+'img/car_icon.jpg','startPoint');
			
		}
		if (newEnd){
			if (t.end_marker){
				t.end_marker.clear_from_map();
			}
			t.end_marker = new my_marker("END",t, newEnd, getBaseURL()+'img/flag.png','endPoint');
		}
		
		if ((t.start_marker) && (t.end_marker)){
			calcRoute(t.start_marker.marker.position,t.end_marker.marker.position);
		}
		
		if (t.start_marker){
			$("#from_lon").val(t.start_marker.marker.position.lng());
			 $("#from_lat").val(t.start_marker.marker.position.lat());
			
		}
		if (t.end_marker){
			$("#to_lon").val(t.end_marker.marker.position.lng());
			$("#to_lat").val(t.end_marker.marker.position.lat());
		}
	 	
	
	}
	
	
	double_clicked = function (a){
		//new my_marker(t.map, a.latLng, 'img/car_icon.jpg');
		//debug(t.CURRENT_APP_STATE);
		t.latLng = a.latLng
		switch (t.CURRENT_APP_STATE){
			case "start":
				t.action(t.latLng);
				t.CURRENT_APP_STATE = "startSet";
			break;
			default:
				t.action(false,t.latLng);
				t.CURRENT_APP_STATE = "endSet";
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
	      t.directionsRenderer.setMap(t.map);
	      t.directionsRenderer.setDirections(result);
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

	function overlayPoint(){
		var image = 'img/beachflag.png';
	    var myLatLng = new google.maps.LatLng(lat, lon);
	    var beachMarker = new google.maps.Marker({
	        position: myLatLng,
	        map: t.map,
	        icon: image
	    });
	}
	
 _construct();
}
var instance;

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
function initialize(){
	set_lat_lng();
	var map = draw_map();
	route = new my_route(map);
	instance = route; 
}

$(document).ready(function() {
	
	$("#lonfield").val(lon)
	$("#lonfield").val(lon)
        $("#datepicker").datepicker({dateFormat: 'yy-mm-dd'})
	
	google.maps.event.addDomListener(window, 'load', initialize);
	
    
	
});

