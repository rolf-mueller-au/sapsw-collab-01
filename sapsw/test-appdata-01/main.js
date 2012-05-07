
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
                    div_input_id.style.visibility = 'hidden';
                } else {
                    div_input_id.style.visibility = 'visible';
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
    var lf_message = '';
    //mini.createDismissibleMessage("loadAppData() started");
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
                        if (gf_ownerId!=gf_userId ) {
                            lf_message = 'The owner has not entered a UUID yet. ' +
                                'Please contact the owner (' + gf_ownerName + ').';
                            alert (lf_message);
                            div_display_id.innerHTML = 'UUID not available';
                        } else {
                            lf_message = 'The UUID has not been entered yet. ';
                            alert (lf_message);
                        }
                    }
//--- response is fine let's read UUID
                    if (typeof(response[p].foo)!=='undefined') {
                        gf_uuid = response[p].foo;
                        div_display_id.innerHTML = 'UUID: ' + gf_uuid;
                    } else {
//--- we don't have a UUID yet, hence ask to register
                        if (gf_ownerId!=gf_userId ) {
                            lf_message = 'The owner has not entered a UUID yet. ' +
                                'Please contact the owner (' + gf_ownerName + ').';
                            alert (lf_message);
                            div_display_id.innerHTML = 'UUID not available';
                        } else {
                            lf_message = 'The UUID has not been entered yet. ';
                            alert (lf_message);
                        }
                    }

                }
                if (lf_no_p_in_response==0) {
                    if (gf_ownerId!=gf_userId ) {
                        lf_message = 'The owner has not entered a UUID yet. ' +
                            'Please contact the owner (' + gf_ownerName + ').';
                        alert (lf_message);
                        div_display_id.innerHTML = 'UUID not available';
                    } else {
                        lf_message = 'The UUID has not been entered yet. ';
                        alert (lf_message);
                    }
                }
            }
        }
    );
}
//--- ------------------------------------------------------------------------------ ---//
//--- appdata_update()                                                               ---//
//--- ------------------------------------------------------------------------------ ---//
var appdata_update = function (){
    var input = document.getElementById('input_uuid').value;
    osapi.appdata.update({userId: '@viewer', groupId: '@self', data: {foo: input}}).execute(function (userData) {
        if (userData.error){
            alert(userData.error.message)
        }
        else{
            alert('The data has been updated: ' + input);
        }
    });
};

//--- Register our on-view-load handler
gadgets.util.registerOnLoadHandler(init);