%include header extra_title = "Signup", session=session

<h1> Signup </h1>

<p> Signup or <a href="/login">login</a>. (Facebook Connect coming soon!)</p>

<form name="input" action="/verify_signup" method="POST">
      <input type="hidden" id="latfield" name="lat" value=""/>
      <input type="hidden" id="lonfield" name="lon" value=""/>

      <table>
      	<tr><td>Email:</td><td><input type="text" name="email" /></td></tr>
	<tr><td>Password:</td><td><input type="password" name="password" /></td></tr>
	<tr><td>Again:</td><td><input type="password" name="password_again" /></td></tr>
	<tr><td colspan="2"><input type="submit" value="Signup" /></td></tr>
      </table>
</form>

%include footer
