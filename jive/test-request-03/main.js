
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
function makeDomRequest() {
    mini.createDismissibleMessage("makeDomRequest() started...");
    var lf_message;

    var lf_url = "http://213.23.110.71:8000/sap/bc/srt/rfc/sap/zmur_hcm_collab/801/zmur_hcm_collab/zmur_hcm_collab";
//    lf_message = "URL = " + lf_url;
//    mini.createDismissibleMessage(lf_message);
//    var lf_soapEnvelope = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:urn=\"urn:sap-com:document:sap:soap:functions:mc-style\"><soapenv:Header/><soapenv:Body><urn:ZmurCollabGetWorklist><ImSapuser>RILKEE</ImSapuser></urn:ZmurCollabGetWorklist></soapenv:Body></soapenv:Envelope>";
    var lf_soapEnvelope = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:urn=\"urn:sap-com:document:sap:rfc:functions\"><soapenv:Header/><soapenv:Body><urn:ZMUR_HCM_GET_EE_NAME><IM_F_PERNR>1000</IM_F_PERNR></urn:ZMUR_HCM_GET_EE_NAME></soapenv:Body></soapenv:Envelope>"
//    lf_message = "SoapEnvelope = " + lf_lf_soapEnvelope;
//    mini.createDismissibleMessage(lf_message);

    var lf_params = {};
    lf_params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
    lf_params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.NONE;
    lf_params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
    lf_params[gadgets.io.RequestParameters.HEADERS] = {
        "SOAPAction": "ZmurCollabGetWorklistRequest",
        "Content-Type": "text/xml; charset=utf-8"
    };
    lf_params[gadgets.io.RequestParameters.POST_DATA] = lf_soapEnvelope;
    gadgets.io.makeRequest(lf_url, responseDom, lf_params);
}

//--- and analyse the response
function responseDom(obj) {
	mini.createDismissibleMessage("responseDom(obj) started...");
    //obj.text contains the text of the page that was requested
    var lf_domdata = obj.data;
    var lf_message;
//    lf_message = "obj.text = " + obj.text;
//    mini.createDismissibleMessage(lf_message);
//	  lf_message = "obj.data = " + obj.data;
//	  mini.createDismissibleMessage(lf_message);

    var lf_display_name = lf_domdata.getElementsByTagName("EX_F_DISPLAY_NAME").item(0).attributes.item(0).nodeValue;
//    lf_message = "Employee Name = " + lf_display_name;
//    mini.createDismissibleMessage(lf_message);
    pa_display_name.value = 'this is a test :-)';
}

//--- Register our on-view-load handler
gadgets.util.registerOnLoadHandler(init);