
//--- Declarations

//--- Factory for mini messages
var mini;

//--- Currently logged in user
var user;


//--- On-view-load initialization
function init() {
    mini = new gadgets.MiniMessage();
    registerHandlers();
		loadAppData();
//  loadUser();
}


//--- Register UI event handlers
function registerHandlers() {
    console.log("registerHandlers() started");
	//mini.createDismissibleMessage("registerHandlers() started");

}

//--- Load the currently logged in user
function loadUser() {
    //console.log("loadUser() started");
	//mini.createDismissibleMessage("loadUser() started");
    showMessage("Loading the currently logged in user ...");
    osapi.jive.core.users.get({
        id : '@viewer'
    }).execute(function(response) {
            console.log("loadUser() response = " + JSON.stringify(response));
            user = response.data;
            $(".user-name").html("").html(user.name);
            loadGroups();
        });
}

//--- Loading the data, which has been saved from the form
function loadAppData() {
    //mini.createDismissibleMessage("loadAppData() started");

  osapi.appdata.get({
    userId: "@viewer",
    groupId: "@self"
  }).execute(function(response) {
    if (response.error) {
      mini.createDismissibleMessage(response.error.message);
    } else {
        for (p in response) {
          if (!response[p]) { continue; }
          if (typeof(response[p].pa_bukrs_new)!=='undefined') {pa_bukrs_new.value = response[p].pa_bukrs_new;}
          if (typeof(response[p].pa_werks_new)!=='undefined') {pa_werks_new.value = response[p].pa_werks_new;}
        }
      }
    }
  );
}

//--- Saving the data entered into the form
function onClickSave() {
	mini.createDismissibleMessage("save button clicked");

	var lf_bukrs_new_value = pa_bukrs_new.value;
	var lf_werks_new_value = pa_werks_new.value;
	
	osapi.appdata.update({
		userId: "@viewer",
		groupId: "@self",
		data: { pa_bukrs_new: lf_bukrs_new_value,
				pa_werks_new: lf_werks_new_value }
    }).execute(function(response) {
			if (response.error) {
				mini.createDismissibleMessage(response.error.message);
			} else {
				mini.createDismissibleMessage("pa_bukrs_new saved...");
			} 
		});
}

//--- for loadPernrDetails, we call the backend web-service...
function loadPernrDetails() {
    //mini.createDismissibleMessage("loadPernrDetails() started...");
    var lf_url = "http://213.23.110.71:8000/sap/bc/srt/rfc/sap/zmur_hcm_collab/801/zmur_hcm_collab/zmur_hcm_collab";
    var lf_soapEnvelope_1 = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:urn=\"urn:sap-com:document:sap:rfc:functions\"><soapenv:Header/><soapenv:Body><urn:ZMUR_HCM_PNF_PCH_OPEN><IM_F_PERNR>";
    var lf_soapEnvelope_2 = "</IM_F_PERNR></urn:ZMUR_HCM_PNF_PCH_OPEN></soapenv:Body></soapenv:Envelope>";
    var lf_soapEnvelope = lf_soapEnvelope_1 + pa_pernr.value + lf_soapEnvelope_2;

    var lf_params = {};
    lf_params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
    lf_params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.NONE;
    lf_params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
    lf_params[gadgets.io.RequestParameters.HEADERS] = {
        "SOAPAction": "ZmurCollabGetWorklistRequest",
        "Content-Type": "text/xml; charset=utf-8"
    };
    lf_params[gadgets.io.RequestParameters.POST_DATA] = lf_soapEnvelope;
    gadgets.io.makeRequest(lf_url, responseLoadPernrDetails, lf_params);
}

//--- ...to receive the pernrDetails
function responseLoadPernrDetails(obj) {
    //mini.createDismissibleMessage("responseLoadPernrDetails() started...");
    var lf_domdata = obj.data;
//--- retrieve display name
    pa_name.value = lf_domdata.getElementsByTagName('EX_F_DISPLAY_NAME')[0].childNodes[0].nodeValue;
//--- retrieve BUKRS
    pa_bukrs_old.value = lf_domdata.getElementsByTagName('EX_F_BUKRS')[0].childNodes[0].nodeValue;
//--- retrieve BUKRS_TXT
    pa_bukrs_txt_old.value = lf_domdata.getElementsByTagName('EX_F_BUKRS_TXT')[0].childNodes[0].nodeValue;
//--- retrieve BTRTL
    pa_btrtl_old.value = lf_domdata.getElementsByTagName('EX_F_BTRTL')[0].childNodes[0].nodeValue;
//--- retrieve BTRTL_TXT
    pa_btrtl_txt_old.value = lf_domdata.getElementsByTagName('EX_F_BTRTL_TXT')[0].childNodes[0].nodeValue;
//--- retrieve KOSTL
    pa_kostl_old.value = lf_domdata.getElementsByTagName('EX_F_KOSTL')[0].childNodes[0].nodeValue;
//--- retrieve BTRTL_TXT
    pa_kostl_txt_old.value = lf_domdata.getElementsByTagName('EX_F_KOSTL_TXT')[0].childNodes[0].nodeValue;
//--- retrieve ORGEH
    pa_orgeh_old.value = lf_domdata.getElementsByTagName('EX_F_ORGEH')[0].childNodes[0].nodeValue;
//--- retrieve ORGEH_TXT
    pa_orgeh_txt_old.value = lf_domdata.getElementsByTagName('EX_F_ORGEH_TXT')[0].childNodes[0].nodeValue;
//--- retrieve PLANS
    pa_plans_old.value = lf_domdata.getElementsByTagName('EX_F_PLANS')[0].childNodes[0].nodeValue;
//--- retrieve PLANS_TXT
    pa_plans_txt_old.value = lf_domdata.getElementsByTagName('EX_F_PLANS_TXT')[0].childNodes[0].nodeValue;
//--- retrieve SACHP
    pa_sachp_old.value = lf_domdata.getElementsByTagName('EX_F_SACHP')[0].childNodes[0].nodeValue;
//--- retrieve SACHP_TXT
    pa_sachp_txt_old.value = lf_domdata.getElementsByTagName('EX_F_SACHP_TXT')[0].childNodes[0].nodeValue;
//--- retrieve STELL
    pa_stell_old.value = lf_domdata.getElementsByTagName('EX_F_STELL')[0].childNodes[0].nodeValue;
//--- retrieve STELL_TXT
    pa_stell_txt_old.value = lf_domdata.getElementsByTagName('EX_F_STELL_TXT')[0].childNodes[0].nodeValue;
//--- retrieve WERKS
    pa_werks_old.value = lf_domdata.getElementsByTagName('EX_F_WERKS')[0].childNodes[0].nodeValue;
//--- retrieve WERKS_TXT
    pa_werks_txt_old.value = lf_domdata.getElementsByTagName('EX_F_WERKS_TXT')[0].childNodes[0].nodeValue;

}

//--- for loadPernrDetails, we call the backend web-service...
function checkAppData() {
    //mini.createDismissibleMessage("checkAppData() started...");
    var lf_url = "http://213.23.110.71:8000/sap/bc/srt/rfc/sap/zmur_hcm_collab/801/zmur_hcm_collab/zmur_hcm_collab";
    var lf_soapEnvelope_beg = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:urn=\"urn:sap-com:document:sap:rfc:functions\"><soapenv:Header/><soapenv:Body><urn:ZMUR_HCM_PNF_PCH_CHECK>";
    var lf_soapEnvelope_end = "</urn:ZMUR_HCM_PNF_PCH_CHECK></soapenv:Body></soapenv:Envelope>";

//--- get all the values from the input fields and package them into tags
    var lf_soapEnvelope_Pernr = "<IM_F_PERNR>" + pa_pernr.value + "</IM_F_PERNR>";
    var lf_soapEnvelope_Btrtl = "<IM_F_BTRTL_NEW>" + pa_btrtl_new.value + "</IM_F_BTRTL_NEW>";
    var lf_soapEnvelope_Bukrs = "<IM_F_BUKRS_NEW>" + pa_bukrs_new.value + "</IM_F_BUKRS_NEW>";
    var lf_soapEnvelope_Kostl = "<IM_F_KOSTL_NEW>" + pa_kostl_new.value + "</IM_F_KOSTL_NEW>";
    var lf_soapEnvelope_Orgeh = "<IM_F_ORGEH_NEW>" + pa_orgeh_new.value + "</IM_F_ORGEH_NEW>";
    var lf_soapEnvelope_Plans = "<IM_F_PLANS_NEW>" + pa_plans_new.value + "</IM_F_PLANS_NEW>";
    var lf_soapEnvelope_Sachp = "<IM_F_SACHP_NEW>" + pa_sachp_new.value + "</IM_F_SACHP_NEW>";
    var lf_soapEnvelope_Stell = "<IM_F_STELL_NEW>" + pa_stell_new.value + "</IM_F_STELL_NEW>";
    var lf_soapEnvelope_Werks = "<IM_F_WERKS_NEW>" + pa_werks_new.value + "</IM_F_WERKS_NEW>";

//--- put the complete soap envelope together
    var lf_soapEnvelope;
    lf_soapEnvelope = lf_soapEnvelope_beg
        + lf_soapEnvelope_Btrtl
        + lf_soapEnvelope_Bukrs
        + lf_soapEnvelope_Kostl
        + lf_soapEnvelope_Orgeh
        + lf_soapEnvelope_Pernr
        + lf_soapEnvelope_Plans
        + lf_soapEnvelope_Sachp
        + lf_soapEnvelope_Stell
        + lf_soapEnvelope_Werks
        + lf_soapEnvelope_end;

    var lf_params = {};
    lf_params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
    lf_params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.NONE;
    lf_params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
    lf_params[gadgets.io.RequestParameters.HEADERS] = {
        "SOAPAction":"ZmurCollabGetWorklistRequest",
        "Content-Type":"text/xml; charset=utf-8"
    };
    lf_params[gadgets.io.RequestParameters.POST_DATA] = lf_soapEnvelope;
    gadgets.io.makeRequest(lf_url, responseCheckAppData, lf_params);
}

function responseCheckAppData(obj) {
    mini.createDismissibleMessage("responseCheckAppData() started...");
    var lf_domdata = obj.data;
//--- get message table
    var lf_elMessages = lf_domdata.getElementsByTagName('EX_T_MESSAGE')[0];
    for( var x = 0; x < lf_elMessages.childNodes.length; x++ ) {
        var lf_elItem = lf_elMessages.childNodes[x];
//      var lf_message = lf_elItem.getElementsByName('MESSAGE')[0].childNodes[0].value;
        var lf_elMessage = lf_elItem.getElementsByTagName('MESSAGE')[0];
        var lf_Message = lf_elItem.childNodes[3].value;
        mini.createDismissibleMessage(lf_message);
    }

}

//--- Register our on-view-load handler
gadgets.util.registerOnLoadHandler(init);