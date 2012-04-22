%include header extra_title = "", session=session

%if wantorhave == 'have':
<h1> I HAVE a Ride </h1>
<h3> Where are you going? </h3>
%else:
<h1> I WANT a Ride </h1>
<h3> Where do you want to go? </h3>
%end

<br/>

<div id="map_picker"></div>

<form name="input" action="/verify_make" method="POST">
      <input type="hidden" name="wantorhave" value="{{ wantorhave }}"/>
      <input type="hidden" id="from_lat" name="from_lat" />
      <input type="hidden" id="from_lon" name="from_lon" />
      <input type="hidden" id="to_lat" name="to_lat" />
      <input type="hidden" id="to_lon" name="to_lon" />
      <table>
	<tr><td>Time:</td><td><input type="text" name="from_time" id="datepicker" value="2012-04-22"/></td>
	<td><input type="submit" value="Share it" /></td></tr>
      </table>
</form>

%include footer
