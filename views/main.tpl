%include header extra_title = "", session=session, error=error if defined('error') else '', warning=warning if defined('warning') else '', success=success if defined('success') else '', info=info if defined('info') else '' 

<p> {{ text }} </p>

<div id="map_canvas" style="display:block; width: 300px; height: 300px; background-color: #cccccc"></div>

%include footer
