
//--- Declarations

//--- Factory for mini messages
var mini;

//--- Currently logged in user
var gf_userId = '';

//--- Owner of this activity/tool
var gf_ownerId = '';
var gf_ownerName = '';

//--- UUID for this tool
var gf_uuid;


//--- On-view-load initialization
function init() {
    var lf_message;
    mini = new gadgets.MiniMessage();

//    lf_message = 'loadAppData()';
//    alert(lf_message);
//    loadAppData();
    loadUser();

}


//--- ------------------------------------------------------------------------------ ---//
//--- Load the currently logged in user                                              ---//
//--- ------------------------------------------------------------------------------ ---//
function loadUser() {
    osapi.people.getViewer().execute(
        function(result){
            if (result.error){
                var lf_message = "loadUser(): " + result.error.message;
                mini.createDismissibleMessage(lf_message);
            } else {
                gf_userId = result.id;
                loadOwner();
            }
        }
    );
};

//--- ------------------------------------------------------------------------------ ---//
//--- Load the currently logged in user                                              ---//
//--- ------------------------------------------------------------------------------ ---//
function loadOwner() {
    osapi.people.getOwner().execute(
        function(result){
            if (result.error){
                var lf_message = "loadOwner(): " + result.error.message;
                mini.createDismissibleMessage(lf_message);
            } else {
                gf_ownerId = result.id;
                gf_ownerName = result.displayName;
                alert(gf_userId);
                alert(gf_ownerId);
                loadAppData();
            }
        }
    );
};

//--- ------------------------------------------------------------------------------ ---//
//--- Loading the data, which has been saved from the form                           ---//
//--- ------------------------------------------------------------------------------ ---//
function loadAppData() {
    //mini.createDismissibleMessage("loadAppData() started");
    alert('loadAppData() opsapi.appdata.get');
    osapi.appdata.get({
        userId: "@owner",
        groupId: "@friends"
    }).execute(function(response) {
            alert('loadAppData() response');
            if (response.error) {
                mini.createDismissibleMessage(response.error.message);
            } else {
                for (p in response) {
                    if (!response[p]) { alert('loadAppData() continue'); continue; }

//--- response is fine let's read UUID
                    if (typeof(response[p].pch_uuid)!=='undefined') {
                        gf_uuid = response[p].pch_uuid;
//--- ok, we have the UUID, now let's read the data from the backend

                    } else {
//--- we don't have a UUID yet, hence alert
                        if (gf_ownerId!=gf_userId ) {
                            var lf_message = 'The owner has not linked a process to this activity yet. ' +
                                'Please contact the owner (' + gf_ownerName + ').';
                            alert (lf_message);
                        } else {
                            var lf_message = 'Please enter a personalnumber and start the activity by ' +
                                'clicking on the "register" button.';
                            alert (lf_message);
                        }
                    }

                }
//--- if pa_bukrs_old is empty, the perform loadPernrDetails()
//              if (pa_bukrs_old.value==''&&pa_pernr.value!=='') { loadPernrDetails2() }
            }
        }
    );
}
//--- ------------------------------------------------------------------------------ ---//
//--- Saving the data entered into the form                                          ---//
//--- ------------------------------------------------------------------------------ ---//
function saveAppData(im_f_my_status) {
    //mini.createDismissibleMessage("save button clicked");

//--- at the beginning, we assume the set the status, since
//    it needs to be persisted as well. It can either be
//    a "2" for successfully saved, or " " for initial
    my_status.value = im_f_my_status;

    var lf_pernr_value     = pa_pernr.value;
    var lf_date_value      = pa_date.value;
    var lf_massg_value     = pa_massg.value;
    var lf_my_status_value = my_status.value;
    var lf_bukrs_new_value = pa_bukrs_new.value;
    var lf_werks_new_value = pa_werks_new.value;
    var lf_btrtl_new_value = pa_btrtl_new.value;
    var lf_orgeh_new_value = pa_orgeh_new.value;
    var lf_plans_new_value = pa_plans_new.value;
    var lf_sachp_new_value = pa_sachp_new.value;
    var lf_stell_new_value = pa_stell_new.value;
    var lf_kostl_new_value = pa_kostl_new.value;

    osapi.appdata.update({
        userId: "@viewer",
        groupId: "@friends",
        data: { pa_pernr:     lf_pernr_value,
            pa_date:      lf_date_value,
            pa_massg:     lf_massg_value,
            my_status:    lf_my_status_value,
            pa_bukrs_new: lf_bukrs_new_value,
            pa_werks_new: lf_werks_new_value,
            pa_btrtl_new: lf_btrtl_new_value,
            pa_orgeh_new: lf_orgeh_new_value,
            pa_plans_new: lf_plans_new_value,
            pa_sachp_new: lf_sachp_new_value,
            pa_stell_new: lf_stell_new_value,
            pa_kostl_new: lf_kostl_new_value
        }
    }).execute(function(response) {
            if (response.error) {
                mini.createDismissibleMessage(response.error.message);
            } else {
                mini.createDismissibleMessage("Application data saved...");
            }
        });
}

//--- ------------------------------------------------------------------------------ ---//
//--- for loadPernrDetails, we call the backend web-service...                       ---//
//--- ------------------------------------------------------------------------------ ---//
function loadPernrDetails() {
    //var lf_message = "loadPernrDetails() started for pernr " + pa_pernr.value;
    //mini.createDismissibleMessage(lf_message);

//--- here we put the request (soapEnvelope) together
    var lf_url = "http://213.23.110.71:8000/sap/bc/srt/rfc/sap/zmur_hcm_collab/801/zmur_hcm_collab/zmur_hcm_collab";
    var lf_soapEnvelope_beg = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:urn=\"urn:sap-com:document:sap:rfc:functions\"><soapenv:Header/><soapenv:Body><urn:ZMUR_HCM_PNF_PCH_OPEN>";
    var lf_soapEnvelope_end = "</urn:ZMUR_HCM_PNF_PCH_OPEN></soapenv:Body></soapenv:Envelope>";
    var lf_soapEnvelope_Pernr = "<IM_F_PERNR>" + pa_pernr.value + "</IM_F_PERNR>";
    var lf_soapEnvelope_UserId = "<IM_F_USERID>"  + gf_userId  + "</IM_F_USERID>";
    var lf_soapEnvelope =   lf_soapEnvelope_beg
        + lf_soapEnvelope_Pernr
        + lf_soapEnvelope_UserId
        + lf_soapEnvelope_end;

//--- and put the request together
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

//--- ------------------------------------------------------------------------------ ---//
//--- ...to receive the pernrDetails                                                 ---//
//--- ------------------------------------------------------------------------------ ---//
function responseLoadPernrDetails(obj) {
    //mini.createDismissibleMessage("responseLoadPernrDetails() started...");
    var lf_domdata = obj.data;
//--- retrieve display name
    if (typeof(lf_domdata.getElementsByTagName('EX_F_DISPLAY_NAME')[0].childNodes[0])!=='undefined')
    { pa_name.value = lf_domdata.getElementsByTagName('EX_F_DISPLAY_NAME')[0].childNodes[0].nodeValue; }
//--- retrieve BUKRS
    if (typeof(lf_domdata.getElementsByTagName('EX_F_BUKRS')[0].childNodes[0])!=='undefined')
    { pa_bukrs_old.value = lf_domdata.getElementsByTagName('EX_F_BUKRS')[0].childNodes[0].nodeValue; }
//--- retrieve BUKRS_TXT
    if (typeof(lf_domdata.getElementsByTagName('EX_F_BUKRS_TXT')[0].childNodes[0])!=='undefined')
    { pa_bukrs_txt_old.value = lf_domdata.getElementsByTagName('EX_F_BUKRS_TXT')[0].childNodes[0].nodeValue; }
//--- retrieve BTRTL
    if (typeof(lf_domdata.getElementsByTagName('EX_F_BTRTL')[0].childNodes[0])!=='undefined')
    { pa_btrtl_old.value = lf_domdata.getElementsByTagName('EX_F_BTRTL')[0].childNodes[0].nodeValue; }
//--- retrieve BTRTL_TXT
    if (typeof(lf_domdata.getElementsByTagName('EX_F_BTRTL_TXT')[0].childNodes[0])!=='undefined')
    { pa_btrtl_txt_old.value = lf_domdata.getElementsByTagName('EX_F_BTRTL_TXT')[0].childNodes[0].nodeValue; }
//--- retrieve KOSTL
    if (typeof(lf_domdata.getElementsByTagName('EX_F_KOSTL')[0].childNodes[0])!=='undefined')
    { pa_kostl_old.value = lf_domdata.getElementsByTagName('EX_F_KOSTL')[0].childNodes[0].nodeValue; }
//--- retrieve BTRTL_TXT
    if (typeof(lf_domdata.getElementsByTagName('EX_F_KOSTL_TXT')[0].childNodes[0])!=='undefined')
    { pa_kostl_txt_old.value = lf_domdata.getElementsByTagName('EX_F_KOSTL_TXT')[0].childNodes[0].nodeValue; }
//--- retrieve ORGEH
    if (typeof(lf_domdata.getElementsByTagName('EX_F_ORGEH')[0].childNodes[0])!=='undefined')
    { pa_orgeh_old.value = lf_domdata.getElementsByTagName('EX_F_ORGEH')[0].childNodes[0].nodeValue; }
//--- retrieve ORGEH_TXT
    if (typeof(lf_domdata.getElementsByTagName('EX_F_ORGEH_TXT')[0].childNodes[0])!=='undefined')
    { pa_orgeh_txt_old.value = lf_domdata.getElementsByTagName('EX_F_ORGEH_TXT')[0].childNodes[0].nodeValue; }
//--- retrieve PLANS
    if (typeof(lf_domdata.getElementsByTagName('EX_F_PLANS')[0].childNodes[0])!=='undefined')
    { pa_plans_old.value = lf_domdata.getElementsByTagName('EX_F_PLANS')[0].childNodes[0].nodeValue; }
//--- retrieve PLANS_TXT
    if (typeof(lf_domdata.getElementsByTagName('EX_F_PLANS_TXT')[0].childNodes[0])!=='undefined')
    { pa_plans_txt_old.value = lf_domdata.getElementsByTagName('EX_F_PLANS_TXT')[0].childNodes[0].nodeValue; }
//--- retrieve SACHP
    if (typeof(lf_domdata.getElementsByTagName('EX_F_SACHP')[0].childNodes[0])!=='undefined')
    { pa_sachp_old.value = lf_domdata.getElementsByTagName('EX_F_SACHP')[0].childNodes[0].nodeValue; }
//--- retrieve SACHP_TXT
    if (typeof(lf_domdata.getElementsByTagName('EX_F_SACHP_TXT')[0].childNodes[0])!=='undefined')
    { pa_sachp_txt_old.value = lf_domdata.getElementsByTagName('EX_F_SACHP_TXT')[0].childNodes[0].nodeValue; }
//--- retrieve STELL
    if (typeof(lf_domdata.getElementsByTagName('EX_F_STELL')[0].childNodes[0])!=='undefined')
    { pa_stell_old.value = lf_domdata.getElementsByTagName('EX_F_STELL')[0].childNodes[0].nodeValue; }
//--- retrieve STELL_TXT
    if (typeof(lf_domdata.getElementsByTagName('EX_F_STELL_TXT')[0].childNodes[0])!=='undefined')
    { pa_stell_txt_old.value = lf_domdata.getElementsByTagName('EX_F_STELL_TXT')[0].childNodes[0].nodeValue; }
//--- retrieve WERKS
    if (typeof(lf_domdata.getElementsByTagName('EX_F_WERKS')[0].childNodes[0])!=='undefined')
    { pa_werks_old.value = lf_domdata.getElementsByTagName('EX_F_WERKS')[0].childNodes[0].nodeValue; }
//--- retrieve WERKS_TXT
    if (typeof(lf_domdata.getElementsByTagName('EX_F_WERKS_TXT')[0].childNodes[0])!=='undefined')
    { pa_werks_txt_old.value = lf_domdata.getElementsByTagName('EX_F_WERKS_TXT')[0].childNodes[0].nodeValue; }

//--- get bukrs_select table, and add values to the
    var lf_elBukrsNewSelects = lf_domdata.getElementsByTagName('EX_T_BUKRS_SELECT')[0];
    for( var x1 = 0; x1 < lf_elBukrsNewSelects.childNodes.length; x1++ ) {
        var lf_elBukrsItem = lf_elBukrsNewSelects.childNodes[x1];
        var lf_bukrs = lf_elBukrsItem.getElementsByTagName('BUKRS')[0].childNodes[0].nodeValue;
        var lf_butxt = lf_elBukrsItem.getElementsByTagName('BUTXT')[0].childNodes[0].nodeValue;
        var lf_bukrs_text = lf_bukrs + ' - ' + lf_butxt;
        pa_bukrs_new.add(new Option(lf_bukrs_text, lf_bukrs));
    }

//--- get massg_select table, and add values to the
    var lf_elActionSelects = lf_domdata.getElementsByTagName('EX_T_MASSG_SELECT')[0];
    for( var x2 = 0; x2 < lf_elActionSelects.childNodes.length; x2++ ) {
        var lf_elActionItem = lf_elActionSelects.childNodes[x2];
        var lf_massg = lf_elActionItem.getElementsByTagName('MASSG')[0].childNodes[0].nodeValue;
        var lf_mgtxt = lf_elActionItem.getElementsByTagName('MGTXT')[0].childNodes[0].nodeValue;
        var lf_massg_text = lf_massg + ' - ' + lf_mgtxt;
        pa_massg.add(new Option(lf_massg_text, lf_massg));
    }

//--- get message table, and out them as messages
    var lf_elMessages = lf_domdata.getElementsByTagName('EX_T_MESSAGE')[0];
    for( var x = 0; x < lf_elMessages.childNodes.length; x++ ) {
        var lf_elItem = lf_elMessages.childNodes[x];
        var lf_msgType = lf_elItem.getElementsByTagName('TYPE')[0].childNodes[0].nodeValue;
        var lf_msgNumber = lf_elItem.getElementsByTagName('NUMBER')[0].childNodes[0].nodeValue;
        var lf_msgMessage = lf_elItem.getElementsByTagName('MESSAGE')[0].childNodes[0].nodeValue;
        var lf_msg = lf_msgType + ' ' + lf_msgNumber + ' "' + lf_msgMessage + '"';
        mini.createDismissibleMessage(lf_msg);
    }

//--- at the end, we set the my_status field accordingly
    my_status.value = "1";

//--- and we also disable the pernr field and hide pushbutton
    pa_pernr.disabled = "disabled";
    button_loadPernr.disabled = "disabled";

}

//--- ------------------------------------------------------------------------------ ---//
//--- for loadPernrDetails, we call the backend web-service...                       ---//
//--- ------------------------------------------------------------------------------ ---//
function loadPernrDetails2() {
    //var lf_message = "loadPernrDetails() started for pernr " + pa_pernr.value;
    //mini.createDismissibleMessage(lf_message);
//--- here we put the request (soapEnvelope) together
    var lf_url = "http://213.23.110.71:8000/sap/bc/srt/rfc/sap/zmur_hcm_collab/801/zmur_hcm_collab/zmur_hcm_collab";
    var lf_soapEnvelope_beg = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:urn=\"urn:sap-com:document:sap:rfc:functions\"><soapenv:Header/><soapenv:Body><urn:ZMUR_HCM_PNF_PCH_OPEN>";
    var lf_soapEnvelope_end = "</urn:ZMUR_HCM_PNF_PCH_OPEN></soapenv:Body></soapenv:Envelope>";
    var lf_soapEnvelope_Pernr = "<IM_F_PERNR>" + pa_pernr.value + "</IM_F_PERNR>";
    var lf_soapEnvelope_UserId = "<IM_F_USERID>"  + gf_userId  + "</IM_F_USERID>";
    var lf_soapEnvelope =   lf_soapEnvelope_beg
        + lf_soapEnvelope_Pernr
        + lf_soapEnvelope_UserId
        + lf_soapEnvelope_end;

    var lf_params = {};
    lf_params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
    lf_params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.NONE;
    lf_params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
    lf_params[gadgets.io.RequestParameters.HEADERS] = {
        "SOAPAction": "ZmurCollabGetWorklistRequest",
        "Content-Type": "text/xml; charset=utf-8"
    };
    lf_params[gadgets.io.RequestParameters.POST_DATA] = lf_soapEnvelope;
    gadgets.io.makeRequest(lf_url, responseLoadPernrDetails2, lf_params);
}

//--- ------------------------------------------------------------------------------ ---//
//--- ...to receive the pernrDetails                                                 ---//
//--- ------------------------------------------------------------------------------ ---//
function responseLoadPernrDetails2(obj) {

//--- we call the main function first
    responseLoadPernrDetails(obj);

//--- now that we have the options for the SELECT tags, we
//    can fill them with the data we saved in the _CT fields
    pa_massg.value = pa_massg_ct.value;
    pa_bukrs_new.value = pa_bukrs_new_ct.value;
}

//--- ------------------------------------------------------------------------------ ---//
//--- for checkAppData, we call the backend web-service...                           ---//
//--- ------------------------------------------------------------------------------ ---//
function checkAppData() {
    //mini.createDismissibleMessage("checkAppData() started...");
    var lf_url = "http://213.23.110.71:8000/sap/bc/srt/rfc/sap/zmur_hcm_collab/801/zmur_hcm_collab/zmur_hcm_collab";
    var lf_soapEnvelope_beg = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:urn=\"urn:sap-com:document:sap:rfc:functions\"><soapenv:Header/><soapenv:Body><urn:ZMUR_HCM_PNF_PCH_CHECK>";
    var lf_soapEnvelope_end = "</urn:ZMUR_HCM_PNF_PCH_CHECK></soapenv:Body></soapenv:Envelope>";

//--- get all the values from the input fields and package them into tags
    var lf_soapEnvelope_Pernr  = "<IM_F_PERNR>" + pa_pernr.value + "</IM_F_PERNR>";
    var lf_soapEnvelope_UserId = "<IM_F_USERID>"  + gf_userId  + "</IM_F_USERID>";
    var lf_soapEnvelope_Date   = "<IM_F_DATE>"  + pa_date.value  + "</IM_F_DATE>";
    var lf_soapEnvelope_Massg  = "<IM_F_MASSG>" + pa_massg.value  + "</IM_F_MASSG>";
    var lf_soapEnvelope_Btrtl  = "<IM_F_BTRTL_NEW>" + pa_btrtl_new.value + "</IM_F_BTRTL_NEW>";
    var lf_soapEnvelope_Bukrs  = "<IM_F_BUKRS_NEW>" + pa_bukrs_new.value + "</IM_F_BUKRS_NEW>";
    var lf_soapEnvelope_Kostl  = "<IM_F_KOSTL_NEW>" + pa_kostl_new.value + "</IM_F_KOSTL_NEW>";
    var lf_soapEnvelope_Orgeh  = "<IM_F_ORGEH_NEW>" + pa_orgeh_new.value + "</IM_F_ORGEH_NEW>";
    var lf_soapEnvelope_Plans  = "<IM_F_PLANS_NEW>" + pa_plans_new.value + "</IM_F_PLANS_NEW>";
    var lf_soapEnvelope_Sachp  = "<IM_F_SACHP_NEW>" + pa_sachp_new.value + "</IM_F_SACHP_NEW>";
    var lf_soapEnvelope_Stell  = "<IM_F_STELL_NEW>" + pa_stell_new.value + "</IM_F_STELL_NEW>";
    var lf_soapEnvelope_Werks  = "<IM_F_WERKS_NEW>" + pa_werks_new.value + "</IM_F_WERKS_NEW>";

//--- put the complete soap envelope together
    var lf_soapEnvelope;
    lf_soapEnvelope = lf_soapEnvelope_beg
        + lf_soapEnvelope_Btrtl
        + lf_soapEnvelope_Bukrs
        + lf_soapEnvelope_Date
        + lf_soapEnvelope_Kostl
        + lf_soapEnvelope_Massg
        + lf_soapEnvelope_Orgeh
        + lf_soapEnvelope_Pernr
        + lf_soapEnvelope_Plans
        + lf_soapEnvelope_Sachp
        + lf_soapEnvelope_Stell
        + lf_soapEnvelope_UserId
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

//--- ------------------------------------------------------------------------------ ---//
//--- response for CheckAppData                                                      ---//
//--- ------------------------------------------------------------------------------ ---//
function responseCheckAppData(obj) {
    //mini.createDismissibleMessage("responseCheckAppData() started...");
    var lf_domdata = obj.data;
//--- get message table, and out them as messages
    var lf_elMessages = lf_domdata.getElementsByTagName('EX_T_MESSAGE')[0];
    for( var x = 0; x < lf_elMessages.childNodes.length; x++ ) {
        var lf_elItem = lf_elMessages.childNodes[x];
        var lf_msgType = lf_elItem.getElementsByTagName('TYPE')[0].childNodes[0].nodeValue;
        var lf_msgNumber = lf_elItem.getElementsByTagName('NUMBER')[0].childNodes[0].nodeValue;
        var lf_msgMessage = lf_elItem.getElementsByTagName('MESSAGE')[0].childNodes[0].nodeValue;
        var lf_msg = lf_msgType + ' ' + lf_msgNumber + ' "' + lf_msgMessage + '"';
        mini.createDismissibleMessage(lf_msg);
    }
}

//--- ------------------------------------------------------------------------------ ---//
//--- for submitAppData, we call the backend web-service...                           ---//
//--- ------------------------------------------------------------------------------ ---//
function submitAppData() {
    mini.createDismissibleMessage("submitAppData() started...");
    var lf_url = "http://213.23.110.71:8000/sap/bc/srt/rfc/sap/zmur_hcm_collab/801/zmur_hcm_collab/zmur_hcm_collab";
    var lf_soapEnvelope_beg = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:urn=\"urn:sap-com:document:sap:rfc:functions\"><soapenv:Header/><soapenv:Body><urn:ZMUR_HCM_PNF_PCH_SEND>";
    var lf_soapEnvelope_end = "</urn:ZMUR_HCM_PNF_PCH_SEND></soapenv:Body></soapenv:Envelope>";

//--- get all the values from the input fields and package them into tags
    var lf_soapEnvelope_Pernr  = "<IM_F_PERNR>" + pa_pernr.value + "</IM_F_PERNR>";
    var lf_soapEnvelope_UserId = "<IM_F_USERID>"  + gf_userId  + "</IM_F_USERID>";
    var lf_soapEnvelope_Date   = "<IM_F_DATE>"  + pa_date.value  + "</IM_F_DATE>";
    var lf_soapEnvelope_Massg  = "<IM_F_MASSG>" + pa_massg.value  + "</IM_F_MASSG>";
    var lf_soapEnvelope_Btrtl  = "<IM_F_BTRTL_NEW>" + pa_btrtl_new.value + "</IM_F_BTRTL_NEW>";
    var lf_soapEnvelope_Bukrs  = "<IM_F_BUKRS_NEW>" + pa_bukrs_new.value + "</IM_F_BUKRS_NEW>";
    var lf_soapEnvelope_Kostl  = "<IM_F_KOSTL_NEW>" + pa_kostl_new.value + "</IM_F_KOSTL_NEW>";
    var lf_soapEnvelope_Orgeh  = "<IM_F_ORGEH_NEW>" + pa_orgeh_new.value + "</IM_F_ORGEH_NEW>";
    var lf_soapEnvelope_Plans  = "<IM_F_PLANS_NEW>" + pa_plans_new.value + "</IM_F_PLANS_NEW>";
    var lf_soapEnvelope_Sachp  = "<IM_F_SACHP_NEW>" + pa_sachp_new.value + "</IM_F_SACHP_NEW>";
    var lf_soapEnvelope_Stell  = "<IM_F_STELL_NEW>" + pa_stell_new.value + "</IM_F_STELL_NEW>";
    var lf_soapEnvelope_Werks  = "<IM_F_WERKS_NEW>" + pa_werks_new.value + "</IM_F_WERKS_NEW>";
    var lf_soapEnvelope_Event  = "<IM_F_EVENT>SEND</IM_F_EVENT>";

//--- put the complete soap envelope together
    var lf_soapEnvelope;
    lf_soapEnvelope = lf_soapEnvelope_beg
        + lf_soapEnvelope_Btrtl
        + lf_soapEnvelope_Bukrs
        + lf_soapEnvelope_Date
        + lf_soapEnvelope_Event
        + lf_soapEnvelope_Kostl
        + lf_soapEnvelope_Massg
        + lf_soapEnvelope_Orgeh
        + lf_soapEnvelope_Pernr
        + lf_soapEnvelope_Plans
        + lf_soapEnvelope_Sachp
        + lf_soapEnvelope_Stell
        + lf_soapEnvelope_UserId
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
    gadgets.io.makeRequest(lf_url, responseSubmitAppData, lf_params);
}

//--- ------------------------------------------------------------------------------ ---//
//--- response for SubmitAppData                                                     ---//
//--- ------------------------------------------------------------------------------ ---//
function responseSubmitAppData(obj) {
    mini.createDismissibleMessage("responseSubmitAppData() started...");
    var lf_domdata = obj.data;
//--- get message table, and out them as messages
    var lf_elMessages = lf_domdata.getElementsByTagName('EX_T_MESSAGE')[0];
    for( var x = 0; x < lf_elMessages.childNodes.length; x++ ) {
        var lf_elItem = lf_elMessages.childNodes[x];
        var lf_msgType = lf_elItem.getElementsByTagName('TYPE')[0].childNodes[0].nodeValue;
        var lf_msgNumber = lf_elItem.getElementsByTagName('NUMBER')[0].childNodes[0].nodeValue;
        var lf_msgMessage = lf_elItem.getElementsByTagName('MESSAGE')[0].childNodes[0].nodeValue;
        var lf_msg = lf_msgType + ' ' + lf_msgNumber + ' "' + lf_msgMessage + '"';
        mini.createDismissibleMessage(lf_msg);
    }
}


//--- ------------------------------------------------------------------------------ ---//
//--- Reset Application Data. This will reset everything...                          ---//
//--- ------------------------------------------------------------------------------ ---//
function resetAppData( ) {
    var answer = confirm("This will reset all appData! Would you like to proceed?");
    if (answer) {
//--- clear all values
        pa_pernr.value = "";
        pa_name.value = "";
        pa_date.value = "";
        pa_massg.value = "";
        my_status.value = "";
//--- clear new-values
        pa_bukrs_new.value = "";
        pa_werks_new.value = "";
        pa_btrtl_new.value = "";
        pa_orgeh_new.value = "";
        pa_plans_new.value = "";
        pa_sachp_new.value = "";
        pa_stell_new.value = "";
        pa_kostl_new.value = "";
//--- clear old-values
        pa_bukrs_old.value = "";
        pa_werks_old.value = "";
        pa_btrtl_old.value = "";
        pa_orgeh_old.value = "";
        pa_plans_old.value = "";
        pa_sachp_old.value = "";
        pa_stell_old.value = "";
        pa_kostl_old.value = "";
        pa_bukrs_txt_old.value = "";
        pa_werks_txt_old.value = "";
        pa_btrtl_txt_old.value = "";
        pa_orgeh_txt_old.value = "";
        pa_plans_txt_old.value = "";
        pa_sachp_txt_old.value = "";
        pa_stell_txt_old.value = "";
        pa_kostl_txt_old.value = "";
//--- then save AppData, with status set to inital
        saveAppData('');
// then, we can remove the options from the select fields
        var i;
        for (i=pa_massg.length-1;i>=0;i--) {
            pa_massg.remove(i);
        }
        for (i=pa_bukrs_new.length-1;i>=0;i--) {
            pa_bukrs_new.remove(i);
        }

//--- and open pa_pernr again
        pa_pernr.disabled = "";
        button_loadPernr.disabled = "";

        mini.createDismissibleMessage("Application data cleared..");
    } else { mini.createDismissibleMessage("...action cancelled, no data cleared."); }

}

//--- Register our on-view-load handler
gadgets.util.registerOnLoadHandler(init);