%include header extra_title = "", session=session

%if haveorwant == 'have':
<h1> I HAVE A Ride </h1>
<p> Where are you going? </p>
%else:
<h1> I WANT A Ride </h1>
<p> Where do you want to go? </p>
%end

<form name="input" action="/verify_make" method="POST">
      <input type="hidden" name="haveorwant" value="{{ haveorwant }}"/>
      <table>
      	<tr><td>From:</td><td><input type="text" name="from" /></td></tr>
	<tr><td>To:</td><td><input type="password" name="to" /></td></tr>
	<tr><td>Time:</td><td><input type="password" name="time" /></td></tr>
	<tr><td colspan="2"><input type="submit" value="Share it" /></td></tr>
      </table>
</form>

%include footer
