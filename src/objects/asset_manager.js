// namespace
var App = App || {};

App.AssetManager = (function () {
    "use strict";

    var fn = function (game) {
        this.game = game;

        this.config = this.config || {};
        this.config.assets = this.config.assets || this.game.cache.getJSON('assetsConfig');

        // init tilesets
        this.tilesets = {};
    };

    fn.prototype.loadAssets = function () { this._process('load'); };

    fn.prototype.initAssets = function () { this._process('init'); };

    // run a load or init...
    fn.prototype._process = function (action) {
        if (!action.match(/^(load|init)$/)) return;

        _.each(_.keys(this.config.assets), (function (key) {
            var asset_data = this.config.assets[key];
            var asset_type = asset_data.type;
            if (asset_type && "function" === typeof this[action + '_' + asset_type]) {
                this[action + '_' + asset_type](key, asset_data);
            }
            else {
                console.log('Asset handler of type "' + asset_type + '" not found for key "' + key + '" while trying to "' + action + '"');
            }
        }).bind(this));
    };

    // atlas
    fn.prototype.load_atlas = function (key, data) {
        this.game.load.atlas(key, data.file, data.json, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
    };

    fn.prototype.init_atlas = function (key, data) {
        // nothing to do yet
    };

    // tilemap
    fn.prototype.load_tilemap = function (key, data) {
        _.each(_.keys(data.tilesets), (function (tileset) {
            this.game.load.image(tileset, data.tilesets[tileset].file);
        }).bind(this));

        this.game.load.tilemap(key, data.json, null, Phaser.Tilemap.TILED_JSON);
    };

    fn.prototype.init_tilemap = function (key, data) {
        this.tilesets[key] = {};

        this.tilesets[key].map = this.game.add.tilemap(key);

        _.each(_.keys(data.tilesets), (function (tileset) {
            this.tilesets[key].map.addTilesetImage(data.tilesets[tileset].tiled_set_name, tileset);
        }).bind(this));

        this.tilesets[key].layers = {};

        _.each(_.keys(data.layers), (function (layer) {
            var tiled_layer_name = data.layers[layer].tiled_layer_name;

            this.tilesets[key].layers[layer] = this.tilesets[key].map.createLayer(tiled_layer_name);

            var collision_id_first = data.layers[layer].collision_id_first;
            var collision_id_last  = data.layers[layer].collision_id_last;
            if (collision_id_first && collision_id_last) {
                this.tilesets[key].map.setCollisionBetween(collision_id_first, collision_id_last, true, tiled_layer_name);
            }
        }).bind(this));

        _.each(_.keys(data.objects), (function (object_group) {
            _.each(_.keys(data.objects[object_group]), (function (gid) {
                this.tilesets[key].map.createFromObjects(
                    object_group,
                    gid,
                    data.objects[object_group][gid].key,
                    data.objects[object_group][gid].frame,
                    true,
                    false,
                    this.game.world,
                    eval('App.' + data.objects[object_group][gid].class_name),
                    true
                );
            }).bind(this));
        }).bind(this));
    };

    fn.prototype.get_tilemap = function (key) { return this.tilesets[key]; };

    // image
    fn.prototype.load_image = function (key, data) {
        this.game.load.image(key, data.file);
    };

    fn.prototype.init_image = function (key, data) {
        // nothing to do yet
    };

    // sound
    fn.prototype.load_sound = function (key, data) {
        this.game.load.audio(key, data.file);
    };

    fn.prototype.init_sound = function (key, data) {
        // nothing to do yet
    };

    return fn;
})();
