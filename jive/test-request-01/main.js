
//--- Declarations

//--- Factory for mini messages
var mini;

//--- Currently logged in user
var user;


//--- On-view-load initialization
function init() {
    mini = new gadgets.MiniMessage();
}


//--- test gadgets.io.makeRequest
function makeRequest() {
	mini.createDismissibleMessage("FIRE button clicked...");

  var params = {};
  params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
  var url = "http://graargh.returnstrue.com/buh/fetchme.php";
  gadgets.io.makeRequest(url, response, params);	
}

//--- and find out the response
function response(obj) {
	mini.createDismissibleMessage("response received");
  //obj.data contains a JavaScript object corresponding to the data that was requested
  //output(obj.data);
	var message = "response = " + obj.data;
	mini.createDismissibleMessage(message);
};

//--- Register our on-view-load handler
gadgets.util.registerOnLoadHandler(init);