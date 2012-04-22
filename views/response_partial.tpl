<tr class="response">
    <td> {{ response['name'] }} </td>
    <td> {{ response['comment'] }} </td>
    <td> {{ "$%.2f" % float(response['tip']) }} </td>
    %if len(response['confirmation']):
    <td> Confirmed. </td>
    %else:
    <td> <a href="/shake/{{ response['reid'] }}">Shake on it!</a></td>
    %end
</tr>
