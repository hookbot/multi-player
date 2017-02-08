// namespace
var App = App || {};

App.FlagGreenLeft = (function () {
    "use strict";

    var fn = function (game, x, y) {
        var key   = 'flag_atlas';
        var frame = 'flag_green_left_1';

        this.frames = ['flag_green_left_1','flag_green_left_2'];

        App.Flag.call(this, game, x, y, key, frame);
    };

    fn.prototype = Object.create(App.Flag.prototype);
    fn.prototype.constructor = fn;

    return fn;
})();
