%include header extra_title = "", session=session

<h1> Take a ride with {{ ride['name'] }} </h1>

<div id="map_canvas" style="display:block; width: 300px; height: 300px; background-color: #cccccc"></div>

<p> Leaving around {{ ride['formatted_from_time'] }} to {{ ride['formatted_to_time'] }} </p>

<form name="input" action="/verify_take" method="POST">
      <input type="hidden" name="uid" value="{{ session['uid'] }}"/>
      <input type="hidden" name="rid" value="{{ ride['rid'] }}"/>
      <input type="submit" value="Take a ride!" />
</form>


%include footer

