
//--- Declarations

//--- Factory for mini messages
var mini;

//--- Currently logged in user
var gf_userId = '';

//--- Owner of this activity/tool
var gf_ownerId = '';
var gf_ownerName = '';

//--- UUID for this tool
var gf_uuid = '';


//--- global variables related to the communicaiton with the backgend
var gf_url = 'http://213.23.110.71:8000/sap/bc/srt/rfc/sap/zmur_hcm_collab/801/zmur_hcm_collab/zmur_hcm_collab';
var gf_soapEnvelope_beg = '<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:urn=\"urn:sap-com:document:sap:rfc:functions\"><soapenv:Header/><soapenv:Body>';
var gf_soapEnvelope_end = "</soapenv:Body></soapenv:Envelope>";


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
//--- keep ownerId and ownerName
                gf_ownerId = result.id;
                gf_ownerName = result.displayName;
//--- if viewer not equal owner,then hide buttons
                if (gf_ownerId!=gf_userId) {
                    pa_pernr.disabled = 'disabled';
                    button_checkPernr.style.visibility = 'hidden';
                    button_regOpen.style.visibility = 'hidden';
                    button_resetAppData.style.visibility = 'hidden';
                    loadFriendsUuid();
                } else {
                    pa_pernr.disabled = '';
                    button_checkPernr.style.visibility = 'visible';
                    button_regOpen.style.visibility = 'visible';
                    button_resetAppData.style.visibility = 'visible';
                    loadSelfUuid();
                }
            }
        }
    );
}

//--- ------------------------------------------------------------------------------ ---//
//--- Try to load the UUID. If we don't have any, then there is nothing              ---//
//--- to collaboration about                                                         ---//
//--- ------------------------------------------------------------------------------ ---//
function loadSelfUuid() {
    var lf_message = '';
    osapi.appdata.get({
      userId: "@viewer",
      groupId: "@self"
    }).execute(function(response) {
            if (response.error) {
                mini.createDismissibleMessage(response.error.message);
            } else {
                var lf_no_p_in_response = 0;
                for (p in response) {
                    lf_no_p_in_response = lf_no_p_in_response + 1;
//--- we don't have a UUID yet, hence ask to register
                    if (!response[p]) {
                        var lf_message = 'This activity has not been registered with the backend yet.' +
                                         ' Would you like to register now?';
                        var lf_answer = confirm(lf_message);
                        if (lf_answer) {
                            pchRegUUID();
                        } else {
//--- we might have to add a button for pchRegUUID into the screen
                        }
                        button_saveAppData.style.visibility = 'hidden';
                        button_checkAppData.style.visibility = 'hidden';
                        button_submitAppData.style.visibility = 'hidden';
                        button_resetAppData.style.visibility = 'hidden';
                    }

//--- response is fine let's read UUID
                    if (typeof(response[p].pch_uuid)!=='undefined') {
                        gf_uuid = response[p].pch_uuid;
                        // div_UUID.innerHTML = 'UUID: ' + gf_uuid; "keep this code, good to know :-)
//--- ok, we have the UUID, now let's read the data from the backend through pchRead()
                        pchRead();

                    } else {
//--- we don't have a UUID yet, hence ask to register
                        lf_message = 'This activity has not been registered with the backend yet.' +
                                     ' Would you like to register now?';
                         var lf_answer = confirm(lf_message);
                         if (lf_answer) {
                             pchRegUUID();
                         } else {
//--- we might have to add a button for pchRegUUID into the screen
                         }
//--- regardless of the user, hide main buttons
                        button_saveAppData.style.visibility = 'hidden';
                        button_checkAppData.style.visibility = 'hidden';
                        button_submitAppData.style.visibility = 'hidden';
                        button_resetAppData.style.visibility = 'hidden';
                    }

                }
                if (lf_no_p_in_response==0) {
                    lf_message = 'This activity has not been registered with the backend yet.' +
                                 ' Would you like to register now?';
                    var lf_answer = confirm(lf_message);
                    if (lf_answer) {
                        pchRegUUID();
                    } else {
//--- we might have to add a button for pchRegUUID into the screen
                    }
//--- regardless of the user, hide main buttons
                    button_saveAppData.style.visibility = 'hidden';
                    button_checkAppData.style.visibility = 'hidden';
                    button_submitAppData.style.visibility = 'hidden';
                    button_resetAppData.style.visibility = 'hidden';
                }
//--- if pa_bukrs_old is empty, the perform loadPernrDetails()
//              if (pa_bukrs_old.value==''&&pa_pernr.value!=='') { loadPernrDetails2() }
            }
        }
    );
}

//--- ------------------------------------------------------------------------------ ---//
//--- Try to load the UUID. If we don't have any, then there is nothing              ---//
//--- to collaboration about                                                         ---//
//--- ------------------------------------------------------------------------------ ---//
function loadFriendsUuid() {
    var lf_message = '';
    osapi.appdata.get({
        userId: "@viewer",
        groupId: "@friends"
    }).execute(function(response) {
            if (response.error) {
                mini.createDismissibleMessage(response.error.message);
            } else {
                var lf_no_p_in_response = 0;
                for (p in response) {
                    lf_no_p_in_response = lf_no_p_in_response + 1;
//--- we don't have a UUID yet, hence alert the user to contact the owner
                    if (!response[p]) {
                        lf_message = 'The owner has not linked a process to this activity yet. ' +
                                     'Please contact the owner (' + gf_ownerName + ').';
                        alert (lf_message);
                        div_collab.style.visibility = 'hidden';
                    }

//--- response is fine let's read UUID
                    if (typeof(response[p].pch_uuid)!=='undefined') {
                        gf_uuid = response[p].pch_uuid;
                        // div_UUID.innerHTML = 'UUID: ' + gf_uuid; "keep this code, good to know :-)
//--- ok, we have the UUID, now let's read the data from the backend through pchRead()
                        pchRead();

                    } else {
//--- we don't have a UUID yet, hence alert the user to contact the owner
                        lf_message = 'The owner has not linked a process to this activity yet. ' +
                                     'Please contact the owner (' + gf_ownerName + ').';
                        alert (lf_message);
                        div_collab.style.visibility = 'hidden';
                    }
                }
                if (lf_no_p_in_response==0) {
//--- we don't have a UUID yet, hence alert the user to contact the owner
                    lf_message = 'The owner has not linked a process to this activity yet. ' +
                                 'Please contact the owner (' + gf_ownerName + ').';
                    alert (lf_message);
                    div_collab.style.visibility = 'hidden';
                }
            }
        }
    );
}

//--- ------------------------------------------------------------------------------ ---//
//--- pchRegUUID                                                                     ---//
//--- ------------------------------------------------------------------------------ ---//
function pchRegUUID() {

//--- here we assemble the soapEnvelope for the request
    var lf_urn_beg = '<urn:ZMUR_HCM_PNF_PCH_REG_UUID>';
    var lf_urn_end = '</urn:ZMUR_HCM_PNF_PCH_REG_UUID>';
    var lf_soapEnvelope_UserId = "<IM_F_USERID>"  + gf_userId  + "</IM_F_USERID>";
//--- assemble soapEnvelope
    var lf_soapEnvelope = gf_soapEnvelope_beg
        + lf_urn_beg
        + lf_soapEnvelope_UserId
        + lf_urn_end
        + gf_soapEnvelope_end;

//--- and put the request together
    var lf_params = {};
    lf_params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
    lf_params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.NONE;
    lf_params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
    lf_params[gadgets.io.RequestParameters.HEADERS] = {
        "SOAPAction": "",
        "Content-Type": "text/xml; charset=utf-8"
    };
    lf_params[gadgets.io.RequestParameters.POST_DATA] = lf_soapEnvelope;
    gadgets.io.makeRequest(gf_url, responseRegUUID, lf_params);
}

//--- ------------------------------------------------------------------------------ ---//
//--- responseRegUUID                                                                ---//
//--- ------------------------------------------------------------------------------ ---//
function responseRegUUID(obj) {
    //mini.createDismissibleMessage("responseRegUUID() started...");
    var lf_domdata = obj.data;

//--- retrieve UUID from backend
    var lf_node = obj.data.getElementsByTagName('EX_F_UUID')[0].childNodes[0];
    var lf_typeof = typeof(lf_node);
    if (lf_node==null || lf_typeof=='undefined') {
        alert('UUID could not be retrieved, registration of this tools failed.');
    } else {
        gf_uuid = lf_node.nodeValue;
//--- so we have retrieved the UUID from the backend, now we have to save it in APPDATA
        updateUUIDinAppData();
    }
}

//--- ------------------------------------------------------------------------------ ---//
//--- updateUUIDinAppData()                                                          ---//
//--- ------------------------------------------------------------------------------ ---//
function updateUUIDinAppData() {

    osapi.appdata.update({
        userId:  "@viewer",
        groupId: "@self",
        data: { pch_uuid: gf_uuid }
    }).execute(
        function(responseUpdateUUID) {
            if (responseUpdateUUID.error) {
                mini.createDismissibleMessage(responseUpdateUUID.error.message);
            } else {
//--- UUID registered, now we can show the buttons
              button_saveAppData.style.visibility = 'visible';
              button_checkAppData.style.visibility = 'visible';
              button_submitAppData.style.visibility = 'visible';
//--- out success message
                var lf_message = 'UUID successfully registered and saved. ' +
                                 'UUID = ' + gf_uuid;
                mini.createDismissibleMessage(lf_message);
            }
        }
    );

}


//--- ------------------------------------------------------------------------------ ---//
//--- regCheckPernr                                                                  ---//
//--- ------------------------------------------------------------------------------ ---//
function regCheckPernr() {
//--- here we assemble the soapEnvelope for the request
    var lf_urn_beg = '<urn:ZMUR_HCM_PNF_PCH_REG_CHECK>';
    var lf_urn_end = '</urn:ZMUR_HCM_PNF_PCH_REG_CHECK>';
    var lf_soapEnvelope_Pernr = "<IM_F_PERNR>"  + pa_pernr.value  + "</IM_F_PERNR>";
//--- assemble soapEnvelope
    var lf_soapEnvelope = gf_soapEnvelope_beg
        + lf_urn_beg
        + lf_soapEnvelope_Pernr
        + lf_urn_end
        + gf_soapEnvelope_end;

//--- and put the request together
    var lf_params = {};
    lf_params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
    lf_params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.NONE;
    lf_params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
    lf_params[gadgets.io.RequestParameters.HEADERS] = {
        "SOAPAction": "",
        "Content-Type": "text/xml; charset=utf-8"
    };
    lf_params[gadgets.io.RequestParameters.POST_DATA] = lf_soapEnvelope;
    gadgets.io.makeRequest(gf_url, responseRegCheckPernr, lf_params);
}

//--- ------------------------------------------------------------------------------ ---//
//--- responseRegCheckPernr                                                          ---//
//--- ------------------------------------------------------------------------------ ---//
function responseRegCheckPernr(obj) {

    var lf_domdata = obj.data;
    var lf_failed  = '';

//--- retrieve EX_F_FAILED from backend
    var lf_node = obj.data.getElementsByTagName('EX_F_FAILED')[0].childNodes[0];
    var lf_typeof = typeof(lf_node);
    if (lf_node==null || lf_typeof=='undefined') {
        lf_failed = '';
    } else {
        lf_failed = lf_node.nodeValue;
    }

    if (lf_failed=='X') {
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
        my_status.value = '3'; // 3 = In collaboration
        return;
    }

//--- retrieve current (old) information ------------------------------------------- ---//
    fillScreenField(obj,'EX_F_DISPLAY_NAME','pa_name');
    fillScreenField(obj,'EX_F_BUKRS','pa_bukrs_old');
    fillScreenField(obj,'EX_F_BUKRS_TXT','pa_bukrs_txt_old');
    fillScreenField(obj,'EX_F_BTRTL','pa_btrtl_old');
    fillScreenField(obj,'EX_F_BTRTL_TXT','pa_btrtl_txt_old');
    fillScreenField(obj,'EX_F_KOSTL','pa_kostl_old');
    fillScreenField(obj,'EX_F_KOSTL_TXT','pa_kostl_txt_old');
    fillScreenField(obj,'EX_F_ORGEH','pa_orgeh_old');
    fillScreenField(obj,'EX_F_ORGEH_TXT','pa_orgeh_txt_old');
    fillScreenField(obj,'EX_F_PLANS','pa_plans_old');
    fillScreenField(obj,'EX_F_PLANS_TXT','pa_plans_txt_old');
    fillScreenField(obj,'EX_F_SACHP','pa_sachp_old');
    fillScreenField(obj,'EX_F_SACHP_TXT','pa_sachp_txt_old');
    fillScreenField(obj,'EX_F_STELL','pa_stell_old');
    fillScreenField(obj,'EX_F_STELL_TXT','pa_stell_txt_old');
    fillScreenField(obj,'EX_F_WERKS','pa_werks_old');
    fillScreenField(obj,'EX_F_WERKS_TXT','pa_werks_txt_old');

}

//--- ------------------------------------------------------------------------------ ---//
//--- regOpen                                                                        ---//
//--- ------------------------------------------------------------------------------ ---//
function regOpen() {
//--- here we assemble the soapEnvelope for the request
    var lf_urn_beg = '<urn:ZMUR_HCM_PNF_PCH_REG_OPEN>';
    var lf_urn_end = '</urn:ZMUR_HCM_PNF_PCH_REG_OPEN>';
    var lf_soapEnvelope_UUID = "<IM_F_UUID>"  + gf_uuid  + "</IM_F_UUID>";
    var lf_soapEnvelope_Pernr = "<IM_F_PERNR>"  + pa_pernr.value  + "</IM_F_PERNR>";
    var lf_soapEnvelope_UserId = "<IM_F_USERID>"  + gf_userId  + "</IM_F_USERID>";
//--- assemble soapEnvelope
    var lf_soapEnvelope = gf_soapEnvelope_beg
        + lf_urn_beg
        + lf_soapEnvelope_Pernr
        + lf_soapEnvelope_UserId
        + lf_soapEnvelope_UUID
        + lf_urn_end
        + gf_soapEnvelope_end;

//--- and put the request together
    var lf_params = {};
    lf_params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
    lf_params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.NONE;
    lf_params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
    lf_params[gadgets.io.RequestParameters.HEADERS] = {
        "SOAPAction": "",
        "Content-Type": "text/xml; charset=utf-8"
    };
    lf_params[gadgets.io.RequestParameters.POST_DATA] = lf_soapEnvelope;
    gadgets.io.makeRequest(gf_url, responseRegOpen, lf_params);
}

//--- ------------------------------------------------------------------------------ ---//
//--- responseRegOpen()                                                              ---//
//--- ------------------------------------------------------------------------------ ---//
function responseRegOpen(obj) {
    //mini.createDismissibleMessage("responseLoadPernrDetails() started...");

//--- retrieve current (old) information ------------------------------------------- ---//
    fillScreenField(obj,'EX_F_DISPLAY_NAME','pa_name');
    fillScreenField(obj,'EX_F_BUKRS','pa_bukrs_old');
    fillScreenField(obj,'EX_F_BUKRS_TXT','pa_bukrs_txt_old');
    fillScreenField(obj,'EX_F_BTRTL','pa_btrtl_old');
    fillScreenField(obj,'EX_F_BTRTL_TXT','pa_btrtl_txt_old');
    fillScreenField(obj,'EX_F_KOSTL','pa_kostl_old');
    fillScreenField(obj,'EX_F_KOSTL_TXT','pa_kostl_txt_old');
    fillScreenField(obj,'EX_F_ORGEH','pa_orgeh_old');
    fillScreenField(obj,'EX_F_ORGEH_TXT','pa_orgeh_txt_old');
    fillScreenField(obj,'EX_F_PLANS','pa_plans_old');
    fillScreenField(obj,'EX_F_PLANS_TXT','pa_plans_txt_old');
    fillScreenField(obj,'EX_F_SACHP','pa_sachp_old');
    fillScreenField(obj,'EX_F_SACHP_TXT','pa_sachp_txt_old');
    fillScreenField(obj,'EX_F_STELL','pa_stell_old');
    fillScreenField(obj,'EX_F_STELL_TXT','pa_stell_txt_old');
    fillScreenField(obj,'EX_F_WERKS','pa_werks_old');
    fillScreenField(obj,'EX_F_WERKS_TXT','pa_werks_txt_old');

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

//--- As with the other places, we set the status manually to "3 = In collaboration".
//    But practically, this status needs to be stored in the backend and retrieved through this API
    my_status.value = "3";

//--- and we also disable the pernr field and hide pushbutton
    pa_pernr.disabled = "disabled";
//  button_loadPernr.disabled = "disabled";
    button_checkPernr.style.visibility = 'hidden';
    button_regOpen.style.visibility = 'hidden';

//--- at least out some message at the end
    var lf_message = 'PERNR (' + pa_pernr.value + ', ' + pa_name.value + ') successfully registered with the backend.';
    mini.createDismissibleMessage(lf_message);

}


//--- ------------------------------------------------------------------------------ ---//
//--- pchRead()                                                                      ---//
//--- ------------------------------------------------------------------------------ ---//
function pchRead() {
    //var lf_message = "loadPernrDetails() started for pernr " + pa_pernr.value;
    //mini.createDismissibleMessage(lf_message);

//--- here we assemble the soapEnvelope for the request
    var lf_urn_beg = '<urn:ZMUR_HCM_PNF_PCH_READ>';
    var lf_urn_end = '</urn:ZMUR_HCM_PNF_PCH_READ>';
    var lf_soapEnvelope_UUID = "<IM_F_UUID>" + gf_uuid + "</IM_F_UUID>";
    var lf_soapEnvelope_UserId = "<IM_F_USERID>"  + gf_userId  + "</IM_F_USERID>";
//--- assemble soapEnvelope
    var lf_soapEnvelope = gf_soapEnvelope_beg
        + lf_urn_beg
        + lf_soapEnvelope_UserId
        + lf_soapEnvelope_UUID
        + lf_urn_end
        + gf_soapEnvelope_end;

//--- and put the request together
    var lf_params = {};
    lf_params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
    lf_params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.NONE;
    lf_params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
    lf_params[gadgets.io.RequestParameters.HEADERS] = {
        "SOAPAction": "",
        "Content-Type": "text/xml; charset=utf-8"
    };
    lf_params[gadgets.io.RequestParameters.POST_DATA] = lf_soapEnvelope;
    gadgets.io.makeRequest(gf_url, responsePchRead, lf_params);
}

//--- ------------------------------------------------------------------------------ ---//
//--- responsePchRead()                                                              ---//
//--- ------------------------------------------------------------------------------ ---//
function responsePchRead(obj) {
    //mini.createDismissibleMessage("responsePchRead(obj) started...");
    var lf_domdata = obj.data;
    var lf_failed  = '';

//--- retrieve header related information ------------------------------------------ ---//
    fillScreenField(obj,'EX_F_PERNR','pa_pernr');
    fillScreenField(obj,'EX_F_DISPLAY_NAME','pa_name');
    fillScreenField(obj,'EX_F_STATUS','my_status');

//--- retrieve EX_F_FAILED --------------------------------------------------------- ---//
    var lf_nd_failed = obj.data.getElementsByTagName('EX_F_FAILED')[0].childNodes[0];
    var lf_ty_failed = typeof(lf_nd_failed);
    if (lf_nd_failed==null || lf_ty_failed=='undefined') {
        lf_failed = '';
    } else {
        lf_failed = lf_nd_failed.nodeValue;
    }

//--- retrieve current (old) information ------------------------------------------- ---//
    fillScreenField(obj,'EX_F_BUKRS','pa_bukrs_old');
    fillScreenField(obj,'EX_F_BUKRS_TXT','pa_bukrs_txt_old');
    fillScreenFieldDiv(obj,'EX_F_BUKRS','EX_F_BUKRS_TXT','div_pa_bukrs_old');
    fillScreenField(obj,'EX_F_BTRTL','pa_btrtl_old');
    fillScreenField(obj,'EX_F_BTRTL_TXT','pa_btrtl_txt_old');
    fillScreenFieldDiv(obj,'EX_F_BTRTL','EX_F_BTRTL_TXT','div_pa_btrtl_old');
    fillScreenField(obj,'EX_F_KOSTL','pa_kostl_old');
    fillScreenField(obj,'EX_F_KOSTL_TXT','pa_kostl_txt_old');
    fillScreenFieldDiv(obj,'EX_F_KOSTL','EX_F_KOSTL_TXT','div_pa_kostl_old');
    fillScreenField(obj,'EX_F_ORGEH','pa_orgeh_old');
    fillScreenField(obj,'EX_F_ORGEH_TXT','pa_orgeh_txt_old');
    fillScreenFieldDiv(obj,'EX_F_ORGEH','EX_F_ORGEH_TXT','div_pa_orgeh_old');
    fillScreenField(obj,'EX_F_PLANS','pa_plans_old');
    fillScreenField(obj,'EX_F_PLANS_TXT','pa_plans_txt_old');
    fillScreenFieldDiv(obj,'EX_F_PLANS','EX_F_PLANS_TXT','div_pa_plans_old');
    fillScreenField(obj,'EX_F_SACHP','pa_sachp_old');
    fillScreenField(obj,'EX_F_SACHP_TXT','pa_sachp_txt_old');
    fillScreenFieldDiv(obj,'EX_F_SACHP','EX_F_SACHP_TXT','div_pa_sachp_old');
    fillScreenField(obj,'EX_F_STELL','pa_stell_old');
    fillScreenField(obj,'EX_F_STELL_TXT','pa_stell_txt_old');
    fillScreenFieldDiv(obj,'EX_F_STELL','EX_F_STELL_TXT','div_pa_stell_old');
    fillScreenField(obj,'EX_F_WERKS','pa_werks_old');
    fillScreenField(obj,'EX_F_WERKS_TXT','pa_werks_txt_old');
    fillScreenFieldDiv(obj,'EX_F_WERKS','EX_F_WERKS_TXT','div_pa_werks_old');

//--- now retrieve collaboration data, we have this in this request too...
//    we have to start with the drop down values though, otherwise,
//    the drop-downs are empty...

//--- get bukrs_select table, and add values to the list of available values
    var lf_elBukrsNewSelects = lf_domdata.getElementsByTagName('EX_T_BUKRS_SELECT')[0];
    for( var x1 = 0; x1 < lf_elBukrsNewSelects.childNodes.length; x1++ ) {
        var lf_elBukrsItem = lf_elBukrsNewSelects.childNodes[x1];
        var lf_bukrs = lf_elBukrsItem.getElementsByTagName('BUKRS')[0].childNodes[0].nodeValue;
        var lf_butxt = lf_elBukrsItem.getElementsByTagName('BUTXT')[0].childNodes[0].nodeValue;
        var lf_bukrs_text = lf_bukrs + ' - ' + lf_butxt;
        document.getElementById('pa_bukrs_new').add(new Option(lf_bukrs_text, lf_bukrs));
    }

//--- get massg_select table, and add values to the list of available values
    var lf_elActionSelects = lf_domdata.getElementsByTagName('EX_T_MASSG_SELECT')[0];
    for( var x2 = 0; x2 < lf_elActionSelects.childNodes.length; x2++ ) {
        var lf_elActionItem = lf_elActionSelects.childNodes[x2];
        var lf_massg = lf_elActionItem.getElementsByTagName('MASSG')[0].childNodes[0].nodeValue;
        var lf_mgtxt = lf_elActionItem.getElementsByTagName('MGTXT')[0].childNodes[0].nodeValue;
        var lf_massg_text = lf_massg + ' - ' + lf_mgtxt;
        document.getElementById('pa_massg').add(new Option(lf_massg_text, lf_massg));
    }

//--- retrieve collaboration (new) information ------------------------------------- ---//
    fillScreenField(obj,'EX_F_DATE','pa_date');
    fillScreenField(obj,'EX_F_MASSG','pa_massg');
    fillScreenField(obj,'EX_F_BUKRS_NEW','pa_bukrs_new');
    fillScreenField(obj,'EX_F_WERKS_NEW','pa_werks_new');
    fillScreenField(obj,'EX_F_BTRTL_NEW','pa_btrtl_new');
    fillScreenField(obj,'EX_F_KOSTL_NEW','pa_kostl_new');
    fillScreenField(obj,'EX_F_ORGEH_NEW','pa_orgeh_new');
    fillScreenField(obj,'EX_F_PLANS_NEW','pa_plans_new');
    fillScreenField(obj,'EX_F_SACHP_NEW','pa_sachp_new');
    fillScreenField(obj,'EX_F_STELL_NEW','pa_stell_new');

//--- Operation failed, let's out a generic warning
    if (lf_failed=='X') {
        mini.createDismissibleMessage('Operation failed because:');
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

//--- and we also disable the pernr field and hide the pushbuttons, which
//    pushbuttons, but only, if nothing failed
    if (lf_failed!='X') {
        document.getElementById('pa_pernr').disabled = 'disabled';
//      button_loadPernr.disabled = 'disabled';
        document.getElementById('button_checkPernr').style.visibility = 'hidden';
        document.getElementById('button_regOpen').style.visibility = 'hidden';
    }

//--- if the status of the activity is 5 = Submitted, then
//    we can also hide the check, save and submit buttons.
//    We should also deactivate the collaboration fields
    if (my_status.value=='5') {
        document.getElementById('button_saveAppData').style.visibility = 'hidden';
        document.getElementById('button_checkAppData').style.visibility = 'hidden';
        document.getElementById('button_submitAppData').style.visibility = 'hidden';
        document.getElementById('button_resetAppData').style.visibility = 'hidden';
        document.getElementById('pa_pernr').disabled = 'disabled';
        document.getElementById('pa_date').disabled = 'disabled';
        document.getElementById('pa_massg').disabled = 'disabled';
        document.getElementById('pa_bukrs_new').disabled = 'disabled';
        document.getElementById('pa_werks_new').disabled = 'disabled';
        document.getElementById('pa_btrtl_new').disabled = 'disabled';
        document.getElementById('pa_orgeh_new').disabled = 'disabled';
        document.getElementById('pa_plans_new').disabled = 'disabled';
        document.getElementById('pa_sachp_new').disabled = 'disabled';
        document.getElementById('pa_stell_new').disabled = 'disabled';
        document.getElementById('pa_kostl_new').disabled = 'disabled';
    }

}

//--- ------------------------------------------------------------------------------ ---//
//--- fillScreenField from SOAP-Response                                             ---//
//--- ------------------------------------------------------------------------------ ---//
function fillScreenField(obj,xmlFieldName,screenFieldName) {
    var lf_node = obj.data.getElementsByTagName(xmlFieldName)[0].childNodes[0];
    var lf_typeof = typeof(lf_node);
    if (lf_node==null || lf_typeof=='undefined') {
        document.getElementById(screenFieldName).value = '';
    } else {
        document.getElementById(screenFieldName).value = lf_node.nodeValue;
    }
}

//--- ------------------------------------------------------------------------------ ---//
//--- fillScreenFieldDiv from SOAP-Response                                          ---//
//--- ------------------------------------------------------------------------------ ---//
function fillScreenFieldDiv(obj,xmlFieldName,xmlTextFieldName,screenFieldName) {
    var lf_node = obj.data.getElementsByTagName(xmlFieldName)[0].childNodes[0];
    var lf_typeof = typeof(lf_node);
    if (xmlTextFieldName!='') {
        var lf_node_text = obj.data.getElementsByTagName(xmlTextFieldName)[0].childNodes[0];
        var lf_typeof_text = typeof(lf_node);
        var lf_value = '';
        var lf_text = '';
        if (lf_node==null || lf_typeof=='undefined') {
            lf_value  = '';
        } else {
            lf_value = lf_node.nodeValue;
        }
        if (lf_node_text==null || lf_typeof_text=='undefined') {
            lf_text  = '';
        } else {
            lf_text = lf_node_text.nodeValue;
        }
        var lf_screenElement = document.getElementById(screenFieldName);
        if (lf_screenElement==null || typeof(lf_screenElement)=='undefined' ) {
            // we are not doing anything here :-)
        } else {
            lf_screenElement.innerHTML = lf_value + ' ' + lf_text;
        }
2    } else {
        if (lf_node==null || lf_typeof=='undefined') {
            if (lf_screenElement==null || typeof(lf_screenElement)=='undefined' ) {
                // we are not doing anything here :-)
            } else {
                lf_screenElement.innerHTML = '';
            }
        } else {
            if (lf_screenElement==null || typeof(lf_screenElement)=='undefined' ) {
                // we are not doing anything here :-)
            } else {
                lf_screenElement.innerHTML = lf_node.nodeValue;
            }
        }
    }
}

//--- ------------------------------------------------------------------------------ ---//
//--- pchSave()                                                                      ---//
//--- ------------------------------------------------------------------------------ ---//
function pchSave() {
    //var lf_message = "pchSave() started for pernr " + pa_pernr.value;
    //mini.createDismissibleMessage(lf_message);

//--- we will set the status to "3 = In collaboration", but we will need to
//    pass this value into the backend, so that it can be stored there
    my_status.value = '3';

//--- here we assemble the soapEnvelope for the request
    var lf_urn_beg = '<urn:ZMUR_HCM_PNF_PCH_SAVE>';
    var lf_urn_end = '</urn:ZMUR_HCM_PNF_PCH_SAVE>';
    var lf_soapEnvelope_UUID   = "<IM_F_UUID>" + gf_uuid + "</IM_F_UUID>";
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

//--- assemble soapEnvelope
    var lf_soapEnvelope = gf_soapEnvelope_beg
        + lf_urn_beg
        + lf_soapEnvelope_Btrtl
        + lf_soapEnvelope_Bukrs
        + lf_soapEnvelope_Date
        + lf_soapEnvelope_Kostl
        + lf_soapEnvelope_Massg
        + lf_soapEnvelope_Orgeh
        + lf_soapEnvelope_Plans
        + lf_soapEnvelope_Sachp
        + lf_soapEnvelope_Stell
        + lf_soapEnvelope_UserId
        + lf_soapEnvelope_UUID
        + lf_soapEnvelope_Werks
        + lf_urn_end
        + gf_soapEnvelope_end;

//--- and put the request together
    var lf_params = {};
    lf_params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
    lf_params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.NONE;
    lf_params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
    lf_params[gadgets.io.RequestParameters.HEADERS] = {
        "SOAPAction": "",
        "Content-Type": "text/xml; charset=utf-8"
    };
    lf_params[gadgets.io.RequestParameters.POST_DATA] = lf_soapEnvelope;
    gadgets.io.makeRequest(gf_url, responsePchSave, lf_params);
}

//--- ------------------------------------------------------------------------------ ---//
//--- responsePchSave()                                                              ---//
//--- ------------------------------------------------------------------------------ ---//
function responsePchSave(obj) {
    //mini.createDismissibleMessage("responsePchSave(obj) started...");
    var lf_domdata = obj.data;

//--- at least give some message out
    mini.createDismissibleMessage("Collaboration data has been saved.");

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

//--- retrieve STATUS
    if (typeof(lf_domdata.getElementsByTagName('EX_F_STATUS')[0].childNodes[0])!=='undefined')
    { my_status.value = lf_domdata.getElementsByTagName('EX_F_STATUS')[0].childNodes[0].nodeValue; }

}

//--- ------------------------------------------------------------------------------ ---//
//--- for pchCheck(), we call the backend web-service...                           ---//
//--- ------------------------------------------------------------------------------ ---//
function pchCheck() {

//--- here we assemble the soapEnvelope for the request
    var lf_urn_beg = '<urn:ZMUR_HCM_PNF_PCH_CHECK>';
    var lf_urn_end = '</urn:ZMUR_HCM_PNF_PCH_CHECK>';

//--- get all the values from the input fields and package them into tags
    var lf_soapEnvelope_UUID = "<IM_F_UUID>" + gf_uuid + "</IM_F_UUID>";
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
    lf_soapEnvelope = gf_soapEnvelope_beg
        + lf_urn_beg
        + lf_soapEnvelope_Btrtl
        + lf_soapEnvelope_Bukrs
        + lf_soapEnvelope_Date
        + lf_soapEnvelope_Kostl
        + lf_soapEnvelope_Massg
        + lf_soapEnvelope_Orgeh
        + lf_soapEnvelope_Plans
        + lf_soapEnvelope_Sachp
        + lf_soapEnvelope_Stell
        + lf_soapEnvelope_UserId
        + lf_soapEnvelope_UUID
        + lf_soapEnvelope_Werks
        + lf_urn_end
        + gf_soapEnvelope_end;

    var lf_params = {};
    lf_params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
    lf_params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.NONE;
    lf_params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
    lf_params[gadgets.io.RequestParameters.HEADERS] = {
        "SOAPAction": "",
        "Content-Type":"text/xml; charset=utf-8"
    };
    lf_params[gadgets.io.RequestParameters.POST_DATA] = lf_soapEnvelope;
    gadgets.io.makeRequest(gf_url, responsePchCheck, lf_params);
}

//--- ------------------------------------------------------------------------------ ---//
//--- response for CheckAppData                                                      ---//
//--- ------------------------------------------------------------------------------ ---//
function responsePchCheck(obj) {

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
//--- retrieve STATUS
    if (typeof(lf_domdata.getElementsByTagName('EX_F_STATUS')[0].childNodes[0])!=='undefined')
    { my_status.value = lf_domdata.getElementsByTagName('EX_F_STATUS')[0].childNodes[0].nodeValue; }
}

//--- ------------------------------------------------------------------------------ ---//
//--- for pchSend(), we call the backend web-service...                              ---//
//--- ------------------------------------------------------------------------------ ---//
function pchSend() {

//--- here we assemble the soapEnvelope for the request
    var lf_urn_beg = '<urn:ZMUR_HCM_PNF_PCH_SEND>';
    var lf_urn_end = '</urn:ZMUR_HCM_PNF_PCH_SEND>';

//--- get all the values from the input fields and package them into tags
    var lf_soapEnvelope_UUID = "<IM_F_UUID>" + gf_uuid + "</IM_F_UUID>";
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
    lf_soapEnvelope = gf_soapEnvelope_beg
        + lf_urn_beg
        + lf_soapEnvelope_Btrtl
        + lf_soapEnvelope_Bukrs
        + lf_soapEnvelope_Date
        + lf_soapEnvelope_Event
        + lf_soapEnvelope_Kostl
        + lf_soapEnvelope_Massg
        + lf_soapEnvelope_Orgeh
        + lf_soapEnvelope_Plans
        + lf_soapEnvelope_Sachp
        + lf_soapEnvelope_Stell
        + lf_soapEnvelope_UserId
        + lf_soapEnvelope_UUID
        + lf_soapEnvelope_Werks
        + lf_urn_end
        + gf_soapEnvelope_end;

    var lf_params = {};
    lf_params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
    lf_params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.NONE;
    lf_params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
    lf_params[gadgets.io.RequestParameters.HEADERS] = {
        "SOAPAction": "",
        "Content-Type":"text/xml; charset=utf-8"
    };
    lf_params[gadgets.io.RequestParameters.POST_DATA] = lf_soapEnvelope;
    gadgets.io.makeRequest(gf_url, responsePchSend, lf_params);
}

//--- ------------------------------------------------------------------------------ ---//
//--- response for SubmitAppData                                                     ---//
//--- ------------------------------------------------------------------------------ ---//
function responsePchSend(obj) {

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

//--- retrieve STATUS
    if (typeof(lf_domdata.getElementsByTagName('EX_F_STATUS')[0].childNodes[0])!=='undefined')
    { my_status.value = lf_domdata.getElementsByTagName('EX_F_STATUS')[0].childNodes[0].nodeValue; }
}


//--- ------------------------------------------------------------------------------ ---//
//--- Reset Application Data. This will reset everything...                          ---//
//--- ------------------------------------------------------------------------------ ---//
function resetAppData( ) {
    var lf_answer = confirm("This will reset all appData! Would you like to proceed?");
    if (lf_answer) {
//--- clear all values
        document.getElementById('pa_pernr').value = '';
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

//--- ------------------------------------------------------------------------------ ---//
//--- Alert Status Information                                                       ---//
//--- ------------------------------------------------------------------------------ ---//
function alert_status_info() {
    var lf_message =
        'UUID       = ' + gf_uuid + '\n' +
        'Owner ID   = ' + gf_ownerId + '\n' +
        'Owner Name = ' + gf_ownerName + '\n' +
        'Viewer ID  = ' + gf_userId;
    alert(lf_message);
}

//--- Register our on-view-load handler
gadgets.util.registerOnLoadHandler(init)