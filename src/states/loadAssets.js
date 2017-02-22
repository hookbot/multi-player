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
    fn.prototype.init = function () {
        this.game.assets = this.game.assets || {};
        this.game.assetsMustLoad = this.game.assetsMustLoad || {};
        this.game.assetsPreLoad = this.game.assetsPreLoad || {};
        this.game.assetsLoaded = this.game.assetsLoaded || {};
        this.game.assetsNextState = this.game.assetsNextState || "DefaultNextState";
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
    fn.prototype.spawn = function (configName) {
        console.log("LoadAssetsState.spawn: Running with [" + configName + "] ...");
        if (game.assets[configName]) {
            for (var type in game.assets[configName]) {
                var handler = fn.prototype["spawn_" + type];
                if (handler && "function" === typeof handler) {
                    for (var key in game.assets[configName][type]) {
                        if (game.assets[key]) {
                            var loaded_data = game.assets[key];
                            fn.prototype["spawn_" + type](key,loaded_data);
                        }
                    }
                }
                else {
                    console.log('WARNING: Asset handler "spawn_' + type + '" not defined');
                }
            }
        }
        else {
            console.log("LoadAssetsState.spawn: Implementation Crash! No assets definition named [" + configName + "]");
        }
    };

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
        console.log("loadAssets.preload_assets",key,data)
        game.load.json(key, data);
        return data;
    };

    // process_assets
    fn.prototype.process_assets = function(key, data) {
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
        console.log("loadAssets.preload_spritesheet",key,data)
        this.game.load.spritesheet(key, data.file, data.frameWidth, data.frameHeight);
        return data;
    };

    // process_spritesheet
    fn.prototype.process_spritesheet = function(key, data) {
        console.log("loadAssets.process_spritesheet",key,data)
        //this.game.assets[key] = Object.create(Phaser.Sprite.prototype);
    };

    // spawn_spritesheet
    fn.prototype.spawn_spritesheet = function(key, data) {
        // nothing to do
    };

    // ==== atlas ====

    // preload_atlas
    fn.prototype.preload_atlas = function(key, data) {
        console.log("loadAssets.preload_atlas",key,data)
        this.game.load.atlas(key, data.file, data.json, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        return data;
    };

    // process_atlas
    fn.prototype.process_atlas = function(key, data) {
        console.log("loadAssets.process_atlas",key,data)
        // nothing to do yet
    };

    // spawn_atlas
    fn.prototype.spawn_atlas = function(key, data) {
        // nothing to do
    };

    // ==== sound ====

    // preload_sound
    fn.prototype.preload_sound = function(key, data) {
        console.log("loadAssets.preload_sound",key,data.file)
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
        console.log("loadAssets.preload_image",key,data.file)
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
        console.log("loadAssets.preload_json",key,data.file)
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
        console.log("loadAssets.preload_tilemap",key,data.file)
        _.each(_.keys(data.tilesets), (function (tileset) {
            this.game.load.image(tileset, data.tilesets[tileset].file);
        }).bind(this));
        this.game.load.tilemap(key, data.json, null, Phaser.Tilemap.TILED_JSON);
        return data;
    };

    // process_tilemap
    fn.prototype.process_tilemap = function (key, data) {
        console.log("loadAssets.process_tilemap",key)
        this.game.assets[key] = data;
    };

    // spawn_tilemap
    fn.prototype.spawn_tilemap = function(key, data) {
        console.log("loadAssets.spawn_tilemap",key,data)
        this.tilesets = {};
        this.tilesets[key] = {};

        this.tilesets[key].map = game.add.tilemap(key);

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
                    game.world,
                    eval('App.' + data.objects[object_group][gid].class_name),
                    true
                );
            }).bind(this));
        }).bind(this));
        game.assets[key] = this.tilesets[key];
        delete this.tilesets[key];
        delete this.tilesets;
    };

    return fn;
})();
