%include header extra_title = "", session=session

%if haveorwant == 'have':
<h1> I HAVE A Ride </h1>
<p> Where are you going? </p>
%else:
<h1> I WANT A Ride </h1>
<p> Where do you want to go? </p>
%end

<div id="map_canvas" style="display:block; width: 300px; height: 300px; background-color: #cccccc"></div>

<form name="input" action="/verify_make" method="POST">
      <input type="hidden" name="haveorwant" value="{{ haveorwant }}"/>
      <input type="hidden" id="from_lat" name="from_lat" />
      <input type="hidden" id="from_lon" name="from_lon" />
      <input type="hidden" id="to_lat" name="to_lat" />
      <input type="hidden" id="to_lon" name="to_lon" />
      <table>
	<tr><td>Time:</td><td><input type="text" name="time" id="datepicker" value="2012-04-22"/></td></tr>
	<tr><td colspan="2"><input type="submit" value="Share it" /></td></tr>
      </table>
</form>

%include footer
