console.info('loading gota automation');
var s = document.createElement('script');
s.src = chrome.extension.getURL('tmp.js');
s.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head||document.documentElement).appendChild(s);


function appendFile(path, id, element_name) {
    var req = new XMLHttpRequest();
    req.open("GET", chrome.extension.getURL(path), true);
    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            var el = document.createElement(element_name);
            el.id = id;
            el.innerHTML = req.responseText;
            document.body.appendChild(el);
        }
    };
    req.send(null);
}
appendFile('test_modal.html', 'test_modal', 'script');
//*
//
//$(".multifriend").html(markup).show();
$('#modals_container_high')
//$("#modalbg").show();


var my_modal_template = '<div id="modalwrap" class="mediummodal multifriend" style="display:none;top:100px;">'+
'<div class="contentframe1"style="z-index:22;">'+
'<div class="contentframe2">'+
'<div class="contentframe3">'+
'<div class="contentframe4">'+
'<div class="stonecurve" id="stonecurve-l"><span></span></div>'+
'<div class="stonecurve" id="stonecurve-r"><span></span></div>'+
'<div class="infobar">'+
'<div class="infobarpattern"></div>'+
'<h2><%= (data.heading == undefined ? \'HUEHUE\' : data.heading) %></h2>'+
'<span class="barbtmedge"></span>'+
'<span class="corner tl"></span>'+
'<span class="corner tr"></span>'+
'<a class="closebtn" onclick="$(\'.mediummodal\').hide();$(\'.modalbg\').hide();"><%= translateString(\'close\')  %></a>'+
'</div>'+
'<div id="chartabmenu"><div class="marbletopbox"><p><strong>misc content here</strong></p></div></div>'+
'<div class="alertbtm"></div>'+
'</div></div></div></div></div>';
//var my_modal_base_template = '<div id="modalwrap" class="mediummodal" style="display:none;top:100px;"></div>';
var my_modal_data = {};
var my_modal = _.template(my_modal_template, data=my_modal_data);
$('#modals_container_high').append(my_modal);
$(".multifriend").show();
$(".modalbg").show();

//*/


$(".questmodal").hide().remove();
$("#questmodals").html("");
//$("#quest_sub_modals").hide().remove();
//$(".eventmodal").hide().remove();
$("#modalbg").hide();
$("#questmodals_bg").hide();
$("#modalbg_dark").hide();

vsbtminfo

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
    $("#questmodals_bg").hide();
    $("#questmodals").html("");
}
function _custom_quest_open(title) {
    var my_modal_data = {
        title: title
    };
    var my_modal = _.template(quest_modal_template, data=my_modal_data);
    $("#questmodals").html(my_modal);
    $("#questmodals_bg").show()
}

$(".questmodal").hide().remove();
$("#questmodals").html("");
//$("#quest_sub_modals").hide().remove();
//$(".eventmodal").hide().remove();
$("#modalbg").hide();
$("#questmodals_bg").hide();
$("#modalbg_dark").hide();

