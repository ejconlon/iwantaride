%include header extra_title = "", session=session

<div id="wantaride" class="flowbutton"> <a href="/make/want">I WANT A Ride!</a> </div>

<div id="havearide" class="flowbutton"> <a href="/make/have">I HAVE A Ride!</a> </div>

<div id="howitworks" class="flowbutton"> <a href="/about">How does it work?</a> </div>

<br/>
<h3> Who's gonna ride? </h3>
<br/>

%include rides_partial ride_list=ride_list if defined('ride_list') else []

%include footer

