function initialize() {
  var myOptions = {
    zoom: 12,
    center: new google.maps.LatLng(36.9742, -122.0297),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
}

window.onload = initialize;
