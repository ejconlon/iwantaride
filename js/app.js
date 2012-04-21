function initialize() {
  var myOptions = {
    zoom: 8,
    center: new google.maps.LatLng(-34.397, 150.644),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    alert("LOADED!");
}

// TODO for some reason document.body.appendChild erases... everything...
// non-lazy load it for now
//function loadScript() {
//  var script = document.createElement("script");
//  script.type = "text/javascript";
//  script.src = "http://maps.googleapis.com/maps/api/js?key=AIzaSyBj3Cz1ShYUnODXeZH8IDll6rNq_GTFH6E&sensor=true"
//  document.body.appendChild(script);
//}
//window.onload = loadScript;

document.body.onload = initialize;
