%include header extra_title = "Login", session=session

<h1> Login </h1>

<p> Login or <a href="/signup">signup</a>. (Facebook Connect coming soon!)</p>

<form name="input" action="/verify_login" method="POST">
      <input type="hidden" id="latfield" name="lat" value=""/>
      <input type="hidden" id="lonfield" name="lon" value=""/>
      <table>
      	<tr><td>Email:</td><td><input type="text" name="email" /></td></tr>
	<tr><td>Password:</td><td><input type="password" name="password" /></td></tr>
	<tr><td colspan="2"><input type="submit" value="Login" /></td></tr>
      </table>
</form>

%include footer
