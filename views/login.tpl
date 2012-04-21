%include header extra_title = "Login", session=session, error=error if defined('error') else '', warning=warning if defined('warning') else '', success=success if defined('success') else '', info=info if defined('info') else '' 

<p> Login or <a href="/signup">signup</a>. (Facebook Connect coming soon!)</p>

<form name="input" action="/verify_login" method="POST">
      <table>
      	<tr><td>Email:</td><td><input type="text" name="email" /></td></tr>
	<tr><td>Password:</td><td><input type="password" name="password" /></td></tr>
	<tr><td colspan="2"><input type="submit" value="Login" /></td></tr>
      </table>
</form>

%include footer
