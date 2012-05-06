
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


//--- On-view-load initialization
function init() {
    mini = new gadgets.MiniMessage();
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
                    input_uuid.disabled = 'disabled';
                    button_uuid.style.visibility = 'hidden';
                } else {
                    input_uuid.disabled = '';
                    button_uuid.style.visibility = 'visible';
                }
                loadUuid();
            }
        }
    );
}

//--- ------------------------------------------------------------------------------ ---//
//--- Try to load the UUID. If we don't have any, then there is nothing              ---//
//--- to collaboration about                                                         ---//
//--- ------------------------------------------------------------------------------ ---//
function loadUuid() {
    //mini.createDismissibleMessage("loadAppData() started");
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
//--- we don't have a UUID yet, hence ask to register
                    if (!response[p]) {
                        if (gf_ownerId!=gf_userId ) {
                            var lf_message = 'The owner has not entered a UUID yet. ' +
                                'Please contact the owner (' + gf_ownerName + ').';
                            alert (lf_message);
                            div_display_id.innerHTML = 'UUID not available';
                        } else {
                            var lf_message = 'The UUID has not been entered yet. ';
                            alert (lf_message);
                        }
                    }
//--- response is fine let's read UUID
                    if (typeof(response[p].pch_uuid)!=='undefined') {
                        gf_uuid = response[p].pch_uuid;
                        div_display_id.innerHTML = 'UUID: ' + gf_uuid;
                    } else {
//--- we don't have a UUID yet, hence ask to register
                        if (gf_ownerId!=gf_userId ) {
                            var lf_message = 'The owner has not entered a UUID yet. ' +
                                'Please contact the owner (' + gf_ownerName + ').';
                            alert (lf_message);
                            div_display_id.innerHTML = 'UUID not available';
                        } else {
                            var lf_message = 'The UUID has not been entered yet. ';
                            alert (lf_message);
                        }
                    }

                }
                if (lf_no_p_in_response==0) {
                    if (gf_ownerId!=gf_userId ) {
                        var lf_message = 'The owner has not entered a UUID yet. ' +
                            'Please contact the owner (' + gf_ownerName + ').';
                        alert (lf_message);
                        div_display_id.innerHTML = 'UUID not available';
                    } else {
                        var lf_message = 'The UUID has not been entered yet. ';
                        alert (lf_message);
                    }
                }
            }
        }
    );
}

//--- ------------------------------------------------------------------------------ ---//
//--- updateUUIDinAppData()                                                          ---//
//--- ------------------------------------------------------------------------------ ---//
function updateUUIDinAppData() {

    gf_uuid = input_uuid.value;

    osapi.appdata.update({
        userId:  "@viewer",
        groupId: "@friends",
        data: { pch_uuid: gf_uuid }
    }).execute(
        function(responseUpdateUUID) {
            if (responseUpdateUUID.error) {
                mini.createDismissibleMessage(responseUpdateUUID.error.message);
            } else {
//--- out success message
                var lf_message = 'UUID successfully registered and saved. ' +
                                 'UUID = ' + gf_uuid;
                mini.createDismissibleMessage(lf_message);
            }
        }
    );

}

//--- Register our on-view-load handler
gadgets.util.registerOnLoadHandler(init);