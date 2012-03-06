
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

    var lf_soapEnvelope = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:urn=\"urn:sap-com:document:sap:soap:functions:mc-style\"><soapenv:Header/><soapenv:Body><urn:ZmurCollabGetWorklist><ImSapuser>RILKEE</ImSapuser></urn:ZmurCollabGetWorklist></soapenv:Body></soapenv:Envelope>";

    var lf_envelope = new SOAP.Envelope();
    var lf_header = lf_envelope.create_Header();
    var lf_body = lf_envelope.create_body();
    var lf_el = lf_body.create_child(new WS.QName('method','urn:ZmurCollabGetWorklist'));
    lf_el.create_child(new WS.QName('ImSapuser','urn:ZmurCollabGetWorklist')).set_value('RILKEE');

    var lf_params = {};
    lf_params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
    lf_params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.NONE;
    lf_params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
    lf_params[gadgets.io.RequestParameters.HEADERS] = {
        "SOAPAction": "ZmurCollabGetWorklistRequest",
        "Content-Type": "text/xml; charset=utf-8"
    };
//  lf_params[gadgets.io.RequestParameters.POST_DATA] = lf_soapEnvelope;
    lf_params[gadgets.io.RequestParameters.POST_DATA] = lf_envelope;
    var lf_url = url.value;
    gadgets.io.makeRequest(lf_url, responseDom, lf_params);
}
//--- and analyse the response
function responseDom(obj) {
	mini.createDismissibleMessage("responseDom(obj) started...");
    //obj.text contains the text of the page that was requested
    var lf_message;
    lf_message = "obj.text = " + obj.text;
    mini.createDismissibleMessage(lf_message);
	lf_message = "obj.data = " + obj.data;
	mini.createDismissibleMessage(lf_message);
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