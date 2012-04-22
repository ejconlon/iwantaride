<div id="map_shower" style="display:block; width: 300px; height: 300px; background-color: #cccccc"></div>

%if len(ride_list):

<table id="ride_list">
       <tr id="ride_list_header">
              <td></td>
              <td>Who</td>
	      <td>From</td>
	      <td>When</td>
	      <td></td>
       </tr>
     %for ride in ride_list:
     	  %include ride_partial ride=ride, has_uid=has_uid
     %end
</table>

%end