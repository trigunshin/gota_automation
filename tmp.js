$('a#navlink-buildings').click();
var building_ids = {
    village: {
        name: 'village_center',
        // 9: grains, 3: fish, 0:stone, 4:fur
        production: 4,
        index: 3
    },
    market: {
        name: 'market',
        // 9: grains, 3: fish, 0:stone, 4:fur
        production: 0,
        index: 5
    },
    counting: {
        name: 'counting_house',
        index: 0,
    },
    keep: {
        name: 'keep',
        index: 1,
    },
    sept: {
        name: 'sept',
        production: 0,
        index: 6,
    },
    godswood: {
        name: 'godswood',
        production: 0,
        index: 7,
    },
    feast: {
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
    if($('.levelmodal').length > 0) closeInterstitial();
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
        //if(auto_debug) {console.debug('main loop running',next)};
        next();
    }
    setTimeout(main_loop, 15 * 1000); // 20 seconds
}
function post_loop(fn, delay_ms) {
    if(auto_debug) {console.debug('post-loop handler called, scheduling next...')};
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

function check_speedup(building_id, next) {
    var building = userContext.buildingsData[building_id];
    // XXX this still has a bug, probably when DONE
    if(building.build_remaining > free_speedup_threshold) {
        console.warn(building.symbol, 'not ready for speedup:', building.build_remaining);
    } else {
        console.warn('speeding up', building.symbol);
        doInstantSpeedUp(building.id);
        // speedBuild(speedItem, producedItemId);
        // doInstantSpeedUp(building.id);
        // $('div.itemspeedup a.btngold').click();
    }
    next();
}

// generic helpers
function check_prod(building_id, production_offset, delay_ms) {
    task_running = true;

    // mimic the arguments
    var clone_this = _.partial(check_prod, building_id, production_offset, delay_ms);
    var scheduler = _.partial(schedule_check, clone_this);

    var next_loop = _.partial(post_loop, scheduler, delay_ms);
    var start_item = _.partial(start_item_production, building_id, production_offset, next_loop);
    var finish_item = _.partial(handle_done_item_production, building_id, start_item);
    check_speedup(building_id, finish_item);

}
function schedule_check(checker) {
    if(auto_debug) {console.debug('adding check to queue')};
    to_run.push(checker);
}
// implemented helpers
var gen_market = _.partial(check_prod, building_ids.market.index, building_ids.market.production, 1000 * 60 * 2);
var gen_village = _.partial(check_prod, building_ids.village.index, building_ids.village.production, 1000 * 60 * 2);
var gen_market = _.partial(check_prod, building_ids.market.index, building_ids.market.production, 1000 * 60 * 2);
var gen_sept = _.partial(check_prod, building_ids.sept.index, building_ids.sept.production, 1000 * 60 * 2);
var gen_godswood = _.partial(check_prod, building_ids.godswood.index, building_ids.godswood.production, 1000 * 60 * 2);
var gen_feast = _.partial(check_prod, building_ids.feast.index, building_ids.feast.production, 1000 * 60 * 2);
var gen_glasshouse = _.partial(check_prod, building_ids.glasshouse.index, building_ids.glasshouse.production, 1000 * 60 * 2);
var gen_fishery = _.partial(check_prod, building_ids.fishery.index, building_ids.fishery.production, 1000 * 60 * 2);

// flag to let user play
var user_interaction = false;
// do'nt start new tasks when one is running
// this doesn't have an escape for error conditions & will sit @ true forever
// set to true on task start, false on post_loop
var task_running = false;
var auto_debug = true;
var free_speedup_threshold = 60 * 4 + 50; // 4 minutes & 50 seconds
//var to_run = [counthouse, adventure_party, check_village, check_feast, check_sept, check_glasshouse, check_godswood];
var to_run = [counthouse, adventure_party, gen_village, gen_feast, gen_glasshouse, gen_fishery, gen_market, gen_sept];
main_loop();
