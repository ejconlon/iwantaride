%include header extra_title = "", session=session

<h1> Chose an event </h1>

<form>
	%for idx, event in enumerate(cal_entries):
		%include calendar_partial event=event,idx=idx
	%end
</form>

%include footer
