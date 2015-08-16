function check_prod(building_index, production_offset, delay_ms) {
    var building = userContext.buildingsData[building_index];
    task_running = true;
    
    // mimic the arguments
    var clone_this = _.partial(check_prod, building_index, production_offset, delay_ms);
    var scheduler = _.partial(schedule_check, clone_this);

    var next_loop = _.partial(post_loop, scheduler, delay_ms);
    var start_item = _.partial(start_item_production, building, production_offset, next_loop);
    handle_done_item_production(building, start_item);
}
function schedule_check(checker) {
    if(auto_debug) {console.debug('adding check to queue', checker)};
    to_run.push(checker);
}
var gen_village = _.partial(check_prod, building_ids.village.index, 3, 1000 * 60 * 2);
var to_run = [gen_village];
main_loop();