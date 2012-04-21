function initialize() {
  var myOptions = {
    zoom: 12,
    center: new google.maps.LatLng(36.9742, -122.0297),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
}


var geocoder = null;
var lat = null;
var lng = null;

$(document).ready(function() {
    if (google.loader.ClientLocation) {
	lat = google.loader.ClientLocation.latitude;
	lng = google.loader.ClientLocation.longitude;
    } else {
	alert('DEBUG: Location set manually');
	lat = '36.9742';
	lng = '-122.0297';
    }

    initialize();
});

