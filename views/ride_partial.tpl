<tr class="ride ride_{{ride['wantorhave']}}">
    <td>
	%if ride['wantorhave'] == 'have':
	OFFERING
	%else:
	SEEKING
	%end
    </td>
    %if has_uid:
    <td> {{ ride['name'] }} </td>
    %else:
    <td> Someone </td>
    %end
    <td> {{ "%.2f" % float(ride['start_dist']) }} mi away </td>
    <td> {{ ride['formatted_from_time'] }} </td>
    <td> <a href="/take/{{ ride['rid'] }}">Take a ride!</a></td>
</tr>
