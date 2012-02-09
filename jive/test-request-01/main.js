
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
  params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
  var url = "http://www.nytimes.com/services/xml/rss/nyt/HomePage.xml";
  gadgets.io.makeRequest(url, response, params);	
}

//--- and find out the response
function response(obj) {
	mini.createDismissibleMessage("response received...");
  //obj.data contains a Document DOM element corresponding to the page that was requested
  output(obj.data);
	mini.createDismissibleMessage(obj.data);
};

//--- Register our on-view-load handler
gadgets.util.registerOnLoadHandler(init);