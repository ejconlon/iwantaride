var DEBUG_ENABLED = false;
var lat = null;
var lon = null;

function debug(msg) {
    if (DEBUG_ENABLED) {
	alert('DEBUG: '+msg);
    }
}

function my_map(){
	var t = this;
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
	if (this.map){
		overlayPoint();
	}
}


$(document).ready(function() {
	$("#lonfield").val(lon)
	$("#lonfield").val(lon)
	
	new my_map();
});

