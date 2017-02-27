var App = App || {};

App.LoadAssetsState = (function () {
    "use strict";

    console.log("LoadAssetsState Compiling ...");
    // constructor: Run only once at compile time
    var fn = function (game) {
        console.log("LoadAssetsState.constructor Running...");
        Phaser.State.call(this, game);
    };
    fn.prototype = Object.create(Phaser.State.prototype);
    fn.prototype.constructor = fn;
    fn.assetManager = null;

    // init: Run every time this state is started or restart:
    fn.prototype.init = function (startAssetsManager) {
        console.debug("LoadAssets.init");
        fn.assetManager = startAssetsManager;
        fn.assetManager.initState();
    };

    // preload: Run after init:
    fn.prototype.preload = function () {
        console.debug("LoadAssets.preload");
        fn.assetManager.preloadState();
    };

    // create: Run once all preload "load" calls have been loaded:
    fn.prototype.create = function () {
        console.debug("LoadAssets.create");
        fn.assetManager.createState();
    };

    return fn;
})();

App.AssetManager = (function () {
    "use strict";

    console.log("AssetManager Compiling ...");
    // constructor
    var fn = function (game, args) {
        console.log("AssetManager.constructor Running...");
        this.game = game;
        if (!this.game.state.states.LoadAssets) {
            this.game.state.add('LoadAssets',App.LoadAssetsState);
        }
        args = args || {};
        if (args.assetsConfig) {
            var must = args.assetsConfig;
            if (typeof must === 'string') must = {'Config':must};
            this.mustLoad = {"assets":must};
        }
        else {
            this.mustLoad = {};
        }
        if (args.nextState) {
            this.nextState = args.nextState;
        }
        else if (this.state._pendingState) {
            // If no nextState is explicitly specified, then just use the next pending State
            this.nextState = this.state._pendingState;
            this.state._pendingState = null;
        }
        else {
            console.error("SYNTAX: this.game.assetManager = new App.AssetManager(this.game,{{'assetsConfig':ASSETS_JSON_FILE},'nextState':STATE_KEY})");
        }
        // Initialize one-time variables
        this.assets = {};
        // Launch the state loop passing myself, the Asset Manager object
        this.game.state.start('LoadAssets', undefined, undefined, this);
    };

    // Allow this Object to be created using "new"
    // XXX: Is this explicit constructor method setting required?
    fn.prototype.constructor = fn;

    // init: Run every time this state is started or restart:
    fn.prototype.initState = function () {
        console.debug("AssetManager.initState: Running ...");
        // Initialize variables at the beginning of each LoadAssets round
        this.preLoad = {};
        this.postLoad = {};
    };

    // preload: Call "preload_TYPE" routine on each asset
    fn.prototype.preloadState = function () {
        console.log("AssetManager.preloadState: Running ...");

        for (var type in this.mustLoad) {
            var handler = this["preload_" + type];
            this.postLoad[type] = this.postLoad[type] || {};
            if (handler && "function" === typeof handler) {
                this.preLoad[type] = this.preLoad[type] || {};
                for (var key in this.mustLoad[type]) {
                    if (!this.postLoad[type][key] &&
                        !this.preLoad[type][key]) {
                        var data = this.mustLoad[type][key];
                        this.preLoad[type][key] = this["preload_" + type](key,data);
                    }
                    delete this.mustLoad[type][key];
                }
            }
            else {
                console.log('Asset handler "preload_' + type + '" not defined');
            }
            delete this.mustLoad[type];
        }
    };

    // create: Call "process_TYPE" routine on each asset once preload is complete
    fn.prototype.createState = function () {
        console.log("AssetManager.createState: Running ...");
        for (var type in this.preLoad) {
            this.postLoad[type] = this.postLoad[type] || {};
            var handler = this["process_" + type];
            if (handler && "function" === typeof handler) {
                for (var key in this.preLoad[type]) {
                    if (!this.postLoad[type][key]) {
                        this.postLoad[type][key] = 1;
                        var preload_data = this.preLoad[type][key];
                        this["process_" + type](key,preload_data);
                    }
                    delete this.preLoad[type][key];
                }
            }
            else {
                console.log('WARNING: Asset handler "process_' + type + '" not defined');
            }
            delete this.preLoad[type];
        }

        if (_.keys(this.mustLoad).length) {
            // Found more assets to left to load?
            // Need to run through this process again:
            console.log("Restarting STATE because found more assets not loaded yet",this.mustLoad);
            this.game.state.restart(undefined, undefined, this);
        }
        else {
            // Everything is loaded?
            // Finally we can process to the next state:
            this.game.state.start(this.nextState);
        }
    };

    // Intended to run assetManager.spawn() within init() of the State world to Spawn the given assets.
    // spawn: Call "spawn_TYPE" routine on each asset:
    fn.prototype.spawn = function (config) {
        console.log("AssetManager.spawn: Running ...",config);
        for (var type in config) {
            var handler = fn.prototype["spawn_" + type];
            if (handler && "function" === typeof handler) {
                for (var key in config[type]) {
                    if (this.assets[key]) {
                        var loaded_data = this.assets[key];
                        this["spawn_" + type](key,loaded_data);
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
    //   Now that asset has been loaded, populate any final data into this.assets.KEY
    //   If other assets are required to be loaded, then also populate
    //   this.mustLoad.<NEWTYPE>.<NEWKEY> with more dependency DATA assets
    // spawn_TYPE(KEY,DATA):
    //   Use this.assets.KEY to Spawn and generate all State dependent Objects,
    //   such as sprites or anything that relies on the current game.world.

    // ==== assets ====

    // preload_assets
    fn.prototype.preload_assets = function(key, data) {
        console.log("AssetManager.preload_assets",key,data);
        this.game.load.json(key, data);
        return data;
    };

    // process_assets
    fn.prototype.process_assets = function(key, data) {
        console.log("AssetManager.process_assets",key);
        var assetsRequire = this.game.cache.getJSON(key);
        console.log("Must Load More Assets:",assetsRequire);
        // Merge assetsRequire into assetsMustLoad
        for (var type in assetsRequire) {
            this.mustLoad[type] = this.mustLoad[type] || {};
            for (var k in assetsRequire[type]) {
                this.mustLoad[type][k] = assetsRequire[type][k];
            }
        }
        this.assets[key] = assetsRequire;
    };

    // spawn_assets
    fn.prototype.spawn_assets = function(key, data) {
        // nothing to do
    };

    // ==== spritesheet ====

    // preload_spritesheet
    fn.prototype.preload_spritesheet = function(key, data) {
        console.log("AssetManager.preload_spritesheet",key,data);
        this.game.load.spritesheet(key, data.file, data.frameWidth, data.frameHeight);
        return data;
    };

    // process_spritesheet
    fn.prototype.process_spritesheet = function(key, data) {
        console.log("AssetManager.process_spritesheet",key,data);
    };

    // spawn_spritesheet
    fn.prototype.spawn_spritesheet = function(key, data) {
        // nothing to do
    };

    // ==== atlas ====

    // preload_atlas
    fn.prototype.preload_atlas = function(key, data) {
        console.log("AssetManager.preload_atlas",key,data);
        this.game.load.atlas(key, data.file, data.json, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        return data;
    };

    // process_atlas
    fn.prototype.process_atlas = function(key, data) {
        console.log("AssetManager.process_atlas",key,data);
        // nothing to do yet
    };

    // spawn_atlas
    fn.prototype.spawn_atlas = function(key, data) {
        // nothing to do
    };

    // ==== sound ====

    // preload_sound
    fn.prototype.preload_sound = function(key, data) {
        console.log("AssetManager.preload_sound",key,data.file);
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
        console.log("AssetManager.preload_image",key,data.file);
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
        console.log("AssetManager.preload_json",key,data.file);
        this.game.load.json(key, data);
    };

    // process_json
    fn.prototype.process_json = function (key, data) {
        this.assets[key] = this.game.cache.getJSON(key);
    };

    // spawn_json
    fn.prototype.spawn_json = function(key, data) {
        // nothing to do
    };

    // ==== tilemap ====

    // preload_tilemap
    fn.prototype.preload_tilemap = function (key, data) {
        console.log("AssetManager.preload_tilemap",key,data.json);
        this.game.load.json("tilemap_json_" + key, data.json);
        return data;
    };

    // process_tilemap
    fn.prototype.process_tilemap = function (key, data) {
        console.log("AssetManager.process_tilemap",key,data);
        var tilemap_data = this.game.cache.getJSON("tilemap_json_" + key);
        var tilesets = tilemap_data.tilesets || [];
        for (var tileset in tilesets) {
            var fullpath = fn.prototype.dirname(data.json) + tilesets[tileset].image;
            this.mustLoad.image = this.mustLoad.image || {};
            this.mustLoad.image[tilesets[tileset].name] = {"file":fullpath};
        }
        this.mustLoad.tilemap2 = this.mustLoad.tilemap2 || {};
        this.mustLoad.tilemap2[key] = data;
        this.assets.tilemap_json = this.assets.tilemap_json || {};
        this.assets.tilemap_json[key] = tilemap_data;
    };

    // preload_tilemap2
    fn.prototype.preload_tilemap2 = function (key, data) {
        console.log("AssetManager.preload_tilemap2",key,data.json);
        this.game.load.tilemap(key, data.json, null, Phaser.Tilemap.TILED_JSON);
        return data;
    };

    // process_tilemap2
    fn.prototype.process_tilemap2 = function (key, data) {
        console.log("AssetManager.process_tilemap2",key);
        this.assets[key] = data;
    };

    // spawn_tilemap
    fn.prototype.spawn_tilemap = function(key, data) {
        console.log("AssetManager.spawn_tilemap",key,data);
        var tilemap = {};

        tilemap.map = this.game.add.tilemap(key);

        var tilemap_data = this.assets.tilemap_json[key];
        var tilesets = tilemap_data.tilesets || [];
        for (var tileset in tilesets) {
            tilemap.map.addTilesetImage(tilesets[tileset].name, tilesets[tileset].name);
        }

        tilemap.layers = {};

        for (var layer in tilemap_data.layers) {
            var tiled_layer_name = tilemap_data.layers[layer].name;

            tilemap.layers[tiled_layer_name] = tilemap.map.createLayer(tiled_layer_name);

            if (tilemap_data.layers[layer].properties && tilemap_data.layers[layer].properties.isCollisionLayer) {
                var collision_id_last  = 1;
                for (var id in tilemap_data.layers[layer].data) {
                    if (tilemap_data.layers[layer].data[id] > collision_id_last) {
                        collision_id_last = tilemap_data.layers[layer].data[id];
                    }
                }
                tilemap.map.setCollisionBetween(1, collision_id_last + 1, true, tiled_layer_name);
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
                    this.game.world,
                    eval('App.' + data.objects[object_group][gid].class_name),
                    true
                );
            }
        }
        this.assets.tilemap = this.assets.tilemap || {};
        this.assets.tilemap[key] = tilemap;
    };

    return fn;
})();
