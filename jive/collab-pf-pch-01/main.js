
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

//--- Register our on-view-load handler
gadgets.util.registerOnLoadHandler(init);