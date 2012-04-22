<tr class="ride ride_{{ride['wantorhave']}}">
    <td>
	%if ride['wantorhave'] == 'have':
	OFFERING
	%else:
	SEEKING
	%end
    </td>
    <td> {{ ride['name'] }} </td>
    <td> {{ ride['start_dist'] }} mi away </td>
    <td> {{ ride['end_dist'] }} mi away </td>
    <td> {{ ride['formatted_from_time'] }} </td>
    <td> {{ ride['formatted_to_time'] }} </td>
    <td> <a href="/take/{{ ride['rid'] }}">Take a ride!</a></td>
</tr>
