function check_prod(building_id, production_offset, delay_ms) {
    //var building = userContext.buildingsData[building_id];
    task_running = true;
    
    // mimic the arguments
    var clone_this = _.partial(check_prod, building_id, production_offset, delay_ms);
    var scheduler = _.partial(schedule_check, clone_this);

    var next_loop = _.partial(post_loop, scheduler, delay_ms);
    var start_item = _.partial(start_item_production, building_id, production_offset, next_loop);
    handle_done_item_production(building_id, start_item);
}
function schedule_check(checker) {
    if(auto_debug) {console.debug('adding check to queue', checker)};
    to_run.push(checker);
}
var gen_village = _.partial(check_prod, building_ids.village.index, 3, 1000 * 60 * 2);
var to_run = [gen_village];
main_loop();


var check_village = _.partial(check_prod, building_ids.village.index, 3, 1000 * 60 * 2);


var free_speedup_threshold = 60 * 4 + 50; // 4 minutes & 50 seconds
function check_speedup(building_id, delay_ms) {
    var building = userContext.buildingsData[building_id];
    if(building.build_remaining > free_speedup_threshold) {
        console.warn('not ready');
    } else {
        console.warn('speedable');
        // speedBuild(speedItem, producedItemId);
        doInstantSpeedUp(building.id);
        // $('div.itemspeedup a.btngold').click();
    }
}
check_speedup(3, 0);


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


 //*/