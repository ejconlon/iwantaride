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
		google.maps.event.removeListener(t.dragend);
		delete t.marker;
	
	}
	
  

;


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
function my_route_display(my_map,route){
	var t = this;
	 t.loaded_routes =[];
	 t.loaded_route_ids = {};
	t.map = my_map.map;
	t.my_route = route;
	var _construct = function (){
		
		if ($("#ride_id").val()){
			var url = "rides.json/"+$("#ride_id").val();
		}else{
			var url = "rides.json";
		}
		
		$.ajax({
			dataType: 'json',
		  url: getBaseURL() + url,
		  context: t,
		}).done(function(a) { 
		  	t.processRoute([0,a]);	
			
		});
		
	}
	
	 t.processRoute = function(argumentArray){
		
		var key = argumentArray[0];
		var results = argumentArray[1];
		var newKey = key + 1; 
		if (results[key]){
			t.loaded_routes.push(results[key]);
			t.loaded_route_ids[results[key]['uid']] = key;
			
			
			currentResult = results[key];
			var lat =  (currentResult['from_lat']);
			var lon = (currentResult['from_lon']);
			var starLatLng = new google.maps.LatLng(lat, lon);
			var lat = currentResult['to_lat'];
			var lon = currentResult['to_lon'];
			var endLatLng = new google.maps.LatLng(lat, lon);
			var cb_arguments = [newKey,  results]
			var return_id;
			if (results[key]['uid']){
				
				return_id = results[key]['uid']
			}else{
				return_id = false
			}
				 t.my_route.calcRoute(starLatLng,endLatLng, t.processRoute,cb_arguments,return_id);
			}
		
	}
	
	_construct();
	// http://localhost:5000/rides.json
	
}


function my_route(my_map,isEditable){
	var t = this;
	 t.isEditable =isEditable;
	t.map = my_map.map;
	
	_construct = function (){
		t.CURRENT_APP_STATE = 'start';
		t.start_marker = false;
		t.end_marker = false;
		t.directionsService = new google.maps.DirectionsService();
		if (t.map){
			if (t.isEditable){
				google.maps.event.addListener(t.map, 'dblclick', double_clicked);
			}
			var myLatLng = new google.maps.LatLng(lat, lon);
			
				
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
			t.calcRoute(t.start_marker.marker.position,t.end_marker.marker.position);
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
	
	
	function renderDirections(result,id) {
		$("#"+t.map.b.id).trigger('route_processed', [result,id]);
		
	   }
	
	function returnDirectionOverlay(){
		
	}
	

	 t.calcRoute = function (start,end,calc_cb,cb_args,id) {
    	var request = {
        origin:start, 
        destination:end,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    	};

		t.directionsService.route(request, function(response, status) {
		debug("callback called");
		debug(status)	;
      if (status == google.maps.DirectionsStatus.OK) {
		renderDirections(response,id);
      }
		if (typeof(calc_cb)=="function"){
				calc_cb(cb_args);

		}

    });
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




var globalDirectionRender;




function my_map(id){
	var t = this;
	draw_map(id);
	function draw_map(id){
		var myOptions = {
			zoom: 12,
    		disableDoubleClickZoom : true,
			center: new google.maps.LatLng(lat, lon),
    		mapTypeId: google.maps.MapTypeId.ROADMAP
  		}
		if ($("#"+id).length != 0) {
			t.map = new google.maps.Map(document.getElementById(id), myOptions);

		

	}else {
	return false;
}
}


  t.dragend = google.maps.event.addListener(this.map, 'bounds_changed', function() {
    $("#"+t.map.b.id).trigger('bounds_changed',t.map);
	
  });
 
	
}


	

function app(){
	
	var t = this;
	t.map_shower = false;
	t.map_picker = false;
	t.globalDirectionRender = false;	
	t.current_data = false;
	var map_shower_reader_handler = function (event,directionOverlay,new_id){
		
		
		
		var id = new_id;
		var currentData = t.display_port_shower.loaded_routes;
		currentData = currentData[t.display_port_shower.loaded_route_ids[new_id]]
		if ((currentData) &&(currentData["wantorhave"]=="have")){
			var stroke = "#40e0d0";
		}else{
			var stroke = "#FF9966";
			
			
		}
		// var image = getBaseURL()+'img/car_icon.jpg';
		// 	var marker = new google.maps.Marker({
		// 				    position: directionOverlay.routes[0].legs[0].start_location,
		// 				    title: "Start",
		// 				    map: t.map_shower.map,
		// 			icon : image,
		// 				  });
		// 			
		// 				 image = getBaseURL()+'img/flag.png';
		// 				 marker = new google.maps.Marker({
		// 							    position: directionOverlay.routes[0].legs[0].end_location,
		// 							    title: "end",
		// 							    map: t.map_shower.map,
		// 						icon : image,
		// 							  });
	
		
		var directionsRenderer = new google.maps.DirectionsRenderer({suppressMarkers : false , polylineOptions : {strokeColor:stroke, opacity:1}});
			directionsRenderer.setMap(t.map_shower.map);
			directionsRenderer.setDirections(directionOverlay);
			var id = new_id;
			var currentData = t.display_port_shower.loaded_routes;
			currentData = currentData[t.display_port_shower.loaded_route_ids[new_id]]
			
			
		
		 google.maps.event.addListener(directionsRenderer.polylineOptions, 'click', function(a,b) {
				$("#"+t.map_shower.map.b.id).trigger('route_selected',id);
				var id = new_id;
				var currentData = t.display_port_shower.loaded_routes;
				currentData = currentData[t.display_port_shower.loaded_route_ids[new_id]]
				


			});


	}
	
	var selectRouteFromGetId = function (id){
			if (id){
				var url = "rides.json/"+id;
				$.ajax({
					dataType: 'json',
					url: getBaseURL() + url
					}).done(function(a) { 
					  	//t.display_port_shower.processRoute([0,a]);	
						t.display_port_picker.processRoute([0,a]);
					});
			
			}

		
	}
	var _construct = function (){
		
		set_lat_lng();
		if ($('#map_picker').length != 0){
			t.map_picker = new my_map('map_picker');
			$('#map_picker').bind("route_processed",t.map_picker_handler);
			$('#map_picker').bind("bounds_changed",function(Event,map){
				if (t.map_shower){
					t.map_shower.map.setCenter(map.center);
					t.map_shower.map.setZoom(map.getZoom())
				}	
				});
				
			t.globalDirectionRender = new google.maps.DirectionsRenderer;
			t.globalDirectionRender.setMap(t.map_picker.map);

			 route = new my_route(t.map_picker,true);
		}
		if ($('#map_shower').length != 0){
			 t.map_shower = new my_map('map_shower');
			$('#map_shower').bind("route_processed", map_shower_reader_handler);
			$('#map_shower').bind('route_selected', function (Event,id){

				if (t.map_picker){
								
					//$('#map_shower').one("route_processed",map_picker_handler);
						
						
					selectRouteFromGetId(id);
				}
			})

			$('#map_shower').bind("bounds_changed",function(Event,map){
				if (t.map_picker){
					t.map_picker.map.setCenter(map.center);
					t.map_picker.map.setZoom(map.getZoom())
				}	
			});

			 route = new my_route(t.map_shower,false);
				t.display_port_shower = new my_route_display(t.map_shower,route);
		  t.display_port_picker  = new my_route_display(t.map_shower,route);
		}
		
		
	}
	
	 t.map_picker_handler = function (event,directionOverlay){
		console.log(directionOverlay);
		t.globalDirectionRender.setDirections(directionOverlay);
	}
	
	
	var  set_lat_lng = function() {
	    if (google.loader.ClientLocation) {
		lat = google.loader.ClientLocation.latitude;
		lon = google.loader.ClientLocation.longitude;
	    } else {
		debug('Location set manually');
		lat = '36.9742';
		lon = '-122.0297';
	    }
	}
	_construct();
	
	
}

function initialize(){
	instance = new app();
	

	//instance = route; 
}



$(document).ready(function() {
	
		$("#lonfield").val(lon)
		$("#lonfield").val(lon)
        $("#datepicker").datepicker({dateFormat: 'yy-mm-dd'})
	
	google.maps.event.addDomListener(window, 'load', initialize);
	
    
	
});

