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

    fn.prototype.initAssets = function () { this._process('init'); };

    fn.prototype.preloadAssets = function () { this._process('preload'); };

    fn.prototype.createAssets = function () { this._process('create'); };

    // run a load or init...
    fn.prototype._process = function (action) {
        if ( ! ['init', 'preload', 'create'].includes(action) ) return;

        for (var type in this.config.assets) {
            for (var key in this.config.assets[type]) {
                var asset_data = this.config.assets[type][key];
                if (key && "function" === typeof this[action + '_' + type]) {
                    this[action + '_' + type](key, asset_data);
                }
                else {
                    console.log('Asset handler of type "' + type + '" not found while trying to "' + action + '"');
                }
            }
        }
    };



    // atlas ===============================================
    fn.prototype.init_atlas = function (key, data) {
        // nothing to do yet
    };

    fn.prototype.preload_atlas = function (key, data) {
        this.game.load.atlas(key, data.file, data.json, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
    };

    fn.prototype.create_atlas = function (key, data) {
        // nothing to do yet
    };



    // tilemap ===============================================
    fn.prototype.init_tilemap = function (key, data) {
        var tilemap_key = key + '_tilemap';
        this.game.load.json(tilemap_key, data.json);

        // for (var key in data.tilesets) {
        _.each(_.keys(data.tilesets), (function (key) {
            this.game.load.image(key, data.tilesets[key].file);
        }).bind(this));
        // }

        this.game.load.tilemap(key, data.json, null, Phaser.Tilemap.TILED_JSON);
    };

    fn.prototype.preload_tilemap = function (key, data) {
        var tilemap_key = key + '_tilemap';
        var tilemap_json = this.game.cache.getJSON(tilemap_key);
        for (var tileset of tilemap_json.tilesets) {
            this.game.load.image(tileset.name, 'assets/json/images/' + tileset.image);
        }
    };

    fn.prototype.create_tilemap = function (key, data) {
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



    // image ===============================================
    fn.prototype.init_image = function (key, data) {
        // nothing to do yet
    };

    fn.prototype.preload_image = function (key, data) {
        this.game.load.image(key, data.file);
    };

    fn.prototype.create_image = function (key, data) {
        // nothing to do yet
    };

    
    
    // sound ===============================================
    fn.prototype.init_sound = function (key, data) {
        Object.keys(data).forEach( function(key) {
            this.game.load.audio(key, data[key].file);
        }, this);
    };

    fn.prototype.preload_sound = function (key, data) {
        // nothing to do yet
    };

    fn.prototype.create_sound = function (key, data) {
        // nothing to do yet
    };

    return fn;
})();
