%include header extra_title = "", session=session

<h1> My rides </h1>

%include rides_partial ride_list=ride_list, has_uid=True

<br/>
<br/>

<form>
<input type="hidden" id="my_id" value="{{ my_id }}" />
</form>

%include responses_partial responses=responses, can_shake=False, show_link=True

%include footer
