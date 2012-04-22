%include header extra_title = "", session=session

<h1>Ridesharing that's quick, safe, and simple.</h1>

<a href="/make/want">
   <div class="flowbutton">
   	I WANT a Ride
   </div>
</a>

<a href="/make/have">
   <div class="flowbutton">
       I HAVE a Ride
   </div>
</a> 

<a href="/about">
   <div class="flowbutton">
       How does it work?
   </div>
</a>

<br/>
<h3> Who wants a ride nearby? </h3>
<br/>

% has_uid = 'uid' in session
%include rides_partial ride_list=ride_list if defined('ride_list') else [], has_uid=has_uid

%include footer

