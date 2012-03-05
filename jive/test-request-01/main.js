
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
function makeNormalRequest() {
	mini.createDismissibleMessage("makeNormalRequest() started...");
  var params = {};
  params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.TEXT;
	var lf_url = url.value;
  gadgets.io.makeRequest(lf_url, responseNormal, params);	
}
//--- and analyse the response
function responseNormal(obj) {
	mini.createDismissibleMessage("responseNormal(obj) started...");
  //obj.text contains the text of the page that was requested
	var message = "response = " + obj.text;
	mini.createDismissibleMessage(message);
}

//--- test gadgets.io.makeRequest
function makeDomRequest() {
	mini.createDismissibleMessage("makeDomRequest() started...");
  var params = {};
  params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
	var lf_url = url.value;
  gadgets.io.makeRequest(lf_url, responseDom, params);	
}
//--- and analyse the response
function responseDom(obj) {
	mini.createDismissibleMessage("responseDom(obj) started...");
  //obj.text contains the text of the page that was requested
	var message = "response = " + obj.data;
	mini.createDismissibleMessage(message);
}

//--- test gadgets.io.makeRequest
function makeJsonRequest() {
	mini.createDismissibleMessage("makeJsonRequest() started...");
  var params = {};
  params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
	var lf_url = url.value;
  gadgets.io.makeRequest(lf_url, responseJson, params);	
}
//--- and analyse the response
function responseJson(obj) {
	mini.createDismissibleMessage("responseJson(obj) started...");
  //obj.data contains a JavaScript object corresponding to the data that was requested
	var message = "response = " + obj.data;
	mini.createDismissibleMessage(message);
}

//--- test gadgets.io.makeRequest
function makeFeedRequest() {
	mini.createDismissibleMessage("makeFeedRequest() started...");
  var params = {};
  params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.FEED;
	var lf_url = url.value;
  gadgets.io.makeRequest(lf_url, responseFeed, params);	
}
//--- and analyse the response
function responseFeed(obj) {
	mini.createDismissibleMessage("responseFeed(obj) started...");
  //obj.data contains a JavaScript object corresponding to the data that was requested
	var message = "response = " + obj.data;
	mini.createDismissibleMessage(message);
}

//--- Register our on-view-load handler
gadgets.util.registerOnLoadHandler(init);