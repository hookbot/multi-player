// namespace
var App = App || {};

App.FlagGreen = (function () {
    "use strict";

    var fn = function (game, x, y, key, frame) {
        key   = key   || 'flag_atlas';
        frame = frame || 'flag_green_left_1';

        this.frame_legend = {
            "flag_green_left": ['flag_green_left_1','flag_green_left_2'],
            "flag_green_right": ['flag_green_right_1','flag_green_right_2']
        };

        App.Flag.call(this, game, x, y, key, frame);
    };

    fn.prototype = Object.create(App.Flag.prototype);
    fn.prototype.constructor = fn;

    return fn;
})();
