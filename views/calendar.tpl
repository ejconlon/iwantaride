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
</script>

%include footer
