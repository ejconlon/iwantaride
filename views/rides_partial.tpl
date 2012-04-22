<div id="map_shower"></div>

%if len(ride_list):

<table id="ride_list">
       <tr id="ride_list_header">
              <td></td>
              <td>Who</td>
	      <td>Where</td>
	      <td>When</td>
	      <td></td>
       </tr>
     %for ride in ride_list:
     	  %include ride_partial ride=ride, has_uid=has_uid
     %end
</table>

%end