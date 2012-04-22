<tr class="response">
    <td> {{ response['name'] }} </td>
    <td> {{ response['comment'] }} </td>
    <td>
    %try:
    %  f = float(response['tip'])
    {{ "$%.2f" % f }}
    %except:
    %  pass
    %end
    </td>
    %if len(response['confirmation']):
    <td> Confirmed. </td>
    %else:
	%if can_shake:
	    <td> <a href="/shake/{{ response['reid'] }}">Shake on it!</a></td>
	%elif show_link:
	    <td> <a href="/take/{{ response['rid2'] }}">Remember?</a></td>
	%else:
	    <td></td>
	%end
    <td> <a href="/nope/{{ response['reid'] }}">Nope.</a></td>
    %end
</tr>