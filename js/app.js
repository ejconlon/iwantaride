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
	    switch (t.marker_type){
				case "START":
					t.my_route.action(t.latLng);
				break;
				default:
					t.my_route.action(false,t.latLng);
				break;
		}
	    
	  });
	


}
//
function my_route_data(my_map,route){
	var t = this;
	 t.loaded_routes =[];
	 t.loaded_route_ids = {};
	t.map = my_map.map;
	t.my_route = route;
	t.get = function (id){
		return t.loaded_routes[t.loaded_route_ids[id]]
	}
	var _construct = function (){
		
		if ($("#ride_id").val()){
			var url = "rides.json/"+$("#ride_id").val();
		}else if($("#my_id").val()){
			var url = "myrides.json/"+ $("#my_id").val();
			
		}
		else{
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
			t.loaded_route_ids[results[key]['rid']] = key;
			
			
			currentResult = results[key];
			var lat =  (currentResult['from_lat']);
			var lon = (currentResult['from_lon']);
			var starLatLng = new google.maps.LatLng(lat, lon);
			var lat = currentResult['to_lat'];
			var lon = currentResult['to_lon'];
			var endLatLng = new google.maps.LatLng(lat, lon);
			var cb_arguments = [newKey,  results]
			var return_id;
			if (results[key]['rid']){
				
				return_id = results[key]['rid']
			}else{
				return_id = false
			}
				 
				t.my_route.calcRoute(starLatLng,endLatLng, t.processRoute,cb_arguments,return_id,results);
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
	
	
	function renderDirections(result,id,oldResult) {
		$("#"+t.map.b.id).trigger('route_processed', [result,id,oldResult]);
		
	   }
	
	function returnDirectionOverlay(){
		
	}
	

	 t.calcRoute = function (start,end,calc_cb,cb_args,id,result) {
    	var request = {
        origin:start, 
        destination:end,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    	};

		t.directionsService.route(request, function(response, status) {
	  if (status == google.maps.DirectionsStatus.OK) {
		renderDirections(response,id,result);
      }
		else{
			
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


function Renderer(){
	var t = this;
	t.setMap = function(map){
		t.view.setMap(map);
	}
	 t.open_window = function (content){
		
	if (!t.infoMarker.map){
		t.infoMarker.setMap(t.view.map);
	}
	t.infowindow.setContent(content);
	t.infoMarker.setPosition(t.view.map.center);
	
	t.infowindow.open(t.view.map,t.infoMarker);
	}
	 t.close_window = function (){
		t.infowindow.close();
	}
	t.setData = function (currentData){
			if ((currentData) &&(currentData["wantorhave"]=="have")){
				t.stroke = "#40e0d0";
			}else{
				t.stroke = "#FF9966";


			}
			t.view.polylineOptions.strokeColor = t.stroke;
		
	
	}
	t.setDirections = function (directionOverlay){
		t.view.setDirections(directionOverlay)
	}
	var _construct = function(){
			t.stoke = "#FF9966"
				t.infowindow = new google.maps.InfoWindow({
					content:   "hllo",
					pixelOffset : {width:1,height:1},
					disableAutoPan : true
					
			    });
				t.infoMarker =  new google.maps.Marker({
			    visible : false
			});
			 t.view = new google.maps.DirectionsRenderer({suppressInfoWindows :true, suppressMarkers : false , polylineOptions : {strokeColor:t.stroke, strokeOpacity:0.3}});
	}
	_construct();
	
}	

function app(){
	
	var t = this;
	t.map_shower = false;
	t.direction_renderes ={};
	t.map_picker = false;
	t.globalDirectionRender = false;	
	t.current_data = false;
	
	var map_shower_reader_handler = function (event,directionOverlay,new_id,results){
		var directionsRenderer = new Renderer()
			directionsRenderer.setMap(t.map_shower.map);
			directionsRenderer.setDirections(directionOverlay);
			
			var id = new_id;
			directionsRenderer.setData(t.data.get(new_id));
			t.direction_renderes[new_id] = directionsRenderer;
		 google.maps.event.addListener(directionsRenderer.view.polylineOptions, 'mouseout', function(a,b) {
				var id = new_id;
				//directionsRenderer.view.setOptions({polylineOptions : {strokeOpacity:0.3, strokeColor: directionsRenderer.stoke}});
				directionsRenderer.view.b.polylines[0].setOptions({strokeOpacity:0.3, strokeColor:directionsRenderer.stroke });
				//directionsRenderer.view.setDirections(directionsRenderer.view.directions);
				$("#"+t.map_shower.map.b.id).trigger('route_unselected',id);
				
				directionsRenderer.close_window();
			 

			});
			 google.maps.event.addListener(directionsRenderer.view.polylineOptions, 'mouseover', function(a,b) {
					
					var id = new_id;
					$("#"+t.map_shower.map.b.id).trigger('route_selected',id);
					
					var currentData = t.data.get(id);
					
					directionsRenderer.view.b.polylines[0].setOptions({strokeOpacity:1, strokeColor:'red' });
					
					directionsRenderer.open_window((currentData['wantorhave']=="want") ? currentData["name"] +" wants a ride " : currentData["name"] + " needs a ride");
					
					
					//directionsRenderer.view.setDirections(directionsRenderer.view.directions);
					instance = t.map_shower.map;

				});
				
				$('#ride_list  tr ').mouseover(function(event) {
					instance = event.target;
					$(event.target.parentElement).toggleClass("highlight");
					id = event.target.parentElement.id.split("_")[1];
					t.direction_renderes[id].view.b.polylines[0].setOptions({strokeOpacity:1, strokeColor:'red' });
					
					t.direction_renderes[id].open_window(( t.data.get(id)['wantorhave']=="want") ? t.data.get(id)["name"] +" wants a ride " : t.data.get(id)["name"] + " needs a ride");
					
					
					//$(event.target)
				  });
			$('#ride_list  tr ').mouseout(function(event){
				t.direction_renderes[id].close_window();
				$(event.target.parentElement).toggleClass("highlight");
					t.direction_renderes[id].view.b.polylines[0].setOptions({strokeOpacity:0.3, strokeColor:directionsRenderer.stroke });
				
				
			})

	}
	
	var selectRouteFromGetId = function (id){
			if (id){
				var url = "rides.json/"+id;
				$.ajax({
					dataType: 'json',
					url: getBaseURL() + url
					}).done(function(a) { 
					  	//t.display_port_shower.processRoute([0,a]);	
						t.data.processRoute([0,a]);
					});
			
			}

		
	}
	var dirRenderer = function (){
		
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
				
			t.globalDirectionRender = new Renderer();
			t.globalDirectionRender.setMap(t.map_picker.map);

			 route = new my_route(t.map_picker,true);
		}
		if ($('#map_shower').length != 0){
			 t.map_shower = new my_map('map_shower');
			$('#map_shower').bind("route_processed", map_shower_reader_handler);
			$('#map_shower').bind('route_unselected', function (Event,id){
				$("#ride_"+id).first().toggleClass("highlight");
			
			});
			$('#map_shower').bind('route_selected' , function (Event,id){
				console.log(id);
				console.log($("#ride_"+id)[0]);
				$("#ride_"+id).first().toggleClass("highlight");
				if (t.map_picker){
								
					//$('#map_shower').one("route_processed",map_picker_handler);
						
						
					//selectRouteFromGetId(id);
				}
			});

			$('#map_shower').bind("bounds_changed",function(Event,map){
				if (t.map_picker){
					t.map_picker.map.setCenter(map.center);
					t.map_picker.map.setZoom(map.getZoom())
				}	
			});

			 route = new my_route(t.map_shower,false);
					t.data = new my_route_data(t.map_shower,route);
			
		 // t.display_port_picker  = new my_route_display(t.map_shower,route);
		}
		
		
	}
	
	 t.map_picker_handler = function (event,directionOverlay,user_id){
		t.globalDirectionRender.setDirections(directionOverlay);
	}
	
	
	var  set_lat_lng = function() {
	    if (google.loader.ClientLocation) {
		lat = google.loader.ClientLocation.latitude;
		lon = google.loader.ClientLocation.longitude;
	    } else {
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

