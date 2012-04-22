<h3>Select events you need rides to</h3>

<table>
%for idx, event in enumerate(cal_entries):
	<tr>
		<td>
			<button class="btn event" 
			 data-uid="{{ uid }}"
			 data-to_lat="{{ event["lat"] }}"
			 data-to_lon="{{ event["lng"] }}"
			 data-to_time="{{ event["datetime"] }}"
			 onclick="$(this).toggleClass('active')"
			 data-toggle="toggle"
			 id="event_{{idx}}">{{ event["event_name"] }}
			</button>
		</td>
		<td>
			<label for="event_{{idx}}" style="display: inline; cursor: pointer;">{{ event["name"] }}</label>
		</td>
	</tr>
%end
</table>

<div style="margin-top: 20px;">
	<button class="btn" onclick="submitEvents()" id="create_rides">Create rides</button>
	<span style="padding-left: 5px;" id="create_rides_message"></span>
</div>

