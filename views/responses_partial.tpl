%if len(responses):

<table id="responses">
       <tr id="responses_header">
              <td>Who</td>
	      <td>Comment</td>
	      <td>Tip</td>
	      <td></td>
	      <td></td>
       </tr>
     %for response in responses:
     	  %include response_partial response=response, can_shake=can_shake, show_link=show_link
     %end
</table>

%end