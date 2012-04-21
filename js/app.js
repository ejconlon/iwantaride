var DEBUG_ENABLED = false;
var lat = null;
var lng = null;

function debug(msg) {
    if (DEBUG_ENABLED) {
	alert('DEBUG: '+msg);
    }
}

function set_lat_lng() {
    if (google.loader.ClientLocation) {
	lat = google.loader.ClientLocation.latitude;
	lng = google.loader.ClientLocation.longitude;
    } else {
	debug('Location set manually');
	lat = '36.9742';
	lng = '-122.0297';
    }
}

function my_map(){
	var t = this;
	function set_lat_lng() {
	    if (google.loader.ClientLocation) {
		lat = google.loader.ClientLocation.latitude;
		lng = google.loader.ClientLocation.longitude;
	    } else {
		debug('Location set manually');
		lat = '36.9742';
		lng = '-122.0297';
	    }
	}
	function overlayPoint(){
		var image = 'img/beachflag.png';
	    var myLatLng = new google.maps.LatLng(lat, lng);
	    var beachMarker = new google.maps.Marker({
	        position: myLatLng,
	        map: t.map,
	        icon: image
	    });
	}
	function draw_map(){
		var myOptions = {
	    zoom: 12,
	    center: new google.maps.LatLng(lat, lng),
	    mapTypeId: google.maps.MapTypeId.ROADMAP
	  }
	  return new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	}
	
	set_lat_lng();
	this.map = draw_map();
	overlayPoint();
	
}


$(document).ready(function() {
	
	new my_map();
});

