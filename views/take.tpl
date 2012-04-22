%include header extra_title = "", session=session

<h1> Take a ride with {{ ride['name'] }} </h1>

<div id="map_shower" style="display:block; width: 300px; height: 300px; background-color: #cccccc"></div>

<p> Leaving {{ ride['formatted_from_time'] }} </p>

<form name="input" action="/verify_take" method="POST">
      <input type="hidden" name="uid" value="{{ session['uid'] }}"/>
      <input type="hidden" name="rid" value="{{ ride['rid'] }}"/>
      <p> (Toss 'em a tip?) </p>
      <input type="text" name="tip"/>
      <input type="submit" value="Take a ride!" />
</form>


%include footer

