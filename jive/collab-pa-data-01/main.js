
//--- Declarations

//--- Factory for mini messages
var mini;

//--- Currently logged in user
var user;


//--- On-view-load initialization
function init() {
    registerHandlers();
    loadUser();
    mini = new gadgets.MiniMessage();
}


//--- Register UI event handlers
function registerHandlers() {
    console.log("registerHandlers() started");

}

//--- Load the currently logged in user
function loadUser() {
    console.log("loadUser() started");
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

//--- Register our on-view-load handler
gadgets.util.registerOnLoadHandler(init);