Select events you need rides to

%for idx, event in enumerate(cal_entries):
	<div style="margin-bottom: 10px;">
		<button class="btn event" onclick="$(this).toggleClass('active')" data-toggle="toggle" id="event_{{idx}}">{{ event["event_name"] }}</button>
		<label for="event_{{idx}}" style="display: inline; cursor: pointer;">{{ event["name"] }}</label>
	</div>
%end

<div style="margin-top: 20px;"><button class="btn" onclick="submitEvents()">Create rides</button></div>