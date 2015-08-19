$('a#navlink-buildings').click();
var building_ids = {
    village: {
        jid: '#bc_920',
        name: 'village_center',
        // 9: grains, 3: fish, 0:stone, 4:fur
        production: 4,
        index: 3
    },
    counting: {
        jid: '#bc_6',
        name: 'counting_house',
        index: 0,
    },
    keep: {
        jid: 'bc_619',
        name: 'keep',
        index: 1,
    },
    sept: {
        jid: '#bc_52',
        name: 'sept',
        production: 0,
        index: 6,
    },
    godswood: {
        jid: '#bc_60',
        name: 'godswood',
        production: 0,
        index: 7,
    },
    feast: {
        jid: '#bc_325',
        name: 'feast',
        production: 0,
        index:19
    },
    glasshouse: {
        name: 'glasshouse',
        production: 0,
        index: 15,
    },
    fishery: {
        name: 'fishery',
        production: 0,
        index: 16,
    }
};

function wrap_next(fn, next) {
    fn();
    next();
}
// wrapper function to set a delay
function wait_a_bit(delay_ms, next) {
    // if(auto_debug) {console.debug('setting timeout',delay_ms,'for',next)};
    setTimeout(next, delay_ms);
}
var wait_fn = _.partial(wait_a_bit, 2000);
// take a left-to-right seq of functions, wrap them with setTimeout, and chain them into next()
function chain_with_delays(fn_array, delay_fn, next) {
    var begin = _.reduceRight(fn_array, function(accum, cur) {
        var wrap_wait = _.partial(delay_fn, accum);
        return _.partial(cur, wrap_wait);
    }, next);
    return begin;
}
function click_building_upgrade_panel(building_id, next) {
    var building = userContext.buildingsData[building_id];
    clickBuildingUpgradePanel(building.symbol);
    next();
}
function do_finish_production(building_id, next) {
    var building = userContext.buildingsData[building_id];
    doFinishProduction(building.item_id.toString());
    next();
}
function close_modal_large(next) {
    closeModalLarge('modal_dialogs_top');
    next();
}
function click_production_tab(next) {
    buildingTabProd();
    next();
}
function click_production_tab_item(item_index, next) {
    productionItem(item_index);
    next();
}
function click_production_tab_item_start(next) {
    var to_click = $("span.btnwrap.btnmed.equipbtn");
    if(to_click.length === 2) to_click[1].click();
    else to_click.click();
    next();
}
function click_collect_counthouse(building_id, next) {
    var building = userContext.buildingsData[building_id];
    doCollect(building.item_id.toString());
    next();
}
function donezo() {if(auto_debug) {console.debug('donezo')};task_running=false;}
function check_popups(next) {
    if(auto_debug) {console.debug('checking popups')};
    if($('#levelmodal').length > 0) closeInterstitial();
    next();
}

// DONE
function handle_done_item_production(building_id, next) {
    var building = userContext.buildingsData[building_id];
    // was producing something, but no more build time left means we're Done
    if(building.hasOwnProperty('producing_archetype_id') && !building.hasOwnProperty('build_remaining')) {
        if(auto_debug) {console.debug('finishing building',building.name)};

        var click_building = _.partial(click_building_upgrade_panel, building_id);
        var finish_production = _.partial(do_finish_production, building_id);
        var close_modal = _.partial(close_modal_large);
        var chained = [check_popups, click_building, finish_production, close_modal, check_popups];
        var execute = chain_with_delays(chained, wait_fn, next);
        execute();
    } else {
        if(auto_debug) {console.debug('skipping finish, building',building.name,'is not done')};
        next();
    }
}

//IDLE
function start_item_production(building_id, item_index, next) {
    var building = userContext.buildingsData[building_id];
    // currently producing something, not idle
    if(building.hasOwnProperty('producing_archetype_id')) {
        if(auto_debug) {console.debug('skipping start, building',building.name,'is not idle')};
        next();
    } else {
        if(auto_debug) {console.debug('starting building',building.name)};

        var click_building = _.partial(click_building_upgrade_panel, building_id);
        var click_prod_tab = _.partial(click_production_tab);
        var click_prod_tab_item = _.partial(click_production_tab_item, item_index);
        var click_prod_tab_item_start = _.partial(click_production_tab_item_start);
        var close_modal = _.partial(close_modal_large);

        var chained = [check_popups, click_building, click_prod_tab, click_prod_tab_item, click_prod_tab_item_start, close_modal, check_popups];
        var execute = chain_with_delays(chained, wait_fn, next);
        execute();
    }
}

//COUNTHOUSE
function collect_counthouse(building_id, next) {
    var building = userContext.buildingsData[building_id];
    if(auto_debug) {console.debug('handling counthouse@',building.name)};

    var click_building = _.partial(click_building_upgrade_panel, building_id);
    var collect = _.partial(click_collect_counthouse, building_ids.counting.index);
    var close_modal = _.partial(close_modal_large);
    var chained = [check_popups, click_building, collect, close_modal, check_popups];
    var execute = chain_with_delays(chained, _.partial(wait_a_bit, 2000), next);
    execute();
}

//ADVENTUREPARTY
function do_adventure_party(next) {
    if(auto_debug) {console.debug('going on an adventure party')};

    var open_keep = _.partial(clickBuildingUpgradePanel, 'keep');
    var party_tab = ssAdventureParty;
    var mark_viewed = _.partial(adventureMarkAllAsViewed, false);
    var send_party = _.partial(adventurePartySend, false);
    var close_modal = _.partial(close_modal_large);
    var chained = [open_keep, party_tab, mark_viewed, send_party];
    chained = _.map(chained, function(fn) {
        return _.partial(wrap_next, fn);
    });
    chained = [check_popups].concat(chained).concat([close_modal, check_popups]);
    var execute = chain_with_delays(chained, _.partial(wait_a_bit, 5000), next);
    execute();
}
/*
$('#levelmodal')
closeInterstitial();
//*/

function main_loop() {
    if(to_run.length === 0 || user_interaction || task_running) {
        if(auto_debug) {console.debug('main loop skipping...')};
    } else {
        // pull a job, then schedule another loop shortly
        var next = to_run.pop();
        if(auto_debug) {console.debug('main loop running',next)};
        next();
    }
    setTimeout(main_loop, 20 * 1000); // 20 seconds
}
function post_loop(fn, delay_ms) {
    if(auto_debug) {console.debug('post-loop handler called, scheduling', fn)};
    setTimeout(fn, delay_ms);
    task_running=false;
    //main_loop();
}

function counthouse() {
    task_running = true;
    var next_loop = _.partial(post_loop, schedule_counthouse, 1000 * 60 * 60 * 3); // 3 hours
    collect_counthouse(building_ids.counting.index, next_loop);
}
function schedule_counthouse() {
    if(auto_debug) {console.debug('adding counthouse to queue')};
    to_run.push(counthouse);
}

function adventure_party() {
    task_running = true;
    var next_loop = _.partial(post_loop, schedule_adventure_party, 1000 * 60 * 3);
    do_adventure_party(next_loop);
}
function schedule_adventure_party() {
    if(auto_debug) {console.debug('adding adventure party to queue')};
    to_run.push(adventure_party);
}


// these still need checks on whether something is actually idle/done
function check_godswood() {
    task_running = true;
    var next_loop = _.partial(post_loop, schedule_check_godswood, 1000 * 60 * 2);
    var start_item = _.partial(start_item_production, building_ids.godswood.index, 0, next_loop);
    handle_done_item_production(building_ids.godswood.index, start_item);
}
function schedule_check_godswood() {
    if(auto_debug) {console.debug('adding godswood to queue')};
    to_run.push(check_godswood);
}

function check_feast() {
    task_running = true;
    var next_loop = _.partial(post_loop, schedule_check_feast, 1000 * 60 * 2);
    var start_item = _.partial(start_item_production, building_ids.feast.index, 0, next_loop);
    handle_done_item_production(building_ids.feast.index, start_item);
}
function schedule_check_feast() {
    if(auto_debug) {console.debug('adding feast to queue')};
    to_run.push(check_feast);
}

function check_glasshouse() {
    task_running = true;
    var next_loop = _.partial(post_loop, schedule_check_glasshouse, 1000 * 60 * 2);
    var start_item = _.partial(start_item_production, building_ids.glasshouse.index, 0, next_loop);
    handle_done_item_production(building_ids.glasshouse.index, start_item);
}
function schedule_check_glasshouse() {
    if(auto_debug) {console.debug('adding glasshouse to queue')};
    to_run.push(check_glasshouse);
}

function check_sept() {
    task_running = true;
    var next_loop = _.partial(post_loop, schedule_check_sept, 1000 * 60 * 2);
    var start_item = _.partial(start_item_production, building_ids.sept.index, 0, next_loop);
    handle_done_item_production(building_ids.sept.index, start_item);
}
function schedule_check_sept() {
    if(auto_debug) {console.debug('adding sept to queue')};
    to_run.push(check_sept);
}

function check_village() {
    task_running = true;
    var next_loop = _.partial(post_loop, schedule_check_village, 1000 * 60 * 2);
    var start_item = _.partial(start_item_production, building_ids.village.index, building_ids.village.production, next_loop);  // grain
    handle_done_item_production(building_ids.village.index, start_item);
}
function schedule_check_village() {
    if(auto_debug) {console.debug('adding village to queue')};
    to_run.push(check_village);
}

function check_fishery() {
    task_running = true;
    var next_loop = _.partial(post_loop, schedule_check_fishery, 1000 * 60 * 2);
    var start_item = _.partial(start_item_production, building_ids.fishery.index, building_ids.fishery.production, next_loop);
    handle_done_item_production(building_ids.fishery.index, start_item);
}
function schedule_check_fishery() {
    if(auto_debug) {console.debug('adding fishery to queue')};
    to_run.push(check_fishery);
}

// flag to let user play
var user_interaction = false;
// do'nt start new tasks when one is running
// this doesn't have an escape for error conditions & will deadlock
// set to true on task start, false on donezo()
var task_running = false;
var auto_debug = true;
//var to_run = [counthouse, adventure_party, check_village, check_feast, check_sept, check_glasshouse, check_godswood];
var to_run = [counthouse, check_village, check_feast, check_glasshouse, check_fishery];
main_loop();
