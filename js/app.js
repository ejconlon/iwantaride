var DEBUG_ENABLED = false;
var lat = null;
var lon = null;

function debug(msg) {
    if (DEBUG_ENABLED) {
	alert('DEBUG: '+msg);
    }
}

function set_lat_lon() {
    if (google.loader.ClientLocation) {
	lat = google.loader.ClientLocation.latitude;
	lon = google.loader.ClientLocation.longitude;
    } else {
	debug('Location set manually');
	lat = '36.9742';
	lon = '-122.0297';
    }
}

function draw_map() {
    if ($('#map_canvas').length != 0) {
	var myOptions = {
	    zoom: 12,
	    center: new google.maps.LatLng(lat, lon),
	    mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    }
}

$(document).ready(function() {
    set_lat_lon();

    // set these in login/signup forms
    $("#latfield").val(lat)
    $("#lonfield").val(lon)

    draw_map();
});

