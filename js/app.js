var DEBUG_ENABLED = true;
function getBaseURL () {
   return location.protocol + "//" + location.hostname + 
      (location.port && ":" + location.port) + "/";
}
var lat = null;
var lon = null;
var map = null;
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
function my_route_display(map){
	var t = this;
	t.map = map;
	var _construct = function (){
		
		if ($("#ride_id").val()){
			var url = "rides.json/"+$("#ride_id").val();
		}else{
			var url = rides.json;
		}
		
		$.ajax({
			dataType: 'json',
		  url: getBaseURL() + url,
		  context: t,
		}).done(function(a) { 
		  	var b = new my_route(t.map);
			b.processRoute([0,a]);	
			
		});
		
	}
	_construct();
	// http://localhost:5000/rides.json
	
}


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
		$("#"+t.map.b.id).trigger('route_processed',result);
		
	      //t.directionsRenderer.setDirections(result);
	   }
	
	function returnDirectionOverlay(){
		
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
	 t.processRoute = function(argumentArray){
		
		var key = argumentArray[0];
		var results = argumentArray[1];
		var newKey = key + 1; 
		if (results[key]){
			currentResult = results[key];
			var lat =  (currentResult['from_lat']);
			var lon = (currentResult['from_lon']);
			var starLatLng = new google.maps.LatLng(lat, lon);
			var lat = currentResult['to_lat'];
			var lon = currentResult['to_lon'];
			var endLatLng = new google.maps.LatLng(lat, lon);
			var cb_arguments = [newKey,  results]
			calcRoute(starLatLng,endLatLng, t.processRoute,cb_arguments);
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

function map_shower_reader_handler(event,directionOverlay){
	
	var directionsRenderer = new google.maps.DirectionsRenderer;
		directionsRenderer.setMap(map)
		directionsRenderer.setDirections(directionOverlay);
		console.log(event);
		
}
var globalDirectionRender;
function map_picker_handler(event,directionOverlay){
	
	 	globalDirectionRender.setDirections(directionOverlay);
	
		
}


function draw_map(){
	var myOptions = {
		zoom: 12,
    	disableDoubleClickZoom : true,
		center: new google.maps.LatLng(lat, lon),
    	mapTypeId: google.maps.MapTypeId.ROADMAP
  	}
	if ($('#map_picker').length != 0) {
		$('#map_picker').bind("route_processed",map_picker_handler);
		globalDirectionRender = new google.maps.DirectionsRenderer;
		map = new google.maps.Map(document.getElementById("map_picker"), myOptions);
		globalDirectionRender.setMap(map);
		
		return map;
		
		
	}else if ($('#map_shower').length != 0){
		$('#map_shower').bind("route_processed",map_shower_reader_handler);
		return new google.maps.Map(document.getElementById("map_shower"), myOptions);
	}else {
	return false;
}
}

function initialize(){
	set_lat_lng();
	 if ($('#map_picker').length != 0){
		 map = draw_map('#map_picker');
		route = new my_route(map);
	}
	if ($('#map_shower').length != 0){
		 map = draw_map('#map_shower');
		route = new my_route_display(map);
	}
	instance = route; 
}



$(document).ready(function() {
	
	$("#lonfield").val(lon)
	$("#lonfield").val(lon)
        $("#datepicker").datepicker({dateFormat: 'yy-mm-dd'})
	
	google.maps.event.addDomListener(window, 'load', initialize);
	
    
	
});

