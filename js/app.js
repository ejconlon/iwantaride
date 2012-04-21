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

function draw_map() {
  var myOptions = {
    zoom: 12,
    center: new google.maps.LatLng(lat, lng),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
}

$(document).ready(function() {
    set_lat_lng();
    draw_map();
});

