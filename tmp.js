$('a#navlink-buildings').click();
var building_ids = {
    village: {
        jid: '#bc_920',
        name: 'village_center',
        // 9: grains, 3: fish, 
        production: 9,
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
    }
};

function wrap_next(fn, next) {
    fn();
    next();
}
// wrapper function to set a delay
function wait_a_bit(delay_ms, next) {
    console.info('setting timeout',delay_ms,'for',next);
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
};
function click_building_upgrade_panel(building, next) {
    clickBuildingUpgradePanel(building.image);
    next();
}
function do_finish_production(building, next) {
    doFinishProduction(building.item_id.toString());
    next();
}
function close_modal_large(modal_name, next) {
    closeModalLarge(modal_name);
    next();
}
function click_production_tab(building, next) {
    buildingTabProd();
    next();
}
function click_production_tab_item(item_index, next) {
    productionItem(item_index);
    next();
}
function click_production_tab_item_start(building, next) {
    var to_click = $("span.btnwrap.btnmed.equipbtn");
    if(to_click.length === 2) to_click[1].click();
    else to_click.click();
    next();
}
function click_collect_counthouse(building, next) {
    doCollect(building.item_id.toString());
    next();
}
function donezo() {console.info('done');task_running=false;}
function check_popups(next) {
    if($('#levelmodal').length > 0) closeInterstitial();
    next();
}

// DONE
function handle_done_item_production(building, next) {
    // was producing something, but no more build time left means we're Done
    if(building.hasOwnProperty('producing_archetype_id') && !building.hasOwnProperty('build_remaining')) {
        var click_building = _.partial(click_building_upgrade_panel, building);
        var finish_production = _.partial(do_finish_production, building);
        var close_modal = _.partial(close_modal_large, 'modal_dialogs_top');
        var chained = [check_popups, click_building, finish_production, close_modal, check_popups];
        var execute = chain_with_delays(chained, wait_fn, next);
        execute();
    } else next();
}

//IDLE
function start_item_production(building, item_index, next) {
    // currently producing something, not idle
    if(building.hasOwnProperty('producing_archetype_id')) {
        next();
    } else {
        var click_building = _.partial(click_building_upgrade_panel, building);
        var click_prod_tab = _.partial(click_production_tab, building);
        var click_prod_tab_item = _.partial(click_production_tab_item, item_index);
        var click_prod_tab_item_start = _.partial(click_production_tab_item_start, building);
        var close_modal = _.partial(close_modal_large, 'modal_dialogs_top');

        var chained = [check_popups, click_building, click_prod_tab, click_prod_tab_item, click_prod_tab_item_start, close_modal, check_popups];
        var execute = chain_with_delays(chained, wait_fn, next);
        execute();
    }
}

//COUNTHOUSE
function collect_counthouse(building, next) {
    var click_building = _.partial(click_building_upgrade_panel, building);
    var collect = _.partial(click_collect_counthouse, userContext.buildingsData[0]);
    var close_modal = _.partial(closeModalLarge, 'modal_dialogs_top');
    var chained = [check_popups, click_building, collect, close_modal, check_popups];
    var execute = chain_with_delays(chained, _.partial(wait_a_bit, 2000), next);
    execute();
}

//ADVENTUREPARTY
function do_adventure_party(next) {
    var open_keep = _.partial(clickBuildingUpgradePanel, 'keep');
    var party_tab = ssAdventureParty;
    var mark_viewed = _.partial(adventureMarkAllAsViewed, false);
    var send_party = _.partial(adventurePartySend, false);
    var close_modal = _.partial(closeModalLarge, 'modal_dialogs_top');
    var chained = [open_keep, party_tab, mark_viewed, send_party, close_modal];
    chained = _.map(chained, function(fn) {
        return _.partial(wrap_next, fn);
    });
    chained = [check_popups].concat(chained).concat([check_popups]);
    var execute = chain_with_delays(chained, _.partial(wait_a_bit, 5000), next);
    execute();
}
/*
$('#levelmodal')
closeInterstitial();
//*/

function main_loop() {
    if(to_run.length === 0 || user_interaction || task_running) {
        // sleep for 30s
        setTimeout(main_loop, 30 * 1000); // 30 seconds
    } else {
        // pull a job, then schedule another loop shortly
        var next = to_run.pop();
        console.info('running', next);
        next();
        //setTimeout(main_loop, 1000); // 1 second
    }
};
function post_loop(function, delay_ms) {
    setTimeout(function, delay_ms);
    task_running=false;
    main_loop();
}

function counthouse() {
    task_running = true;
    var next_loop = _.partial(post_loop, schedule_counthouse, 1000 * 60 * 60 * 3); // 3 hours
    collect_counthouse(userContext.buildingsData[building_ids.counting.index], next_loop);
}
function schedule_counthouse() {
    to_run.push(counthouse);
}

function adventure_party() {
    task_running = true;
    var next_loop = _.partial(post_loop, schedule_adventure_party, 1000 * 60 * 20); // 20 minutes
    do_adventure_party(next_loop);
}
function schedule_adventure_party() {
    to_run.push(adventure_party);
}


// these still need checks on whether something is actually idle/done
function check_godswood() {
    task_running = true;
    var next_loop = _.partial(post_loop, schedule_check_godswood, 1000 * 60 * 62); // 62 minutes
    var start_item = _.partial(start_item_production, userContext.buildingsData[building_ids.godswood.index], 0, next_loop);
    handle_done_item_production(userContext.buildingsData[building_ids.godswood.index], start_item);
}
function schedule_check_godswood() {
    to_run.push(check_godswood);
}

function check_feast() {
    task_running = true;
    var next_loop = _.partial(post_loop, schedule_check_feast, 1000 * 60 * 15); // 15 minutes
    var start_item = _.partial(start_item_production, userContext.buildingsData[building_ids.feast.index], 0, next_loop);
    handle_done_item_production(userContext.buildingsData[building_ids.feast.index], start_item);
}
function schedule_check_feast() {
    to_run.push(check_feast);
}

function check_sept() {
    task_running = true;
    var next_loop = _.partial(post_loop, schedule_check_sept, 1000 * 60 * 62); // 62 minutes
    var start_item = _.partial(start_item_production, userContext.buildingsData[building_ids.sept.index], 0, next_loop);
    handle_done_item_production(userContext.buildingsData[building_ids.sept.index], start_item);
}
function schedule_check_sept() {
    to_run.push(check_sept);
}

function check_village() {
    task_running = true;
    var next_loop = _.partial(post_loop, schedule_check_sept, 1000 * 60 * 80); // 80 minutes
    var start_item = _.partial(start_item_production, userContext.buildingsData[building_ids.village.index], 9, next_loop);  // grain
    handle_done_item_production(userContext.buildingsData[building_ids.village.index], start_item);
}
function schedule_check_village() {
    to_run.push(check_village);
}

// flag to let user play
var user_interaction = false;
// do'nt start new tasks when one is running
// this doesn't have an escape for error conditions & will deadlock
// set to true on task start, false on donezo()
var task_running = false;
var to_run = [counthouse, adventure_party, check_village, check_feast, check_sept, check_godswood];
main_loop();
