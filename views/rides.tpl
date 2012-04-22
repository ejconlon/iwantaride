%include header extra_title = "", session=session

<h1> Who's gonna ride? </h1>

% has_uid = 'uid' in session

%include rides_partial ride_list=ride_list, has_uid=has_uid

%include footer
