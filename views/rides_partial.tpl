<div id="map_canvas" style="display:block; width: 300px; height: 300px; background-color: #cccccc"></div>

<table id="ride_list">
       <tr id="ride_list_header">
              <td></td>
              <td>Who</td>
	      <td>From</td>
	      <td>To</td>
	      <td>Between</td>
	      <td>and</td>
	      <td></td>
       </tr>
     %for ride in ride_list:
     	  %include ride_partial ride=ride
     %end
</table>
