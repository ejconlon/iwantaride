%include header extra_title = "Signup", session=session, error=error if defined('error') else '', warning=warning if defined('warning') else '', success=success if defined('success') else '', info=info if defined('info') else '' 

<p> Signup or <a href="/login">login</a>. (Facebook Connect coming soon!)</p>

<form name="input" action="/verify_signup" method="POST">
      <table>
      	<tr><td>Email:</td><td><input type="text" name="email" /></td></tr>
	<tr><td>Password:</td><td><input type="password" name="password" /></td></tr>
	<tr><td>Again:</td><td><input type="password" name="password_again" /></td></tr>
	<tr><td colspan="2"><input type="submit" value="Signup" /></td></tr>
      </table>
</form>

%include footer
