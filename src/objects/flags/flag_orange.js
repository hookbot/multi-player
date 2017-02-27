// namespace
var App = App || {};

App.FlagOrange = (function () {
    "use strict";

    var fn = function (game, x, y, key, frame) {
        key   = key   || 'flag_atlas';
        frame = frame || 'flag_orange_left_1';

        this.frame_legend = {
            "flag_orange_left": ['flag_orange_left_1','flag_orange_left_2'],
            "flag_orange_right": ['flag_orange_right_1','flag_orange_right_2']
        };

        App.Flag.call(this, game, x, y, key, frame);
    };

    fn.prototype = Object.create(App.Flag.prototype);
    fn.prototype.constructor = fn;

    return fn;
})();
