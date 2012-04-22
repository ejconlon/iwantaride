<tr class="response">
    <td> {{ response['name'] }} </td>
    <td> {{ response['comment'] }} </td>
    <td> {{ "$%.2f" % float(response['tip']) if len(response['tip']) else '' }} </td>
    %if len(response['confirmation']):
    <td> Confirmed. </td>
    %else:
	%if can_shake:
	    <td> <a href="/shake/{{ response['reid'] }}">Shake on it!</a></td>
	%elif show_link:
	    <td> <a href="/take/{{ response['rid2'] }}">Remember?</a></td>
	%end
    <td> <a href="/nope/{{ response['reid'] }}">Nope.</a></td>
    %end
</tr>
