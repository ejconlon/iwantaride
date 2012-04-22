<h3>Select events you need rides to</h3>

%for idx, event in enumerate(cal_entries):
	<div style="margin-bottom: 10px;">
		<button class="btn event" 
		 data-uid="{{ uid }}"
		 data-to_lat="{{ event["lat"] }}"
		 data-to_lon="{{ event["lng"] }}"
		 data-to_time="{{ event["datetime"] }}"
		 onclick="$(this).toggleClass('active')"
		 data-toggle="toggle"
		 id="event_{{idx}}">{{ event["event_name"] }}
		</button>
		<label for="event_{{idx}}" style="display: inline; cursor: pointer;">{{ event["name"] }}</label>
	</div>
%end

<div style="margin-top: 20px;"><button class="btn" onclick="submitEvents()" id="create_rides">Create rides</button></div>
