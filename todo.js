/*
TODO
    convert building params to building_id params

    get cmd point count
    open keep, select idle SS
        determine SS specialty
        determine adventure to go on (pre-set?)
        send on adventure

    notice <5m timer, perform free speedup

    get volume quest list
    check if not started
        SS dialog?
    check if in progress
        check time <5m? and speedup
    check if finished
        closing dialog

<iframe srcdoc="<html><body><div class='row'><div class='col-md-offset-1 col-md-1'><span>ohai wurld</span></div></div></body></html>"></iframe>
$('body').prepend("<div class='row'><div class='col-md-offset-1 col-md-1'><span>ohai wurld</span></div></div>");
$('body').prepend('<iframe srcdoc="<html><body><div><span>ohai wurld</span></div></div></body></html>"></iframe>');
 //*/



change strategy for stuff
    instead of 'every 30 seconds, take a task off'
    do 'every ~20 seconds, check state funcs to add to queue, finish queue, then wait ~20s to rerun'
for b in buildings
    if speedable, speed
    if done, finish
    if startable, start




/* unibar for quests
userContext.actionList
toggleVolumeSelector()
refreshLocalChapterData() // not useful atm, specific to chapter
volumeTabClick(b) // // b is index o chapter: chap1 is index 1, etc; prologue, and 2 family screw up indexes
    userContext.bossInviteMode - bool
    switchVolume(b+1,userContext.chapterData.all_volumes[b][0].num_chapters_completed+1,!1,!0)
        volume, completed_chapters, false, true

    userContext.chapterData.all_volumes[0][0].num_chapters_completed+1
setCurrentQuestActionItems
renderQuestVolumesHUD
renderActionItems
    setCurrentQuestActionItems(b, a)
        b=userContext.playerData.quests
        a=userContext.chapterData.volume
// V1,2,3
for N=1-3
    volumeTabClick(N)
    // quests are in userContext.actions
    return userContext.actions

var get_volume_quests_fn = _.map([1,2,3], function(volume) {
    volumeTabClick(volume);
    console.info(volume, userContext.actions.length);
    return accum.concat(userContext.actions);
});


var active_quests = _.reduce([1,2,3], function(accum, volume) {
    volumeTabClick(volume);
    console.info(volume, userContext.actions.length);
    return accum.concat(userContext.actions);
}, []);


// may have a dupe quest that carries across volumes
// de-dupe on quest.id



playerData.quests
//*/

// inspiration/ripping from https://greasyfork.org/en/scripts/3788-gota-extender/code

// Observers construction
var _menuBtn = '<a id="extender-menu" class="navlink" data-menu="manager">' +
    '<span class="navlinkbox">' +
    '<span class="navlinkicon"></span>' +
    '<span class="vertcenter">' +
    '<span>Extender</span>' +
    '</span>' +
    '</span>' +
    '</a>';
var mainToolbarObserver = new MutationObserver(main_toolbar_buttons_changed);
// define what element should be observed by the observer
// and what types of mutations trigger the callback
mainToolbarObserver.observe(document.getElementById("main_toolbar_buttons"), {
    attributes: true,
    subtree: true,
    attributeOldValue: true
});
function main_toolbar_buttons_changed() {
    var menu = $("#extender-menu");
    var container = $("#navmenubox");
    if (container.length > 0 && menu.length == 0) {
        container.append(_menuBtn);
    }
}
// <-- End of mutations observer
// hide locked buildings?
var hideLockedBuildings = true;
$("div#page-wrap").on('click', 'a#navlink-buildings', function(){
    console.info("Navigated to buildings sub-menu.");
    if(hideLockedBuildings){
        $(".locked").hide();
    } else {
        $(".locked:hidden").show();
    }
});
// end hide locked buildings


//start clone buildingmenu
var misc_menu_html = '<div id="custom_menu_box" style="display:block">'+
'<div class="custommenucrop scrollable" id="custom_scrollable">'+
'<div class="items" id="custom_items">'+'<div>some item</div>'+
'</div>'+
'</div>'+
'</div>';
$('#buildingmenu').append(misc_menu_html);

function clickSelectManager(){
$("#main_toolbar_buttons").hide();
$("#buildingmenubox_friends").hide();
$("#buildingmenu").show();
$("#custommenubox").show();
}
// end clone buildingmenu

function getSwornSwords() {
    try {
        return _.reduce(playerInventory, function(accum, item) {
            if(item.slot === "Sworn Sword") accum.push(item);
            return accum;
        }, []);
    } catch(err) {
        console.error('Sworn swords retrieval failed: ' + err);
    }
}

// start uniquest modal playing
function _getQuestActionMarkup(actions) {
    var b = actions;
    var a = _.template("<%_.each(data, function(action, n) {
        \tvar btnClass = '';
        \tvar btnDisplay = 'block';
        \tvar btnQuestClass = 'btnedge' + ( (action.viewed != 1) ? ' goldedge' : '');
        \tvar arrBtnStates = ['green', 'gold', 'brown'];
        \tvar intCurrentState = 0;
        \tvar strBtnIconState = '';
        \tif(action.label == 'nextquest')\t\tbtnClass = 'newquestpending';
        \telse\t\tbtnClass = 'btnwrap btnlg';
        \tif(action.complete)\t\tintCurrentState = 1;
        \telse if(action.viewed == 1)\t\tintCurrentState = 2;
        \tif(action.viewed != 1)\t\tstrBtnIconState = ' new';
        \telse if(action.complete)\t\tstrBtnIconState = ' done';
        %>\t<div>\t<span id=\"<%= action.symbol %>\" class=\"<%= btnClass %> quest_action\">\t<span id=\"actionedge_<%= action.id %>\" class=\"<%= btnQuestClass %>\">\t<a id=\"actionbtn_<%= action.id %>\" class=\"btn<%= arrBtnStates[intCurrentState] %> activate_quest\">\t<span class=\"vertcenter\"><span>\t<%= subGotStrings(action.label) %><%\tif(n==0)\toffset=-55;
        \telse\toffset=-50;
        %>\t<div id=\"tip_action_<%= n %>\" class=\"tipbox tip_low arrow_left tipbox_200\" style=\"left: 205px;
         top: <%= offset %>px;
         display: none\">\t</div><%\tif(action.seconds_remaining > 0)\t{
        %>\t\t<em id=\"action_timer_<%= n %>\"><%= renderTimeTrunc(action.seconds_remaining, 25) %></em></span></span><%\t\tif(userContext.actionTimer[n])\t\t\tclearTimeout(userContext.actionTimer[n]);
        \t\tuserContext.actionTimer[n] = setTimeout('updateActionTimer(' + n + ')', 1000);
        \t}
        \telse if(action.complete==true)\t{
        %>\t\t<em id=\"action_timer_<%= n %>\"><%= translateString('finished') %></em></span></span><%\t}
        %>\t</a></span></span>\t</div><%}
        );
        %>",
        {data:b});
    ,$("#action_list_items").html(a)
    ,a=$("a[id^=actionbtn].activate_quest")
    ,$.each(a,function(a,b){
        $(b).click(function(b){
            userContext.actionList[a].callback(a);
            b.preventDefault()
        });
        $(b).mouseleave(function(b){noTip("tip_action_"+a)});
        $(b).mouseover(function(){
            "1"!=userContext.playerData.stat.onboarding_ftue&&doTip("tip_action_"+a,function(){
            return actionToolTip(a)}
        )}
    )})
    ,3>=b.length&&$("#actionmenudown").addClass("inactive");
};
///////////
var quest_modal_template = '<div id="modalwrap" class="questmodal questscreen1" style="display:block;">'+
    '<div class="contentframe1">'+
    '<div class="contentframe2">'+
    '<div class="infobar">'+
    '<div class="infobarpattern"></div>'+
    '<h2><%= title %></h2>'+
    '<span class="cornerknot" id="leftknot"></span>'+
    '<span class="cornerknot" id="rightknot"></span>'+
    '<a class="closebtn" onclick="return questClose();">close_</a>'+
    '<div class="questiconcircle">'+
    '<span class="questicon"><img src="http://disruptorbeamcdn-01.insnw.net/images/icons/questicon-incoming.png?t=46f4f3cc93d3"></span></div>'+
    '</div>'+
    '<span class="barbtmedge"></span>'+
    '<div id="vsbtminfo">'+
    '<!-- winning version -->'+
    '<div class="challengerewards" style="display: block; top: 30px;">'+
    '<span id="pvptogglebtn-details" class="btnwrap btnmed" onclick="return 0;">'+
    '<span class="btnedge">'+
    '<a class="btngold">Challenge<br>Details</a>'+
    '</span>'+
    '</span>'+
    '<span id="closebtn" class="btnwrap btnmed" onclick="return questClose();">'+
    '<span class="btnedge">'+
    '<a class="btngold">Close</a>'+
    '</span>'+
    '</span>'+
    '</div>'+
    '<div id="btmcenter"></div>'+
    '<div class="contentbtm"></div>'+
    '</div>'+
    '</div>'+
    '</div>'+
    '</div>';
function _custom_quest_close() {
    $("#questmodals_bg").hide(); $("#questmodals").html("");
}
function _custom_quest_open(title, markup) {
    var my_modal_data = {title: title };
    var my_modal = _.template(quest_modal_template, data=my_modal_data);
    $("#questmodals").html(my_modal);
    $('#vsbtminfo').html(markup);
    $("#questmodals_bg").show()
}
var quest_action_template = "<%_.each(data, function(action, n) {"+
"\tvar btnClass = '';"+
"\tvar btnDisplay = 'block';"+
"\tvar btnQuestClass = '' + ( (action.viewed != 1) ? ' goldedge' : '');"+
"\tvar arrBtnStates = ['green', 'gold', 'brown'];"+
"\tvar intCurrentState = 0;"+
"\tvar strBtnIconState = '';"+
"\tif(action.label == 'nextquest')\t\tbtnClass = 'newquestpending';"+
"\telse\t\tbtnClass = 'btnwrap btnlg';"+
"\tif(action.complete)\t\tintCurrentState = 1;"+
"\telse if(action.viewed == 1)\t\tintCurrentState = 2;"+
"\tif(action.viewed != 1)\t\tstrBtnIconState = ' new';"+
"\telse if(action.complete)\t\tstrBtnIconState = ' done';"+
"%>\t<span>\t<span id=\"<%= action.symbol %>\" class=\"<%= btnClass %> quest_action\">\t<span id=\"actionedge_<%= action.id %>\" class=\"<%= btnQuestClass %>\">\t<a id=\"actionbtn_<%= action.id %>\" class=\"btn<%= arrBtnStates[intCurrentState] %> activate_quest\">\t<span class=\"vertcenter\"><span>\t<%= subGotStrings(action.label) %><%\tif(n==0)\toffset=-55;"+
"\telse\toffset=-50;"+
"%>\t<div id=\"tip_action_<%= n %>\" class=\"tipbox tip_low arrow_left tipbox_200\" style=\"left: 205px;"+
"top: <%= offset %>px;"+
"display: none\">\t</div><%\tif(action.seconds_remaining > 0)\t{"+
"%>\t\t<em id=\"action_timer_<%= n %>\"><%= renderTimeTrunc(action.seconds_remaining, 25) %></em></span></span><%\t\tif(userContext.actionTimer[n])\t\t\tclearTimeout(userContext.actionTimer[n]);"+
"\t\tuserContext.actionTimer[n] = setTimeout('updateActionTimer(' + n + ')', 1000);"+
"\t}"+
"\telse if(action.complete==true)\t{"+
"%>\t\t<em id=\"action_timer_<%= n %>\"><%= translateString('finished') %></em></span></span><%\t}"+
"%>\t</a></span></span>\t</span><%}"+
");"+
"%>";

function _getQuestActionMarkup(actions) {
    return _.template(quest_action_template, {data:actions});
}
var markup = _getQuestActionMarkup(_getCurrentQuestActionItems()); _custom_quest_open('testing...', markup);