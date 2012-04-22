%import json
%include header extra_title = "", session=session

<h1> Get rides to your events </h1>

<div id="get_events_container">
	Your Google Calendar <a href="http://support.google.com/calendar/bin/answer.py?hl=en&answer=37648">private address</a><br/>
	<input type="textfield" id="calendar_url"><br/>
	<button class="btn" id="get_events" onclick="getEvents()">Get your events</button>
</div>

<div id="events_container"></div>

<script type="text/javascript">
	function getEvents() {
		$("#get_events").addClass("disabled").html("loading...");
		$.get("/calendar_partial?guser_xml="+encodeURIComponent($("#calendar_url").val()), function(data) {
			$("#events_container").html(data);
			$("#get_events_container").hide();
			$("#get_events").removeClass("disabled").html("Get your events");
		});
	}

	function submitEvents() {
		$("#create_rides").addClass("disabled").html("creating rides...");
		var rides = [];
		$(".active").each(function(index, data){
			console.log($(data).attr("data-uid"));
			rides.push({
				"uid": $(data).attr("data-uid"),
				"to_lat": $(data).attr("data-to_lat"),
				"to_lon": $(data).attr("data-to_lon"),
				"to_time": $(data).attr("data-to_time"),
				"wantorhave": "want"
			});
		});
		$.ajax({
			url: "/calendar_make",
			type: "POST",
			dataType: "json",
			data: JSON.stringify(rides),
			async: false,
			success: function(data){
				$("#create_rides").removeClass("disabled").html("Create rides");
				
			},
			error: function(data){
				$("#create_rides").removeClass("disabled").html("Create rides");
			}
		});
	}
</script>

%include footer
