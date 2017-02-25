var App = App || {};
App.LoadAssetsState = App.LoadAssetsState || {};

App.LoadAssetsState = (function () {
    "use strict";

    // constructor: Run only once at compile time
    var fn = function (game) {
        Phaser.State.call(this, game);
    };
    fn.prototype = Object.create(Phaser.State.prototype);
    fn.prototype.constructor = fn;

    // init: Run every time this state is started or restart:
    fn.prototype.init = function (args) {
        console.debug("loadAssets.init",args);
        args = args || {};
        if (args.assetsConfig) {
            var must = args.assetsConfig;
            if (typeof must === 'string') must = {'Config':must};
            this.game.assetsMustLoad = {"assets":must};
        }
        if (args.nextState) this.game.assetsNextState = args.nextState;
        if (!this.game.assetsNextState || !this.game.assetsMustLoad) console.error("SYNTAX: state.start('loadAssets',undefined,undefined,{'assetsConfig':ASSETS_JSON_FILE},'nextState':STATE_KEY})");
        this.game.assets = this.game.assets || {};
        this.game.assetsMustLoad = this.game.assetsMustLoad || {};
        this.game.assetsPreLoad = this.game.assetsPreLoad || {};
        this.game.assetsLoaded = this.game.assetsLoaded || {};
        // Intended to run game.assetsSpawn() within init() of the State world to Spawn the assets:
        this.game.assetsSpawn = fn.prototype.spawn;
    };

    // preload: Call "preload_TYPE" routine on each asset
    fn.prototype.preload = function () {
        console.log("LoadAssetsState.preload: Running ...");
        for (var type in this.game.assetsMustLoad) {
            this.game.assetsLoaded[type] = this.game.assetsLoaded[type] || {};
            var handler = this["preload_" + type];
            if (handler && "function" === typeof handler) {
                this.game.assetsPreLoad[type] = this.game.assetsPreLoad[type] || {};
                for (var key in this.game.assetsMustLoad[type]) {
                    if (!this.game.assetsLoaded[type][key] &&
                        !this.game.assetsPreLoad[type][key]) {
                        var data = this.game.assetsMustLoad[type][key];
                        this.game.assetsPreLoad[type][key] = this["preload_" + type](key,data);
                    }
                    delete this.game.assetsMustLoad[type][key];
                }
            }
            else {
                console.log('Asset handler "preload_' + type + '" not defined');
            }
            delete this.game.assetsMustLoad[type];
        }
    };

    // create: Call "process_TYPE" routine on each asset once preload is complete
    fn.prototype.create = function () {
        console.log("LoadAssetsState.create: Running ...");
        for (var type in this.game.assetsPreLoad) {
            this.game.assetsLoaded[type] = this.game.assetsLoaded[type] || {};
            var handler = this["process_" + type];
            if (handler && "function" === typeof handler) {
                for (var key in this.game.assetsPreLoad[type]) {
                    if (!this.game.assetsLoaded[type][key]) {
                        this.game.assetsLoaded[type][key] = 1;
                        var preload_data = this.game.assetsPreLoad[type][key];
                        this["process_" + type](key,preload_data);
                    }
                    delete this.game.assetsPreLoad[type][key];
                }
            }
            else {
                console.log('WARNING: Asset handler "process_' + type + '" not defined');
            }
            delete this.game.assetsPreLoad[type];
        }

        if (_.keys(this.game.assetsMustLoad).length) {
            // Found more assets to left to load?
            // Need to run through this process again:
            console.log("Restarting STATE because found more assets not loaded yet",this.game.assetsMustLoad);
            this.game.state.restart();
        }
        else {
            // Everything is loaded?
            // Finally we can process to the next state:
            this.game.state.start(this.game.assetsNextState);
        }
    };

    // spawn: Call "spawn_TYPE" routine on each asset once State is launched
    fn.prototype.spawn = function (config) {
        console.log("LoadAssetsState.spawn: Running ...");
        for (var type in config) {
            var handler = fn.prototype["spawn_" + type];
            if (handler && "function" === typeof handler) {
                for (var key in config[type]) {
                    if (game.assets[key]) {
                        var loaded_data = game.assets[key];
                        handler(key,loaded_data);
                    }
                }
            }
            else {
                console.log('WARNING: Asset handler "spawn_' + type + '" not defined');
            }
        }
    };

    // ==== HELPER FUNCTIONS ====
    fn.prototype.dirname = function (filename) {
        return filename.match( /.*\// );
        //return filename.replace(/^(.*\/)[^\/]*/,'$1');
    };

    fn.prototype.basename = function (filename) {
        return filename.replace( /.*\//, "" );
    };

    // ==== ASSET TYPE DEFINITIONS ====
    // preload_TYPE(KEY,DATA):
    //   Define how to preload TYPE asset into KEY from DATA
    // process_TYPE(KEY,DATA):
    //   Now that asset has been loaded, populate any final data into game.assets.KEY
    //   If other assets are required to be loaded, then also populate
    //   this.game.assetsMustLoad.<NEWTYPE>.<NEWKEY> with more dependency DATA assets
    // spawn_TYPE(KEY,DATA):
    //   Use game.assets.KEY to Spawn and generate all State dependent Objects,
    //   such as sprites or anything that relies on the current game.world.

    // ==== assets ====

    // preload_assets
    fn.prototype.preload_assets = function(key, data) {
        console.log("loadAssets.preload_assets",key,data);
        this.game.load.json(key, data);
        return data;
    };

    // process_assets
    fn.prototype.process_assets = function(key, data) {
        console.log("loadAssets.process_assets",key);
        var assetsRequire = this.game.cache.getJSON(key);
        console.log("Must Load More Assets:",assetsRequire);
        // Merge assetsRequire into assetsMustLoad
        for (var type in assetsRequire) {
            this.game.assetsMustLoad[type] = this.game.assetsMustLoad[type] || {};
            for (var k in assetsRequire[type]) {
                this.game.assetsMustLoad[type][k] = assetsRequire[type][k];
            }
        }
        this.game.assets[key] = assetsRequire;
    };

    // spawn_assets
    fn.prototype.spawn_assets = function(key, data) {
        // nothing to do
    };

    // ==== spritesheet ====

    // preload_spritesheet
    fn.prototype.preload_spritesheet = function(key, data) {
        console.log("loadAssets.preload_spritesheet",key,data);
        this.game.load.spritesheet(key, data.file, data.frameWidth, data.frameHeight);
        return data;
    };

    // process_spritesheet
    fn.prototype.process_spritesheet = function(key, data) {
        console.log("loadAssets.process_spritesheet",key,data);
        //this.game.assets[key] = Object.create(Phaser.Sprite.prototype);
    };

    // spawn_spritesheet
    fn.prototype.spawn_spritesheet = function(key, data) {
        // nothing to do
    };

    // ==== atlas ====

    // preload_atlas
    fn.prototype.preload_atlas = function(key, data) {
        console.log("loadAssets.preload_atlas",key,data);
        this.game.load.atlas(key, data.file, data.json, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        return data;
    };

    // process_atlas
    fn.prototype.process_atlas = function(key, data) {
        console.log("loadAssets.process_atlas",key,data);
        // nothing to do yet
    };

    // spawn_atlas
    fn.prototype.spawn_atlas = function(key, data) {
        // nothing to do
    };

    // ==== sound ====

    // preload_sound
    fn.prototype.preload_sound = function(key, data) {
        console.log("loadAssets.preload_sound",key,data.file);
        this.game.load.audio(key, data.file);
        return data;
    };

    // process_sound
    fn.prototype.process_sound = function(key, data) {
        // nothing to do yet
    };

    // spawn_sound
    fn.prototype.spawn_sound = function(key, data) {
        // nothing to do
    };

    // ==== image ====

    // preload_image
    fn.prototype.preload_image = function (key, data) {
        console.log("loadAssets.preload_image",key,data.file);
        this.game.load.image(key, data.file);
    };

    // process_image
    fn.prototype.process_image = function (key, data) {
        // nothing to do yet
    };

    // spawn_image
    fn.prototype.spawn_image = function(key, data) {
        // nothing to do
    };

    // ==== json ====

    // preload_json
    fn.prototype.preload_json = function (key, data) {
        console.log("loadAssets.preload_json",key,data.file);
        this.game.load.json(key, data);
    };

    // process_json
    fn.prototype.process_json = function (key, data) {
        this.game.assets[key] = this.game.cache.getJSON(key);
    };

    // spawn_json
    fn.prototype.spawn_json = function(key, data) {
        // nothing to do
    };

    // ==== tilemap ====

    // preload_tilemap
    fn.prototype.preload_tilemap = function (key, data) {
        console.log("loadAssets.preload_tilemap",key,data.json);
        this.game.load.json("tilemap_json_" + key, data.json);
        return data;
    };

    // process_tilemap
    fn.prototype.process_tilemap = function (key, data) {
        console.log("loadAssets.process_tilemap",key,data);
        var tilemap_data = this.game.cache.getJSON("tilemap_json_" + key);
        var tilesets = tilemap_data.tilesets || [];
        for (var tileset in tilesets) {
            var fullpath = fn.prototype.dirname(data.json) + tilesets[tileset].image;
            this.game.assetsMustLoad.image = this.game.assetsMustLoad.image || {};
            this.game.assetsMustLoad.image[tilesets[tileset].name] = {"file":fullpath};
        }
        this.game.assetsMustLoad.tilemap2 = this.game.assetsMustLoad.tilemap2 || {};
        this.game.assetsMustLoad.tilemap2[key] = data;
        this.game.assets.tilemap_json = this.game.assets.tilemap || {};
        this.game.assets.tilemap_json[key] = tilemap_data;
    };

    // preload_tilemap2
    fn.prototype.preload_tilemap2 = function (key, data) {
        console.log("loadAssets.preload_tilemap2",key,data.json);
        this.game.load.tilemap(key, data.json, null, Phaser.Tilemap.TILED_JSON);
        return data;
    };

    // process_tilemap2
    fn.prototype.process_tilemap2 = function (key, data) {
        console.log("loadAssets.process_tilemap2",key);
        this.game.assets[key] = data;
    };

    // spawn_tilemap
    fn.prototype.spawn_tilemap = function(key, data) {
        console.log("loadAssets.spawn_tilemap",key,data);
        var tilemap = {};

        tilemap.map = game.add.tilemap(key);

        var tilemap_data = game.assets.tilemap_json[key];
        var tilesets = tilemap_data.tilesets || [];
        for (var tileset in tilesets) {
            tilemap.map.addTilesetImage(tilesets[tileset].name, tilesets[tileset].name);
        }

        tilemap.layers = {};

        for (var layer in data.layers) {
            var tiled_layer_name = data.layers[layer].tiled_layer_name;

            tilemap.layers[layer] = tilemap.map.createLayer(tiled_layer_name);

            var collision_id_first = data.layers[layer].collision_id_first;
            var collision_id_last  = data.layers[layer].collision_id_last;
            if (collision_id_first && collision_id_last) {
                tilemap.map.setCollisionBetween(collision_id_first, collision_id_last, true, tiled_layer_name);
            }
        }

        for (var object_group in data.objects) {
            for (var gid in data.objects[object_group]) {
                tilemap.map.createFromObjects(
                    object_group,
                    gid,
                    data.objects[object_group][gid].key,
                    data.objects[object_group][gid].frame,
                    true,
                    false,
                    game.world,
                    eval('App.' + data.objects[object_group][gid].class_name),
                    true
                );
            }
        }
        game.assets[key] = tilemap;
    };

    return fn;
})();
