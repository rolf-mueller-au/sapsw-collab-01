
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
	mini.createDismissibleMessage("registerHandlers() started");

}

//--- Load the currently logged in user
function loadUser() {
  console.log("loadUser() started");
	mini.createDismissibleMessage("loadUser() started");
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
	mini.createDismissibleMessage("loadAppData() started");

	osapi.appdata.get({
		userId: "@viewer",
		groupId: "@self"
		}).execute(function(response) {
      if (response.error) {
				mini.createDismissibleMessage(response.error.message);
			} else {
				for (p in response) {
          if (!response[p]) { continue; }
          pa_bukrs_new.value = response[p].pa_bukrs_new;
					pa_werks_new.value = response[p].pa_werks_new;
        }
			}
		});
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
    mini.createDismissibleMessage("loadPernrDetails() started...");
    var lf_url = "http://213.23.110.71:8000/sap/bc/srt/rfc/sap/zmur_hcm_collab/801/zmur_hcm_collab/zmur_hcm_collab";
    var lf_soapEnvelope_1 = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:urn=\"urn:sap-com:document:sap:rfc:functions\"><soapenv:Header/><soapenv:Body><urn:ZMUR_HCM_GET_EE_NAME><IM_F_PERNR>";
    var lf_soapEnvelope_2 = "</IM_F_PERNR></urn:ZMUR_HCM_GET_EE_NAME></soapenv:Body></soapenv:Envelope>";
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
    mini.createDismissibleMessage("responseLoadPernrDetails() started...");
    var lf_domdata = obj.data;
//--- retrieve display name
    var lf_el_display_name = lf_domdata.getElementsByTagName('EX_F_DISPLAY_NAME')[0];
    var lf_display_name = lf_el_display_name.childNodes[0].nodeValue;
    pa_name.value = lf_display_name;
//--- retrieve BUKRS
    var lf_el_bukrs = lf_domdata.getElementsByTagName('EX_F_BUKRS')[0];
    var lf_bukrs = lf_el_bukrs.childNodes[0].nodeValue;
    pa_bukrs_old.value = lf_bukrs;
//--- retrieve BUKRS_TXT
    var lf_el_bukrs_txt = lf_domdata.getElementsByTagName('EX_F_BUKRS_TXT')[0];
    var lf_bukrs_txt = lf_el_bukrs_txt.childNodes[0].nodeValue;
    pa_bukrstxt_old.value = lf_bukrs_txt;
}


//--- Register our on-view-load handler
gadgets.util.registerOnLoadHandler(init);