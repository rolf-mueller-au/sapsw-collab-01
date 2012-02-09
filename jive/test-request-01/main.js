
//--- Declarations

//--- Factory for mini messages
var mini;

//--- Currently logged in user
var user;


//--- On-view-load initialization
function init() {
    mini = new gadgets.MiniMessage();
}


//--- Saving the data entered into the form
function makeRequest() {
	mini.createDismissibleMessage("FIRE button clicked...");

  var params = {};
  params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
  var url = "http://www.nytimes.com/services/xml/rss/nyt/HomePage.xml";
  gadgets.io.makeRequest(url, response, params);	
}

function response(obj) {
  //obj.data contains a Document DOM element corresponding to the page that was requested
  output(obj.data);
};

//--- Register our on-view-load handler
gadgets.util.registerOnLoadHandler(init);