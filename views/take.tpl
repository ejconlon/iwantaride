%include header extra_title = "", session=session

<h1> Take a ride with {{ ride['name'] }} </h1>

<div id="map_shower"></div>

<p class="about"> Leaving {{ ride['formatted_from_time'] }} </p>
<br/>
<form name="input" action="/verify_take" method="POST">
      <input type="hidden" name="uid" value="{{ session['uid'] }}"/>
      <input type="hidden" id="ride_id" name="rid" value="{{ ride['rid'] }}"/>
      <p class="about"> (Toss 'em a tip?) </p>
      <input type="text" name="tip"/>
      <p class="about"> Comment </p>
      <input type="text" name="comment"/><br/>
      <input type="submit" value="Take a ride!" />
</form>

%include responses_partial responses=responses, can_shake = session['uid'] == ride['uid'], show_link=False

%include footer

